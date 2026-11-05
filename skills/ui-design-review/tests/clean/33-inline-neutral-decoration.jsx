// Inline styles that draw decoration from the NEUTRAL ramp, plus a semantic colour used
// where it genuinely encodes state. Neither is a leak; the detector must not fire.
export function PhaseHeader({ phase, status }) {
  return (
    <header style={{ borderTop: '1px solid var(--color-border)' }}>
      <span style={{ background: 'var(--color-surface-2)', width: 48, height: 4 }} />
      <h2>{phase.name}</h2>
      <span role="status" style={{ color: 'var(--color-status-error)' }}>
        {status === 'failed' ? 'Failed at step 6' : null}
      </span>
    </header>
  );
}
