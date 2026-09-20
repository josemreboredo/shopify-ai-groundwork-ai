import { Link } from 'react-router';

export const meta = () => [
  { title: 'How it works · Merkle Discovery' },
  { name: 'description', content: 'Every recommendation traces back to the client’s own words and to Shopify’s own documentation — or the tool refuses to produce it.' },
];

/** The mechanism, in four moves. This is the whole page; everything else is proof. */
const FLOW = [
  ['01', 'The consultant knows what to ask, and why', 'Every question explains what it decides for the solution, so the conversation goes where it has to go — not where the client happens to lead it.'],
  ['02', 'Nothing the solution depends on is left unasked', 'The questionnaire adapts as answers land — an answer can open the questions it makes relevant and close the ones it rules out — and the engine keeps a live list of what is still missing.'],
  ['03', 'Business need becomes a platform question', 'The requirement is translated into what Shopify would have to do, and answered from documentation that was read and dated against the source — not from what a model remembers.'],
  ['04', 'The recommendation is the cross-check', 'Client need against documentation, with the alternatives weighed, and every line linked back to both: the answer it serves and the page that proves it.'],
];

const GUARANTEES = [
  {
    claim: 'Sourced, or it does not ship',
    line: 'Every Shopify statement carries an official source. Unsourced content is rejected before it can be saved.',
    detail: [
      'Only help.shopify.com, shopify.dev, shopify.com, changelog.shopify.com and apps.shopify.com count as sources. Agency blogs never do.',
      'A decision with no client answer behind it is rejected too: “found it on at least one client answer”. A recommendation that traces to nothing is not a recommendation.',
      'Alternatives are not optional: a decision that weighs fewer than two real options is rejected, and the most consequential ones — how many stores the markets run on — must weigh three and say why each was not taken.',
      'Where Shopify publishes nothing — there is no official comparison of one store against separate stores per country — the document says so, instead of dressing an opinion as a platform limit.',
      'What the check does not do: it proves the source is official and present, and a separate check proves the page still exists where we cite it. Neither proves the page says what the document says it says. That is the reviewer’s job, and the link is there to make it a ten-second job.',
    ],
  },
  {
    claim: 'The commercials are code, not AI',
    line: 'Offer size, scope, risks and the Shopify plan are computed by rules. The same answers always give the same result.',
    detail: [
      'The AI reads, maps and writes. It never sets the offer, the scope gates, the exit rules or the plan — those are ordinary code, tested, identical on every engagement.',
      'A recommendation the engine derived cannot be overwritten by the model, or typed in as an answer.',
      'Where facts are missing, the engine raises a flag naming what is missing and who owns it — and still recommends, marked “to validate”, with its assumptions listed. It never guesses silently.',
    ],
  },
  {
    claim: 'A human signs it',
    line: 'Nothing reaches a client without the Lead Consultant reading it. The tool is built to make that review fast.',
    detail: [
      'Answers the AI proposes from an RFP stay marked “to confirm” until the consultant confirms them with the client.',
      'The claim, its source and the answer it rests on always sit next to each other, so checking a decision takes seconds rather than a repeat of the research.',
      'As with any AI-generated work, the output is reviewed before it is used. The difference is how quickly it can be checked.',
    ],
  },
];

const LIMITS = [
  ['Documentation moves', 'Shopify ships twice a year, and help pages get renamed. The platform facts in the questionnaire and the reference chapters carry the date they were verified, and a script re-checks every cited page still exists where we cite it.'],
  ['A source can be misread', 'Several Shopify features are US-only. The link is there so the reading can be checked, not to prove nobody has to.'],
  ['The client can be wrong', 'A sourced recommendation built on an unconfirmed answer is still built on sand — which is why answers are confirmed first.'],
];

