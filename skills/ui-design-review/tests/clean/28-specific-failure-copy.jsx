// The same panel with each failure family carrying its own copy and its own recovery.
// No catch-all string, so the generic-failure-copy detector must stay silent.
const MESSAGES = {
  offline: { title: 'You are offline', body: 'Your draft is saved. It will send when you reconnect.', action: 'Keep editing' },
  denied: { title: 'You do not have access to this mailbox', body: 'Ask an operator to grant access, then reopen this run.', action: 'Request access' },
  empty: { title: 'No matching records', body: 'The search ran and returned nothing. Widen the date range or clear the filters.', action: 'Clear filters' },
  refused: { title: 'This request was declined', body: 'Rewrite it without the customer payment details and it can run.', action: 'Edit request' },
  toolFailed: { title: 'Sending the reply failed', body: 'Steps 1–3 completed. The draft is kept and nothing was sent.', action: 'Retry send' },
  unsourced: { title: 'This answer has no source', body: 'It is shown unattributed. Verify before you send it.', action: 'Open sources' },
};

export function ResultPanel({ failure, onAct }) {
  const m = MESSAGES[failure];
  return (
    <div className="result-panel__error">
      <h3>{m.title}</h3>
      <p>{m.body}</p>
      <button onClick={onAct}>{m.action}</button>
    </div>
  );
}
