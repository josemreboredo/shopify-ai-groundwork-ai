/**
 * @file errors.js
 * @description The error every service operation throws, in its own module so the
 * closing-document helpers can throw it without importing the service.
 *
 * @module ai/shared/errors
 */

export class ServiceError extends Error {
  /**
   * @param {number} status @param {string} message @param {string[]} [errors]
   * @param {{ question_id?: string, what: string, why?: string }[]} [blockers]
   *   What to do about it, in the order it should be done. The UI turns each one
   *   into a link that opens the question, instead of asking the consultant to
   *   decode an engine message and go hunting through the review table.
   */
  constructor(status, message, errors = [], blockers = []) {
    super(message);
    this.status = status;
    this.errors = errors;
    this.blockers = blockers;
  }
}
