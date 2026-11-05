#!/usr/bin/env python3
"""A source ZIP retains origin; an actual checkout reports its current commit."""
from pathlib import Path
import subprocess,tempfile,shutil
kit=Path(__file__).resolve().parents[3]; helper=kit/'scripts/source-commit.sh'; failures=[]
with tempfile.TemporaryDirectory() as td:
 base=Path(td); parent=base/'repo';parent.mkdir()
 subprocess.run(['git','init','-q',str(parent)],check=True)
 subprocess.run(['git','-C',str(parent),'-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-q','--allow-empty','-m','fixture'],check=True)
 head=subprocess.check_output(['git','-C',str(parent),'rev-parse','HEAD'],text=True).strip();origin='0'*40
 for name,root,expected in [('zip',base/'zip',origin),('foreign-parent',parent/'download',origin),('checkout',parent,head)]:
  (root/'scripts').mkdir(parents=True,exist_ok=True);shutil.copyfile(helper,root/'scripts/source-commit.sh');(root/'SOURCE-COMMIT').write_text(origin+'\n')
  got=subprocess.run(['bash',str(root/'scripts/source-commit.sh')],capture_output=True,text=True)
  if got.returncode or got.stdout.strip()!=expected:failures.append(name)
for name in failures:print('FAIL',name)
print(f'{3-len(failures)}/3 source provenance fixtures behaved')
raise SystemExit(bool(failures))
