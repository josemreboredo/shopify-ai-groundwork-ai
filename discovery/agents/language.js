/**
 * @file language.js
 * @description The languages an engagement can be run in, and the language a
 * generated document is written in.
 *
 * An engagement is run in a language — `npm run interview -- --language de` — and
 * until now that governed only what was *asked*. Everything the tool produced came
 * out in English, including the two things that are, by definition, sent to the
 * client: the clarification questions on an RFP, and the proposal itself. A German
 * client was asked in German in the room and sent an English document after it.
 *
 * So the rule is the one the Lead Consultant would apply by hand. Anything the
 * client reads is written in the engagement's language. Anything Merkle reads —
 * what we would assume, what it costs if we are wrong, which discovery question it
 * covers — stays in English, so one engagement reads in one language on our side
 * whatever language it is run in.
 *
 * Three languages, and the list is closed. It used to be any two-letter code the
 * regex would take, and the app offered five: an Italian engagement was accepted,
 * recorded as Italian, and then asked and answered entirely in English — a label
 * with nothing behind it. A language is supported here when the question bank can
 * be shown in it, and it is offered nowhere else.
 *
 * This sits at the agents root because three prompts need it and the dependency
 * only ever runs one way: the service imports the agents, never the reverse.
 *
 * @module agents/language
 */

/** Language names in the language itself — for the consultant's own notices. */
export const LANGUAGE_NAMES = { en: 'English', de: 'Deutsch', fr: 'Français' };

/**
 * The same languages named in English, because that is the language the
 * instruction itself is written in: "Write in German", never "Write in Deutsch".
 */
export const LANGUAGE_IN_ENGLISH = { en: 'English', de: 'German', fr: 'French' };

/** Every language an engagement can be run in. English is the source. */
export const LANGUAGES = Object.keys(LANGUAGE_NAMES);

/** @param {string} [language] */
export const supported = (language) => LANGUAGES.includes(String(language ?? '').toLowerCase());

/** @param {string} [language] */
export const isEnglish = (language) => !language || String(language).toLowerCase() === 'en';

/** @param {string} [language] */
export const englishNameOf = (language) => LANGUAGE_IN_ENGLISH[String(language ?? '').toLowerCase()] ?? null;

/**
 * What must survive translation untouched. Two of these are correctness and one
 * is honesty: a Shopify feature renamed into German cannot be checked against the
 * page that proves it, and a requirement paraphrased out of the client's own
 * wording is no longer the thing they asked for.
 */
const NEVER_TRANSLATED = `Leave these in the original, whatever language you are writing in: Shopify's own product names (Shopify Markets, Shopify Plus, Translate & Adapt, Hydrogen, Shopify Tax), every documentation URL you cite, question and requirement identifiers, and anything you quote from the client's own document — quote that exactly as they wrote it, in the language they wrote it in.`;

/**
 * The instruction that goes at the top of a prompt whose output a client reads.
 *
 * Empty for English, so an English engagement's prompt is byte-for-byte the one
 * that was written and tested for it.
 *
 * @param {string} [language]  ISO 639-1, from the interview session
 * @param {object} [options]
 * @param {string} [options.what]     a clause naming the client-facing part, written to
 *   stand as its own sentence — it is followed by "— so write it in German"
 * @param {string} [options.internal] what stays in English, if anything does
 * @returns {string} a block ending in a separator, or '' for English
 */
export function writeInLanguage(language, { what, internal } = {}) {
  if (isEnglish(language)) return '';
  const name = englishNameOf(language);
  if (!name) return '';
  return `**Write in ${name}.** This engagement is run in ${name}. ${what ?? 'What you are writing reaches the client as you write it'} — so write it in ${name}, the way a senior consultant writes to a client in ${name}, and not an English sentence carried across word by word. A clause that does not survive the move is rewritten, not transliterated.

${internal ? `${internal} stays in English: that part is read inside Merkle, and an engagement that reads in two languages on our own side is one nobody reviews properly.\n\n` : ''}${NEVER_TRANSLATED}

---

`;
}

/**
 * What language each thing the model wrote is actually in, and whether that is
 * still the engagement's language.
 *
 * The engagement's language can be corrected at any time; a document that was
 * already written cannot re-write itself. Anything from before the stamp existed
 * reports `unknown` rather than guessing — a document claiming a language it was
 * never checked against is worse than one admitting it does not know.
 *
 * @param {object} session
 * @returns {{ what: string, language: string|null, matches: boolean, where: string, detail?: string }[]}
 */
export function writtenIn(session) {
  const now = session?.language ?? 'en';
  const out = [];
  const add = (what, language, where, detail) => out.push({
    what,
    language: language ?? null,
    matches: language ? language === now : false,
    where,
    ...(detail ? { detail } : {}),
  });

  const clarifications = session?.closing?.clarifications;
  if (clarifications?.questions?.length) {
    const sent = clarifications.questions.filter((q) => (q.status ?? 'proposed') === 'accepted').length;
    add(
      `${clarifications.questions.length} clarification question${clarifications.questions.length === 1 ? '' : 's'}`,
      clarifications.language,
      'clarifications',
      sent ? `${sent} of them accepted to send` : undefined,
    );
  }

  const document = session?.closing?.document;
  if (document) {
    add(`the document, version ${document.version ?? '1.0'}`, document.language, 'closing-document');
  }
  for (const old of session?.closing?.history ?? []) {
    add(`the document, version ${old.version ?? '1.0'}`, old.language, 'closing-document');
  }
  return out;
}
