const sharp = require('sharp');
const DIR = 'E:/YandexDisk/0. Kovtun.studio/02. \u041f\u043e\u0440\u0442\u0444\u043e\u043b\u0438\u043e/\u0423\u043f\u0430\u043a\u043e\u0432\u043a\u0430/Green Power/\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u043c\u0430\u0441\u043b\u0430 2024/';
const FILES = [
  { f: 'GP-\u041c\u0430\u0441\u043b\u0430-\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430-250\u043c\u043b-125\u0445130.png', wmm: 125, hmm: 130, col: [3, 36, 34, 96], right: [70, 122, 34, 62] },
  { f: 'GP-\u041c\u0430\u0441\u043b\u0430-\u041b\u044c\u043d\u044f\u043d\u043e\u0435-100\u043c\u043b-100\u044580.png', wmm: 100, hmm: 80, col: [2, 30, 24, 60], right: [58, 98, 24, 46] },
];
const TH = 80;

async function load(item) {
  const img = sharp(DIR + item.f);
  const meta = await img.metadata();
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, CH = info.channels;
  const black = new Uint8Array(W * H);
  for (let i = 0, p = 0; p < W * H; p++, i += CH) {
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    black[p] = (data[i + 3] > 128 && lum < TH) ? 1 : 0;
  }
  return { black, W, H, meta, mx: W / item.wmm, my: H / item.hmm };
}

function comps(black, W, H, minPx) {
  const seen = new Uint8Array(W * H), out = [];
  const qx = new Int32Array(W * H), qy = new Int32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (!black[p] || seen[p]) continue;
    let head = 0, tail = 0; qx[0] = x; qy[0] = y; tail = 1; seen[p] = 1;
    let a = x, b = x, c = y, d = y, n = 0;
    while (head < tail) {
      const cx = qx[head], cy = qy[head]; head++; n++;
      if (cx < a) a = cx; if (cx > b) b = cx; if (cy < c) c = cy; if (cy > d) d = cy;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const np = ny * W + nx;
        if (black[np] && !seen[np]) { seen[np] = 1; qx[tail] = nx; qy[tail] = ny; tail++; }
      }
    }
    if (n >= minPx) out.push({ a, b, c, d, n });
  }
  return out;
}

function lines(black, W, mx, my, win, tag) {
  const [x0mm, x1mm, y0mm, y1mm] = win;
  const x0 = Math.round(x0mm * mx), x1 = Math.round(x1mm * mx);
  const y0 = Math.round(y0mm * my), y1 = Math.round(y1mm * my);
  const prof = [];
  for (let y = y0; y <= y1; y++) { let s = 0; for (let x = x0; x <= x1; x++) s += black[y * W + x]; prof.push(s); }
  const bands = []; let cur = null;
  for (let i = 0; i < prof.length; i++) {
    if (prof[i] > 0) { if (!cur) cur = { i0: i, i1: i }; cur.i1 = i; }
    else if (cur) { bands.push(cur); cur = null; }
  }
  if (cur) bands.push(cur);
  console.log('\n-- ' + tag + ' : строки текста в окне x[' + x0mm + '-' + x1mm + '] y[' + y0mm + '-' + y1mm + '] мм --');
  console.log('   (полная высота строки = от верха выносных до низа; x-height = зона, где чернил >= 45% максимума)');
  bands.forEach((bd, k) => {
    const hAll = (bd.i1 - bd.i0 + 1) / my;
    if (hAll < 0.25) return;
    let mx2 = 0; for (let i = bd.i0; i <= bd.i1; i++) mx2 = Math.max(mx2, prof[i]);
    let f = -1, l = -1;
    for (let i = bd.i0; i <= bd.i1; i++) if (prof[i] >= mx2 * 0.45) { if (f < 0) f = i; l = i; }
    const xh = (l - f + 1) / my;
    console.log('   line ' + String(k).padStart(2) + ' y=' + (y0mm + bd.i0 / my).toFixed(1) + 'мм' +
      ' | вся строка ' + hAll.toFixed(2) + 'мм | x-height ~ ' + xh.toFixed(2) + 'мм' + (xh < 0.8 ? '  <-- НИЖЕ 0,8' : ''));
  });
}

