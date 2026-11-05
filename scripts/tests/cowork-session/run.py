#!/usr/bin/env python3
"""Native-session receipt fixtures, not a live Cowork certification."""
import pathlib,json,copy,subprocess,sys,tempfile
kit=pathlib.Path(__file__).resolve().parents[3]; plugin='agentic-design-kit'
base={'runtime':'cowork','session_id':'fixture-session','inventory':{'source':'native-session','complete':True,'evidence':'transcript:skills-list'},'plugins':[{'id':plugin,'installed':True,'enabled':True,'evidence':'transcript:plugin-list'}],'skills':[],'entry':{'registered_name':plugin+':direction-study','status':'invoked','activation_evidence':'transcript:native-call','payload_verified':True,'payload_evidence':'transcript:lock-check'}}
for p in sorted((kit/'skills').iterdir()):
    if p.is_dir():base['skills'].append({'registered_name':plugin+':'+p.name,'owner':plugin,'role':'design-skill','status':'available'})
cases=[('pass-native-session',lambda d:None,None),
('fail-code-runtime',lambda d:d.update(runtime='claude-code-project'),'wrong runtime'),
('fail-filesystem-inventory',lambda d:d['inventory'].update(source='filesystem'),'native session inventory'),
('fail-disabled-plugin',lambda d:d['plugins'][0].update(enabled=False),'installed and enabled'),
('fail-missing-registered-skill',lambda d:d['skills'].pop(),'registered skill missing'),
('fail-entry-only-read',lambda d:d['entry'].update(status='loaded'),'entry was not activated'),
('fail-missing-activation',lambda d:d['entry'].update(activation_evidence=''),'native activation evidence'),
('fail-unverified-payload',lambda d:d['entry'].update(payload_verified=False),'payload identity unverified'),
('fail-external-design-active',lambda d:d['skills'].append({'registered_name':'personal:hallmark','owner':'external','role':'design-producer','status':'invoked'}),'external design skill active'),
('fail-incomplete-inventory',lambda d:d['inventory'].update(complete=False),'native session inventory')]
failed=0
with tempfile.TemporaryDirectory() as td:
    for name,mutate,message in cases:
        d=copy.deepcopy(base);mutate(d);p=pathlib.Path(td)/(name+'.json');p.write_text(json.dumps(d))
        r=subprocess.run([sys.executable,str(kit/'scripts/cowork-session-preflight.py'),str(p)],capture_output=True,text=True)
        good=r.returncode==0 if message is None else r.returncode==1 and message in r.stdout
        if not good:failed+=1;print('FAIL',name,r.returncode,r.stdout)
print(f'{len(cases)-failed}/{len(cases)} Cowork session fixtures behaved')
raise SystemExit(bool(failed))
