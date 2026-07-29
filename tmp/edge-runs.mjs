// Ищет границы секций по цвету левого края макета: секции с цветной подложкой
// (желтые диагонали, серые блоки) не дают «пустых» строк, поэтому detect-gaps
// их пропускает. Здесь смотрим полосу у левого края и печатаем участки
// одного цвета — их стыки и есть границы секций.
// Запуск: node tmp/edge-runs.mjs "<макет>" [ширина полосы] [минимальная высота участка]
import sharp from 'sharp';

const [, , src, bandArg, minRunArg] = process.argv;
if (!src) {
  console.error('Нужен путь к макету');
  process.exit(1);
}

const WORK_WIDTH = 400;
const band = Number(bandArg ?? 12); // сколько пикселей рабочей копии считать «краем»
const minRun = Number(minRunArg ?? 8);

const meta = await sharp(src, { limitInputPixels: false }).metadata();
const { data, info } = await sharp(src, { limitInputPixels: false })
  .resize({ width: WORK_WIDTH })
  .raw()
  .toBuffer({ resolveWithObject: true });

const channels = info.channels;
const scale = meta.width / info.width;

const rows = [];
for (let y = 0; y < info.height; y += 1) {
  let r = 0;
  let g = 0;
  let b = 0;
  for (let x = 0; x < band; x += 1) {
    const i = (y * info.width + x) * channels;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  rows.push([Math.round(r / band), Math.round(g / band), Math.round(b / band)]);
}

const near = (a, b, limit = 10) =>
  Math.abs(a[0] - b[0]) <= limit && Math.abs(a[1] - b[1]) <= limit && Math.abs(a[2] - b[2]) <= limit;

const runs = [];
let start = 0;
for (let y = 1; y <= rows.length; y += 1) {
  if (y === rows.length || !near(rows[y], rows[start])) {
    runs.push({ start, end: y - 1, color: rows[start] });
    start = y;
  }
}

console.log(`Макет ${meta.width}x${meta.height}, рабочая копия ${info.width}x${info.height}`);
console.log('  Y начала | Y конца | высота | цвет края');
for (const run of runs) {
  const height = Math.round((run.end - run.start + 1) * scale);
  if (height < minRun) continue;
  console.log(
    `  ${String(Math.round(run.start * scale)).padStart(8)} | ${String(Math.round((run.end + 1) * scale)).padStart(7)} | ${String(height).padStart(6)} | rgb(${run.color.join(',')})`,
  );
}
