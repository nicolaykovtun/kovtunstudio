// Разведка исходников кейсов: размеры, вес, соотношение сторон.
// Запуск: node tmp/scan-cases.mjs [часть имени папки]
// Без аргумента печатает все папки кейсов из cases/published и cases/unpublished.
// С аргументом — только те, чье имя его содержит: node tmp/scan-cases.mjs greatway
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('cases');
const filter = (process.argv[2] ?? '').toLowerCase();

/** Папки кейсов внутри групп published/ и unpublished/. */
function findCaseDirs() {
  const out = [];
  for (const group of fs.readdirSync(root, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    const groupDir = path.join(root, group.name);
    for (const entry of fs.readdirSync(groupDir, { withFileTypes: true })) {
      if (entry.isDirectory()) out.push(path.join(group.name, entry.name));
    }
  }
  return out.sort();
}

const targets = findCaseDirs().filter((name) => name.toLowerCase().includes(filter));
if (!targets.length) {
  console.log(filter ? `Ничего не нашлось по «${filter}»` : 'В cases/ нет папок кейсов');
}

const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (exts.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

for (const t of targets) {
  const dir = path.join(root, t);
  if (!fs.existsSync(dir)) {
    console.log(`\n### ${t}\n  ПАПКИ НЕТ`);
    continue;
  }
  const files = walk(dir).sort();
  console.log(`\n### ${t} — ${files.length} файлов`);
  for (const f of files) {
    const stat = fs.statSync(f);
    let meta;
    try {
      meta = await sharp(f).metadata();
    } catch (e) {
      console.log(`  ${path.relative(dir, f)} — ОШИБКА ЧТЕНИЯ: ${e.message}`);
      continue;
    }
    const mb = (stat.size / 1024 / 1024).toFixed(1);
    const ratio = (meta.height / meta.width).toFixed(1);
    console.log(
      `  ${path.relative(dir, f)} | ${meta.width}x${meta.height} | h/w ${ratio} | ${mb} MB`,
    );
  }
}
