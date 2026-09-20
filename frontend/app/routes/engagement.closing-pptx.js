import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { renderDeckPptx } from '../../../discovery/service/deck-render.js';
import { annexDeckFromMarkdown } from '../../../discovery/service/pptx.js';

/**
 * The closing deck as PowerPoint. `?part=annex` renders the annex document with
 * the reference chapters; `?internal=1` keeps the consultant notes.
 */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const saved = await discovery().getClosingDownloads(user, params.client);
    if (!saved) throw new Response('No Discovery Closing Document saved yet', { status: 404 });
    const url = new URL(request.url);
    const annex = url.searchParams.get('part') === 'annex';
    const internal = url.searchParams.get('internal') === '1' && saved.pricing;
    if (annex && !saved.annex) throw new Response('No annex saved for this engagement', { status: 404 });

    const deck = annex
      ? annexDeckFromMarkdown(saved.annex, { internal, client: params.client, date: saved.saved_at })
      : saved.deck ?? annexDeckFromMarkdown(saved.markdown, { internal, client: params.client, date: saved.saved_at, title: 'Discovery Closing Document' });

    const file = await renderDeckPptx(deck, { client: params.client, version: saved.version, internal, process: saved.process });
    const name = `${params.client}-discovery-${annex ? 'annex' : 'closing-document'}${internal ? '-internal' : ''}-v${saved.version}.pptx`;
    return new Response(file, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Response) throw err;
    throw serviceFailure(err);
  }
}
