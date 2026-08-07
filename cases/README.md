# Реестр кейсов Kovtun Studio

**Актуально на:** 2026-08-03

Эта папка хранит тексты готовых кейсов и исходные материалы для будущих. После ревизии все исходники опубликованных работ находятся в `published/`, а в `unpublished/` остались только будущие кейсы.

- готовая редакционная страница имеет `case.md` в своей папке `published/`;
- исходники таких страниц лежат рядом, в подпапке `source/`, если они вынесены отдельно;
- пять более ранних кейсов оклейки собираются из `src/data/cases.yaml`, а их исходники лежат в отдельных папках `published/CarWrap-*`;
- каждая папка верхнего уровня в `unpublished/` теперь соответствует отдельному будущему кейсу.

## Создано и опубликовано — 17 кейсов

Все семнадцать кейсов доступны на сайте и входят в единый каталог портфолио.

### Кейсы из `cases/published/` — 12

| Кейс | Папка | Адрес |
|---|---|---|
| Фирменный стиль Green Power | `Green Power - Identity` | `/cases/identity-green-power/` |
| Сайт Green Power | `Green Power - Website` | `/cases/website-green-power/` |
| Фирменный стиль «Трубоварни Еремеева» | `Trubovarnya Eremeev - Identity` | `/cases/identity-trubovarnya/` |
| Сайт «Трубоварни Еремеева» | `Trubovarnya Eremeev - Website` | `/cases/website-trubovarnya/` |
| Фирменный стиль Sila Car | `Sila Car - Identity` | `/cases/identity-sila-car/` |
| Сайт ПТК «Стройконструкция» | `PTKSK - Website` | `/cases/website-ptksk/` |
| Сайт Japan Шина | `Landing-japan-shina` | `/cases/website-japan-shina/` |
| Сайт «Капиталъ Информ» | `Website-Kapital-Inform` | `/cases/website-kapital-inform/` |
| Брошюра Edelweiss «Золотой Рог» | `Presentation-Edelweiss` | `/cases/presentation-edelweiss/` |
| Презентация «Тернейский фермер» | `Presentation-Terneiskii fermer` | `/cases/presentation-terney-farmer/` |
| Брошюра «М-Инвест» | `Brochure-Metall Invest` | `/cases/brochure-metall-invest/` |
| Презентация ВМТП | `Presentation-VMTP` | `/cases/presentation-vmtp/` |

### Ранее созданные кейсы оклейки — 5

| Кейс | Где лежат исходники | Адрес |
|---|---|---|
| Оклейка Green Power | `published/CarWrap-Green-Power` | `/cases/green-power/` |
| Оклейка Japan House | `published/CarWrap-Japan House` | `/cases/japanhouse/` |
| Оклейка «Примгриль» | `published/CarWrap-Primgril` | `/cases/primgril/` |
| Оклейка Japan Line | `published/CarWrap-Japan Line` | `/cases/japan-line/` |
| Оклейка Sila Car | `published/CarWrap-Sila-Car` | `/cases/sila-car/` |

## Предстоит создать — 7 кейсов

Это самостоятельные наборы исходников, для которых пока нет `case.md` и отдельной страницы сайта.

| Приоритет не задан | Исходники | Что уже есть |
|---|---|---|
| Лендинг Ektostroy | `unpublished/Landing-Ektostroy/Raw` | дизайн и вайрфрейм |
| Лендинг EVG Group | `unpublished/Landing-EVG-Group/Raw` | дизайн и вайрфрейм |
| Лендинг «Кузница души» | `unpublished/Landing-Kuznitsa dushi/Raw` | дизайн и вайрфрейм |
| Лендинг Mercator Maritime | `unpublished/Landing-Mercator-maritime/Raw` | дизайн и вайрфрейм |
| Сайт B2B Cosmetics | `unpublished/Website-B2B Cosmetics/Raw` | ТЗ и дизайн нескольких страниц |
| Сайт EON | `unpublished/Website-EON/Raw` | вайрфреймы, дизайн и попапы |
| Сайт Greatway | `unpublished/Website-Greatway/Raw` | дизайн главной, услуг, кейсов и формы |

## Размещение исходников комплексных проектов

- Green Power: логотип и гайдбук находятся в `published/Green Power - Identity/source/`; лендинг — в `published/Green Power - Website/source/`; оклейка — в `published/CarWrap-Green-Power/`.
- «Трубоварня Еремеева»: логотип и гайдбук находятся в `published/Trubovarnya Eremeev - Identity/source/`; сайт — в `published/Trubovarnya Eremeev - Website/source/`.
- Sila Car: оклейка находится в `published/CarWrap-Sila-Car/`; отдельный кейс фирменного стиля и его исходники — в `published/Sila Car - Identity/`.

## Как переводить кейс в готовые

1. Создать отдельную папку в `published/`.
2. Подготовить `case.md`; для нового шаблона также нужен `gallery.yaml`.
3. Добавить slug в канонический порядок `src/data/case-catalog.ts`.
4. Добавить строку кейса в `public/llms.txt` (нужный раздел «Кейсы: …», формат: `- [Название](адрес): короткое описание без буквы Ё и конструкции «не X, а Y»`). Без этой строки сборка упадет: `scripts/check-llms.mjs` проверяет покрытие llms.txt перед каждым `npm run build`, локально и в GitHub Actions.
5. Проверить сборку, изображения, метаданные, мобильную ширину и лайтбокс.
6. После публикации проверить адрес на production и обновить этот реестр.
