// Картинки для страницы кейса этикеток масла: full/ и thumb/ в WebP.
// Запуск: cmd /c F:\dev\design.kovtun.studio\docs\tools\label-measure\run.bat case
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const SRC = 'F:/dev/design.kovtun.studio/cases/unpublished/Green Power/\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u043c\u0430\u0441\u043b\u0430 2024/';
const ROOT = 'F:/dev/design.kovtun.studio/public/assets/cases/labels-green-power-oil/';
const FULL = ROOT + 'full/', THUMB = ROOT + 'thumb/';
// Шаблон подставляет в плитку миниатюру, srcset у него нет. Замер на 1440:
// плитка в три колонки — 430 px, плитка во всю ширину — 1329 px. На 640 px
// широкая плитка растягивалась вдвое, отсюда мыло. withoutEnlargement держит
// потолок исходника: у макетов этикеток это 1064 px, у открытки 618 px.
const Q_FULL = 92, Q_THUMB = 86;
const FULL_W = 2400, FULL_H = 2000, THUMB_GRID = 900, THUMB_WIDE = 1800;

const L = (v) => 'GP-\u041c\u0430\u0441\u043b\u0430-' + v + '-250\u043c\u043b-125\u0445130.png';

const JOBS = [
  ['\u0412\u0441\u0435 \u043c\u0430\u0441\u043b\u0430.png', 'green-power-oil-cover'],

  ['Green power 062.png', 'green-power-oil-bottles-01-kedrovyj-oreh'],
  ['Green power 064.png', 'green-power-oil-bottles-02-lnyanoe'],
  ['Green power 067.png', 'green-power-oil-bottles-03-podsolnechnoe'],
  ['Green power 035.png', 'green-power-oil-bottles-04-rastoropsha'],
  ['Green power 049.png', 'green-power-oil-bottles-05-gorchichnoe'],
  ['Green power 054.png', 'green-power-oil-bottles-06-fistashkovoe'],
  ['Green power 071.png', 'green-power-oil-bottles-07-greckij-oreh'],
  ['Green power 046.png', 'green-power-oil-bottles-08-abrikosovaya-kostochka'],

  [L('\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430'), 'green-power-oil-label-01-kedrovyj-oreh'],
  [L('\u041b\u044c\u043d\u044f\u043d\u043e\u0435'), 'green-power-oil-label-02-lnyanoe'],
  [L('\u041f\u043e\u0434\u0441\u043e\u043b\u043d\u0435\u0447\u043d\u043e\u0435'), 'green-power-oil-label-03-podsolnechnoe'],
  [L('\u0420\u0430\u0441\u0442\u043e\u0440\u043e\u043f\u0448\u0438'), 'green-power-oil-label-04-rastoropsha'],
  [L('\u0413\u043e\u0440\u0447\u0438\u0447\u043d\u043e\u0435'), 'green-power-oil-label-05-gorchichnoe'],
  [L('\u0427\u0435\u0440\u043d\u043e\u0433\u043e \u0442\u043c\u0438\u043d\u0430'), 'green-power-oil-label-06-chernyj-tmin'],
  [L('\u0413\u0440\u0435\u0446\u043a\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430'), 'green-power-oil-label-07-greckij-oreh'],
  [L('\u041c\u0438\u043d\u0434\u0430\u043b\u044c\u043d\u043e\u0435'), 'green-power-oil-label-08-mindalnoe'],
  [L('\u0424\u0438\u0441\u0442\u0430\u0448\u043a\u043e\u0432\u043e\u0435'), 'green-power-oil-label-09-fistashkovoe'],
  [L('\u041a\u043e\u043d\u043e\u043f\u043b\u044f\u043d\u043e\u0435'), 'green-power-oil-label-10-konoplyanoe'],
  [L('\u041a\u043e\u043a\u043e\u0441\u043e\u0432\u043e\u0435'), 'green-power-oil-label-11-kokosovoe'],
  [L('\u0410\u043c\u0430\u0440\u0430\u043d\u0442\u043e\u0432\u043e\u0435'), 'green-power-oil-label-12-amarantovoe'],
  [L('\u041e\u0431\u043b\u0435\u043f\u0438\u0445\u043e\u0432\u043e\u0435'), 'green-power-oil-label-13-oblepihovoe'],
  [L('\u0420\u044b\u0436\u0438\u043a\u043e\u0432\u044b'), 'green-power-oil-label-14-ryzhikovoe'],
  [L('\u0410\u0431\u0440\u0438\u043a\u043e\u0441\u043e\u0432\u043e\u0439 \u043a\u043e\u0441\u0442\u043e\u0447\u043a\u0438'), 'green-power-oil-label-15-abrikosovaya-kostochka'],
  ['GP-\u041c\u0430\u0441\u043b\u043e-\u0428\u0442\u044b\u0440\u0438\u0439\u0441\u043a\u043e\u0439 \u0442\u044b\u043a\u0432\u044b-250\u043c\u043b-125\u0445130.png', 'green-power-oil-label-16-shtirijskaya-tykva'],

  ['\u041e\u0442\u043a\u0440\u044b\u0442\u043a\u0430-105\u044574-\u041e\u0431\u043b\u043e\u0436\u043a\u0430.jpg', 'green-power-oil-postcard-01-cover'],
  ['\u041e\u0442\u043a\u0440\u044b\u0442\u043a\u0430-105\u044574-\u0412\u043d\u0443\u0442\u0440\u0438.jpg', 'green-power-oil-postcard-02-inside'],
];

