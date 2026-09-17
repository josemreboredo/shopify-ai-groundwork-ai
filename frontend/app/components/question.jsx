/**
 * Question form parts shared by the interview and the edit page: inputs generated
 * from the schema (tables, groups, countries…), optionally pre-filled with the
 * current answer, plus the engine preview panel and engagement navigation.
 */
import { useState } from 'react';
import { Form, NavLink } from 'react-router';

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

export function EngagementNav({ client }) {
  return (
    <nav className="tabs">
      <NavLink to={`/engagements/${client}`} end>Interview</NavLink>
      <NavLink to={`/engagements/${client}/review`}>Review answers</NavLink>
      <NavLink to={`/engagements/${client}/summary`}>Summary</NavLink>
      <NavLink to={`/engagements/${client}/closing-document`}>Closing document</NavLink>
    </nav>
  );
}

/** Same naming as the service's parseTable: "/markets/list[0][code]". */
const cellName = (pointer, row, key) => `${pointer}[${row}][${key}]`;
const asText = (v) => (v === null || v === undefined ? '' : String(v));

function Cell({ column, name, value }) {
  switch (column.kind) {
    case 'enum':
      return (
        <select name={name} defaultValue={asText(value)}>
          <option value="">—</option>
          {column.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'multi_enum':
      return (
        <select name={name} multiple size={Math.min(4, column.options.length)} defaultValue={Array.isArray(value) ? value : []}>
          {column.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    case 'boolean':
      return (
        <select name={name} defaultValue={asText(value)}>
          <option value="">—</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    case 'integer':
    case 'number':
      return <input type="number" name={name} step={column.kind === 'integer' ? 1 : 'any'} defaultValue={asText(value)} />;
    case 'date':
      return <input type="date" name={name} defaultValue={asText(value)} />;
    case 'list':
      return <input type="text" name={name} placeholder={column.vocabulary ? 'names or codes, comma-separated' : 'comma-separated'} defaultValue={Array.isArray(value) ? value.join(', ') : ''} />;
    default:
      return column.vocabulary
        ? <input type="text" name={name} list={`vocabulary-${column.vocabulary}`} placeholder="name or code" autoComplete="off" defaultValue={asText(value)} />
        : <input type="text" name={name} defaultValue={asText(value)} />;
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
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row}>
              {spec.columns.map((c) => <td key={c.key}><Cell column={c} name={cellName(spec.pointer, row, c.key)} value={initial[row]?.[c.key]} /></td>)}
              <td>
                {rows.length > 1 ? <button type="button" className="link" onClick={() => setRows(rows.filter((r) => r !== row))}>Remove</button> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="secondary" onClick={() => { setRows([...rows, nextRow]); setNextRow(nextRow + 1); }}>Add row</button>
      <span className="muted"> * required in each row · empty rows are ignored{spec.columns.some((c) => c.kind === 'multi_enum') ? ' · hold ⌘ or Ctrl to pick several' : ''}</span>
    </div>
  );
}

function FieldInput({ spec, showLabel, value }) {
  const name = spec.pointer;
  const label = spec.label ?? (showLabel ? leaf(spec.pointer) : null);
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
  return (
    <div className="field">
      {label ? <label>{label}</label> : null}
      {control}
    </div>
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
export function QuestionCard({ question, actionData, busy, values = {}, note = '', children }) {
  const errors = actionData?.question_id === question.id && actionData.error ? (actionData.errors?.length ? actionData.errors : [actionData.error]) : [];
  const consent = question.id === 'Q10.5.2';
  return (
    <section className="card" id={question.id}>
      <div className="meta">
        {question.id} · {question.subsection} · <span className="badge">{question.priority}</span>
        {question.audience === 'consultant' ? <span className="badge">consultant</span> : null}
        {question.block === 'consultant_wrap_up' ? <span className="badge">wrap-up</span> : null}
      </div>
      <p className="question">{question.text}</p>
      {question.help ? <p className="muted">{question.help}</p> : null}
      <ShopifyKnowledge shopify={question.shopify} />
      <Form method="post" key={question.id}>
        <input type="hidden" name="question_id" value={question.id} />
        {question.inputs.map((spec) => <FieldInput key={spec.pointer} spec={spec} showLabel={question.inputs.length > 1} value={values[spec.pointer]} />)}
        <div className="field">
          <label>Comment (original wording, caveats, clarifications — no personal data)</label>
          <textarea name="note" rows={2} defaultValue={note} placeholder="A comment alone is a valid answer when no value fits, e.g. “We only ship inside the EU”" />
        </div>
        {errors.length ? <ul className="errors">{errors.map((e) => <li key={e}>{e}</li>)}</ul> : null}
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

      <h3>Scope gates</h3>
      <ul>{Object.entries(preview.scope_gates).map(([id, state]) => <li key={id}>{words(id)}: {state}</li>)}</ul>
      <h3>L triggers</h3>
      <ul>{Object.entries(preview.l_triggers).map(([id, state]) => <li key={id}>{words(id)}: {state}</li>)}</ul>

      <h3>Exit rules</h3>
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

      <h3>Coverage</h3>
      <p>{preview.coverage.required_answered} of {preview.coverage.required_total} required answered · {preview.coverage.required_tbc} TBC · {preview.coverage.required_commented ?? 0} by comment · {preview.coverage.required_open} open</p>

      {signals.length ? (
        <>
          <h3>App signals</h3>
          <ul>{signals.map(([area, reasons]) => <li key={area}>{words(area)}: {reasons.join('; ')}</li>)}</ul>
        </>
      ) : null}
    </aside>
  );
}
