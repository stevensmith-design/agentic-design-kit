#!/usr/bin/env python3
"""Audit an exported publication tree, not the private development repository."""
import argparse,json,re,subprocess,sys
from pathlib import Path
p=argparse.ArgumentParser(description=__doc__);p.add_argument('root',type=Path);p.add_argument('--kind',required=True,choices=['source','portable','plugin','code']);a=p.parse_args();root=a.root.resolve();errors=[]
common=['AGENTS.md','README.md','LICENSE','NOTICE','VERSION','skills-lock.json']
extra={'source':['START-HERE.md','CONTRIBUTING.md','SECURITY.md','CHANGELOG.md','INSTALL.md','SOURCE-COMMIT'], 'portable':['START-HERE.md','CLAUDE.md'],'plugin':['COWORK-FOLDER-INSTRUCTIONS.txt'],'code':['CLAUDE.md']}
for name in common+extra[a.kind]:
 if not (root/name).is_file():errors.append('missing '+name)
for item in root.rglob('*'):
 rel=item.relative_to(root)
 if item.is_symlink():errors.append('symlink '+str(rel));continue
 if any(part in {'.git','node_modules','evidence','acceptance-evidence','eval-workspaces','portfolio-directions','_to_delete'} for part in rel.parts):errors.append('development-only content '+str(rel));continue
 if item.name in {'.env','.env.local','id_rsa','id_ed25519','.DS_Store'}:errors.append('private/local file '+str(rel));continue
 if item.is_file():
  try:text=item.read_text()
  except (UnicodeError,OSError):continue
  # Detect concrete machine paths, without embedding an actual user's path here.
  if re.search('/'+'Users'+r'/[^/\s]+/',text) or re.search('/'+'home'+r'/claude/',text):errors.append('personal runtime path '+str(rel))
if a.kind in {'source','plugin'}:
 try:
  m=json.loads((root/'.claude-plugin/plugin.json').read_text())
  if m.get('name')!='agentic-design-kit':errors.append('wrong public plugin identity')
  if m.get('version')!=(root/'VERSION').read_text().strip():errors.append('plugin/version mismatch')
 except (OSError,ValueError):errors.append('missing/unreadable plugin manifest')
content_check=subprocess.run([sys.executable,str(Path(__file__).with_name('check-public-content.py')),str(root)],capture_output=True,text=True)
if content_check.returncode:
 errors.append('public content privacy check failed')
 print(content_check.stdout or content_check.stderr)
for error in sorted(set(errors)):print('INVALID —',error)
if not errors:print('PASS — publication tree identity, required files and local-data exclusions ('+a.kind+')')
raise SystemExit(bool(errors))
