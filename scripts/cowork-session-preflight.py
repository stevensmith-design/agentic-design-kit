#!/usr/bin/env python3
"""Check a receipt of actual Cowork session state; audit it against native evidence."""
import json,pathlib,sys
plugin='agentic-design-kit';errors=[]
def need(test,message):
    if not test:errors.append(message)
try:
    data=json.loads(pathlib.Path(sys.argv[1]).read_text())
    need(data.get('runtime')=='cowork','wrong runtime; Code filesystem preflight cannot certify Cowork')
    need(bool(data.get('session_id')),'session identity missing')
    inv=data.get('inventory',{})
    need(inv.get('source')=='native-session' and inv.get('complete') is True and inv.get('evidence'),
         'complete native session inventory evidence required; folder paths are insufficient')
    candidates=[p for p in data.get('plugins',[]) if p.get('id')==plugin]
    need(any(p.get('installed') is True and p.get('enabled') is True and p.get('evidence') for p in candidates),
         'kit plugin must be installed and enabled in this session')
    names={'brand-to-system','design-build','design-review','direction-study','distinctiveness-review','ia-review','starter-directions','ui-design-principles','ui-design-review','ui-design-system','design-refine'}
    registered={s.get('registered_name') for s in data.get('skills',[]) if s.get('owner')==plugin}
    for name in names:need(f'{plugin}:{name}' in registered,f'registered skill missing: {name}')
    active={'loaded','invoked','completed'}
    for skill in data.get('skills',[]):
        name=skill.get('registered_name','').lower().split(':')[-1]
        external=skill.get('owner')!=plugin
        design=skill.get('role','').startswith('design-') or name in {'hallmark','impeccable','frontend-design'}
        need(not(external and design and skill.get('status') in active), 'external design skill active')
    entry=data.get('entry',{})
    need(entry.get('registered_name')==plugin+':direction-study' and entry.get('status') in {'invoked','completed'},
         'kit entry was not activated')
    need(bool(entry.get('activation_evidence')),'native activation evidence missing; reading alone does not count')
    need(entry.get('payload_verified') is True and entry.get('payload_evidence'),'entry payload identity unverified')
except (OSError,ValueError,TypeError,KeyError,IndexError) as exc:
    errors.append(f'malformed session receipt: {exc}')
for error in errors:print('INVALID —',error)
if not errors:print('PASS — Cowork session receipt prerequisites; audit native inventory and activation evidence before creativity')
raise SystemExit(bool(errors))
