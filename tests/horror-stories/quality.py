#!/usr/bin/env python3
"""Compare every pre-existing definition with Git, and check the additive catalog."""
import json,subprocess,hashlib,collections,sys
from pathlib import Path
repo=Path(__file__).resolve().parents[2]
base='ede9fa02a0088816509b20f216b652c3237d87fd'
old=json.loads(subprocess.check_output(['git','show',base+':src/horror-catalog.json'],cwd=repo));new=json.loads((repo/'src/horror-catalog.json').read_text());add=json.loads((repo/'tests/horror-stories/candidate-additions.json').read_text());checks=[]
def check(name,value):
 checks.append({'name':name,'passed':bool(value)})
check('Every old horror definition/enum is unchanged',{**new,'features':new['features'][:len(old['features'])]}==old)
check('Exactly 72 appended definitions',new['features'][len(old['features']):]==add['features'] and len(add['features'])==72)
for k in ['id','label','tag']:check(k+' unique',len({f[k] for f in new['features']})==len(new['features']))
check('Body 36 / horror 36',collections.Counter(add['kinds'].values())=={'body':36,'horror':36})
check('Only existing six feature groups',set(f['group'] for f in new['features'])==set(f['group'] for f in old['features']))
check('Unchanged foundation/schema/normal/card-tag/runtime sources',all(subprocess.check_output(['git','show',base+':'+f],cwd=repo)==(repo/f).read_bytes() for f in ['src/horror-foundation.js','src/horror-normal-ui.js','src/horror-card-tags.js','src/horror-runtime.js','src/creature-motif-person.js','scripts/integrate-horror.py']))
check('SW cache-name-only change',subprocess.check_output(['git','show',base+':sw.js'],cwd=repo).replace(b'seaart-tool-pwa-v5-person-creature-unified-ui-v1-http-cache-v1',b'seaart-tool-pwa-v5-horror-catalog-story-presets-v1-http-cache-v1')==(repo/'sw.js').read_bytes())
oldtests=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'tests'],cwd=repo).decode().splitlines();check('All '+str(len(oldtests))+' existing tests/fixtures byte unchanged',all(subprocess.check_output(['git','show',base+':'+f],cwd=repo)==(repo/f).read_bytes() for f in oldtests))
result={'tests':checks,'passed':all(c['passed'] for c in checks),'counts':dict(collections.Counter(f['group'] for f in add['features'])),'files':{f:{'bytes':(repo/f).stat().st_size,'sha256':hashlib.sha256((repo/f).read_bytes()).hexdigest()} for f in ['index.html','sw.js','manifest.json']}}
print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['passed'] else 1)
