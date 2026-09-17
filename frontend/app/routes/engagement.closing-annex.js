import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';

/** The annex document (Markdown) with Merkle's reference chapters appended. */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const saved = await discovery().getClosingDownloads(user, params.client);
    if (!saved?.annex) throw new Response('No annex saved for this engagement', { status: 404 });
    return new Response(saved.annex, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${params.client}-discovery-annex-v${saved.version}.md"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Response) throw err;
    throw serviceFailure(err);
  }
}
