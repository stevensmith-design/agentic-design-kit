#!/usr/bin/env python3
"""Create a separate project with a pinned, project-local kit; never install globally."""
import argparse,hashlib,importlib.util,json,re,shutil,sys
from pathlib import Path
sys.dont_write_bytecode=True
SCRIPT=Path(__file__).resolve()

def preflight(kit):
 spec=importlib.util.spec_from_file_location('adk_project_preflight',kit/'scripts/folder-preflight.py')
 module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 return module.inspect(kit),module.inspect

def repo_boundary(kit):
 for parent in [kit,*kit.parents]:
  if (parent/'.git').exists() and ((parent/'skills-lock.json').is_file() or (parent/'v2/skills-lock.json').is_file()):return parent
 return kit

def metadata_file(kit,name):
 candidates=([kit/'public'/name,kit/name] if name=='README.md' else [kit/name,kit/'public'/name])
 if name=='START-HERE.md':candidates.extend([kit/'KIT-START-HERE.md',kit/'docs/STANDALONE-START-HERE.md'])
 return next((p for p in candidates if p.is_file()),None)

def main():
 p=argparse.ArgumentParser(description=__doc__)
 p.add_argument('--kit-root',type=Path,default=SCRIPT.parent.parent)
 choice=p.add_mutually_exclusive_group(required=True)
 choice.add_argument('--name',help='descriptive folder name; existing names get a numeric suffix')
 choice.add_argument('--destination',type=Path,help='explicit absolute path to a new project')
 p.add_argument('--parent',type=Path,help='existing absolute parent for --name; default is beside the kit checkout')
 a=p.parse_args();created=None
 try:
  kit=a.kit_root.resolve();catalog,inspect=preflight(kit)
  kit=Path(catalog['kit_root']);boundary=repo_boundary(kit)
  if a.destination and a.parent:raise ValueError('use --parent with --name, not --destination')
  if (kit/'project-context.json').exists() and not a.destination:
   raise ValueError('embedded kit belongs to an existing project; work in its parent, or give an explicit --destination for a separate project')
  if a.name and not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*',a.name):raise ValueError('name must be one folder name, without traversal or separators')
  if a.destination:
   if not a.destination.is_absolute():raise ValueError('destination must be absolute')
   destination=a.destination.resolve()
  else:
   parent=a.parent if a.parent else boundary.parent
   if not parent.is_absolute():raise ValueError('parent must be absolute')
   destination=parent.resolve()/a.name
  if not destination.parent.is_dir():raise ValueError('project parent must already exist; choose an accessible parent')
  if destination.is_relative_to(boundary):raise ValueError('destination is inside the kit checkout; choose a separate project folder')
  required=['LICENSE','NOTICE','VERSION','skills-lock.json','START-HERE.md','README.md']
  files={name:metadata_file(kit,name) for name in required}
  if any(value is None for value in files.values()):raise ValueError('kit metadata or entry files missing')
  for name in ['folder-preflight.py','drift-check.sh']:
   if not (kit/'scripts'/name).is_file():raise ValueError('required local script missing: '+name)
  original=destination;suffix=1
  while True:
   try:destination.mkdir();created=destination;break
   except FileExistsError:
    if a.destination:raise ValueError('destination already exists; refusing to overwrite')
    suffix+=1;destination=original.with_name(original.name+'-'+str(suffix))
  pinned=destination/'.agentic-design-kit';pinned.mkdir()
  def ignore(_,names):return set(names)&{'__pycache__','_to_delete','.DS_Store'}
  shutil.copytree(kit/catalog['skill_root'],pinned/'skills',ignore=ignore)
  for name,path in files.items():shutil.copy2(path,pinned/name)
  for name in ['INSTALL.md','CHANGELOG.md','CONTRIBUTING.md','SECURITY.md']:
   path=metadata_file(kit,name)
   if path:shutil.copy2(path,pinned/name)
  (pinned/'scripts').mkdir()
  for name in ['folder-preflight.py','drift-check.sh']:shutil.copy2(kit/'scripts'/name,pinned/'scripts'/name)
  shutil.copy2(SCRIPT,pinned/'scripts/create-project.py')
  (pinned/'project-context.json').write_text(json.dumps({'project_root':'..','kit_version':(pinned/'VERSION').read_text().strip(),
    'skills_lock_sha256':hashlib.sha256((pinned/'skills-lock.json').read_bytes()).hexdigest(),
    'mode':'folder-execution','native_registration_asserted':False},indent=2)+'\n')
  common='''Implementation, project assets, proofs, screenshots and project guidelines belong in this
project root, outside .agentic-design-kit/. Keep the kit out of application build/test discovery
and deployed web assets, but retain it in version control for ongoing design work. If a framework
scaffolder requires an empty folder, scaffold temporarily and merge app files without replacing
these contexts, the pinned kit or existing project files. Use the pinned kit for design, review, refinement,
visual guidelines and system work; load supporting skill bodies only as their phase requires.
Preserve approved BRAND.md, DESIGN.md, tokens.json and components when extending the project.
This is an existing project workspace: do not create another project just because the kit lives
inside it. The kit snapshot is project-local and versioned; it does not install account skills.
'''
  (destination/'AGENTS.md').write_text('# Project design workflow\n\nFor design tasks, read .agentic-design-kit/START-HERE.md and execute its relevant workflows.\n\n'+common)
  (destination/'CLAUDE.md').write_text('# Project design workflow\n\n@.agentic-design-kit/START-HERE.md\n\n'+common)
  (destination/'README.md').write_text('# '+destination.name+'\n\nProject implementation belongs here. Design workflows are pinned in `.agentic-design-kit/`.\nKeep project brand/system guidelines at the root and use them for future design and review.\nOpen this project folder for later sessions; its agent contexts point to the local kit.\n')
  inspect(pinned)
  print(json.dumps({'project_root':str(destination),'kit_root':str(pinned),'version':(pinned/'VERSION').read_text().strip(),
                   'native_registration_asserted':False,'source_kit_modified':False},indent=2))
  return 0
 except (ValueError,OSError,KeyError,TypeError,ImportError) as error:
  print('Cannot create project: '+str(error),file=sys.stderr)
  if created:print('Incomplete new project retained at: '+str(created),file=sys.stderr)
  return 2
if __name__=='__main__':raise SystemExit(main())
