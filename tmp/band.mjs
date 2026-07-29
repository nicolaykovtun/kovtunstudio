// Вырезает горизонтальную полосу макета с линейкой по Y: нужно, чтобы глазами
// уточнить границу секции там, где detect-gaps и edge-runs не сработали.
// Запуск: node tmp/band.mjs "<макет>" <top> <bottom> <файл вывода> [шаг линейки]
import sharp from 'sharp';

const [, , src, topArg, bottomArg, out, stepArg] = process.argv;
if (!src || !topArg || !bottomArg || !out) {
  console.error('Нужны аргументы: <макет> <top> <bottom> <вывод> [шаг]');
  process.exit(1);
}

const top = Number(topArg);
const bottom = Number(bottomArg);
const step = Number(stepArg ?? 100);
const WIDTH = 1200;

const meta = await sharp(src, { limitInputPixels: false }).metadata();
const height = Math.min(bottom, meta.height) - top;
const scale = WIDTH / meta.width;
const outHeight = Math.round(height * scale);

const lines = [];
for (let y = Math.ceil(top / step) * step; y < top + height; y += step) {
  const py = Math.round((y - top) * scale);
  const major = y % (step * 5) === 0;
  lines.push(
    `<line x1="0" y1="${py}" x2="${major ? 90 : 45}" y2="${py}" stroke="#ff00d0" stroke-width="${major ? 2 : 1}"/>`,
    `<text x="${major ? 94 : 49}" y="${py + 4}" font-family="monospace" font-size="11" fill="#ff00d0">${y}</text>`,
  );
}

const ruler = Buffer.from(
  `<svg width="${WIDTH}" height="${outHeight}" xmlns="http://www.w3.org/2000/svg">${lines.join('')}</svg>`,
);

await sharp(src, { limitInputPixels: false })
  .extract({ left: 0, top, width: meta.width, height })
  .resize({ width: WIDTH })
  .composite([{ input: ruler, top: 0, left: 0 }])
  .webp({ quality: 80 })
  .toFile(out);

console.log(`${out} | Y ${top}..${top + height} | ${WIDTH}x${outHeight}`);
