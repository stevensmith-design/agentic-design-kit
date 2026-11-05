#!/usr/bin/env python3
"""Check publication text, hidden payloads and nested ZIP/tar downloads for known private remnants.

A clean result covers these rules, not all possible client identities or secrets. Retain human
review of prose, fixtures, filenames, URLs and assets before publication. No extraction or upload.
"""
import argparse,io,json,re,sys,tarfile,zipfile
from pathlib import Path

RULES={
 'client-calibration-label':re.compile(r'\b'+'J'+'T'+r'(?:-\d{4}(?:-\d{2})?)?\b',re.I),
 'private-review-lineage':re.compile(r'\bconsumer[- ]app\s+design[- ]review\s+series\b',re.I),
 'personal-runtime-path':re.compile('/'+'Users'+r'/[^/\s]+/|/'+'home'+r'/claude/'),
 'private-project-name':re.compile(r'\b'+'ground'+'work'+r'\b',re.I),
 'legacy-internal-name':re.compile(r'\b'+'design'+r'[-_ ]?'+'skills'+r'[-_ ]?'+'kit'+r'\b',re.I),
 'private-desktop-checkout':re.compile('~/'+'Desktop'+r'/[\w./-]+'),
}
MAX_MEMBER=64*1024*1024
MAX_TOTAL=256*1024*1024
class Audit:
 def __init__(self):self.errors=[];self.text_files=0;self.archives=0;self.total=0
 def error(self,name,rule,line=None):
  # Do not copy a sensitive matched value into a report that might itself be distributed.
  safe=name
  for regex in RULES.values():safe=regex.sub('<redacted>',safe)
  self.errors.append({'path':safe,'rule':rule,**({'line':line} if line else {})})
 def text(self,name,data):
  try:body=data.decode('utf-8')
  except UnicodeError:return
  self.text_files+=1
  for rule,regex in RULES.items():
   for match in regex.finditer(body):
    self.error(name,rule,body.count('\n',0,match.start())+1)
 def content(self,name,data,depth=0):
  self.total+=len(data)
  if len(data)>MAX_MEMBER or self.total>MAX_TOTAL:
   self.error(name,'content-size-limit-unverified');return
  for rule,regex in RULES.items():
   if regex.search(name):self.error(name,'filename-'+rule)
  lower=name.lower()
  if not lower.endswith(('.zip','.tar','.tar.gz','.tgz')):
   self.text(name,data);return
  if depth>=4:self.error(name,'archive-depth-unverified');return
  self.archives+=1
  try:
   if lower.endswith('.zip'):
    with zipfile.ZipFile(io.BytesIO(data)) as z:
     self.text(name+' [archive comment]',z.comment)
     for member in z.infolist():
      if member.is_dir():continue
      self.text(name+'!'+member.filename+' [member comment]',member.comment)
      if member.file_size>MAX_MEMBER:self.error(name+'!'+member.filename,'member-size-unverified');continue
      self.content(name+'!'+member.filename,z.read(member),depth+1)
   else:
    with tarfile.open(fileobj=io.BytesIO(data),mode='r:*') as t:
     for member in t:
      self.text(name+'!'+member.name+' [metadata]',json.dumps({'owner':member.uname,'group':member.gname,'link':member.linkname,'headers':member.pax_headers}).encode())
      if member.uid or member.gid or member.uname or member.gname:self.error(name+'!'+member.name,'non-anonymous-archive-ownership')
      if member.isdir():continue
      if not member.isfile():self.error(name+'!'+member.name,'linked-or-special-archive-member');continue
      if member.size>MAX_MEMBER:self.error(name+'!'+member.name,'member-size-unverified');continue
      stream=t.extractfile(member)
      if stream is None:self.error(name+'!'+member.name,'unreadable-archive-member');continue
      self.content(name+'!'+member.name,stream.read(MAX_MEMBER+1),depth+1)
  except (OSError,ValueError,zipfile.BadZipFile,tarfile.TarError,RuntimeError,EOFError):
   self.error(name,'unreadable-archive-unverified')
 def tree(self,root):
  if root.is_symlink():self.error(root.name,'symlink');return
  if root.is_file():self.content(root.name,root.read_bytes());return
  if not root.is_dir():self.error(root.name,'missing-input');return
  for path in sorted(root.rglob('*')):
   rel=path.relative_to(root)
   if '.git' in rel.parts or '__pycache__' in rel.parts or path.suffix=='.pyc':continue
   if path.is_symlink():self.error(str(rel),'symlink');continue
   if not path.is_file():continue
   try:self.content(str(rel),path.read_bytes())
   except OSError:self.error(str(rel),'unreadable-file-unverified')

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('roots',nargs='+',type=Path);p.add_argument('--json',action='store_true');a=p.parse_args();audit=Audit()
 for root in a.roots:audit.tree(root)
 report={'status':'INVALID' if audit.errors else 'PASS','text_files':audit.text_files,'archives':audit.archives,'findings':audit.errors,'scope':'known private labels/lineage and local paths; human review still required'}
 if a.json:print(json.dumps(report,indent=2))
 else:
  for error in audit.errors:print('INVALID — '+error['path']+((':'+str(error['line'])) if 'line' in error else '')+' — '+error['rule'])
  print(report['status']+f' — public content audit: {audit.text_files} text files, {audit.archives} archives, {len(audit.errors)} findings')
 return bool(audit.errors)
if __name__=='__main__':sys.exit(main())
