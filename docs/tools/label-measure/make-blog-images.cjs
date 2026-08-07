// Готовит картинки для статьи блога про этикетки: конвертация в WebP и склейка двух форматов.
// Запуск: cmd /c F:\dev\design.kovtun.studio\docs\tools\label-measure\run.bat img
//
// Важно: sharp применяет операции в фиксированном порядке (resize раньше composite),
// поэтому склейка делается в два прохода — сначала холст в буфер, потом уменьшение.
const sharp = require('sharp');
const fs = require('node:fs');

const SRC = 'F:/dev/design.kovtun.studio/cases/unpublished/Green Power/\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u043c\u0430\u0441\u043b\u0430 2024/';
const OUT = 'F:/dev/design.kovtun.studio/public/assets/blog/etiketki-masla-green-power/';
const L250 = SRC + 'GP-\u041c\u0430\u0441\u043b\u0430-\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430-250\u043c\u043b-125\u0445130.png';
const L100 = SRC + 'GP-\u041c\u0430\u0441\u043b\u0430-\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430-100\u043c\u043b-100\u044580.png';

const PXMM = 8;            // единый масштаб склейки: 8 пикселей на миллиметр
const GAP = 80, PAD = 70;  // зазор и поля на белом холсте
const Q = 82;

fs.mkdirSync(OUT, { recursive: true });

async function web(src, name, width) {
  const info = await sharp(src)
    .flatten({ background: '#ffffff' })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: Q })
    .toFile(OUT + name);
  console.log('  ' + name + '  ' + info.width + 'x' + info.height + '  ' +
    (fs.statSync(OUT + name).size / 1024).toFixed(0) + ' KB');
}

async function compare() {
  const w250 = Math.round(125 * PXMM), h250 = Math.round(130 * PXMM);
  const w100 = Math.round(100 * PXMM), h100 = Math.round(80 * PXMM);
  const cw = PAD * 2 + w250 + GAP + w100;
  const ch = PAD * 2 + h250;
  const a = await sharp(L250).flatten({ background: '#ffffff' }).resize(w250, h250, { fit: 'fill' }).png().toBuffer();
  const b = await sharp(L100).flatten({ background: '#ffffff' }).resize(w100, h100, { fit: 'fill' }).png().toBuffer();
  // проход 1: собираем холст в исходном масштабе
  const canvas = await sharp({ create: { width: cw, height: ch, channels: 3, background: '#ffffff' } })
    .composite([
      { input: a, left: PAD, top: PAD },
      // по нижнему краю, чтобы разница высот читалась сразу
      { input: b, left: PAD + w250 + GAP, top: PAD + h250 - h100 },
    ])
    .png()
    .toBuffer();
  // проход 2: уменьшаем готовый холст
  const info = await sharp(canvas).resize({ width: 1600 }).webp({ quality: Q }).toFile(OUT + 'dva-formata.webp');
  console.log('  dva-formata.webp  ' + info.width + 'x' + info.height + '  ' +
    (fs.statSync(OUT + 'dva-formata.webp').size / 1024).toFixed(0) + ' KB  (холст ' + cw + 'x' + ch +
    ', масштаб ' + PXMM + ' px/мм, оба формата в одном масштабе)');
}

(async () => {
  console.log('== webp для статьи ==');
  await web(SRC + '\u0412\u0441\u0435 \u043c\u0430\u0441\u043b\u0430.png', 'green-power-oil-linejka.webp', 1600);
  await web(L250, 'etiketka-kedrovyj-oreh.webp', 1200);
  await web(SRC + '\u041e\u0442\u043a\u0440\u044b\u0442\u043a\u0430-105\u044574-\u0412\u043d\u0443\u0442\u0440\u0438.jpg', 'otkrytka-vnutri.webp', 1400);
  await compare();
  console.log('готово, папка: ' + OUT);
})();
