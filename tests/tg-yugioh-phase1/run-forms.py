#!/usr/bin/env python3
from pathlib import Path
import subprocess,os,json,sys,hashlib
repo=Path(__file__).resolve().parents[2];out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=False);codes={}
for name in ['contracts','persistence','candidate-ui','ui','structure-visibility','environment-faults','result-area','pwa','forms-repro']:
 d=out/name;d.mkdir();command=['node','tests/tg-yugioh-phase1/replay.cjs','tests/forms-environment/'+name+'.cjs'];env={**os.environ,'RESULT_DIR':str(d.resolve())};print('START',name,flush=True)
 with (d/'stdout.log').open('wb') as so,(d/'stderr.log').open('wb') as se:
  try:r=subprocess.run(command,cwd=repo,env=env,stdout=so,stderr=se,timeout=900);codes[name]=r.returncode
  except subprocess.TimeoutExpired:codes[name]='TIMEOUT'
 (d/'execution.json').write_text(json.dumps({'command':command,'exitCode':codes[name],'productSHA256':hashlib.sha256((repo/'index.html').read_bytes()).hexdigest()},indent=2));print('COMPLETE',name,codes[name],flush=True)
 (out/'runner-results.json').write_text(json.dumps(codes,indent=2))
sys.exit(not all(v==0 for v in codes.values()))
