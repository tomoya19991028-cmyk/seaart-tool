#!/usr/bin/env python3
"""Replay immutable suites against this product; use a fresh evidence directory."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib, json, os, subprocess, sys, time

repo=Path(__file__).resolve().parents[2]
assert len(sys.argv)==2, 'Usage: python tests/unified-ui/run.py NEW_RESULT_DIRECTORY'
root=Path(sys.argv[1]).resolve()
assert not root.exists(), 'Existing evidence must not be overwritten'
root.mkdir(parents=True)
target=os.environ.get('TARGET_URL', 'http://127.0.0.1:8765/'+repo.name+'/index.html')
baseline=os.environ.get('BASELINE_URL','http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html')
baseline_dir=Path(os.environ.get('BASELINE_DIR','/workspace/seaart-creature-motif-integration1/baseline'))
wrapper={'unified-compatibility','unified-pwa','ui','pwa','pwa-regression','combined-pwa','normal-pwa','card-pwa','combined-ui','story-pwa','ui-extra'}
jobs=[('auto-inherited','tests/horror-auto/inherited.cjs'),('auto-shared-prompt','tests/horror-auto/shared-prompt.cjs'),('auto-fixed','tests/horror-auto/fixed.cjs'),('auto-shared-ui','tests/horror-auto/shared-ui.cjs'),('auto-contracts','tests/horror-auto/contracts.cjs'),('auto-ui','tests/horror-auto/ui.cjs'),('auto-pwa','tests/horror-auto/pwa.cjs'),('auto-compatibility','tests/horror-auto/compatibility.cjs'),('story-contracts','tests/horror-stories/contracts.cjs'),('story-ui','tests/horror-stories/ui.cjs'),('story-pwa','tests/horror-stories/pwa.cjs'),('unified-compatibility', 'tests/unified-ui/compatibility.cjs'), ('unified-pwa', 'tests/unified-ui/pwa.cjs'), ('unified-contracts', 'tests/unified-ui/contracts.cjs'), ('unified-ui', 'tests/unified-ui/ui.cjs'), ('card-contracts', 'tests/card-tags/contracts.cjs'), ('card-ui', 'tests/card-tags/ui.cjs'), ('card-pwa', 'tests/card-tags/pwa.cjs'), ('card-persistence', 'tests/card-tags/persistence.cjs'), ('normal-contracts', 'tests/normal-first/contracts.cjs'), ('normal-ui', 'tests/normal-first/ui.cjs'), ('normal-pwa', 'tests/normal-first/pwa.cjs'), ('contracts', 'tests/horror/contracts.cjs'), ('faults', 'tests/horror/faults.cjs'), ('r1', 'tests/creature-motif-person-r1.cjs'), ('legacy', 'tests/horror/replay-legacy.cjs'), ('boundaries', 'tests/horror/boundaries.cjs'), ('motif', 'tests/creature-motif-person.cjs'), ('motif-boundaries', 'tests/creature-motif-person-boundaries.cjs'), ('edges', 'tests/horror/independent-edges.cjs'), ('round2-retest', 'tests/integration/motif-round2-alternative.cjs'), ('ui', 'tests/horror/ui.cjs'), ('pwa-regression', 'tests/horror/replay-pwa.cjs'), ('integration', 'tests/integration/horror-motif.cjs'), ('prompts', 'tests/horror/independent-prompts.cjs'), ('combined-pwa', 'tests/integration/pwa.cjs'), ('pwa', 'tests/horror/pwa.cjs'), ('ui-extra', 'tests/horror/independent-ui.cjs'), ('combined-ui', 'tests/integration/ui.cjs'), ('motif-prompts', 'tests/integration/motif-prompts.cjs'), ('fixed', 'tests/creature-motif-person-fixed-baseline.cjs')]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
stamp=lambda:datetime.now(timezone.utc).isoformat()
def execute(name,script):
    out=root/name;out.mkdir()
    env={**os.environ,'TARGET_URL':target,'BASELINE_URL':baseline,'RESULT_DIR':str(out)}
    if name=='fixed':
        assert baseline_dir.exists(), 'Original fixed baseline directory is required'
        (out/'baseline').symlink_to(baseline_dir,target_is_directory=True)
        env['CURRENT_RESULTS']=str(root/'r1'/'r1-generation-fulltext.json')
    command=['node',*(['tests/horror-auto/replay.cjs'] if name in wrapper else []),script]
    record={'command':command,'cwd':str(repo),'startUTC':stamp(),'gitHEAD':subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo).decode().strip(),'productSHA256Before':sha(repo/'index.html'),'testSHA256':sha(repo/script),'wrapperSHA256':sha(repo/'tests/horror-auto/replay.cjs') if name in wrapper else None,'env':{k:env[k] for k in ['TARGET_URL','BASELINE_URL','RESULT_DIR']},'physicalDevice':False,'publicOriginTest':False}
    with (out/'stdout.log').open('wb') as stdout,(out/'stderr.log').open('wb') as stderr:
        run=subprocess.run(command,cwd=repo,env=env,stdout=stdout,stderr=stderr)
    record.update({'exitCode':run.returncode,'endUTC':stamp(),'productSHA256After':sha(repo/'index.html')})
    (out/'execution.json').write_text(json.dumps(record,indent=2))
    return run.returncode
pending=dict(jobs);running={};complete={}
limit=int(os.environ.get('TEST_WORKERS','3'))
with ThreadPoolExecutor(max_workers=limit) as pool:
    while pending or running:
        for name,future in list(running.items()):
            if future.done():
                try:complete[name]=future.result()
                except Exception as e:complete[name]=None;print(name,str(e),flush=True)
                running.pop(name);print('COMPLETE',name,complete[name],flush=True)
        memory=Path('/sys/fs/cgroup/memory.current')
        if len(running)<limit and (not memory.exists() or int(memory.read_text())<5500000000):
            for name,script in list(pending.items()):
                if name=='fixed':
                    if 'r1' not in complete:continue
                    if complete['r1']!=0:complete[name]=None;pending.pop(name);continue
                pending.pop(name);running[name]=pool.submit(execute,name,script);print('START',name,flush=True);break
        time.sleep(1)
(root/'runner-results.json').write_text(json.dumps(complete,indent=2))
sys.exit(0 if len(complete)==len(jobs) and all(v==0 for v in complete.values()) else 1)
