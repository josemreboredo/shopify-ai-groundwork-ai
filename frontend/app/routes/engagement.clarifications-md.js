import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { renderClarificationsMarkdown } from '../../../discovery/service/clarifications-view.js';

/**
 * The questions as a file. Two versions from one route: the client-facing one by
 * default, the internal copy only when it is asked for by name — so the download
 * a consultant reaches for first is always the one that is safe to send.
 */
export async function loader({ request, params }) {
  const user = await requireUser(request);
  const internal = new URL(request.url).searchParams.get('internal') === '1' && saved.pricing;
  let saved;
  try {
    saved = await discovery().getClarifications(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
  const markdown = renderClarificationsMarkdown(saved.engagement, saved.clarifications, { internal, assumptions: saved.assumptions });
  const name = `${params.client}-clarification-questions${internal ? '-internal' : ''}.md`;
  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'no-store',
    },
  });
}
