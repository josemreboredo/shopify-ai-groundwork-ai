import { Link } from 'react-router';

export const meta = () => [
  { title: 'How it works · Merkle Discovery' },
  { name: 'description', content: 'How the tool cross-checks every answer against Shopify’s own documentation, how decisions are sourced, what the code decides rather than the model, and why a human still reviews everything.' },
];

/** The chain one requirement travels, from what the client said to what we can defend. */
const CHAIN = [
  ['The client says something', 'Swiss watch retailer: “customers should get a prepaid return label in the box.”', 'Q5.2.7 — how do customers send items back?'],
  ['The tool looks it up, it does not remember', 'Shopify’s own page on return labels: buying return labels through Shopify is documented for fulfilment locations in the United States.', 'help.shopify.com · return labels'],
  ['It maps need against documentation', 'The client fulfils from Switzerland, so the native feature does not reach this requirement. That is a fact about the platform, not an opinion about the client.', 'Q1.1.2 + Q5.1.3 + the source'],
  ['It resolves at the cheapest level that works', 'Native → app → theme → custom. Native cannot do it here, so it proposes a returns app, and has to say why native was not enough.', 'capability_map.why_this_level'],
  ['It writes it down so you can check it', 'The requirement in the client’s own words, the question it came from, the decision, the limit that remains, and the Shopify URL that proves it.', 'Every row carries question_ids + sources'],
];

/** The guardrails that are code, not good intentions. */
const REFUSALS = [
  ['An unsourced Shopify claim', 'The draft is rejected before it can be saved: “cite at least one official Shopify source”. Only help.shopify.com, shopify.dev, shopify.com, changelog.shopify.com and apps.shopify.com count. Agency blogs never do.'],
  ['A decision with no client answer behind it', '“found it on at least one client answer (question id)”. A recommendation that traces to nothing is not a recommendation.'],
  ['A recommendation the engine derived, typed in as an answer', 'Derived fields cannot be recorded through the interview, the web app or the connector. The model cannot quietly overwrite what the rules decided.'],
  ['Missing facts, filled with invention', 'The engine raises a flag naming what is missing and who owns it, and still produces a recommendation marked “to validate” with its assumptions listed. It never guesses silently.'],
  ['Internal pricing in a client document', 'Offer logic and price bands are stripped from everything the client can see, and a test fails if they ever appear.'],
];

const HUMAN = [
  ['The Lead Consultant owns the client', 'Every answer the AI proposes from a document stays marked “to confirm” until a human confirms it. Nothing reaches a client deck without the consultant reading it.'],
  ['The engine owns the commercials', 'Offer size, scope gates, exit rules and the plan are computed by ordinary code — the same answers always give the same result. The model cannot invent a commitment.'],
  ['The model owns the drafting', 'Reading documents, mapping a need onto the platform, weighing options, writing the argument. Where it is strong, and where its work is checkable.'],
  ['You own the review', 'Treat the output like a pull request from a capable colleague who is new to the client: read the diff, check the sources, push back on the reasoning. That is the job — not rubber-stamping, and not rewriting from scratch.'],
];

const FACTS = [
  ['298', 'discovery questions, each carrying why it matters and the Shopify documentation behind it'],
  ['23', 'exit rules applied by code, identically on every engagement'],
  ['19', 'Shopify plan rules, each citing the help page that sets the limit'],
  ['224', 'automated tests that have to pass before anything ships'],
];

