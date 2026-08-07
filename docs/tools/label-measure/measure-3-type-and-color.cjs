const sharp = require('sharp');
const DIR = 'E:/YandexDisk/0. Kovtun.studio/02. \u041f\u043e\u0440\u0442\u0444\u043e\u043b\u0438\u043e/\u0423\u043f\u0430\u043a\u043e\u0432\u043a\u0430/Green Power/\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u043c\u0430\u0441\u043b\u0430 2024/';
const JOBS = [
  { f: 'GP-\u041c\u0430\u0441\u043b\u0430-\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430-250\u043c\u043b-125\u0445130.png', wmm: 125, hmm: 130,
    wins: [['\u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 + \u0432\u044b\u0441\u0448\u0438\u0439 \u0441\u043e\u0440\u0442', 40, 88, 66, 92], ['\u043f\u043e\u0434\u043f\u0438\u0441\u0438 \u043b\u0435\u0432\u043e\u0439 \u043a\u043e\u043b\u043e\u043d\u043a\u0438', 4, 34, 38, 92], ['\u0430\u0434\u0440\u0435\u0441 \u0431\u0435\u0437 QR', 91, 112, 102, 116], ['\u0442\u0435\u043b\u0435\u0444\u043e\u043d', 91, 122, 116, 126]] },
  { f: 'GP-\u041c\u0430\u0441\u043b\u0430-\u041b\u044c\u043d\u044f\u043d\u043e\u0435-100\u043c\u043b-100\u044580.png', wmm: 100, hmm: 80,
    wins: [['\u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435 + \u0432\u044b\u0441\u0448\u0438\u0439 \u0441\u043e\u0440\u0442', 32, 58, 40, 60], ['\u043f\u043e\u0434\u043f\u0438\u0441\u0438 \u043b\u0435\u0432\u043e\u0439 \u043a\u043e\u043b\u043e\u043d\u043a\u0438', 2, 28, 26, 60], ['\u0430\u0434\u0440\u0435\u0441 \u0431\u0435\u0437 QR', 74, 92, 56, 68], ['\u0442\u0435\u043b\u0435\u0444\u043e\u043d', 74, 98, 68, 78]] },
];

function lum(r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function rel(c) { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); }
function contrast(r, g, b) {
  const L = 0.2126 * rel(r) + 0.7152 * rel(g) + 0.0722 * rel(b);
  return (1.05) / (L + 0.05);
}

async function run(j) {
  const { data, info } = await sharp(DIR + j.f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, CH = info.channels;
  const mx = W / j.wmm, my = H / j.hmm;
  // "ink" = anything clearly darker than paper, including caramel
  const ink = new Uint8Array(W * H);
  let cr = 0, cg = 0, cb = 0, cn = 0;
  for (let i = 0, p = 0; p < W * H; p++, i += CH) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    const L = lum(r, g, b);
    if (a > 128 && L < 215) ink[p] = 1;
    if (a > 128 && L > 130 && L < 195 && r > g && g > b && (r - b) > 55) { cr += r; cg += g; cb += b; cn++; }
  }
  console.log('\n===== ' + j.f + ' (' + j.wmm + 'x' + j.hmm + 'мм) =====');
  if (cn > 200) {
    const r = Math.round(cr / cn), g = Math.round(cg / cn), b = Math.round(cb / cn);
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
    console.log('карамельный на этикетке (среднее по ' + cn + ' пикселям): ' + hex +
      ' | контраст к белому ' + contrast(r, g, b).toFixed(2) + ':1');
    console.log('   для сравнения: гайдбук PANTONE 728 C = #CEA074, контраст 2,36:1; норма WCAG для текста 4,5:1');
  }
  for (const [tag, x0mm, x1mm, y0mm, y1mm] of j.wins) {
    const x0 = Math.round(x0mm * mx), x1 = Math.min(W - 1, Math.round(x1mm * mx));
    const y0 = Math.round(y0mm * my), y1 = Math.min(H - 1, Math.round(y1mm * my));
    const prof = [];
    for (let y = y0; y <= y1; y++) { let s = 0; for (let x = x0; x <= x1; x++) s += ink[y * W + x]; prof.push(s); }
    const bands = []; let cur = null;
    for (let i = 0; i < prof.length; i++) {
      if (prof[i] > 0) { if (!cur) cur = { i0: i, i1: i }; cur.i1 = i; }
      else if (cur) { bands.push(cur); cur = null; }
    }
    if (cur) bands.push(cur);
    console.log('\n-- ' + tag + '  x[' + x0mm + '-' + x1mm + '] y[' + y0mm + '-' + y1mm + ']мм --');
    bands.forEach((bd, k) => {
      const hAll = (bd.i1 - bd.i0 + 1) / my;
      if (hAll < 0.3) return;
      let m = 0; for (let i = bd.i0; i <= bd.i1; i++) m = Math.max(m, prof[i]);
      let f = -1, l = -1;
      for (let i = bd.i0; i <= bd.i1; i++) if (prof[i] >= m * 0.45) { if (f < 0) f = i; l = i; }
      let a = W, b = -1;
      for (let y = y0 + bd.i0; y <= y0 + bd.i1; y++) for (let x = x0; x <= x1; x++) if (ink[y * W + x]) { if (x < a) a = x; if (x > b) b = x; }
      console.log('   ' + String(k).padStart(2) + ' y=' + (y0mm + bd.i0 / my).toFixed(1) +
        ' | высота полосы ' + hAll.toFixed(2) + 'мм | плотная зона ~' + ((l - f + 1) / my).toFixed(2) + 'мм' +
        ' | ширина ' + ((b - a + 1) / mx).toFixed(1) + 'мм');
    });
  }
}
(async () => { for (const j of JOBS) { try { await run(j); } catch (e) { console.log('ERR', e.message); } } })();
