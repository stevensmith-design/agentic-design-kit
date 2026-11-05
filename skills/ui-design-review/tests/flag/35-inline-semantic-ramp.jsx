// The scanner covers CSS; inline style objects are the hole Documentation integrity names.
// Here the semantic/index ramp is spent on decoration — a phase bar and a section rule
// that encode nothing. rules.md → Quality requirements → Semantic-palette leak (not waivable).
export function PhaseHeader({ phase }) {
  return (
    <header style={{ borderTop: '3px solid var(--color-index-b)' }}>
      <span style={{ background: 'var(--color-status-warning)', width: 48, height: 4 }} />
      <h2>{phase.name}</h2>
    </header>
  );
}
