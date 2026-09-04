#!/usr/bin/env node
/**
 * GEO-монитор kovtun.studio
 *
 * Гоняет вопросы из docs/ai-seo/geo-queries.json через генеративный поиск Яндекса
 * (Yandex Search API, POST /v2/gen/search) и смотрит, попал ли сайт в список источников,
 * на котором нейросеть построила ответ. Это и есть замер GEO: позиция в обычной выдаче
 * тут ни при чем, важно только то, кого нейроответ процитировал.
 *
 * Запуск:  _geo.bat                      — полный прогон
 *          _geo.bat --dry                — без обращений к API, просто список вопросов и смета
 *          _geo.bat --limit 3            — первые 3 вопроса
 *          _geo.bat --only A1.4,B1.1     — только указанные id
 *
 * Ключи (в код не кладем, читаются из окружения):
 *   YC_SEARCH_API_KEY — API-ключ сервисного аккаунта с ролью search-api.webSearch.user
 *   YC_FOLDER_ID      — идентификатор каталога в Yandex Cloud
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUERIES_FILE = join(ROOT, 'docs', 'ai-seo', 'geo-queries.json');
const LOG_DIR = join(ROOT, 'docs', 'ai-seo', 'geo-log');
const HISTORY = join(LOG_DIR, 'history.csv');

const ENDPOINT = 'https://searchapi.api.cloud.yandex.net/v2/gen/search';
const OUR_HOST = 'kovtun.studio';
const PRICE = 5.08;          // ₽ с НДС за один генеративный запрос (5080 ₽ за 1000)
const PAUSE_MS = 1500;       // пауза между запросами, чтобы не упереться в квоту
const TIMEOUT_MS = 180000;   // генеративный ответ отвечает долго
const RETRIES = 2;

// ---------- аргументы ----------
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const val = (f) => {
  const i = argv.indexOf(f);
  return i >= 0 ? argv[i + 1] : null;
};
const DRY = has('--dry');
const DEBUG = has('--debug');
const LIMIT = Number(val('--limit')) || 0;
const ONLY = (val('--only') || '').split(',').map((s) => s.trim()).filter(Boolean);

// ---------- вход ----------
let queries = JSON.parse(readFileSync(QUERIES_FILE, 'utf8'));
if (ONLY.length) queries = queries.filter((q) => ONLY.includes(q.id));
if (LIMIT) queries = queries.slice(0, LIMIT);
if (!queries.length) {
  console.error('Нет ни одного вопроса под эти фильтры.');
  process.exit(1);
}

const KEY = process.env.YC_SEARCH_API_KEY;
const FOLDER = process.env.YC_FOLDER_ID;

console.log(`Вопросов в прогоне: ${queries.length}. Смета: ~${(queries.length * PRICE).toFixed(0)} ₽.`);

if (DRY) {
  for (const q of queries) console.log(`  ${q.id.padEnd(6)} ${q.question}`);
  console.log('\nСухой прогон: к API не обращались, денег не потрачено.');
  process.exit(0);
}
if (!KEY || !FOLDER) {
  console.error('Нет YC_SEARCH_API_KEY или YC_FOLDER_ID в окружении. Положи их в %USERPROFILE%\\.yc-geo.env');
  process.exit(2);
}

// ---------- вызов API ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Ответ приходит либо массивом объектов, либо потоком JSON-строк:
 * каждый следующий объект дополняет предыдущий. Берем последний осмысленный.
 */
function parseStream(text) {
  const trimmed = text.trim();
  try {
    const picked = pickLast(JSON.parse(trimmed));
    if (picked) return picked;
  } catch { /* не цельный JSON — разбираем построчно */ }
  let last = null;
  for (const line of trimmed.split('\n')) {
    const s = line.trim();
    if (!s) continue;
    try {
      const picked = pickLast(JSON.parse(s));
      if (picked) last = picked;
    } catch { /* обрывок, пропускаем */ }
  }
  return last;
}

const unwrap = (o) => (o && o.result ? o.result : o);

function pickLast(value) {
  if (Array.isArray(value)) {
    for (let i = value.length - 1; i >= 0; i--) {
      const o = unwrap(value[i]);
      if (o && (o.message || o.sources)) return o;
    }
    return null;
  }
  const o = unwrap(value);
  return o && (o.message || o.sources) ? o : null;
}

