// Производные кропы для кейса identity-green-power.
//
// Зачем нужен отдельный шаг. Пять исполнений знака Green Power не лежат
// отдельными файлами, как у Трубоварни: в папке логотипа есть только сборка
// 1920x1080 со всеми вариантами сразу, и в ней каждый вариант — 480x540,
// то есть втрое меньше ширины нарезки. Зато на 3-й странице гайдбука те же
// четыре исполнения лежат карточками по 890x1001 — это нативное разрешение,
// его и берем. Основной вариант на белом собирается отдельно: знак из
// Logo-Green Power-1.jpg ставится на белое поле того же размера и той же
// доли ширины (0,591), что и знак внутри карточек гайдбука, — иначе в галерее
// пять плиток разъезжаются по масштабу знака.
//
// slice.mjs режет только по Y во всю ширину макета, поперечных кропов не умеет,
// поэтому координаты карточек живут здесь, а не в конфиге нарезки.
// Выхлоп идет в tmp/derived/ (локально), сам скрипт коммитится.
//
// Запуск: node tmp/crop-green-power.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = 'cases/published/Green Power - Identity/source';
const guidebookVersions = path.join(root, 'Guidebook/Raw/Guidebook-Green Power_Страница_3.jpg');
const logoSheet = path.join(root, 'Logo/Raw/Logo-Green Power-1.jpg');
const outDir = 'tmp/derived/green-power';

// Карточки исполнений на 3-й странице гайдбука. Границы сняты по столбцам
// и строкам с чернилами: полоса карточек Y 1064..2064, ширина карточки 890,
// зазор 110, между цветной и монохромной группами зазор 610.
const CARD = { top: 1064, width: 890, height: 1001 };
const cards = [
  { name: 'on-dark', left: 722 },
  { name: 'on-light', left: 1721 },
  { name: 'mono-light', left: 3222 },
  { name: 'mono-dark', left: 4221 },
];

// Доля ширины карточки, которую занимает знак, и его размер на белом поле.
const MARK_RATIO = 0.591;
const markWidth = Math.round(CARD.width * MARK_RATIO);

fs.mkdirSync(outDir, { recursive: true });

for (const card of cards) {
  const out = path.join(outDir, `logo-${card.name}.png`);
  await sharp(guidebookVersions)
    .extract({ left: card.left, top: CARD.top, width: CARD.width, height: CARD.height })
    .png()
    .toFile(out);
  console.log(`${out} | ${CARD.width}x${CARD.height} из гайдбука, страница 3`);
}

const mark = await sharp(logoSheet)
  .resize({ width: markWidth, kernel: 'lanczos3' })
  .toBuffer({ resolveWithObject: true });

const mainOut = path.join(outDir, 'logo-main.png');
await sharp({
  create: {
    width: CARD.width,
    height: CARD.height,
    channels: 3,
    background: '#ffffff',
  },
})
  .composite([
    {
      input: mark.data,
      left: Math.round((CARD.width - mark.info.width) / 2),
      top: Math.round((CARD.height - mark.info.height) / 2),
    },
  ])
  .png()
  .toFile(mainOut);
console.log(`${mainOut} | ${CARD.width}x${CARD.height}, знак ${mark.info.width}px на белом`);
