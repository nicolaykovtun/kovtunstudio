// Как detect-gaps.mjs, но смотрит только заданную колонку макета. Нужно там, где
// у правого края висит закрепленный элемент (у EON — плашка «Day Pass · 2 500»):
// он тянется через весь макет и заклеивает все пустые строки.
// Запуск: node tmp/gaps-in-column.mjs "<макет>" <left> <width> [минимальная высота промежутка]
import sharp from 'sharp';

const [, , src, leftArg, widthArg, minGapArg] = process.argv;
if (!src || !leftArg || !widthArg) {
  console.error('Нужны аргументы: <макет> <left> <width> [минимальный промежуток]');
  process.exit(1);
}

const WORK_WIDTH = 400;
const minGapOriginal = Number(minGapArg ?? 100);

const meta = await sharp(src, { limitInputPixels: false }).metadata();
const left = Number(leftArg);
const width = Number(widthArg);

const { data, info } = await sharp(src, { limitInputPixels: false })
  .extract({ left, top: 0, width, height: meta.height })
  .resize({ width: WORK_WIDTH })
  .raw()
  .toBuffer({ resolveWithObject: true });

const scale = meta.height / info.height;
const ch = info.channels;
const minGap = Math.max(1, Math.round(minGapOriginal / scale));

// Строка считается пустой, если все пиксели совпадают с первым с допуском 4.
const flat = [];
for (let y = 0; y < info.height; y += 1) {
  const base = y * info.width * ch;
  const r0 = data[base], g0 = data[base + 1], b0 = data[base + 2];
  let uniform = true;
  for (let x = 1; x < info.width; x += 1) {
    const p = base + x * ch;
    if (Math.abs(data[p] - r0) > 4 || Math.abs(data[p + 1] - g0) > 4 || Math.abs(data[p + 2] - b0) > 4) {
      uniform = false;
      break;
    }
  }
  flat.push(uniform ? [r0, g0, b0] : null);
}

console.log(`Макет ${meta.width}x${meta.height}, колонка ${left}..${left + width}, копия ${info.width}x${info.height}`);
const runs = [];
let start = null;
for (let y = 0; y <= info.height; y += 1) {
  const isFlat = y < info.height && flat[y];
  if (isFlat && start === null) start = y;
  if (!isFlat && start !== null) {
    if (y - start >= minGap) runs.push([start, y, flat[start]]);
    start = null;
  }
}

console.log(`Промежутков не короче ${minGapOriginal}px: ${runs.length}\n`);
let prev = 0;
runs.forEach(([a, b, color], i) => {
  const cutY = Math.round(((a + b) / 2) * scale);
  const h = Math.round((b - a) * scale);
  const hex = '#' + color.map((v) => v.toString(16).padStart(2, '0')).join('');
  console.log(
    `${String(i + 1).padStart(3)} | рез по Y ${String(cutY).padStart(6)} | промежуток ${String(h).padStart(5)} | ${hex} | блок до реза ${cutY - prev}`,
  );
  prev = cutY;
});
console.log(`до конца: ${meta.height - prev}`);
