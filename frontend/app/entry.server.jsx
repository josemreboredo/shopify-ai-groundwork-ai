/**
 * @file entry.server.jsx
 * @description The server render, with a nonce for the app's own inline scripts.
 *
 * The same render React Router and the Vercel preset use by default, plus one
 * thing: a nonce made for each response, set on the scripts React Router writes
 * into the page and added to that response's script-src. Without it the
 * site-wide policy blocked them and no page ever ran its JavaScript. The policy
 * a route chose — the connector's consent page widens form-action — is kept,
 * and only gets the nonce added.
 *
 * Written on the runtime dependencies only: @vercel/react-router is a build
 * dependency and is not there when the function runs.
 */
import { randomBytes } from 'node:crypto';
import { PassThrough } from 'node:stream';
import { createReadableStreamFromReadable } from '@react-router/node';
import { isbot } from 'isbot';
import { renderToPipeableStream } from 'react-dom/server';
import { ServerRouter } from 'react-router';

import { contentSecurityPolicy, withScriptNonce } from './utils/security-headers.js';

export const streamTimeout = 5_000;

export default function handleRequest(request, responseStatusCode, responseHeaders, routerContext) {
  const nonce = randomBytes(16).toString('base64');
  responseHeaders.set('Content-Security-Policy', withScriptNonce(responseHeaders.get('Content-Security-Policy') ?? contentSecurityPolicy(), nonce));

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get('user-agent');
    // Bots and SPA mode wait for everything; people get the shell first.
    const readyOption = (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady';
    const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} nonce={nonce} />, {
      nonce,
      [readyOption]() {
        shellRendered = true;
        const body = new PassThrough();
        responseHeaders.set('Content-Type', 'text/html');
        resolve(new Response(createReadableStreamFromReadable(body), { headers: responseHeaders, status: responseStatusCode }));
        pipe(body);
      },
      onShellError(error) {
        reject(error);
      },
      onError(error) {
        responseStatusCode = 500;
        // Shell errors reject and are logged by React Router; these come after.
        if (shellRendered) console.error(error);
      },
    });
    // Give rejected boundaries time to flush, then stop.
    setTimeout(abort, streamTimeout + 1000);
  });
}
