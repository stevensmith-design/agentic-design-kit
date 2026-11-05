#!/usr/bin/env python3
"""Discover a local kit and verify its payload without installing/registering anything."""
import argparse,hashlib,json,pathlib,sys

def inspect(root):
    root=root.resolve()
    if not (root/'skills-lock.json').is_file():
        # Accept a caller pointing directly at a skills directory, not just its package root.
        parents=[p for p in list(root.parents)[:2] if (p/'skills-lock.json').is_file()]
        if not parents:raise ValueError('lock missing in supplied kit root')
        package=parents[0]
        if root not in (package/'skills',package/'.claude/skills'):
            raise ValueError('supplied folder is not this local kit or its skills root')
        wanted=root;root=package
    else:wanted=None
    candidates=[p for p in (root/'skills',root/'.claude/skills') if p.is_dir()]
    if wanted:candidates=[p for p in candidates if p==wanted]
    if len(candidates)!=1:raise ValueError('ambiguous layout or skills root missing; select one local kit')
    source=candidates[0]
    if source.is_symlink() or source.resolve()!=source.absolute():raise ValueError('symlink skills root')
    lock=json.loads((root/'skills-lock.json').read_text())['skills']
    expected={'brand-to-system','design-build','design-review','direction-study','distinctiveness-review','ia-review','starter-directions','ui-design-principles','ui-design-review','ui-design-system','design-refine'}
    if set(lock)!=expected or {p.name for p in source.iterdir() if p.is_dir()}!=expected:
        raise ValueError('payload mismatch: expected eleven kit skills')
    catalog=[]
    for name in sorted(expected):
        base=source/name
        if base.is_symlink():raise ValueError(f'symlink skill directory: {name}')
        actual={}
        for p in base.rglob('*'):
            if '__pycache__' in p.parts or '_to_delete' in p.parts:continue
            if p.is_symlink():raise ValueError(f'symlink payload: {name}/{p.name}')
            if p.is_file() and p.name!='.DS_Store' and p.suffix!='.pyc':
                actual[str(p.relative_to(base))]=hashlib.sha256(p.read_bytes()).hexdigest()
        if actual!=lock[name]['files']:raise ValueError(f'payload mismatch: {name}')
        catalog.append({'name':name,'origin':str((base/'SKILL.md').relative_to(root)),
                        'state':'available-local-workflow'})
    return {'mode':'folder-execution','kit_root':str(root),'skill_root':str(source.relative_to(root)),
            'native_registration_asserted':False,'execution_asserted':False,'skills':catalog}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root',required=True,type=pathlib.Path)
    parser.add_argument('--json',action='store_true')
    args=parser.parse_args()
    try:
        result=inspect(args.root)
    except (ValueError,KeyError,OSError,TypeError) as exc:
        print('INVALID —',exc);raise SystemExit(1)
    if args.json:print(json.dumps(result,indent=2))
    else:
        print('PASS — local kit payload verified; no native registration or workflow execution asserted')
        print('Kit root:',result['kit_root'],'| skills root:',result['skill_root'])
        for row in result['skills']:print(row['name']+' — '+row['origin'])
