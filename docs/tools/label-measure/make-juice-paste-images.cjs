// Картинки для двух кейсов Green Power: соки и ореховая паста.
// Запуск: node docs/tools/label-measure/make-juice-paste-images.cjs
//
// Что важно знать про исходники:
// - Плоские макеты (Face/Back у соков, 100х40 у пасты) — настоящие, текст верный.
//   На них и строятся галереи.
// - Файлы «3D» и «magnific_*» прогнаны через ИИ-апскейлер. У пасты знак поехал
//   на всех пяти («AS BOCEH AS ALIVE», «EST 1809»), на групповом кадре соков
//   выдуманы подзаголовки и объемы. В сборку они не идут.
// - Из 17 одиночных рендеров соков берем 13, где знак не пострадал. Апельсин
//   и Красавчик («EST. 2034»), Мятный арбуз («EST. 2026») и Сельдерей
//   («ЗЭБОЛТНИ МЕНЯ») отброшены.
// - В именах исходников три опечатки: «Яблочеый-Face», «Яблочный-Back»
//   (у одного вкуса два написания) и «Нотки осениFace» без дефиса.

const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const SRC = 'F:/dev/design.kovtun.studio/cases/unpublished/Green Power/';
const JUICE_SRC = SRC + '\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u0441\u043e\u043a\u0438/';
const PASTE_SRC = SRC + '\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0430 \u043f\u0430\u0441\u0442\u044b/';
const ROOT = 'F:/dev/design.kovtun.studio/public/assets/cases/';

// Размеры и качество. Шаблон подставляет в плитку МИНИАТЮРУ (item.thumb),
// srcset у него нет, поэтому миниатюру надо делать под реальную ширину плитки.
// Замер на 1440: плитка в три-четыре колонки — 430 px, плитка во всю ширину —
// 1329 px. На 640 px миниатюры вторая растягивалась в 2,08 раза, отсюда мыло.
// withoutEnlargement не даст вылезти за исходник: у разверток пасты он 885 px,
// у лиц соков 495 px — это потолок, выше взять неоткуда.
const Q_FULL = 92;   // full открывается в лайтбоксе, вес там не критичен
const Q_THUMB = 86;
const FULL_W = 2400;
const FULL_H = 2000;  // потолок по высоте: лайтбокс все равно вписывает по экрану
const THUMB_GRID = 900;   // плитки в три-четыре колонки, с запасом на retina
const THUMB_WIDE = 1800;  // плитки во всю ширину секции

