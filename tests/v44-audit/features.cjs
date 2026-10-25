const cp=require('child_process'),{root,launch,pageFor,startServer,suite,assert}=require('./helpers.cjs');
(async()=>{const s=suite('features'),server=await startServer(),browser=await launch();try{
 const current=await pageFor(browser,process.env.TARGET_URL||server.url);
 await s.test('DATA-main-catalog-presets-and-forms-retained',async()=>{
  const oldServer=await startServer({assetOverrides:{'index.html':cp.execFileSync('git',['show','894d5fbfdfa65e68a50b77acdaa3e497ed31aeca:index.html'],{cwd:root,maxBuffer:16*1024*1024})}});
  const old=await pageFor(browser,oldServer.url);
  try{
   const collect=p=>p.evaluate(()=>({catalog,presets:characterBasicPresets,forms:personSpecificDefinitions,keys:actorFormStorageKeys}));
   const before=await collect(old.page),after=await collect(current.page);let rows=0;
   for(const [field,entries]of Object.entries(before.catalog))for(const entry of entries){assert.deepEqual(after.catalog[field].find(r=>r.id===entry.id),entry,'old definition changed: '+field+'/'+entry.id);rows++}
   assert.deepEqual(after.presets,before.presets);assert.deepEqual(after.forms,before.forms);assert.deepEqual(after.keys,before.keys);
   return {oldCatalogRows:rows,characters:after.catalog.character.length,basicPresetOwners:Object.keys(after.presets).length,specificForms:after.forms.forms.length,storageNamespacesUnchanged:true};
  }finally{await old.context.close();await oldServer.close()}
 });
 await s.test('DATA-reference-inventory-unique-and-discovered-compositions',async()=>{
  const r=await current.page.evaluate(()=>{
   originalCharacters=[{id:'original-feature-audit',name:'Inventory',type:'person'}];profiles={'original-feature-audit':{}};renderProfiles();const duplicateCatalogIds=[],badOwners=[];for(const [key,rows]of Object.entries(catalog)){const seen=new Set();for(const row of rows){if(seen.has(row.id))duplicateCatalogIds.push(key+':'+row.id);seen.add(row.id)}}
   for(const form of personSpecificDefinitions.forms)if(!catalog.character.some(r=>r.value===form.owner))badOwners.push(form.owner);
   return {duplicateCatalogIds,badOwners,relations:subjectRelationDefinitions.map(r=>({value:r[0],name:r[1],group:r[2],symmetric:r[4]})),compositions:sceneOptions('composition'),tg:catalog.character.filter(r=>r.group==='東京喰種').length,yugioh:catalog.character.filter(r=>/^遊戯王/.test(r.group)).length,persona:catalog.character.filter(r=>r.group==='ペルソナ').length,structures:Object.keys(hNormalActor('person:original-feature-audit').structure),models:Object.keys(modelPromptOrders),adultCards:pgAdultDefinitions().map(d=>({id:d[0],title:d[1]}))};
  });assert.deepEqual(r.duplicateCatalogIds,[]);assert.deepEqual(r.badOwners,[]);assert.equal(r.relations.length,28);assert.equal(new Set(r.relations.map(r=>r.value)).size,28);assert.equal(r.compositions.length,18);assert.equal(new Set(r.compositions.map(r=>r[0])).size,18);assert.equal(r.tg,21);assert.equal(r.yugioh,14);assert.equal(r.persona,10);assert.equal(r.structures.length,6);assert.equal(r.models.length,7);assert.equal(r.adultCards.length,8);return r;
 });
 await s.test('BOOT-all-primary-tabs-dialog-cleanup-and-no-external-runtime-dependencies',async()=>{
  const r=await current.page.evaluate(()=>{const buttons=[...document.querySelectorAll('[data-mobile-tab]')],tabs=[];for(const b of buttons){b.click();tabs.push({id:b.dataset.mobileTab,active:document.body.dataset.mobileTab===b.dataset.mobileTab,ariaCurrent:b.getAttribute('aria-current')})}return {tabs,externalScripts:[...document.scripts].filter(s=>s.src).map(s=>s.src),duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,all)=>all.indexOf(id)!==i)}});
  assert(r.tabs.length>=5);assert(r.tabs.every(t=>t.active),JSON.stringify(r.tabs));assert.deepEqual(r.externalScripts,[]);assert.deepEqual(r.duplicateIds,[]);return r;
 });
 await s.test('AUX-live-simple-manga-isolated-namespace-and-return',async()=>{
  const p=current.page,before=await p.evaluate(()=>hCanonical(captureWorking()));
  await p.locator('#menuOpen').click();await p.locator('#menuSimpleManga').click();
  const r=await p.evaluate(()=>{const host=$('simpleMangaTool'),root=host.shadowRoot;return {visible:!host.hidden,snapshot:host.simpleManga.snapshot(),positive:host.simpleManga.positive(),negative:host.simpleManga.negative(),hasOutput:!!root.getElementById('studioPositive'),separateKey:'seaart-studio-mobile-v2'}});
  assert(r.visible&&r.hasOutput);assert.equal(typeof r.positive,'string');assert.equal(typeof r.negative,'string');assert(r.snapshot&&typeof r.snapshot==='object');
  await p.locator('#simpleMangaTool #simpleMainBack').click();assert(await p.locator('#simpleMangaTool').isHidden());assert.equal(await p.evaluate(()=>hCanonical(captureWorking())),before);
  return {reachableFromMenu:true,shadowRoot:true,separateKey:r.separateKey,mainWorkingUnchanged:true};
 });
 assert.deepEqual(current.errors,[]);await current.context.close();s.save();
}finally{await browser.close();await server.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
