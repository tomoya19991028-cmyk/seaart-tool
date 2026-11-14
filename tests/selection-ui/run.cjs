const fs=require('fs'),path=require('path'),cp=require('child_process');
const {root,launch,pageFor,startServer,suite,assert,hash}=require('../v44-audit/helpers.cjs');
const mainIDs={background:'backgroundDesignDialog',catalog:'choiceDialog',person:'personChoiceDialog',creature:'creatureDialog',scene:'normalSceneDialog',relation:'sceneChoiceDialog',simple:'simpleSelectionDialog',color:'colorPaletteDialog',quality:'qualityDialog',horror:'horrorDialog'};
async function seed(p){await p.evaluate(()=>{originalCharacters=[{id:'original-selection-ui',name:'選択画面の検証',type:'adult woman'}];profiles={'original-selection-ui':{hairPrimary:catalog.hairColor.find(x=>x.value==='blue hair').id,detail:{weapon:['spear']},futureMetadata:{retain:'保持'}}};personKey='original-selection-ui';renderProfiles();restoreCreatures([{id:'creature-selection-ui',species:'wolf'}]);activeCreatureId='creature-selection-ui';renderCreatures()})}
async function openFamily(p,kind){await p.evaluate(kind=>{if(kind==='background')openChoiceDialog('background');else if(kind==='catalog')openChoiceDialog('outfit');else if(kind==='person')$('profiles').querySelector('[data-picker-source="catalog:expression"]').pickerApi.open();else if(kind==='creature')openCreaturePicker('type','species');else if(kind==='scene')openNormalScene();else if(kind==='relation')openSceneDialog('relation');else if(kind==='simple')openSimpleTarget('weapon','original-selection-ui');else if(kind==='color')openSharedColorPalette('hairColor');else if(kind==='quality')openDialog('qualityDialog');else if(kind==='horror'){hActorRef='person:original-selection-ui';hNormalBasicDialog(2)}},kind);return p.locator('#'+mainIDs[kind])}
async function closeAll(p){await p.evaluate(()=>{for(const d of $('simpleMangaTool')?.shadowRoot?.querySelectorAll('dialog[open]')||[])d.close();for(const d of document.querySelectorAll('dialog[open]'))d.close()});}
async function openManga(p){await p.locator('#menuOpen').click();await p.locator('#menuSimpleManga').click();return p.locator('#simpleMangaTool')}
async function mangaPicker(p,r,kind){await closeAll(p);if(kind==='managed'){await r.locator('[data-card-id="7"] .cm-open-candidates').click();return r.locator('#managedCandidateDialog')}await r.locator('[data-card-id="12"]').getByRole('button',{name:'衣装・部位を選ぶ',exact:true}).click();await r.locator('[data-wardrobe-part="outfit"]').click();return r.locator('#picker')}
const working=p=>p.evaluate(()=>hCanonical({working:captureWorking(),favorites,promptHistory,personOptionEdits,namespace:actorFormStorageKeys}));
const mainDisk=p=>p.evaluate(()=>{clearTimeout(workingSaveTimer);return hCanonical({working:captureWorking(),keys:Object.fromEntries(Object.values(actorFormStorageKeys).map(k=>[k,localStorage.getItem(k)]))})});
const filterButtons='.quickTabs>button,.candidateQuickTabs>button,.simpleTabs>button,.dialog-filters>button,.smu-filters>button,.smu-audience>button,.bdTabs>button,.bdQuick>button';
async function filterBounds(d){return d.evaluate((dialog,selector)=>{
 const frame=dialog.getBoundingClientRect();
 return [...dialog.querySelectorAll(selector)].filter(e=>e.checkVisibility()).map(e=>{
  const r=e.getBoundingClientRect(),parent=e.parentElement.getBoundingClientRect();
  return {name:e.textContent.trim(),left:r.left,right:r.right,width:r.width,height:r.height,font:getComputedStyle(e).fontSize,
   clipped:r.left<Math.max(frame.left,parent.left)-1||r.right>Math.min(frame.right,parent.right)+1,
   textOverflow:e.scrollWidth>e.clientWidth+2||e.scrollHeight>e.clientHeight+2};
 });
},filterButtons)}
async function enlargeFilterText(d){await d.evaluate((dialog,selector)=>{
 // Simulate 150% text on the actual filter controls; root rem changes do not enlarge fixed px labels.
 for(const button of dialog.querySelectorAll(selector))button.style.setProperty('font-size','18px','important');
},filterButtons)}
async function metrics(d){return d.evaluate(el=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}},head=el.querySelector('.selectionHead'),close=head?.querySelector('[data-selection-close]'),search=[...el.querySelectorAll('input[type=search],#pickerSearch')].find(e=>e.checkVisibility());return {sheet:el.classList.contains('selectionSheet'),rect:rect(el),clientWidth:el.clientWidth,scrollWidth:el.scrollWidth,header:head?rect(head):null,close:close?rect(close):null,search:search?{...rect(search),font:getComputedStyle(search).fontSize}:null,views:el.querySelectorAll('.selectionView:not([hidden])').length,styleCount:el.getRootNode().querySelectorAll('#selectionDialogUIStyle').length,nameLinked:!!el.getAttribute('aria-label')||!!el.getAttribute('aria-labelledby')&&el.getAttribute('aria-labelledby').split(/\s+/).every(id=>!!el.getRootNode().getElementById(id))}})}
(async()=>{
 const s=suite('selection-ui'),baseline='1a49c692938229e5b5502d143382efed75a7fbe7',oldHTML=cp.execFileSync('git',['show',baseline+':index.html'],{cwd:root,maxBuffer:12*1024*1024});
 const overrides={'index.html':oldHTML},server=await startServer({assetOverrides:overrides}),browser=await launch();let current;
 try{
  const filtered=process.env.TEST_IDS&&!process.env.TEST_IDS.split(',').includes('previous-release-user-data-output-and-candidate-definitions-survive-UI-only-update');if(filtered)overrides['index.html']=fs.readFileSync(path.join(root,'index.html'));
  current=await pageFor(browser,server.url);const p=current.page;if(filtered){await seed(p);await p.evaluate(()=>{$('generate').click();if(!persist())throw Error('fixture save failed');clearTimeout(workingSaveTimer)})}
  await s.test('previous-release-user-data-output-and-candidate-definitions-survive-UI-only-update',async()=>{
   await seed(p);await p.evaluate(()=>{$('extra').value='選択画面を統一する前の入力';$('favoriteName').value='統一前のお気に入り';$('saveFavorite').click();$('generate').click();if(!persist())throw Error('fixture save failed');clearTimeout(workingSaveTimer)});
   // Establish the existing release's hydrated state before comparing another reload.
   await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);
   const before=await working(p),output=await p.locator('#positive').inputValue();
   // Compare identical persisted input against an old-to-old reload control.
   // The existing character-alias normalization can change catalog ordering on reload.
   const control=await pageFor(browser,server.url,{storageState:await current.context.storageState()});let data;try{data=await control.page.evaluate(()=>hCanonical({catalog,detailBuiltin,outfitSets}));assert.deepEqual(control.errors,[])}finally{await control.context.close()}
   overrides['index.html']=fs.readFileSync(path.join(root,'index.html'));await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(hash(await working(p)),hash(before));assert.equal(hash(await p.evaluate(()=>hCanonical({catalog,detailBuiltin,outfitSets}))),hash(data));assert.equal(await p.locator('#positive').inputValue(),output);return {baseline,workingFavoritesHistoryAndOpaqueData:true,allCandidateDefinitionsRetained:true,oldOnlyReloadControl:true,generatedTextRetained:true};
  });
  await s.test('main-picker-families-share-header-search-close-and-native-open-close-behavior',async()=>{
   const before=await working(p),rows=[];for(const kind of Object.keys(mainIDs)){const d=await openFamily(p,kind);await d.locator('.selectionHead').waitFor();const m=await metrics(d);assert(m.sheet&&m.header&&m.close,kind+' common header');assert(m.nameLinked,kind+' accessible title');assert(m.close.width>=43&&m.close.height>=43,kind+' close target');assert.equal(m.styleCount,1);assert(m.views<=1);if(m.search){assert(m.search.height>=43,kind+' search height');assert.equal(m.search.font,'16px');}rows.push({kind,...m});await d.locator('[data-selection-close]').first().click();assert(!(await d.isVisible()),kind+' native close');}
   assert.equal(hash(await working(p)),hash(before),'opening/closing does not change user data');return {families:rows};
  });
  await s.test('list-card-switch-preserves-native-main-controls-selected-values-and-undo-history',async()=>{
   const d=await openFamily(p,'person');const query=await p.evaluate(()=>$('profiles').querySelector('[data-picker-source="catalog:expression"]').pickerApi.options[0][1]);await p.locator('#personChoiceSearch').fill(query);const choices=p.locator('#personChoiceChoices .modalOption input[type=checkbox]');assert(await choices.count()>0);const picked=await choices.first().getAttribute('value');await choices.first().click();assert(await p.evaluate(id=>asList(profiles['original-selection-ui'].expression).includes(id),picked));const before=await working(p),undo=await p.evaluate(()=>undoHistory.length);
   for(let i=0;i<5;i++){await d.getByRole('button',{name:'候補をカードで表示',exact:true}).click();assert(await d.evaluate(el=>el.classList.contains('selectionCardMode')));await d.getByRole('button',{name:'候補を一覧で表示',exact:true}).click();assert(await d.evaluate(el=>el.classList.contains('selectionListMode')))}assert.equal(hash(await working(p)),hash(before));assert.equal(await p.evaluate(()=>undoHistory.length),undo);assert(await p.evaluate(id=>asList(profiles['original-selection-ui'].expression).includes(id),picked));assert.equal(await d.locator('.selectionView').count(),1);await closeAll(p);return {realNativeSelection:true,tenViewChanges:true,selectionAndUndoRetained:true};
  });
  await s.test('real-keyboard-search-keeps-focus-caret-and-result-behavior-in-main-and-both-manga-pickers',async()=>{
   let d=await openFamily(p,'background');const search=p.locator('#bdSearch');await search.focus();await search.pressSequentially('beach',{delay:20});assert.equal(await search.inputValue(),'beach');assert(await search.evaluate(e=>e.getRootNode().activeElement===e&&e.selectionStart===5));assert(await p.locator('#bdBody .modalOption').count()>0);await closeAll(p);
   const r=await openManga(p);for(const kind of ['managed','legacy']){d=await mangaPicker(p,r,kind);const input=kind==='managed'?d.getByPlaceholder('日本語・英語で検索',{exact:true}):d.locator('#pickerSearch'),query=kind==='managed'?'Furina':'school swimsuit';await input.focus();await input.pressSequentially(query,{delay:20});assert.equal(await input.inputValue(),query);assert(await input.evaluate(e=>e.getRootNode().activeElement===e&&e.selectionStart===e.value.length),kind+' focus/caret');assert(await d.locator('.option-card').count()>0,kind+' search results');assert.equal(await d.locator('.selectionView').count(),1);}
   await closeAll(p);await r.locator('#simpleMainBack').click();return {mainKeyboard:true,mangaCharacterKeyboard:true,mangaWardrobeKeyboard:true};
  });
  await s.test('manga-view-switch-keeps-card-columns-favorites-generation-and-main-isolation',async()=>{
   await p.evaluate(()=>{if(!persist())throw Error('fixture save failed');clearTimeout(workingSaveTimer)});const beforeMain=await mainDisk(p),r=await openManga(p);let d=await mangaPicker(p,r,'managed');await d.getByPlaceholder('日本語・英語で検索',{exact:true}).fill('フリーナ');await d.locator('.cm-candidate > .option-card').first().click();await closeAll(p);
   d=await mangaPicker(p,r,'legacy');await d.locator('#pickerSearch').fill('スクール水着');await d.locator('.option-card').filter({has:p.getByText('スクール水着',{exact:true})}).click();d=await mangaPicker(p,r,'legacy');await d.locator('#pickerSearch').fill('スクール水着');await d.locator('.option-card').filter({has:p.getByText('スクール水着',{exact:true})}).locator('.favorite-toggle').click();const before=await p.evaluate(()=>$('simpleMangaTool').simpleManga.snapshot());
   for(const kind of ['managed','legacy']){d=await mangaPicker(p,r,kind);await d.getByRole('button',{name:'候補をカードで表示',exact:true}).click();const cardLayout=await d.locator('.choice-card-grid').evaluate(e=>({display:getComputedStyle(e).display,columns:getComputedStyle(e).gridTemplateColumns}));assert.equal(cardLayout.display,'grid');assert(cardLayout.columns.split(' ').length>=2,kind+' original two-column cards retained');await d.getByRole('button',{name:'候補を一覧で表示',exact:true}).click();assert.equal(await d.locator('.choice-card-grid').evaluate(e=>getComputedStyle(e).display),'block');}
   assert.deepEqual(await p.evaluate(()=>$('simpleMangaTool').simpleManga.snapshot()),before);assert.equal(hash(await mainDisk(p)),hash(beforeMain));const positive=await p.evaluate(()=>$('simpleMangaTool').simpleManga.positive());assert(positive.includes('Furina')&&positive.includes('school swimsuit'));await closeAll(p);await r.locator('#simpleMainBack').click();return {cardColumnsRetained:true,favoritesAndSelectionsRetained:true,mainBytesRetained:true,generation:true};
  });
  await s.test('person-outfit-six-filters-fit-and-remain-clickable-with-saved-selection-and-large-text',async()=>{
   const evidence=[];
   for(const width of [320,393,430])for(const largeText of [false,true]){
    const other=await pageFor(browser,server.url,{viewport:{width,height:800},isMobile:true,hasTouch:true});
    try{
     const q=other.page;await seed(q);
     await q.evaluate(()=>{profiles['original-selection-ui'].outfit=[catalog.outfit.find(x=>x.value==='school uniform').id];renderProfiles();$('profiles').querySelector('[data-picker-source="catalog:outfit"]').pickerApi.open()});
     const d=q.locator('#personChoiceDialog');await d.locator('.selectionHead').waitFor();
     if(largeText)await enlargeFilterText(d);
     const before=await q.evaluate(()=>hCanonical(profiles['original-selection-ui']));
     const rows=await filterBounds(d);assert.equal(rows.length,6,'all six outfit filters are visible');
     assert(rows.every(x=>!x.clipped&&!x.textOverflow&&x.width>=43&&x.height>=39),'all filter buttons and labels fit '+JSON.stringify(rows));
     if(largeText)assert(rows.every(x=>x.font==='18px'),'actual filter text is enlarged');
     assert.equal(await d.locator('.pickedRow').count(),1,'selected outfit summary retained');
     const picked=await d.locator('.pickedRow').evaluate(e=>{const r=e.getBoundingClientRect(),d=e.closest('dialog').getBoundingClientRect();return {left:r.left,right:r.right,fits:r.left>=d.left&&r.right<=d.right}});assert(picked.fits);
     await q.screenshot({path:path.join(s.out,'outfit-filters-'+width+(largeText?'-large':'')+'.png')});
     for(const selector of ['[data-quick="selected"]','[data-quick="favorite"]','#personCharacterCandidates','[data-quick="all"]','[data-tendency="female"]','[data-tendency="male"]']){
      const button=d.locator('#personQuickTabs '+selector);const box=await button.boundingBox();
      await button.tap({position:{x:box.width-4,y:box.height/2}});
      assert.equal(await button.getAttribute('aria-pressed'),'true','right edge activates '+selector);
      assert((await filterBounds(d)).every(x=>!x.clipped&&!x.textOverflow),'redraw keeps filters inside frame');
     }
     assert.equal(await q.evaluate(()=>hCanonical(profiles['original-selection-ui'])),before,'filter operations preserve chosen outfit and metadata');
     assert.deepEqual(other.errors,[]);evidence.push({width,largeText,buttons:rows,selectedRow:picked,rightEdgeTouch:true,selectionRetained:true});
    }finally{await other.context.close()}
   }
   return {cases:evidence,physicalAndroid:false};
  });
  await s.test('main-and-both-manga-picker-filter-buttons-fit-at-narrow-width-and-large-text',async()=>{
   const evidence=[];
   for(const largeText of [false,true]){
    const other=await pageFor(browser,server.url,{viewport:{width:320,height:800},isMobile:true,hasTouch:true});
    try{
     const q=other.page;await seed(q);
     for(const kind of ['background','catalog','person','creature','scene','relation','simple']){
      const d=await openFamily(q,kind);await d.locator('.selectionHead').waitFor();if(largeText)await enlargeFilterText(d);
      const buttons=await filterBounds(d);assert(buttons.every(x=>!x.clipped&&!x.textOverflow),kind+' filters fit '+JSON.stringify(buttons));
      evidence.push({kind,largeText,buttons});await closeAll(q);
     }
     const r=await openManga(q);for(const kind of ['managed','legacy']){
      const d=await mangaPicker(q,r,kind);await d.locator('.selectionHead').waitFor();if(largeText)await enlargeFilterText(d);
      const buttons=await filterBounds(d);assert(buttons.length>0,kind+' filter controls covered');assert(buttons.every(x=>!x.clipped&&!x.textOverflow),kind+' manga filters fit '+JSON.stringify(buttons));
      await q.screenshot({path:path.join(s.out,'filter-'+kind+(largeText?'-large':'')+'.png')});evidence.push({kind,largeText,buttons});await closeAll(q);
     }
     assert.deepEqual(other.errors,[]);
    }finally{await other.context.close()}
   }
   return {cases:evidence,actualControlFontScaling:true};
  });
  await s.test('mobile-desktop-and-landscape-pickers-have-reachable-close-and-no-horizontal-overflow',async()=>{
   const evidence=[];for(const viewport of [{width:320,height:640},{width:393,height:800},{width:1024,height:900},{width:844,height:390}]){const other=await pageFor(browser,server.url,{viewport});try{const q=other.page;await seed(q);for(const kind of ['background','catalog','person','creature','scene','color','quality','horror']){const d=await openFamily(q,kind);await d.locator('.selectionHead').waitFor();const m=await metrics(d);if(viewport.width===393&&kind==='catalog')await q.screenshot({path:path.join(s.out,'main-393x800.png')});assert(m.rect.x>=-1&&m.rect.right<=viewport.width+1,kind+' fits '+viewport.width);assert(m.scrollWidth<=m.clientWidth+2,kind+' no horizontal overflow '+viewport.width);assert(m.close.width>=43&&m.close.height>=43);assert(m.close.x>=m.rect.x&&m.close.right<=m.rect.right+1,kind+' close reachable');assert(m.close.y>=0&&m.close.bottom<=viewport.height+1,kind+' close on screen');await closeAll(q)}const rr=await openManga(q);for(const kind of ['managed','legacy']){const d=await mangaPicker(q,rr,kind);await d.locator('.selectionHead').waitFor();const m=await metrics(d);fs.writeFileSync(path.join(s.out,kind+'-'+viewport.width+'x'+viewport.height+'.json'),JSON.stringify(m,null,2));await q.screenshot({path:path.join(s.out,kind+'-'+viewport.width+'x'+viewport.height+'.png')});assert(m.scrollWidth<=m.clientWidth+2,kind+' manga width '+viewport.width+' '+JSON.stringify(m));assert(m.close.right<=viewport.width+1&&m.close.bottom<=viewport.height+1,kind+' manga close reachable');if(viewport.height>500){const h=await d.locator('.choice-card-grid').evaluate(e=>e.clientHeight);assert(h>=60,kind+' candidates remain visible');}await q.screenshot({path:path.join(s.out,kind+'-'+viewport.width+'x'+viewport.height+'.png')});await closeAll(q)}assert.deepEqual(other.errors,[]);evidence.push({viewport,families:10});}finally{await other.context.close()}}return {viewports:evidence,physicalDevice:false};
  });
  await s.test('landscape-horror-features-scroll-only-the-body-and-remember-position',async()=>{
   const evidence=[];
   for(const viewport of [{width:640,height:360},{width:800,height:393},{width:800,height:430}]){
    const other=await pageFor(browser,server.url,{viewport,isMobile:true,hasTouch:true});
    try{
     const q=other.page;await seed(q);
     await q.evaluate(()=>{
      hActorRef='person:original-selection-ui';
      hSetActor(hActorRef,{state:'partial',primaryTypeId:'horror-type-beast',autoFeatures:{version:1,enabled:true,excludedIds:[]}});
      showMobileTab('horror');hPage=1;hRender();
     });
     await q.locator('[data-horror-card="6"]').tap();
     const body=q.locator('#horrorDialogBody'),close=q.locator('#horrorDialogClose');
     const before=await close.boundingBox();
     await body.getByLabel('候補を検索',{exact:true}).fill('寄生体');
     assert.equal(await body.locator('.hFeatureQuick:visible').count(),1);
     await body.getByLabel('候補を検索',{exact:true}).fill('');
     await body.evaluate(e=>{e.scrollTop=140});
     const m=await q.evaluate(()=>{const d=hDialog,b=$('horrorDialogBody');return {
      dialogScroll:d.scrollHeight>d.clientHeight+1,bodyOverflowX:b.scrollWidth>b.clientWidth+1,
      bodyScroll:b.scrollHeight>b.clientHeight,scrollTop:b.scrollTop
     }});
     assert(!m.dialogScroll&&!m.bodyOverflowX,'fixed dialog with no horizontal overflow');
     assert(m.bodyScroll&&m.scrollTop>0,'candidate body can scroll');
     const after=await close.boundingBox();assert(Math.abs(before.y-after.y)<1,'header stays fixed');
     assert(after.y>=0&&after.y+after.height<=viewport.height,'close remains on screen');
     await q.screenshot({path:path.join(s.out,'horror-'+viewport.width+'x'+viewport.height+'.png')});
     await close.tap();await q.locator('[data-horror-card="6"]').tap();
     await q.waitForFunction(()=>$('horrorDialogBody').scrollTop>0);
     assert.deepEqual(other.errors,[]);evidence.push({viewport,...m,scrollRemembered:true});
    }finally{await other.context.close()}
   }
   return {viewports:evidence,syntheticDataOnly:true};
  });
  await s.test('pose-editors-and-color-palettes-keep-their-specialized-controls',async()=>{
   let d=await openFamily(p,'catalog');await d.getByRole('button',{name:'候補をカードで表示',exact:true}).click();await closeAll(p);
   await p.evaluate(()=>$('profiles').querySelector('[data-picker-source="catalog:pose"]').pickerApi.open());d=p.locator('#personChoiceDialog');if(await d.locator('#poseComposeTabs').isVisible()){assert.equal(await d.locator('.selectionView:not([hidden])').count(),0);assert(!(await d.evaluate(e=>e.classList.contains('selectionCardMode'))))}await closeAll(p);
   d=await openFamily(p,'color');assert.equal(await d.locator('.selectionView:not([hidden])').count(),0);assert(await d.locator('.paletteChoice').count()>0);await d.locator('[data-selection-close]').first().click();
   const r=await openManga(p);await r.locator('[data-card-id="9"]').getByRole('button',{name:'配色を選ぶ',exact:true}).click();const palette=r.locator('dialog.option-editor[open]');await palette.locator('.selectionHead').waitFor();assert.equal(await palette.locator('.selectionView:not([hidden])').count(),0);await closeAll(p);await r.locator('#simpleMainBack').click();return {structuredPoseKept:true,colorSwatchesKept:true,mangaPaletteHeader:true};
  });
  await s.test('picker-controls-work-without-the-newer-checkVisibility-browser-API',async()=>{
   await p.evaluate(()=>{window.selectionTestVisibility=Element.prototype.checkVisibility;Element.prototype.checkVisibility=undefined});
   try{const d=await openFamily(p,'background');await d.getByRole('button',{name:'候補をカードで表示',exact:true}).click();await d.getByRole('button',{name:'候補を一覧で表示',exact:true}).click();assert.equal(await d.locator('.selectionView').count(),1);await closeAll(p)}finally{await p.evaluate(()=>{Element.prototype.checkVisibility=window.selectionTestVisibility;delete window.selectionTestVisibility})}return {nativeVisibilityFallback:true};
  });
  await s.test('repeated-native-redraws-do-not-duplicate-controls-and-save-reload-stays-compatible',async()=>{
   const r=await openManga(p),d=await mangaPicker(p,r,'legacy');for(let i=0;i<12;i++)await d.locator('#pickerSearch').fill(i%2?'スクール':'ビキニ');await d.locator('#pickerSearch').fill('スクール水着');assert.equal(await d.locator('.selectionView').count(),1);assert.equal(await r.locator('#selectionDialogUIStyle').count(),1);await closeAll(p);await r.locator('#simpleMainBack').click();await p.waitForFunction(()=>selectionUIOpen.size===0);
   const manga=await p.evaluate(()=>$('simpleMangaTool').simpleManga.snapshot()),before=await working(p);await p.evaluate(()=>{if(!persist())throw Error('save failed');clearTimeout(workingSaveTimer)});await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(hash(await working(p)),hash(before));const rr=await openManga(p);assert.deepEqual(await p.evaluate(()=>$('simpleMangaTool').simpleManga.snapshot()),manga);await rr.locator('#simpleMainBack').click();return {twelveRedraws:true,oneToolbarAndStyle:true,closedPickersReleased:true,mainAndMangaReload:true};
  });
  assert.deepEqual(current.errors,[]);s.save({syntheticDataOnly:true,baseline,noCandidateOrStorageSchemaChanges:true,pageErrors:current.errors});
 }finally{if(current)await current.context.close();await browser.close();await server.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
