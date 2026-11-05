#!/usr/bin/env python3
"""Pin cross-skill integration instructions; this is a static guard, not a model eval."""
from pathlib import Path
import sys

kit = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[3]
if kit.name == '.claude':
    kit = kit.parent
packaged = (kit / '.claude/skills').is_dir() and not (kit / 'docs/CLAUDE-TEMPLATE.md').is_file()
requirements = {
    'docs/CLAUDE-TEMPLATE.md': ['A broad request to use this kit for direction and review is enough.',
        'Skill tool', 'skill: "direction-study"', 'Reading `SKILL.md` or an `@` import alone never counts'],
    'skills/direction-study/SKILL.md': ['invoke packaged `/ui-design-principles`', 'args: "study-proof"',
        'relevant detailed `rules.md` sections', 'invoke packaged `/distinctiveness-review`',
        'every rendered proof', 'no positive recommendation', 'IA conditional',
        'rejecting every direction and requesting a rerun'],
    'skills/ui-design-principles/SKILL.md': ['## Study-proof mode', 'instead of production Steps 1 and 1.5',
        'IA Mode 3 is conditional', 'An index-only read does not complete this skill'],
    'skills/distinctiveness-review/SKILL.md': ['## Direction-study handoff', '## 1 · Look before machine evidence',
        'After that first-pass judgement', 'blocks positive recommendation'],
    'skills/design-build/SKILL.md': ['references/skill-invocation.md'],
    'skills/design-review/SKILL.md': ['references/skill-invocation.md'],
}
if (kit / '.claude-plugin/plugin.json').is_file():
    requirements.pop('docs/CLAUDE-TEMPLATE.md')
    requirements['COWORK-FOLDER-INSTRUCTIONS.txt'] = [
        'installed agentic-design-kit plugin', 'local HTML', 'before creative work']
if (kit / 'START-HERE.md').is_file() and not (kit / 'docs/CLAUDE-TEMPLATE.md').is_file():
    requirements.pop('docs/CLAUDE-TEMPLATE.md', None)
    requirements['START-HERE.md'] = ['folder-execution', 'No account skill/plugin installation',
        'Reading a file is **loaded**', 'A broad request to use this kit for directions and review is enough.']
failures=[]
for name, phrases in requirements.items():
    path = kit/name
    if packaged:
        path = kit/'CLAUDE.md' if name.startswith('docs/') else kit/'.claude'/name
    text=' '.join(path.read_text().split()).lower()
    for phrase in phrases:
        if ' '.join(phrase.split()).lower() not in text:
            failures.append(f'{name}: missing integration: {phrase}')
for failure in failures: print('FAIL',failure)
raise SystemExit(bool(failures))
