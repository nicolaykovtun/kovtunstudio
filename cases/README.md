# Реестр кейсов Kovtun Studio

**Актуально на:** 2026-09-03

Эта папка хранит тексты готовых кейсов и исходные материалы для будущих. Признак
простой: папка в `published/` — кейс собран и стоит на сайте, папка в
`unpublished/` — материал есть, кейса еще нет. Подробный процесс — в
`docs/case-pipeline.md`.

- готовая редакционная страница имеет `case.md` в своей папке `published/`;
- исходники таких страниц лежат рядом — в подпапке `source/`, `Raw/` или прямо в папке кейса;
- пять более ранних кейсов оклейки собираются из `src/data/cases.yaml`, а их исходники лежат в отдельных папках `published/CarWrap-*`;
- каждая папка верхнего уровня в `unpublished/` соответствует отдельному будущему кейсу.

## Создано и опубликовано — 29 кейсов

Все двадцать девять доступны на сайте и входят в единый каталог портфолио —
`src/data/case-catalog.ts`.

### Кейсы из `cases/published/` — 24

| Кейс | Папка | Адрес |
|---|---|---|
| Фирменный стиль Green Power | `Green Power - Identity` | `/cases/identity-green-power/` |
| Сайт Green Power | `Green Power - Website` | `/cases/website-green-power/` |
| Этикетки масла Green Power | `Packaging-Green-Power-Oil-Labels` | `/cases/labels-green-power-oil/` |
| Этикетки соков Green Power | `Packaging-Green-Power-Juice-Labels` | `/cases/labels-green-power-juice/` |
| Этикетки пасты Green Power | `Packaging-Green-Power-Paste-Labels` | `/cases/labels-green-power-paste/` |
| Бренд MICKING | `Packaging-MICKING` | `/cases/brand-micking/` |
| Логотип аккумуляторов Alaska | `Alaska - Identity` | `/cases/identity-alaska/` |
| Упаковка аккумуляторов Alaska | `Alaska - Packaging` | `/cases/packaging-alaska/` |
| Фирменный стиль «Трубоварни Еремеева» | `Trubovarnya Eremeev - Identity` | `/cases/identity-trubovarnya/` |
| Сайт «Трубоварни Еремеева» | `Trubovarnya Eremeev - Website` | `/cases/website-trubovarnya/` |
| Фирменный стиль Sila Car | `Sila Car - Identity` | `/cases/identity-sila-car/` |
| Сайт ПТК «Стройконструкция» | `PTKSK - Website` | `/cases/website-ptksk/` |
| Сайт EON Phuket | `Website-EON` | `/cases/website-eon-phuket/` |
| Сайт Greatway | `Website-Greatway` | `/cases/website-greatway/` |
| Сайт Japan Шина | `Landing-japan-shina` | `/cases/website-japan-shina/` |
| Сайт «Капиталъ Информ» | `Website-Kapital-Inform` | `/cases/website-kapital-inform/` |
| Сайт B2B Cosmetics | `Website-B2B-Cosmetics` | `/cases/website-b2b-cosmetics/` |
| Лендинг «Кузница души» | `Landing-Kuznitsa dushi` | `/cases/website-kuznitsa-dushi/` |
| Лендинг «Эктострой» | `Landing-Ektostroy` | `/cases/website-ektostroy/` |
| Лендинг EVG Group | `Landing-EVG-Group` | `/cases/website-evg-group/` |
| Брошюра Edelweiss «Золотой Рог» | `Presentation-Edelweiss` | `/cases/presentation-edelweiss/` |
| Презентация «Тернейский фермер» | `Presentation-Terneiskii fermer` | `/cases/presentation-terney-farmer/` |
| Брошюра «М-Инвест» | `Brochure-Metall Invest` | `/cases/brochure-metall-invest/` |
| Презентация ВМТП | `Presentation-VMTP` | `/cases/presentation-vmtp/` |

