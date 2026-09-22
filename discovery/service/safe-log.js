import { findPersonalData } from '../agents/discovery/input.js';

/**
 * Log a message, refusing to emit it in production if the payload contains
 * personal data (per CLAUDE.md: never log PII).
 *
 * @param {'log' | 'warn' | 'error' | 'info'} level
 * @param {string} message
 * @param {unknown} [data]
 * @throws {Error} in production when `data` contains an e-mail, phone number, or card number
 */
export function safeLog(level, message, data) {
  if (data !== undefined && process.env.NODE_ENV === 'production') {
    const reasons = findPersonalData(JSON.stringify(data));
    if (reasons.length) {
      throw new Error(`Refusing to log "${message}": payload ${reasons.join(', ')}`);
    }
  }
  // eslint-disable-next-line no-console
  console[level](message, ...(data === undefined ? [] : [data]));
}
