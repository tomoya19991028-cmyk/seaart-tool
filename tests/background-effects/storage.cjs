const fs=require('fs'),path=require('path');const{launch,pageFor,startServer,suite,assert,fixture,layers}=require('./helpers.cjs');
(async()=>{const s=suite('background-effects-storage'),server=await startServer(),browser=await launch();try{
 const{page:p,context,errors}=await pageFor(browser,server.url);await fixture(p);await layers(p,'balanced');
 await s.test('BG-save-favorite-history-JSON-restart-draft-fingerprint',async()=>{
  const expected=await p.evaluate(()=>{
   mangaState.count=6;renderManga();hEnsureManga();mangaState.panels.forEach((p,i)=>p.environmentOverrides={version:1,view:{mode:'custom',value:i%2?'landscape-only':'balanced'},effects:{mode:i%2?'off':'custom',value:{'screen-film-grain':{strength:'weak',grain:'fine'}}},background:{mode:'custom',value:bdCommonBackground()}});
   environmentDesign.effects['screen-lens-flare']={strength:'medium',scope:'background'};
   window.envExpected=hCanonical({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)});
   $('favoriteName').value='背景保存fixture';$('saveFavorite').click();$('generate').click();$('mangaGenerate').click();clearTimeout(workingSaveTimer);
   const draft=captureWorking();environmentDesign=undefined;mangaState.panels.forEach(p=>delete p.environmentOverrides);restoreWorking(draft);
   return envExpected;
  });
  assert.equal(await p.evaluate(()=>hCanonical({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)})),expected);
  await p.evaluate(()=>{environmentDesign=undefined;mangaState.panels.forEach(p=>delete p.environmentOverrides);const f=favorites.find(f=>f.name==='背景保存fixture');$('favorites').value=f.id;$('favorites').dispatchEvent(new Event('change'));$('loadFavorite').click()});
  assert.equal(await p.evaluate(()=>hCanonical({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)})),expected);
  await p.evaluate(()=>{environmentDesign=undefined;renderHistory();historyDialog.showModal()});await p.locator('#historyList .historyEntry').first().getByRole('button',{name:'設定を復元',exact:true}).click();
  assert.equal(await p.evaluate(()=>hCanonical({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)})),expected);
  const fingerprint=await p.evaluate(()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();generate();const before=resultFingerprint({positive:$('positive').value,negative:$('negative').value});bdSetEffect('screen-bloom',{strength:'strong'});generate();return{before,after:resultFingerprint({positive:$('positive').value,negative:$('negative').value})}});assert.notEqual(fingerprint.before,fingerprint.after);
  const wait=p.waitForEvent('download');await p.evaluate(()=>$('exportData').click());const file=path.join(s.out,'synthetic-background.json');await(await wait).saveAs(file);
  const other=await pageFor(browser,server.url);try{await other.page.setInputFiles('#backupFile',file);await other.page.waitForFunction(()=>!actorFormImportBusy&&$('backupFile').value==='');assert.deepEqual(await other.page.evaluate(()=>({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)})),await p.evaluate(()=>({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)})));await other.page.reload();await other.page.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(await other.page.evaluate(()=>environmentDesign.effects['screen-bloom'].strength),'strong')}finally{await other.context.close()}
  fs.unlinkSync(file);await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(await p.evaluate(()=>environmentDesign.effects['screen-bloom'].strength),'strong');return{favorite:true,history:true,JSON:true,restart:true,detachedDraft:true,fingerprint:true,panels:6};
 });
 await s.test('BG-full-six-panel-real-quota-seven-generations-and-journal-size',async()=>{
  const r=await p.evaluate(()=>{
   clearTimeout(workingSaveTimer);promptHistory=[];if(!persist())throw Error('prepare');clearTimeout(workingSaveTimer);
   const envSize=JSON.stringify(environmentDesign).length+JSON.stringify(mangaState.panels.map(p=>p.environmentOverrides)).length;
   const rawJournal={version:2,namespace:actorFormStorageNamespace,transactionId:'size',phase:'pending',previous:actorFormLastBundle,next:actorFormLastBundle};const size={environmentCharacters:envSize,rawJournalCharacters:JSON.stringify(rawJournal).length,compactJournalCharacters:afEncodeJournal(rawJournal).length};
   const filler='x'.repeat(65536);let filled=0,quota;try{for(;filled<128;filled++)localStorage.setItem('__bg_quota_'+filled,filler)}catch(e){quota=e.name}for(let i=0;i<12;i++)localStorage.removeItem('__bg_quota_'+--filled);
   const disk=hCanonical({...localStorage}),history=hCanonical(promptHistory),encode=afEncodeJournal;let legacy;
   try{afEncodeJournal=JSON.stringify;$('generate').click();clearTimeout(workingSaveTimer);legacy={error:afLastSaveError?.name,disk:disk===hCanonical({...localStorage}),history:history===hCanonical(promptHistory)}}finally{afEncodeJournal=encode}
   const passes=[];for(let i=0;i<7;i++){$('extra').value='environment quota generation '+i;$(i%2?'mangaGenerate':'generate').click();clearTimeout(workingSaveTimer);passes.push({saved:!afLastSaveError,history:promptHistory.length})}
   return{quota,legacy,passes,size,unrelated:Array.from({length:filled},(_,i)=>localStorage.getItem('__bg_quota_'+i)===filler).every(Boolean),expected:hCanonical({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)})};
  });assert.equal(r.quota,'QuotaExceededError');assert.equal(r.legacy.error,'QuotaExceededError');assert(r.legacy.disk&&r.legacy.history);assert(r.passes.every(x=>x.saved));assert.equal(r.passes.at(-1).history,7);assert(r.unrelated);assert(r.size.compactJournalCharacters<r.size.rawJournalCharacters/4);
  await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(await p.evaluate(()=>promptHistory.length),7);assert.equal(await p.evaluate(()=>hCanonical({e:environmentDesign,panels:mangaState.panels.map(p=>p.environmentOverrides)})),r.expected);return{...r,expected:undefined,reload:true};
 });assert.deepEqual(errors,[]);await context.close();s.save({syntheticOnly:true,realBrowserQuota:true});
}finally{await browser.close();await server.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
