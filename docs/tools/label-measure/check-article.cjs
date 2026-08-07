const fs = require('node:fs');
const path = require('node:path');
const ROOT = 'F:/dev/design.kovtun.studio';
const PAGE = ROOT + '/dist/blog/chto-dolzhno-byt-na-etiketke/index.html';

const html = fs.readFileSync(PAGE, 'utf8');
console.log('страница:', (fs.statSync(PAGE).size / 1024).toFixed(0), 'KB');

// JSON-LD
const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
console.log('\n-- JSON-LD блоков:', ld.length);
for (const m of ld) {
  try {
    const o = JSON.parse(m[1]);
    const types = Array.isArray(o['@graph']) ? o['@graph'].map((x) => x['@type']) : [o['@type']];
    console.log('   OK  ' + JSON.stringify(types));
    const flat = Array.isArray(o['@graph']) ? o['@graph'] : [o];
    for (const n of flat) {
      if (n['@type'] === 'BlogPosting') {
        console.log('       headline:', String(n.headline).slice(0, 70));
        console.log('       image:', n.image);
        console.log('       datePublished:', n.datePublished);
      }
      if (n['@type'] === 'FAQPage') console.log('       вопросов в FAQPage:', (n.mainEntity || []).length);
    }
  } catch (e) {
    console.log('   ОШИБКА разбора:', e.message);
  }
}

// meta
const pick = (re) => (html.match(re) || [, '(нет)'])[1];
console.log('\n-- meta --');
console.log('   title:      ', pick(/<title>([^<]*)<\/title>/));
console.log('   description:', pick(/<meta name="description" content="([^"]*)"/).slice(0, 100));
console.log('   canonical:  ', pick(/<link rel="canonical" href="([^"]*)"/));
console.log('   og:image:   ', pick(/<meta property="og:image" content="([^"]*)"/));

// картинки
const imgs = [...new Set([...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]))];
console.log('\n-- картинки на странице:', imgs.length);
let bad = 0;
for (const src of imgs) {
  if (!src.startsWith('/')) { console.log('   внешняя:', src); continue; }
  const f = path.join(ROOT, 'dist', src);
  const ok = fs.existsSync(f);
  if (!ok) bad++;
  console.log('   ' + (ok ? 'есть   ' : 'НЕТ    ') + src +
    (ok ? '  ' + (fs.statSync(f).size / 1024).toFixed(0) + ' KB' : ''));
}

// внутренние ссылки
const links = [...new Set([...html.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1]))];
let badLinks = 0;
for (const href of links) {
  const p = href.endsWith('/') ? path.join(ROOT, 'dist', href, 'index.html') : path.join(ROOT, 'dist', href);
  if (!fs.existsSync(p)) { console.log('   БИТАЯ ссылка: ' + href); badLinks++; }
}
console.log('\n-- внутренних ссылок:', links.length, '| битых:', badLinks);
console.log('\nИТОГ: битых картинок', bad, ', битых ссылок', badLinks);
