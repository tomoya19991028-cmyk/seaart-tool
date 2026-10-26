const fs=require('fs'),path=require('path');
const {launch,pageFor,startServer,suite,assert,hash}=require('../v44-audit/helpers.cjs');
(async()=>{
 const s=suite('weapon-actions'),server=await startServer(),browser=await launch();
 try{
 const {page,context,errors}=await pageFor(browser,server.url);
 async function fixture(weapons=['bow','sword']){
  await page.evaluate(weapons=>{
   for(const d of document.querySelectorAll('dialog[open]'))d.close();
   originalCharacters=[{id:'original-wa-owner',name:'同名',type:'person'},{id:'original-wa-target',name:'同名',type:'person'}];selected.character=[];
   profiles={'original-wa-owner':{detail:{weapon:weapons},detailCustom:{}},'original-wa-target':{}};
   creatures=normalizeCreatures([{id:'creature-wa-a',species:'wolf',name:'同種'},{id:'creature-wa-b',species:'wolf',name:'同種'}]);
   actorExtensions={version:4,byActor:{}};personKey='original-wa-owner';personGroup='equipment';personPage=0;renderProfiles();renderCreatures();showMobileTab('people');layoutPeople();clearTimeout(workingSaveTimer);
  },weapons);
 }
 const sel=(key)=>page.locator('#simpleSelectionList [data-pose-field="'+key+'"]');
 await s.test('WEAPONS-taxonomy-normal-custom-hidden-and-favorites',async()=>{
  await fixture();const r=await page.evaluate(()=>{
   openSimpleTarget('weapon','original-wa-owner');const all=simpleRows('weapon').filter(r=>r.field==='weapon'),counts={};for(const r of all)counts[waGroup(r.value)]=(counts[waGroup(r.value)]||0)+1;
   const before=JSON.stringify(detailOptions.weapon.options);personOptionEdits['detail:weapon|longsword']={name:'愛用の長剣',group:'独自分類',value:'custom long blade'};personOptionEdits['detail:weapon|scythe']={name:'愛用の鎌'};
   const target=candidateAddTarget('detail:weapon');mainMaintenance.hidden.push(maKey('detail:weapon','crossbow'));toggleUsageFavorite('person:武器','longsword');renderSimpleTarget();
   const result={counts,total:all.length,duplicate:new Set(all.map(r=>r.value)).size!==all.length,legacy:all.filter(r=>r.legacy).map(r=>r.value),name:simpleRows('weapon').find(r=>r.value==='scythe').name,edited:candidateDisplayRule('detail:weapon','longsword','長剣','剣・近接').group,hidden:!!simpleList.querySelector('[data-value=crossbow]'),favorite:usageFavorite('person:武器','longsword'),sameDefinitions:before===JSON.stringify(detailOptions.weapon.options)};
   mainMaintenance.hidden=mainMaintenance.hidden.filter(key=>key!==maKey('detail:weapon','crossbow'));delete personOptionEdits['detail:weapon|longsword'];delete personOptionEdits['detail:weapon|scythe'];return result;
  });assert.deepEqual(r.counts,{'剣・刀':12,'槍・長柄':5,'斧・打撃':4,'弓':4,'クロスボウ':1,'銃':3,'投擲':1,'魔法具':6,'その他':1});assert.equal(r.total,37);assert(!r.duplicate);assert.deepEqual(r.legacy,[]);assert.equal(r.name,'愛用の鎌');assert.equal(r.edited,'独自分類');assert(!r.hidden&&r.favorite&&r.sameDefinitions);return r;
 });
 await s.test('WEAPONS-family-specific-actions-and-appearance',async()=>{
  await fixture();const r=await page.evaluate(()=>{
   const p={detail:{weapon:Object.keys(waBuiltinFamilies)}};const phrases={};
   for(const value of p.detail.weapon)for(const d of waChoices(p,value,'use')){const a=waApplyPreset(p,value,d.id);const phrase=paPhrase(a,p);if(!phrase||!phrase.includes(personOutputValue('detail:weapon',value)))throw Error(value+'/'+d.id+' missing weapon: '+phrase);phrases[value+'/'+d.id]=phrase;waDrop(p,a.id)}
   const choices=value=>waChoices(p,value,'use').map(d=>d.id),carry=value=>waChoices(p,value,'carry').map(d=>d.id);
   const c={crossbow:choices('crossbow'),bow:choices('bow'),gun:choices('gun'),rifle:choices('rifle'),book:choices('spellbook'),orb:choices('magic orb'),dual:choices('dual swords'),glowing:choices('twin swords with glowing blades'),staff:choices('staff'),gunCarry:carry('gun'),bookCarry:carry('spellbook')};
   p.detail.weapon.push('custom relic');const generic=choices('custom relic');p.weaponFamilies={'custom relic':'bow'};const custom=choices('custom relic');const bad=waApplyPreset(p,'crossbow','bow-aim');
   const thrust=waApplyPreset(p,'spear','thrust');thrust.phase='retracted';thrust.movingPart='both-hands';thrust.direction='body-left';const retracted=paPhrase(thrust,p);const cup=waApplyPreset(p,'magic orb','orb-cup'),floating=waApplyPreset(p,'magic orb','orb-float',cup.id);const noHands=paPhrase(floating,p);
   const katana=waApplyPreset(p,'katana','draw-blade'),draw=paPhrase(katana,p);waApplyPreset(p,'katana','carry-drawn');
   return {c,generic,custom,bad,draw,retracted,noHands,drawn:paTags(p).find(s=>s.includes('drawn')),phrases};
  });assert(!r.c.crossbow.some(id=>id.startsWith('bow-')));assert.deepEqual(r.c.bow,['bow-nock','bow-draw','bow-aim','bow-release','bow-after']);assert(r.c.rifle.includes('rifle-shoulder')&&!r.c.gun.includes('rifle-shoulder'));assert.deepEqual(r.c.dual,r.c.glowing);assert(r.c.book.includes('book-page')&&!r.c.book.includes('staff-point'));assert(r.c.orb.includes('orb-float')&&!r.c.orb.includes('staff-point'));assert(!r.c.gunCarry.includes('carry-planted')&&!r.c.bookCarry.includes('carry-planted'));assert(r.generic.includes('generic-use')&&r.custom.includes('bow-aim'));assert.equal(r.bad,null);assert.match(r.draw,/drawing their katana/);assert.match(r.drawn,/katana drawn/);assert.match(r.retracted,/just after retracting.*both hands.*to their left/);assert(!r.noHands.includes('hands'));return {families:r.c,generatedPhrases:Object.keys(r.phrases).length,customFamily:true,appearancePreserved:true};
 });
 await s.test('WEAPONS-shared-instance-edit-and-one-step-Undo',async()=>{
  await fixture();await page.evaluate(()=>openSimpleTarget('weapon','original-wa-owner','装備・動作'));
  await sel('weaponOwner').selectOption('bow');await sel('usePreset').selectOption('bow-aim');await sel('weaponAim').selectOption(JSON.stringify(['character','','original-wa-target']));
  const a=await page.evaluate(()=>profiles['original-wa-owner'].poseActions[0]);assert.equal(a.target.part,'bowstring');assert.equal(a.aim.id,'original-wa-target');
  await sel('weaponOwner').selectOption('sword');await sel('carryPreset').selectOption('carry-back');
  await page.evaluate(()=>{const p=profiles['original-wa-owner'];p.poseActions.push({id:'existing-thrust',action:'thrust',use:{kind:'equipment',field:'weapon',id:'bow'},target:{kind:'creature',id:'creature-wa-b'}});});
  await sel('weaponOwner').selectOption('bow');await page.getByRole('button',{name:'ポーズでこの動作を編集',exact:true}).click();
  assert(await page.evaluate(id=>paSession.active===id,a.id));await page.locator('#personChoiceChoices [data-pose-field=weaponDirection]').selectOption('up');
  let r=await page.evaluate(()=>({a:profiles['original-wa-owner'].poseActions,tags:paTags(profiles['original-wa-owner']),chips:document.querySelector('[data-detail-field=weaponCard]>.summaryChips').textContent}));assert.equal(r.a.length,3);assert.equal(r.a[0].id,a.id);assert.equal(r.a[0].direction,'up');assert.equal(r.a[2].id,'existing-thrust');assert(r.tags.some(t=>t.includes('string')&&t.includes('Character B')&&t.includes('upward')));assert(r.tags.some(t=>t.includes('sword on their back')));assert(r.chips.includes('弓：引き絞って狙う'));
  await page.evaluate(()=>{$('personChoiceDialog').close();$('undoOpen').click()});
  const undo=await page.evaluate(()=>profiles['original-wa-owner'].poseActions);assert.equal(undo.length,3);assert.equal(undo[0].id,a.id);assert(!undo[0].direction);assert.equal(undo[2].id,'existing-thrust');return {sameID:a.id,independentActions:3,oneUndo:true};
 });
 await s.test('WEAPONS-conflict-cancel-resolve-and-Undo',async()=>{
  await fixture(['rifle']);await page.evaluate(()=>openSimpleTarget('weapon','original-wa-owner','装備・動作'));
  await sel('carryPreset').selectOption('carry-back');const before=await page.evaluate(()=>hCanonical(profiles['original-wa-owner']));
  await sel('usePreset').selectOption('gun-fire');assert(await page.locator('[data-weapon-conflict]').isVisible());assert.equal(await page.evaluate(()=>hCanonical(profiles['original-wa-owner'])),before);
  await page.getByRole('button',{name:'取消',exact:true}).click();assert.equal(await page.evaluate(()=>hCanonical(profiles['original-wa-owner'])),before);
  await sel('usePreset').selectOption('gun-fire');await page.getByRole('button',{name:'競合する携帯状態を「構える」に変更して適用'}).click();
  const r=await page.evaluate(()=>({actions:profiles['original-wa-owner'].poseActions,conflicts:waConflicts(profiles['original-wa-owner'])}));assert.deepEqual(r.actions.map(a=>a.weaponAction),['carry-ready','gun-fire']);assert.deepEqual(r.conflicts,[]);
  await page.evaluate(()=>{simpleDialog.close();$('undoOpen').click()});assert.equal(await page.evaluate(()=>hCanonical(profiles['original-wa-owner'])),before);return {cancelUnchanged:true,explicitResolution:true,singleUndo:true};
 });
 await s.test('WEAPONS-absent-targets-panels-and-dangling-weapon',async()=>{
  await fixture();const r=await page.evaluate(()=>{
   const p=profiles['original-wa-owner'],a=waApplyPreset(p,'bow','bow-aim');a.aim={kind:'creature',id:'creature-wa-b'};const owner=subjectActor(p),panel={people:{'original-wa-owner':{actionTarget:{kind:'character',id:'original-wa-target'},pose:'standing'}},creatures:{'creature-wa-b':{enabled:false}}};
   const ordinary=paPhrase(a,p),absent=paPhrase(a,p,{panel:{people:{},creatures:{'creature-wa-b':{enabled:false}}}}),effective=paEffective(a,p,{owner,panel}),scoped=subjectActionTags(owner,{panel});
   a.aim={kind:'character',id:'original-wa-owner'};const self=paPhrase(a,p);a.aim={kind:'creature',id:'deleted'};const deleted=paPhrase(a,p);
   p.detail.weapon=['sword'];const missing=paPhrase(a,p);openSimpleTarget('weapon','original-wa-owner','装備・動作');
   return {ordinary,absent,effective,scoped,self,deleted,missing,ref:a.use,notice:simpleList.textContent};
  });assert.match(r.ordinary,/Creature B/);assert(!r.absent.includes('Creature B')&&r.absent.includes('string'));assert.equal(r.effective.target.part,'bowstring');assert.equal(r.effective.aim.id,'original-wa-target');assert(r.scoped.some(t=>t.includes('string')&&t.includes('Character B')));assert(!r.self.includes('toward Character A')&&!r.deleted.includes('toward'));assert.equal(r.missing,'');assert.equal(r.ref.id,'bow');assert.match(r.notice,/対象武器不在/);return r;
 });
 await s.test('WEAPONS-legacy-states-and-migration-metadata',async()=>{
  await fixture(['sword','bow']);const before=await page.evaluate(()=>{
   const p=profiles['original-wa-owner'];p.detail.weaponState=['weapon on back'];p.itemWeights={weaponState:{'weapon on back':1.35}};p.itemColors={weaponState:{'weapon on back':{primary:'blue'}}};
   p.pose=['pose-85'];paMigrate(p);const once=hCanonical(p);paMigrate(p);openSimpleTarget('weapon','original-wa-owner','装備・動作');return {once,twice:hCanonical(p),autoAssigned:paRows(p).some(a=>a.weaponAction),legacy:p.detail.weaponState};
  });assert.equal(before.once,before.twice);assert(!before.autoAssigned);assert.deepEqual(before.legacy,['weapon on back']);await sel('weaponOwner').selectOption('sword');await page.getByRole('button',{name:'この武器へ移す',exact:true}).click();
  const r=await page.evaluate(()=>({p:profiles['original-wa-owner'],tags:paTags(profiles['original-wa-owner'])}));assert.deepEqual(r.p.detail.weaponState,[]);const moved=r.p.poseActions.find(a=>a.weaponAction==='carry-back');assert.equal(moved.use.id,'sword');assert.equal(moved.weight,1.35);assert.equal(moved.color,'blue');assert.equal(r.tags.filter(t=>t.includes('sword on their back')).length,1);await page.evaluate(()=>{profiles['original-wa-owner'].detail.weaponState=['holding a weapon'];personOptionEdits['detail:weaponState|holding a weapon']={value:'holding a treasured heirloom'};renderSimpleTarget()});assert(await page.getByRole('button',{name:'この武器へ移す',exact:true}).isDisabled());assert(await page.evaluate(()=>profiles['original-wa-owner'].detail.weaponState.includes('holding a weapon')));await page.evaluate(()=>{delete personOptionEdits['detail:weaponState|holding a weapon']});return {idempotent:true,movedWeight:moved.weight,color:moved.color,editedEnglishRetained:true};
 });
 await s.test('WEAPONS-save-reload-JSON-history-and-fingerprint',async()=>{
  await fixture();await page.evaluate(()=>{
   const p=profiles['original-wa-owner'],a=waApplyPreset(p,'bow','bow-aim');a.aim={kind:'creature',id:'creature-wa-b'};a.direction='body-left';a.weight=1.2;p.weaponFamilies={'custom relic':'staff'};waApplyPreset(p,'sword','carry-back');$('generate').click();persist();clearTimeout(workingSaveTimer);
  });const expected=await page.evaluate(()=>hCanonical(profiles)),output=await page.locator('#positive').inputValue();assert.match(output,/string of their bow/);assert.equal((output.match(/to full draw and aiming/g)||[]).length,1);
  await page.reload();await page.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(await page.evaluate(()=>hCanonical(profiles)),expected);assert.equal(await page.locator('#positive').inputValue(),output);
  await page.evaluate(()=>{$('favoriteName').value='武器fixture';$('saveFavorite').click();profiles['original-wa-owner'].poseActions=[];const f=favorites.find(f=>f.name==='武器fixture');$('favorites').value=f.id;$('favorites').dispatchEvent(new Event('change'));$('loadFavorite').click()});assert.equal(await page.evaluate(()=>hCanonical(profiles)),expected);
  const download=page.waitForEvent('download');await page.evaluate(()=>$('exportData').click());const file=path.join(s.out,'weapon-fixture.json');await (await download).saveAs(file);
  const other=await pageFor(browser,server.url);try{await other.page.setInputFiles('#backupFile',file);await other.page.waitForFunction(()=>!actorFormImportBusy&&$('backupFile').value==='');assert.equal(await other.page.evaluate(()=>hCanonical(profiles)),expected)}finally{await other.context.close()}
  const r=await page.evaluate(()=>{const before=resultFingerprint({positive:$('positive').value,negative:$('negative').value});profiles['original-wa-owner'].poseActions[0].direction='down';$('generate').click();return {before,after:resultFingerprint({positive:$('positive').value,negative:$('negative').value}),history:promptHistory.some(h=>h.state?.profiles?.['original-wa-owner']?.poseActions?.length||h.working?.profiles?.['original-wa-owner']?.poseActions?.length)}});assert.notEqual(r.before,r.after);
  await page.evaluate(()=>{profiles['original-wa-owner'].poseActions=[];renderHistory();historyDialog.showModal()});await page.locator('#historyList .historyEntry').first().getByRole('button',{name:'設定を復元',exact:true}).click();assert(await page.evaluate(()=>profiles['original-wa-owner'].poseActions.some(a=>a.weaponAction==='bow-aim')));return {roundTrip:true,singleOutput:true,fingerprintChanges:true};
 });
 await s.test('WEAPONS-Creature-transient-save-capture-and-remap',async()=>{
  await fixture();await page.evaluate(()=>{detailPresetCustom.weapon??=[];detailPresetCustom.weapon.push(['custom relic','独自の魔法具','独自分類']);refreshImportedOptions();const e=creatureAnthroEntry('creature:creature-wa-a');e.representation.mode='full';e.humanProfile.byMode.full.detail.weapon=['bow','custom relic'];actorExtensions.byActor['creature:creature-wa-a']=e;openCreatureHumanEditor('creature:creature-wa-a','full');creatureHumanEditorState.tab='equipment';renderCreatureHumanEditor()});
  await page.locator('#creatureHumanEditorGrid [data-editor-card=weaponCard]>.personLaunch').click();await page.locator('#unifiedHumanGroupDialog [role=tab]').filter({hasText:'装備・動作'}).click();
  await page.locator('#unifiedHumanGroupDialog [data-pose-field=weaponOwner]').selectOption('bow');await page.locator('#unifiedHumanGroupDialog [data-pose-field=usePreset]').selectOption('bow-aim');await page.locator('#unifiedHumanGroupDialog [data-pose-field=weaponAim]').selectOption(JSON.stringify(['character','','original-wa-target']));
  await page.locator('#unifiedHumanGroupDialog').getByRole('button',{name:'ポーズでこの動作を編集',exact:true}).click();await page.evaluate(()=>new Promise(requestAnimationFrame));await page.locator('#personChoiceChoices [data-pose-field=weaponDirection]').selectOption('up');assert.match(await page.locator('#creatureHumanEditorGrid [data-atomic-pose] .chips').innerText(),/上/);await page.evaluate(()=>$('personChoiceDialog').close());
  const r=await page.evaluate(()=>{const s=creatureHumanEditorState,p=s.byMode.full.record;p.weaponFamilies={'custom relic':'staff'};const a=creatureHumanRecordAppearance(p);validateAnthroAppearance(a);const back=anthroAppearanceRecord(a);$('unifiedHumanGroupDialog').close();saveCreatureHumanEditor();const saved=creatureHumanAppearance(creatures[0]);const clone=structuredClone(saved);remapSubjectReferences(clone,{'original-wa-target':'new-target'});return {a,back:back.poseActions,saved,remap:clone.poseActions[0].aim,person:profiles['original-wa-owner'].poseActions||[]}});
  assert.equal(r.a.poseActions[0].id,r.back[0].id);assert.equal(r.saved.poseActions[0].aim.id,'original-wa-target');assert.equal(r.saved.weaponFamilies['custom relic'],'staff');assert.equal(r.remap.id,'new-target');assert.deepEqual(r.person,[]);return {sameID:r.a.poseActions[0].id,creatureSaved:true,familyCaptured:true,remap:true};
 });
 await s.test('WEAPONS-invalid-optional-schema-and-no-retarget',async()=>{
  const r=await page.evaluate(()=>{const bad=[{weaponFamilies:[]},{weaponFamilies:{sword:'unknown'}},{poseActions:[{id:'x',action:'pull',aim:{kind:'equipment',field:'unknown',id:'bow'}}]},{poseActions:[{id:'x',action:'pull',weaponAction:44}]},{poseActions:[{id:'x',action:'pull',grip:'invented'}]}];return bad.map(p=>{try{validatePoseActionData(p);return false}catch{return true}})});assert(r.every(Boolean));const remap=await page.evaluate(()=>{const a=catalog.character.find(r=>r.value==='Aether (Genshin Impact)'),b=catalog.character.find(r=>r.value==='Furina (Genshin Impact)'),w=captureWorking();w.selected.character=[{...a,id:'weapon-old-a'},{...b,id:'weapon-old-b'}];w.originalCharacters=[];w.actorExtensions={version:4,byActor:{}};const p={detail:{weapon:['bow']}};const action=waApplyPreset(p,'bow','bow-aim');action.aim={kind:'character',id:'weapon-old-b'};w.profiles={'weapon-old-a':p,'weapon-old-b':{}};for(const panel of w.mangaState.panels)panel.people={};restoreWorking(w);return {expected:b.id,action:profiles[a.id].poseActions[0]}});assert.equal(remap.action.aim.id,remap.expected);assert.equal(remap.action.target.part,'bowstring');assert.equal(remap.action.use.id,'bow');return {invalidFormsRejected:r.length,fullRestoreRemap:true};
 });
 await s.test('WEAPONS-mobile-portrait-landscape-and-large-text',async()=>{
  const metrics=[];
  for(const size of [{width:320,height:640,font:1},{width:844,height:390,font:1},{width:393,height:800,font:2}]){
   await page.setViewportSize(size);await fixture(['bow']);await page.evaluate(font=>{document.documentElement.style.fontSize=16*font+'px';openSimpleTarget('weapon','original-wa-owner','装備・動作')},size.font);await sel('usePreset').selectOption('bow-aim');await sel('weaponAim').selectOption(JSON.stringify(['creature','','creature-wa-b']));
   const remove=page.locator('#simpleSelectionList [data-weapon-role=use]').getByRole('button',{name:'× この指定を解除',exact:true});await remove.scrollIntoViewIfNeeded();
   const r=await page.locator('#simpleSelectionDialog').evaluate(d=>{const rect=d.getBoundingClientRect(),list=document.getElementById('simpleSelectionList');return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:innerWidth,height:innerHeight,list:list.clientHeight,overflow:list.scrollWidth>list.clientWidth+1}});assert(r.left>=-1&&r.right<=r.width+1&&r.top>=-1&&r.bottom<=r.height+1);assert(r.list>40&&!r.overflow);await page.screenshot({path:path.join(s.out,'weapon-'+size.width+'x'+size.height+'-font'+size.font+'.png')});await remove.click();assert.equal(await page.evaluate(()=>profiles['original-wa-owner'].poseActions.length),0);metrics.push(r);
  }return {metrics,physicalAndroid:false};
 });
 assert.deepEqual(errors,[]);await context.close();s.save({syntheticDataOnly:true,SeaArtImageGeneration:false,AndroidDevice:false});
 }finally{await browser.close();await server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