Кейс MICKING сделан в найме, в команде отдела развития бренда МСМ ГРУПП: Николай —
старший дизайнер проекта. С 2026 года кейс входит в общий каталог наравне с
остальными. Статья о процессе — `src/content/blog/sozdanie-brenda-micking.md`.

### Ранее созданные кейсы оклейки — 5

Собираются из `src/data/cases.yaml`, своего `case.md` у них нет.

| Кейс | Где лежат исходники | Адрес |
|---|---|---|
| Оклейка Green Power | `published/CarWrap-Green-Power` | `/cases/green-power/` |
| Оклейка Japan House | `published/CarWrap-Japan House` | `/cases/japanhouse/` |
| Оклейка «Примгриль» | `published/CarWrap-Primgril` | `/cases/primgril/` |
| Оклейка Japan Line | `published/CarWrap-Japan Line` | `/cases/japan-line/` |
| Оклейка Sila Car | `published/CarWrap-Sila-Car` | `/cases/sila-car/` |

## Предстоит создать — 3 кейса

| Кейс | Исходники | Что уже есть |
|---|---|---|
| Логотип «ИнтелСкан Сервис» | `unpublished/Identity-IntelScan` | черновик `case-draft.md` со слугом `identity-intelscan`; макетов в папке нет |
| Лендинг Mercator Maritime | `unpublished/Landing-Mercator-maritime/Raw` | дизайн и вайрфрейм |
| Ребрендинг фильтров TopFils | `unpublished/TopFils` | 175 файлов: старый и новый логотип, упаковка трех линеек — воздух, топливо, масло, — старый дизайн, 3D-визуализации и чертеж. Просится, как Alaska, на два кейса |

## Размещение исходников комплексных проектов

- Green Power: логотип и гайдбук — в `published/Green Power - Identity/source/`; лендинг — в `published/Green Power - Website/source/`; оклейка — в `published/CarWrap-Green-Power/`; макеты этикеток — в `Raw/` внутри трех папок `published/Packaging-Green-Power-*-Labels/`.
- MICKING: исходники — в `published/Packaging-MICKING/Raw/` (масло, антифриз, сайт, телеграм), там же черновик `case-draft.md` и текст статьи.
- «Трубоварня Еремеева»: логотип и гайдбук — в `published/Trubovarnya Eremeev - Identity/source/`; сайт — в `published/Trubovarnya Eremeev - Website/source/`.
- Alaska: логотип и его этапы — в `published/Alaska - Identity/Raw/Логотип/`; этикетки, коробки и рекламные материалы — в `published/Alaska - Packaging/Raw/`. Кейс разложен на два по тому же правилу, что Трубоварня.
- Sila Car: оклейка — в `published/CarWrap-Sila-Car/`; отдельный кейс фирменного стиля и его исходники — в `published/Sila Car - Identity/`.
- EON Phuket: макеты пришли из папки Green Power и лежат в `published/Website-EON/Raw/`.

## Как переводить кейс в готовые

1. Создать отдельную папку в `published/`, перенести туда исходники из `unpublished/`.
2. Подготовить `case.md` и `gallery.yaml`.
3. Добавить slug в канонический порядок `src/data/case-catalog.ts`.
4. Если сфера бизнеса новая — добавить ее в `spheres` в `src/data/taxonomy.yaml`.
5. Добавить строку кейса в `public/llms.txt` (раздел «Кейсы: …», формат:
   `- [Название](адрес): короткое описание без буквы Е и конструкции «не X, а Y»`).
   Без этой строки сборка упадет: `npm run build` начинается с
   `scripts/check-llms.mjs`, а заканчивается `scripts/check-llms-links.mjs`.
6. Проверить сборку, изображения, метаданные, мобильную ширину и лайтбокс.
7. После публикации проверить адрес на production и обновить этот реестр.

Списка клиентов, который надо править руками, на сайте больше нет: блок
«С кем работаю» на главной считается из коллекции кейсов, класс `.proof-names`
в `src/pages/index.astro` остался только в стилях.
