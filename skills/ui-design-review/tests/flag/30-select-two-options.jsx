// A select costs an interaction to reveal a set the user could have seen at rest.
// rules.md → Behaviour, states and recovery → Control-type semantics: a dropdown means
// "a set too long or too rare to show inline" and is never correct for 2–3 options that
// fit as radios or a segmented control.
export function BillingCycle({ value, onChange }) {
  return (
    <label className="field">
      <span className="field__label">Billing cycle</span>
      <select value={value} onChange={onChange}>
        <option value="monthly">Monthly</option>
        <option value="annual">Annual</option>
      </select>
    </label>
  );
}
