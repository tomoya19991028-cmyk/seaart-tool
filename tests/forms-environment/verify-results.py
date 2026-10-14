#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,sys
repo=Path(__file__).resolve().parents[2];root=Path(sys.argv[1]).resolve();sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();counts={};records={}
for name,code in json.loads((root/'runner-results.json').read_text()).items():
 d=root/name;x=json.loads((d/'execution.json').read_text());assert code==x['exitCode']==0,(name,code)
 assert x['productSHA256Before']==x['productSHA256After']==sha(repo/'index.html'),name
 assert x['env']['TARGET_URL']=='http://127.0.0.1:8765/'+repo.name+'/index.html';assert x['testSHA256']==sha(repo/x['command'][-1])
 if x['wrapperSHA256']:assert x['wrapperSHA256']==sha(repo/'tests/forms-environment/replay.cjs')
 f={'legacy':'regression-results.json','r1':'r1-results.json','fixed':'final-fixed-comparison.json'}.get(name,'results.json');v=json.loads((d/f).read_text());assert v.get('passed',bool(v.get('tests')) and all(t.get('passed') is True for t in v['tests'])) is True,(name,v)
 if name=='r1':count=len(v['contracts']['checks']);assert count==49 and v['matrix']['checks']==865 and v['matrix']['baselineEqual']
 elif name=='legacy':count=v['adult'];assert v['normal']==v['manga']==252
 elif name=='motif':count=len(v['checks'])+len(v['faults'])+len(v['migration']);assert count==52
 elif name=='ui':count=len(v['T28'])+int(v['T27']['passed'])
 elif name=='pwa':count=len(v['T29'])+len(v['checks']);assert v['T30']['passed']
 elif name=='fixed':count=1;assert v['outputFingerprint']=='7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d'
 elif name=='faults':count=len(v['rows'])
 else:count=len(v.get('tests',v.get('checks',[])))
 counts[name]=count;records[name]={'cases':count,'exitCode':code,'productSHA256':x['productSHA256After'],'testSHA256':x['testSHA256'],'wrapperSHA256':x.get('wrapperSHA256')}
assert len(counts)==41 and sum(counts.values())==556,counts
v={'runnerCount':41,'passed':556,'failed':0,'counts':counts,'runners':records,'productSHA256':sha(repo/'index.html'),'physicalDevice':False,'publicOrigin':False};(root/'verified-results.json').write_text(json.dumps(v,indent=2));print('VERIFIED',len(counts),'runners',sum(counts.values()),'PASS')
