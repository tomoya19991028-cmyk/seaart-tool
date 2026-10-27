// The original fixture stops at a failed 256 KiB allocation. A compact journal
// can legitimately fit in that remaining space, so use 4 KiB blocks to exercise
// genuine exhaustion. Keep the original script and every assertion unchanged.
const Module=require('module');
const original=Module.prototype._compile;
Module.prototype._compile=function(source,file){
 if(file.endsWith('/tests/common-access-stage5-d1-quota.cjs')){
  const before="for(;count<100;count++)localStorage.setItem('__access_d1_quota_'+count,'x'.repeat(256*1024))";
  if(source.split(before).length!==2)throw Error('Original quota fixture anchor changed');
  source=source.replace(before,"for(;count<1600;count++)localStorage.setItem('__access_d1_quota_'+count,'x'.repeat(4*1024))");
 }
 return original.call(this,source,file);
};
