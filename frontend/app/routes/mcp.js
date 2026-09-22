/**
 * "Merkle Discovery" connector endpoint for Claude (remote MCP, Streamable HTTP, OAuth).
 */
import { createMcpHandler, withMcpAuth } from 'mcp-handler';

import { registerDiscoveryTools, SERVER_INSTRUCTIONS } from '../../../discovery/service/mcp.js';
import { userForLogin } from '../auth.server.js';
import { discovery, oauth } from '../discovery.server.js';
import { originOf } from '../origin.server.js';

let handler;

function mcp() {
  handler ??= withMcpAuth(
    createMcpHandler(
      (server) => registerDiscoveryTools(server, { service: discovery(), userOf: (ctx) => ctx.http?.authInfo?.extra?.user ?? null }),
      { serverInfo: { name: 'merkle-discovery', version: '2.0.0' }, instructions: SERVER_INSTRUCTIONS },
    ),
    async (request, bearer) => {
      const grant = await oauth().verify(bearer, originOf(request));
      const user = grant ? userForLogin(grant.login) : null;
      if (!grant || !user) return undefined;
      return { token: bearer, clientId: grant.client_id, scopes: grant.scopes, expiresAt: grant.expires_at, extra: { user } };
    },
    { required: true, resourceMetadataPath: '/.well-known/oauth-protected-resource/mcp' },
  );
  return handler;
}

export const loader = ({ request }) => mcp()(request);
export const action = ({ request }) => mcp()(request);
