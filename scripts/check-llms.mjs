// Проверка перед сборкой: каждый опубликованный кейс и каждая статья блога
// должны иметь строку в public/llms.txt. Если чего-то нет — сборка падает.
// Запускается автоматически из npm run build (см. package.json).
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const llms = fs.readFileSync(path.join(root, 'public', 'llms.txt'), 'utf8');

const missing = [];

// 1. Редакционные кейсы: cases/published/*/case.md → slug из frontmatter
const publishedDir = path.join(root, 'cases', 'published');
for (const dir of fs.readdirSync(publishedDir)) {
  const caseFile = path.join(publishedDir, dir, 'case.md');
  if (!fs.existsSync(caseFile)) continue;
  const text = fs.readFileSync(caseFile, 'utf8');
  const slugMatch = text.match(/^slug:\s*(\S+)/m);
  if (!slugMatch) continue;
  if (/^draft:\s*true/m.test(text)) continue;
  const url = `/cases/${slugMatch[1]}/`;
  if (!llms.includes(url)) missing.push(`${url}  (кейс: ${dir})`);
}

// 2. Старые кейсы оклейки: src/data/cases.yaml → slug
const legacy = fs.readFileSync(path.join(root, 'src', 'data', 'cases.yaml'), 'utf8');
for (const m of legacy.matchAll(/^- slug:\s*(\S+)/gm)) {
  const url = `/cases/${m[1]}/`;
  if (!llms.includes(url)) missing.push(`${url}  (кейс из cases.yaml)`);
}

// 3. Статьи блога: src/content/blog/*.md → имя файла = slug
const blogDir = path.join(root, 'src', 'content', 'blog');
if (fs.existsSync(blogDir)) {
  for (const file of fs.readdirSync(blogDir)) {
    if (!file.endsWith('.md')) continue;
    const text = fs.readFileSync(path.join(blogDir, file), 'utf8');
    if (/^draft:\s*true/m.test(text)) continue;
    const url = `/blog/${file.replace(/\.md$/, '')}/`;
    if (!llms.includes(url)) missing.push(`${url}  (статья: ${file})`);
  }
}

if (missing.length) {
  console.error('\n[check-llms] В public/llms.txt не хватает строк:');
  for (const m of missing) console.error('  - ' + m);
  console.error('\nДобавь ссылку с короткой строкой-описанием в нужный раздел public/llms.txt и собери заново.\n');
  process.exit(1);
}
console.log('[check-llms] llms.txt покрывает все кейсы и статьи — ок');
