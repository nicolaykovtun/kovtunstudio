/**
 * Обложки кейсов одним списком — для превью, которое всплывает под курсором.
 *
 * Строки «С кем работаю», «Направления каталога», «Пять задач» и цепочки
 * возвращающихся клиентов показывают при наведении обложку кейса. Собирать ее
 * на каждой странице заново нельзя: источников два — редакционные кейсы из
 * cases/ и архив оклейки из cases.yaml, — и они по-разному хранят путь к
 * картинке. Здесь оба приводятся к одному виду, в каноническом порядке
 * каталога, поэтому «первый кейс направления» везде значит одно и то же.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { getCollection } from 'astro:content';

import { caseOrderIndex, directionByCategory, sphereBySegment } from '../data/case-catalog';
import { editorialCaseConfigs } from '../data/case-page-config';
import { previewSrc } from './covers';

export interface CaseCover {
  slug: string;
  /** Короткое имя проекта — подпись превью и alt картинки. */
  name: string;
  src: string;
  alt: string;
  direction?: string;
  sphereKey?: string;
}

let cache: CaseCover[] | null = null;

/** Все кейсы с обложкой, в каноническом порядке каталога. */
export async function caseCovers(): Promise<CaseCover[]> {
  if (cache) return cache;

  const legacyCases = yaml.load(
    fs.readFileSync(path.resolve('./src/data/cases.yaml'), 'utf8'),
  ) as any[];

  const legacy: CaseCover[] = legacyCases.map((c) => ({
    slug: c.slug,
    name: c.name,
    src: previewSrc(`/assets/portfolio/thumb/${c.cover}.webp`),
    alt: c.images?.find((image: any) => image.id === c.cover)?.caption ?? c.title ?? c.name,
    direction: c.direction ?? directionByCategory[c.category],
    sphereKey: c.sphereKey,
  }));

  const editorial: CaseCover[] = [];
  for (const entry of await getCollection('cases', ({ data }) => !data.draft)) {
    const c = entry.data;
    const cover = c.gallery
      ? { src: `${c.gallery.assetRoot}/${c.gallery.cover.src}`, alt: c.gallery.cover.alt }
      : editorialCaseConfigs[entry.id]?.cover;
    if (!cover) continue;
    editorial.push({
      slug: c.slug,
      name: c.shortTitle || c.client,
      src: previewSrc(cover.src),
      alt: cover.alt,
      direction: directionByCategory[c.category],
      sphereKey: sphereBySegment[c.segment] ?? c.segment,
    });
  }

  cache = [...legacy, ...editorial].sort((a, b) => caseOrderIndex(a.slug) - caseOrderIndex(b.slug));
  return cache;
}

/** Обложка по слагу кейса. */
export async function caseCoverBySlug(): Promise<Record<string, CaseCover>> {
  return Object.fromEntries((await caseCovers()).map((c) => [c.slug, c]));
}

/**
 * Обложка для строки списка, у которой своего кейса нет: сфера бизнеса или
 * направление каталога. Берется первый кейс группы по канону — тот же, что
 * стоит первым в портфолио, так что превью и выдача не расходятся.
 */
export function coverFor(
  covers: CaseCover[],
  field: 'direction' | 'sphereKey',
  key: string,
): CaseCover | undefined {
  return covers.find((c) => c[field] === key);
}
