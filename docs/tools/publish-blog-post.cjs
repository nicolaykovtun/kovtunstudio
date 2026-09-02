// Снимает с черновика статью блога и дописывает строку в public/llms.txt.
//
// Два режима:
//   node docs/tools/publish-blog-post.cjs <slug>   — одна статья, дату не смотрим
//   node docs/tools/publish-blog-post.cjs --due    — все статьи, у которых
//                                                    pubDate <= сегодня по UTC
//
// Строка для llms.txt берется из шапки статьи: title и description.
// Скрипт идемпотентный: повторный запуск ничего не сломает.
const fs = require('node:fs');
const path = require('node:path');

const arg = process.argv[2];
if (!arg) {
  console.error('Укажи slug или --due: node docs/tools/publish-blog-post.cjs chto-dolzhno-byt-na-etiketke');
  process.exit(1);
}

const root = process.cwd();
const blogDir = path.join(root, 'src', 'content', 'blog');
const llmsFile = path.join(root, 'public', 'llms.txt');

/** Дата публикации из шапки. Формат pubDate: 2026-08-17 или "2026-08-17". */
function readPubDate(text) {
  const m = text.match(/^pubDate:\s*['"]?(\d{4}-\d{2}-\d{2})/m);
  return m ? m[1] : null;
}

/** Черновики, у которых срок публикации уже наступил. Сравниваем строки ISO по UTC. */
function dueSlugs() {
  const today = new Date().toISOString().slice(0, 10);
  const due = [];
  for (const file of fs.readdirSync(blogDir)) {
    if (!file.endsWith('.md')) continue;
    const text = fs.readFileSync(path.join(blogDir, file), 'utf8');
    if (!/^draft:\s*true/m.test(text)) continue;
    const pubDate = readPubDate(text);
    if (!pubDate) {
      console.warn('Пропускаю ' + file + ': в шапке нет pubDate');
      continue;
    }
    if (pubDate <= today) due.push(file.replace(/\.md$/, ''));
  }
  return due;
}

/** Снимает draft и дописывает строку в llms.txt. Возвращает true, если что-то изменилось. */
function publish(slug) {
  const postFile = path.join(blogDir, slug + '.md');
  if (!fs.existsSync(postFile)) {
    console.error('Нет файла статьи: ' + postFile);
    process.exit(1);
  }

  let post = fs.readFileSync(postFile, 'utf8');
  let changed = false;

  // 1. снять черновик
  if (/^draft:\s*true\s*$/m.test(post)) {
    post = post.replace(/^draft:\s*true\s*\r?\n/m, '');
    fs.writeFileSync(postFile, post, 'utf8');
    console.log(slug + ': draft: true снят');
    changed = true;
  } else {
    console.log(slug + ': draft: true не найден, статья уже не черновик');
  }

  // 2. строка в llms.txt
  const url = 'https://kovtun.studio/blog/' + slug + '/';
  let llms = fs.readFileSync(llmsFile, 'utf8');
  if (llms.includes('/blog/' + slug + '/')) {
    console.log(slug + ': в llms.txt строка уже есть');
    return changed;
  }

  const title = (post.match(/^title:\s*"?(.+?)"?\s*$/m) || [, slug])[1];
  const descBlock = (post.match(/^description:\s*>-\s*\r?\n([\s\S]*?)\r?\n[a-zA-Z]/m) || [, ''])[1];
  let desc = descBlock.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(' ');
  // Стиль llms.txt: описание со строчной буквы и без точки в конце.
  desc = desc.replace(/\.$/, '');
  desc = desc.charAt(0).toLowerCase() + desc.slice(1);
  const line = '- [' + title + '](' + url + '): ' + desc;
  // Якорь ищем регуляркой: у файла могут быть переводы строк CRLF.
  const anchorRe = /\r?\n\r?\n## Разделы страниц/;
  const m = llms.match(anchorRe);
  if (!m) {
    console.error('Не нашел раздел «Разделы страниц» в llms.txt, вставь строку вручную:\n' + line);
    process.exit(1);
  }
  const eol = llms.includes('\r\n') ? '\r\n' : '\n';
  llms = llms.replace(anchorRe, eol + line + m[0]);
  fs.writeFileSync(llmsFile, llms, 'utf8');
  console.log(slug + ': в llms.txt добавлено:\n  ' + line);
  return true;
}

const slugs = arg === '--due' ? dueSlugs() : [arg];

if (!slugs.length) {
  console.log('Публиковать нечего: черновиков с наступившей датой нет.');
  process.exit(0);
}

let changed = false;
for (const slug of slugs) {
  if (publish(slug)) changed = true;
}

console.log(changed ? '\nГотово. Дальше: сборка, коммит, пуш.' : '\nИзменений нет.');
