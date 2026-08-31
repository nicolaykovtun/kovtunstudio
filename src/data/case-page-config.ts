export interface CaseMedia {
  src: string;
  thumb?: string;
  label: string;
}

export interface CaseStoryItem {
  number: string;
  title: string;
  text: string;
  media: Array<{
    src: string;
    alt: string;
    caption: string;
  }>;
}

export interface CaseStory {
  id: string;
  label: string;
  title: string;
  intro?: string;
  items: CaseStoryItem[];
}

export interface CaseGalleryGroup {
  id: string;
  label: string;
  title: string;
  intro?: string;
  layout?: 'default' | 'screens' | 'tall' | 'slides' | 'brochure' | 'portrait' | 'sheet' | 'brand';
  /**
   * Пропорция плитки в виде CSS aspect-ratio, например «8 / 9». Задается там,
   * где картинки группы не совпадают с пропорцией раскладки: иначе плитка
   * держит свою высоту, а картинка вписывается в нее с полями фона.
   */
  ratio?: string;
  theme?: 'dark' | 'paper';
  interactive?: boolean;
  items: CaseMedia[];
}

/**
 * Соседние кейсы того же клиента: одна работа, разложенная на несколько
 * страниц. Заголовок и обложка подтягиваются по slug из коллекции кейсов,
 * поэтому в gallery.yaml достаточно slug, подписи и одной фразы.
 */
export interface CaseRelated {
  title: string;
  intro?: string;
  items: Array<{ slug: string; label: string; text: string }>;
}

