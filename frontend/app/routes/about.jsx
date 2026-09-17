import { Link } from 'react-router';

export const meta = () => [
  { title: 'What this is · Merkle Discovery' },
  { name: 'description', content: 'Why Merkle’s commerce practice built an AI-assisted Shopify discovery tool, how the AI is governed, and what the practice gets out of it.' },
];

/** Numbers that come from the repository, not from marketing. */
const STATS = [
  ['297', 'discovery questions, each one explaining why it matters for Shopify'],
  ['22', 'exit rules the engine applies — the same for every engagement'],
  ['8', 'verified Shopify reference chapters behind every recommendation'],
  ['29', 'slide templates the closing deck is built from'],
];

const PROBLEMS = [
  ['Shopify depth is scarce, commerce depth is not',
    'The practice has senior commerce consultants. It has far fewer people who know what Shopify Payments can do per country, when Markets needs a second store, or what B2B costs on each plan. Today the quality of a Shopify discovery depends on who happens to run it.'],
  ['Discovery is expensive and unbillable',
    'Pre-sales discovery is senior time spent before anything is signed. Every engagement restarts the same research, rebuilds the same deck and rewrites the same platform explanations.'],
  ['Scoping errors surface in delivery',
    'What gets missed in discovery — a market that needs its own entity, a tax rule Shopify cannot handle, a return flow that only works in the US — becomes a change request, a margin loss or a difficult conversation months later.'],
  ['Nothing compounds',
    'The research from one engagement stays in one deck on one consultant’s laptop. The next engagement starts at zero, and the platform has changed again in the meantime.'],
];

const STEPS = [
  ['Set up the engagement', 'The consultant opens an engagement in the tool and a private Claude Project, and uploads the client’s RFP, brief and requirements there. Nothing is processed until the client has agreed to AI processing — that consent is the first question, and the engine refuses every other answer before it.'],
  ['AI reads the documents', 'Claude reads the client’s documents, finds which discovery questions they already answer and records them with evidence: document, section, quote. They stay marked “to confirm” until the consultant confirms them.'],
  ['The consultant interviews the client', 'Only on what is still open. Each question carries a short briefing — why it matters for Shopify, the realistic options, the platform limits and the official source — so a commerce consultant runs a credible Shopify conversation without being a Shopify specialist.'],
  ['The engine decides', 'Offer size, scope gates, exit rules, app signals and open items are computed by code from the answers, identically for every engagement. The AI never decides the commercial outcome.'],
  ['AI drafts the closing document', 'Claude turns the answers plus verified Shopify documentation into the client deck: the decision taken per requirement, the pros and cons, what is standard, what is configuration, what needs an app, what needs custom work, and what cannot be covered. An annex carries the detailed analysis, the platform reference chapters and the bibliography. Every Shopify statement must cite an official source or the tool rejects the draft.'],
];

const DIVISION = [
  ['Code decides — always', 'Offer and scope classification · scope gates · exit rules and STOP routes · app signals · what is missing · whether a document is out of date'],
  ['AI drafts — never decides', 'Reading client documents · proposing answers with evidence · the architecture narrative · pros and cons per decision · the deck and the annex'],
  ['The consultant owns', 'The client relationship · confirming every AI-proposed answer · the final scope · what is shared with the client'],
];

const GUARDRAILS = [
  ['Consent before anything', 'The client’s agreement to AI processing is question one; nothing else can be recorded until it is given.'],
  ['No personal data', 'The tool records roles, never names, e-mail addresses or phone numbers, and refuses them on input.'],
  ['Sourced or rejected', 'Shopify statements carry an official source and a verification date. Unsourced content does not pass the engine.'],
  ['Internal pricing stays internal', 'Offer logic and price bands never reach a client-facing document.'],
  ['Versioned and traceable', 'Every document is versioned, and when answers change afterwards the tool says exactly which ones moved and what has to be redrafted.'],
];

const OUTCOMES = [
  ['Any commerce consultant can run a Shopify discovery', 'The platform knowledge sits in the questionnaire and the reference chapters, not only in the few people who have it.'],
  ['The same rigour in every engagement', 'The same 297 questions, the same 22 exit rules, the same document structure — whoever runs it, wherever they are.'],
  ['A defensible scope, earlier', 'Requirements the platform cannot meet surface in discovery, with the source that proves it, not in delivery.'],
  ['Knowledge that compounds', 'Every verified Shopify fact is written once into the shared reference and is used by every engagement after it.'],
  ['A handover the delivery team can use', 'The discovery ends in a Jira-ready backlog and a configuration workbook, not only in a deck.'],
  ['A pattern other practices can reuse', 'Nothing about the governed-AI method is Shopify-specific: the engine, the connector and the sourcing rule transfer to any platform we sell.'],
];

