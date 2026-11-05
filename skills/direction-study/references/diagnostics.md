# Optional diagnostic — guidance load

Off by default. Use only when the person requests a load record or when debugging accidental starter
or structure-library influence.

```bash
python3 <skills>/direction-study/scripts/guidance-load.py record \
  --log reports/guidance-load/<study>.jsonl --route reference-led --phase study \
  --context designer --path references/source-1.png --purpose "study original"

python3 <skills>/direction-study/scripts/guidance-load.py check \
  reports/guidance-load/<study>.jsonl
```

The check flags starter material outside starter-led or explicit named-starter use, and structure
library material outside routes where structure is intentionally left open. It does **not** flag
original references during reference-led synthesis or proof-building: direct access to those sources is
part of the creative workflow. The record is diagnostic evidence, never an ideation gate.

Exit `0` clean · `1` leak · `2` malformed log.
