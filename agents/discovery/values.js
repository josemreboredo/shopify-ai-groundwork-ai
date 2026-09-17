/**
 * @file values.js
 * @description Standard placeholder answers (question bank 1.1.0): `none`
 * (nothing needed) and `not_sure` (the client does not know yet). Rules and
 * lists read the real choices through `picked`; `not_sure` answers become open
 * items for follow-up.
 *
 * @module discovery/values
 */

export const NONE = 'none';
export const NOT_SURE = 'not_sure';
const PLACEHOLDERS = new Set([NONE, NOT_SURE]);

/** Real choices of a multi-select answer (without none / not_sure). @param {unknown} values */
export const picked = (values) => (Array.isArray(values) ? values.filter((v) => !PLACEHOLDERS.has(v)) : []);

/** True when an answer is, or contains, not_sure. @param {unknown} value */
export const isNotSure = (value) => value === NOT_SURE || (Array.isArray(value) && value.includes(NOT_SURE));
