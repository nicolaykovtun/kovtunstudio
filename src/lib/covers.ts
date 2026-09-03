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
  if (src.startsWith('/assets/portfolio/full/')) {
    return `${src.replace('/full/', '/thumb/')} 800w, ${src} 2400w`;
  }
  const small = src.replace(/\.webp$/, '-800.webp');
  if (small !== src && fs.existsSync(path.join('public', small))) {
    return `${small} 800w, ${src} 1600w`;
  }
  return undefined;
}

/** Карточка кейса: одна колонка на телефоне, две на планшете, треть экрана на десктопе. */
export const coverSizes = '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw';
