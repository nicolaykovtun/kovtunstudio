// Производные карточки пяти исполнений логотипа Sila Car.
//
// Исходник Sila.car-logo_2.1.jpg — готовый лист 5335x3334: слева одна
// карточка 4:5 во всю высоту, справа четыре карточки 4:5 сеткой 2x2.
// Нарезаем их отдельно, чтобы все исполнения стояли в галерее в одном
// масштабе и без ручного повторения координат в основном пайплайне.
//
// Запуск: node tmp/crop-sila-car.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const source = 'cases/published/Sila Car - Identity/source/Logo/Sila.car-logo_2.1.jpg';
const outDir = 'tmp/derived/sila-car';

const meta = await sharp(source).metadata();
if (meta.width !== 5335 || meta.height !== 3334) {
  throw new Error(`Неожиданный размер листа: ${meta.width}x${meta.height}`);
}
const cards = [
  { name: 'main', left: 0, top: 0, width: 2667, height: 3334 },
  { name: 'on-red', left: 2667, top: 0, width: 1334, height: 1667 },
  { name: 'on-gray', left: 4001, top: 0, width: 1334, height: 1667 },
  { name: 'mono-light', left: 2667, top: 1667, width: 1334, height: 1667 },
  { name: 'mono-dark', left: 4001, top: 1667, width: 1334, height: 1667 },
];

fs.mkdirSync(outDir, { recursive: true });

for (const card of cards) {
  const output = path.join(outDir, `logo-${card.name}.png`);
  await sharp(source)
    .extract({ left: card.left, top: card.top, width: card.width, height: card.height })
    .png()
    .toFile(output);
  console.log(`${output} | ${card.width}x${card.height}`);
}
