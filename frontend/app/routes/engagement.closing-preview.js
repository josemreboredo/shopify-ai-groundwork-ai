import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { deckToHtml } from '../../../discovery/service/deck-html.js';
import { annexDeckFromMarkdown } from '../../../discovery/service/pptx.js';

/** The deck in the browser, slide by slide. `?part=annex` previews the annex. */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const saved = await discovery().getClosingDownloads(user, params.client);
    if (!saved) throw new Response('No Discovery Closing Document saved yet', { status: 404 });
    const url = new URL(request.url);
    const annex = url.searchParams.get('part') === 'annex';
    const internal = url.searchParams.get('internal') === '1';
    if (annex && !saved.annex) throw new Response('No annex saved for this engagement', { status: 404 });

    const deck = annex
      ? annexDeckFromMarkdown(saved.annex, { internal, client: params.client, date: saved.saved_at })
      : saved.deck ?? annexDeckFromMarkdown(saved.markdown, { internal, client: params.client, date: saved.saved_at, title: 'Discovery Closing Document' });

    return new Response(deckToHtml(deck, { client: params.client, version: saved.version }), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    if (err instanceof Response) throw err;
    throw serviceFailure(err);
  }
}
