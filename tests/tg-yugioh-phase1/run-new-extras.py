#!/usr/bin/env python3
from pathlib import Path
import subprocess,json,os,sys,hashlib
repo=Path(__file__).resolve().parents[2];out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=False);codes={};sha=lambda f:hashlib.sha256(f.read_bytes()).hexdigest()
for name in ['yugioh-selection','preset-details']:
 d=out/name;d.mkdir();file='tests/tg-yugioh-phase1/'+name+'.cjs';cmd=['node',file];print('START',name,flush=True)
 with (d/'stdout.log').open('wb') as so,(d/'stderr.log').open('wb') as se:r=subprocess.run(cmd,cwd=repo,env={**os.environ,'RESULT_DIR':str(d.resolve())},stdout=so,stderr=se,timeout=600)
 codes[name]=r.returncode;(d/'execution.json').write_text(json.dumps({'command':cmd,'exitCode':r.returncode,'productSHA256':sha(repo/'index.html'),'testSHA256':sha(repo/file)},indent=2));print('COMPLETE',name,r.returncode,flush=True)
 (out/'runner-results.json').write_text(json.dumps(codes,indent=2))
sys.exit(not all(v==0 for v in codes.values()))
