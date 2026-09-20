import { Link } from 'react-router';

import { PRODUCT, pageTitle } from '../brand.js';
import { stats } from '../facts.server.js';

export const meta = () => [
  { title: pageTitle('What this is') },
  { name: 'description', content: `Why Merkle’s commerce practice built ${PRODUCT}: one engine behind an RFP response and a Shopify discovery, with the commercials computed by code and the AI kept on drafting.` },
];

export function loader() {
  return { stats: stats() };
}

const PROBLEMS = [
  ['Shopify depth is scarce, commerce depth is not',
    'The practice has senior commerce consultants. It has far fewer people who know what Shopify Payments can do per country, when Markets needs a second store, or what B2B costs on each plan. Today the quality of a Shopify bid depends on who happens to write it.'],
  ['The expensive work happens before anything is signed',
    'Answering an RFP and running a pre-sales discovery are both senior time spent on a maybe. Every one restarts the same research, rebuilds the same deck and rewrites the same platform explanations.'],
  ['Scoping errors surface in delivery',
    'What gets missed up front — a market that needs its own entity, a tax rule Shopify cannot handle, a return flow that only works in the US — becomes a change request, a margin loss or a difficult conversation months later.'],
  ['Nothing compounds',
    'The research from one engagement stays in one deck on one consultant’s laptop. The next one starts at zero, and the platform has changed again in the meantime.'],
];

/** A bid and a discovery are two jobs, so the tool runs two flows. These are the steps it actually shows. */
const BID_STEPS = [
  ['Read the RFP', 'The documents go into your Claude Project and Claude records what they already answer — each one with the document, the section and the sentence it came from. The intake screen says how much each document actually produced, so one that gave nothing says so instead of looking successful.'],
  ['Confirm what it says', 'An extraction nobody has checked is not evidence. The review table confirms one answer or all of them, and until they are confirmed the tool will not let anyone stand behind a price.'],
  ['Go/No-Go support', 'Not the decision — that is taken in a room, by people who know the relationship, the competition and the pipeline. This is what the Solution Architect brings to that room: whether Merkle can put a number on this work and stand behind it, what it would cost to be wrong, and the facts underneath, in the order he would read them.'],
  ['RFP Q&A', 'Every RFP has a window for questions, and it is the first thing the client reads from us. The engine keeps only the unknowns that would change the offer, the plan, the store topology, the cost or the risk, and drops what it can safely assume — then it becomes a document you can send.'],
  ['Write the proposal', 'The same drafting as a closing document, aimed at being chosen. Whatever came back unanswered is stated as the assumption it is, so the bid stays comparable and nothing is quietly guessed.'],
  ['Did we win it?', 'A bid that wins becomes the engagement, in the same record: nothing is re-entered and no answer moves.'],
];

const DISCOVERY_STEPS = [
  ['Interview the client', 'Each question carries a short briefing — why it matters for Shopify, the realistic options, the platform limits and the official source — so a commerce consultant runs a credible Shopify conversation without being a Shopify specialist. Answers can be pre-filled from documents here too, when there are any.'],
  ['Review and confirm', 'Everything recorded from a document stays “to confirm” until a human accepts it, with the quote next to it.'],
  ['Agree the scope', 'The Discovery Closing Document: the decision taken per requirement with its options weighed, the architecture, what is standard versus configuration versus app versus custom, the risks, what is out of scope and the roadmap — plus an annex with the full analysis and the sources.'],
  ['Hand over to delivery', 'A Jira-ready backlog and the configuration workbook for tax, shipping and store set-up, so the build team starts from the discovery instead of re-interviewing the client.'],
];

const DIVISION = [
  ['Code decides — always', 'Offer and scope classification · scope gates · exit rules and routes · which questions are worth sending back · whether the work can be priced at all · app signals · what is missing · whether a document is out of date'],
  ['AI drafts — never decides', 'Reading client documents · proposing answers with the evidence · the architecture and the position behind it · pros and cons per decision · the proposal, the deck and the annex'],
  ['The consultant owns', 'The client relationship · confirming every AI-proposed answer · the bid decision · the final scope · what is shared with the client'],
];

const GUARDRAILS = [
  ['Consent before anything', 'The client’s agreement to AI processing is question one; nothing else can be recorded until it is given.'],
  ['No personal data', 'The tool records roles, never names, e-mail addresses or phone numbers, and refuses them on input.'],
  ['Sourced or rejected', 'Shopify statements carry an official source and a verification date. Unsourced content does not pass the engine — the draft is sent back with the gaps named.'],
  ['Confirmed before committed', 'Answers read out of a document stay “to confirm”. The Go/No-Go position will not read “go” on evidence nobody has checked.'],
  ['Internal pricing stays internal', 'Offer logic and price bands never reach a client-facing document.'],
  ['Versioned and traceable', 'Every document is versioned, and when answers change afterwards the tool names exactly which ones moved, with the old and the new answer, and redrafts the approach — not only the slides.'],
];

const OUTCOMES = [
  ['Any commerce consultant can answer a Shopify RFP', 'The platform knowledge sits in the questionnaire and the reference chapters, not only in the few people who have it.'],
  ['The same rigour every time', 'The same question bank, the same exit rules, the same document structure — whoever runs it, wherever they are, bid or discovery.'],
  ['The cheapest decision taken first', 'Whether to bid at all is the decision that saves the most money, and it is now a step with the evidence under it rather than a question buried in a questionnaire.'],
  ['A defensible scope, earlier', 'Requirements the platform cannot meet surface before the price is committed, with the source that proves it.'],
  ['Knowledge that compounds', 'Every verified Shopify fact is written once into the shared reference and is used by every engagement after it.'],
  ['A pattern other practices can reuse', 'Nothing about the governed-AI method is Shopify-specific: the engine, the connector and the sourcing rule transfer to any platform we sell.'],
];