export default function HowItWorks() {
  return (
    <main className="story">
      <header className="page-head">
        <p className="eyebrow">How it works</p>
        <h1>Every recommendation, traceable</h1>
        <p className="lede">
          The model never answers from data it does not have. It works from what the client actually
          said and from Shopify’s own documentation, read against the source and dated — and where a
          claim has neither behind it, the tool refuses to produce it.
        </p>
      </header>

      <section>
        <div className="flow">
          {FLOW.map(([n, title, line]) => (
            <article key={n}>
              <p className="flow-n">{n}</p>
              <h3>{title}</h3>
              <p>{line}</p>
            </article>
          ))}
        </div>
        <p className="rule-line">No answer behind it, or no source under it — nothing is produced.</p>
      </section>

      {/* The same four steps, whichever way the information arrives */}
      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">Two ways in</p>
          <h2 className="plain">The same four steps, whether the client is answering us or we are answering them</h2>
          <div className="grid-2">
            <article className="card">
              <h3>An RFP arrives</h3>
              <p>
                The document is read in and every answer it already contains is recorded with the section and
                the sentence it came from. The engine then names the handful of things still missing that would
                change the solution — and those become the questions Merkle sends back inside the window,
                each one showing the trade-off it turns on. What is never answered is stated as an assumption
                in the proposal rather than quietly guessed.
              </p>
            </article>
            <article className="card">
              <h3>A discovery is run</h3>
              <p>
                The same questions are worked through with the client directly, in their language, over as many
                sessions as it takes. The engine keeps the live list of what is still open, and the engagement
                closes with the deck, the annex and the delivery backlog.
              </p>
            </article>
          </div>
          <p className="muted">
            One engine underneath: the same question bank, the same scope gates, the same verified Shopify
            documentation, the same offer. Only the door and what comes out of it differ.
          </p>
        </div>
      </section>

      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">Three guarantees</p>
          <div className="guarantees">
            {GUARANTEES.map((g) => (
              <article key={g.claim}>
                <h2 className="plain">{g.claim}</h2>
                <p className="lede">{g.line}</p>
                <details>
                  <summary>What that means in practice</summary>
                  <ul>{g.detail.map((d) => <li key={d}>{d}</li>)}</ul>
                </details>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>One example</h2>
        <p className="example">
          A Swiss retailer asks for prepaid return labels. Shopify documents that feature for
          fulfilment locations in the United States. The tool does not say “yes” and it does not say
          “no” — it says <strong>native stops here, for this reason, on this page</strong>, proposes
          the app that closes the gap, and states what the app still will not cover.
        </p>
        <details>
          <summary>Follow it step by step</summary>
          <ol>
            <li><strong>Q5.2.7</strong> — how do customers send items back? The client answers: prepaid label in the box.</li>
            <li>The tool opens Shopify’s page on return labels rather than recalling it, and reads the documented scope: US fulfilment locations.</li>
            <li>It checks that against two other answers — the company is Swiss (Q1.1.2) and fulfils from one Swiss location (Q5.1.3).</li>
            <li>It resolves the requirement at the cheapest level that works — native, then app, then theme, then custom — and must say why native was not enough.</li>
            <li>It writes the row: the requirement in the client’s words, the question it came from, the decision, the limit that remains, and the link. That last part is what protects the proposal.</li>
          </ol>
        </details>
      </section>

      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">Where it can still be wrong</p>
          <h2 className="plain">Stated plainly, because that is what makes it checkable</h2>
          <div className="grid-3">
            {LIMITS.map(([title, line]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>What it is for</h2>
        <p className="lede">
          Merkle has senior commerce consultants. It has far fewer people who know Shopify to the
          depth a proposal needs. The tool closes that gap — it does not close the consultant.
        </p>
        <div className="grid-2">
          <div>
            <h3>For a consultant</h3>
            <p>The platform knowledge at the moment they need it, so a commerce consultant can run a credible Shopify conversation — and comes out of it knowing more Shopify than they went in.</p>
          </div>
          <div>
            <h3>For a specialist</h3>
            <p>The research already done and cited, so their time goes into the judgement the documentation cannot make: what this client can operate, and what to argue for.</p>
          </div>
        </div>
        <div className="callout">
          <p>
            <strong>Judge it by checking it.</strong> Open a closing document, pick the decision you
            would most like to disagree with, and follow it back to the page it cites. If the source
            does not say what the document says it says, that is a bug worth reporting — the sourcing
            rule is the whole point.
          </p>
        </div>
        <div className="actions">
          <Link className="button" to="/about">What this is and why we built it</Link>
          <Link className="button secondary" to="/manual">The Lead Consultant manual</Link>
        </div>
      </section>
    </main>
  );
}
