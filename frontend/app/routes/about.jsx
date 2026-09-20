import { Link } from 'react-router';

import { PRODUCT, pageTitle } from '../brand.js';
import { stats } from '../facts.server.js';
import { HandOff, Ladder, WaysIn } from '../components/diagram.jsx';

export const meta = () => [
  { title: pageTitle('What this is') },
  { name: 'description', content: `Why Merkle’s commerce practice built ${PRODUCT}: one engine behind an RFP response and a Shopify discovery, with the commercials computed by code and the AI kept on drafting.` },
];

export function loader() {
  return { stats: stats() };
}

/**
 * Four problems, one line each.
 *
 * They were four cards of fifty words. Four paragraphs of the same length and
 * the same shape read as one paragraph of two hundred: nothing stood out, so
 * nothing was remembered. The claim is the line; the evidence folds.
 */
const PROBLEMS = [
  ['Shopify depth is scarce', 'Commerce depth is not.',
    'The practice has senior commerce consultants. It has far fewer who know what Shopify Payments does per country, when Markets needs a second store, or what B2B costs on each plan. Today a Shopify bid is as good as whoever happens to write it.'],
  ['The expensive work is unpaid', 'It all happens before anything is signed.',
    'Answering an RFP and running a pre-sales discovery are senior time spent on a maybe. Each one restarts the same research, rebuilds the same deck and rewrites the same platform explanations.'],
  ['Scoping errors surface late', 'In delivery, where they cost the most.',
    'A market that needs its own entity. A tax rule Shopify cannot handle. A return flow that only works in the US. Missed up front, each becomes a change request, a margin loss, or a difficult conversation months later.'],
  ['Nothing compounds', 'Every engagement starts at zero.',
    'The research from one engagement stays in one deck on one laptop. The next one begins again — and the platform has changed since.'],
];

/**
 * The spine of the whole tool, and the one thing a reader must leave with. It
 * used to be three paragraphs in a row; it is a flow now, because it is one:
 * each hand takes the work the one before it finished.
 */
const DIVISION = [
  {
    who: 'Code decides',
    crosses: 'the offer, the gates, the rules',
    line: 'Anything with a commercial consequence.',
    items: ['Which offer this is', 'Whether it can be priced at all', 'Scope gates and exit rules', 'Which questions are worth sending back', 'What is missing, and what is out of date'],
  },
  {
    who: 'AI drafts',
    crosses: 'a draft, with its sources',
    line: 'Never decides. It reads and it writes.',
    items: ['Reads the client’s documents', 'Proposes answers, with the evidence', 'Explains the trade-off in each decision', 'Writes the proposal, the deck and the annex'],
  },
  {
    who: 'The consultant owns',
    crosses: 'what the client sees',
    line: 'The client, and every word they see.',
    items: ['The relationship', 'Confirming every answer the AI proposed', 'The bid decision', 'The final scope', 'What is shared with the client'],
  },
];

/**
 * The two paths, aligned.
 *
 * They were two independent numbered lists of eighty-word steps, side by side
 * but lining up with nothing. The engine is the same underneath, so the useful
 * shape is a comparison: same row, same stage of the work, and the difference
 * is what you read across.
 */
const PATHS = [
  ['Read it in', 'Read the RFP', 'Claude reads the documents and records what they answer, with the sentence each came from.',
    'Interview the client', 'Each question carries a briefing — why it matters, the options, the platform limit, the source.'],
  ['Confirm it', 'Confirm what it says', 'An extraction nobody has checked is not evidence. Nothing is priced on unconfirmed answers.',
    'Review and confirm', 'Everything read from a document stays “to confirm” until a human accepts it.'],
  ['Take a position', 'Go/No-Go support', 'Not the decision. What the architect brings to the room: can we price this and stand behind it.',
    null, null],
  ['Close the gaps', 'RFP Q&A', 'Only the unknowns that change the answer. A handful says we read their document. Sixty says we did not.',
    null, null],
  ['Check it holds', 'Check where it stands', 'What was confirmed, what the engine concluded, and what the proposal will assume. One page.',
    null, null],
  ['Write it', 'Write the proposal', 'Aimed at being chosen. Anything unanswered is stated as the assumption it is.',
    'Agree the scope', 'The closing document: a decision per requirement, the architecture, the risks, the roadmap.'],
  ['Hand it on', 'Did we win it?', 'A bid that wins becomes the engagement, in the same record. Nothing is re-entered.',
    'Hand over to delivery', 'A Jira-ready backlog and the configuration workbook, so the build team starts here.'],
];

