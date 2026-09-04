import fs from 'node:fs';
import path from 'node:path';

/**
 * srcset для обложки кейса на карточке.
 *
 * Обложки редакционных кейсов лежат одним размером; уменьшенную копию
 * <name>-800.webp рядом с ней делает scripts/make-cover-sizes.mjs. Если копии
 * нет, возвращаем undefined и браузер берет обычный src — карточка не ломается.
 * Архивные обложки оклейки живут в /assets/portfolio/full/, у них есть готовый
 * thumb того же имени.
 */
export function coverSrcset(src: string): string | undefined {
  const file = path.join('public', src);
  if (src.startsWith('/assets/portfolio/full/')) {
    const wide = webpWidth(file) ?? 2400;
    // Часть архивных обложек оклейки живет в родном размере исходника — он
    // местами меньше превью на 800 px. Тогда второй кандидат браузеру не нужен.
    if (wide <= 800) return undefined;
    return `${src.replace('/full/', '/thumb/')} 800w, ${src} ${wide}w`;
  }
  const small = src.replace(/\.webp$/, '-800.webp');
  if (small !== src && fs.existsSync(path.join('public', small))) {
    return `${small} 800w, ${src} ${webpWidth(file) ?? 1600}w`;
  }
  return undefined;
}

/**
 * Ширина webp из заголовка файла.
 *
 * Раньше здесь стояло 1600 числом, а обложки лежат разные: 1600, 1920, 2400.
 * Браузер верил числу и на широком экране мог взять картинку меньше нужной.
 * Читаем настоящий размер: три вида чанка webp хранят его по-разному.
 * Не разобрали — возвращаем undefined, и вызов подставит прежние 1600.
 */
function webpWidth(file: string): number | undefined {
  let head: Buffer;
  try {
    const fd = fs.openSync(file, 'r');
    head = Buffer.alloc(30);
    fs.readSync(fd, head, 0, 30, 0);
    fs.closeSync(fd);
  } catch {
    return undefined;
  }
  if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WEBP') {
    return undefined;
  }
  switch (head.toString('ascii', 12, 16)) {
    case 'VP8 ': // с потерями: ширина в заголовке кадра, старшие два бита служебные
      return head.readUInt16LE(26) & 0x3fff;
    case 'VP8L': // без потерь: ширина минус один в первых 14 битах после сигнатуры
      return (head.readUInt32LE(21) & 0x3fff) + 1;
    case 'VP8X': // расширенный (альфа, анимация): размер холста тремя байтами
      return (head.readUIntLE(24, 3) & 0xffffff) + 1;
    default:
      return undefined;
  }
}

/** Карточка кейса: одна колонка на телефоне, две на планшете, треть экрана на десктопе. */
export const coverSizes = '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw';
