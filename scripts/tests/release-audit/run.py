#!/usr/bin/env python3
"""Public packaging regressions. Test fixtures precede the audit implementation."""
from pathlib import Path
import json,subprocess,sys,tempfile,shutil
kit=Path(__file__).resolve().parents[3]
checker=kit/'scripts/check-public-release.py'
common=['AGENTS.md','README.md','LICENSE','NOTICE','VERSION','skills-lock.json']
required={'portable':['START-HERE.md','CLAUDE.md'],'code':['CLAUDE.md'],
 'plugin':['COWORK-FOLDER-INSTRUCTIONS.txt'],
 'source':['START-HERE.md','CONTRIBUTING.md','SECURITY.md','CHANGELOG.md','INSTALL.md','SOURCE-COMMIT']}
cases=[('portable',None),('code',None),('plugin',None),('source',None),
 ('portable','license'),('portable','agent-entry'),('portable','private-file'),('portable','private-path'),
 ('plugin','old-name'),('portable','symlink'),('source','evidence'),('source','client-label'),('source','internal-acceptance'),('source','internal-script')]
fail=0
with tempfile.TemporaryDirectory() as td:
 for i,(kind,mutation) in enumerate(cases):
  root=Path(td)/str(i);root.mkdir()
  for name in common+required[kind]: (root/name).write_text('fixture\n')
  (root/'VERSION').write_text('2.0.0\n')
  if kind in ['plugin','source']:
   (root/'.claude-plugin').mkdir()
   (root/'.claude-plugin/plugin.json').write_text(json.dumps({'name':'agentic-design-kit','version':'2.0.0'}))
  if mutation=='agent-entry':(root/'AGENTS.md').unlink()
  if mutation=='license':(root/'LICENSE').unlink()
  if mutation=='private-file':(root/'.env').write_text('fixture')
  if mutation=='private-path':(root/'README.md').write_text('/'+'Users'+'/example/private-project')
  if mutation=='old-name':(root/'.claude-plugin/plugin.json').write_text(json.dumps({'name':'design-'+'skills-'+'kit-v2','version':'2.0.0'}))
  if mutation=='symlink':(root/'outside').symlink_to(Path(td)/'other')
  if mutation=='internal-acceptance':(root/'acceptance').mkdir();(root/'acceptance/README.md').write_text('internal')
  if mutation=='internal-script':(root/'scripts').mkdir(exist_ok=True);(root/'scripts/git.sh').write_text('#!/bin/sh\n')
  if mutation=='client-label':(root/'README.md').write_text('J'+'T'+' review')
  if mutation=='evidence':(root/'evidence').mkdir()
  result=subprocess.run([sys.executable,str(checker),str(root),'--kind',kind],capture_output=True,text=True)
  expected=0 if mutation is None else 1
  # Missing checker/parse errors are not a successful negative fixture.
  good=result.returncode==expected and ('PASS' if expected==0 else 'INVALID') in result.stdout
  if not good:fail+=1;print('FAIL',kind,mutation,result.returncode,(result.stdout+result.stderr)[:180])
print(f'{len(cases)-fail}/{len(cases)} public release fixtures behaved')
raise SystemExit(bool(fail))
