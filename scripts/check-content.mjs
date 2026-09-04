/**
 * Проверка правил из docs/case-pipeline.md на собранных страницах.
 *
 * Смысл: правила, записанные только словами, забываются от захода к заходу.
 * Здесь проверяется то, что можно проверить машиной, и сборка падает, если
 * правило нарушено. Запускается из `npm run build` после `astro build`.
 *
 * Что ловим:
 *   1. title длиннее 65 знаков — поисковик обрежет его на середине мысли;
 *   2. description вне 70–165 знаков — обрезанный сниппет теряет цифры и призыв;
 *   3. картинку без атрибута alt — она невидима для поиска и скринридера;
 *   4. не ровно один h1 на странице.
 *
 * Пустой alt="" допустим и считается декоративной картинкой: он выводится
 * в сводке, но сборку не роняет.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const TITLE_MAX = 65;
const DESC_MIN = 70;
const DESC_MAX = 165;

if (!fs.existsSync(DIST)) {
  console.error('[check-content] нет папки dist — запускать после astro build');
  process.exit(1);
}

/** Все index.html в dist, кроме служебных инструментов. */
function pages(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tools' || entry.name === '_assets') continue;
      pages(full, found);
    } else if (entry.name === 'index.html') {
      found.push(full);
    }
  }
  return found;
}

const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');

const errors = [];
let decorative = 0;
let checked = 0;

for (const file of pages(DIST)) {
  const url = '/' + path.relative(DIST, path.dirname(file)).replace(/\\/g, '/');
  const at = url === '/.' ? '/' : url + '/';
  const html = fs.readFileSync(file, 'utf8');
  if (!/<head[\s>]/.test(html)) continue; // редиректы без head
  checked++;

  const title = html.match(/<title>([\s\S]*?)<\/title>/);
  if (!title) {
    errors.push(`${at} — нет <title>`);
  } else {
    const value = decode(title[1]).trim();
    if (value.length > TITLE_MAX) {
      errors.push(`${at} — title ${value.length} знаков, максимум ${TITLE_MAX}: «${value}»`);
    }
  }

  const desc = html.match(/<meta name="description" content="([^"]*)"/);
  if (!desc) {
    errors.push(`${at} — нет meta description`);
  } else {
    const value = decode(desc[1]).trim();
    if (value.length < DESC_MIN || value.length > DESC_MAX) {
      errors.push(`${at} — description ${value.length} знаков, нужно ${DESC_MIN}–${DESC_MAX}`);
    }
  }

  const main = html.match(/<main[\s\S]*?<\/main>/);
  const body = main ? main[0] : html;

  const h1 = body.match(/<h1[\s>]/g) || [];
  if (h1.length !== 1) errors.push(`${at} — h1 на странице: ${h1.length}, нужен ровно один`);

  for (const img of body.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt=/.test(img)) {
      errors.push(`${at} — картинка без атрибута alt: ${img.slice(0, 90)}`);
    } else if (/\salt=""/.test(img)) {
      decorative++;
    }
  }
}

const summary = `страниц проверено: ${checked}, декоративных картинок с пустым alt: ${decorative}`;

if (errors.length) {
  console.error(`[check-content] нарушений: ${errors.length} (${summary})`);
  for (const line of errors) console.error('  ' + line);
  console.error('\nПравила — docs/case-pipeline.md, разделы «Мета и картинки» и «Верстка блоков».');
  process.exit(1);
}

console.log(`[check-content] правила меты и картинок соблюдены — ок (${summary})`);
