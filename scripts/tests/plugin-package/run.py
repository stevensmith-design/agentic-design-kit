#!/usr/bin/env python3
"""Plugin fixtures isolate wiring/identity failures; no model or visual test."""
import hashlib,json,pathlib,subprocess,sys,tempfile,shutil
kit=pathlib.Path(__file__).resolve().parents[3]
checker=kit/'scripts/check-plugin-package.py'
with tempfile.TemporaryDirectory() as td:
    base=pathlib.Path(td)/'base';(base/'.claude-plugin').mkdir(parents=True)
    (base/'.claude-plugin/plugin.json').write_text(json.dumps({'name':'agentic-design-kit','version':'2.0.0','description':'test'}))
    (base/'README.md').write_text('fixture')
    (base/'COWORK-FOLDER-INSTRUCTIONS.txt').write_text('fixture')
    records={}
    for s in (kit/'skills').iterdir():
        if not s.is_dir():continue
        f=base/'skills'/s.name/'SKILL.md';f.parent.mkdir(parents=True);f.write_text(f'---\nname: {s.name}\ndescription: test\n---\n')
        records[s.name]={'files':{'SKILL.md':hashlib.sha256(f.read_bytes()).hexdigest()}}
    (base/'skills-lock.json').write_text(json.dumps({'skills':records}))
    cases=[('valid',None,None),('wrong-name','manifest','wrong plugin identity'),('legacy-name','legacy','wrong plugin identity'),('missing-skill','missing','skill set mismatch'),('mutated-payload','drift','payload mismatch'),('escaping-symlink','symlink','symlink'),('ignored-root-instructions','claude','root CLAUDE.md'),('runtime-hook','hook','unexpected runtime component')]
    failed=0
    for name,mutation,message in cases:
        target=pathlib.Path(td)/name;shutil.copytree(base,target)
        sample=target/'skills/direction-study/SKILL.md'
        if mutation=='manifest':(target/'.claude-plugin/plugin.json').write_text(json.dumps({'name':'other','version':'1'}))
        if mutation=='legacy':(target/'.claude-plugin/plugin.json').write_text(json.dumps({'name':'design-'+'skills-'+'kit-v2','version':'2.0.0'}))
        if mutation=='missing':shutil.rmtree(sample.parent)
        if mutation=='drift':sample.write_text(sample.read_text()+'changed')
        if mutation=='symlink':sample.unlink();sample.symlink_to(base/'skills/direction-study/SKILL.md')
        if mutation=='claude':(target/'CLAUDE.md').write_text('silently ignored')
        if mutation=='hook':(target/'hooks').mkdir()
        run=subprocess.run([sys.executable,str(checker),str(target)],text=True,capture_output=True)
        good=(run.returncode==0) if mutation is None else (run.returncode==1 and message in run.stdout)
        if not good:failed+=1;print('FAIL',name,run.returncode,run.stdout)
    print(f'{len(cases)-failed}/{len(cases)} plugin package fixtures behaved')
    raise SystemExit(bool(failed))
