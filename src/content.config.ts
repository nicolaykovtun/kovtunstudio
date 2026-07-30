// Коллекция кейсов. Источник правды — папки в /cases: case.md с текстом
// и gallery.yaml с раскладкой изображений. Никакого дублирования контента
// между рабочей папкой проекта и сайтом.
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { defineCollection, z } from 'astro:content';
import type { Loader } from 'astro/loaders';

import { parseCaseBody } from './lib/case-content';

const CASES_DIR = path.resolve('./cases');

/** Отделяет YAML-шапку от тела markdown. */
function splitFrontmatter(raw: string): { data: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw.replace(/^﻿/, ''));
  if (!match) return { data: {}, body: raw };
  return {
    data: (yaml.load(match[1]) as Record<string, unknown>) ?? {},
    body: match[2],
  };
}

function readGallery(dir: string): Record<string, unknown> | undefined {
  const file = path.join(dir, 'gallery.yaml');
  if (!fs.existsSync(file)) return undefined;
  return (yaml.load(fs.readFileSync(file, 'utf8')) as Record<string, unknown>) ?? undefined;
}

/** Папки кейсов, где лежит заполненный case.md. */
function findCaseFiles(): string[] {
  if (!fs.existsSync(CASES_DIR)) return [];
  return fs
    .readdirSync(CASES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(CASES_DIR, entry.name, 'case.md'))
    .filter((file) => fs.existsSync(file));
}

const caseLoader: Loader = {
  name: 'kovtun-cases',
  load: async ({ store, parseData, generateDigest, watcher, logger }) => {
    const sync = async () => {
      store.clear();
      for (const file of findCaseFiles()) {
        const raw = fs.readFileSync(file, 'utf8');
        const { data, body } = splitFrontmatter(raw);
        const slug = typeof data.slug === 'string' ? data.slug : null;

        if (!slug) {
          logger.warn(`Пропускаю ${path.relative(CASES_DIR, file)}: в шапке нет slug`);
          continue;
        }

        const entry = {
          ...data,
          ...parseCaseBody(body),
          sourceDir: path.relative(process.cwd(), path.dirname(file)).replace(/\\/g, '/'),
          gallery: readGallery(path.dirname(file)),
        };

        try {
          const parsed = await parseData({ id: slug, data: entry, filePath: file });
          store.set({ id: slug, data: parsed, digest: generateDigest(entry) });
        } catch (error) {
          logger.error(`Кейс ${slug}: ${(error as Error).message}`);
          throw error;
        }
      }
      logger.info(`Кейсов загружено: ${store.keys().length}`);
    };

    await sync();

    if (watcher) {
      watcher.add(CASES_DIR);
      const onChange = (changed: string) => {
        if (!/case\.md$|gallery\.yaml$/.test(changed)) return;
        sync().catch((error) => logger.error(String(error)));
      };
      watcher.on('change', onChange);
      watcher.on('add', onChange);
      watcher.on('unlink', onChange);
    }
  },
};

const galleryItem = z.object({
  file: z.string(),
  label: z.string(),
  /** Пропорции миниатюры: широкие экраны сайта режем по высоте. */
  tall: z.boolean().optional(),
});

const galleryGroup = z.object({
  id: z.string(),
  title: z.string(),
  intro: z.string().optional(),
  /**
   * Раскладка плиток. По умолчанию выбирается сама: `tall`, если хоть у одного
   * элемента стоит tall, иначе `screens`. Задавать вручную нужно там, где
   * автоматика промахивается — например, у страниц гайдбука 16:9: в `tall`
   * они летербоксятся до половины плитки, а `slides` показывает их целиком.
   */
  layout: z.enum(['screens', 'tall', 'slides', 'brochure', 'portrait']).optional(),
  items: z.array(galleryItem).min(1),
});

const comparisonItem = z.object({
  number: z.string(),
  title: z.string(),
  text: z.string(),
  before: z.string(),
  after: z.string(),
  beforeAlt: z.string(),
  afterAlt: z.string(),
  beforeCaption: z.string().default('Вайрфрейм / до'),
  afterCaption: z.string().default('Дизайн / после'),
});

/**
 * Соседний кейс того же клиента. Нужен, когда одна работа разложена
 * на несколько страниц: сайт отдельно, фирменный стиль отдельно.
 * slug ищется среди опубликованных кейсов, заголовок и обложка берутся оттуда.
 */
const relatedItem = z.object({
  slug: z.string(),
  label: z.string(),
  text: z.string(),
});

const cases = defineCollection({
  loader: caseLoader,
  schema: z.object({
    // Шапка case.md
    slug: z.string(),
    category: z.enum(['websites', 'presentations', 'identity', 'packaging', 'car-wrap', 'print']),
    categoryLabel: z.string(),
    segment: z.string(),
    segmentLabel: z.string(),
    client: z.string(),
    year: z.union([z.number(), z.string()]).transform(String),
    location: z.string().optional(),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'accent должен быть HEX вида #RRGGBB'),
    publicationPermission: z.string(),
    /** Какой набор секций рисовать. По умолчанию — по направлению кейса. */
    template: z.enum(['web', 'presentation', 'identity', 'packaging']).optional(),
    draft: z.boolean().default(false),
    /**
     * Обложка для карточки в списке кейсов. Кейсам на шаблоне не нужна —
     * там берется из gallery.yaml. Заполняется у старых кейсов, которые
     * пока рендерятся рукописными страницами.
     */
    cover: z.string().optional(),
    coverAlt: z.string().optional(),

    // Тело case.md
    // Мягкие требования: старые кейсы еще живут на рукописных страницах и
    // заполнены не по всем разделам. Полноту требуем в шаблоне — от тех,
    // у кого есть gallery.yaml.
    title: z.string().min(1, 'нет заголовка первого уровня'),
    shortTitle: z.string().default(''),
    summary: z.string().default(''),
    seoDescription: z.string().default(''),
    services: z.array(z.string()).default([]),
    facts: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    task: z.array(z.string()).default([]),
    solutions: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    result: z.array(z.string()).default([]),
    deliverables: z.array(z.string()).default([]),
    quote: z.string().optional(),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
    agency: z.string().optional(),
    links: z.array(z.object({ label: z.string(), value: z.string() })),
    publicationNotes: z.string().optional(),
    sourceDir: z.string(),

    // gallery.yaml
    gallery: z
      .object({
        assetRoot: z.string(),
        cover: z.object({ src: z.string(), alt: z.string() }),
        og: z.string().optional(),
        ogAlt: z.string().optional(),
        intro: z.string().optional(),
        compare: z
          .object({
            title: z.string(),
            intro: z.string().optional(),
            items: z.array(comparisonItem).min(1),
          })
          .optional(),
        groups: z.array(galleryGroup).default([]),
        related: z
          .object({
            title: z.string(),
            intro: z.string().optional(),
            items: z.array(relatedItem).min(1),
          })
          .optional(),
        resultTitle: z.string().optional(),
        ctaTitle: z.string().optional(),
        ctaText: z.string().optional(),
        ctaButton: z.string().optional(),
        keywords: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { cases };
