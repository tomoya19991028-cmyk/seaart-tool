const fs=require('fs'),path=require('path'),cp=require('child_process'),{root,hash}=require('../v44-audit/helpers.cjs');
const assets=path.join(root,'.audit-tmp','remaining-assets');
function prepare(){
 fs.mkdirSync(assets,{recursive:true});
 cp.execFileSync('python3',['tests/tg-yugioh-phase1/prepare-baselines.py',assets],{cwd:root,stdio:'pipe'});
 const fixture=require('./fixtures/v44-reference-edits.json');
 const bytes=cp.execFileSync('git',['show',fixture.baseCommit+':index.html'],{cwd:root,maxBuffer:8*1024*1024});
 if(hash(bytes)!==fixture.baseSHA256)throw Error('Reference base mismatch');
 const lines=bytes.toString().match(/.*(?:\n|$)/g).filter(Boolean);
 for(const c of [...fixture.changes].reverse()){
  if(hash(lines.slice(c.startLine,c.startLine+c.removeLines).join(''))!==c.removedSHA256)throw Error('Reference patch anchor mismatch');
  lines.splice(c.startLine,c.removeLines,...(c.referenceText.match(/.*(?:\n|$)/g)||[]).filter(Boolean));
 }
 const reference=Buffer.from(lines.join(''));if(hash(reference)!==fixture.referenceSHA256)throw Error('Original user v44 not reproduced');
 const dir=path.join(assets,'reference-v44');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),reference);
 return {assets,referenceSHA256:fixture.referenceSHA256};
}
module.exports={prepare,assets};if(require.main===module)console.log(prepare());
