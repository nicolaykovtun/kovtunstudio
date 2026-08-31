// Разбор case.md в структуру для страницы кейса.
// Формат файла задан в case-template-example/case.md — Николай заполняет
// именно его, поэтому парсер подстраивается под шаблон, а не наоборот.

export interface CaseFact {
  value: string;
  label: string;
}

export interface CaseSolution {
  title: string;
  text: string;
}

export interface CaseCredit {
  role: string;
  name: string;
}

export interface CaseLink {
  label: string;
  value: string;
}

export interface ParsedCaseBody {
  title: string;
  shortTitle: string;
  summary: string;
  seoDescription: string;
  services: string[];
  facts: CaseFact[];
  task: string[];
  solutions: CaseSolution[];
  result: string[];
  deliverables: string[];
  quote?: string;
  credits: CaseCredit[];
  agency?: string;
  links: CaseLink[];
  internalNotes?: string;
}

/** Делит тело файла на секции по заголовкам второго уровня. */
function splitSections(body: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = body.split(/\r?\n/);
  let current: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current !== null) sections.set(current, buffer.join('\n').trim());
    buffer = [];
  };

  for (const line of lines) {
    const match = /^##\s+(.+?)\s*$/.exec(line);
    if (match) {
      flush();
      current = match[1];
      continue;
    }
    if (current !== null) buffer.push(line);
  }
  flush();

  return sections;
}

/** Первый заголовок первого уровня — название кейса. */
function extractTitle(body: string): string {
  const match = /^#\s+(.+?)\s*$/m.exec(body);
  return match ? match[1] : '';
}

/** Пункты маркированного списка. */
function parseList(section: string | undefined): string[] {
  if (!section) return [];
  return section
    .split(/\r?\n/)
    .map((line) => /^[-*]\s+(.*)$/.exec(line.trim()))
    .filter((match): match is RegExpExecArray => Boolean(match))
    .map((match) => match[1].trim())
    .filter(Boolean);
}

/** Абзацы: пустая строка разделяет, служебные пометки шаблона отбрасываются. */
function parseParagraphs(section: string | undefined): string[] {
  if (!section) return [];
  return section
    .split(/\r?\n\s*\r?\n/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Ключевые факты в формате:
 *   1. Значение: 15
 *      Подпись: блоков главной
 */
function parseFacts(section: string | undefined): CaseFact[] {
  if (!section) return [];
  const facts: CaseFact[] = [];
  let value: string | null = null;

  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.trim();
    const valueMatch = /^\d+\.\s*Значение:\s*(.+)$/.exec(line);
    if (valueMatch) {
      value = valueMatch[1].trim();
      continue;
    }
    const labelMatch = /^Подпись:\s*(.+)$/.exec(line);
    if (labelMatch && value !== null) {
      facts.push({ value, label: labelMatch[1].trim() });
      value = null;
    }
  }

  return facts;
}

/** Решение: строка «**Заголовок:** ...» плюс следующий абзац. */
function parseSolution(section: string | undefined): CaseSolution | null {
  if (!section) return null;
  const titleMatch = /\*\*Заголовок:\*\*\s*(.+)/.exec(section);
  if (!titleMatch) return null;
  const rest = section.slice(section.indexOf(titleMatch[0]) + titleMatch[0].length);
  const text = parseParagraphs(rest).join(' ');
  return { title: titleMatch[1].trim(), text };
}

/**
 * Авторство в формате:
 *   - Роль: Дизайн
 *     Имя: Николай Ковтун
 *   - Агентство: нет данных
 */
function parseCredits(section: string | undefined): {
  credits: CaseCredit[];
  agency?: string;
} {
  if (!section) return { credits: [] };
  const credits: CaseCredit[] = [];
  let agency: string | undefined;
  let role: string | null = null;

  for (const rawLine of section.split(/\r?\n/)) {
    const line = rawLine.trim().replace(/^[-*]\s+/, '');
    const agencyMatch = /^Агентство:\s*(.+)$/.exec(line);
    if (agencyMatch) {
      agency = agencyMatch[1].trim();
      continue;
    }
    const roleMatch = /^Роль:\s*(.+)$/.exec(line);
    if (roleMatch) {
      role = roleMatch[1].trim();
      continue;
    }
    const nameMatch = /^Имя:\s*(.+)$/.exec(line);
    if (nameMatch && role !== null) {
      credits.push({ role, name: nameMatch[1].trim() });
      role = null;
    }
  }

  return { credits, agency };
}

/** Ссылки и источники: «- Подпись: значение». */
function parseLinks(section: string | undefined): CaseLink[] {
  return parseList(section)
    .map((item) => {
      const match = /^(.+?):\s*(.+)$/.exec(item);
      return match ? { label: match[1].trim(), value: match[2].trim() } : null;
    })
    .filter((item): item is CaseLink => Boolean(item));
}

export function parseCaseBody(body: string): ParsedCaseBody {
  const sections = splitSections(body);
  const solutions: CaseSolution[] = [];

  for (const [name, content] of sections) {
    if (!/^Решение\s+\d+$/.test(name)) continue;
    const solution = parseSolution(content);
    if (solution) solutions.push(solution);
  }

  const { credits, agency } = parseCredits(sections.get('Авторство и участники'));

  return {
    title: extractTitle(body),
    shortTitle: parseParagraphs(sections.get('Короткое название'))[0] ?? '',
    summary: parseParagraphs(sections.get('Короткое описание'))[0] ?? '',
    seoDescription: parseParagraphs(sections.get('SEO-описание'))[0] ?? '',
    services: parseList(sections.get('Услуги')),
    facts: parseFacts(sections.get('Ключевые факты')),
    task: parseList(sections.get('Задача')),
    solutions,
    result: parseList(sections.get('Результат')),
    deliverables: parseList(sections.get('Что было сделано')),
    quote: parseParagraphs(sections.get('Цитата'))[0],
    credits,
    agency,
    links: parseLinks(sections.get('Ссылки и источники')),
    // Служебная сверка фактов. На страницу не выводится ни при каких условиях,
    // вводку к блоку «Результат» задает только resultIntro в case-page-config.ts.
    internalNotes: parseParagraphs(sections.get('Внутренние заметки (не публикуется)')).join(' ') || undefined,
  };
}
