// Шапка сервисной страницы: глобальные пункты + якоря самой страницы.
//
// На /packaging/, /presentations/ и /car-wrap/ раньше стояли только якоря,
// поэтому уйти с направления можно было лишь через логотип или футер.
// Список направлений живет в одном месте — site.yaml, — и подставляется
// сюда как есть: дублировать его руками нельзя, иначе меню разъедется.
export interface NavChild {
  href: string;
  label: string;
  desc?: string;
  image?: string;
}
export interface NavItem {
  href: string;
  label: string;
  children?: NavChild[];
}

/**
 * Портфолио и «Услуги» из site.yaml + переданные якоря страницы.
 * Порядок пунктов: сначала выход с направления, потом навигация внутри него.
 */
export function servicePageNav(site: any, anchors: NavItem[]): NavItem[] {
  const globalNav: NavItem[] = site.nav ?? [];
  const portfolio = globalNav.find((item) => item.href === '/portfolio/');
  const services = globalNav.find((item) => item.children && item.children.length > 0);

  if (!portfolio) throw new Error('site.yaml: в nav нет пункта /portfolio/');
  if (!services) throw new Error('site.yaml: в nav нет пункта с направлениями (children)');

  return [portfolio, services, ...anchors];
}
