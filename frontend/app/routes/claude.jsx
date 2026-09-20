import { requireUser } from '../auth.server.js';
import { originOf } from '../origin.server.js';
import { PROJECT_INSTRUCTIONS, PROJECT_NAME, connectorUrl } from '../../../discovery/service/project-kit.js';
import { CONNECTOR, pageTitle } from '../brand.js';

export const meta = () => [{ title: pageTitle('Claude Project') }];

export async function loader({ request }) {
  await requireUser(request);
  return { url: connectorUrl(originOf(request)), instructions: PROJECT_INSTRUCTIONS, projectName: PROJECT_NAME };
}

export default function Claude({ loaderData }) {
  const { url, instructions, projectName } = loaderData;
  return (
    <main id="main">
      <header className="page-head">
        <p className="eyebrow">Claude Project</p>
        <h1>Work on an engagement from Claude</h1>
      </header>
      <p>Your private Claude Project and this web app share the same engagement: upload RFPs and other documents to the Project, and Claude records what it finds here — as answers <strong>to confirm</strong> that you review on the engagement page.</p>
      <p className="error">Pilot: demo or anonymised documents and engagements only.</p>

      <h2>1. Add the connector (once)</h2>
      <ol>
        <li>In Claude, open <strong>Customize → Connectors → Add custom connector</strong>.</li>
        <li>Name: <code>{CONNECTOR}</code> · MCP server URL: <code>{url}</code></li>
        <li>Authentication: <strong>Sign in now</strong> · OAuth client: <strong>Use Claude's published identity</strong>. If that option isn't offered, choose <strong>Use your own OAuth client</strong> with client ID <code>merkle-discovery-claude</code> and no secret.</li>
        <li>Claude opens this web app: sign in with GitHub and click <strong>Allow</strong>.</li>
      </ol>

      <h2>2. Create a private Project per engagement</h2>
      <ol>
        <li>In Claude, create a <strong>Project</strong> named <code>{projectName}</code>. Keep it private — connectors only work in private Projects on Team and Enterprise plans.</li>
        <li>Paste the instructions below into the Project instructions and replace <code>&lt;client slug&gt;</code>.</li>
        <li>Upload the RFP and other documents to the Project knowledge.</li>
        <li>In a chat in the Project, enable <strong>{CONNECTOR}</strong> under <strong>+ → Connectors</strong> and ask Claude to process the documents.</li>
      </ol>

      <h2>3. Project instructions</h2>
      <textarea readOnly rows={24} value={instructions} />
    </main>
  );
}
