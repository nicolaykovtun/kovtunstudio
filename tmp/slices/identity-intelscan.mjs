// Ассеты кейса identity-intelscan: обложка, исполнения, путь поиска, до/после
import sharp from 'sharp';
import fs from 'fs';
const out = process.argv[2] || 'out';
const A = '#303438', G = '#92989D';
fs.mkdirSync(`${out}/full`, { recursive: true });
fs.mkdirSync(`${out}/thumb`, { recursive: true });

async function logo(svgFile, width, recolor) {
  let svg = fs.readFileSync(svgFile, 'utf8');
  if (recolor) svg = svg.replace(/fill:\s*#[0-9a-fA-F]{3,6}/g, `fill: ${recolor}`);
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const density = 72 * width / vb[2];
  return sharp(Buffer.from(svg), { density }).resize({ width }).png().toBuffer();
}
async function canvas(w, h, bg, logoBuf, yShift = 0) {
  const m = await sharp(logoBuf).metadata();
  return sharp({ create: { width: w, height: h, channels: 3, background: bg } })
    .composite([{ input: logoBuf, left: Math.round((w - m.width) / 2), top: Math.round((h - m.height) / 2 + yShift) }]);
}
async function save(img, name, fullW = 1440) {
  const buf = await img.png().toBuffer();
  await sharp(buf).resize({ width: fullW, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${out}/full/${name}.webp`);
  await sharp(buf).resize({ width: 640 }).webp({ quality: 72 }).toFile(`${out}/thumb/${name}-thumbnail.webp`);
}

// обложка 2400x1350: белый знак на асфальте
const cov = await canvas(2400, 1350, A, await logo('white.svg', 1320));
const covBuf = await cov.png().toBuffer();
await sharp(covBuf).webp({ quality: 82 }).toFile(`${out}/identity-intelscan-cover.webp`);
await sharp(covBuf).resize(1200, 630, { fit: 'contain', background: A }).webp({ quality: 82 }).toFile(`${out}/identity-intelscan-og.webp`);

// исполнения, 16:9 по 1920x1080
const V = [
  ['intelscan-logo-02-on-gray', G, 'grey.svg', A],
  ['intelscan-logo-03-on-asphalt', A, 'grey.svg', null],
  ['intelscan-logo-04-white-on-black', '#000000', 'white.svg', null],
  ['intelscan-logo-05-black-on-white', '#FFFFFF', 'black.svg', null],
];
for (const [n, bg, f, rc] of V) await save(await canvas(1920, 1080, bg, await logo(f, 1000, rc)), n);

// пятнадцать направлений: сетка 3x5 режется на ячейки 904x519, плюс ветка финала v16.2
for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
  const n = String(r * 3 + c + 1).padStart(2, '0');
  await save(sharp('grid.jpg').extract({ left: c * 904, top: r * 519, width: 904, height: 519 }), `intelscan-direction-${n}`);
}
await save(sharp('v162.png'), 'intelscan-direction-16-final-branch');

// до / после: одинаковый размер 1920x1080 на черном
const oldBuf = await sharp('old.png').resize({ width: 1000 }).toBuffer();
await save(await canvas(1920, 1080, '#111111', oldBuf), 'intelscan-before-old-logo');
await save(await canvas(1920, 1080, '#111111', await logo('white.svg', 1000)), 'intelscan-after-new-logo');
console.log('ok');
