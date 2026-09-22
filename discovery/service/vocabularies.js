/**
 * @file vocabularies.js
 * @description Countries, currencies and languages as people type them —
 * "Switzerland", "Schweiz", "UK", "euros", "German" — resolved to the codes the
 * engagement schema stores (ISO 3166-1 alpha-2, ISO 4217, ISO 639-1 with an
 * optional region). Names come from Intl.DisplayNames in the discovery
 * languages. No schema import, so the web app can use the option lists in the
 * browser.
 *
 * @module discovery/service/vocabularies
 */

const NAME_LOCALES = ['en', 'de', 'fr', 'it', 'es'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Lower case, no accents, single spaces. @param {string} s */
const key = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function build(type, codes, aliases) {
  const names = new Map();
  const options = [];
  const english = new Intl.DisplayNames(['en'], { type, fallback: 'none' });
  for (const code of codes) {
    const label = english.of(code);
    if (!label) continue;
    options.push({ value: code, label });
    for (const locale of NAME_LOCALES) {
      const name = new Intl.DisplayNames([locale], { type, fallback: 'none' }).of(code);
      if (name) names.set(key(name), code);
    }
  }
  for (const [alias, code] of Object.entries(aliases)) names.set(key(alias), code);
  options.sort((a, b) => a.label.localeCompare(b.label));
  return { names, options, codes: new Set(options.map((o) => o.value)) };
}

const regionCodes = [...LETTERS].flatMap((a) => [...LETTERS].map((b) => a + b));
/** Country codes only: canonical (UK → GB) and not a group or private-use code. */
const NOT_COUNTRIES = new Set(['AA', 'EU', 'EZ', 'QO', 'UN', 'XA', 'XB', 'ZZ']);
const COUNTRIES = build('region', regionCodes.filter((c) => {
  const name = new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' }).of(c);
  return Boolean(name) && !NOT_COUNTRIES.has(c) && !/^Q[M-Z]$/.test(c) && Intl.getCanonicalLocales(`und-${c}`)[0] === `und-${c}`;
}), {
  UK: 'GB', 'Great Britain': 'GB', England: 'GB', Britain: 'GB', USA: 'US', 'United States of America': 'US', America: 'US',
  Holland: 'NL', 'Hong Kong': 'HK', Macau: 'MO', Macao: 'MO', 'Mainland China': 'CN', PRC: 'CN', Korea: 'KR', 'South Korea': 'KR', UAE: 'AE',
});

const CURRENCIES = build('currency', Intl.supportedValuesOf('currency'), {
  euro: 'EUR', euros: 'EUR', '€': 'EUR', dollar: 'USD', dollars: 'USD', 'us dollars': 'USD', $: 'USD', pound: 'GBP', pounds: 'GBP', sterling: 'GBP', '£': 'GBP',
  franc: 'CHF', francs: 'CHF', 'swiss francs': 'CHF', franken: 'CHF', yen: 'JPY', yuan: 'CNY', renminbi: 'CNY', rmb: 'CNY',
});

const languageCodes = [...LETTERS.toLowerCase()].flatMap((a) => [...LETTERS.toLowerCase()].map((b) => a + b));
const LANGUAGES = build('language', languageCodes, {
  'Traditional Chinese': 'zh-HK', 'Chinese (Traditional)': 'zh-HK', 'Simplified Chinese': 'zh-CN', 'Chinese (Simplified)': 'zh-CN',
  'Swiss German': 'de-CH', 'Brazilian Portuguese': 'pt-BR',
});

const VOCABULARIES = {
  country: { ...COUNTRIES, code: /^[A-Za-z]{2}$/, upper: (c) => c.toUpperCase(), example: 'Switzerland or CH' },
  currency: { ...CURRENCIES, code: /^[A-Za-z]{3}$/, upper: (c) => c.toUpperCase(), example: 'Swiss franc or CHF' },
  language: { ...LANGUAGES, code: /^[A-Za-z]{2,3}(-[A-Za-z]{2})?$/, upper: (c) => c.replace(/^([A-Za-z]+)(?:-([A-Za-z]{2}))?$/, (_, l, r) => (r ? `${l.toLowerCase()}-${r.toUpperCase()}` : l.toLowerCase())), example: 'German or de' },
};

/** Extra codes the schema allows beyond ISO names (e.g. EU as a market group). */
const EXTRA = { country: new Set(['EU']), currency: new Set(), language: new Set() };

export const DATE_PATTERN = '^\\d{4}-\\d{2}-\\d{2}$';

/**
 * A date as people type it → YYYY-MM-DD. Day first, as in Europe: 01/05/27,
 * 1.5.2027 and 01-05-2027 are 1 May 2027; 2027-05-01 is kept. Two-digit years
 * are 20xx. Returns null for anything that is not a real calendar date.
 *
 * @param {string} input
 */
export function resolveDate(input) {
  const text = String(input ?? '').trim();
  let y;
  let m;
  let d;
  let match;
  if ((match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text))) [, y, m, d] = match;
  else if ((match = /^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/.exec(text))) [, d, m, y] = match;
  else return null;
  const year = Number(y.length === 2 ? `20${y}` : y);
  const date = new Date(Date.UTC(year, Number(m) - 1, Number(d)));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== Number(m) - 1 || date.getUTCDate() !== Number(d)) return null;
  return date.toISOString().slice(0, 10);
}

/** Pattern in the engagement schema → vocabulary. @param {string|undefined} pattern */
export function vocabularyForPattern(pattern) {
  if (pattern === '^[A-Z]{2}$') return 'country';
  if (pattern === '^[A-Z]{3}$') return 'currency';
  if (pattern === '^[a-z]{2,3}(-[A-Z]{2})?$') return 'language';
  return null;
}

/**
 * Resolve what someone typed to a code. Accepts codes in any case, names in the
 * discovery languages, common aliases and "Name (CODE)" as offered in the web app.
 *
 * @param {'country'|'currency'|'language'} vocabulary
 * @param {string} input
 * @returns {string|null}
 */
export function resolveCode(vocabulary, input) {
  const v = VOCABULARIES[vocabulary];
  const text = String(input ?? '').trim();
  if (!text) return null;
  const inParens = /\(([^()]+)\)\s*$/.exec(text);
  const candidate = inParens ? inParens[1].trim() : text;
  if (v.code.test(candidate)) {
    const code = v.upper(candidate);
    if (EXTRA[vocabulary].has(code) || v.codes.has(code) || (vocabulary === 'language' && v.codes.has(code.split('-')[0]))) return code;
  }
  return v.names.get(key(text)) ?? v.names.get(key(candidate)) ?? null;
}

/** Options for pickers ({ value: code, label: English name }). @param {'country'|'currency'|'language'} vocabulary */
export const vocabularyOptions = (vocabulary) => VOCABULARIES[vocabulary].options;

/** Friendly hint for errors and placeholders. @param {'country'|'currency'|'language'} vocabulary */
export const vocabularyExample = (vocabulary) => VOCABULARIES[vocabulary].example;
