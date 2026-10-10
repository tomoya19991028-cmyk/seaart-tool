// Replays the existing browser suites without changing their fixtures/assertions.
const fs=require('fs'),path=require('path'),{spawnSync}=require('child_process');
const root=process.env.RESULT_DIR||'/workspace/seaart-stage5-e';
const url=process.env.TARGET_URL||'http://127.0.0.1:8765/seaart-tool/index.html';
const tests=fs.readdirSync(__dirname).filter(n=>/^(creature-adult-stage5-[abc]|common-access-stage5-d1).*\.cjs$/.test(n)).sort();
const results=[];for(const test of tests){const kind=test.includes('stage5-a')?'a':test.includes('stage5-b')?'b':test.includes('stage5-c')?'c':'d1',dir=path.join(root,'suite-'+kind);fs.mkdirSync(dir,{recursive:true});
 for(const name of ['old-main','old-stage3','old-stage5-a'])fs.copyFileSync(path.join(root,name+'.html'),path.join(dir,name+'.html'));
 fs.copyFileSync(path.join(root,kind==='c'?'old-stage5-b.html':kind==='d1'?'old-stage5-c.html':'old-stage5-a.html'),path.join(dir,'baseline.html'));
 const env={...process.env,TARGET_URL:url,CHROMIUM_PATH:process.env.CHROMIUM_PATH||'/usr/bin/chromium',RESULT_DIR:dir,ACCESS_ARTIFACT_ROOT:dir,STAGE5_A_URL:'http://127.0.0.1:8765/seaart-stage5-e/old-stage5-a.html'};
 const args=[path.join(__dirname,test),url,test.includes('-pwa')?dir:path.join(dir,test+'.json')],start=Date.now(),r=spawnSync(process.execPath,args,{env,encoding:'utf8',timeout:180000});
 const item={test,exit:r.status,seconds:(Date.now()-start)/1000,stdout:r.stdout,stderr:r.stderr,error:r.error?.message};results.push(item);fs.writeFileSync(path.join(root,'existing-suite-results.json'),JSON.stringify({url,results,passed:results.every(v=>v.exit===0)},null,2));console.log(test+': '+r.status+' '+r.stdout.trim());if(r.status!==0){console.error(r.stderr);process.exitCode=1}
 }
