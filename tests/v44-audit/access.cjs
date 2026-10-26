// Reuse the original nonsexual access-control tests, without changing their assertions.
const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),{chromium}=require('playwright');
const {root,startServer,suite,assert}=require('./helpers.cjs');
(async()=>{const s=suite('access'),server=await startServer();try{
 const jobs=[['session','tests/common-access-stage5-d1.cjs','access-results.json'],['quota','tests/common-access-stage5-d1-quota.cjs','access-real-quota-results.json'],['schema','tests/stage5-e-access.cjs','access-schema-results.json']];
 for(const [name,script,resultName]of jobs)await s.test('ACCESS-original-'+name,async()=>{
  const dir=path.join(s.out,name);fs.mkdirSync(dir,{recursive:true});
  const log=fs.openSync(path.join(dir,'execution.log'),'w');
  const executable=process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':chromium.executablePath());
  const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[script],{cwd:root,env:{...process.env,CHROMIUM_PATH:executable,TARGET_URL:process.env.TARGET_URL||server.url,RESULT_DIR:dir,ACCESS_ARTIFACT_ROOT:dir},stdio:['ignore',log,log]});const timer=setTimeout(()=>child.kill('SIGTERM'),180000);child.on('error',reject);child.on('close',code=>{clearTimeout(timer);resolve(code)})});
  fs.closeSync(log);assert.equal(code,0,script+' failed; see '+dir+'/execution.log');
  const result=JSON.parse(fs.readFileSync(path.join(dir,resultName)));assert(result.passed);
  return {originalScript:script,originalAssertionsUnchanged:true,checks:result.checks?.length,faults:result.faults?.length,viewports:result.viewports?.length,realQuotaExceeded:result.realQuotaExceeded};
 });s.save({nonsexualFixtures:true,realUserStorage:false});
}finally{await server.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