/** What the tool produces. Six documents, named — the detail belongs in the manual. */
const OUTPUTS = [
  ['The Go/No-Go position', 'internal', 'Whether the work can be priced and stood behind, and what that rests on.'],
  ['The questions we send back', 'client', 'Only the unknowns that change the answer, each showing the trade-off it turns on.'],
  ['The proposal, or the closing document', 'client', 'A decision per requirement, the architecture, the risks, what is out of scope, the roadmap.'],
  ['The annex', 'client', 'The reasoning behind each decision, and Merkle’s verified Shopify chapters with their sources.'],
  ['The delivery handover', 'internal', 'A Jira-ready backlog and a configuration workbook for tax, shipping and store set-up.'],
  ['The internal summary', 'internal', 'Offer size, gates, exit rules with their evidence, and every open item.'],
];

const GUARDRAILS = [
  ['Consent before anything', 'The client’s agreement to AI processing is question one. Nothing is recorded until it is given.'],
  ['No personal data', 'The tool records roles. It refuses names, e-mail addresses and phone numbers on input.'],
  ['Sourced or rejected', 'Every Shopify statement carries an official source and a date. Unsourced drafts are sent back with the gaps named.'],
  ['Confirmed before committed', 'The Go/No-Go will not read “go” on evidence nobody has checked.'],
  ['Internal pricing stays internal', 'Offer logic and price bands never reach a client-facing document.'],
  ['Versioned and traceable', 'When an answer changes after a document is written, the tool names which one moved, and redrafts the reasoning — not only the slides.'],
];

const OUTCOMES = [
  ['Any commerce consultant can answer a Shopify RFP', 'The platform knowledge sits in the questionnaire and the reference chapters, not only in the few people who have it.'],
  ['The same rigour every time', 'The same question bank, the same exit rules, the same document structure — whoever runs it, bid or discovery.'],
  ['The cheapest decision taken first', 'Whether to bid at all saves the most money. It is now a step with evidence under it.'],
  ['A defensible scope, earlier', 'Requirements the platform cannot meet surface before the price is committed, with the source that proves it.'],
  ['Knowledge that compounds', 'Every verified Shopify fact is written once and used by every engagement after it.'],
  ['A pattern other practices can reuse', 'The engine, the connector and the sourcing rule are not Shopify-specific.'],
];

