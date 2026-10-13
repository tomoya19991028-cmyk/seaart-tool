#!/usr/bin/env python3
"""Additive definitions and protected old product/fixtures; no expected files are edited."""
from pathlib import Path
import json,subprocess,hashlib,collections,sys
repo=Path(__file__).resolve().parents[2];base='cf0336d03e3edf104fdaa911b9bc568a3609bf50';checks=[]
def old(f):return subprocess.check_output(['git','show',base+':'+f],cwd=repo)
def check(name,value):checks.append({'name':name,'passed':bool(value)})
a=json.loads((repo/'src/horror-auto-definitions.json').read_text());catalog=json.loads((repo/'src/horror-catalog.json').read_text());ids={f['id'] for f in catalog['features']}
check('Existing 84 definitions/labels/tags/enums exact',old('src/horror-catalog.json')==(repo/'src/horror-catalog.json').read_bytes() and len(ids)==84)
check('Six groups each14',set(collections.Counter(f['group'] for f in catalog['features']).values())=={14})
check('Six types exact and structure/state matrices complete',{t['id'] for t in a['types']}=={t['id'] for t in catalog['types']} and all(set(t['body'])=={'partial','complete'} and set(t['structures'])=={'wings','horns','tail'} and all(set(v)=={'partial','complete'} for v in t['structures'].values()) for t in a['types']))
check('All mapped existing candidates exist',all(f in ids for t in a['types'] for f in t['primary']['partial']+t['primary']['complete']+t['secondary']))
check('Virtual English tags unique',len({tag for t in a['types'] for tag in list(t['body'].values())+[v for p in t['structures'].values() for v in p.values()]}|{t['tag'] for t in a['traits']})==50)
check('Manual resolver/producers/motif/card-tag/person/normal UI untouched',all(old(f)==(repo/f).read_bytes() for f in ['src/horror-runtime.js','src/horror-normal-ui.js','src/horror-card-tags.js','src/creature-motif-person.js','src/person-creature-unified-ui.js','scripts/integrate-horror.py']))
check('Six story preset definitions/application untouched',all(old(f)==(repo/f).read_bytes() for f in ['src/horror-story-presets.js','src/horror-story-presets.json']))
check('SW only unique cache name changed',old('sw.js').replace(b'seaart-tool-pwa-v5-horror-catalog-story-presets-v1-http-cache-v1',b'seaart-tool-pwa-v5-horror-auto-mobile-ui-v1-http-cache-v1')==(repo/'sw.js').read_bytes())
check('Manifest and icons unchanged',all(old(f)==(repo/f).read_bytes() for f in ['manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png']))
original=subprocess.check_output(['git','ls-tree','-r','--name-only',base,'tests'],cwd=repo).decode().splitlines();check('All '+str(len(original))+' original test/fixture files exact',all(old(f)==(repo/f).read_bytes() for f in original))
foundation=(repo/'src/horror-foundation.js').read_text();check('v5/horror1 namespace unchanged; optional policy validation only', 'horrorVersion=1' in foundation and 'if(a.autoFeatures!==undefined)hAutoPolicy(a.autoFeatures);' in foundation and 'if(a.autoFeatures!==undefined)hAutoPolicy(a.autoFeatures,true);' in foundation)
syntax=[]
for f in repo.glob('src/horror-auto-*.js'):
 r=subprocess.run(['node','--check',str(f)],capture_output=True);syntax.append(r.returncode==0)
check('New JavaScript syntax',all(syntax))
result={'tests':checks,'passed':all(c['passed'] for c in checks),'base':base,'immutableTests':len(original),'files':{f:{'bytes':(repo/f).stat().st_size,'sha256':hashlib.sha256((repo/f).read_bytes()).hexdigest()} for f in ['index.html','sw.js','manifest.json']}}
print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(0 if result['passed'] else 1)
