const {launch,pageFor,startServer,suite,assert}=require('./helpers.cjs');
(async()=>{
 const s=suite('ui'),server=await startServer(),browser=await launch();
 try {
  const {page:p,context,errors}=await pageFor(browser,process.env.TARGET_URL||server.url);
  async function fixture(){await p.evaluate(()=>{
   for(const d of document.querySelectorAll('dialog[open]'))d.close();
   const a=catalog.character.find(r=>r.value==='Aether (Genshin Impact)'),f=catalog.character.find(r=>r.value==='Furina (Genshin Impact)');
   selected.character=[a.id,f.id];personKey=a.id;personGroup='basic';personPage=0;profiles={[a.id]:{},[f.id]:{detail:{upper:['donor sentinel']}}};window.uiOwner=a.id;window.uiDonor=f.id;renderProfiles();showMobileTab('people');clearTimeout(workingSaveTimer);
  })}
  async function clothing(){await p.locator('#personTabs button[data-group="clothing"]').first().click();await p.locator('#profiles [data-detail-field="upperCard"] > .personLaunch').first().click()}
  async function row(selector,count){const r=await p.locator(selector).evaluateAll(nodes=>nodes.filter(e=>e.getBoundingClientRect().height).map(e=>{const b=e.getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,text:e.innerText}}));assert.equal(r.length,count);assert(Math.max(...r.map(x=>x.y))-Math.min(...r.map(x=>x.y))<2,'row wrapped');assert(r.every(x=>x.w>=35&&x.h>=30),'unusable control');return r}
  await s.test('UI-cross-owner-candidate-select-switch-remove-and-shared-node',async()=>{
   await fixture();await clothing();
   await p.locator('#personQuickTabs [data-quick="favorite"]').click();await p.locator('#personChoiceSearch').fill('no match sentinel');
   await p.locator('#personCharacterCandidates').click();assert.equal(await p.locator('#personChoiceSearch').inputValue(),'');
   const choices=p.locator('#personChoiceChoices .modalOption').filter({hasText:'濃青の礼装上着＋白フリルシャツ'});assert.equal(await choices.count(),1);await choices.locator('input').click({noWaitAfter:true});
   assert(await p.evaluate(()=>profiles[uiOwner].detail.upper.includes('dark blue formal jacket, white ruffled shirt')));
   assert.deepEqual(await p.evaluate(()=>profiles[uiDonor].detail.upper),['donor sentinel']);
   for(const mode of ['selected','favorite','all']){await p.locator('#personQuickTabs [data-quick="'+mode+'"]').click();assert(await p.evaluate(()=>profiles[uiOwner].detail.upper.includes('dark blue formal jacket, white ruffled shirt')))}
   await p.evaluate(()=>$('personChoiceDialog').close());
   await p.evaluate(()=>openSimpleTarget('carry',uiOwner,simpleBasic.carry[0][1]));assert.equal(await p.locator('#personCharacterCandidates').count(),1);
   await p.locator('#personCharacterCandidates').click();assert(await p.locator('#personCharacterCandidates').isVisible());await p.evaluate(()=>simpleDialog.close());
   await p.evaluate(()=>openChoiceDialog('outfit'));assert.equal(await p.locator('#personCharacterCandidates').count(),1);await p.locator('#personCharacterCandidates').click();await p.evaluate(()=>$('choiceDialog').close());
   await clothing();assert(await p.locator('#personCharacterCandidates').isVisible());assert.equal(await p.locator('#personCharacterCandidates').count(),1);
   await row('#personQuickTabs > [data-quick],#personQuickTabs > #personCharacterCandidates',4);
   await p.evaluate(()=>{personQuickMode='selected';personCharacterCandidatesVisible=false;renderPersonChoiceDialog()});
   await p.locator('#personChoiceChoices .pickedRow').filter({hasText:'濃青の礼装上着＋白フリルシャツ'}).locator('.pickedRemove').click();
   assert(!(await p.evaluate(()=>profiles[uiOwner].detail.upper)).includes('dark blue formal jacket, white ruffled shirt'));
   await p.evaluate(()=>$('personChoiceDialog').close());
   return {otherOwnerSelectable:true,donorUnchanged:true,oneSharedToggle:true,selectionRetainedAcrossViews:true};
  });
  await s.test('UI-queued-close-keeps-shared-control-in-current-dialog',async()=>{
   await fixture();
   const settle=()=>p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const current=()=>p.evaluate(()=>({dialog:personCharacterButton.closest('dialog')?.id,visible:personCharacterButton.checkVisibility(),count:document.querySelectorAll('#personCharacterCandidates').length}));
   await p.evaluate(()=>{openSimpleTarget('carry',uiOwner);simpleDialog.close();openChoiceDialog('outfit')});await settle();
   const global=await current();assert.deepEqual(global,{dialog:'choiceDialog',visible:true,count:1});await p.locator('#personCharacterCandidates').click();assert(await p.evaluate(()=>personCharacterCandidatesVisible));
   await p.evaluate(()=>{$('choiceDialog').close();openSimpleTarget('carry',uiOwner)});await settle();
   const equipment=await current();assert.deepEqual(equipment,{dialog:'simpleSelectionDialog',visible:true,count:1});await p.locator('#personCharacterCandidates').click();assert(await p.evaluate(()=>personCharacterCandidatesVisible));
   await p.evaluate(()=>{simpleDialog.close();openSimpleTarget('carry',uiDonor)});await settle();
   const reopened=await current();assert.deepEqual(reopened,{dialog:'simpleSelectionDialog',visible:true,count:1});assert(await p.evaluate(()=>simpleActive.personId===uiDonor));
   await p.locator('#personCharacterCandidates').click();assert(await p.evaluate(()=>personCharacterCandidatesVisible));await p.evaluate(()=>simpleDialog.close());
   return {global,equipment,reopened,lateCloseIgnored:true};
  });
  await s.test('UI-hair-nine-modes-colors-and-eye-isolation',async()=>{
   await fixture();await p.locator('#personTabs button[data-group="colors"]').first().click();await p.locator('#profiles [data-color-kind="hair"] .colorCardLaunch').first().click();
   assert.deepEqual(await p.locator('#colorPaletteModes .paletteModeRow').evaluateAll(n=>n.map(x=>x.children.length)),[5,4]);
   await p.locator('[data-palette-mode="tips"]').click();
   const sample=await p.locator('#colorPaletteChoices button').allTextContents();assert(sample.length>5);
   const id=await p.evaluate(()=>{const a=catalog.hairColor.find(r=>r.value==='blue hair'),b=catalog.hairColor.find(r=>r.value==='pink hair');profiles[uiOwner].hairPrimary=a.id;profiles[uiOwner].hairSecondary=b.id;renderColorPalette();return [a.id,b.id]});
   for(const mode of ['ombre','split','tips'])await p.locator('[data-palette-mode="'+mode+'"]').click();
   assert.deepEqual(await p.evaluate(()=>[profiles[uiOwner].hairPrimary,profiles[uiOwner].hairSecondary]),id);
   await p.evaluate(()=>$('colorPaletteDialog').close());await p.locator('#profiles [data-color-kind="eye"] .colorCardLaunch').first().click();
   assert.equal(await p.locator('#colorPaletteModes .paletteModeRow').count(),0);await p.evaluate(()=>$('colorPaletteDialog').close());
   return {hairModes:9,rows:[5,4],bothColorsRetained:true,eyeLayoutIndependent:true};
  });
  await s.test('UI-lighting-three-tabs-and-five-effect-tabs',async()=>{
   await fixture();await p.evaluate(()=>openSimpleTarget('lighting'));
   const light=await row('#simpleClassificationTabs > button',3);await p.locator('#lightingColorOpen').click();await p.locator('[data-lighting-color="purple"]').click();
   const before=await p.evaluate(()=>hCanonical(selected.lighting));await p.locator('#simpleClassificationTabs > button').first().click();assert.equal(await p.evaluate(()=>hCanonical(selected.lighting)),before);
   await p.evaluate(()=>simpleDialog.close());await p.evaluate(()=>openSimpleTarget('effect',uiOwner));
   const effects=await row('#simpleClassificationTabs > button',5);await p.evaluate(()=>simpleDialog.close());return {light,effects};
  });
  await s.test('UI-pose-independent-actions-body-and-optional-target-kinds',async()=>{
   await fixture();await p.locator('#profiles [data-atomic-pose="true"] .personLaunch').first().click();
   await p.locator('[data-pose-add="hold-over"]').click();await p.locator('button[data-pose-tab="action"]').click();await p.locator('[data-pose-add="hold-over"]').click();await p.locator('button[data-pose-tab="target"]').click();
   await p.locator('[data-pose-field="movingPart"]').selectOption('left-hand');
   await p.locator('[data-pose-target-kind="body"]').click();
   await p.locator('[data-pose-field="target"]').selectOption({label:'自分の額'});
   const a=await p.evaluate(()=>profiles[uiOwner].poseActions);assert.equal(a.length,2);assert.notEqual(a[0].id,a[1].id);assert.equal(a[1].movingPart,'left-hand');assert.equal(a[1].target.id,'forehead');assert(!a[0].target);
   await p.locator('button[data-pose-tab="action"]').click();await p.locator('[data-pose-add="sit"]').click();await p.locator('button[data-pose-tab="target"]').click();
   const kinds=await row('.paTargetKinds button',3);await p.evaluate(()=>$('personChoiceDialog').close());return {instances:2,independentIds:true,optionalTargetKinds:kinds};
  });
  await s.test('UI-skin-palette-select-card-remove-and-Undo',async()=>{
   await fixture();await p.locator('#profiles .skinCardLaunch').first().click();
   assert.equal(await p.locator('[data-skin-value]').count(),37);await p.locator('[data-skin-value="blue skin"]').click();
   assert.deepEqual(await p.evaluate(()=>asList(profiles[uiOwner].detail.skinColor)),['blue skin']);
   await p.locator('#personChoiceChoices .personSelectedRemove').click();assert.deepEqual(await p.evaluate(()=>asList(profiles[uiOwner].detail.skinColor)),[]);
   await p.evaluate(()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close();$('undoOpen').click()});assert.deepEqual(await p.evaluate(()=>asList(profiles[uiOwner].detail.skinColor)),['blue skin']);return {palette:37,selectionAndRemoval:true,Undo:true};
  });
  for(const size of [{width:320,height:640},{width:360,height:740},{width:393,height:800},{width:412,height:915},{width:844,height:390},{width:1280,height:900},{width:393,height:800,font:2},{width:393,height:400,font:1.5}]){
   await s.test('UI-layout-'+size.width+'x'+size.height+(size.font?'-font'+size.font*100+(size.height<500?'-keyboard-mock':''):''),async()=>{
    await p.setViewportSize(size);await fixture();await p.evaluate(f=>document.documentElement.style.fontSize=f?16*f+'px':'',size.font);await clothing();
    const quick=await row('#personQuickTabs > [data-quick],#personQuickTabs > #personCharacterCandidates',4);
    const metrics=await p.locator('#personChoiceDialog').evaluate(d=>{const r=d.getBoundingClientRect(),list=document.getElementById('personChoiceChoices');return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,viewport:[innerWidth,innerHeight],listHeight:list.clientHeight,overflow:document.documentElement.scrollWidth>innerWidth+1}});
    assert(metrics.left>=-1&&metrics.right<=size.width+1&&metrics.top>=-1&&metrics.bottom<=size.height+1);assert(!metrics.overflow);assert(metrics.listHeight>25);
    await p.locator('#personChoiceSearch').fill('上');await p.screenshot({path:s.out+'/picker-'+size.width+'x'+size.height+(size.font?'-font'+size.font:'')+'.png'});const option=p.locator('#personChoiceChoices .modalOption input').first();await option.click();assert((await p.evaluate(()=>profiles[uiOwner].detail.upper)).length>0);await p.locator('#personChoiceDialog').getByRole('button',{name:'閉じる',exact:true}).click();
    await p.locator('#personTabs button[data-group="colors"]').first().click();await p.locator('#profiles [data-color-kind="hair"] .colorCardLaunch').first().click();
    assert.deepEqual(await p.locator('#colorPaletteModes .paletteModeRow').evaluateAll(n=>n.map(x=>x.children.length)),[5,4]);await p.screenshot({path:s.out+'/hair-'+size.width+'x'+size.height+(size.font?'-font'+size.font:'')+'.png'});await p.evaluate(()=>$('colorPaletteDialog').close());
    return {quick,metrics,physicalDevice:false,keyboardMock:!!size.font};
   });
  }
  assert.deepEqual(errors,[]);await context.close();s.save({actualIME:false,physicalAndroid:false});
 } finally {await browser.close();await server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
