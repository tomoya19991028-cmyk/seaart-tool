#!/usr/bin/env python3
"""Collect only the final byte-identical executions; keep earlier attempts separate."""
from pathlib import Path
import json,hashlib,subprocess,sys,datetime
repo=Path(__file__).resolve().parents[2];root=repo/'validation/tg-yugioh-phase1';attempt=root/'attempts';inherited=Path(sys.argv[1]).resolve();product=hashlib.sha256((repo/'index.html').read_bytes()).hexdigest()
subprocess.run([sys.executable,str(repo/'tests/tg-yugioh-phase1/verify-inherited.py'),str(inherited)],cwd=repo,check=True)
v=json.loads((inherited/'verified-results.json').read_text());assert v['productSHA256']==product
suites=[{'name':'inherited-41','cases':v['passed'],'passed':v['passed'],'failed':0,'source':str(inherited.relative_to(repo)/'verified-results.json')}]
def add(name,d,expected):
 x=json.loads((d/'results.json').read_text());tests=x['tests'];assert len(tests)==expected,(name,len(tests));assert all(t.get('passed') is True for t in tests),(name,[t for t in tests if not t.get('passed')]);assert x.get('productSHA256',product)==product
 if (d/'execution.json').exists():
  e=json.loads((d/'execution.json').read_text());assert e['exitCode']==0 and e['productSHA256']==product
 suites.append({'name':name,'cases':len(tests),'passed':len(tests),'failed':0,'source':str((d/'results.json').relative_to(repo))})
add('phase1-contracts',attempt/'contracts-outfit-fix',32)
for name,n in [('yugioh-selection',15),('preset-details',10)]:add(name,attempt/'new-extras-outfit-fix'/name,n)
add('phase1-ui-pwa',attempt/'ui-pwa-outfit-fix',7);add('quality',attempt/'quality-outfit-fix',21)
forms={'contracts':32,'persistence':9,'candidate-ui':6,'ui':12,'structure-visibility':3,'environment-faults':2,'result-area':3,'pwa':4,'forms-repro':2}
assert all(x==0 for x in json.loads((attempt/'forms-outfit-fix/runner-results.json').read_text()).values())
for name,n in forms.items():add('inherited-forms-'+name,attempt/'forms-outfit-fix'/name,n)
skipped=[{'id':'R08-Amon','reason':'New one-eye form deferred; canonical side/era review pending.'},{'id':'R08-Takizawa','reason':'New one-eye form deferred; canonical side/era review pending.'},{'id':'R09-Hinami-kagune','reason':'New composite kagune not implemented in this batch.'},{'id':'R24-new-nonhuman','reason':'New full-body nonhuman forms not implemented in this batch.'}]
result={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'productSHA256':product,'runnerCount':41+9+5,'caseCount':sum(s['cases'] for s in suites),'passed':sum(s['passed'] for s in suites),'failed':0,'scopeSkipped':skipped,'suites':suites,'separateMatrices':{'R1':865,'formsTypeStateStructure':72,'unsetAbsent':144,'legacyNormalFulltexts':252,'legacyMangaFulltexts':252},'physicalAndroid':False,'actualSeaArt':False,'v3Fixture':'derived from actual v4 export by version change and removing actor form extensions','outdatedAttemptsIncludedAsFinal':False,'alternativeCases':14,'regularCases':700,'unrecoveredOriginalTestFiles':3}
assert result['caseCount']==result['passed']==714
(root/'results-summary.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
files=['index.html','sw.js','src/tokyo-ghoul-phase1.json','src/person-specific-forms.json','src/builtin-additions.js','src/tg-yugioh-core-edits.json','scripts/embed-horror.py','scripts/build-tg-yugioh-phase1.py','scripts/embed-tg-yugioh-phase1.py']
proof={'at':result['at'],'productSHA256':{f:hashlib.sha256((repo/f).read_bytes()).hexdigest() for f in files},'testSHA256':{str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (repo/'tests/tg-yugioh-phase1').iterdir() if p.is_file()},'gitDiffCheckWithCRLF':subprocess.run(['git','-c','core.whitespace=cr-at-eol','diff','--check'],cwd=repo,capture_output=True).returncode==0,'physicalAndroid':False,'actualSeaArt':False}
(root/'final-product-and-tests.json').write_text(json.dumps(proof,indent=2)+'\n');print('FINAL VERIFIED',result['runnerCount'],'runners',result['passed'],'PASS',0,'FAIL',len(skipped),'scope SKIP')
