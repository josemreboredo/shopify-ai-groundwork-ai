import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { clientPart } from '../../../discovery/agents/discovery-deck/build.js';

export async function loader({ request, params }) {
  const user = await requireUser(request);
  let saved;
  try {
    saved = await discovery().getClosingDocument(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
  if (!saved.document) throw new Response('No Discovery Closing Document saved yet', { status: 404 });
  // The document's consultant-notes section carries Merkle's price band, the
  // modifiers and the commercial warnings. This returned the whole file to
  // anyone signed in, and sign-in is open to any GitHub account.
  const markdown = saved.pricing ? saved.document.markdown : clientPart(saved.document.markdown);
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.client}-discovery-closing-document-v${saved.version ?? '1.0'}.md"`,
      'Cache-Control': 'no-store',
    },
  });
}
