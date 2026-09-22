import { findPersonalData } from '../agents/discovery/input.js';

/**
 * Log, refusing to emit in production if any argument contains personal data
 * (per CLAUDE.md: never log PII). Takes the same arguments as console[level]
 * — a single pre-formatted JSON string, or a message plus a data object — so
 * it drops into an existing console.log call site unchanged.
 *
 * @param {'log' | 'warn' | 'error' | 'info'} level
 * @param {...unknown} args
 * @throws {Error} in production when an argument contains an e-mail, phone number, card number, or a named individual
 */
export function safeLog(level, ...args) {
  if (process.env.NODE_ENV === 'production') {
    const text = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    const reasons = findPersonalData(text);
    if (reasons.length) throw new Error(`Refusing to log: payload ${reasons.join(', ')}`);
  }
  console[level](...args);
}
