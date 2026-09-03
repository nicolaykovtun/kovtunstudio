// Уменьшенные обложки кейсов и OG-картинки страниц услуг.
//
// Обложки кейсов лежат в public/assets/cases/<slug>/<name>-cover.webp одним
// размером (1600–2400 px), а карточка на странице услуги занимает треть экрана.
// Скрипт кладет рядом <name>-cover-800.webp, который подставляется в srcset
// (см. src/lib/covers.ts). Запуск: node scripts/make-cover-sizes.mjs
//
// OG-картинки: страницы упаковки, фирменного стиля и сайтов делили одну
// og-services.jpg. Здесь из обложки характерного кейса режется 1200×630.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const casesDir = path.resolve('public/assets/cases');
let made = 0;
for (const slug of fs.readdirSync(casesDir)) {
  const dir = path.join(casesDir, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir)) {
    if (!/-cover\.webp$/.test(file)) continue;
    const src = path.join(dir, file);
    const out = path.join(dir, file.replace(/\.webp$/, '-800.webp'));
    if (fs.existsSync(out)) continue;
    await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
    made++;
  }
}
console.log(`обложек 800px создано: ${made}`);

const og = {
  'og-identity.jpg': 'identity-green-power/green-power-identity-cover.webp',
  'og-websites.jpg': 'website-ptksk/ptksk-website-cover.webp',
  'og-packaging.jpg': 'labels-green-power-juice/green-power-juice-cover.webp',
};
for (const [name, rel] of Object.entries(og)) {
  const out = path.resolve('public', name);
  await sharp(path.join(casesDir, rel))
    .resize({ width: 1200, height: 630, fit: 'cover', position: 'centre' })
    .jpeg({ quality: 86 })
    .toFile(out);
  console.log('og:', name);
}