export interface EditorialCaseConfig {
  bodyVariant?: string;
  cover: { src: string; alt: string };
  taskTitle?: string;
  story?: CaseStory;
  resultTitle?: string;
  resultIntro?: string;
  groups: CaseGalleryGroup[];
  related?: CaseRelated;
  order: string[];
  cta?: { title: string; text: string; button: string };
  keywords?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

const series = ({
  root,
  prefix,
  start,
  end,
  label,
  thumbPrefix = prefix,
}: {
  root: string;
  prefix: string;
  start: number;
  end: number;
  label: string;
  thumbPrefix?: string;
}): CaseMedia[] =>
  Array.from({ length: end - start + 1 }, (_, index) => {
    const number = pad(start + index);
    return {
      src: `${root}/full/${prefix}${number}.webp`,
      thumb: `${root}/thumb/${thumbPrefix}${number}-thumbnail.webp`,
      label: `${label} ${number}`,
    };
  });

const vmtpRoot = '/assets/cases/presentation-vmtp';
const vmtpSlides: CaseMedia[] = [
  {
    src: `${vmtpRoot}/vmtp-presentation-cover.webp`,
    thumb: `${vmtpRoot}/thumb/vmtp-presentation-cover-thumbnail.webp`,
    label: 'Титульный слайд презентации ВМТП',
  },
  ...series({
    root: vmtpRoot,
    prefix: 'vmtp-presentation-slide-',
    start: 2,
    end: 16,
    label: 'Слайд презентации ВМТП',
  }),
];

const edelweissRoot = '/assets/cases/presentation-edelweiss';
const edelweissPages = series({
  root: edelweissRoot,
  prefix: 'edelweiss-golden-rog-brochure-page-',
  start: 1,
  end: 18,
  label: 'Страница брошюры Edelweiss',
});

const metallRoot = '/assets/cases/brochure-metall-invest';
const metallPages = series({
  root: metallRoot,
  prefix: 'metall-invest-corporate-brochure-page-',
  start: 1,
  end: 38,
  label: 'Страница брошюры М-Инвест',
});

const terneyRoot = '/assets/cases/presentation-terney-farmer';
const terneySlides = series({
  root: terneyRoot,
  prefix: 'terneysky-fermer-presentation-slide-',
  start: 1,
  end: 15,
  label: 'Слайд презентации Тернейский фермер',
});

export const editorialCaseConfigs: Record<string, EditorialCaseConfig> = {
  'presentation-vmtp': {
    cover: {
      src: `${vmtpRoot}/vmtp-presentation-cover.webp`,
      alt: 'Титульный слайд презентации Владивостокского морского торгового порта',
    },
    taskTitle: 'Сначала содержание, потом оформление',
    story: {
      id: 'before-after',
      label: 'ДО — ПОСЛЕ',
      title: 'Как текст и таблицы стали визуальной системой',
      intro: 'Четыре примера показывают переход от исходного ТЗ к готовым слайдам.',
      items: [
        {
          number: '01',
          title: 'Цифры стали главным сообщением',
          text: 'В ТЗ показатели шли сплошным перечнем. На слайде их семь: крупные цифры на фотографии порта, каждая считывается за пару секунд.',
          media: [
            { src: `${vmtpRoot}/before/vmtp-presentation-brief-slide-05.webp`, alt: 'Текстовое ТЗ с перечнем показателей ВМТП', caption: 'ТЗ клиента' },
            { src: `${vmtpRoot}/full/vmtp-presentation-slide-05.webp`, alt: 'Готовый слайд ВМТП с крупными показателями', caption: 'Финальный дизайн' },
          ],
        },
        {
          number: '02',
          title: 'Таблица превратилась в карту порта',
          text: 'Длины путей, причалы, склады и специализация терминалов из таблицы ТЗ привязаны к схеме порта.',
          media: [
            { src: `${vmtpRoot}/before/vmtp-presentation-brief-slide-06.webp`, alt: 'ТЗ с таблицей параметров терминалов', caption: 'ТЗ клиента' },
            { src: `${vmtpRoot}/full/vmtp-presentation-slide-06.webp`, alt: 'Готовый слайд со схемой терминалов порта', caption: 'Финальный дизайн' },
          ],
        },
        {
          number: '03',
          title: 'Сервис показан в реальной среде',
          text: 'Описание склада сжато до коротких тезисов, а фотография сразу показывает, о каком процессе речь.',
          media: [
            { src: `${vmtpRoot}/before/vmtp-presentation-brief-slide-10.webp`, alt: 'Текстовое ТЗ о складе консолидации грузов', caption: 'ТЗ клиента' },
            { src: `${vmtpRoot}/full/vmtp-presentation-slide-10.webp`, alt: 'Готовый слайд о складе CFS', caption: 'Финальный дизайн' },
          ],
        },
        {
          number: '04',
          title: 'Диаграмма получила контекст и акцент',
          text: 'Фирменная палитра, подписи внутри столбцов и фотографический фон связывают график с презентацией.',
          media: [
            { src: `${vmtpRoot}/before/vmtp-presentation-brief-slide-14.webp`, alt: 'Исходная диаграмма контейнерооборота', caption: 'ТЗ клиента' },
            { src: `${vmtpRoot}/full/vmtp-presentation-slide-14.webp`, alt: 'Готовая диаграмма контейнерооборота ВМТП', caption: 'Финальный дизайн' },
          ],
        },
      ],
    },
    resultTitle: '16 слайдов — одна история о возможностях порта',
    resultIntro:
      'Исходником были текстовые заготовки и таблицы из ТЗ. Географию, инфраструктуру, ' +
      'оборудование, маршруты и показатели порта надо было показать так, чтобы слайд ' +
      'считывался с экрана за несколько секунд.',
    groups: [
      {
        id: 'gallery',
        label: 'ПРЕЗЕНТАЦИЯ',
        title: 'Все 16 слайдов крупным планом',
        intro: 'Карты, схемы терминалов, показатели, инфраструктура и сервисы порта.',
        layout: 'slides',
        theme: 'dark',
        interactive: true,
        items: vmtpSlides,
      },
    ],
    order: ['task', 'before-after', 'result', 'gallery', 'works'],
    cta: {
      title: 'Нужна презентация со сложными данными?',
      text: 'Пришлите материалы — помогу превратить таблицы, факты и схемы в ясный рассказ.',
      button: 'Обсудить презентацию',
    },
  },

  'presentation-edelweiss': {
    bodyVariant: 'case-page--brochure',
    cover: {
      src: `${edelweissRoot}/edelweiss-golden-rog-brochure-cover.webp`,
      alt: 'Обложка брошюры жилого квартала Edelweiss Золотой Рог',
    },
    taskTitle: 'Оформить материалы клиента в цельную брошюру',
    story: {
      id: 'system',
      label: 'СИСТЕМА',
      title: 'Дизайн поддерживает сценарий брошюры',
      intro: 'Три пары страниц показывают путь от образа проекта к конкретному выбору квартиры.',
      items: [
        {
          number: '01',
          title: 'Сначала — место и образ',
          text: 'Концепция и карта инфраструктуры отвечают на первые вопросы: что это за проект, где он находится и чем интересна локация.',
          media: [
            { src: edelweissPages[1].src, alt: 'Концепция проекта Edelweiss', caption: 'Концепция проекта' },
            { src: edelweissPages[3].src, alt: 'Инфраструктура района Edelweiss', caption: 'Инфраструктура района' },
          ],
        },
        {
          number: '02',
          title: 'Затем — масштаб и среда',
          text: 'Крупные цифры дают опорные характеристики квартала, а благоустройство переводит их в сценарии повседневной жизни.',
          media: [
            { src: edelweissPages[4].src, alt: 'Масштаб жилого квартала', caption: 'Масштаб проекта' },
            { src: edelweissPages[6].src, alt: 'Благоустройство жилого квартала', caption: 'Благоустройство' },
          ],
        },
        {
          number: '03',
          title: 'В финале — конкретный выбор',
          text: 'После эмоциональной части брошюра переходит к схеме квартала и планам этажей.',
          media: [
            { src: edelweissPages[10].src, alt: 'Генеральный план квартала', caption: 'Генеральный план' },
            { src: edelweissPages[11].src, alt: 'План типового этажа', caption: 'План этажа' },
          ],
        },
      ],
    },
    resultTitle: '18 страниц собраны в единую визуальную систему',
    resultIntro:
      'Материал пришел от клиента готовым: тексты, рендеры, карты, схемы и планы этажей. ' +
      'Собрать его нужно было в одну последовательность от локации квартала до конкретной ' +
      'планировки и не перегрузить страницы цифрами и техническими схемами.',
    groups: [
      {
        id: 'gallery',
        label: 'БРОШЮРА',
        title: 'Все 18 страниц крупным планом',
        layout: 'brochure',
        theme: 'dark',
        interactive: true,
        items: edelweissPages,
      },
    ],
    order: ['task', 'system', 'result', 'gallery', 'works'],
  },

  'brochure-metall-invest': {
    bodyVariant: 'case-page--portrait',
    cover: {
      src: `${metallRoot}/metall-invest-corporate-brochure-cover.webp`,
      alt: 'Обложка корпоративной брошюры М-Инвест',
    },
    taskTitle: 'Превратить Word-ТЗ в цельную печатную систему',
    story: {
      id: 'system',
      label: 'СИСТЕМА',
      title: 'Девять разделов держатся на одном визуальном языке',
      intro: 'Три пары страниц показывают, как меняется подача при сохранении общей сетки и фирменного стиля.',
      items: [
        {
          number: '01',
          title: 'От ассортимента — к географии',
          text: 'Пиктограммы превращают перечень металлопроката в быстрый каталог, а карта показывает масштаб поставок.',
          media: [
            { src: metallPages[7].src, alt: 'Продукция компании М-Инвест', caption: 'Продукция' },
            { src: metallPages[10].src, alt: 'Карта поставок М-Инвест', caption: 'Карта поставок' },
          ],
        },
        {
          number: '02',
          title: 'От услуг — к преимуществам',
          text: 'Услуги читаются карточками, преимущества — нумерованным блоком.',
          media: [
            { src: metallPages[11].src, alt: 'Услуги компании М-Инвест', caption: 'Услуги' },
            { src: metallPages[14].src, alt: 'Преимущества компании М-Инвест', caption: 'Преимущества' },
          ],
        },
        {
          number: '03',
          title: 'От компании — к объектам',
          text: 'Разделители создают паузы между плотными страницами, а фотографии объектов подтверждают масштаб компании.',
          media: [
            { src: metallPages[15].src, alt: 'Начало раздела объектов М-Инвест', caption: 'Начало раздела' },
            { src: metallPages[33].src, alt: 'Вектор развития компании М-Инвест', caption: 'Вектор развития' },
          ],
        },
      ],
    },
    resultTitle: '38 страниц — один ритм и одна система',
    resultIntro:
      'Исходником были текстовый документ и брендбук. Разделы отличаются по типу ' +
      'содержания: длинный текст, продукция, карта поставок, фотографии объектов, цифры ' +
      'и отзывы. Каждому нужен свой формат страницы, но узнаваться они должны как одна работа.',
    groups: [
      {
        id: 'gallery',
        label: 'БРОШЮРА',
        title: 'Все 38 страниц крупным планом',
        layout: 'portrait',
        // Страницы брошюры — А4, 210x297: это 0,707, а плитка portrait держит
        // 2:3, то есть 0,667. Задаем пропорцию под страницу, иначе она
        // вписывается в плитку с серыми полями сверху и снизу.
        ratio: '210 / 297',
        theme: 'dark',
        interactive: true,
        items: metallPages,
      },
    ],
    order: ['task', 'system', 'result', 'gallery', 'works'],
  },

  'presentation-terney-farmer': {
    bodyVariant: 'case-page--terney',
    cover: {
      src: `${terneyRoot}/terneysky-fermer-presentation-cover.webp`,
      alt: 'Титульный слайд презентации Тернейский фермер',
    },
    taskTitle: 'Сначала содержание, потом форма',
    story: {
      id: 'process',
      label: 'ПРОЦЕСС',
      title: 'ТЗ → вайрфрейм → дизайн',
      intro: 'Четыре последовательности показывают работу над содержанием, структурой и финальной формой.',
      items: [
        {
          number: '01',
          title: 'Направления стали картой истории',
          text: 'Вайрфрейм разделил контент на текст, карту и четыре направления, а дизайн связал их фирменной графикой.',
          media: [
            { src: `${terneyRoot}/brief/terneysky-fermer-client-brief-slide-03.webp`, alt: 'Исходный слайд ТЗ с направлениями развития', caption: 'ТЗ клиента' },
            { src: `${terneyRoot}/wireframe/terneysky-fermer-presentation-wireframe-slide-02.webp`, alt: 'Вайрфрейм с направлениями и картой региона', caption: 'Вайрфрейм' },
            { src: `${terneyRoot}/full/terneysky-fermer-presentation-slide-02.webp`, alt: 'Финальный слайд с направлениями развития', caption: 'Финальный дизайн' },
          ],
        },
        {
          number: '02',
          title: 'Показатели получили иерархию',
          text: 'Разрозненные цифры собраны в три смысловых слоя и сравниваются по горизонтали.',
          media: [
            { src: `${terneyRoot}/brief/terneysky-fermer-client-brief-slide-05.webp`, alt: 'Исходный слайд с показателями овцеводства', caption: 'ТЗ клиента' },
            { src: `${terneyRoot}/wireframe/terneysky-fermer-presentation-wireframe-slide-08.webp`, alt: 'Вайрфрейм с группировкой показателей', caption: 'Вайрфрейм' },
            { src: `${terneyRoot}/full/terneysky-fermer-presentation-slide-08.webp`, alt: 'Финальный слайд с показателями продуктивности', caption: 'Финальный дизайн' },
          ],
        },
        {
          number: '03',
          title: 'Пчеловодство стало системой фактов',
          text: 'Сплошной текст разделен на виды меда, показатели пасеки, карту медосбора и статус предприятия.',
          media: [
            { src: `${terneyRoot}/brief/terneysky-fermer-client-brief-slide-09.webp`, alt: 'Исходный слайд ТЗ о пчеловодстве', caption: 'ТЗ клиента' },
            { src: `${terneyRoot}/wireframe/terneysky-fermer-presentation-wireframe-slide-10.webp`, alt: 'Вайрфрейм слайда о пчеловодстве', caption: 'Вайрфрейм' },
            { src: `${terneyRoot}/full/terneysky-fermer-presentation-slide-10.webp`, alt: 'Финальный слайд о пчеловодстве', caption: 'Финальный дизайн' },
          ],
        },
        {
          number: '04',
          title: 'Земледелие — от абзаца к масштабу',
          text: 'Текст о технологиях получил отдельный блок с площадями культур и визуальным масштабом.',
          media: [
            { src: `${terneyRoot}/brief/terneysky-fermer-client-brief-slide-10.webp`, alt: 'Исходный слайд ТЗ о земледелии', caption: 'ТЗ клиента' },
            { src: `${terneyRoot}/wireframe/terneysky-fermer-presentation-wireframe-slide-12.webp`, alt: 'Вайрфрейм слайда о земледелии', caption: 'Вайрфрейм' },
            { src: `${terneyRoot}/full/terneysky-fermer-presentation-slide-12.webp`, alt: 'Финальный слайд о земледелии', caption: 'Финальный дизайн' },
          ],
        },
      ],
    },
    resultTitle: '15 слайдов — один рассказ о предприятии',
    resultIntro:
      'Исходником было PowerPoint-ТЗ на 11 страниц с длинными текстами и фотографиями. ' +
      'Структуру и композицию проверили на вайрфреймах и только потом перенесли в дизайн, ' +
      'который продолжает логотип и гайдбук «Тернейского фермера».',
    groups: [
      {
        id: 'brand',
        label: 'АЙДЕНТИКА',
        title: 'Презентация продолжила созданный ранее бренд',
        intro: 'Логотип, палитра и типографика из гайдбука стали рабочей системой для слайдов.',
        layout: 'brand',
        theme: 'paper',
        interactive: false,
        items: [
          { src: `${terneyRoot}/brand/terneysky-fermer-brand-guide-logo-system.webp`, label: 'Логотип и конструкция фирменного блока' },
          { src: `${terneyRoot}/brand/terneysky-fermer-brand-guide-color-palette.webp`, label: 'Фирменная палитра бренда' },
          { src: `${terneyRoot}/brand/terneysky-fermer-brand-guide-typography.webp`, label: 'Типографическая система гайдбука' },
        ],
      },
      {
        id: 'gallery',
        label: 'ПРЕЗЕНТАЦИЯ',
        title: 'Все 15 слайдов крупным планом',
        layout: 'slides',
        theme: 'dark',
        interactive: true,
        items: terneySlides,
      },
    ],
    order: ['task', 'brand', 'process', 'result', 'gallery', 'works'],
  },
};
