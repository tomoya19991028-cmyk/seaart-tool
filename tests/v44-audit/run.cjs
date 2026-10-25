const fs=require('fs'),path=require('path'),cp=require('child_process');
const {root,hash}=require('./helpers.cjs');
const out=path.resolve(process.env.RESULT_DIR||path.join(root,'.audit-tmp','run-'+new Date().toISOString().replace(/[:.]/g,'-')));
if(fs.existsSync(out))throw Error('Use a new evidence directory: '+out);
fs.mkdirSync(out,{recursive:true});
const executions=[],before=hash(fs.readFileSync(path.join(root,'index.html')));
let failed=false;
for(const name of ['quality','features','matrix','regressions','access','compatibility','ui','pwa']){
 const script='tests/v44-audit/'+name+'.cjs',startUTC=new Date().toISOString(),dir=path.join(out,name);
 const log=fs.openSync(path.join(out,name+'.log'),'w');
 console.log('Running',name);
 const run=cp.spawnSync(process.execPath,[script],{cwd:root,env:{...process.env,RESULT_DIR:dir},stdio:['ignore',log,log],timeout:10*60*1000});
 fs.closeSync(log);
 const resultFile=path.join(dir,'results.json'),result=fs.existsSync(resultFile)?JSON.parse(fs.readFileSync(resultFile)):null;
 const counts={PASS:0,FAIL:0,SKIP:0};for(const t of result?.tests||[])counts[t.status]++;
 executions.push({script,testSHA256:hash(fs.readFileSync(path.join(root,script))),command:[process.execPath,script],startUTC,endUTC:new Date().toISOString(),exitCode:run.status,error:run.error?.message,counts});
 console.log(name,run.status,counts);
 if(run.status!==0||!result)failed=true;
}
const after=hash(fs.readFileSync(path.join(root,'index.html')));
if(after!==before)failed=true;
fs.writeFileSync(path.join(out,'execution.json'),JSON.stringify({productBefore:before,productAfter:after,gitHEAD:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),node:process.version,executions,pass:!failed,realUserData:false,publicOrigin:false},null,2));
process.exitCode=failed?1:0;