async function analyze(item) {
  const { black, W, H, meta, mx, my } = await load(item);
  console.log('\n=============================================');
  console.log('FILE:', item.f);
  console.log('заявлено', item.wmm + 'x' + item.hmm, 'мм | пикселей', W + 'x' + H, '| density', meta.density, '| dpi', (mx * 25.4).toFixed(0));

  const all = comps(black, W, H, 6);
  // barcode bars: narrow, tall, solid
  const bars = all.filter(c => {
    const w = (c.b - c.a + 1) / mx, h = (c.d - c.c + 1) / my;
    const fill = c.n / ((c.b - c.a + 1) * (c.d - c.c + 1));
    return fill > 0.92 && w < 1.6 && h > 3 && h / w > 4;
  });
  if (bars.length > 5) {
    const a = Math.min(...bars.map(b => b.a)), b = Math.max(...bars.map(z => z.b));
    const c = Math.min(...bars.map(z => z.c)), d = Math.max(...bars.map(z => z.d));
    const wmm = (b - a + 1) / mx, hmm = (d - c + 1) / my;
    const minBar = Math.min(...bars.map(z => (z.b - z.a + 1) / mx));
    console.log('\n-- ШТРИХКОД --');
    console.log('   полос найдено:', bars.length);
    console.log('   область: x=' + (a / mx).toFixed(1) + 'мм y=' + (c / my).toFixed(1) + 'мм');
    console.log('   ширина ' + wmm.toFixed(2) + 'мм | высота полос ' + hmm.toFixed(2) + 'мм | узкий модуль X ~ ' + minBar.toFixed(3) + 'мм');
    console.log('   ГОСТ 100%: 37,29 x 25,93мм, высота полос 22,85мм, X=0,33мм');
    console.log('   масштаб по ширине: ' + (wmm / 37.29 * 100).toFixed(0) + '% | по высоте полос: ' + (hmm / 22.85 * 100).toFixed(0) + '%');
    console.log('   допустимый диапазон 80-200%');
    let lf = 1e9, rt = 1e9;
    for (let y = c; y <= d; y++) {
      for (let x = a - 1; x >= 0; x--) if (black[y * W + x]) { lf = Math.min(lf, a - x - 1); break; }
      for (let x = b + 1; x < W; x++) if (black[y * W + x]) { rt = Math.min(rt, x - b - 1); break; }
    }
    console.log('   свободная зона до чернил: слева ' + (lf > 1e8 ? (a / mx).toFixed(2) : (lf / mx).toFixed(2)) +
      'мм | справа ' + (rt > 1e8 ? ((W - 1 - b) / mx).toFixed(2) : (rt / mx).toFixed(2)) + 'мм');
    console.log('   норма свободных зон: слева 3,63мм справа 2,31мм при 100% (масштабируются вместе с кодом)');

    // EAC: components with near-equal heights, right under or near barcode, square-ish cluster
    const cand = all.filter(z => {
      const h = (z.d - z.c + 1) / my, w = (z.b - z.a + 1) / mx;
      return h > 3 && h < 15 && w > 0.8 && w < 6 && z.c > d;
    });
    if (cand.length >= 2) {
      const hs = cand.map(z => (z.d - z.c + 1) / my);
      const target = hs.sort((p, q) => p - q)[Math.floor(hs.length / 2)];
      const grp = cand.filter(z => Math.abs((z.d - z.c + 1) / my - target) < 0.4);
      const ga = Math.min(...grp.map(z => z.a)), gb = Math.max(...grp.map(z => z.b));
      const gc = Math.min(...grp.map(z => z.c)), gd = Math.max(...grp.map(z => z.d));
      console.log('\n-- ЗНАК EAC (кластер под штрихкодом) --');
      console.log('   элементов:', grp.length, '| x=' + (ga / mx).toFixed(1) + 'мм y=' + (gc / my).toFixed(1) + 'мм');
      console.log('   ширина ' + ((gb - ga + 1) / mx).toFixed(2) + 'мм | высота ' + ((gd - gc + 1) / my).toFixed(2) + 'мм');
      console.log('   соотношение ш/в ' + (((gb - ga + 1) / mx) / ((gd - gc + 1) / my)).toFixed(3) + ' (норма 1,000 — квадрат)');
      console.log('   норма: базовый размер не менее 5мм');
    }
  } else {
    console.log('\n-- штрихкод не опознан, полос:', bars.length);
  }

  lines(black, W, mx, my, item.col, '\u041b\u0415\u0412\u0410\u042f \u041a\u041e\u041b\u041e\u041d\u041a\u0410 (\u0441\u043e\u0441\u0442\u0430\u0432, \u0441\u0440\u043e\u043a, \u0445\u0440\u0430\u043d\u0435\u043d\u0438\u0435)');
  lines(black, W, mx, my, item.right, '\u041f\u0420\u0410\u0412\u0410\u042f \u041a\u041e\u041b\u041e\u041d\u041a\u0410 (\u0441\u0432\u043e\u0439\u0441\u0442\u0432\u0430)');
}

(async () => { for (const it of FILES) { try { await analyze(it); } catch (e) { console.log('ERR', e.message, e.stack); } } })();
