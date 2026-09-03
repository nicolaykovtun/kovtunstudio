/**
 * Канонический порядок кейсов в портфолио и в переходах «Следующий кейс».
 * Новые редакционные проекты идут первыми, архив оклейки — следом.
 */
export const caseCatalogOrder = [
  'identity-green-power',
  'website-green-power',
  'labels-green-power-oil',
  'labels-green-power-juice',
  'labels-green-power-paste',
  'brand-micking',
  'identity-alaska',
  'packaging-alaska',
  'identity-trubovarnya',
  'website-trubovarnya',
  'identity-sila-car',
  'website-ptksk',
  'website-eon-phuket',
  'website-greatway',
  'website-japan-shina',
  'website-kapital-inform',
  'website-b2b-cosmetics',
  'website-kuznitsa-dushi',
  'website-ektostroy',
  'website-evg-group',
  'presentation-edelweiss',
  'presentation-terney-farmer',
  'brochure-metall-invest',
  'presentation-vmtp',
  'green-power',
  'japanhouse',
  'primgril',
  'japan-line',
  'sila-car',
] as const;

export const directionByCategory: Record<string, string> = {
  websites: 'web',
  presentations: 'presentations',
  print: 'presentations',
  identity: 'identity',
  packaging: 'packaging',
  'car-wrap': 'wrap',
};

/**
 * Страница услуги для каждого направления. Кейсы ссылаются на нее из крошек
 * и CTA, портфолио — из списка направлений. Раньше кейсы вели только
 * в /portfolio/, и у страниц услуг не было входящих ссылок с 27 кейсов.
 */
export const servicePageByDirection: Record<
  string,
  { href: string; label: string; cta: string }
> = {
  packaging: { href: '/packaging/', label: 'Упаковка', cta: 'Цены и процесс по упаковке' },
  identity: { href: '/identity/', label: 'Логотип и фирменный стиль', cta: 'Цены и процесс по фирменному стилю' },
  web: { href: '/websites/', label: 'Сайты', cta: 'Цены и процесс по сайтам' },
  presentations: { href: '/presentations/', label: 'Презентации', cta: 'Цены и процесс по презентациям' },
  wrap: { href: '/car-wrap/', label: 'Оклейка авто', cta: 'Цены и процесс по оклейке' },
};

/**
 * Сегмент кейса → сфера из taxonomy.yaml. Сегмент точный («бухгалтерские
 * услуги»), сфера укрупненная («услуги для бизнеса и опт»): по сферам
 * работает фильтр портфолио и список «С кем работаю» на главной.
 */
export const sphereBySegment: Record<string, string> = {
  food: 'food',
  agriculture: 'food',
  automotive: 'auto',
  production: 'production',
  b2b: 'production',
  'engineering-systems': 'engineering-systems',
  'smart-home': 'engineering-systems',
  'logistics-and-port': 'logistics-and-port',
  'real-estate': 'real-estate',
  accounting: 'b2b-services',
  'cosmetics-wholesale': 'b2b-services',
  wellness: 'wellness',
  retreats: 'wellness',
};

export function caseOrderIndex(slug: string): number {
  const index = caseCatalogOrder.indexOf(slug as (typeof caseCatalogOrder)[number]);
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}