export default function About() {
  return (
    <main className="story">
      <header className="page-head">
        <p className="eyebrow">Merkle commerce practice</p>
        <h1>AI-assisted Shopify discovery</h1>
        <p className="lede">
          A tool that lets any Merkle commerce consultant run a Shopify discovery with the depth of a Shopify
          specialist, and close it with a sourced, client-ready solution document — with the AI kept firmly on
          the side of drafting, never deciding.
        </p>
        <ul className="stats">
          {STATS.map(([n, label]) => <li key={n}><strong>{n}</strong><span>{label}</span></li>)}
        </ul>
      </header>

      <section>
        <h2>The problem in the practice</h2>
        <div className="grid-2">
          {PROBLEMS.map(([title, body]) => (
            <article className="card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">The principle</p>
          <h2 className="plain">Code decides. AI drafts. The consultant owns the client.</h2>
          <p className="lede">
            The risk with AI in pre-sales is not that it writes badly — it is that it invents a commitment. So the
            commercial logic is ordinary, testable code that behaves the same way every time, and the AI is used
            where it is genuinely strong: reading documents, explaining trade-offs and writing well.
          </p>
          <div className="grid-3">
            {DIVISION.map(([title, body]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>How an engagement runs</h2>
        <ol className="steps">
          {STEPS.map(([title, body]) => (
            <li key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>What comes out of it</h2>
        <div className="grid-2">
          <article className="card">
            <h3>The client deck</h3>
            <p>
              A consulting document, not a questionnaire summary: the problem and what it costs today, the decision
              taken per requirement with its pros and cons, the architecture, the integrations, what is standard
              versus configuration versus app versus custom, the risks, what is out of scope and the roadmap.
            </p>
          </article>
          <article className="card">
            <h3>The annex</h3>
            <p>
              The reasoning behind each decision, the capability analysis, and Merkle’s verified Shopify reference
              chapters — plans, Markets, Managed Markets, Payments, B2B, migration, Liquid versus Hydrogen and
              agentic commerce — each with its sources and verification date, plus the full bibliography.
            </p>
          </article>
          <article className="card">
            <h3>The delivery handover</h3>
            <p>A Jira-ready backlog and a configuration workbook for tax, shipping and store set-up, so the build team starts from the discovery instead of re-interviewing the client.</p>
          </article>
          <article className="card">
            <h3>The internal summary</h3>
            <p>Offer size, scope gates, exit rules with their evidence, app signals and every open item — the Lead Consultant’s working view, never shared with the client.</p>
          </article>
        </div>
      </section>

      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">Governance</p>
          <h2 className="plain">Why this is safe to put in front of a client</h2>
          <dl className="rails">
            {GUARDRAILS.map(([title, body]) => (
              <div key={title}>
                <dt>{title}</dt>
                <dd>{body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section>
        <h2>What the practice gets</h2>
        <div className="grid-3">
          {OUTCOMES.map(([title, body]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <p className="muted">
          The pilot measures the claims rather than asserting them: senior hours per discovery, elapsed time from
          RFP to client document, how many requirements change scope after the sale, and how many discoveries are
          run by consultants without Shopify specialism.
        </p>
      </section>

      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">How it was built</p>
          <h2 className="plain">A method, not a prototype</h2>
          <p className="lede">
            The Shopify content is one instance of a pattern the practice can reuse: a deterministic engine for
            anything commercial, an AI connector so consultants work where they already work, a shared verified
            knowledge base with sources and dates, and safety rails — consent, no personal data, sourced claims —
            wired in rather than promised.
          </p>
          <p>
            It is built as a governed delivery workspace: architecture decisions recorded, security gates defined
            before the code, an automated test suite, and every platform fact checked against official Shopify
            documentation with the date it was verified. The same skeleton takes another platform, another
            practice or another offer by replacing the question bank and the rules.
          </p>
          <p className="byline">Built by Jose Reboredo · Merkle commerce practice</p>
        </div>
      </section>

      <section>
        <h2>Where it goes next</h2>
        <ul>
          <li><strong>Build tool.</strong> The same handover drives agents that configure the store and the theme from the agreed scope.</li>
          <li><strong>Beyond Shopify.</strong> The engine, the connector and the sourcing rule are platform-agnostic; the question bank is what makes it Shopify.</li>
          <li><strong>Enterprise footing.</strong> The pilot runs on demo and anonymised engagements; real client work moves to dentsu’s enterprise AI platform first.</li>
        </ul>
        <div className="actions">
          <Link className="button" to="/manual">Read the Lead Consultant manual</Link>
          <Link className="button secondary" to="/">See the engagements</Link>
        </div>
      </section>
    </main>
  );
}
