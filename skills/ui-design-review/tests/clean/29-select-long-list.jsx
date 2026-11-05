// A select over a set genuinely too long to show inline — the case the rule sanctions.
// The two- and three-option detector must not fire here.
const TIMEZONES = [
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Singapore', 'Europe/London', 'Europe/Berlin',
  'Europe/Madrid', 'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Australia/Sydney', 'Pacific/Auckland',
];

export function TimezoneField({ value, onChange }) {
  return (
    <label className="field">
      <span className="field__label">Time zone</span>
      <select value={value} onChange={onChange}>
        {TIMEZONES.map((tz) => (
          <option key={tz} value={tz}>{tz}</option>
        ))}
      </select>
    </label>
  );
}