// Порядок соков — по цвету этикетки: желтые, оранжевые, красные, пурпурные,
// зеленые. Так линейка на странице читается градиентом, как на полке.
// [файл-основа, slug, подпись]
const JUICES = [
  ['\u0410\u043d\u0430\u043d\u0430\u0441', '01-ananas', '\u0410\u043d\u0430\u043d\u0430\u0441'],
  ['\u0418\u043c\u0443\u043d\u0438\u0442\u0438 \u043f\u0430\u043a', '02-imuniti-pak', '\u0418\u043c\u0443\u043d\u0438\u0442\u0438 \u043f\u0430\u043a'],
  ['\u0410\u043f\u0435\u043b\u044c\u0441\u0438\u043d', '03-apelsinovyj', '\u0410\u043f\u0435\u043b\u044c\u0441\u0438\u043d\u043e\u0432\u044b\u0439'],
  ['\u0414\u0435\u0434\u0443\u0448\u043a\u0438\u043d\u0430 \u0442\u044b\u043a\u0432\u0430', '04-dedushkina-tykva', '\u0414\u0435\u0434\u0443\u0448\u043a\u0438\u043d\u0430 \u0442\u044b\u043a\u0432\u0430'],
  ['\u041c\u043e\u0440\u043a\u043e\u0432\u044c', '05-morkov', '\u041c\u043e\u0440\u043a\u043e\u0432\u044c'],
  ['\u041d\u043e\u0432\u043e\u0433\u043e\u0434\u043d\u044f\u044f \u0441\u043a\u0430\u0437\u043a\u0430 v2', '06-novogodnyaya-skazka', '\u041d\u043e\u0432\u043e\u0433\u043e\u0434\u043d\u044f\u044f \u0441\u043a\u0430\u0437\u043a\u0430'],
  ['\u041e\u0433\u043e\u043d\u0435\u043a', '07-ogonek', '\u041e\u0433\u043e\u043d\u0435\u043a'],
  ['\u041d\u043e\u0442\u043a\u0438 \u043e\u0441\u0435\u043d\u0438', '08-notki-oseni', '\u041d\u043e\u0442\u043a\u0438 \u043e\u0441\u0435\u043d\u0438'],
  ['\u041b\u0435\u0442\u043d\u0438\u0439 \u0431\u0440\u0438\u0437', '09-letnij-briz', '\u041b\u0435\u0442\u043d\u0438\u0439 \u0431\u0440\u0438\u0437'],
  ['\u0422\u0440\u043e\u043f\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0440\u0430\u0439', '10-tropicheskij-raj', '\u0422\u0440\u043e\u043f\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0440\u0430\u0439'],
  ['\u0422\u043e\u043c\u0430\u0442\u043d\u044b\u0439', '11-tomatnyj', '\u0422\u043e\u0442 \u0441\u0430\u043c\u044b\u0439 \u0442\u043e\u043c\u0430\u0442\u043d\u044b\u0439'],
  ['\u041c\u044f\u0442\u043d\u044b\u0439 \u0430\u0440\u0431\u0443\u0437', '12-myatnyj-arbuz', '\u041c\u044f\u0442\u043d\u044b\u0439 \u0430\u0440\u0431\u0443\u0437'],
  ['\u0413\u0440\u0430\u043d\u0430\u0442\u043e\u0432\u044b\u0439 \u0440\u0430\u0439', '13-granatovyj-raj', '\u0413\u0440\u0430\u043d\u0430\u0442\u043e\u0432\u044b\u0439 \u0440\u0430\u0439'],
  ['\u0421\u0432\u0435\u043a\u043b\u0430', '14-svekla', '\u0421\u0432\u0435\u043a\u043b\u0430'],
  ['\u041d\u0430 \u044d\u0432\u0435\u0440\u0435\u0441\u0442', '15-na-everest', '\u041d\u0430 \u044d\u0432\u0435\u0440\u0435\u0441\u0442'],
  ['\u041e\u0440\u0433\u0430\u043d\u0438\u043a \u0434\u0435\u0442\u043e\u043a\u0441', '16-organik-detoks', '\u041e\u0440\u0433\u0430\u043d\u0438\u043a \u0434\u0435\u0442\u043e\u043a\u0441'],
  ['\u042f\u0431\u043b\u043e\u0447\u0435\u044b\u0439', '17-yabloko', '\u042f\u0431\u043b\u043e\u043a\u043e'],
  ['\u041a\u0440\u0430\u0441\u0430\u0432\u0447\u0438\u043a', '18-krasavchik', '\u041a\u0440\u0430\u0441\u0430\u0432\u0447\u0438\u043a'],
  ['\u0421\u0435\u043b\u044c\u0434\u0435\u0440\u0435\u0439', '19-selderej', '\u0421\u0435\u043b\u044c\u0434\u0435\u0440\u0435\u0439'],
];

// Оборот: у яблочного сока лицо и оборот названы по-разному, у ноток осени
// в имени лица пропал дефис. Здесь исключения из общего правила.
const BACK_OVERRIDE = {
  '17-yabloko': '\u0421\u043e\u043a-42\u044576-\u042f\u0431\u043b\u043e\u0447\u043d\u044b\u0439-Back.png',
};
const FACE_OVERRIDE = {
  '08-notki-oseni': '\u0421\u043e\u043a-42\u044576-\u041d\u043e\u0442\u043a\u0438 \u043e\u0441\u0435\u043d\u0438Face.png',
};

