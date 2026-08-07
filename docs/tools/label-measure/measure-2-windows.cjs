const sharp = require('sharp');
const DIR = 'E:/YandexDisk/0. Kovtun.studio/02. \u041f\u043e\u0440\u0442\u0444\u043e\u043b\u0438\u043e/\u0423\u043f\u0430\u043a\u043e\u0432\u043a\u0430/Green Power/\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u043c\u0430\u0441\u043b\u0430 2024/';
const TH = 80;
const JOBS = [
  { f: 'GP-\u041c\u0430\u0441\u043b\u0430-\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430-250\u043c\u043b-125\u0445130.png', wmm: 125, hmm: 130,
    wins: [['EAC', 20, 36, 114, 127], ['\u043d\u0438\u0437: \u043e\u0431\u044a\u0435\u043c \u0438 \u0437\u043d\u0430\u043a\u0438', 60, 90, 112, 126], ['\u0446\u0435\u043d\u0442\u0440: \u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435', 38, 90, 58, 92], ['\u043d\u0438\u0437: \u0430\u0434\u0440\u0435\u0441 \u0438\u0437\u0433\u043e\u0442\u043e\u0432\u0438\u0442\u0435\u043b\u044f', 88, 118, 100, 118]] },
  { f: 'GP-\u041c\u0430\u0441\u043b\u0430-\u041b\u044c\u043d\u044f\u043d\u043e\u0435-100\u043c\u043b-100\u044580.png', wmm: 100, hmm: 80,
    wins: [['EAC', 14, 28, 68, 79], ['\u043d\u0438\u0437: \u043e\u0431\u044a\u0435\u043c \u0438 \u0437\u043d\u0430\u043a\u0438', 44, 70, 66, 78], ['\u0446\u0435\u043d\u0442\u0440: \u043d\u0430\u0438\u043c\u0435\u043d\u043e\u0432\u0430\u043d\u0438\u0435', 30, 58, 34, 58], ['\u043d\u0438\u0437: \u0430\u0434\u0440\u0435\u0441 \u0438\u0437\u0433\u043e\u0442\u043e\u0432\u0438\u0442\u0435\u043b\u044f', 70, 96, 56, 70]] },
];

async function run(j) {
  const img = sharp(DIR + j.f);
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, CH = info.channels;
  const mx = W / j.wmm, my = H / j.hmm;
  const black = new Uint8Array(W * H);
  for (let i = 0, p = 0; p < W * H; p++, i += CH) {
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    black[p] = (data[i + 3] > 128 && lum < TH) ? 1 : 0;
  }
  console.log('\n===== ' + j.f + ' (' + j.wmm + 'x' + j.hmm + 'мм, ' + (mx * 25.4).toFixed(0) + ' dpi) =====');
  for (const [tag, x0mm, x1mm, y0mm, y1mm] of j.wins) {
    const x0 = Math.round(x0mm * mx), x1 = Math.min(W - 1, Math.round(x1mm * mx));
    const y0 = Math.round(y0mm * my), y1 = Math.min(H - 1, Math.round(y1mm * my));
    const prof = [];
    for (let y = y0; y <= y1; y++) { let s = 0; for (let x = x0; x <= x1; x++) s += black[y * W + x]; prof.push(s); }
    const bands = []; let cur = null;
    for (let i = 0; i < prof.length; i++) {
      if (prof[i] > 0) { if (!cur) cur = { i0: i, i1: i }; cur.i1 = i; }
      else if (cur) { bands.push(cur); cur = null; }
    }
    if (cur) bands.push(cur);
    console.log('\n-- ' + tag + '  окно x[' + x0mm + '-' + x1mm + '] y[' + y0mm + '-' + y1mm + ']мм --');
    bands.forEach((bd, k) => {
      const hAll = (bd.i1 - bd.i0 + 1) / my;
      if (hAll < 0.3) return;
      let m = 0; for (let i = bd.i0; i <= bd.i1; i++) m = Math.max(m, prof[i]);
      let f = -1, l = -1;
      for (let i = bd.i0; i <= bd.i1; i++) if (prof[i] >= m * 0.45) { if (f < 0) f = i; l = i; }
      // ширина чернил в этой полосе
      let a = W, b = -1;
      for (let y = y0 + bd.i0; y <= y0 + bd.i1; y++) for (let x = x0; x <= x1; x++) if (black[y * W + x]) { if (x < a) a = x; if (x > b) b = x; }
      console.log('   ' + String(k).padStart(2) + ' y=' + (y0mm + bd.i0 / my).toFixed(1) + 'мм' +
        ' | высота ' + hAll.toFixed(2) + 'мм | x-height ~' + ((l - f + 1) / my).toFixed(2) + 'мм' +
        ' | ширина чернил ' + ((b - a + 1) / mx).toFixed(2) + 'мм от x=' + (a / mx).toFixed(1) + 'мм');
    });
  }
}
(async () => { for (const j of JOBS) { try { await run(j); } catch (e) { console.log('ERR', e.message); } } })();
