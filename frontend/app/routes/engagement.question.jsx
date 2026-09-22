import { redirect, useNavigation } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { questionAction } from '../question-actions.server.js';
import { vocabulariesFor } from '../vocabularies.server.js';
import { EngagementErrorBoundary, EngagementHeader, QuestionCard, Vocabularies } from '../components/question.jsx';
import { pageTitle } from '../brand.js';

export const meta = ({ params }) => [{ title: pageTitle(`${params.questionId}`, params.client) }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  const back = new URL(request.url).searchParams.get('back') ?? '';
  try {
    const view = await discovery().getQuestion(user, params.client, params.questionId);
    return { ...view, back, vocabularies: vocabulariesFor([view.question]) };
  } catch (err) {
    throw serviceFailure(err);
  }
}

export async function action({ request, params }) {
  const user = await requireUser(request);
  const form = await request.formData();
  const back = String(form.get('back') ?? '');
  const result = await questionAction(user, params.client, form);
  // Every blocker links here, and answering it dropped the consultant at the top
  // of a 173-row table with no way back to the page that sent them — on every
  // blocker, every time. It returns where it came from, and says what happened.
  if (result?.ok) {
    const to = back.startsWith(`/engagements/${params.client}`) ? back : `/engagements/${params.client}/review`;
    const sep = to.includes('?') ? '&' : '?';
    throw redirect(`${to}${sep}recorded=${encodeURIComponent(params.questionId)}#${params.questionId}`);
  }
  return result;
}

const STATE_TEXT = {
  answered: 'Answered — change the values below and record again, or clear the answer.',
  commented: 'Clarified by comment — record a value, change the comment, or reopen the question.',
  tbc: 'Marked TBC — record the answer when you have it, or reopen the question.',
  skipped: 'Marked not applicable — record an answer or reopen the question.',
  open: 'Not answered yet.',
};

export default function EditQuestion({ loaderData, actionData }) {
  const { engagement, question, values, state, note, vocabularies, language, back } = loaderData;
  const busy = useNavigation().state !== 'idle';
  return (
    <main id="main">
      <Vocabularies vocabularies={vocabularies} />
      <EngagementHeader
        language={language}
        engagement={engagement}
        eyebrow={`Question ${question.id}`}
        meta={STATE_TEXT[state]}
        back={{ to: `/engagements/${engagement.client}/review#${question.id}`, label: 'Review answers' }}
      />
      <QuestionCard question={question} actionData={actionData} busy={busy} values={values} note={note} language={engagement.language} back={back}>
        {['tbc', 'skipped', 'commented'].includes(state) ? <button type="submit" name="intent" value="reopen" className="secondary" disabled={busy}>Reopen question</button> : null}
        {state === 'answered' && question.id !== 'Q10.5.2' ? <button type="submit" name="intent" value="clear" className="secondary" disabled={busy}>Clear answer</button> : null}
      </QuestionCard>
    </main>
  );
}

// The record survives a page that does not.
export const ErrorBoundary = EngagementErrorBoundary;
