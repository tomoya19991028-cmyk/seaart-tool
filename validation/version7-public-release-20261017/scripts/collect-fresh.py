from pathlib import Path
import json,hashlib,subprocess,datetime
r=Path(__file__).resolve().parent;e=r/'tests';repo=Path('/workspace/seaart-v7-main-integration');h=hashlib.sha256((repo/'index.html').read_bytes()).hexdigest();suites=[]
subprocess.run(['python','tests/tg-yugioh-phase1/verify-inherited.py',str(e/'inherited')],cwd=repo,check=True)
v=json.loads((e/'inherited/verified-results.json').read_text());assert v['passed']==556
suites.append({'name':'inherited-41','passed':556,'source':'inherited/verified-results.json'})
def add(name,p,n):
 v=json.loads(p.read_text());rows=v['tests'];assert len(rows)==n,(name,len(rows));assert all(x.get('passed') is True for x in rows),(name,[x for x in rows if x.get('passed') is not True]);assert v.get('productSHA256',h)==h
 assert datetime.datetime.fromtimestamp(p.stat().st_mtime,datetime.timezone.utc).date()==datetime.date(2026,10,17)
 suites.append({'name':name,'passed':n,'source':str(p.relative_to(e))})
for name,n in {'contracts':32,'persistence':9,'candidate-ui':6,'ui':12,'structure-visibility':3,'environment-faults':2,'result-area':3,'pwa':4,'forms-repro':2}.items():add('forms-'+name,e/'forms'/name/'results.json',n)
for name,n in [('contracts',32),('ui-pwa',7),('quality',21)]:add(name,e/name/'results.json',n)
for name,n in [('yugioh-selection',15),('preset-details',10)]:add(name,e/'new-extras'/name/'results.json',n)
assert sum(s['passed'] for s in suites)==714
for parent in ['forms','contracts','new-extras','ui-pwa']:
 x=json.loads((e/(parent+'-runner')/'execution.json').read_text());assert x['productSHA256']==h and x['startUTC'].startswith('2026-10-17')
 if parent=='forms' and x['exitCode']!=0:
  initial=json.loads((e/'forms/runner-results.json').read_text());retry=json.loads((e/'forms/retry-manifest.json').read_text());assert {n for n,c in initial.items() if c!=0}==set(retry);assert all(v['finalExitCode']==0 for v in retry.values())
 else:assert x['exitCode']==0
assert all(x==0 for x in json.loads((e/'forms/runner-results-final.json').read_text()).values())
assert all(x==0 for x in json.loads((e/'new-extras/runner-results.json').read_text()).values())
add('release-static',e/'static-release-audit.json',8);add('pages-build',e/'pages-build.json',1);add('public-subpath-update',e/'public-path-update/results.json',7)
add('public-https-before',e/'public-browser-before/results.json',5)
source={str(p.relative_to(repo)):hashlib.sha256(p.read_bytes()).hexdigest() for p in (repo/'tests/tg-yugioh-phase1').iterdir() if p.is_file()}
skips=[{'id':'R08-Amon','reason':'未実装の片眼形態・原典照合待ち'},{'id':'R08-Takizawa','reason':'未実装の片眼形態・原典照合待ち'},{'id':'R09-Hinami-kagune','reason':'複合赫子未実装'},{'id':'R24-new-nonhuman','reason':'新規全身非人型未実装'}]
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'executionDate':'2026-10-17','freshExecutionsOnly':True,'priorTaskResultsReused':False,'passed':sum(x['passed'] for x in suites),'failed':0,'regularRegressionCases':700,'alternativeRegressionCases':14,'releasePreparationCases':21,'scopeSkipped':skips,'unrecoveredOriginalTestFiles':3,'unrecoveredOriginal48ContractsAnd7FaultTestsClaimed':False,'suites':suites,'regressionRunnerCount':55,'matricesNotDoubleCounted':{'R1':865,'structures':72,'unsetAbsent':144,'legacyNormal':252,'legacyManga':252},'sourceSHA256':source,'productSHA256':h,'serviceWorkerSHA256':hashlib.sha256((repo/'sw.js').read_bytes()).hexdigest(),'pagesConfigSHA256':hashlib.sha256((repo/'_config.yml').read_bytes()).hexdigest(),'physicalAndroid':False,'actualSeaArt':False,'publicOriginOffline':'not performed before publishing','failedPriorAttemptsRetained':['Unmodified submitted tree Jekyll build: dangling validation symlink; fixed by _config.yml','Initial HTML validator rule configuration invalid; corrected to syntax/doctype check']}
out['initialFailedRuns']=[{'runner':p.parent.name,'execution':str(p.relative_to(e)),'finalReplay': 'inherited/'+p.parent.name+'/execution.json'} for p in (e/'failed-initial-attempts').glob('*/execution.json')]
for row in out['initialFailedRuns']:
 name=row['runner'];row['finalReplay']='forms/forms-repro/execution.json' if name=='forms-repro' else ('public-path-update-runner/execution.json' if name.startswith('public-path-') else row['finalReplay'])
out['initialFailedRuns'] += [{'runner':p.parent.name,'execution':str(p.relative_to(e)),'finalReplay':'inherited/'+p.parent.name+'/execution.json'} for p in (e/'inherited-parallel-attempt').glob('*/execution.json') if json.loads(p.read_text()).get('exitCode')!=0]
out['withinTaskReuse']='Only PASS executions begun on 2026-10-17 with identical product/test/adapter hashes; parallel failures repeated unchanged with one browser.'
assert out['passed']==735;(e/'summary.json').write_text(json.dumps(out,ensure_ascii=False,indent=2));print('FRESH VERIFIED',out['passed'],'PASS',out['failed'],'FAIL',len(skips),'scope SKIP')
