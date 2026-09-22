import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { renderSummaryMarkdown } from '../../../discovery/service/summary.js';

export async function loader({ request, params }) {
  const user = await requireUser(request);
  let summary;
  try {
    summary = await discovery().getSummary(user, params.client);
  } catch (err) {
    throw serviceFailure(err);
  }
  return new Response(renderSummaryMarkdown(summary), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.client}-discovery-summary.md"`,
      'Cache-Control': 'no-store',
    },
  });
}