async function ask(question) {
  const body = {
    messages: [{ content: question, role: 'ROLE_USER' }],
    folderId: FOLDER,
    fixMisspell: true,
    searchType: 'SEARCH_TYPE_RU',
  };
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Api-Key ${KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      const text = await res.text();
      if (DEBUG) { try { writeFileSync(join(LOG_DIR, `raw-${Date.now()}.txt`), `STATUS ${res.status}\n` + [...res.headers].map(([k,v])=>k+': '+v).join('\n') + '\n\n' + text, 'utf8'); } catch (e) { console.log('debug dump failed', e.message); } }
      if (!res.ok) {
        if ((res.status >= 500 || res.status === 429) && attempt < RETRIES) {
          await sleep(3000 * (attempt + 1));
          continue;
        }
        return { error: `HTTP ${res.status}: ${text.slice(0, 300)}` };
      }
      const parsed = parseStream(text);
      if (!parsed) return { error: 'Ответ пришел, но разобрать нечего', raw: text.slice(0, 500) };
      return parsed;
    } catch (e) {
      if (attempt < RETRIES) { await sleep(3000 * (attempt + 1)); continue; }
      return { error: String(e.message || e) };
    } finally {
      clearTimeout(timer);
    }
  }
}

const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

// ---------- прогон ----------
const today = new Date().toISOString().slice(0, 10);
const results = [];

for (const q of queries) {
  process.stdout.write(`${q.id.padEnd(6)} ${q.wordstat.slice(0, 34).padEnd(34)} `);
  const r = await ask(q.question);

  if (r.error) {
    console.log(`ошибка — ${r.error}`);
    results.push({ ...q, error: r.error });
    await sleep(PAUSE_MS);
    continue;
  }

  const sources = Array.isArray(r.sources) ? r.sources : [];
  const hosts = sources.map((s) => hostOf(s.url));
  const idx = hosts.findIndex((h) => h.endsWith(OUR_HOST));
  const hit = idx >= 0;
  const used = hit ? Boolean(sources[idx].used) : false;

  results.push({
    ...q,
    hit,
    position: hit ? idx + 1 : null,
    used,
    ourUrl: hit ? sources[idx].url : null,
    sourcesCount: sources.length,
    topHosts: [...new Set(hosts)].slice(0, 8),
    rejected: Boolean(r.isAnswerRejected),
    answer: r.message?.content || '',
    sources: sources.map((s) => ({ url: s.url, title: s.title, used: Boolean(s.used) })),
  });

  console.log(
    hit
      ? `ЕСТЬ — источник №${idx + 1} из ${sources.length}${used ? ', в ответ пошел' : ', не использован'}`
      : `нет — ${sources.length} источников: ${[...new Set(hosts)].slice(0, 3).join(', ')}`
  );
  await sleep(PAUSE_MS);
}

// ---------- запись ----------
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
const runFile = join(LOG_DIR, `${today}.json`);
writeFileSync(runFile, JSON.stringify({ date: today, host: OUR_HOST, results }, null, 2) + '\n', 'utf8');

if (!existsSync(HISTORY)) {
  writeFileSync(HISTORY, 'date;id;wordstat;hit;position;used;sources;top_hosts\n', 'utf8');
}
const rows = results
  .filter((r) => !r.error)
  .map((r) => [today, r.id, r.wordstat, r.hit ? 1 : 0, r.position ?? '', r.used ? 1 : 0, r.sourcesCount, (r.topHosts || []).slice(0, 5).join(' ')].join(';'))
  .join('\n');
if (rows) appendFileSync(HISTORY, rows + '\n', 'utf8');

// ---------- итог ----------
const ok = results.filter((r) => r.hit).length;
const errors = results.filter((r) => r.error).length;
const spent = (results.length - errors) * PRICE;
console.log(`\nПопаданий в источники: ${ok} из ${results.length - errors}. Ошибок: ${errors}. Потрачено: ~${spent.toFixed(0)} ₽.`);
console.log(`Подробности: ${runFile}`);
console.log(`История: ${HISTORY}`);