export default function About({ loaderData }) {
  return (
    <main className="story">
      <header className="page-head">
        <p className="eyebrow">Merkle commerce practice · {PRODUCT}</p>
        <h1>One engine, two ways in</h1>
        <p className="lede">
          A tool that lets any Merkle commerce consultant work with the depth of a Shopify specialist — answering
          an RFP, or running a discovery — and close it with a sourced, client-ready document, with the AI kept
          firmly on the side of drafting, never deciding.
        </p>
        <ul className="stats">
          {loaderData.stats.map(([n, label]) => <li key={label}><strong>{n}</strong><span>{label}</span></li>)}
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

      {/* Two jobs, so two flows. The steps here are the steps the tool shows. */}
      <section>
        <h2>Two processes, one engine</h2>
        <p className="lede">
          Merkle reaches this tool from two directions. An RFP arrives and has to be answered, or a client is
          engaged and the work has to be scoped. A bid is pre-sale: information is scarce, the clock is running
          and the goal is to be chosen. A discovery is won and paid: nothing has to be persuaded, everything has
          to be exact, because what comes out of it is what the build team executes.
        </p>
        <div className="grid-2">
          <div>
            <h3>Answer an RFP</h3>
            <ol className="steps">
              {BID_STEPS.map(([title, body]) => (
                <li key={title}><h4>{title}</h4><p>{body}</p></li>
              ))}
            </ol>
          </div>
          <div>
            <h3>Run a discovery</h3>
            <ol className="steps">
              {DISCOVERY_STEPS.map(([title, body]) => (
                <li key={title}><h4>{title}</h4><p>{body}</p></li>
              ))}
            </ol>
          </div>
        </div>
        <p className="muted">
          The engine is blind to which one you are running: the same question bank, the same scope gates, the same
          verified Shopify documentation and the same offer, and a test pins that the same answers give the same
          result either way. What differs is the order of the steps and what comes out at the end.
        </p>
      </section>

      <section className="band">
        <div className="band-inner">
          <p className="eyebrow">Before the price is committed</p>
          <h2 className="plain">The architect takes a position, instead of filling in a grid</h2>
          <p className="lede">
            The bid meeting does not want a Solution Architect’s answers to commercial questions he has no business
            answering. It wants to know whether Merkle can put a number on this work and stand behind it, and why.
          </p>
          <div className="grid-2">
            <article className="card">
              <h3>The first thing that stops him is the answer</h3>
              <p>
                Nothing read in, nothing to assess. Nothing confirmed, “I cannot stand behind this yet”. Outside the
                offers, a different conversation rather than a worse price. Something that cannot be costed, ask —
                no assumption covers it. Much still open, we can price it, on more assumptions than it should carry.
                Otherwise: we can price it and stand behind it.
              </p>
            </article>
            <article className="card">
              <h3>And the facts it rests on</h3>
              <p>
                What the RFP asks for, what it would take to build, what could move the margin, and what we would be
                betting on — each line carrying the answer it came from. The commercial questions this desk does not
                answer are listed with their owners rather than guessed at, because “that one is the Client lead’s”
                is a useful answer where a guess would be a liability.
              </p>
            </article>
          </div>
          <p className="muted">
            No percentages. A coverage ratio wearing a claim it cannot support gets argued with; counts of real
            things get acted on.
          </p>
        </div>
      </section>

      <section>
        <h2>What comes out of it</h2>
        <div className="grid-2">
          <article className="card">
            <h3>The Go/No-Go position</h3>
            <p>Whether the work can be priced and stood behind, with what that rests on and what has to be true before the price is committed. A recommendation for the meeting, not the decision.</p>
          </article>
          <article className="card">
            <h3>The questions we send back</h3>
            <p>A short client-facing document: only the unknowns that change the answer, each showing the trade-off it turns on. A handful of questions says we have read their document. Sixty says we have not.</p>
          </article>
          <article className="card">
            <h3>The proposal or the closing document</h3>
            <p>A consulting document, not a questionnaire summary: the problem and what it costs today, the decision taken per requirement with its options weighed, the architecture, the integrations, the risks, what is out of scope and the roadmap.</p>
          </article>
          <article className="card">
            <h3>The annex</h3>
            <p>The reasoning behind each decision, the capability analysis, and Merkle’s verified Shopify reference chapters — plans, Markets, Managed Markets, Payments, B2B, migration, Liquid versus Hydrogen and agentic commerce — each with its sources and verification date, plus the full bibliography.</p>
          </article>
          <article className="card">
            <h3>The delivery handover</h3>
            <p>A Jira-ready backlog and a configuration workbook for tax, shipping and store set-up, downloadable from the engagement itself.</p>
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
          The pilot measures the claims rather than asserting them: senior hours per bid, elapsed time from RFP to
          client document, how many requirements change scope after the sale, and how many bids are answered by
          consultants without Shopify specialism.
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
          <p className="byline">Built by Jose Reboredo · Principal Commerce Consultant, CE</p>
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
          <Link className="button" to="/manual">Read the manual</Link>
          <Link className="button secondary" to="/how-it-works">How the sourcing rule works</Link>
        </div>
      </section>
    </main>
  );
}
