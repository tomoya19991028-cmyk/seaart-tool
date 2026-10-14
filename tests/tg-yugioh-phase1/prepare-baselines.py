#!/usr/bin/env python3
"""Prepare immutable historical localhost routes; never overwrite a differing file."""
from pathlib import Path
import json,subprocess,sys,hashlib
repo=Path(__file__).resolve().parents[2];workspace=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else repo.parent
proof=repo/'validation/tg-yugioh-phase1';pairs={}
for file in ['baseline-inventory.json','legacy-route-baselines.json']:
 for row in json.loads((proof/file).read_text()):
  if row.get('head'):pairs[row['folder']]=row['head']
for folder,head in pairs.items():
 p=workspace/folder;p.mkdir(parents=True,exist_ok=True)
 for name in ['index.html','sw.js','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png']:
  b=subprocess.check_output(['git','show',head+':'+name],cwd=repo);target=p/name
  if target.exists():assert target.read_bytes()==b,'Different existing file: '+str(target)
  else:target.write_bytes(b)
for alias,target in [('seaart-creature-motif-integration1/baseline',workspace/'seaart-old-main')]:
 p=workspace/alias;p.parent.mkdir(parents=True,exist_ok=True)
 if p.exists() or p.is_symlink():assert p.is_symlink() and p.resolve()==target.resolve(),'Conflicting route: '+str(p)
 else:p.symlink_to(target,target_is_directory=True)
assert all((workspace/folder/'index.html').exists() for folder in pairs)
print('Historical assets exact; current test URL is supplied explicitly; no differing files overwritten')
