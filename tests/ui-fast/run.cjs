const fs=require('fs'),path=require('path'),cp=require('child_process');
const {root,hash}=require('../v44-audit/helpers.cjs');
const out=path.resolve(process.env.RESULT_DIR||path.join(root,'.audit-tmp','ui-fast-'+Date.now()));
if(fs.existsSync(out))throw Error('Fresh evidence directory required');fs.mkdirSync(out,{recursive:true});
const executions=[],before=hash(fs.readFileSync(path.join(root,'index.html')));
for(const name of ['behavior','legacy-alias','forward']){
 const resultDir=path.join(out,name),script='tests/ui-fast/'+name+'.cjs',startUTC=new Date().toISOString();
 const run=cp.spawnSync(process.execPath,['--require',path.join(__dirname,'fail-fast.cjs'),script],{cwd:root,env:{...process.env,RESULT_DIR:resultDir},stdio:'inherit',timeout:300000});
 executions.push({script,testSHA256:hash(fs.readFileSync(path.join(root,script))),startUTC,endUTC:new Date().toISOString(),exitCode:run.status,error:run.error?.message});
 fs.writeFileSync(path.join(out,'executions.json'),JSON.stringify({productBefore:before,productAfter:hash(fs.readFileSync(path.join(root,'index.html'))),executions},null,2));
 if(run.status!==0){process.exitCode=1;break;}
}
