/**
 * Question form parts shared by the interview and the edit page: inputs generated
 * from the schema (tables, groups, countries…), optionally pre-filled with the
 * current answer, plus the engine preview panel and engagement navigation.
 */
import { cloneElement, isValidElement, useId, useState } from 'react';
import { Form, Link, NavLink } from 'react-router';

import { LANGUAGE_NAMES } from '../../../discovery/service/i18n.js';
import { stepsFor, viewsFor, processMeta, processOf } from '../../../discovery/service/process.js';

export const words = (id) => id.replace(/_/g, ' ');
const leaf = (pointer) => words(pointer.split('/').at(-1));

/** Placeholder examples per vocabulary. */
const examples = { country: 'Switzerland or CH', currency: 'Swiss franc or CHF', language: 'German or de' };

export function Vocabularies({ vocabularies }) {
  return Object.entries(vocabularies ?? {}).map(([name, v]) => (
    <datalist key={name} id={`vocabulary-${name}`}>
      {v.options.map((o) => <option key={o} value={o} />)}
    </datalist>
  ));
}

/**
 * Where you are in the work, and what is next.
 *
 * This replaced five equal tabs. Tabs are a filing cabinet: they say what exists,
 * never what to do, so every visit began by working out where things stood. The
 * spine numbers the job, marks what is done, points at the one step that is
 * current, and carries the count that matters under each. Beside it sit the
 * things that are not steps — the summary, and the one place the settings live.
 */
export function EngagementNav({ engagement }) {
  const client = engagement.client;
  const to = (path) => `/engagements/${client}${path ? `/${path}` : ''}`;
  const steps = stepsFor(engagement);
  const current = steps.find((s) => s.state === 'current') ?? steps[steps.length - 1];
  // On a phone the spine showed the current step and then five bare numbers:
  // "04" tells you nothing about what step four is. Closed, it shows where you
  // are; open, it shows the job. The count is on the button either way.
  const [open, setOpen] = useState(false);
  return (
    <div className="wayfinder">
      <nav aria-label="Steps" className={open ? 'spine-nav open' : 'spine-nav'}>
      <button
        type="button"
        className="spine-toggle"
        aria-expanded={open}
        aria-controls="spine-steps"
        onClick={() => setOpen((v) => !v)}
      >
        Step {current?.n ?? 1} of {steps.length}
        <span aria-hidden="true" className="spine-caret" />
      </button>
      <ol className="steps-spine" id="spine-steps">
        {steps.map((step) => (
          <li key={step.path || 'start'} className={step.satisfied && step.state !== 'done' ? `${step.state} satisfied` : step.state}>
            <NavLink to={to(step.path)} end={step.path === ''}>
              <span className="step-n" aria-hidden="true">{String(step.n).padStart(2, '0')}</span>
              <span className="step-label">{step.label}</span>
              {step.hint ? <span className="step-hint">{step.hint}</span> : null}
            </NavLink>
          </li>
        ))}
      </ol>
      </nav>
      <nav className="views" aria-label="Reference and settings">
        {viewsFor(engagement).map((v) => (
          <NavLink key={v.path} to={to(v.path)}>{v.label}</NavLink>
        ))}
      </nav>
    </div>
  );
}

/**
 * What is blocking, as things to go and do. An error that names a missing answer
 * and leaves the consultant to find it is only half an error message, so every
 * blocker that resolves to a question carries the link that fixes it. Three
 * pages showed these and only one linked them.
 *
 * @param {{ items?: object[], errors?: string[], client: string }} props
 */
