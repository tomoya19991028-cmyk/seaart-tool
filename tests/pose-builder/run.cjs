const fs=require('fs'),path=require('path'),cp=require('child_process');
const {root,launch,pageFor,startServer,suite,assert,hash}=require('../v44-audit/helpers.cjs');
const baseline='205d765bd33f4f70a51f9aa98b15fea7be52685d',owner='original-pose-ui';
async function seed(p){await p.evaluate(()=>{
 originalCharacters=[{id:'original-pose-ui',name:'女の子',type:'adult woman'},{id:'original-pose-other',name:'別の人物',type:'adult man'}];selected.character=[];
 profiles={'original-pose-ui':{detail:{weapon:['sword']},futureMetadata:{retain:'保持'}},'original-pose-other':{poseActionsVersion:1,poseActions:[{id:'other-pose',action:'stand'}],futureMetadata:{retain:'other'}}};
 actorExtensions={version:4,byActor:{}};restoreCreatures([]);personKey='original-pose-ui';personGroup='basic';personPage=0;showMobileTab('people');renderProfiles();clearTimeout(workingSaveTimer);
})}
const open=p=>p.evaluate(()=>$('profiles').querySelector('[data-picker-source="catalog:pose"]').pickerApi.open());
const actionTab=p=>p.locator('[data-pose-tab="action"]').click();
const field=(p,k)=>p.locator('#personChoiceChoices [data-pose-field="'+k+'"]');
const profile=p=>p.evaluate(()=>hCanonical(profiles['original-pose-ui']));
const disk=p=>p.evaluate(()=>hCanonical({working:captureWorking(),favorites,promptHistory,namespace:actorFormStorageKeys}));
(async()=>{
 const s=suite('pose-builder'),overrides={},server=await startServer({assetOverrides:overrides}),browser=await launch();
 async function fresh(name,fn,options={}){const c=await pageFor(browser,server.url,options);try{await seed(c.page);const result=await fn(c.page,c);assert.deepEqual(c.errors,[]);return result}catch(e){await c.page.screenshot({path:path.join(s.out,name+'-failure.png')}).catch(()=>{});throw e}finally{await c.context.close()}}
 try{
  await s.test('previous-release-multiple-postures-metadata-output-and-candidate-definitions-survive-upgrade',async()=>{
   overrides['index.html']=cp.execFileSync('git',['show',baseline+':index.html'],{cwd:root,maxBuffer:12*1024*1024});
   const c=await pageFor(browser,server.url);try{const p=c.page;await seed(p);await p.evaluate(()=>{
    const p=profiles['original-pose-ui'];p.poseActionsVersion=1;p.poseGroups=[{id:'legacy-group',weight:1.3,color:'blue',row:{id:'old-row',name:'以前の組み合わせ',value:'retained source'}}];
    p.poseActions=[{id:'old-standing',action:'stand',groupId:'legacy-group',futureAction:{keep:7}},{id:'old-sitting',action:'sit',target:{kind:'object',id:'chair'},weight:1.2},{id:'old-left',action:'touch',movingPart:'left-hand',target:{kind:'body',id:'hair'},groupId:'legacy-group'},{id:'old-right',action:'touch',movingPart:'right-hand',target:{kind:'body',id:'forehead'},weight:.8,color:'red'}];
    renderProfiles();$('extra').value='更新前のポーズ';$('generate').click();$('favoriteName').value='更新前のポーズ保存';$('saveFavorite').click();if(!persist())throw Error('old save failed');clearTimeout(workingSaveTimer);
   });await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);
   const before=await disk(p),output=await p.locator('#positive').inputValue(),control=await pageFor(browser,server.url,{storageState:await c.context.storageState()});let definitions;
   try{definitions=await control.page.evaluate(()=>hCanonical({catalog,detailBuiltin,outfitSets,poseDefinitions:[...paDefinitions],paParts,paBody}));assert.deepEqual(control.errors,[])}finally{await control.context.close()}
   overrides['index.html']=fs.readFileSync(path.join(root,'index.html'));await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);
   assert.equal(await disk(p),before);assert.equal(await p.locator('#positive').inputValue(),output);assert.equal(await p.evaluate(()=>hCanonical({catalog,detailBuiltin,outfitSets,poseDefinitions:[...paDefinitions],paParts,paBody})),definitions);
   await open(p);assert.equal(await p.locator('[data-pose-card]').count(),4);assert.match(await p.locator('[data-pose-base-section]').innerText(),/2件保持/);assert.equal(await disk(p),before,'opening editor never reduces saved poses');assert.deepEqual(c.errors,[]);
   return {baseline,oldToOldHydrationControl:true,multipleBasesAndIDsRetained:true,weightsColorsGroupsOpaqueData:true,outputFavoritesHistoryAndDefinitions:true};
   }finally{delete overrides['index.html'];await c.context.close()}
  });
  await s.test('base-selector-changes-one-record-retains-additional-actions-and-supports-one-step-undo',()=>fresh('base',async p=>{
   await open(p);await p.locator('[data-pose-base="lie"]').click();
   const id=await p.evaluate(()=>{const p=profiles['original-pose-ui'],a=p.poseActions[0];p.poseActionsVersion=1;p.poseGroups=[{id:'base-group',weight:1.25,color:'blue'}];Object.assign(a,{orientation:'supine',target:{kind:'object',id:'bed'},targetRelation:'beside',weight:1.4,color:'blue',groupId:'base-group',futureAction:{retain:'opaque'}});p.poseActions.push({id:'additional-left',action:'touch',movingPart:'left-hand',target:{kind:'body',id:'hair'}});paDraw();return a.id});
   const before=await profile(p),other=await p.evaluate(()=>hCanonical(profiles['original-pose-other']));
   await p.locator('[data-pose-base="sit"]').click();
   const result=await p.evaluate(()=>{const p=profiles['original-pose-ui'];return {actions:p.poseActions,groups:p.poseGroups,phrase:paPhrase(p.poseActions[0],p)}});
   assert.equal(result.actions.length,2);const a=result.actions[0];assert.equal(a.id,id);assert.equal(a.action,'sit');assert.equal(a.weight,1.4);assert.equal(a.color,'blue');assert.equal(a.groupId,'base-group');assert.deepEqual(a.futureAction,{retain:'opaque'});assert.deepEqual(a.target,{kind:'object',id:'bed'});assert.equal(a.targetRelation,'beside');assert(!a.orientation);assert.equal(result.actions[1].id,'additional-left');assert.match(result.phrase,/sitting beside.*bed/);assert.equal(await p.evaluate(()=>hCanonical(profiles['original-pose-other'])),other);
   await p.evaluate(()=>$('undoOpen').click());assert.equal(await profile(p),before);
   await p.waitForFunction(()=>!$('personChoiceDialog').open&&!paSession);await open(p);await p.locator('[data-pose-base="stand"]').click();
   const standing=await p.evaluate(()=>{const p=profiles['original-pose-ui'];return {a:p.poseActions[0],phrase:paPhrase(p.poseActions[0],p)}});assert.equal(standing.a.id,id);assert.equal(standing.a.targetRelation,'beside');assert.match(standing.phrase,/standing beside.*bed/);await p.evaluate(()=>$('undoOpen').click());assert.equal(await profile(p),before);
   return {sameID:id,oneBase:true,additionalActionsAndOtherOwnerRetained:true,sharedTargetSpatialRelationAndMetadata:true,oneUndo:true};
  }));
  await s.test('cards-edit-left-right-targets-duplicate-independently-remove-and-undo',()=>fresh('cards',async p=>{
   await open(p);await p.locator('[data-pose-add="touch"]').click();await field(p,'movingPart').selectOption('right-hand');await p.locator('[data-pose-target-kind="body"]').click();await field(p,'target').selectOption({label:'自分の髪'});
   const original=await p.evaluate(()=>profiles['original-pose-ui'].poseActions[0]);await actionTab(p);
   const card=p.locator('[data-pose-card="'+original.id+'"]');assert.match(await card.innerText(),/右手 → 自分の髪/);await card.locator('[data-pose-duplicate]').click();
   await field(p,'movingPart').selectOption('left-hand');await field(p,'target').selectOption({label:'自分の額'});
   const rows=await p.evaluate(()=>profiles['original-pose-ui'].poseActions);assert.equal(rows.length,2);assert.notEqual(rows[0].id,rows[1].id);assert.equal(rows[0].movingPart,'right-hand');assert.equal(rows[0].target.id,'hair');assert.equal(rows[1].movingPart,'left-hand');assert.equal(rows[1].target.id,'forehead');
   const before=await profile(p);await actionTab(p);await p.locator('[data-pose-remove="'+original.id+'"]').click();assert.equal(await p.evaluate(()=>profiles['original-pose-ui'].poseActions[0].id),rows[1].id);
   await p.evaluate(()=>$('undoOpen').click());assert.equal(await profile(p),before);return {independentIDs:true,leftRightAndTargetEditing:true,removeAndUndo:true};
  }));
  await s.test('explicit-base-duplication-is-kept-and-changing-one-never-deletes-another-saved-base',()=>fresh('multiple',async p=>{
   await open(p);await p.locator('[data-pose-base="stand"]').click();const first=await p.evaluate(()=>profiles['original-pose-ui'].poseActions[0]);await p.locator('[data-pose-duplicate="'+first.id+'"]').click();
   const duplicate=await p.evaluate(()=>profiles['original-pose-ui'].poseActions[1]);await actionTab(p);await p.locator('[data-pose-base="kneel"]').click();
   const actions=await p.evaluate(()=>profiles['original-pose-ui'].poseActions);assert.equal(actions.length,2);assert.deepEqual(actions[0],first);assert.equal(actions[1].id,duplicate.id);assert.equal(actions[1].action,'kneel');assert.equal(actions[1].movingPart,'knees');assert.match(await p.locator('[data-pose-base-section]').innerText(),/2件保持/);
   const before=await profile(p);await p.locator('[data-pose-base="stand"]').click();assert.equal(await profile(p),before,'selecting an existing base opens it without adding or replacing data');return {explicitDuplicatesSupported:true,activeRecordOnlyChanged:true,noAutoDeletion:true};
  }));
  await s.test('all-definitions-search-favorites-name-order-and-related-shortcuts-remain-available',()=>fresh('candidates',async p=>{
   await open(p);const related=p.locator('[data-pose-related]');assert(!(await related.evaluate(e=>e.open)));assert(!(await related.getByRole('button',{name:'武器',exact:true}).isVisible()));
   const expected=await p.evaluate(()=>[...paDefinitions.values()].filter(d=>!maIsHidden('catalog:pose','pose-v39-'+d.id)).map(d=>d.id).sort());assert.deepEqual((await p.locator('[data-pose-add]').evaluateAll(es=>es.map(e=>e.dataset.poseAdd))).sort(),expected);
   await related.locator('summary').click();assert.equal(await related.getByRole('button').count(),5);await p.getByRole('button',{name:'立つのお気に入り',exact:true}).click();assert(await p.locator('[data-pose-related]').evaluate(e=>e.open));
   await p.locator('#personQuickTabs [data-quick="favorite"]').click();assert.equal(await p.locator('[data-pose-base="stand"]').count(),1);await p.locator('#personQuickTabs [data-quick="all"]').click();
   await p.locator('#personChoiceSearch').fill('触れる');assert.equal(await p.locator('[data-pose-add="touch"]').count(),1);assert.equal(await p.locator('[data-pose-base]').count(),0);await p.locator('#personChoiceSearch').fill('');
   await p.evaluate(()=>{$('personChoiceSort').value='name';$('personChoiceSort').dispatchEvent(new Event('change'))});
   const actual=await p.locator('.paActionGrid:not([data-pose-base-grid]) [data-pose-add]').evaluateAll(es=>es.map(e=>e.dataset.poseAdd));const ordered=await p.evaluate(()=>[...paDefinitions.values()].filter(d=>!d.base&&!maIsHidden('catalog:pose','pose-v39-'+d.id)).sort((a,b)=>a.name.localeCompare(b.name,'ja')).map(d=>d.id));assert.deepEqual(actual,ordered);
   await p.locator('[data-pose-related]').getByRole('button',{name:'武器',exact:true}).click();assert(await p.locator('#simpleSelectionDialog').isVisible());return {definitions:expected.length,searchAndFavorites:true,nameSortRetained:true,relatedCollapsedByDefault:true,fiveShortcutsAndNativeWeaponNavigation:true};
  }));
  await s.test('pose-cards-generation-named-save-history-working-JSON-and-reload-retain-IDs-and-metadata',()=>fresh('save',async p=>{
   await open(p);await p.locator('[data-pose-base="sit"]').click();await p.locator('[data-pose-add="hold-over"]').click();await field(p,'movingPart').selectOption('left-hand');await p.locator('[data-pose-target-kind="body"]').click();await field(p,'target').selectOption({label:'自分の額'});
   await p.evaluate(()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();$('generate').click();$('favoriteName').value='新ポーズの保存';$('saveFavorite').click();if(!persist())throw Error('save failed');clearTimeout(workingSaveTimer)});
   const before=await profile(p),output=await p.locator('#positive').inputValue();assert.match(output,/sitting/);assert.match(output,/left hand/);await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(await profile(p),before);assert.equal(await p.locator('#positive').inputValue(),output);
   const result=await p.evaluate(()=>{const w=JSON.parse(JSON.stringify(captureWorking()));profiles['original-pose-ui'].poseActions=[];restoreWorking(w);return {profile:hCanonical(profiles['original-pose-ui']),favorite:favorites.some(f=>f.name==='新ポーズの保存'),history:promptHistory.length,version:profiles['original-pose-ui'].poseActionsVersion}});assert.equal(result.profile,before);assert(result.favorite&&result.history>0);
   await open(p);assert.equal(await p.locator('[data-pose-card]').count(),2);return {sameProfileAndIDs:true,outputRetained:true,namedSaveAndHistory:true,workingJSON:true};
  }));
  await s.test('pose-controls-fit-mobile-desktop-landscape-and-enlarged-text-with-reachable-close',async()=>{
   const evidence=[];for(const viewport of [{width:320,height:640},{width:393,height:800},{width:430,height:800},{width:844,height:390},{width:1024,height:900}])for(const large of [false,true]){
    await fresh('viewport-'+viewport.width+'-'+large,async p=>{
     await p.evaluate(()=>{profiles['original-pose-ui'].poseActionsVersion=1;profiles['original-pose-ui'].poseActions=[{id:'view-base',action:'sit'},{id:'view-touch',action:'touch',movingPart:'right-hand',target:{kind:'body',id:'hair'}}];renderProfiles()});await open(p);
     if(large)await p.locator('#personChoiceDialog').evaluate(d=>{for(const e of d.querySelectorAll('.paCardActions>button,.paActionGrid button,.paRelated>summary,#poseComposeTabs>button'))e.style.setProperty('font-size','18px','important')});
     const metrics=await p.locator('#personChoiceDialog').evaluate(d=>{const frame=d.getBoundingClientRect(),close=d.querySelector('[data-selection-close]').getBoundingClientRect();const controls=[...d.querySelectorAll('.paCardActions>button,.paActionGrid button,.paRelated>summary,#poseComposeTabs>button')].filter(e=>e.checkVisibility()).map(e=>{const r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return {name:e.textContent,left:r.left,right:r.right,width:r.width,height:r.height,fits:r.left>=Math.max(frame.left,p.left)-1&&r.right<=Math.min(frame.right,p.right)+1,textFits:e.scrollWidth<=e.clientWidth+2&&e.scrollHeight<=e.clientHeight+2}});return {left:frame.left,right:frame.right,clientWidth:d.clientWidth,scrollWidth:d.scrollWidth,close:{top:close.top,bottom:close.bottom,right:close.right},controls}});
     await p.screenshot({path:path.join(s.out,'pose-'+viewport.width+'x'+viewport.height+(large?'-large':'')+'.png')});assert(metrics.left>=-1&&metrics.right<=viewport.width+1);assert(metrics.scrollWidth<=metrics.clientWidth+2);assert(metrics.close.top>=0&&metrics.close.bottom<=viewport.height+1);assert(metrics.controls.every(c=>c.fits&&c.textFits&&c.width>=43),'controls fit '+JSON.stringify(metrics.controls.filter(c=>!c.fits||!c.textFits||c.width<43)));
     await p.locator('[data-pose-edit="view-touch"]').click();assert(await field(p,'movingPart').isVisible());await p.locator('#personChoiceClose').click();assert(!(await p.locator('#personChoiceDialog').isVisible()));evidence.push({viewport,largeText:large,controls:metrics.controls.length});
    },{viewport,isMobile:viewport.width<850,hasTouch:viewport.width<850});
   }return {cases:evidence,physicalDevice:false};
  });
  await s.test('creature-editor-base-change-is-staged-cancelable-and-saved-without-changing-main-people',()=>fresh('creature',async p=>{
   await p.evaluate(()=>{restoreCreatures([{id:'creature-pose-ui',species:'wolf'}]);renderCreatures();const e=creatureAnthroEntry('creature:creature-pose-ui');e.representation.mode='full';actorExtensions.byActor['creature:creature-pose-ui']=e;openCreatureHumanEditor('creature:creature-pose-ui','full')});
   const before=await p.evaluate(()=>({people:hCanonical(profiles),appearance:hCanonical(creatureHumanAppearance(creatures[0]))}));
   const edit=async()=>{await p.locator('#creatureHumanEditorGrid [data-atomic-pose] .personLaunch').click();await p.locator('[data-pose-base="sit"]').click();await p.locator('[data-pose-base="stand"]').click();assert.equal(await p.evaluate(()=>creatureHumanEditorState.byMode.full.record.poseActions.length),1);await p.locator('#personChoiceClose').click()};
   await edit();assert.equal(await p.evaluate(()=>hCanonical(creatureHumanAppearance(creatures[0]))),before.appearance);await p.evaluate(()=>requestCloseCreatureHumanEditor());await p.locator('#creatureHumanEditorConfirm').getByRole('button',{name:'変更を破棄',exact:true}).click();assert.equal(await p.evaluate(()=>hCanonical(creatureHumanAppearance(creatures[0]))),before.appearance);
   await p.evaluate(()=>openCreatureHumanEditor('creature:creature-pose-ui','full'));await edit();await p.evaluate(()=>saveCreatureHumanEditor());
   const saved=await p.evaluate(()=>({actions:creatureHumanAppearance(creatures[0]).poseActions,people:hCanonical(profiles)}));assert.equal(saved.actions.length,1);assert.equal(saved.actions[0].action,'stand');assert.equal(saved.people,before.people);return {draftNotAutoSaved:true,cancelDiscards:true,explicitSaveRetainsOneBase:true,mainPeopleUnchanged:true};
  }));
  s.save({baseline,syntheticDataOnly:true,storageFormatUnchanged:true});
 }finally{await browser.close();await server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
