// Пайплайн подготовки изображений кейса.
// Режет длинный макет на смысловые блоки по координатам из конфига,
// раскладывает в full/ и thumb/, конвертирует в WebP.
// Запуск: node tmp/slice.mjs tmp/slices/<конфиг>.json
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const configPath = process.argv[2];
if (!configPath) {
  console.error('Нужен путь к конфигу нарезки');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const {
  outDir,
  fullWidth = 1440,
  thumbWidth = 640,
  fullQuality = 82,
  thumbQuality = 72,
  sources,
} = config;

const fullDir = path.join(outDir, 'full');
const thumbDir = path.join(outDir, 'thumb');
fs.mkdirSync(fullDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

let total = 0;
let bytes = 0;

for (const source of sources) {
  const { file, prefix, blocks } = source;
  const meta = await sharp(file, { limitInputPixels: false }).metadata();
  console.log(`\n${path.basename(file)} — ${meta.width}x${meta.height}`);

  for (const [i, block] of blocks.entries()) {
    const top = block.top ?? 0;
    const bottom = Math.min(block.bottom ?? meta.height, meta.height);
    const height = bottom - top;
    if (height <= 0) {
      console.log(`  ПРОПУСК ${block.name}: пустой диапазон ${top}..${bottom}`);
      continue;
    }

    const num = String(block.order ?? i + 1).padStart(2, '0');
    const base = `${prefix}-${num}-${block.name}`;

    const region = sharp(file, { limitInputPixels: false }).extract({
      left: 0,
      top,
      width: meta.width,
      height,
    });

    const fullPath = path.join(fullDir, `${base}.webp`);
    await region
      .clone()
      .resize({ width: fullWidth })
      .webp({ quality: fullQuality })
      .toFile(fullPath);

    const thumbPath = path.join(thumbDir, `${base}-thumbnail.webp`);
    await region
      .clone()
      .resize({ width: thumbWidth })
      .webp({ quality: thumbQuality })
      .toFile(thumbPath);

    const size = fs.statSync(fullPath).size;
    bytes += size + fs.statSync(thumbPath).size;
    total += 1;
    console.log(
      `  ${base} | ${top}..${bottom} (${height}px) | ${(size / 1024).toFixed(0)} КБ`,
    );
  }
}

// Обложка 16:9: верхняя часть указанного макета, обрезанная по центру.
if (config.cover) {
  const { file, top = 0, height, name } = config.cover;
  const meta = await sharp(file, { limitInputPixels: false }).metadata();
  const cropHeight = height ?? Math.round((meta.width / 16) * 9);
  const coverPath = path.join(outDir, `${name}.webp`);
  // fit contain, а не cover: обложка не должна резать макет по краям и не должна
  // захватывать половину соседнего блока. Недостающее добираем фоном.
  await sharp(file, { limitInputPixels: false })
    .extract({ left: 0, top, width: meta.width, height: cropHeight })
    .resize({
      width: 1600,
      height: 900,
      fit: 'contain',
      background: config.cover.background ?? '#ffffff',
    })
    .webp({ quality: 84 })
    .toFile(coverPath);
  const size = fs.statSync(coverPath).size;
  bytes += size;
  total += 1;
  console.log(`\nОбложка ${name}.webp | ${(size / 1024).toFixed(0)} КБ`);
}

console.log(`\nГотово: ${total} файлов, ${(bytes / 1024 / 1024).toFixed(1)} МБ`);