export default function About({ loaderData }) {
  return (
    <main id="main" className="story">
      {/* 1 — the answer, in one breath. The lede was forty-four words and three
             clauses, which is a paragraph pretending to be a summary. */}
      <header className="page-head">
        <p className="eyebrow">Merkle commerce practice · {PRODUCT}</p>
        <h1>One engine, two ways in</h1>
        <p className="answer-line">
          Any Merkle commerce consultant can answer a Shopify RFP, or run a discovery, with the depth of a
          specialist.
        </p>
        <p className="lede">
          The commercials are computed by code. The AI reads and writes, and never decides. The consultant owns
          the client.
        </p>
        <ul className="stats">
          {loaderData.stats.map(([n, label]) => <li key={label}><strong>{n}</strong><span>{label}</span></li>)}
        </ul>
      </header>

      {/* 2 — why it exists. A claim per line; the evidence folds. */}
      <section>
        <h2>Why it exists</h2>
        <ol className="claims">
          {PROBLEMS.map(([title, line, body]) => (
            <li key={title}>
              <details>
                <summary>
                  <span className="claim">{title}</span>
                  <span className="claim-line">{line}</span>
                </summary>
                <p>{body}</p>
              </details>
            </li>
          ))}
        </ol>
      </section>

      {/* 3 — the spine, as the flow it actually is. */}
      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">The principle</p>
          <h2 className="plain">Code decides. AI drafts. The consultant owns the client.</h2>
          <p className="lede">
            The risk with AI in pre-sales is not bad writing. It is an invented commitment. So the commercial
            logic is ordinary, testable code, and the AI is used where it is genuinely strong.
          </p>
          <HandOff hands={DIVISION} />
          <ol className="hands">
            {DIVISION.map(({ who, line, items }, i) => (
              <li key={who}>
                <p className="hand-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
                <h3>{who}</h3>
                <p className="hand-line">{line}</p>
                <ul>{items.map((x) => <li key={x}>{x}</li>)}</ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 — the two paths, aligned stage by stage, because the engine is one. */}
      <section>
        <h2>Two processes, one engine</h2>
        <p className="lede">
          A bid is pre-sale: information is scarce, the clock is running, the goal is to be chosen. A discovery is
          won and paid: nothing has to be persuaded and everything has to be exact.
        </p>
        <WaysIn />
        <Ladder paths={PATHS} />
        <p className="muted">
          The engine cannot tell which one you are running. Same question bank, same scope gates, same
          documentation, same offer — and a test pins that the same answers give the same result either way.
        </p>
      </section>

      {/* 5 — what comes out, split by the thing that matters about it: who
             reads it. As one list with a badge per row, the split was there and
             invisible — half of these leave the building and half never do. */}
      <section>
        <h2>What comes out of it</h2>
        <div className="outputs-split">
          {[['client', 'The client reads these'], ['internal', 'These never leave Merkle']].map(([who, heading]) => {
            const rows = OUTPUTS.filter(([, w]) => w === who);
            return (
              <div key={who} className={`output-group ${who}`}>
                <h3>{heading} <span className="chip">{rows.length}</span></h3>
                <ul>
                  {rows.map(([title, , body]) => (
                    <li key={title}>
                      <strong>{title}</strong>
                      <span className="muted small">{body}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
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
          The pilot measures these rather than asserting them: senior hours per bid, elapsed time from RFP to
          client document, requirements that change scope after the sale, and bids answered by consultants with no
          Shopify specialism.
        </p>
      </section>

      {/* 6 — the coda. Interesting, not load-bearing, so it folds. */}
      <section className="band dark">
        <div className="band-inner">
          <p className="eyebrow">How it was built</p>
          <h2 className="plain">A method, not a prototype</h2>
          <p className="lede">
            The Shopify content is one instance of a pattern the practice can reuse. Replace the question bank and
            the rules, and the same skeleton takes another platform.
          </p>
          <details>
            <summary>What that means in practice</summary>
            <p>
              A deterministic engine for anything commercial. An AI connector, so consultants work where they
              already work. A shared knowledge base with sources and dates. Safety rails wired in rather than
              promised.
            </p>
            <p>
              It is built as a governed delivery workspace: architecture decisions recorded, security gates
              defined before the code, an automated test suite, and every platform fact checked against official
              Shopify documentation with the date it was verified.
            </p>
          </details>
          <p className="byline">Built by Jose Reboredo · Principal Commerce Consultant, CE</p>
        </div>
      </section>

      <section>
        <h2>Where it goes next</h2>
        <ul className="ticks">
          <li><strong>Build tool.</strong> The same handover drives agents that configure the store and the theme from the agreed scope.</li>
          <li><strong>Beyond Shopify.</strong> The question bank is what makes it Shopify. The rest is not.</li>
          <li><strong>Enterprise footing.</strong> The pilot runs on demo and anonymised engagements. Real client work moves to dentsu’s enterprise AI platform first.</li>
        </ul>
        <div className="actions">
          <Link className="button" to="/manual">Read the manual</Link>
          <Link className="button secondary" to="/how-it-works">How the sourcing rule works</Link>
        </div>
      </section>
    </main>
  );
}
