#!/usr/bin/env python3
"""Fixtures for publication text and archive audits; private labels are assembled in memory."""
from pathlib import Path
import io,subprocess,sys,tarfile,tempfile,zipfile
root=Path(__file__).resolve().parents[3];checker=root/'scripts/check-public-content.py'
tag='J'+'T';lineage='early '+'consumer-app '+'design-review series'
cases=[('neutral','An early calibration case: 1.033 on canvas, 1.126 on card.',False),
 ('credits','Steven Smith; Hallmark and Impeccable influences; https://stevensmith.dev/',False),
 ('generic-client','Use client-side rendering; customer evidence must be real. name@example.com',False),
 ('comment','# '+tag+' review: a calibration observation',True),
 ('mixed-case','the '+tag.lower()+' case',True),('dated-tag',tag+'-2026-07 configuration',True),
 ('lineage',lineage,True),('wrapped-lineage',lineage.replace(' design','\ndesign'),True),('private-checkout','~/'+'Desktop/'+'design_skills',True),
 ('private-path','/'+'Users'+'/sample/private-project/file.md',True),
 ('hidden','the '+tag+' case',True),('zip',tag+' review',True),
 ('tar',lineage,True),('neutral-tar','Neutral calibration example.',False),('owner-tar','Neutral calibration example.',True),('zip-comment',tag+' review',True),('zip-member-comment',tag+' review',True),('nested',tag+' case',True),('broken-zip','not an archive',True)]
failures=[]
with tempfile.TemporaryDirectory(prefix='public-content-fixtures-') as td:
 for name,body,invalid in cases:
  tree=Path(td)/name;tree.mkdir()
  if name in {'zip','nested','zip-comment','zip-member-comment'}:
   data=io.BytesIO()
   with zipfile.ZipFile(data,'w') as z:
    if name=='zip-comment':z.writestr('notes.md','Neutral example.');z.comment=body.encode()
    elif name=='zip-member-comment':
     member=zipfile.ZipInfo('notes.md');member.comment=body.encode();z.writestr(member,'Neutral example.')
    else:z.writestr('notes.md',body)
   if name=='nested':
    with zipfile.ZipFile(tree/'download.zip','w') as z:z.writestr('inner.zip',data.getvalue())
   else:(tree/'download.zip').write_bytes(data.getvalue())
  elif name in {'tar','neutral-tar','owner-tar'}:
   with tarfile.open(tree/'download.tar.gz','w:gz') as t:
    data=body.encode();info=tarfile.TarInfo('notes.md');info.size=len(data)
    if name=='owner-tar':info.uname='fixture-build-user';info.uid=501
    t.addfile(info,io.BytesIO(data))
  elif name=='broken-zip':(tree/'download.zip').write_text(body)
  else:
   path=tree/('.claude/skills/sample/SKILL.md' if name=='hidden' else 'notes.md')
   path.parent.mkdir(parents=True,exist_ok=True);path.write_text(body)
  result=subprocess.run([sys.executable,str(checker),str(tree)],capture_output=True,text=True)
  good=result.returncode==(1 if invalid else 0) and ('INVALID' if invalid else 'PASS') in result.stdout
  if not good:failures.append(name);print('FAIL',name,result.returncode,(result.stdout+result.stderr)[:180])
print(f'{len(cases)-len(failures)}/{len(cases)} content/archive privacy fixtures behaved')
sys.exit(bool(failures))
