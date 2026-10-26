// Repeat the whole UI suite because the first CI did not retain its failed case ID.
const fs=require('fs'),path=require('path'),cp=require('child_process'),{root,hash}=require('../v44-audit/helpers.cjs');
const out=path.resolve(process.env.RESULT_DIR||path.join(root,'.audit-tmp','remaining-stability-'+Date.now()));if(fs.existsSync(out))throw Error('Fresh directory required');fs.mkdirSync(out,{recursive:true});
const rows=[];for(let i=1;i<=5;i++){
 const dir=path.join(out,'fresh-'+i),log=fs.openSync(path.join(out,'fresh-'+i+'.log'),'w'),startUTC=new Date().toISOString();
 const r=cp.spawnSync(process.execPath,['tests/v44-audit/ui.cjs'],{cwd:root,env:{...process.env,RESULT_DIR:dir,AUDIT_DIAGNOSTICS:'1'},stdio:['ignore',log,log],timeout:10*60*1000});fs.closeSync(log);
 const file=path.join(dir,'results.json'),result=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null,counts={PASS:0,FAIL:0,SKIP:0};for(const t of result?.tests||[])counts[t.status]++;
 rows.push({iteration:i,startUTC,endUTC:new Date().toISOString(),exitCode:r.status,error:r.error?.message,counts,tests:result?.tests,productSHA256:hash(fs.readFileSync(path.join(root,'index.html')))});console.log('fresh context',i,r.status,counts);
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({repetitions:rows,initialCIRootCause:'unrecoverable: no per-case log/artifact was retained',realAndroid:false},null,2));
}if(rows.some(r=>r.exitCode!==0))process.exitCode=1;