// Рендеры без поехавшего знака.
const CLEAN_BOTTLES = [
  '01-ananas', '02-imuniti-pak', '04-dedushkina-tykva', '05-morkov',
  '06-novogodnyaya-skazka', '08-notki-oseni', '09-letnij-briz',
  '10-tropicheskij-raj', '11-tomatnyj', '13-granatovyj-raj',
  '15-na-everest', '16-organik-detoks', '17-yabloko',
];

// Пары «лицо и оборот» — четыре вкуса на весь разброс палитры.
const PAIRS = ['01-ananas', '11-tomatnyj', '15-na-everest', '19-selderej'];

const PASTES = [
  ['\u0410\u0440\u0430\u0445\u0438\u0441\u043e\u0432\u0430\u044f', '01-arahisovaya', '\u0410\u0440\u0430\u0445\u0438\u0441\u043e\u0432\u0430\u044f'],
  ['\u041a\u0435\u0448\u044c\u044e', '02-keshyu', '\u041a\u0435\u0448\u044c\u044e'],
  ['\u041c\u0438\u043d\u0434\u0430\u043b\u044c\u043d\u0430\u044f', '03-mindalnaya', '\u041c\u0438\u043d\u0434\u0430\u043b\u044c\u043d\u0430\u044f'],
  ['\u041f\u043e\u0434\u0441\u043e\u043b\u043d\u0435\u0447\u043d\u0430\u044f', '04-podsolnechnaya', '\u041f\u043e\u0434\u0441\u043e\u043b\u043d\u0435\u0447\u043d\u0430\u044f'],
  ['\u0424\u0438\u0441\u0442\u0430\u0448\u043a\u043e\u0432\u0430\u044f', '05-fistashkovaya', '\u0424\u0438\u0441\u0442\u0430\u0448\u043a\u043e\u0432\u0430\u044f'],
];

// ── общее ────────────────────────────────────────────────────────────────

function dirs(slug) {
  const root = ROOT + slug + '/';
  fs.mkdirSync(root + 'full/', { recursive: true });
  fs.mkdirSync(root + 'thumb/', { recursive: true });
  return { root, full: root + 'full/', thumb: root + 'thumb/' };
}

/** wide: плитка занимает всю ширину секции, миниатюру делаем крупнее. */
async function emit(buf, d, name, opts = {}) {
  const thumbW = opts.wide ? THUMB_WIDE : THUMB_GRID;
  const a = await sharp(buf).resize({ width: opts.fullW || FULL_W, height: FULL_H, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: Q_FULL }).toFile(d.full + name + '.webp');
  const t = await sharp(buf).resize({ width: thumbW, withoutEnlargement: true })
    .webp({ quality: Q_THUMB }).toFile(d.thumb + name + '-thumbnail.webp');
  const kb = (fs.statSync(d.full + name + '.webp').size / 1024).toFixed(0);
  const tkb = (fs.statSync(d.thumb + name + '-thumbnail.webp').size / 1024).toFixed(0);
  console.log('  ' + name.padEnd(44) + a.width + 'x' + a.height + ' ' + kb + ' KB' +
    '   мини ' + t.width + ' px ' + tkb + ' KB');
  return a;
}

function need(file) {
  if (!fs.existsSync(file)) throw new Error('нет исходника: ' + file);
  return file;
}

/** Габарит непрозрачного объекта на белом фоне. */
async function bbox(file) {
  const { data, info } = await sharp(file).flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * c;
      if (!(data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235)) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  return { x0, x1, y0, y1, w, h };
}