export function Blockers({ items = [], errors = [], client, from }) {
  if (!items.length) {
    return errors.length ? (
      <ul className="blockers">
        {errors.map((e) => <li key={e}><p className="muted"><WithQuestionLinks text={e} client={client} /></p></li>)}
      </ul>
    ) : null;
  }
  return (
    <ol className="blockers">
      {items.map((b, i) => (
        <li key={b.question_id ?? b.what ?? i}>
          <p className="blocker-what">{b.what}</p>
          {b.why ? <p className="muted"><WithQuestionLinks text={b.why} client={client} /></p> : null}
          {b.question_id ? (
            <Link className={`button${i === 0 ? '' : ' secondary'}`} to={`/engagements/${client}/questions/${b.question_id}?back=${encodeURIComponent(from ?? '')}`}>
              Answer {b.question_id}
            </Link>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * Turns every question id in a message into a link that opens that question.
 * An error that names Q10.5.5 and then says "fix it in Review answers" makes the
 * consultant hunt through 240 rows for a question the message already knew.
 *
 * @param {{ text: string, client: string }} props
 */
export function WithQuestionLinks({ text, client }) {
  const parts = String(text ?? '').split(/(Q\d+\.\d+\.\d+)/g);
  return parts.map((part, i) => (/^Q\d+\.\d+\.\d+$/.test(part)
    ? <Link key={`${part}-${i}`} to={`/engagements/${client}/questions/${part}`}>{part}</Link>
    : <span key={`t-${i}`}>{part}</span>));
}

/**
 * The black statement band every engagement page opens with, as on merkle.com:
 * where you came from, what this is, the client, the state of play, the tabs.
 *
 * @param {{ client: string, eyebrow?: string, title?: string, meta?: import('react').ReactNode,
 *           back?: { to: string, label: string } }} props
 */
export function EngagementHeader({ engagement, eyebrow, title, meta, back, language }) {
  const client = engagement.client;
  const words = processMeta(engagement.process);
  return (
    <header className="page-head">
      <Link className="crumb" to={back?.to ?? '/'}>← {back?.label ?? 'Engagements'}</Link>
      {/* A bid is the unusual state and worth naming on every page. An engagement
          is the default: saying so on top of the page name is noise. */}
      <p className="eyebrow">{[processOf(engagement.process) === 'rfp' ? words.record : null, eyebrow].filter(Boolean).join(' · ') || words.record}</p>
      <h1>{title ?? client}</h1>
      {meta ? <p className="page-meta">{meta}</p> : null}
      {/* Three facts, and the middle one used to be the opposite of true: it read
          "answers and documents in English" while the questions Merkle sends and
          the proposal it writes now come out in the engagement's language. What
          stays English is what Merkle reads — the recorded answers and everything
          the client never sees. */}
      {language?.translated ? (
        <p className="page-lang">
          {LANGUAGE_NAMES[language.language] ?? language.language}: the questions, the ones we send the client and the {words.document.toLowerCase()}
          {' · '}English: the recorded answers and everything internal
          {language.complete ? '' : ` · ${language.questions} of ${language.of} questions translated so far, the rest are asked in English`}
        </p>
      ) : null}
      <EngagementNav engagement={engagement} />
    </header>
  );
}

/** Same naming as the service's parseTable: "/markets/list[0][code]". */
const cellName = (pointer, row, key) => `${pointer}[${row}][${key}]`;
const asText = (v) => (v === null || v === undefined ? '' : String(v));

function Cell({ column, name, value, label }) {
  const a = { 'aria-label': label };
  switch (column.kind) {
    case 'enum':
      return (
        <select name={name} {...a} defaultValue={asText(value)}>
          <option value="">—</option>
          {column.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'multi_enum':
      return (
        <select name={name} {...a} multiple size={Math.min(4, column.options.length)} defaultValue={Array.isArray(value) ? value : []}>
          {column.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'boolean':
      return (
        <select name={name} {...a} defaultValue={asText(value)}>
          <option value="">—</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    case 'integer':
    case 'number':
      return <input type="number" name={name} {...a} step={column.kind === 'integer' ? 1 : 'any'} defaultValue={asText(value)} />;
    case 'date':
      return <input type="date" name={name} {...a} defaultValue={asText(value)} />;
    case 'list':
      return <input type="text" name={name} {...a} placeholder={column.vocabulary ? 'names or codes, comma-separated' : 'comma-separated'} defaultValue={Array.isArray(value) ? value.join(', ') : ''} />;
    default:
      return column.vocabulary
        ? <input type="text" name={name} {...a} list={`vocabulary-${column.vocabulary}`} placeholder="name or code" autoComplete="off" defaultValue={asText(value)} />
        : <input type="text" name={name} {...a} defaultValue={asText(value)} />;
  }
}

/** One row per item, one column per field; rows are added and removed in the page. */
function TableInput({ spec, value }) {
  const initial = Array.isArray(value) && value.length ? value : [];
  const [rows, setRows] = useState(initial.length ? initial.map((_, i) => i) : [0]);
  const [nextRow, setNextRow] = useState(Math.max(initial.length, 1));
  return (
    <div className="table-input">
      <table>
        <thead>
          <tr>
            {spec.columns.map((c) => <th key={c.key}>{words(c.key)}{c.required ? ' *' : ''}</th>)}
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              {spec.columns.map((c) => <td key={c.key}><Cell column={c} name={cellName(spec.pointer, row, c.key)} value={initial[row]?.[c.key]} label={`${words(c.key)}, row ${row + 1}`} /></td>)}
              <td>
                {rows.length > 1 ? <button type="button" className="link" onClick={() => setRows(rows.filter((r) => r !== row))}>Remove</button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="secondary" onClick={() => { setRows([...rows, nextRow]); setNextRow(nextRow + 1); }}>Add row</button>
      <span className="muted"> * required in each row · empty rows are ignored{spec.columns.some((c) => c.kind === 'multi_enum') ? ' · pick several with Ctrl or ⌘ and click, or Ctrl with the arrow keys and Ctrl-space' : ''}</span>
    </div>
  );
}

function FieldInput({ spec, showLabel, value, describedBy, groupLabel }) {
  const id = useId();
  const name = spec.pointer;
  const label = spec.label ?? (showLabel ? leaf(spec.pointer) : null);
  const grouped = spec.kind === 'boolean' || spec.kind === 'multi_enum';
  let control;
  switch (spec.kind) {
    case 'boolean':
      control = (
        <div className="options">
          <label><input type="radio" name={name} value="true" defaultChecked={value === true} /> Yes</label>
          <label><input type="radio" name={name} value="false" defaultChecked={value === false} /> No</label>
        </div>
      );
      break;
    case 'enum':
      control = (
        <select name={name} defaultValue={asText(value)}>
          <option value="">—</option>
          {spec.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case 'multi_enum':
      control = (
        <div className="options">
          {spec.options.map((o) => <label key={o.value}><input type="checkbox" name={name} value={o.value} defaultChecked={Array.isArray(value) && value.includes(o.value)} /> {o.label}</label>)}
        </div>
      );
      break;
    case 'integer':
    case 'number':
      control = <input type="number" name={name} step={spec.kind === 'integer' ? 1 : 'any'} defaultValue={asText(value)} />;
      break;
    case 'date':
      control = <input type="date" name={name} defaultValue={asText(value)} />;
      break;
    case 'long_text':
      control = <textarea name={name} defaultValue={asText(value)} />;
      break;
    case 'list':
      control = <textarea name={name} placeholder={spec.vocabulary ? `One per line or comma-separated, e.g. ${examples[spec.vocabulary]}` : 'One per line'} defaultValue={Array.isArray(value) ? value.join('\n') : ''} />;
      break;
    case 'table':
      control = <TableInput spec={spec} value={value} />;
      break;
    case 'json':
      control = <textarea name={name} rows={6} defaultValue={value ? JSON.stringify(value, null, 2) : ''} />;
      break;
    default:
      control = spec.vocabulary
        ? <input type="text" name={name} list={`vocabulary-${spec.vocabulary}`} placeholder={`e.g. ${examples[spec.vocabulary]}`} autoComplete="off" defaultValue={asText(value)} />
        : <input type="text" name={name} defaultValue={asText(value)} />;
  }
  if (grouped) {
    return (
      <fieldset className="field">
        <legend className={label ? undefined : 'sr-only'}>{label ?? groupLabel}</legend>
        {control}
      </fieldset>
    );
  }
  const named = isValidElement(control)
    ? cloneElement(control, { id, ...(describedBy ? { 'aria-describedby': describedBy, 'aria-invalid': true } : {}) })
    : control;
  return (
    <div className="field">
      <label htmlFor={id} className={label ? undefined : 'sr-only'}>{label ?? groupLabel}</label>
      {named}
    </div>
  );
}

function WhyItMatters({ teach, drives }) {
  if (!teach && !drives?.length) return null;
  return (
    <details className="teach" open>
      <summary>Why this matters — and the trade-offs</summary>
      {teach?.why ? <p>{teach.why}</p> : null}
      {drives?.length ? <p className="muted">Your answer changes: {drives.join(' · ')}.</p> : null}
      {teach?.options?.length ? (
        <div className="table-scroll" role="region" tabIndex={0} aria-label="Options compared, scrollable table">
          <table>
            <thead><tr><th scope="col">Option</th><th scope="col">Pros</th><th scope="col">Cons</th></tr></thead>
            <tbody>{teach.options.map((o) => <tr key={o.option}><td>{o.option}</td><td>{o.pros}</td><td>{o.cons}</td></tr>)}</tbody>
          </table>
        </div>
      ) : null}
      {teach?.limits ? <p><strong>Limits.</strong> {teach.limits}</p> : null}
      {teach?.sources?.length ? (
        <p className="muted">Sources: {teach.sources.map((url, i) => (
          <span key={url}>{i > 0 ? ' · ' : ''}<a href={url} target="_blank" rel="noreferrer">{url.replace(/^https:\/\/(www\.)?/, '').split('/')[0]}</a></span>
        ))}</p>
      ) : null}
    </details>
  );
}

function ShopifyKnowledge({ shopify }) {
  if (!shopify) return null;
  return (
    <details>
      <summary>Shopify knowledge (consultant only)</summary>
      <ul className="muted">
        {(shopify.native ?? []).map((n) => (
          <li key={n.feature}>
            <a href={n.docs} target="_blank" rel="noreferrer">{n.feature}</a> — from {n.plan}{n.plan_note ? ` (${n.plan_note})` : ''}
          </li>
        ))}
        {shopify.apps?.length ? <li>App Store candidates: {shopify.apps.join(', ')}</li> : null}
      </ul>
    </details>
  );
}

/**
 * A question with its inputs and actions. `values` pre-fills the inputs (edit page);
 * `children` adds actions (e.g. reopen, clear).
 */
export function QuestionCard({ question, actionData, busy, values = {}, note = '', language, back = '', children }) {
  const errors = actionData?.question_id === question.id && actionData.error ? (actionData.errors?.length ? actionData.errors : [actionData.error]) : [];
  const consent = question.id === 'Q10.5.2';
  return (
    <section className="card" id={question.id}>
      <div className="meta">
        {question.id} · {question.subsection} · <span className="badge">{question.priority}</span>
        {question.audience === 'consultant' ? <span className="badge">consultant</span> : null}
        {question.block === 'consultant_wrap_up' ? <span className="badge">wrap-up</span> : null}
      </div>
      <p className="question" lang={language}>{question.text}</p>
      {question.help ? <p className="muted" lang={language}>{question.help}</p> : null}
      <WhyItMatters teach={question.teach} drives={question.drives} />
      <ShopifyKnowledge shopify={question.shopify} />
      <Form method="post" key={question.id}>
        <input type="hidden" name="question_id" value={question.id} />
        {back ? <input type="hidden" name="back" value={back} /> : null}
        {question.inputs.map((spec) => (
          <FieldInput
            key={spec.pointer}
            spec={spec}
            showLabel={question.inputs.length > 1}
            value={values[spec.pointer]}
            groupLabel={question.text}
            describedBy={errors.length ? `${question.id}-errors` : undefined}
          />
        ))}
        <div className="field">
          <label htmlFor={`${question.id}-note`}>Comment (original wording, caveats, clarifications — no personal data)</label>
          <textarea id={`${question.id}-note`} name="note" rows={2} defaultValue={note} placeholder="A comment alone is a valid answer when no value fits, e.g. “We only ship inside the EU”" />
        </div>
        {/* Refusing an answer in silence is the same as doing nothing: the message
            sat a thousand pixels down the page and nothing announced it. */}
        {errors.length ? (
          <ul className="errors" id={`${question.id}-errors`} role="alert">
            {errors.map((e) => <li key={e}>{e}</li>)}
          </ul>
        ) : null}
        <div className="actions">
          <button type="submit" name="intent" value="answer" disabled={busy}>Record answer</button>
          {!consent ? (
            <>
              <label className="muted"><input type="checkbox" name="tbc_status" /> to confirm with client</label>
              <button type="submit" name="intent" value="tbc" className="secondary" disabled={busy}>TBC</button>
              <button type="submit" name="intent" value="skipped" className="secondary" disabled={busy}>Not applicable</button>
            </>
          ) : null}
          {children}
        </div>
      </Form>
    </section>
  );
}

const RESULT_CLASS = { STOP: 'stop', FLAG: 'flag', WARN: 'warn' };
export const resultClass = (result) => RESULT_CLASS[result] ?? '';

export function PreviewPanel({ preview }) {
  const signals = Object.entries(preview.app_signals ?? {}).filter(([, reasons]) => reasons.length);
  return (
    <aside className="panel">
      <h2>Offer</h2>
      <p>
        <strong>{preview.offer.code} · {preview.offer.name}</strong>{' '}
        {preview.offer.provisional ? <span className="badge provisional">provisional</span> : null}
      </p>
      <p>{preview.go ? <span className="badge go">GO</span> : <span className="badge stop">STOP · route: {words(preview.route ?? 'not decided')}</span>}</p>

      <h3>What grows the build</h3>
      <ul>{Object.entries(preview.scope_gates).map(([id, state]) => <li key={id}>{words(id)}: {state}</li>)}</ul>
      <h3>What would make it an L</h3>
      <ul>{Object.entries(preview.l_triggers).map(([id, state]) => <li key={id}>{words(id)}: {state}</li>)}</ul>

      <h3>What the answers have triggered</h3>
      {preview.exit_rules.length ? (
        <ul>{preview.exit_rules.map((r) => <li key={r.rule}><span className={`badge ${resultClass(r.result)}`}>{r.rule} {r.result}</span> {r.evidence}</li>)}</ul>
      ) : <p className="muted">None fired.</p>}

      {preview.plan_suggestion ? (
        <>
          <h3>Shopify plan (minimum for these answers)</h3>
          <p>{preview.plan_suggestion.value}</p>
          <ul>{preview.plan_suggestion.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
        </>
      ) : null}

      <h3>How far through</h3>
      {/* The same denominator the header and the steps use. This panel used to
          count a fourth thing, so one screen offered four answers to "how far
          through am I". */}
      <p>{preview.coverage.required_answered} of {preview.coverage.required_total} required answered</p>
      <p className="muted small">
        {preview.coverage.required_open} still open
        {preview.coverage.required_tbc ? ` · ${preview.coverage.required_tbc} with the client` : ''}
        {preview.coverage.required_commented ? ` · ${preview.coverage.required_commented} clarified by comment` : ''}
      </p>

      {signals.length ? (
        <>
          <h3>Apps these answers point to</h3>
          <ul>{signals.map(([area, reasons]) => <li key={area}>{words(area)}: {reasons.join('; ')}</li>)}</ul>
        </>
      ) : null}
    </aside>
  );
}
