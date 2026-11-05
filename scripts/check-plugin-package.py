#!/usr/bin/env python3
"""Authenticate the offline plugin layout and every packaged skill file."""
import hashlib,json,pathlib,sys
root=pathlib.Path(sys.argv[1]).resolve();errors=[]
try:
    manifest=json.loads((root/'.claude-plugin/plugin.json').read_text())
    if manifest.get('name')!='agentic-design-kit':errors.append('wrong plugin identity')
    if not manifest.get('version'):errors.append('version missing')
    if set(manifest)-{'name','version','description','author'}:errors.append('unexpected runtime component in manifest')
    for name in ('hooks','agents','commands','.mcp.json','settings.json'):
        if (root/name).exists():errors.append(f'unexpected runtime component: {name}')
    if (root/'CLAUDE.md').exists():errors.append('root CLAUDE.md is ignored by plugins; use a skill/folder instructions')
    for name in ('README.md','COWORK-FOLDER-INSTRUCTIONS.txt'):
        if not (root/name).is_file():errors.append(f'missing {name}')
    lock=json.loads((root/'skills-lock.json').read_text())['skills']
    expected={'brand-to-system','design-build','design-review','direction-study','distinctiveness-review','ia-review','starter-directions','ui-design-principles','ui-design-review','ui-design-system','design-refine'}
    actual={p.name for p in (root/'skills').iterdir() if p.is_dir()}
    if set(lock)!=expected or actual!=expected:errors.append('skill set mismatch')
    for name in actual:
        files={}
        for p in (root/'skills'/name).rglob('*'):
            if p.is_symlink():errors.append(f'symlink: {p}');continue
            if p.is_file() and p.name!='.DS_Store' and p.suffix!='.pyc' and '__pycache__' not in p.parts:
                files[str(p.relative_to(root/'skills'/name))]=hashlib.sha256(p.read_bytes()).hexdigest()
        if files!=lock.get(name,{}).get('files'):errors.append(f'payload mismatch: {name}')
except (OSError,ValueError,KeyError,TypeError) as exc:
    errors.append(f'unreadable package: {exc}')
for error in errors:print('INVALID —',error)
if not errors:print('PASS — eleven plugin skills match packaged lock; native registration still requires verification')
raise SystemExit(bool(errors))
