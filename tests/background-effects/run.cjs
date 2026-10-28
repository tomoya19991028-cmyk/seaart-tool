const fs=require('fs'),path=require('path'),cp=require('child_process');const{root,hash}=require('./helpers.cjs');
const out=path.resolve(process.env.RESULT_DIR||path.join(root,'.audit-tmp','background-effects-run-'+Date.now()));if(fs.existsSync(out))throw Error('Fresh evidence directory required');fs.mkdirSync(out,{recursive:true});
const before=hash(fs.readFileSync(path.join(root,'index.html'))),executions=[];let failed=false;
for(const name of ['contracts','matrix','boundaries','storage','ui','pwa']){
 const script='tests/background-effects/'+name+'.cjs',log=fs.openSync(path.join(out,name+'.log'),'w'),startUTC=new Date().toISOString(),dir=path.join(out,name);console.log('START',name);
 const run=cp.spawnSync(process.execPath,[script],{cwd:root,env:{...process.env,RESULT_DIR:dir},stdio:['ignore',log,log],timeout:15*60*1000});fs.closeSync(log);const file=path.join(dir,'results.json'),result=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null,counts={PASS:0,FAIL:0,SKIP:0};for(const t of result?.tests||[])counts[t.status]++;
 executions.push({name,startUTC,endUTC:new Date().toISOString(),testSHA256:hash(fs.readFileSync(path.join(root,script))),exitCode:run.status,error:run.error?.message,counts});console.log('END',name,run.status,counts);
 if(run.status!==0||!result){failed=true;console.error(fs.readFileSync(path.join(out,name+'.log'),'utf8').slice(-9000))}
}
const after=hash(fs.readFileSync(path.join(root,'index.html')));if(before!==after)failed=true;fs.writeFileSync(path.join(out,'executions.json'),JSON.stringify({gitHEAD:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),node:process.version,productBefore:before,productAfter:after,executions,pass:!failed},null,2));if(failed)process.exitCode=1;
