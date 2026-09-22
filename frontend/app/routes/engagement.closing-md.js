import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';

export async function loader({ request, params }) {
  const user = await requireUser(request);
  let saved;
  try {
    saved = await discovery().getClosingDocument(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
  if (!saved.document) throw new Response('No Discovery Closing Document saved yet', { status: 404 });
  return new Response(saved.document.markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.client}-discovery-closing-document-v${saved.version ?? '1.0'}.md"`,
      'Cache-Control': 'no-store',
    },
  });
}
