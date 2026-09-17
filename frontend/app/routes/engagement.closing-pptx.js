import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { closingDocumentPptx } from '../../../discovery/service/pptx.js';

/** The saved Discovery Closing Document as a PowerPoint deck (?internal=1 keeps the consultant notes). */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const saved = await discovery().getClosingDocument(user, params.client);
    if (!saved.document) throw new Response('No Discovery Closing Document saved yet', { status: 404 });
    const internal = new URL(request.url).searchParams.get('internal') === '1';
    const file = await closingDocumentPptx(saved.document.markdown, {
      client: params.client,
      internal,
      date: saved.document.saved_at,
    });
    return new Response(file, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${params.client}-discovery-closing-document${internal ? '-internal' : ''}.pptx"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Response) throw err;
    throw serviceFailure(err);
  }
}
