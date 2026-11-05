#!/usr/bin/env python3
"""New project outputs stay outside the kit and retain relocatable design workflows."""
from pathlib import Path
import hashlib,json,subprocess,sys,tempfile,shutil
kit=Path(__file__).resolve().parents[3];script=kit/'scripts/create-project.py'
fail=[]
def inventory(root):return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
with tempfile.TemporaryDirectory() as td:
 base=Path(td);source=base/'kit';(source/'scripts').mkdir(parents=True)
 names=['brand-to-system','design-build','design-review','direction-study','distinctiveness-review','ia-review','starter-directions','ui-design-principles','ui-design-review','ui-design-system','design-refine'];records={}
 for name in names:
  p=source/'skills'/name/'SKILL.md';p.parent.mkdir(parents=True);p.write_text('fixture '+name)
  records[name]={'files':{'SKILL.md':hashlib.sha256(p.read_bytes()).hexdigest()}}
 (source/'skills-lock.json').write_text(json.dumps({'skills':records}))
 for name in ['LICENSE','NOTICE','README.md','START-HERE.md']:(source/name).write_text('fixture')
 (source/'VERSION').write_text('2.0.1\n')
 for name in ['folder-preflight.py','drift-check.sh']:
  shutil.copyfile(kit/'scripts'/name,source/'scripts'/name)
 if script.exists():shutil.copyfile(script,source/'scripts/create-project.py')
 before=inventory(source)
 def call(*args):return subprocess.run([sys.executable,str(script),'--kit-root',str(source),*args],capture_output=True,text=True)
 def expect(name,condition,detail=''):
  if not condition:fail.append(name);print('FAIL',name,detail[:180])
 r=call('--name','workshop-site');project=base/'workshop-site'
 expect('default-sibling',r.returncode==0 and project.is_dir(),r.stderr)
 r=call('--name','workshop-site');expect('collision-keeps-first',r.returncode==0 and (base/'workshop-site-2').is_dir(),r.stderr)
 r=call('--destination',str(base/'custom-project'));expect('explicit-destination',r.returncode==0 and (base/'custom-project').is_dir(),r.stderr)
 (base/'existing').mkdir();(base/'existing/user.txt').write_text('keep')
 r=call('--destination',str(base/'existing'));expect('existing-refused',r.returncode==2 and 'already exists' in r.stderr and (base/'existing/user.txt').read_text()=='keep',r.stderr)
 r=call('--name','../escape');expect('traversal-refused',r.returncode==2 and 'name must' in r.stderr,r.stderr)
 r=call('--destination',str(source/'new-app'));expect('inside-kit-refused',r.returncode==2 and 'inside the kit' in r.stderr and not (source/'new-app').exists(),r.stderr)
 expect('kit-unchanged',inventory(source)==before)
 pinned=project/'.agentic-design-kit'
 expect('complete-pinned-payload',pinned.is_dir() and inventory(pinned/'skills')==inventory(source/'skills'))
 expect('project-contexts',all((project/n).is_file() and '.agentic-design-kit/START-HERE.md' in (project/n).read_text() for n in ['AGENTS.md','CLAUDE.md']))
 expect('relative-link', (pinned/'project-context.json').is_file() and json.loads((pinned/'project-context.json').read_text()).get('project_root')=='..')
 moved=base/'moved-project'
 if project.exists():project.rename(moved)
 check=subprocess.run([sys.executable,str(moved/'.agentic-design-kit/scripts/folder-preflight.py'),'--root',str(moved/'.agentic-design-kit')],capture_output=True,text=True)
 expect('relocatable',check.returncode==0,check.stderr)
 r=subprocess.run([sys.executable,str(script),'--kit-root',str(moved/'.agentic-design-kit'),'--name','nested'],capture_output=True,text=True)
 expect('embedded-kit-no-recursion',r.returncode==2 and 'embedded kit' in r.stderr and not (moved/'nested').exists(),r.stderr)
 # Raw source under a repository: the app belongs outside the entire checkout.
 checkout=base/'checkout';(checkout/'.git').mkdir(parents=True)
 shutil.copytree(source,checkout/'v2')
 r=subprocess.run([sys.executable,str(script),'--kit-root',str(checkout/'v2'),'--name','outside-checkout'],capture_output=True,text=True)
 expect('outside-repository',r.returncode==0 and (base/'outside-checkout').is_dir() and not (checkout/'outside-checkout').exists(),r.stderr)
 native=base/'native-kit';shutil.copytree(source,native);(native/'.claude').mkdir();(native/'skills').rename(native/'.claude/skills');(native/'START-HERE.md').rename(native/'KIT-START-HERE.md')
 r=subprocess.run([sys.executable,str(script),'--kit-root',str(native),'--destination',str(base/'native-project')],capture_output=True,text=True)
 expect('native-layout-normalized',r.returncode==0 and (base/'native-project/.agentic-design-kit/skills/direction-study/SKILL.md').exists(),r.stderr)
 bad=base/'bad-kit';shutil.copytree(source,bad);(bad/'skills/direction-study/SKILL.md').write_text('changed')
 r=subprocess.run([sys.executable,str(script),'--kit-root',str(bad),'--name','unverified-project'],capture_output=True,text=True)
 expect('unauthenticated-kit-refused',r.returncode==2 and 'payload mismatch' in r.stderr and not (base/'unverified-project').exists(),r.stderr)
 r=call('--destination',str(base/'Workshop Project'))
 expect('explicit-spaced-name',r.returncode==0 and (base/'Workshop Project/AGENTS.md').is_file(),r.stderr)
 total=16
 print(f'{total-len(fail)}/{total} project workspace fixtures behaved')
raise SystemExit(bool(fail))
