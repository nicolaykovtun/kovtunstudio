// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://design.kovtun.studio',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      // На сайте одна страница, но плагин корректно делает entry для нее
      changefreq: 'monthly',
      priority: 1.0,
      lastmod: new Date(),
    }),
  ],
  build: {
    // Атрибут asset hash для cache-busting (важно при правках CSS/JS)
    assets: '_assets',
  },
});