/** Кроп вокруг объекта, подогнанный под пропорцию ratio (ш/в), с полями. */
async function cropTo(file, ratio, pad) {
  const b = await bbox(file);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  let bw = (b.x1 - b.x0) * (1 + pad);
  let bh = (b.y1 - b.y0) * (1 + pad);
  if (bw / bh < ratio) bw = bh * ratio; else bh = bw / ratio;
  let left = Math.round(cx - bw / 2);
  let top = Math.round(cy - bh / 2);
  let width = Math.round(bw);
  let height = Math.round(bh);
  // Не вылезаем за исходник.
  if (left < 0) { width += left; left = 0; }
  if (top < 0) { height += top; top = 0; }
  if (left + width > b.w) width = b.w - left;
  if (top + height > b.h) height = b.h - top;
  return sharp(file).flatten({ background: '#ffffff' })
    .extract({ left, top, width, height }).png().toBuffer();
}

/**
 * Горизонтальная фотозона в центре этикетки пасты.
 * Границы берем по верхней кромке: там левый и правый фланги еще белые.
 * Слева отступаем: круглая печать «Произведено в Приморье» стоит на стыке
 * и заезжает на фото, без отступа она обрезается серпом.
 */
const PASTE_FACE_INSET = 30;

async function pasteFace(file) {
  const { data, info } = await sharp(file).flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const row = Math.round(h * 0.04);
  let x0 = -1, x1 = -1;
  for (let x = 0; x < w; x++) {
    const i = (row * w + x) * c;
    if (!(data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240)) {
      if (x0 < 0) x0 = x;
      x1 = x;
    }
  }
  const left = x0 + PASTE_FACE_INSET;
  return sharp(file).flatten({ background: '#ffffff' })
    .extract({ left, top: 0, width: x1 - left + 1, height: h }).png().toBuffer();
}

/**
 * Кадр под заданную пропорцию: окно нужного отношения, центрированное
 * по содержимому. Обложку шаблон жестко режет в 16:9 с object-fit: cover,
 * поэтому кадрируем сами, чтобы не срезало крышки и донья.
 */
async function coverFrame(file, ratio) {
  const b = await bbox(file);
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  let width = b.w;
  let height = Math.round(width / ratio);
  if (height > b.h) { height = b.h; width = Math.round(height * ratio); }
  let left = Math.round(cx - width / 2);
  let top = Math.round(cy - height / 2);
  left = Math.max(0, Math.min(left, b.w - width));
  top = Math.max(0, Math.min(top, b.h - height));
  return sharp(file).flatten({ background: '#ffffff' })
    .extract({ left, top, width, height }).png().toBuffer();
}

/**
 * Габарит самого высокого объекта в кадре.
 * У рендеров пасты в кадре не только банка: слева и справа лежат плоские
 * фланги этикетки. Банку отличаем по вертикальному размаху — она идет
 * от крышки до дна, фланги занимают только полосу по центру высоты.
 */
async function tallestBox(file, share) {
  const { data, info } = await sharp(file).flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  const ink = (x, y) => {
    const i = (y * w + x) * c;
    return !(data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235);
  };
  const span = new Array(w).fill(0);
  const top = new Array(w).fill(h);
  const bot = new Array(w).fill(0);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y += 2) {
      if (ink(x, y)) { if (y < top[x]) top[x] = y; bot[x] = y; }
    }
    span[x] = bot[x] > top[x] ? bot[x] - top[x] : 0;
  }
  const max = Math.max(...span);
  const thr = max * share;
  // Самый длинный непрерывный участок колонок выше порога.
  let bx0 = 0, bx1 = 0, cur = -1;
  for (let x = 0; x <= w; x++) {
    if (x < w && span[x] >= thr) { if (cur < 0) cur = x; }
    else if (cur >= 0) {
      if (x - cur > bx1 - bx0) { bx0 = cur; bx1 = x - 1; }
      cur = -1;
    }
  }
  let y0 = h, y1 = 0;
  for (let x = bx0; x <= bx1; x++) { if (top[x] < y0) y0 = top[x]; if (bot[x] > y1) y1 = bot[x]; }
  return { x0: bx0, x1: bx1, y0, y1 };
}

