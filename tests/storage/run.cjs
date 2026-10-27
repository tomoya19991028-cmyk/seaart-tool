const {launch,pageFor,startServer,suite,assert}=require('../v44-audit/helpers.cjs');
(async()=>{
 const s=suite('storage-quota'),server=await startServer(),browser=await launch();
 try{
  const {page,context,errors}=await pageFor(browser,server.url);
  await s.test('STORAGE-journal-codec-unicode-and-legacy-roundtrip',async()=>{
   const result=await page.evaluate(()=>{
    clearTimeout(workingSaveTimer);
    const journal={version:2,namespace:actorFormStorageNamespace,transactionId:'codec-next',phase:'pending',previous:actorFormLastBundle,next:actorFormLastBundle};
    const text=JSON.stringify(journal),packed=afEncodeJournal(journal);
    const unicode={text:('氷の槍 🐺🌈 e\u0301 \u0000 \ud800 " \\ '+String.fromCharCode(0x2028,0x2029)).repeat(1000)};
    return {same:JSON.stringify(afDecodeJournal(JSON.parse(packed)))===text,plainSame:JSON.stringify(afDecodeJournal(JSON.parse(text)))===text,unicode:JSON.stringify(afDecodeJournal(JSON.parse(afEncodeJournal(unicode))))===JSON.stringify(unicode),plainCharacters:text.length,packedCharacters:packed.length};
   });
   assert(result.same&&result.plainSame&&result.unicode);assert(result.packedCharacters<result.plainCharacters/4);return result;
  });
  await s.test('STORAGE-real-browser-quota-old-writer-fails-compact-repeated-generation-succeeds',async()=>{
   const result=await page.evaluate(()=>{
    clearTimeout(workingSaveTimer);$('extra').value='quota baseline';$('favoriteName').value='容量確認の保存設定';$('saveFavorite').click();
    if(!persist())throw Error('preparation failed');clearTimeout(workingSaveTimer);
    const filler='x'.repeat(64*1024);let filled=0,quota='';try{for(;filled<128;filled++)localStorage.setItem('__storage_quota_fill_'+filled,filler)}catch(error){quota=error.name}
    // Leave room for the compact journal and several generations, while the
    // former journal's duplicate catalog/settings exceed the real quota.
    for(let i=0;i<8;i++)localStorage.removeItem('__storage_quota_fill_'+(--filled));
    const before=hCanonical({...localStorage}),history=hCanonical(promptHistory),encoder=afEncodeJournal;
    let legacyFailure;
    try{afEncodeJournal=JSON.stringify;$('extra').value='legacy writer should fail';$('generate').click();clearTimeout(workingSaveTimer);legacyFailure={error:afLastSaveError?.name,diskPreserved:before===hCanonical({...localStorage}),historyPreserved:history===hCanonical(promptHistory),output:$('positive').value,status:$('status').textContent}}
    finally{afEncodeJournal=encoder}
    const successes=[];for(let i=0;i<7;i++){$('extra').value='compact generation '+i;$('generate').click();clearTimeout(workingSaveTimer);successes.push({saved:!afLastSaveError,status:$('status').textContent,history:promptHistory.length,output:$('positive').value.includes('compact generation '+i)})}
    const preserved=Array.from({length:filled},(_,i)=>localStorage.getItem('__storage_quota_fill_'+i)===filler).every(Boolean);
    return {quota,legacyFailure,successes,unrelatedKeysPreserved:preserved,favoritePreserved:favorites.some(f=>f.name==='容量確認の保存設定'),workingExtra:JSON.parse(actorFormLastBundle.working).working.extra};
   });
   assert.equal(result.quota,'QuotaExceededError');assert.equal(result.legacyFailure.error,'QuotaExceededError');assert(result.legacyFailure.diskPreserved&&result.legacyFailure.historyPreserved);assert(result.legacyFailure.output.trim());assert(result.legacyFailure.status.includes('履歴は未保存'));
   assert(result.successes.every(r=>r.saved&&r.output&&!r.status.includes('未保存')));assert.equal(result.successes.at(-1).history,7);assert(result.unrelatedKeysPreserved&&result.favoritePreserved);assert.equal(result.workingExtra,'compact generation 6');
   await page.reload();await page.waitForFunction(()=>appReady&&actorFormStorageReady);
   assert.deepEqual(await page.evaluate(()=>({history:promptHistory.length,extra:$('extra').value,favorite:favorites.some(f=>f.name==='容量確認の保存設定')})),{history:7,extra:'compact generation 6',favorite:true});
   return {...result,legacyFailure:{...result.legacyFailure,output:undefined},reloadPreserved:true};
  });
  assert.deepEqual(errors,[]);await context.close();
  const live=await pageFor(browser,server.url);
  let snapshots,baseline;
  await s.test('STORAGE-all-six-write-boundaries-captured-with-compact-journal',async()=>{
   const result=await live.page.evaluate(()=>{
    clearTimeout(workingSaveTimer);if(!persist())throw Error('preparation failed');const before=afCopy(actorFormLastBundle),set=Storage.prototype.setItem,snapshots=[];
    Storage.prototype.setItem=function(k,v){set.call(this,k,v);if(Object.values(actorFormStorageKeys).includes(k))snapshots.push({key:k,raw:{...localStorage}})};
    try{$('extra').value='new consistent generation';if(!persist())throw Error('capture save failed')}finally{Storage.prototype.setItem=set;clearTimeout(workingSaveTimer)}
    return {before,after:afCopy(actorFormLastBundle),keys:actorFormStorageKeys,snapshots};
   });
   baseline=result;snapshots=result.snapshots;assert.equal(snapshots.length,6);
   assert(snapshots.every(x=>JSON.parse(x.raw[result.keys.journal]).encoding==='seaart-journal-lz16-v1'));
   return {boundaries:snapshots.map(x=>Object.keys(result.keys).find(k=>result.keys[k]===x.key))};
  });
  await s.test('STORAGE-quota-at-each-write-rolls-back-and-retry-succeeds',async()=>{
   const results=[];
   for(const fault of ['journal','settings','working','history','marker','journal-refresh']){
    const r=await live.page.evaluate(fault=>{
     clearTimeout(workingSaveTimer);const before=hCanonical({...localStorage}),set=Storage.prototype.setItem;let injected=false,journals=0;
     Storage.prototype.setItem=function(k,v){if(k===actorFormStorageKeys.journal)journals++;if(!injected&&(fault==='journal-refresh'?k===actorFormStorageKeys.journal&&journals===2:k===actorFormStorageKeys[fault])){injected=true;throw new DOMException('isolated write failure','QuotaExceededError')}return set.call(this,k,v)};
     let refused;try{$('extra').value='fault '+fault;refused=!persist()}finally{Storage.prototype.setItem=set;clearTimeout(workingSaveTimer)}
     const unchanged=before===hCanonical({...localStorage}),ready=actorFormStorageReady&&!actorFormStartup.blocked,retry=persist();clearTimeout(workingSaveTimer);return {fault,injected,refused,unchanged,ready,retry};
    },fault);
    assert(r.injected&&r.refused&&r.unchanged&&r.ready&&r.retry);results.push(r);
   }return results;
  });
  async function boot(raw){
   const context=await browser.newContext({serviceWorkers:'block'});
   await context.addInitScript(raw=>{if(sessionStorage.seeded)return;for(const[k,v]of Object.entries(raw))localStorage.setItem(k,v);sessionStorage.seeded='1'},raw);
   const page=await context.newPage();await page.goto(server.url);await page.waitForFunction(()=>appReady);return {context,page};
  }
  await s.test('STORAGE-crash-recovery-compact-and-original-journals-all-boundaries',async()=>{
   const results=[];
   for(const encoding of ['compact','original'])for(const [step,snapshot]of snapshots.entries()){
    const raw={...snapshot.raw};if(encoding==='original')raw[baseline.keys.journal]=await live.page.evaluate(raw=>JSON.stringify(afDecodeJournal(JSON.parse(raw))),raw[baseline.keys.journal]);
    const {context,page}=await boot(raw);
    try{
     const state=await page.evaluate(()=>({ready:actorFormStorageReady,blocked:!!actorFormStartup.blocked,revision:actorFormStartup.working?.revision,grants:resultAccessPermissions.size,journal:localStorage.getItem(actorFormStorageKeys.journal)}));
     assert(state.ready&&!state.blocked);assert.equal(state.revision,(step>=4?baseline.after:baseline.before).marker.revision);assert.equal(state.grants,0);assert.equal(state.journal,null);results.push({encoding,step,recovered:step>=4?'next':'previous'});
    }finally{await context.close()}
   }return results;
  });
  await s.test('STORAGE-corrupt-and-unknown-compact-journal-never-deletes-data',async()=>{
   const results=[];
   for(const fault of ['checksum','truncated','characters','unknown']){
    const raw={...snapshots[0].raw},key=baseline.keys.journal,value=JSON.parse(raw[key]);
    if(fault==='checksum')value.checksum='invalid';if(fault==='truncated')value.payload=value.payload.slice(0,-50);if(fault==='characters')value.characters++;if(fault==='unknown')value.encoding='future-codec';raw[key]=JSON.stringify(value);
    const {context,page}=await boot(raw);
    try{const state=await page.evaluate(()=>({blocked:!!actorFormStartup.blocked,disk:{...localStorage}}));assert(state.blocked);assert.deepEqual(state.disk,raw);results.push({fault,blocked:true,savedBytesPreserved:true})}finally{await context.close()}
   }return results;
  });
  assert.deepEqual(live.errors,[]);await live.context.close();s.save({realBrowserQuota:true,userData:false});
 }finally{await browser.close();await server.close()}
})().catch(error=>{console.error(error.stack);process.exitCode=1});
