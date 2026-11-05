#!/usr/bin/env python3
"""Folder discovery and payload fixtures; no account/native activation is implied."""
import hashlib,json,pathlib,subprocess,sys,tempfile,shutil
kit=pathlib.Path(__file__).resolve().parents[3]
with tempfile.TemporaryDirectory() as td:
    base=pathlib.Path(td)/'base';base.mkdir();records={}
    for skill in (kit/'skills').iterdir():
        if not skill.is_dir():continue
        f=base/'skills'/skill.name/'SKILL.md';f.parent.mkdir(parents=True);f.write_text(f'---\nname: {skill.name}\ndescription: fixture\n---\n')
        records[skill.name]={'files':{'SKILL.md':hashlib.sha256(f.read_bytes()).hexdigest()}}
    (base/'skills-lock.json').write_text(json.dumps({'skills':records}))
    cases=[('pass-visible-layout',None,None),('pass-code-layout','code',None),('pass-moved-folder','move',None),('fail-missing-payload','missing','payload mismatch'),('fail-edited-payload','edit','payload mismatch'),('fail-outside-link','link','symlink'),('fail-ambiguous-layout','both','ambiguous layout'),('fail-missing-lock','lock','lock missing')]
    failures=0
    for name,mutation,expected in cases:
        root=pathlib.Path(td)/name;shutil.copytree(base,root);sample=root/'skills/direction-study/SKILL.md'
        if mutation=='code':(root/'.claude').mkdir();(root/'skills').rename(root/'.claude/skills')
        if mutation=='move':root.rename(pathlib.Path(td)/'some other project');root=pathlib.Path(td)/'some other project'
        if mutation=='missing':sample.unlink()
        if mutation=='edit':sample.write_text('changed')
        if mutation=='link':sample.unlink();sample.symlink_to(base/'skills/direction-study/SKILL.md')
        if mutation=='both':(root/'.claude').mkdir();shutil.copytree(root/'skills',root/'.claude/skills')
        if mutation=='lock':(root/'skills-lock.json').unlink()
        run=subprocess.run([sys.executable,str(kit/'scripts/folder-preflight.py'),'--root',str(root)],capture_output=True,text=True)
        good=run.returncode==0 if expected is None else run.returncode==1 and expected in run.stdout
        if not good:failures+=1;print('FAIL',name,run.returncode,run.stdout)
    portable=pathlib.Path(td)/'portable-contracts';(portable/'skills').mkdir(parents=True)
    for skill in (kit/'skills').iterdir():
        if not skill.is_dir():continue
        (portable/'skills'/skill.name).mkdir()
        shutil.copyfile(skill/'SKILL.md',portable/'skills'/skill.name/'SKILL.md')
    shutil.copyfile(kit/'docs/FOLDER-START-HERE.md',portable/'START-HERE.md')
    contract=subprocess.run([sys.executable,str(kit/'skills/direction-study/tests/check-contracts.py'),str(portable)],capture_output=True,text=True)
    if contract.returncode!=0:failures+=1;print('FAIL portable root contracts',contract.stderr or contract.stdout)
    print(f'{len(cases)+1-failures}/{len(cases)+1} folder discovery/entry fixtures behaved')
    raise SystemExit(bool(failures))
