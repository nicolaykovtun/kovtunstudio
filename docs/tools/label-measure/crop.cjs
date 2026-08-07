const sharp = require('sharp');
const DIR = 'E:/YandexDisk/0. Kovtun.studio/02. \u041f\u043e\u0440\u0442\u0444\u043e\u043b\u0438\u043e/\u0423\u043f\u0430\u043a\u043e\u0432\u043a\u0430/Green Power/\u042d\u0442\u0438\u043a\u0435\u0442\u043a\u0438 \u043c\u0430\u0441\u043b\u0430 2024/';
const F = 'GP-\u041c\u0430\u0441\u043b\u0430-\u041a\u0435\u0434\u0440\u043e\u0432\u043e\u0433\u043e \u043e\u0440\u0435\u0445\u0430-250\u043c\u043b-125\u0445130.png';
(async () => {
  const img = sharp(DIR + F);
  const m = await img.metadata();
  const mx = m.width / 125, my = m.height / 130;
  // низ-лево: 0..45мм по X, 100..130мм по Y
  const left = Math.round(0 * mx), top = Math.round(100 * my);
  const w = Math.round(45 * mx), h = Math.round(30 * my);
  await sharp(DIR + F).extract({ left, top, width: w, height: h })
    .flatten({ background: '#ffffff' })
    .resize({ width: w * 3, kernel: 'nearest' })
    .png().toFile('F:/dev/design.kovtun.studio/_crop-bc.png');
  console.log('crop saved', w, h, '-> x3');
})();
