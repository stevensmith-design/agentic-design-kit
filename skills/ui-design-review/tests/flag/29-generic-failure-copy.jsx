// Every failure in this surface — a network error, a permission denial, and a model
// refusal — collapses into one catch-all string. rules.md → Behaviour, states and recovery
// requires network / data / permission errors to be distinguishable, and
// rules.md → AI and agentic interfaces requires the six model-failure families to be
// distinguishable and explicitly forbids rendering any of them as "Something went wrong".
export function ResultPanel({ state, onRetry }) {
  if (state.status === 'error') {
    return (
      <div className="result-panel__error">
        <h3>Something went wrong</h3>
        <p>Please try again.</p>
        <button onClick={onRetry}>Retry</button>
      </div>
    );
  }
  return <pre className="result-panel__body">{state.text}</pre>;
}
