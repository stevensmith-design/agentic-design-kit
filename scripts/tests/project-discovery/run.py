#!/usr/bin/env python3
"""Application checks must not inspect a pinned tool dependency's fixtures."""
from pathlib import Path
import json,subprocess,sys,tempfile,shutil
kit=Path(__file__).resolve().parents[3]
scan=kit/'skills/ui-design-review/scripts/scan.sh'
validator=kit/'skills/ui-design-system/scripts/validate-tokens.py'
fail=[]
def expect(name,ok,detail=''):
 if not ok:fail.append(name);print('FAIL',name,detail[:220])
with tempfile.TemporaryDirectory() as td:
 base=Path(td);app=base/'app';pinned=app/'.agentic-design-kit';pinned.mkdir(parents=True)
 (app/'app.css').write_text('.btn-primary {background:#222;color:#fff;}\n')
 shutil.copyfile(kit/'skills/ui-design-review/tests/flag/01-gradient-button.css',pinned/'fixture.css')
 def run_scan(*args):return subprocess.run(['bash',str(scan),*map(str,args)],cwd=app,capture_output=True,text=True)
 r=run_scan(app);expect('directory-skips-kit',r.returncode==0,r.stdout)
 r=run_scan(pinned);expect('explicit-kit-inspection',r.returncode==1 and 'No gradient on interactive elements' in r.stdout,r.stdout)
 subprocess.run(['git','init','-q',str(app)],check=True)
 identity=['-c','user.name=Fixture','-c','user.email=fixture@example.invalid']
 subprocess.run(['git','-C',str(app),*identity,'commit','-q','--allow-empty','-m','baseline'],check=True)
 baseline=subprocess.check_output(['git','-C',str(app),'rev-parse','HEAD'],text=True).strip()
 subprocess.run(['git','-C',str(app),'add','.'],check=True)
 r=run_scan('--staged');expect('staged-skips-kit',r.returncode==0,r.stdout)
 subprocess.run(['git','-C',str(app),*identity,'commit','-q','-m','project'],check=True)
 r=run_scan('--diff',baseline);expect('diff-skips-kit',r.returncode==0,r.stdout)
 tokens=base/'token-app';shutil.copytree(kit/'skills/ui-design-system/tests/pass-dir/02-orphan-token-warns',tokens)
 (tokens/'.agentic-design-kit').mkdir();(tokens/'.agentic-design-kit/mock.css').write_text('.fixture {border-radius:var(--radius-card);}')
 r=subprocess.run([sys.executable,str(validator),'--json',str(tokens)],capture_output=True,text=True)
 items={row['check']:row['level'] for row in json.loads(r.stdout)['items']}
 expect('kit-cannot-mask-orphan',r.returncode==0 and items.get('tokens/orphans')=='WARN',str(items.get('tokens/orphans')))
 nodeapp=base/'node-app';(nodeapp/'.agentic-design-kit').mkdir(parents=True)
 fixtures=kit/'skills/ui-design-review/scripts/detect/tests'
 shutil.copyfile(fixtures/'clean/banned-opener.html',nodeapp/'index.html')
 shutil.copyfile(fixtures/'flag/banned-opener.html',nodeapp/'.agentic-design-kit/fixture.html')
 r=subprocess.run(['node',str(kit/'skills/ui-design-review/scripts/detect/detect.mjs'),'--json',str(nodeapp)],capture_output=True,text=True)
 expect('node-discovery-still-skips-kit',r.returncode==0 and not json.loads(r.stdout)['findings'],r.stderr)
print(f'{6-len(fail)}/6 project discovery fixtures behaved')
raise SystemExit(bool(fail))
