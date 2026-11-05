"""Validate fixture/expectation coverage in both directions."""

from pathlib import Path
import sys

tests = Path(sys.argv[1])
manifest = tests / "expected.tsv"

rows = []
for line in manifest.read_text().splitlines():
    if not line.strip() or line.startswith("#"):
        continue
    parts = line.split("\t")
    if len(parts) != 3:
        raise SystemExit(f"malformed expected.tsv row: {line}")
    rows.append(parts)

names = [row[0] for row in rows]
errors = []
duplicates = sorted({name for name in names if names.count(name) > 1})
if duplicates:
    errors.append("duplicate expectations: " + ", ".join(duplicates))

fixture_names = set()
for family in ("fail", "pass", "fail-strict", "pass-strict"):
    fixture_names.update(path.stem for path in (tests / family).glob("*.json"))
for family in ("fail-dir", "pass-dir"):
    fixture_names.update(path.name for path in (tests / family).glob("*/"))

orphans = sorted(set(names) - fixture_names)
if orphans:
    errors.append("expectations without fixtures: " + ", ".join(orphans))

required = {path.stem for path in (tests / "fail").glob("*.json")}
required.update(path.name for path in (tests / "fail-dir").glob("*/"))
required.update(path.stem for path in (tests / "fail-strict").glob("*.json"))
missing = sorted(required - set(names))
if missing:
    errors.append("failing fixtures without expectations: " + ", ".join(missing))

if errors:
    print("; ".join(errors))
    raise SystemExit(1)

print(f"manifest OK: {len(rows)} expectations, {len(fixture_names)} fixtures")
