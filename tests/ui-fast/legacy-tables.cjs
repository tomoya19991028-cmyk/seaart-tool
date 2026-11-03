// Keep immutable old test scenarios, while checking their old rows against the
// release's explicit additions. Actual rows are never replaced with fixture rows.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const projected=require('./expected-data.cjs');
const text=fs.readFileSync(path.join(__dirname,'../../src/current/ui-fast-scope-clothing.js'),'utf8');
const declaration=text.match(/^const clothingData=(.*);$/m);assert(declaration,'Clothing declaration');
const clothing=JSON.parse(declaration[1]);
function pair(before,after){
 const left=structuredClone(before),right=structuredClone(after);
 const counted=Object.hasOwn(before,'adapterCount');if(counted){assert.equal(before.adapterCount,before.adapters.length);assert.equal(after.adapterCount,after.adapters.length);}
 for(const key of Object.keys(left)){
  assert(Object.hasOwn(right,key),'missing table '+key);
  if(key==='catalog'){
   right[key]=Object.fromEntries(Object.entries(left[key]).map(([field,rows])=>[field,rows.map(old=>{const row=right[key][field]?.find(r=>r.id===old.id);assert(row,'missing catalog '+field+'/'+old.id);return row;})]));
  }else if(key==='characterBasicPresets'){
   right[key]=Object.fromEntries(Object.keys(left[key]).map(owner=>{assert(right[key][owner],'missing preset owner '+owner);return [owner,right[key][owner]];}));
   left[key]=projected.presets(left[key],clothing);
  }else if(key==='detailOptions'){
   right[key]=Object.fromEntries(Object.entries(left[key]).map(([field,config])=>{assert(right[key][field],'missing detail '+field);return [field,{...right[key][field],options:config.options.map(old=>{const row=right[key][field].options.find(r=>r[0]===old[0]);assert(row,'missing detail option '+field+'/'+old[0]);return row;})}];}));
   left[key]=Object.fromEntries(Object.entries(left[key]).map(([field,config])=>[field,{...config,options:config.options.map(row=>projected.detailRow(field,row,clothing))}]));
  }else if(['outfitSets','genders','creatureFeatureLabels'].includes(key)){
   right[key]=Object.fromEntries(Object.keys(left[key]).map(name=>{assert(Object.hasOwn(right[key],name),'missing '+key+'/'+name);return [name,right[key][name]];}));
  }else if(key==='adapterCount'&&counted){
   // Recompute the count after selecting the same old adapter IDs.
  }else if(key==='adapters'){
   right[key]=left[key].map(([id])=>{const row=right[key].find(r=>r[0]===id);assert(row,'missing adapter '+id);return row;});
   left[key]=left[key].map(([id,value])=>[id,value.uSpecific?{...value,uSpecific:projected.anatomy(value.uSpecific,clothing)}:value]);
  }
 }
 if(counted){left.adapterCount=left.adapters.length;right.adapterCount=right.adapters.length;}
 // Additional top-level table categories are a schema change, not an addition.
 assert.deepEqual(Object.keys(right).sort(),Object.keys(left).sort(),'table categories');
 assert.deepEqual(right,left,'old data plus explicitly declared clothing changes');
 return {before:left,after:right};
}
function equalTables(before,after){return pair(JSON.parse(before),JSON.parse(after));}
module.exports={pair,equalTables};
