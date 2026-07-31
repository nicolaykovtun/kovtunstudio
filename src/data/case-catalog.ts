/**
 * Канонический порядок кейсов в портфолио и в переходах «Следующий кейс».
 * Новые редакционные проекты идут первыми, архив оклейки — следом.
 */
export const caseCatalogOrder = [
  'identity-green-power',
  'website-green-power',
  'identity-trubovarnya',
  'website-trubovarnya',
  'website-japan-shina',
  'website-kapital-inform',
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

export const sphereBySegment: Record<string, string> = {
  automotive: 'auto',
  'logistics-and-port': 'logistics-and-port',
  agriculture: 'agriculture',
  'real-estate': 'real-estate',
  b2b: 'metallurgy',
};

export function caseOrderIndex(slug: string): number {
  const index = caseCatalogOrder.indexOf(slug as (typeof caseCatalogOrder)[number]);
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}
