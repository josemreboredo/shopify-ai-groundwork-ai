import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';

/** The annex document (Markdown) of the saved Discovery Closing Document. */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const annex = await discovery().getClosingAnnex(user, params.client);
    if (!annex) throw new Response('No annex saved for this engagement', { status: 404 });
    return new Response(annex.markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${params.client}-discovery-annex.md"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Response) throw err;
    throw serviceFailure(err);
  }
}