export default function HowItWorks() {
  return (
    <main className="story">
      <header className="page-head">
        <p className="eyebrow">How it works</p>
        <h1>Sourced, or it does not ship</h1>
        <p className="lede">
          The model does not answer Shopify questions from memory. It maps what the client said onto
          Shopify’s own documentation, and everything it writes carries three things: the question the
          need came from, the official page that proves the answer, and why that answer and not a
          cheaper one. If any of the three is missing, the tool refuses to save the draft.
        </p>
        <ul className="stats">
          {FACTS.map(([n, label]) => <li key={n}><strong>{n}</strong><span>{label}</span></li>)}
        </ul>
      </header>

      <section>
        <h2>One requirement, end to end</h2>
        <p className="muted">A real example from the question bank, not an illustration.</p>
        <ol className="steps">
          {CHAIN.map(([title, body, trace]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
              <p className="trace">{trace}</p>
            </li>
          ))}
        </ol>
        <div className="callout">
          <p>
            The output is not “use a returns app”. It is: <strong>this requirement</strong>, from{' '}
            <strong>this answer</strong>, resolved at <strong>this level</strong>, because{' '}
            <strong>this Shopify page</strong> says the native feature stops here — and here is what
            it still will not cover. That last part is what protects the proposal.
          </p>
        </div>
      </section>

      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">The part that is not AI</p>
          <h2 className="plain">Code decides. The model drafts. A human owns the client.</h2>
          <p className="lede">
            The risk with AI in pre-sales is not bad writing — it is an invented commitment. So the
            commercial logic is ordinary, testable code that behaves identically every time it runs,
            and the model is used where its work can be checked against a source.
          </p>
          <div className="grid-2">
            {HUMAN.map(([title, body]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>What the tool refuses to do</h2>
        <p className="muted">These are checks in the code, with tests behind them — not promises in a slide.</p>
        <div className="grid-2">
          {REFUSALS.map(([title, body]) => (
            <article className="card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">Worked example</p>
          <h2 className="plain">How a real architecture decision gets made</h2>
          <p>
            On any engagement with more than one country, one of the most expensive decisions is how
            many Shopify stores the business runs on. The client is never asked to choose it — most
            clients have never heard of an expansion store, and a consultant running an interview is
            not running a solution workshop.
          </p>
          <p>
            Instead the questionnaire asks six things any country manager or controller can answer:
            which company invoices the customer in each country, where the business is registered for
            tax, whether the range is the same, where stock sits, who runs each country day to day,
            and whether wholesale has its own team. The engine turns those facts into a
            recommendation, and shows its working: which criterion fired, the answers behind it, the
            options it rejected and why, what it had to assume, and which unanswered questions would
            change the outcome — ranked, so the consultant knows what to chase first.
          </p>
          <p>
            Where an option is ruled out, it says so with the source. Shopify Managed Markets, for
            example, is documented as available to businesses in the continental United States and
            certain stores in Canada and the United Kingdom, and its documentation states it does not
            support B2B or multiple business entities. For a Swiss B2B client the tool does not
            quietly omit it — it shows it as ruled out, names the failing condition, and links the
            page.
          </p>
          <p className="muted">
            And where Shopify publishes nothing — there is no official side-by-side comparison of one
            store with Markets versus expansion stores — the documentation says so explicitly rather
            than dressing an opinion up as a platform limit.
          </p>
        </div>
      </section>

      <section>
        <h2>Where it can still be wrong</h2>
        <div className="grid-3">
          <div>
            <h3>Documentation moves</h3>
            <p>Every Shopify fact carries the date it was verified. Shopify ships twice a year in Editions, and a fact checked last quarter can be stale. The dates are in the annex so a reviewer can see the age of what they are reading.</p>
          </div>
          <div>
            <h3>A source can be read wrong</h3>
            <p>The link is there so you can check the reading, not to prove nobody has to. The most common failure is a limit that applies only in one region — several Shopify features are US-only — being read as general.</p>
          </div>
          <div>
            <h3>The client can be wrong too</h3>
            <p>Answers from an RFP stay marked “to confirm” until the consultant confirms them with the client. A sourced recommendation built on an unconfirmed answer is still built on sand.</p>
          </div>
        </div>
        <div className="callout">
          <p>
            <strong>So it is reviewed.</strong> As with any AI-generated work, a human reads the
            outcome before it goes anywhere — and the tool is built to make that review fast: the
            claim, its source and the answer it rests on are always next to each other, so checking
            takes seconds rather than a re-run of the research.
          </p>
        </div>
      </section>

      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">What this is for</p>
          <h2 className="plain">It fills a gap. It does not replace anyone.</h2>
          <p className="lede">
            Merkle has senior commerce consultants. It has far fewer people who know what Shopify
            Payments does per country, when Markets needs a second store, or what B2B costs on each
            plan. The gap is Shopify depth, not consulting ability — and that gap is what makes the
            quality of a discovery depend on who happens to run it.
          </p>
          <div className="grid-2">
            <div>
              <h3>What it gives a consultant</h3>
              <p>
                The platform knowledge at the moment they need it: each question explains why it is
                being asked, what the realistic options are, where the platform stops, and the page
                that says so. A commerce consultant can run a credible Shopify conversation without
                being a Shopify specialist — and comes out of it better at Shopify than they went in.
              </p>
            </div>
            <div>
              <h3>What it gives a specialist</h3>
              <p>
                The research they would have done by hand, already done and cited, so their time goes
                into the judgement calls the documentation cannot make: what this particular client
                can operate, what the estimate should be, what to argue for and what to refuse.
              </p>
            </div>
          </div>
          <p className="byline">Built by Jose Reboredo · Principal Commerce Consultant, CE</p>
        </div>
      </section>

      <section>
        <h2>Read it like a pull request</h2>
        <p>
          The fastest way to judge the tool is to check its work. Open a closing document, pick the
          decision you would most like to disagree with, and follow it back: the recommendation, the
          answers it rests on, and the Shopify page it cites. If the source does not say what the
          document says it says, that is a bug — and it is one worth reporting, because the sourcing
          rule is the whole point.
        </p>
        <div className="actions">
          <Link className="button" to="/about">What this is and why we built it</Link>
          <Link className="button secondary" to="/manual">The Lead Consultant manual</Link>
        </div>
      </section>
    </main>
  );
}