fs.mkdirSync(FULL, { recursive: true });
fs.mkdirSync(THUMB, { recursive: true });

async function one(src, name, opts = {}) {
  const from = path.join(SRC, src);
  if (!fs.existsSync(from)) { console.log('  НЕТ ИСХОДНИКА: ' + src); return; }
  const thumbW = opts.wide ? THUMB_WIDE : THUMB_GRID;
  const a = await sharp(from).flatten({ background: '#ffffff' })
    .resize({ width: FULL_W, height: FULL_H, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: Q_FULL }).toFile(FULL + name + '.webp');
  const t = await sharp(from).flatten({ background: '#ffffff' })
    .resize({ width: thumbW, withoutEnlargement: true }).webp({ quality: Q_THUMB })
    .toFile(THUMB + name + '-thumbnail.webp');
  const kb = (fs.statSync(FULL + name + '.webp').size / 1024).toFixed(0);
  const tkb = (fs.statSync(THUMB + name + '-thumbnail.webp').size / 1024).toFixed(0);
  console.log('  ' + name.padEnd(46) + a.width + 'x' + a.height + ' ' + kb + ' KB' +
    '   мини ' + t.width + ' px ' + tkb + ' KB');
}

(async () => {
  console.log('== картинки кейса ==');
  for (const [src, name] of JOBS) await one(src, name);

  // Сравнение двух форматов в одном масштабе, два прохода: sharp делает resize раньше composite.
  // 8,51 px/мм — родной масштаб исходников: макет 125x130 мм лежит в 1064 px,
  // 100x80 мм в 852 px. На прежних 8 px/мм оба уменьшались перед склейкой,
  // и деталь терялась еще до сохранения.
  const PXMM = 8.512, GAP = 80, PAD = 70;
  const R=(v)=>Math.round(v*PXMM);
  const w250 = R(125), h250 = R(130), w100 = R(100), h100 = R(80);
  const cw = PAD * 2 + w250 + GAP + w100, ch = PAD * 2 + h250;
  const big = await sharp(SRC + L('\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430'))
    .flatten({ background: '#ffffff' }).resize(w250, h250, { fit: 'fill' }).png().toBuffer();
  const small = await sharp(SRC + 'GP-\u041c\u0430\u0441\u043b\u0430-\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430-100\u043c\u043b-100\u044580.png')
    .flatten({ background: '#ffffff' }).resize(w100, h100, { fit: 'fill' }).png().toBuffer();
  const canvas = await sharp({ create: { width: cw, height: ch, channels: 3, background: '#ffffff' } })
    .composite([
      { input: big, left: PAD, top: PAD },
      { input: small, left: PAD + w250 + GAP, top: PAD + h250 - h100 },
    ]).png().toBuffer();
  const c1 = await sharp(canvas).resize({ width: FULL_W, height: FULL_H, fit: 'inside', withoutEnlargement: true }).webp({ quality: Q_FULL })
    .toFile(FULL + 'green-power-oil-two-formats.webp');
  const t1 = await sharp(canvas).resize({ width: THUMB_WIDE, withoutEnlargement: true }).webp({ quality: Q_THUMB })
    .toFile(THUMB + 'green-power-oil-two-formats-thumbnail.webp');
  console.log('  green-power-oil-two-formats'.padEnd(48) + c1.width + 'x' + c1.height + '   мини ' + t1.width + ' px');

  // Обложку шаблон берет по пути assetRoot/<файл>, без папки full — кладем копию в корень.
  const coverName = 'green-power-oil-cover.webp';
  if (fs.existsSync(FULL + coverName)) {
    fs.copyFileSync(FULL + coverName, path.join(ROOT, coverName));
    console.log('  обложка скопирована в корень: ' + coverName);
  } else {
    console.log('  ВНИМАНИЕ: нет ' + FULL + coverName);
  }

  console.log('готово: ' + ROOT);
})();
