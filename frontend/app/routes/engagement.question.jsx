import { Link, redirect, useNavigation } from 'react-router';

import { requireUser } from '../auth.server.js';
import { discovery, serviceFailure } from '../discovery.server.js';
import { questionAction } from '../question-actions.server.js';
import { vocabulariesFor } from '../vocabularies.server.js';
import { EngagementHeader, QuestionCard, Vocabularies } from '../components/question.jsx';

export const meta = ({ params }) => [{ title: `${params.questionId} · ${params.client} · Merkle Discovery` }];

export async function loader({ request, params }) {
  const user = await requireUser(request);
  try {
    const view = await discovery().getQuestion(user, params.client, params.questionId);
    return { ...view, vocabularies: vocabulariesFor([view.question]) };
  } catch (err) {
    throw serviceFailure(err);
  }
}

export async function action({ request, params }) {
  const user = await requireUser(request);
  const result = await questionAction(user, params.client, await request.formData());
  if (result?.ok) throw redirect(`/engagements/${params.client}/review#${params.questionId}`);
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
  const { engagement, question, values, state, note, vocabularies } = loaderData;
  const busy = useNavigation().state !== 'idle';
  return (
    <main>
      <Vocabularies vocabularies={vocabularies} />
      <EngagementHeader
        client={engagement.client}
        eyebrow={`Question ${question.id}`}
        meta={STATE_TEXT[state]}
        back={{ to: `/engagements/${engagement.client}/review#${question.id}`, label: 'Review answers' }}
      />
      <QuestionCard question={question} actionData={actionData} busy={busy} values={values} note={note}>
        {['tbc', 'skipped', 'commented'].includes(state) ? <button type="submit" name="intent" value="reopen" className="secondary" disabled={busy}>Reopen question</button> : null}
        {state === 'answered' && question.id !== 'Q10.5.2' ? <button type="submit" name="intent" value="clear" className="secondary" disabled={busy}>Clear answer</button> : null}
      </QuestionCard>
    </main>
  );
}
