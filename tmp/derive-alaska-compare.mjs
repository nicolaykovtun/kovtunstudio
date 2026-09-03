// Пара «было — стало» из сборки «Аляска Новый дизайн 1» (2160x3840).
// Подписи «СТАЛО» и «БЫЛО» обрезаются: их рисует сам компонент сравнения.
import sharp from 'sharp';
const SRC = 'cases/published/Alaska - Packaging/Raw/Упаковка/Аляска Новый дизайн 1.jpg';
const OUT = 'tmp/derived/alaska';
const W = 1920, H = 1080, PAD = 0.05;
const crops = [
  ['compare-after',  { left: 520, top: 1175, width: 1640, height: 1385 }],
  ['compare-before', { left: 0,   top: 2620, width: 1420, height: 1084 }],
];
for (const [name, box] of crops) {
  const inner = await sharp(SRC, { limitInputPixels: false })
    .extract(box)
    .resize({ width: Math.round(W*(1-PAD*2)), height: Math.round(H*(1-PAD*2)), fit: 'inside' })
    .png().toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: '#f4f4f4' } })
    .composite([{ input: inner, gravity: 'center' }])
    .png().toFile(`${OUT}/${name}.png`);
  console.log(name, JSON.stringify(box));
}
