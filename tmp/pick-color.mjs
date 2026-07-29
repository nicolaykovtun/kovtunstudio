// Достает средний цвет прямоугольной области макета — чтобы акцент в кейсе
// был снят с макета, а не подобран на глаз.
import sharp from 'sharp';

const [, , file, l, t, w, h] = process.argv;
const region = {
  left: Number(l),
  top: Number(t),
  width: Number(w),
  height: Number(h),
};

const buf = await sharp(file, { limitInputPixels: false })
  .extract(region)
  .removeAlpha()
  .raw()
  .toBuffer();

let r = 0;
let g = 0;
let b = 0;
const n = buf.length / 3;
for (let i = 0; i < buf.length; i += 3) {
  r += buf[i];
  g += buf[i + 1];
  b += buf[i + 2];
}
const hex = (v) => Math.round(v / n).toString(16).padStart(2, '0');
console.log(`#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase());
