// Ищет горизонтальные промежутки в длинном макете: строки пикселей, где нет
// контента (однородный фон). Середина такого промежутка — безопасное место реза.
// Запуск: node tmp/detect-gaps.mjs "<макет>" [минимальная высота промежутка в оригинале]
import sharp from 'sharp';

const [, , src, minGapArg] = process.argv;
if (!src) {
  console.error('Нужен путь к макету');
  process.exit(1);
}

const WORK_WIDTH = 400; // мелкая копия: строки считаются быстро, шум усредняется
const minGapOriginal = Number(minGapArg ?? 60);

const meta = await sharp(src, { limitInputPixels: false }).metadata();
const { data, info } = await sharp(src, { limitInputPixels: false })
  .resize({ width: WORK_WIDTH })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const scale = meta.width / info.width; // во сколько раз оригинал крупнее
const minGap = Math.max(2, Math.round(minGapOriginal / scale));

const rows = [];
for (let y = 0; y < info.height; y += 1) {
  let min = 255;
  let max = 0;
  let sum = 0;
  for (let x = 0; x < info.width; x += 1) {
    const v = data[y * info.width + x];
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  rows.push({ spread: max - min, mean: sum / info.width });
}

// Строка считается пустой, если разброс яркости мал: сплошной фон любого цвета.
const SPREAD_LIMIT = 12;
const gaps = [];
let start = null;
for (let y = 0; y < rows.length; y += 1) {
  const empty = rows[y].spread <= SPREAD_LIMIT;
  if (empty && start === null) start = y;
  if ((!empty || y === rows.length - 1) && start !== null) {
    const end = empty ? y : y - 1;
    if (end - start + 1 >= minGap) gaps.push({ start, end });
    start = null;
  }
}

console.log(`Макет ${meta.width}x${meta.height}, рабочая копия ${info.width}x${info.height}`);
console.log(`Промежутков не короче ${minGapOriginal}px: ${gaps.length}\n`);
console.log('  #  | рез по Y | высота промежутка | фон | блок до реза');
let prevCut = 0;
gaps.forEach((g, i) => {
  const midOriginal = Math.round(((g.start + g.end) / 2) * scale);
  const heightOriginal = Math.round((g.end - g.start + 1) * scale);
  const tone = rows[g.start].mean > 140 ? 'светлый' : 'темный';
  console.log(
    `  ${String(i + 1).padStart(2)} | ${String(midOriginal).padStart(6)} | ${String(heightOriginal).padStart(5)} | ${tone.padEnd(7)} | ${midOriginal - prevCut}`,
  );
  prevCut = midOriginal;
});
console.log(`  до конца: ${meta.height - prevCut}`);
