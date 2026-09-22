/**
 * @file xml.js
 * @description Minimal indented XML writer for the deck. Every <missing> is
 * recorded as a warning so the consultant sees what to complete.
 *
 * @module discovery-deck/xml
 */

// Characters illegal in XML 1.0 (C0 controls except tab/LF/CR, U+FFFE, U+FFFF),
// built from code points so the source file stays plain text.
const range = (from, to) => `${String.fromCharCode(from)}-${String.fromCharCode(to)}`;
const INVALID_XML = new RegExp(
  `[${range(0x00, 0x08)}${String.fromCharCode(0x0b)}${String.fromCharCode(0x0c)}${range(0x0e, 0x1f)}${String.fromCharCode(0xfffe)}${String.fromCharCode(0xffff)}]`,
  'g',
);

/**
 * Escape text for XML and strip illegal characters.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function esc(value) {
  return String(value)
    .replace(INVALID_XML, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** @param {unknown} v */
const isBlank = (v) =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

export class XmlWriter {
  constructor() {
    /** @type {string[]} */ this.lines = [];
    /** @type {string[]} */ this.warnings = [];
    /** @type {string[]} */ this.path = [];
    this.depth = 0;
  }

  /** @param {Record<string, unknown>} [attrs] */
  static attrs(attrs = {}) {
    return Object.entries(attrs)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => ` ${k}="${esc(v)}"`)
      .join('');
  }

  /** @param {string} line */
  push(line) {
    this.lines.push('  '.repeat(this.depth) + line);
  }

  /** @param {string} name @param {Record<string, unknown>} [attrs] */
  open(name, attrs) {
    this.push(`<${name}${XmlWriter.attrs(attrs)}>`);
    this.path.push(name);
    this.depth++;
  }

  close() {
    this.depth--;
    this.push(`</${this.path.pop()}>`);
  }

  /**
   * <name>value</name>, or <name><missing reason/></name> when blank.
   *
   * @param {string} name
   * @param {unknown} value
   * @param {string} [reason]
   * @param {Record<string, unknown>} [attrs]
   */
  field(name, value, reason, attrs) {
    if (isBlank(value)) {
      this.missing(name, reason ?? 'Not recorded in engagement.json', attrs);
      return;
    }
    this.push(`<${name}${XmlWriter.attrs(attrs)}>${esc(value)}</${name}>`);
  }

  /**
   * A list of <item> children.
   *
   * @param {string} name
   * @param {unknown[]|undefined} values
   * @param {string} [reason]
   */
  list(name, values, reason) {
    const items = (values ?? []).map((v) => String(v ?? '').trim()).filter(Boolean);
    if (items.length === 0) {
      this.missing(name, reason ?? 'Not recorded in engagement.json');
      return;
    }
    this.open(name);
    for (const item of items) this.field('item', item);
    this.close();
  }

  /** @param {string} name @param {string} reason @param {Record<string, unknown>} [attrs] */
  missing(name, reason, attrs) {
    const where = [...this.path.filter((p) => p !== 'discovery-deck'), name].join(' › ');
    this.warnings.push(`${where}: ${reason}`);
    this.push(`<${name}${XmlWriter.attrs(attrs)}><missing reason="${esc(reason)}"/></${name}>`);
  }

  /** @param {string} name @param {Record<string, unknown>} [attrs] */
  empty(name, attrs) {
    this.push(`<${name}${XmlWriter.attrs(attrs)}/>`);
  }

  toString() {
    return this.lines.join('\n');
  }
}