/**
 * Ряд объектов на белом: вырезаем каждый по габариту, приводим к общей высоте,
 * ставим на одну линию низа и слегка нахлестываем друг на друга.
 */
async function lineup(items, boxH, overlap, pad) {
  const cut = [];
  for (const { file, box } of items) {
    const b = box || await bbox(file);
    const buf = await sharp(file).flatten({ background: '#ffffff' })
      .extract({ left: b.x0, top: b.y0, width: b.x1 - b.x0 + 1, height: b.y1 - b.y0 + 1 })
      .resize({ height: boxH }).png().toBuffer();
    cut.push(await sharp(buf).metadata().then((m) => ({ buf, w: m.width, h: m.height })));
  }
  const step = Math.round(cut[0].w * (1 - overlap));
  const width = step * (cut.length - 1) + cut[cut.length - 1].w + pad * 2;
  const height = boxH + pad * 2;
  const comp = cut.map((t, i) => ({ input: t.buf, left: pad + i * step, top: pad + (boxH - t.h) }));
  return sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite(comp).png().toBuffer();
}

/** Сетка картинок на белом холсте заданного размера. */
async function grid(buffers, canvasW, canvasH, cols, gap) {
  const rows = Math.ceil(buffers.length / cols);
  const first = await sharp(buffers[0]).metadata();
  // Плитку ограничиваем и по ширине холста, и по высоте: у широких макетов
  // пасты иначе сетка вылезает за нижний край.
  const byW = (canvasW * 0.96 - (cols - 1) * gap) / cols;
  const byH = (canvasH * 0.92 - (rows - 1) * gap) / rows * first.width / first.height;
  const tileW = Math.floor(Math.min(byW, byH));
  const tileH = Math.round(tileW * first.height / first.width);
  const gridW = cols * tileW + (cols - 1) * gap;
  const gridH = rows * tileH + (rows - 1) * gap;
  const offX = Math.round((canvasW - gridW) / 2);
  const offY = Math.round((canvasH - gridH) / 2);
  const comp = [];
  for (let i = 0; i < buffers.length; i++) {
    const buf = await sharp(buffers[i]).resize(tileW, tileH, { fit: 'contain', background: '#ffffff' })
      .png().toBuffer();
    const row = Math.floor(i / cols);
    // Неполный последний ряд центрируем, иначе на обложке остается дыра сбоку.
    const inRow = Math.min(cols, buffers.length - row * cols);
    const rowOff = Math.round(((cols - inRow) * (tileW + gap)) / 2);
    comp.push({
      input: buf,
      left: offX + rowOff + (i % cols) * (tileW + gap),
      top: offY + row * (tileH + gap),
    });
  }
  return sharp({ create: { width: canvasW, height: canvasH, channels: 3, background: '#ffffff' } })
    .composite(comp).png().toBuffer();
}

// ── соки ─────────────────────────────────────────────────────────────────

