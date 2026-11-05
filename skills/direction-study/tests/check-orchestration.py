#!/usr/bin/env python3
"""Transcript-derived receipts test orchestration, never visual taste."""
import pathlib, subprocess, sys
root = pathlib.Path(__file__).resolve().parent
checker = root.parent / 'scripts/check-orchestration.py'
failures = []
fixtures = sorted((root / 'fixtures/orchestration').glob('*.json'))
for fixture in fixtures:
    run = subprocess.run([sys.executable, str(checker), str(fixture)], capture_output=True, text=True)
    expected = 1 if fixture.name.startswith('fail-') else 0
    if run.returncode != expected:
        failures.append(f'{fixture.name}: expected {expected}, got {run.returncode}: {run.stdout}')
for failure in failures: print('FAIL', failure)
print(f'{len(fixtures)-len(failures)}/{len(fixtures)} orchestration fixtures behaved')
raise SystemExit(bool(failures))
