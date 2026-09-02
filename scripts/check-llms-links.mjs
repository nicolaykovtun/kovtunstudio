// Проверка после сборки: каждая внутренняя ссылка из public/llms.txt должна
// вести на существующую страницу в dist. Обратную проверку — что каждый кейс
// и статья попали в llms.txt — делает scripts/check-llms.mjs перед сборкой.
//
// Зачем: llms.txt пишется для краулеров ИИ-поисковиков, и битый адрес в нем
// отдает 404 ровно тем, ради кого файл существует. Так было со статьей про
// MICKING: строка в llms.txt стояла, а статья лежала черновиком.
//
// Запускается автоматически из npm run build (см. package.json).
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const llmsPath = path.join(root, 'public', 'llms.txt');

if (!fs.existsSync(dist)) {
  console.error('[check-llms-links] Нет папки dist. Проверка идет после astro build.');
  process.exit(1);
}

const llms = fs.readFileSync(llmsPath, 'utf8');
const SITE = 'https://kovtun.studio';

// Собираем адреса из markdown-ссылок и из голого текста.
const urls = new Set();
for (const m of llms.matchAll(/\]\(([^)\s]+)\)/g)) urls.add(m[1]);
for (const m of llms.matchAll(/(?<![(\w])(https?:\/\/[^\s)<>"']+)/g)) urls.add(m[1]);

/** Внутренний адрес → путь от корня сайта. Внешние ссылки пропускаем. */
function toSitePath(url) {
  if (url.startsWith(SITE)) return url.slice(SITE.length) || '/';
  if (url.startsWith('/')) return url;
  return null; // t.me, mailto: и прочее чужое хозяйство
}

/** Файл, который отдаст статический хостинг по этому пути. */
function resolveFile(sitePath) {
  const clean = sitePath.replace(/[?#].*$/, '');
  const rel = clean.replace(/^\//, '');
  if (rel === '') return path.join(dist, 'index.html');
  if (path.extname(rel)) return path.join(dist, rel);
  return path.join(dist, rel, 'index.html');
}

const broken = [];
const missingAnchors = [];

for (const url of [...urls].sort()) {
  const sitePath = toSitePath(url);
  if (sitePath === null) continue;

  const file = resolveFile(sitePath);
  if (!fs.existsSync(file)) {
    broken.push(`${sitePath}  →  нет файла ${path.relative(root, file)}`);
    continue;
  }

  // Якорь должен существовать на странице, иначе ссылка ведет «в никуда».
  const hash = sitePath.match(/#([^?]+)$/);
  if (hash && path.extname(file) === '.html') {
    const html = fs.readFileSync(file, 'utf8');
    const id = hash[1];
    if (!html.includes(`id="${id}"`) && !html.includes(`name="${id}"`)) {
      missingAnchors.push(`${sitePath}  →  на странице нет id="${id}"`);
    }
  }
}

if (broken.length || missingAnchors.length) {
  console.error('\n[check-llms-links] В public/llms.txt битые внутренние ссылки:');
  for (const b of broken) console.error('  - ' + b);
  for (const a of missingAnchors) console.error('  - ' + a);
  console.error('\nЛибо поправь адрес в llms.txt, либо опубликуй страницу, на которую он ведет.\n');
  process.exit(1);
}

const checked = [...urls].filter((u) => toSitePath(u) !== null).length;
console.log(`[check-llms-links] Внутренних ссылок в llms.txt: ${checked}, все ведут на страницы в dist — ок`);
