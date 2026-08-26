// Обложка направления «Упаковка» в мега-меню «Услуги».
// Запуск: node docs/tools/label-measure/make-menu-cover.cjs <исходник>
//
// Плитка меню — .mega-card__frame: высота 150 px, картинка object-fit: cover
// и заявлена как 480x270, то есть кадр жестко режется в 16:9. Кадрируем сами
// по содержимому, чтобы не срезало крышки и донья канистр.
// Исходник с прозрачным фоном, поэтому кладем на белое: остальные обложки
// упаковки на сайте тоже белые — на сером фоне рамки прозрачный PNG выбивался бы.

const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const SRC = process.argv[2] || 'F:/dev/design.kovtun.studio/123 2.png';
const OUT_DIR = 'F:/dev/design.kovtun.studio/public/assets/menu/';
const OUT = OUT_DIR + 'packaging-micking.webp';

const W = 960, H = 540;   // 16:9 с запасом под retina: плитка ~225 px шириной
const Q = 88;

// Рамка плитки — от 199x150 на узком окне до 262x150 на широком, то есть
// от 1,33 до 1,75. Картинка 16:9 при object-fit: cover на узком окне теряет
// четверть ширины, и крайние канистры обрезаются по буквам. Поэтому содержимое
// вписываем в центральные 74% ширины: тогда его не режет ни при каком окне.
const SAFE_SHARE = 0.74;

/** Габарит непрозрачного содержимого. */
async function bbox(file) {
  const { data, info } = await sharp(file)
    .flatten({ background: '#ffffff' })
    .raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h, channels: c } = info;
  let x0 = w, x1 = 0, y0 = h, y1 = 0;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * c;
      if (!(data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244)) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  return { x0, x1, y0, y1, w, h };
}

(async () => {
  if (!fs.existsSync(SRC)) throw new Error('нет исходника: ' + SRC);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const meta = await sharp(SRC).metadata();
  const b = await bbox(SRC);
  console.log('исходник ' + meta.width + 'x' + meta.height +
    ', содержимое x ' + b.x0 + '–' + b.x1 + ' y ' + b.y0 + '–' + b.y1);

  /** Кладем вырезанный кусок исходника в центр белого холста 16:9. */
  async function place(cut, out, note) {
    const inner = await sharp(SRC).flatten({ background: '#ffffff' })
      .extract(cut)
      .resize({ width: Math.round(W * SAFE_SHARE), height: H, fit: 'inside' })
      .png().toBuffer();
    const m = await sharp(inner).metadata();
    await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
      .composite([{ input: inner, left: Math.round((W - m.width) / 2), top: Math.round((H - m.height) / 2) }])
      .webp({ quality: Q })
      .toFile(out);
    const kb = (fs.statSync(out).size / 1024).toFixed(0);
    console.log('  ' + path.basename(out).padEnd(30) + m.width + 'x' + m.height +
      ' на холсте ' + W + 'x' + H + '  ' + kb + ' KB   ' + note);
  }

  // Вариант 1: вся линейка из четырех канистр.
  await place(
    { left: b.x0, top: b.y0, width: b.x1 - b.x0 + 1, height: b.y1 - b.y0 + 1 },
    OUT, 'все четыре канистры',
  );

  // Вариант 2: только левая пара, лицо и оборот. Крупнее в маленькой плитке.
  const half = Math.round((b.x1 - b.x0 + 1) / 2);
  await place(
    { left: b.x0, top: b.y0, width: half, height: b.y1 - b.y0 + 1 },
    OUT_DIR + 'packaging-micking-pair.webp', 'левая пара, лицо и оборот',
  );
})();
