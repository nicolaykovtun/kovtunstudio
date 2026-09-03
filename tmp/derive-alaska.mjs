// Приводит разнокалиберные исходники Alaska к единому холсту 1920x1080.
// Запуск: node tmp/derive-alaska.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC_LOGO = 'cases/published/Alaska - Identity/Raw';
const SRC_PACK = 'cases/published/Alaska - Packaging/Raw';
const OUT = 'tmp/derived/alaska';
fs.mkdirSync(OUT, { recursive: true });

const W = 1920, H = 1080, PAD = 0.09;

const items = [
  ['logo-original',  `${SRC_LOGO}/Логотип/Оригинал.png`],
  ['logo-guides',    `${SRC_LOGO}/Логотип/Подготовка к переделки.png`],
  ['logo-step1',     `${SRC_LOGO}/Логотип/Этап 1.png`],
  ['logo-step2',     `${SRC_LOGO}/Логотип/Этап 2.png`],
  ['logo-step3',     `${SRC_LOGO}/Логотип/Этап 3.jpg`],
  ['logo-step4',     `${SRC_LOGO}/Логотип/Этап 4.jpg`],
  ['logo-step5',     `${SRC_LOGO}/Логотип/Этап 5.jpg`],
  ['logo-rules',     `${SRC_LOGO}/Логотип/Снимок экрана 2024-08-05 155838.png`],
  ['logo-on-label',  `${SRC_PACK}/Упаковка/Все этикетки/AGM 75 L  LN3-L3.png`],
  ['logo-on-box',    `${SRC_PACK}/Упаковка/Все коробки/ALASKA  CMF 50 L 60B24.jpg`],
  ['logo-on-banner', `${SRC_PACK}/Реклама/1800х950 превью 1.png`],
  ['logo-on-top',    `${SRC_PACK}/Упаковка/Все этикетки/AGM 75 L  LN3-L3 top1.png`],
  ['box-cmf-65',     `${SRC_PACK}/Упаковка/Все коробки/ALASKA  CMF 65 FL 75D23.jpg`],
  ['label-top-cmf',  `${SRC_PACK}/Упаковка/Все этикетки/TOP_ALASKA  CMF 50 L 60B24 silver+.jpg`],
  ['label-top-agm',  `${SRC_PACK}/Упаковка/Все этикетки/AGM 75 L  LN3-L3 top1.png`],
  ['label-cmf',      `${SRC_PACK}/Упаковка/Все этикетки/ALASKA  FRONT_ALASKA  CMF 50 L 60B24 silver+.jpg`],
  ['label-efb',      `${SRC_PACK}/Упаковка/Все этикетки/EFB N55L 65B24L.png`],
  ['label-agm',      `${SRC_PACK}/Упаковка/Все этикетки/AGM 75 L  LN3-L3.png`],
  ['label-cmf-big',  `${SRC_PACK}/Упаковка/Все этикетки/ALASKA  FRONT_ALASKA  CMF 190 L 180G51 silver+.jpg`],
  ['label-efb-small',`${SRC_PACK}/Упаковка/Все этикетки/EFB M42L 50B20L .png`],
  ['label-agm-small',`${SRC_PACK}/Упаковка/Все этикетки/AGM 45L 50B20L .png`],
  ['box-cmf-40',     `${SRC_PACK}/Упаковка/Все коробки/ALASKA CMF 40 L 42B19.jpg`],
  ['box-cmf-95',     `${SRC_PACK}/Упаковка/Все коробки/ALASKA  CMF 95 FL 115D31.jpg`],
];

for (const [name, file] of items) {
  if (!fs.existsSync(file)) { console.log(`ПРОПУСК ${name}: нет файла ${file}`); continue; }
  const inner = await sharp(file, { limitInputPixels: false })
    .resize({
      width: Math.round(W * (1 - PAD * 2)),
      height: Math.round(H * (1 - PAD * 2)),
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
  const out = path.join(OUT, `${name}.png`);
  await sharp({ create: { width: W, height: H, channels: 3, background: '#ffffff' } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(out);
  const m = await sharp(file, { limitInputPixels: false }).metadata();
  console.log(`${name}  <- ${path.basename(file)} (${m.width}x${m.height})`);
}

// Обложка кейса логотипа: инверсный лок-ап с листа правил, на фирменном синем.
// Знак на белом холсте в сетке портфолио читается как пустая плитка.
{
  const rules = `${SRC_LOGO}/Логотип/Снимок экрана 2024-08-05 155838.png`;
  const inner = await sharp(rules)
    .extract({ left: 604, top: 106, width: 470, height: 136 })
    .resize({ width: 1180, fit: 'inside' })
    .png().toBuffer();
  await sharp({ create: { width: 1920, height: 1080, channels: 3, background: '#3C4965' } })
    .composite([{ input: inner, gravity: 'center' }])
    .png().toFile(`${OUT}/logo-cover.png`);
  console.log('logo-cover  <- инверсный лок-ап на #354B67');
}
