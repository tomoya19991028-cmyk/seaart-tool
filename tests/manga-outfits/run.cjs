const fs=require('fs'),path=require('path'),cp=require('child_process');
const {root,launch,pageFor,startServer,suite,assert,hash}=require('../v44-audit/helpers.cjs');
// Same-origin upgrade/downgrade uses synthetic browser data only; no user profile.
(async()=>{
 const s=suite('manga-outfits'),previous='41dfacff31e4fa2f8b456b4ef3d463677f0dfad6';
 const oldHTML=cp.execFileSync('git',['show',previous+':index.html'],{cwd:root,maxBuffer:12*1024*1024});
 const overrides={'index.html':oldHTML},server=await startServer({assetOverrides:overrides}),browser=await launch();let current;
 try{
  current=await pageFor(browser,server.url);const p=current.page,r=p.locator('#simpleMangaTool'),picker=r.locator('#picker');
  const snap=()=>p.evaluate(()=>$('simpleMangaTool').simpleManga.snapshot());
  const close=()=>p.evaluate(()=>{for(const d of $('simpleMangaTool').shadowRoot.querySelectorAll('dialog[open]'))d.close()});
  const open=async()=>{await p.locator('#menuOpen').click();await p.locator('#menuSimpleManga').click()};
  const reload=async()=>{await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);await open()};
  const wardrobe=async part=>{await close();await r.locator('[data-card-id="12"]').getByRole('button',{name:'衣装・部位を選ぶ',exact:true}).click();await r.locator('[data-wardrobe-part="'+part+'"]').click()};
  const option=name=>picker.locator('.option-card').filter({has:p.getByText(name,{exact:true})});
  const mainState=()=>p.evaluate(()=>{clearTimeout(workingSaveTimer);return hCanonical({working:captureWorking(),keys:Object.fromEntries(Object.values(actorFormStorageKeys).map(k=>[k,localStorage.getItem(k)]))})});
  const userState=()=>p.evaluate(()=>hCanonical({working:captureWorking(),favorites,promptHistory,personOptionEdits,namespace:actorFormStorageKeys}));
  let seed,oldSnapshot,mainBefore,mainUser,retained,furina;
  await s.test('old-release-saved-character-wardrobe-main-and-own-JSON-survive-upgrade',async()=>{
   seed=await p.evaluate(()=>{const character=catalog.character.find(x=>/Furina/.test(x.value));const outfit=catalog.outfit.find(x=>characterCandidateOwners('catalog:outfit',x.id)?.has(character.value));if(!character||!outfit)throw Error('Reviewed character fixture missing');originalCharacters=[{id:'original-manga-upgrade',name:'漫画更新の保存検証',type:'adult woman'}];profiles={'original-manga-upgrade':{hairPrimary:catalog.hairColor.find(x=>x.value==='blue hair').id,detail:{damage:['bruise']},futureProfileMetadata:{opaque:['retain','保持']}}};renderProfiles();$('extra').value='manga upgrade synthetic saved note';$('extra').dispatchEvent(new Event('input'));$('favoriteName').value='漫画更新前の保存';$('saveFavorite').click();$('generate').click();if(!persist())throw Error('Fixture save failed');clearTimeout(workingSaveTimer);return {character:character.name,outfit:{...outfit}}});
   await open();await r.locator('[data-card-id="7"] .cm-open-candidates').click();const d=r.locator('#managedCandidateDialog');await d.getByPlaceholder('日本語・英語で検索',{exact:true}).fill(seed.character);await d.locator('.cm-candidate > .option-card').first().click();await close();
   await wardrobe('outfit');await picker.locator('#pickerSearch').fill(seed.outfit.name);await option(seed.outfit.name).click();await close();
   oldSnapshot=await snap();mainBefore=await mainState();mainUser=await userState();assert(oldSnapshot.simple._wardrobe.outfit.some(x=>x.tag===seed.outfit.value));
   overrides['index.html']=fs.readFileSync(path.join(root,'index.html'));await reload();assert.deepEqual(await snap(),oldSnapshot);fs.writeFileSync(path.join(s.out,'main-before.json'),mainBefore);fs.writeFileSync(path.join(s.out,'main-after-upgrade.json'),await mainState());assert.equal(hash(await userState()),hash(mainUser),'saved user data changed across upgrade');mainBefore=await mainState();assert.equal(await p.locator('#extra').inputValue(),'manga upgrade synthetic saved note');
   await r.locator('#simpleData').click();const download=p.waitForEvent('download');await r.getByRole('button',{name:'JSONバックアップ',exact:true}).click();const file=path.join(s.out,'synthetic-upgraded-manga.json');await (await download).saveAs(file);assert.deepEqual(JSON.parse(fs.readFileSync(file)),{...oldSnapshot,simpleSaved:[]});await close();
   return {baseline:previous,oldWardrobeAndCharacterRetained:true,separateJSONRetained:true,mainUserDataRetained:true};
  });
  await s.test('all-eight-wardrobe-pickers-separate-generic-and-character-specific-candidates',async()=>{
   const parts=await p.evaluate(()=>{const fields={outfit:null,top:'upper',bottom:'lower',shoes:'feet',legwear:'legwear',head:'head',hands:'hands',accessory:'accessory'};return Object.entries(fields).map(([part,field])=>{const source=field?'detail:'+field:'catalog:outfit';const rows=field?personPickerOptions(source,detailOptions[field].options).map(([id,name])=>({id,name})):catalog.outfit;return {part,names:rows.filter(x=>!maIsHidden(source,x.id)&&characterCandidateOwners(source,x.id)).map(x=>x.name)}})});
   const evidence=[];
   for(const {part,names}of parts){await wardrobe(part);const button=picker.locator('.cm-list-character');assert.equal(await button.count(),names.length?1:0,part+' toggle availability');
    if(names.length){assert.equal(await button.getAttribute('aria-pressed'),'false');await picker.locator('#pickerSearch').fill(names[0]);const selected=await option(names[0]).count()?await option(names[0]).getAttribute('aria-pressed'):null;if(selected!=='true')assert.equal(await option(names[0]).count(),0,part+' unselected owned candidate hidden in generic list');await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');assert(await option(names[0]).count()>0,part+' owned candidate discoverable');await picker.locator('#pickerSearch').fill('');assert((await picker.locator('.option-card strong').allTextContents()).every(n=>names.includes(n)),part+' character list excludes generic rows');}
    evidence.push({part,ownedCandidates:names.length});}
   assert.equal(await mainState(),mainBefore);return {parts:evidence,mainBytesRetained:true};
  });
  await s.test('character-alias-search-selected-owner-priority-favorites-and-filter-transitions',async()=>{
   await wardrobe('outfit');await picker.locator('.cm-list-character').click();
   const first=await picker.locator('.option-card strong').first().innerText();assert.equal(first,seed.outfit.name,'selected character wardrobe is first');
   for(const query of [seed.character,'Furina']){await picker.locator('#pickerSearch').fill(query);assert(await option(seed.outfit.name).count()>0,'owner alias searchable '+query)}
   await option(seed.outfit.name).locator('.favorite-toggle').click();await picker.getByRole('button',{name:'★お気に入り',exact:true}).click();assert.equal(await picker.locator('.cm-list-character').getAttribute('aria-pressed'),'false');assert.equal(await picker.locator('.cm-list-favorite').getAttribute('aria-pressed'),'true');assert.equal(await option(seed.outfit.name).count(),1);
   await picker.getByRole('button',{name:'メンズ向け',exact:true}).click();assert.equal(await picker.locator('.cm-list-favorite').getAttribute('aria-pressed'),'false');await picker.getByRole('button',{name:'すべて',exact:true}).click();await picker.locator('#pickerSearch').fill(seed.outfit.name);assert.equal(await option(seed.outfit.name).getAttribute('aria-pressed'),'true','already selected owned rows stay visible in generic list');
   await picker.locator('#pickerSearch').fill('');await picker.locator('.cm-list-character').click();const sort=picker.locator('select:has(option[value="name"])');await sort.selectOption('name');const names=await picker.locator('.option-card strong').allTextContents();assert.equal(names[0],seed.outfit.name,'favorites retain priority with explicit sort');const rest=names.slice(1);assert.deepEqual(rest,[...rest].sort((a,b)=>a.localeCompare(b,'ja',{numeric:true})));
   assert.equal(await mainState(),mainBefore);return {JapaneseAndEnglishOwnerSearch:true,selectedOwnerFirst:true,favoriteAndAudienceSwitches:true,explicitSortRespected:true};
  });
  await s.test('multi-select-deduplication-weights-output-and-save-roundtrip-to-previous-release',async()=>{
   await wardrobe('head');await picker.locator('.cm-list-character').click();await picker.locator('#pickerSearch').fill('Furina');furina=await picker.locator('.option-card strong').first().innerText();await option(furina).click();assert(await picker.isVisible(),'part picker remains open');await option(furina).click();
   let state=await snap(),picks=state.simple._wardrobe.head;assert.equal(picks.filter(x=>x.label===furina).length,1,'no duplicate tag');const item=picks.find(x=>x.label===furina);await picker.getByLabel(furina+'の重み',{exact:true}).selectOption('1.3');assert.equal((await snap()).simple._wardrobe.head.find(x=>x.label===furina).weight,1.3);
   const positive=await p.evaluate(()=>$('simpleMangaTool').simpleManga.positive());assert(positive.includes(item.tag),'selected clothing emitted');assert(!/undefined|\[object Object\]/.test(positive));retained=await snap();await close();await reload();assert.deepEqual(await snap(),retained);assert.equal(hash(await userState()),hash(mainUser));mainBefore=await mainState();
   overrides['index.html']=oldHTML;await reload();assert.deepEqual(await snap(),retained,'previous release still reads saved wardrobe');assert.equal(await p.evaluate(()=>$('simpleMangaTool').simpleManga.positive()),positive);assert.equal(hash(await userState()),hash(mainUser));
   overrides['index.html']=fs.readFileSync(path.join(root,'index.html'));await reload();assert.deepEqual(await snap(),retained);assert.equal(hash(await userState()),hash(mainUser));mainBefore=await mainState();return {partMultiSelect:true,duplicateTagsPrevented:true,weightRetained:true,newOldNewRoundtrip:true,mainBytesRetained:true};
  });
  await s.test('shared-master-edits-and-hidden-candidates-reflect-live-without-resetting-saved-picks',async()=>{
   const edited=await p.evaluate(()=>{const source='detail:head',row=detailOptions.head.options.find(([id])=>characterCandidateOwners(source,id)?.has('Furina (Genshin Impact)'));if(!row)throw Error('Owned head fixture missing');const [id]=row;personOptionEdits[source+'|'+id]={...(personOptionEdits[source+'|'+id]||{}),name:'衣装検証・編集済み帽子',value:'synthetic edited top hat',group:'キャラクター検証'};return {source,id,name:'衣装検証・編集済み帽子',tag:'synthetic edited top hat'}});
   await wardrobe('head');await picker.locator('.cm-list-character').click();await picker.locator('#pickerSearch').fill(edited.name);assert.equal(await option(edited.name).count(),1,'current main candidate label visible');await option(edited.name).click();assert((await snap()).simple._wardrobe.head.some(x=>x.tag===edited.tag));const before=await snap();
   await p.evaluate(({source,id})=>mainMaintenance.hidden.push(maKey(source,id)),edited);await wardrobe('head');await picker.locator('#pickerSearch').fill(edited.name);assert.equal(await option(edited.name).count(),0);await picker.locator('.cm-list-character').click();assert.equal(await option(edited.name).count(),0,'hidden candidate omitted in both views');assert.deepEqual(await snap(),before,'hiding candidate does not erase old selection');
   return {liveMainLabelAndTag:true,hiddenRowsExcluded:true,savedSelectionsRetained:true};
  });
  assert.deepEqual(current.errors,[]);s.save({previousRelease:previous,previousHTMLSHA256:hash(oldHTML),pageErrors:current.errors,syntheticDataOnly:true});
 }finally{if(current)await current.context.close();await browser.close();await server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
