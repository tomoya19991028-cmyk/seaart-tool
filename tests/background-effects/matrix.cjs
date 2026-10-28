const fs=require('fs'),cp=require('child_process');
const{root,launch,pageFor,startServer,suite,assert,hash,fixture,layers}=require('./helpers.cjs');
const models=['standard','illustrious','anima','sdxl','noobai','pony','krea'],separations=['none','standard','strong'];
(async()=>{const s=suite('background-effects-matrix'),server=await startServer(),browser=await launch();try{
 const current=await pageFor(browser,server.url),p=current.page;
 const oldServer=await startServer({assetOverrides:{'index.html':cp.execFileSync('git',['show','177a057c512a7887b9bbc5273900080bb6148be3:index.html'],{cwd:root,maxBuffer:16*1024*1024})}}),old=await pageFor(browser,oldServer.url);
 async function oldMatrix(page){await fixture(page);return page.evaluate(()=>{selected.background=['background-23'];selected.weather=['weather-4'];selected.time=['time-4'];selected.lighting=['lighting-5'];selected.composition=['composition-21','composition-44'];$('colorStyle').value='vibrant colors';const out=[];for(const model of ['standard','illustrious','anima','sdxl','noobai','pony','krea'])for(const separation of ['none','standard','strong']){modelFamily=model;subjectSeparationMode=separation;generate();generateManga();clearTimeout(workingSaveTimer);out.push({model,separation,normal:$('positive').value,negative:$('negative').value,page:$('mangaPositive').value,pageNegative:$('mangaNegative').value,panels:[...document.querySelectorAll('#mangaIndividual textarea')].map(t=>t.value)})}return out})}
 try{const expected=await oldMatrix(old.page),actual=await oldMatrix(p);for(let i=0;i<expected.length;i++)for(const output of ['normal','negative','page','pageNegative','panels'])await s.test('LEGACY-'+expected[i].model+'-'+expected[i].separation+'-'+output,()=>{assert.deepEqual(actual[i][output],expected[i][output]);return{referenceCommit:'177a057c512a7887b9bbc5273900080bb6148be3',exactOutput:true}})}finally{await old.context.close();await oldServer.close()}
 const outputs=[];
 for(const kind of ['empty','person','creature','mixed']){
  await fixture(p,kind);await layers(p,kind==='empty'?'landscape':'balanced');
  const rows=await p.evaluate(kind=>{
   const out=[];for(const model of ['standard','illustrious','anima','sdxl','noobai','pony','krea'])for(const separation of ['none','standard','strong']){
    modelFamily=model;subjectSeparationMode=separation;
    // First panel inherits scenery-only; second explicitly uses people/scenery.
    environmentDesign.view='landscape-only';mangaState.panels[1].environmentOverrides={version:1,view:{mode:'custom',value:'balanced'}};
    generate();generateManga();const normal=$('positive').value,negative=$('negative').value,mixedPage=$('mangaPositive').value,mixedNegative=$('mangaNegative').value,mixedPanels=[...document.querySelectorAll('#mangaIndividual textarea')].map(t=>t.value);
    delete mangaState.panels[1].environmentOverrides;generateManga();const landscapePage=$('mangaPositive').value,landscapePanels=[...document.querySelectorAll('#mangaIndividual textarea')].map(t=>t.value);
    environmentDesign.view='balanced';generate();clearTimeout(workingSaveTimer);out.push({kind,model,separation,normal,negative,mixedPage,mixedNegative,mixedPanels,landscapePage,landscapePanels,restored:$('positive').value});
   }return out;
  },kind);outputs.push(...rows);
 }
 const actorLeak=/Environment hero|blue hair|\bwolf\b|\bbow\b|bowstring|detailed face|detailed eyes|own glowing magic|Character [A-Z]:|Creature [A-Z]:/;
 for(const r of outputs){const id=r.kind+'-'+r.model+'-'+r.separation;
  await s.test('DESIGN-'+id+'-normal',()=>{assert(r.normal.trim());assert(!actorLeak.test(r.normal));assert.match(r.normal,/flowers and grasses in the foreground/);assert.match(r.normal,/lake in the middle distance/);assert.match(r.normal,/snowy mountains in the distant background/);assert.match(r.normal,/moonlight/);assert.equal((r.normal.match(/subtle bloom/g)||[]).length,1);assert(!/bad anatomy|extra fingers|fused bodies/.test(r.negative));if(r.kind==='person'||r.kind==='mixed')assert(r.restored.includes('Environment hero')&&r.restored.includes('blue hair'));if(r.kind==='creature'||r.kind==='mixed')assert(r.restored.includes('wolf'));assert(!/undefined|\[object Object\]/.test(r.normal+r.negative));return{sha256:hash(r.normal),worldOnly:true,actorSettingsRecoverable:true}});
  await s.test('DESIGN-'+id+'-page',()=>{assert(!actorLeak.test(r.landscapePage));assert(r.landscapePage.includes('Panel 1')&&r.landscapePage.includes('Panel 2'));if(r.kind==='person'||r.kind==='mixed')assert(r.mixedPage.includes('Environment hero'));assert(!/fused bodies|bad anatomy|extra fingers/.test(r.mixedNegative));return{allLandscapeSHA256:hash(r.landscapePage),mixedSHA256:hash(r.mixedPage),pageCommonNegative:true}});
  await s.test('DESIGN-'+id+'-panel',()=>{assert.equal(r.mixedPanels.length,2);assert(r.mixedPanels[0].trim());assert(!actorLeak.test(r.mixedPanels[0]));if(r.kind==='person'||r.kind==='mixed')assert(r.mixedPanels[1].includes('Environment hero'));if(r.kind==='creature'||r.kind==='mixed')assert(r.mixedPanels[1].includes('wolf'));assert(r.landscapePanels.every(t=>!actorLeak.test(t)));assert(!r.mixedPanels.some(t=>/undefined|\[object Object\]/.test(t)));return{hashes:r.mixedPanels.map(hash),negativeFieldsAdded:false}});
 }
 assert.deepEqual(current.errors,[]);fs.writeFileSync(s.out+'/outputs.json',JSON.stringify(outputs,null,2));await current.context.close();s.save({legacyConfigurations:21,newConfigurations:84,outputKinds:3,realUserData:false,imageGeneration:false});
}finally{await browser.close();await server.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
