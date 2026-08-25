// Контактный лист: собирает превью всех файлов по маске в одну картинку с номерами.
// Запуск: node docs/tools/label-measure/contact-sheet.cjs
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');

const SRC = 'F:/dev/design.kovtun.studio/cases/unpublished/Green Power/\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u043c\u0430\u0441\u043b\u0430 2024/';
const OUT = 'F:/dev/design.kovtun.studio/docs/tools/label-measure/_contact-sheet.png';

const CELL = 300, COLS = 4, PAD = 6;

(async () => {
  const files = fs.readdirSync(SRC)
    .filter((f) => /^Green ?[Pp]ower \d+\.png$/i.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));
  console.log('файлов:', files.length);
  files.forEach((f, i) => console.log('  ' + i + ' -> ' + f));

  const rows = Math.ceil(files.length / COLS);
  const W = COLS * (CELL + PAD) + PAD;
  const H = rows * (CELL + PAD) + PAD;

  const tiles = [];
  for (let i = 0; i < files.length; i++) {
    const buf = await sharp(path.join(SRC, files[i]))
      .flatten({ background: '#ffffff' })
      .resize(CELL, CELL, { fit: 'contain', background: '#ffffff' })
      .png().toBuffer();
    tiles.push({
      input: buf,
      left: PAD + (i % COLS) * (CELL + PAD),
      top: PAD + Math.floor(i / COLS) * (CELL + PAD),
    });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#dddddd' } })
    .composite(tiles).png().toFile(OUT);
  console.log('готово:', OUT, W + 'x' + H);
})();
