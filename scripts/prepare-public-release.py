#!/usr/bin/env python3
"""Build reviewed local publication artifacts. Never installs or publishes remotely."""
import argparse,hashlib,json,os,re,shutil,subprocess,tempfile,zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
KIT=Path(__file__).resolve().parent.parent
NAME='agentic-design-kit'

def run(*args,cwd=None):subprocess.run(list(map(str,args)),cwd=cwd,check=True)
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def copy(src,dst):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if src.is_dir():shutil.copytree(src,dst)
 else:shutil.copy2(src,dst)
def commit():
 return subprocess.check_output(['bash',str(KIT/'scripts/source-commit.sh')],text=True).strip()

def clean_ignore(directory,names):return set(names)&{'.DS_Store','__pycache__','node_modules','_to_delete'}
def tree(src,dst):shutil.copytree(src,dst,ignore=clean_ignore)
def export_source(dst,revision):
 dst.mkdir()
 for name in ['skills','scripts','plugin','acceptance']:tree(KIT/name,dst/name)
 (dst/'docs').mkdir()
 docs=['CLAUDE-TEMPLATE.md','DIST-README.md','STANDALONE-START-HERE.md','STANDALONE-README.md',
       'COWORK-INSTALL.md','COWORK-FOLDER-INSTRUCTIONS.txt','FOLDER-START-HERE.md','FOLDER-TEST-SETUP.txt']
 for name in docs:copy(KIT/'docs'/name,dst/'docs'/name)
 for name in ['RELEASE-V2.md','PUBLIC-RELEASE.md']:
  copy(KIT/'public/CHANGELOG.md',dst/'docs'/name)
 for name in ['LICENSE','NOTICE','VERSION','skills-lock.json']:copy(KIT/name,dst/name)
 tree(KIT/'public',dst/'public')
 for p in (KIT/'public').iterdir():
  if p.name=='.github':tree(p,dst/p.name)
  elif p.is_file():copy(p,dst/p.name)
 copy(KIT/'docs/STANDALONE-START-HERE.md',dst/'START-HERE.md')
 copy(KIT/'docs/STANDALONE-START-HERE.md',dst/'CLAUDE.md')
 copy(KIT/'plugin/plugin.json',dst/'.claude-plugin/plugin.json')
 copy(KIT/'docs/COWORK-FOLDER-INSTRUCTIONS.txt',dst/'COWORK-FOLDER-INSTRUCTIONS.txt')
 (dst/'SOURCE-COMMIT').write_text(revision+'\n')
 # Acceptance harness prose is synthetic support material, not a reason to publish machine paths.
 for p in (list((dst/'acceptance').rglob('*.md'))+list((dst/'acceptance').rglob('*.tsv'))+
           list((dst/'acceptance').rglob('*.txt'))+list((dst/'docs').rglob('*.md'))):
  text=p.read_text()
  text=re.sub('/'+'Users'+r'/[^/\s]+','/absolute/user',text)
  text=text.replace('/'+'home'+'/claude/','/absolute/agent/')
  p.write_text(text)

def inventory(root):
 return {str(p.relative_to(root)):digest(p) for p in root.rglob('*') if p.is_file() and p.suffix!='.pyc' and '__pycache__' not in p.parts and p.name!='.DS_Store'}
