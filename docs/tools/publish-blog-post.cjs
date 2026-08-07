// Снимает с черновика статью блога и дописывает строку в public/llms.txt.
// Запуск: node docs/tools/publish-blog-post.cjs <slug>
// Строка для llms.txt берется из шапки статьи: title и description.
// Скрипт идемпотентный: повторный запуск ничего не сломает.
const fs = require('node:fs');
const path = require('node:path');

const slug = process.argv[2];
if (!slug) { console.error('Укажи slug: node docs/tools/publish-blog-post.cjs chto-dolzhno-byt-na-etiketke'); process.exit(1); }

const root = process.cwd();
const postFile = path.join(root, 'src', 'content', 'blog', slug + '.md');
const llmsFile = path.join(root, 'public', 'llms.txt');

if (!fs.existsSync(postFile)) { console.error('Нет файла статьи: ' + postFile); process.exit(1); }

let post = fs.readFileSync(postFile, 'utf8');

// 1. снять черновик
if (/^draft:\s*true\s*$/m.test(post)) {
  post = post.replace(/^draft:\s*true\s*\r?\n/m, '');
  fs.writeFileSync(postFile, post, 'utf8');
  console.log('draft: true снят');
} else {
  console.log('draft: true не найден, статья уже не черновик');
}

// 2. строка в llms.txt
const url = 'https://design.kovtun.studio/blog/' + slug + '/';
let llms = fs.readFileSync(llmsFile, 'utf8');
if (llms.includes('/blog/' + slug + '/')) {
  console.log('в llms.txt строка уже есть');
} else {
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
  if (!m) { console.error('Не нашел раздел «Разделы страниц» в llms.txt, вставь строку вручную:\n' + line); process.exit(1); }
  const eol = llms.includes('\r\n') ? '\r\n' : '\n';
  llms = llms.replace(anchorRe, eol + line + m[0]);
  fs.writeFileSync(llmsFile, llms, 'utf8');
  console.log('в llms.txt добавлено:\n  ' + line);
}

console.log('\nГотово. Дальше: сборка, коммит, пуш.');
