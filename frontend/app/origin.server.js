import { getPublicOrigin } from 'mcp-handler';

/** Public origin behind Vercel's proxy (or PUBLIC_ORIGIN when set). @param {Request} request */
export const originOf = (request) => (process.env.PUBLIC_ORIGIN ?? getPublicOrigin(request)).replace(/\/$/, '');

export const jsonResponse = (body, status = 200, headers = {}) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*', ...headers } });
