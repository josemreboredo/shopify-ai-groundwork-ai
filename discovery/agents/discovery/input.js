/**
 * @file input.js
 * @description Questionnaire input guards (ADR 0007): consent check and
 * redaction of personal data before any LLM call. Fails closed when the input
 * looks like it contains customer records or card data.
 *
 * @module discovery/input
 */

export class InputRejectedError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'InputRejectedError';
  }
}

/** More e-mail addresses than this suggests pasted customer data. */
const MAX_EMAILS = 3;

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// International numbers only (+CC or 00CC prefix) — avoids matching dates, SKUs and volumes.
const PHONE = /(?:\+|\b00)\d{1,3}[\s.-]?(?:\(?\d{1,4}\)?[\s.-]?){2,5}\d{2,4}\b/g;
const CARD_CANDIDATE = /\b(?:\d[ -]?){13,19}\b/g;
/**
 * A person's name written down almost always sits next to their role, the way
 * a consultant actually types it ("Jane Doe, the CFO", "the CFO, Jane Doe").
 * This cannot catch a bare name in prose — that needs a language model, not a
 * regex — but it catches the common, concrete shape free-text notes take.
 *
 * Kept to unambiguous C-suite titles only (not "Director"/"Manager"/"Lead"/
 * "Partner"): those are common words in ordinary business text (a RACI table's
 * "role" column, "the IT Manager role") and a two-capitalised-word phrase sits
 * next to one constantly without naming anyone — "Managing Director" next to
 * "IT Lead" in adjacent table rows was one such false positive caught in
 * testing. The window also stops at a newline or "|" so it cannot cross a
 * table row/cell boundary the way that one did.
 */
const ROLE_WORD = 'CEO|CFO|COO|CTO|CMO|CHRO|CIO|Chief [A-Za-z]+ Officer|Founder';
const NAME_WORD = "[A-Z][a-zA-Z'-]+ [A-Z][a-zA-Z'-]+";
// No 'g' flag: used only with .test(), which — unlike .match() — carries
// lastIndex state across calls on a global regex and would silently miss
// matches in a later call that starts mid-string from the previous one.
const NAME_NEAR_ROLE = new RegExp(`\\b(?:${NAME_WORD})\\b[^.\\n|]{0,40}\\b(?:${ROLE_WORD})\\b|\\b(?:${ROLE_WORD})\\b[^.\\n|]{0,40}\\b(?:${NAME_WORD})\\b`);

/**
 * Text of one question block: from its "**Qx.y.z**" marker up to the next
 * question marker or heading.
 *
 * @param {string} markdown
 * @param {string} questionId
 * @returns {string|null}
 */
function questionBlock(markdown, questionId) {
  const start = markdown.indexOf(`**${questionId}**`);
  if (start === -1) return null;
  const rest = markdown.slice(start + questionId.length + 4);
  const end = rest.search(/\n\*\*Q\d+\.\d+\.\d+\*\*|\n#{1,3} /);
  return end === -1 ? rest : rest.slice(0, end);
}

/**
 * True when Q10.5.2 (consent for AI processing) is ticked "Yes" and not "No".
 *
 * @param {string} markdown
 * @returns {boolean}
 */
export function hasConsent(markdown) {
  const block = questionBlock(markdown, 'Q10.5.2');
  if (!block) return false;
  return /^\s*- \[[xX]\] Yes\b/m.test(block) && !/^\s*- \[[xX]\] No\b/m.test(block);
}

/** @param {string} digits */
function passesLuhn(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

/**
 * Blank the "name" column of the stakeholder table (Q10.2.1).
 *
 * @param {string} markdown
 * @returns {{ text: string, count: number }}
 */
function redactStakeholderNames(markdown) {
  const block = questionBlock(markdown, 'Q10.2.1');
  if (!block) return { text: markdown, count: 0 };

  const lines = block.split('\n');
  const header = lines.findIndex((l) => /^\|.*\|$/.test(l.trim()));
  if (header === -1) return { text: markdown, count: 0 };
  const cols = lines[header].split('|').slice(1, -1).map((c) => c.trim().toLowerCase());
  const nameIdx = cols.indexOf('name');
  if (nameIdx === -1) return { text: markdown, count: 0 };

  let count = 0;
  const redacted = lines.map((line, i) => {
    if (i <= header + 1 || !/^\|.*\|$/.test(line.trim())) return line;
    const cells = line.split('|');
    const value = cells[nameIdx + 1]?.trim();
    if (value && !['—', '-', 'n/a', ''].includes(value.toLowerCase())) {
      cells[nameIdx + 1] = ' [redacted-name] ';
      count++;
    }
    return cells.join('|');
  });
  return { text: markdown.replace(block, redacted.join('\n')), count };
}

/**
 * Personal data that must never be recorded as an answer.
 *
 * @param {string} text
 * @returns {string[]} reasons (empty when clean)
 */
export function findPersonalData(text) {
  const reasons = [];
  if ((text.match(EMAIL) ?? []).length) reasons.push('contains an e-mail address');
  if ((text.match(PHONE) ?? []).length) reasons.push('contains a phone number');
  for (const match of text.match(CARD_CANDIDATE) ?? []) {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 13 && passesLuhn(digits) && !/^(\d)\1+$/.test(digits)) {
      reasons.push('contains a payment card number');
      break;
    }
  }
  if (NAME_NEAR_ROLE.test(text)) reasons.push('names an individual by name and role — record the role only');
  return reasons;
}

/**
 * Remove personal data from a questionnaire before it is sent to an LLM.
 *
 * @param {string} markdown
 * @returns {{ text: string, redactions: { emails: number, phones: number, names: number } }}
 * @throws {InputRejectedError} when card numbers or many e-mail addresses are present
 */
export function redactQuestionnaire(markdown) {
  for (const match of markdown.match(CARD_CANDIDATE) ?? []) {
    const digits = match.replace(/\D/g, '');
    if (digits.length >= 13 && passesLuhn(digits) && !/^(\d)\1+$/.test(digits)) {
      throw new InputRejectedError('Questionnaire appears to contain a payment card number — remove it before running discovery.');
    }
  }

  const emails = markdown.match(EMAIL) ?? [];
  if (emails.length > MAX_EMAILS) {
    throw new InputRejectedError(
      `Questionnaire contains ${emails.length} e-mail addresses — customer data must not be included (ADR 0007).`,
    );
  }

  let text = markdown.replace(EMAIL, '[redacted-email]');
  const phones = text.match(PHONE) ?? [];
  text = text.replace(PHONE, '[redacted-phone]');
  const names = redactStakeholderNames(text);

  // Checked after the stakeholder table (Q10.2.1) is already redacted, so this
  // only catches a name written in prose elsewhere — the table's own names are
  // handled above and would otherwise trip this on the very data it redacts.
  if (NAME_NEAR_ROLE.test(names.text)) {
    throw new InputRejectedError('Questionnaire names an individual by name and role in free text — record the role only, remove the name.');
  }

  return {
    text: names.text,
    redactions: { emails: emails.length, phones: phones.length, names: names.count },
  };
}