def payload(source,dst,kind,revision):
 dst.mkdir()
 target=dst/'.claude/skills' if kind=='code' else dst/'skills'
 tree(source/'skills',target)
 for name in ['AGENTS.md','LICENSE','NOTICE','VERSION','skills-lock.json','README.md','INSTALL.md','CHANGELOG.md','CONTRIBUTING.md','SECURITY.md']:copy(source/name,dst/name)
 (dst/'scripts').mkdir()
 for name in ['drift-check.sh','folder-preflight.py','create-project.py']:copy(source/'scripts'/name,dst/'scripts'/name)
 if kind=='plugin':
  copy(source/'START-HERE.md',dst/'START-HERE.md')
  copy(source/'plugin/plugin.json',dst/'.claude-plugin/plugin.json')
  copy(source/'docs/COWORK-INSTALL.md',dst/'README.md')
  copy(source/'docs/COWORK-FOLDER-INSTRUCTIONS.txt',dst/'COWORK-FOLDER-INSTRUCTIONS.txt')
  for name in ['check-plugin-package.py','cowork-session-preflight.py']:copy(source/'scripts'/name,dst/'scripts'/name)
 elif kind=='code':
  (dst/'AGENTS.md').write_text((dst/'AGENTS.md').read_text().replace('START-HERE.md','KIT-START-HERE.md'))
  copy(source/'START-HERE.md',dst/'KIT-START-HERE.md')
  copy(source/'docs/CLAUDE-TEMPLATE.md',dst/'CLAUDE.md')
  copy(source/'scripts/check-package-wiring.sh',dst/'scripts/check-package-wiring.sh')
 else:
  for name in ['START-HERE.md','CLAUDE.md']:copy(source/'START-HERE.md',dst/name)
 metadata={'name':NAME,'version':(source/'VERSION').read_text().strip(),'source_commit':revision,'kind':kind,
           'native_installation_tested':False,'account_settings_changed':False}
 (dst/'release-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
 assert inventory(target)==inventory(source/'skills'), 'payload copy mismatch'
 run('bash',dst/'scripts/drift-check.sh')
 if kind=='plugin':run('python3',dst/'scripts/check-plugin-package.py',dst)
 elif kind=='code':run('bash',dst/'scripts/check-package-wiring.sh',dst,11)
 else:run('python3',source/'skills/direction-study/tests/check-contracts.py',dst)
 run('python3',source/'scripts/check-public-release.py',dst,'--kind',kind)

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args()
 out=args.out
 if not out.is_absolute():parser.error('--out must be absolute')
 if out.exists():parser.error('output exists; refusing to overwrite')
 out.parent.mkdir(parents=True,exist_ok=True)
 revision=commit();version=(KIT/'VERSION').read_text().strip()
 if json.loads((KIT/'plugin/plugin.json').read_text()).get('name')!=NAME:parser.error('plugin identity not renamed')
 with tempfile.TemporaryDirectory(prefix='adk-release-',dir=out.parent) as td:
  stage=Path(td);source=stage/(NAME+'-source');export_source(source,revision)
  assert inventory(source/'skills')==inventory(KIT/'skills'), 'source export changed skills'
  run('python3',source/'scripts/check-public-release.py',source,'--kind','source')
  # Validate the exported source, so missing public-only dependencies cannot hide behind the private tree.
  def verify(command):
   result=subprocess.run(list(map(str,command)),cwd=source,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
   if result.returncode or any(word in result.stdout for word in ['SKIPPED','UNVERIFIED','✘ FAIL']):
    print(result.stdout);raise RuntimeError('Required publication checks failed or were unverified')
   return result.stdout
  with ThreadPoolExecutor(max_workers=2) as pool:
   gates=pool.submit(verify,['bash',source/'scripts/publish.sh','--check'])
   rendered=pool.submit(verify,['bash',source/'skills/ui-design-review/tests/run.sh'])
   evidence=gates.result()+'\nDetailed UI suite:\n'+rendered.result()
   evidence=evidence.replace(str(stage),'<release-build>').replace(str(KIT),'<kit-source>')
   (stage/'validation.log').write_text(evidence)
  run('python3',source/'scripts/tests/release-audit/run.py')
  for cache in list(source.rglob('__pycache__')):shutil.rmtree(cache)
  run('python3',source/'scripts/check-public-release.py',source,'--kind','source')
  folders={'source':source}
  for kind,suffix in [('portable',''),('plugin','-plugin'),('code','-code')]:
   folders[kind]=stage/(NAME+suffix);payload(source,folders[kind],kind,revision)
  manifest={'name':NAME,'version':version,'source_commit':revision,'native_installation_tested':False,'artifacts':{}}
  for kind,root in folders.items():
   archive=stage/f'{NAME}-{version}-{kind}.zip'
   with zipfile.ZipFile(archive,'x',zipfile.ZIP_DEFLATED) as z:
    for p in sorted(root.rglob('*')):
     if not p.is_file() or p.suffix=='.pyc' or '__pycache__' in p.parts:continue
     rel=p.relative_to(root)
     # Plugin uploader expects the manifest at ZIP root; other archives have one enclosing directory.
     arc=rel if kind=='plugin' else Path(root.name)/rel
     z.write(p,str(arc))
   manifest['artifacts'][archive.name]={'sha256':digest(archive),'bytes':archive.stat().st_size}
  run('python3',source/'scripts/check-public-content.py',stage)
  (stage/'release.json').write_text(json.dumps(manifest,indent=2)+'\n')
  (stage/'SHA256SUMS').write_text(''.join(v['sha256']+'  '+name+'\n' for name,v in manifest['artifacts'].items()))
  stage.rename(out)
 print('READY — local publication artifacts:',out)
if __name__=='__main__':main()