async function juice() {
  console.log('== соки ==');
  const d = dirs('labels-green-power-juice');
  const P = (n) => JUICE_SRC + '\u0421\u043e\u043a-42\u044576-' + n;

  const faces = {};
  for (const [base, slug, label] of JUICES) {
    const file = FACE_OVERRIDE[slug] ? JUICE_SRC + FACE_OVERRIDE[slug] : P(base + '-Face.png');
    faces[slug] = need(file);
    await emit(fs.readFileSync(faces[slug]), d, 'green-power-juice-face-' + slug);
  }

  for (const slug of PAIRS) {
    const [base] = JUICES.find((j) => j[1] === slug);
    const backFile = BACK_OVERRIDE[slug] ? JUICE_SRC + BACK_OVERRIDE[slug] : P(base + '-Back.png');
    need(backFile);
    const f = await sharp(faces[slug]).png().toBuffer();
    const b = await sharp(backFile).png().toBuffer();
    const m = await sharp(f).metadata();
    const GAP = 48;
    const canvas = await sharp({
      create: { width: m.width * 2 + GAP, height: m.height, channels: 3, background: '#ffffff' },
    }).composite([{ input: f, left: 0, top: 0 }, { input: b, left: m.width + GAP, top: 0 }])
      .png().toBuffer();
    await emit(canvas, d, 'green-power-juice-pair-' + slug);
  }

  for (const slug of CLEAN_BOTTLES) {
    const [base] = JUICES.find((j) => j[1] === slug);
    const file = need(P(base + '-3D.png'));
    const buf = await cropTo(file, 2 / 3, 0.14);
    await emit(buf, d, 'green-power-juice-bottle-' + slug);
  }

  // Композиция и обложка — готовые кадры из папки исходников, выбраны
  // Николаем 26.08.2026. Оба прогнаны через ИИ-апскейлер: знак и мелкий текст
  // на них поехали, объемы показаны 320 и 350 мл вместо настоящих 330.
  await emit(await sharp(need(JUICE_SRC + 'magnific_1_s7ShE7tl8e.png')).png().toBuffer(),
    d, 'green-power-juice-lineup', { wide: true });

  const cover = await coverFrame(need(JUICE_SRC + 'magnific_ksxXpiL16B.png'), 16 / 9);
  await emit(cover, d, 'green-power-juice-cover');
  fs.copyFileSync(d.full + 'green-power-juice-cover.webp', d.root + 'green-power-juice-cover.webp');
  console.log('  обложка скопирована в корень');
}

// ── паста ────────────────────────────────────────────────────────────────

async function paste() {
  console.log('== паста ==');
  const d = dirs('labels-green-power-paste');
  const P = (n) => PASTE_SRC + 'GP-\u041f\u0430\u0441\u0442\u0430-' + n + '-100\u044540.png';

  // Отдельного кропа «лица» здесь нет: название и круглая печать нарочно
  // выходят за фотозону на белые фланги, и любое окно режет их пополам.
  // Цельный, читаемый кусок у этой этикетки один — вся развертка.
  const flats = [];
  for (const [base, slug] of PASTES) {
    const file = need(P(base));
    flats.push(fs.readFileSync(file));
    await emit(fs.readFileSync(file), d, 'green-power-paste-flat-' + slug, { wide: true });
  }

  // Банки целиком, с «ушками» — плоскими флангами этикетки по бокам.
  // Рендеры отдаем как есть, без кропа: так просил Николай 26.08.2026.
  const R = (n) => PASTE_SRC + 'GP-Паста-' + n + '-100х40 ';
  for (const [base, slug] of PASTES) {
    const file = fs.existsSync(R(base) + '3d.png') ? R(base) + '3d.png' : R(base) + '3D.png';
    need(file);
    await emit(fs.readFileSync(file), d, 'green-power-paste-jar-' + slug);
  }

  // Композиция и обложка — готовые кадры из папки исходников. Оба прогнаны
  // через ИИ-апскейлер: знак и боковые блоки поехали, масса показана
  // 50, 130, 155 и 190 гр вместо настоящих 150.
  await emit(await sharp(need(PASTE_SRC + 'magnific_img1-5_fHunhWMCDY.png')).png().toBuffer(),
    d, 'green-power-paste-lineup', { wide: true });

  const cover = await coverFrame(need(PASTE_SRC + 'magnific_img1-5_u5Hcf0vQLD.jpeg'), 16 / 9);
  await emit(cover, d, 'green-power-paste-cover');
  fs.copyFileSync(d.full + 'green-power-paste-cover.webp', d.root + 'green-power-paste-cover.webp');
  console.log('  обложка скопирована в корень');
}

(async () => {
  await juice();
  await paste();
  console.log('готово');
})();
