// Проверка собранной страницы без браузера: битые пути к картинкам,
// пустые alt, наличие ключевых секций, вес страницы.
import fs from 'node:fs';
import path from 'node:path';

const pagePath = process.argv[2];
const distRoot = path.resolve('dist');
const html = fs.readFileSync(pagePath, 'utf8');

const problems = [];

// Картинки
const imgTags = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
const seen = new Set();
let missing = 0;
let noAlt = 0;

for (const tag of imgTags) {
  const src = /\ssrc="([^"]+)"/.exec(tag)?.[1];
  const alt = /\salt="([^"]*)"/.exec(tag)?.[1];
  // Пустой src — заготовка под подстановку из скрипта (кадр просмотрщика).
  // Проверять у нее alt нечего: и картинка, и подпись приходят при открытии.
  const isPlaceholder = !src;
  if (isPlaceholder) continue;
  if (alt === undefined) {
    noAlt += 1;
    problems.push(`нет атрибута alt: ${tag.slice(0, 90)}`);
  } else if (alt.trim() === '' && !/aria-hidden/.test(tag)) {
    noAlt += 1;
    problems.push(`пустой alt: ${src}`);
  }
  if (src.startsWith('data:') || /^https?:/.test(src)) continue;
  seen.add(src);
  const file = path.join(distRoot, src.replace(/^\//, ''));
  if (!fs.existsSync(file)) {
    missing += 1;
    problems.push(`нет файла: ${src}`);
  }
}

// Пути из инлайнового скрипта просмотрщика
const galleryPaths = [...html.matchAll(/"(\/assets\/cases\/[^"]+\.webp)"/g)].map((m) => m[1]);
for (const src of new Set(galleryPaths)) {
  if (seen.has(src)) continue;
  const file = path.join(distRoot, src.replace(/^\//, ''));
  if (!fs.existsSync(file)) {
    missing += 1;
    problems.push(`нет файла (просмотрщик): ${src}`);
  }
  seen.add(src);
}

const has = (needle) => (html.includes(needle) ? 'есть' : 'НЕТ');
const count = (re) => (html.match(re) ?? []).length;

console.log(`Страница: ${path.relative(distRoot, pagePath)}`);
console.log(`Вес HTML: ${(Buffer.byteLength(html) / 1024).toFixed(0)} КБ`);
console.log(`Изображений в разметке: ${imgTags.length}, уникальных путей всего: ${seen.size}`);
console.log(`title: ${/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? 'НЕТ'}`);
console.log(`description: ${/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? 'НЕТ'}`);
console.log(`canonical: ${/<link rel="canonical" href="([^"]*)"/.exec(html)?.[1] ?? 'НЕТ'}`);
console.log(`og:image: ${/<meta property="og:image" content="([^"]*)"/.exec(html)?.[1] ?? 'НЕТ'}`);
console.log(`h1: ${/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1].replace(/<[^>]+>/g, '').trim() ?? 'НЕТ'}`);
console.log(`h2 на странице: ${count(/<h2/g)}`);
console.log(`Секция «задача»: ${has('id="task"')}`);
console.log(`Секция «до/после»: ${has('id="before-after"')}`);
console.log(`Секция «результат»: ${has('id="result"')}`);
console.log(`Секция «состав работ»: ${has('id="works"')}`);
// Класс кнопки идет вместе с js-хуком (case-gallery-trigger js-lb),
// поэтому сравниваем по началу значения, а не по всему атрибуту.
console.log(`Просмотрщик: ${has('id="lightbox"')}`);
console.log(`Кнопок галереи: ${count(/class="case-gallery-trigger/g)}`);
console.log(`Ключевых фактов: ${count(/class="case-fact"/g)}`);
console.log(`Хлебные крошки: ${has('breadcrumbs')}`);
console.log(`Разметка Schema.org: ${has('"@type":"CreativeWork"') || has('"@type": "CreativeWork"')}`);

console.log(`\nБитых путей: ${missing}, проблем с alt: ${noAlt}`);
if (problems.length) {
  console.log('\nСписок проблем:');
  problems.slice(0, 40).forEach((p) => console.log(`  - ${p}`));
} else {
  console.log('Проблем не найдено.');
}
