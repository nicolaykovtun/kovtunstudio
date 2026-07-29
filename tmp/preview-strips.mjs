// Готовит обозримые превью длинного макета: уменьшает по ширине и режет
// на вертикальные полосы. Нужно, чтобы глазами найти границы смысловых блоков.
// Запуск: node tmp/preview-strips.mjs "<путь к макету>" "<папка вывода>" [ширина] [высота полосы]
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const [, , src, outDir, widthArg, stripArg] = process.argv;
if (!src || !outDir) {
  console.error('Нужны аргументы: <исходник> <папка вывода> [ширина] [высота полосы]');
  process.exit(1);
}

const previewWidth = Number(widthArg ?? 520);
const stripHeight = Number(stripArg ?? 1800);

fs.mkdirSync(outDir, { recursive: true });

const meta = await sharp(src, { limitInputPixels: false }).metadata();

const { data: buffer, info } = await sharp(src, { limitInputPixels: false })
  .resize({ width: previewWidth })
  .toBuffer({ resolveWithObject: true });

// Реальные размеры берем из результата, а не считаем: округление libvips
// отличается от Math.round и ломает extract на последней полосе.
const previewHeight = info.height;
const scale = info.width / meta.width;

const count = Math.ceil(previewHeight / stripHeight);
console.log(`Исходник ${meta.width}x${meta.height} -> превью ${previewWidth}x${previewHeight}`);
console.log(`Полос: ${count}, масштаб 1:${(1 / scale).toFixed(1)}`);

for (let i = 0; i < count; i += 1) {
  const top = i * stripHeight;
  const height = Math.min(stripHeight, previewHeight - top);
  const name = `strip-${String(i + 1).padStart(2, '0')}.webp`;
  await sharp(buffer)
    .extract({ left: 0, top, width: previewWidth, height })
    .webp({ quality: 72 })
    .toFile(path.join(outDir, name));
  const origTop = Math.round(top / scale);
  const origBottom = Math.round((top + height) / scale);
  console.log(`${name} | оригинал Y ${origTop}..${origBottom}`);
}
