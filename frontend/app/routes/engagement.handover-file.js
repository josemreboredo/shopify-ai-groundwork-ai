import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';

const FILES = {
  'handover-backlog.csv': { which: 'backlog.csv', type: 'text/csv; charset=utf-8', name: (c) => `${c}-backlog.csv` },
  'handover-backlog.md': { which: 'backlog.md', type: 'text/markdown; charset=utf-8', name: (c) => `${c}-backlog.md` },
  'handover-workbook.md': { which: 'workbook.md', type: 'text/markdown; charset=utf-8', name: (c) => `${c}-configuration-workbook.md` },
};

/**
 * One handover file, built exactly as the CLI builds it. Three downloads share a
 * route because they share every step but the last one.
 */
export async function loader({ request, params }) {
  const spec = FILES[new URL(request.url).pathname.split('/').at(-1)];
  if (!spec) throw new Response('Not found', { status: 404 });
  const user = await requireUser(request);
  let content;
  try {
    content = await discovery().getHandoverFile(user, params.client, spec.which);
  } catch (err) {
    throw serviceFailure(err);
  }
  return new Response(content, {
    headers: {
      'Content-Type': spec.type,
      'Content-Disposition': `attachment; filename="${spec.name(params.client)}"`,
      'Cache-Control': 'no-store',
    },
  });
}
