// R1 diagnostics only: no production registry overrides or new content candidates.
// BASELINE_URL must serve the exact starting main HTML, separately from historical fixtures.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const {chromium}=require('playwright');
const root=process.env.RESULT_DIR||'/workspace/seaart-stage5-remaining-r1';
const url=process.env.TARGET_URL||'http://127.0.0.1:8765/seaart-tool/index.html';
const baseline=process.env.BASELINE_URL||'http://127.0.0.1:8765/seaart-stage5-remaining-r1/current/index.html';
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
fs.mkdirSync(root,{recursive:true});
async function page(browser,target){
 const context=await browser.newContext({serviceWorkers:'block'}),p=await context.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept());
 p.on('console',m=>{if(m.type()==='log'&&m.text().startsWith('R1 matrix:'))console.log(m.text())});
 await p.goto(target);await p.waitForFunction(()=>appReady&&actorFormStorageReady);
 return {context,p,errors};
}
async function contracts(p){return p.evaluate(()=>{
 const checks=[],check=(v,name)=>{if(!v)throw Error(name);checks.push(name)},ref='creature:r1-a';
 check(Object.isFrozen(creatureAdultSubjectDefinitions)&&creatureAdultSubjectDefinitions.length===0,'production registry frozen and empty');
 check(creatureAdultAuthorizations.size===0&&resultAccessPermissions.size===0&&resultAccessResources.size===0,'startup grants and resources empty');
 const ids=['Kris (Pokemon)','Yugi Muto (Yu-Gi-Oh!)'].map(v=>catalog.character.find(x=>x.value===v).id);
 selected.character=ids;profiles={};renderProfiles();for(const id of ids){personKey=id;applyActorForm('person:'+id)}
 restoreCreatures(['pikachu (pokemon)','pikachu (pokemon)','charizard (pokemon)','eevee (pokemon)'].map((species,i)=>({id:'r1-'+String.fromCharCode(97+i),species,actions:['standing']})));
 for(const c of creatures)applyActorForm('creature:'+c.id);
 check(creatureAdultEligibility(ref).reason==='native-or-invalid-mode','Native denied');
 adultScene.enabled=true;
 const native=JSON.stringify(creatures),people=JSON.stringify(profiles),personAdult=JSON.stringify(adultScene.people||{});
 for(const [i,c]of creatures.entries()){
  const r='creature:'+c.id;
  for(const mode of ['semi','full']){setCreatureRepresentation(r,mode);const a=anthroBlankAppearance();a.hair.primary=mode==='semi'?'blue hair':'white hair';a.eyes.left=i?'green eyes':'purple eyes';a.hairStyle=['short hair'];updateCreatureAnthro(r,mode,a,anthroDefaultInheritance(mode))}
  const a=caBlankAdult();a.byMode.semi.scene.extra='R1_STORAGE_'+c.id+'_SEMI';a.byMode.full.scene.extra='R1_STORAGE_'+c.id+'_FULL';
  saveCreatureAdultState(r,a,{state:creatureAdultState(r),revision:actorFormLastBundle.marker.revision});
  const q=creatureAdultEligibility(r);check(q.reason==='no-trusted-definition'&&!q.allowed&&!q.baseEligible,'unregistered full denied '+c.id);
 }
 const kept=afCopy(actorExtensions);
 for(const mode of ['normal','semi','full','normal','semi'])setCreatureRepresentation(ref,mode);
 check(JSON.stringify(creatures)===native,'mode cycle retains native records');
 check(JSON.stringify(actorExtensions.byActor[ref].humanProfile)===JSON.stringify(kept.byActor[ref].humanProfile),'mode cycle retains both human profiles');
 check(JSON.stringify(creatureAdultState(ref))===JSON.stringify(kept.byActor[ref].adult),'mode cycle retains both storage markers');
 const a=creatureAdultState(ref),h=creatureHumanAppearance(creatures[0],'semi');a.byMode.semi.scene.extra='detached';h.hair.primary='red hair';
 check(creatureAdultState(ref).byMode.semi.scene.extra!=='detached'&&creatureHumanAppearance(creatures[0],'semi').hair.primary==='blue hair','getters return detached copies');
 check(JSON.stringify(profiles)===people&&JSON.stringify(adultScene.people||{})===personAdult&&!Object.keys(profiles).some(id=>id.startsWith('r1-')),'person stores remain independent');
 for(const c of creatures)check(!JSON.stringify(actorExtensions.byActor['creature:'+c.id].humanProfile).includes('R1_STORAGE_'),'adult not transferred to general profile '+c.id);
 undoHistory.length=0;openCreatureHumanEditor(ref,'semi');check(!creatureAdultEditorGate().visible&&!creatureAdultEditorGate().allowed,'ineligible editor hides confirmation and cards');
 check($('creatureHumanEditor').querySelectorAll('[role=tab]').length===4,'production editor four tabs');
 check(!$('creatureHumanEditor').querySelector('[data-human-tab="adult"]')&&!$('creatureHumanEditor').querySelector('[data-editor-card^="adult:"]'),'production editor has no fifth tab or adult cards');
 check(JSON.stringify(pgAdultDefinitions().map(d=>d[0]))===JSON.stringify(['body','exposure','details','action','expression','scene']),'shared six-card candidate adapter unchanged');
 const before=JSON.stringify(captureWorking()),u=undoHistory.length;
 creatureHumanEditorState.byMode.semi.record.hairPrimary=catalog.hairColor.find(x=>x.value==='red hair').id;
 check(!creatureAdultEditorGate().canConfirm,'unsaved general draft cannot confirm');
 for(const [tab,pages]of [['basic',2],['hair',1],['clothing',2],['equipment',3]])for(let n=0;n<pages;n++){creatureHumanEditorState.tab=tab;creatureHumanEditorState.page=n;renderCreatureHumanEditor();check($('creatureHumanEditorGrid').children.length<=6,'maximum six cards '+tab+'/'+n)}
 check(creatureHumanEditorPayload().byMode.semi.appearance.hair.primary==='red hair','page changes preserve draft');
 creatureHumanEditorState.adultDraft.byMode.semi.scene.extra='R1_UNCOMMITTED';let rejected=false;try{saveCreatureHumanEditor()}catch{rejected=true}
 check(rejected&&JSON.stringify(captureWorking())===before&&undoHistory.length===u,'ineligible adult draft commit rejected atomically');
 closeCreatureHumanEditor();check(JSON.stringify(captureWorking())===before,'cancel discards both drafts');
 openCreatureHumanEditor(ref,'semi');const others=JSON.stringify(Object.entries(actorExtensions.byActor).filter(([r])=>r!==ref)),full=JSON.stringify(creatureHumanAppearance(creatures[0],'full'));
 creatureHumanEditorState.byMode.semi.record.hairPrimary=catalog.hairColor.find(x=>x.value==='red hair').id;saveCreatureHumanEditor();
 check(undoHistory.length===u+1&&creatureHumanAppearance(creatures[0],'semi').hair.primary==='red hair','general save one Undo');
 check(JSON.stringify(creatureHumanAppearance(creatures[0],'full'))===full&&JSON.stringify(Object.entries(actorExtensions.byActor).filter(([r])=>r!==ref))===others,'general save target UUID and mode only');
 $('undoOpen').click();check(creatureHumanAppearance(creatures[0],'semi').hair.primary==='blue hair','Undo restores general draft save');
 openCreatureHumanEditor(ref,'semi');const noChange=undoHistory.length;saveCreatureHumanEditor();check(undoHistory.length===noChange,'unchanged save no Undo');
 const stored=afCopy(actorExtensions);$('favoriteName').value='R1 independent state';$('saveFavorite').click();const favorite=favorites.at(-1).id;
 let changed=creatureAdultState(ref);changed.byMode.full.scene.extra='R1_TEMP';saveCreatureAdultState(ref,changed);renderFavorites(favorite);$('loadFavorite').click();
 check(JSON.stringify(actorExtensions)===JSON.stringify(stored)&&creatureAdultAuthorizations.size===0,'named save restore retains values without permission');
 generate();recordGeneration('normal');const entry=promptHistory[0];check(!entry.provenance&&!resultAccessOutputs.normal,'ordinary history remains unprotected opt-in');
 changed=creatureAdultState(ref);changed.byMode.full.scene.extra='R1_TEMP_HISTORY';saveCreatureAdultState(ref,changed);renderHistory();[...$('historyList').querySelectorAll('button')].find(b=>b.textContent==='設定を復元').click();
 check(JSON.stringify(actorExtensions)===JSON.stringify(stored)&&creatureAdultAuthorizations.size===0,'history restore retains values without permission');
 maMaintenanceUndo('R1 management state');actorExtensions.byActor[ref].adult.byMode.full.scene.extra='R1_TEMP_MA';$('undoOpen').click();check(JSON.stringify(actorExtensions)===JSON.stringify(stored),'management Undo restores stored values');
 const snapshot=captureWorking();creatures[0].species='eevee (pokemon)';creatureChanged();check(!actorExtensions.byActor[ref]&&actorExtensions.quarantined.some(q=>q.actorRef===ref&&q.reason==='owner-changed'),'owner change quarantines old extension');
 restoreWorking(snapshot);activeCreatureId='r1-a';$('removeCreature').click();check(!actorExtensions.byActor[ref]&&!creatures.some(c=>c.id==='r1-a'),'individual deletion removes extension');$('undoOpen').click();check(!!actorExtensions.byActor[ref]&&creatureAdultAuthorizations.size===0,'deletion Undo restores data without permission');
 const stable=JSON.stringify(captureWorking()),invalid=afCopy(captureWorking());invalid.actorExtensions.byActor[ref].adult.version=99;rejected=false;try{restoreWorking(invalid)}catch{rejected=true}check(rejected&&JSON.stringify(captureWorking())===stable,'unknown adult schema rejected atomically');
 const receipt=creatureAdultState(ref),subject=creatureAdultSubject(ref),key=creatureAdultContextKey(subject,{scope:'normal',partners:[]},{id:'r1-untrusted-record',revision:1});
 receipt.confirmed=true;receipt.confirmation={receiptId:'r1-saved-record',actorRef:ref,context:JSON.parse(key),definitionId:'r1-untrusted-record',definitionRevision:1,mode:'semi',confirmedAt:new Date().toISOString()};receipt.eligibilitySignature=afHash(JSON.stringify(receipt.confirmation.context));
 const imported=captureWorking();imported.actorExtensions.byActor[ref].adult=receipt;restoreWorking(imported);check(creatureAdultState(ref).confirmed&&!creatureAdultEligibility(ref).allowed&&creatureAdultAuthorizations.size===0,'saved confirmed record grants no authority');
 restoreWorking(snapshot);saveCurrentWorking();clearTimeout(workingSaveTimer);
 return {passed:true,checks,extensions:afCopy(actorExtensions),keys:afCopy(actorFormStorageKeys),productionDefinitions:0};
})}
async function matrix(p){return p.evaluate(()=>{
 const initial=captureWorking(),models=['standard','illustrious','anima','sdxl','noobai','pony','krea'],outputs=[],checks=[];
 const check=(v,s)=>{if(!v)throw Error(s);checks.push(s)},ids=['Kris (Pokemon)','Yugi Muto (Yu-Gi-Oh!)'].map(v=>catalog.character.find(x=>x.value===v).id);
 const shapes=[['people',2,[]],['native',0,['normal']],['semi',0,['semi']],['full',0,['full']],['person1',1,['semi']],['person2',2,['full']],['different',0,['semi','full']],['same',0,['semi','full']],['native-semi',0,['normal','semi']],['native-full',0,['normal','full']]];
 const output=()=>{generate();const normal={positive:$('positive').value,negative:$('negative').value};generateManga();return {...normal,manga:$('mangaPositive').value,mangaNegative:$('mangaNegative').value,panels:[...$('mangaIndividual').querySelectorAll('textarea')].map(x=>x.value)}};
 for(const [shape,people,modes]of shapes){console.log('R1 matrix: '+shape);restoreWorking(initial);selected.character=ids.slice(0,people);profiles={};renderProfiles();for(const id of selected.character){personKey=id;applyActorForm('person:'+id)}
  restoreCreatures(modes.map((mode,i)=>({id:'r1-matrix-'+i,species:i&&shape!=='same'?'charizard (pokemon)':'pikachu (pokemon)',position:i?'on the right side':'on the left side',actions:['standing']})));
  for(const [i,c]of creatures.entries()){const ref='creature:'+c.id;applyActorForm(ref);if(modes[i]!=='normal'){setCreatureRepresentation(ref,modes[i]);const a=anthroBlankAppearance();a.hair.primary=i?'white hair':'blue hair';a.eyes={mode:'odd',left:'purple eyes',right:'green eyes'};a.hairStyle=['short hair'];a.weights.itemWeights.hairStyle={'short hair':1.2};a.outfit=[catalog.outfit[0].value];updateCreatureAnthro(ref,modes[i],a,anthroDefaultInheritance(modes[i]))}}
  const group=normalSubjectOutput(allPeople());check(group.people.every(x=>!x.includes('blue hair')&&!x.includes('white hair')),'human appearance not moved to person '+shape);
  for(const [i,mode]of modes.entries()){if(mode!=='normal')check(group.creatures[i].includes(i?'white hair':'blue hair'),'general appearance belongs to Creature '+shape+'/'+i);else check(!group.creatures[i].includes('blue hair')&&!group.creatures[i].includes('white hair'),'Native omits human profile '+shape+'/'+i)}
  const profilesBefore=JSON.stringify(profiles),nativeBefore=JSON.stringify(creatures);adultScene.enabled=true;
  mangaState=normalizeManga({count:2});if(creatures.length>1)mangaState.panels[1].creatures={'r1-matrix-0':{enabled:false}};
  const without=[];for(const markers of [false,true]){
   for(const c of creatures){const a=caBlankAdult();if(markers){a.byMode.semi.scene.extra='R1_STORAGE_'+c.id+'_SEMI';a.byMode.full.scene.extra='R1_STORAGE_'+c.id+'_FULL'}saveCreatureAdultState('creature:'+c.id,a)}
   let index=0;for(const model of models)for(const separation of ['none','standard','strong']){modelFamily=model;subjectSeparationMode=separation;const generated=output();
    if(markers){check(JSON.stringify(without[index])===JSON.stringify(generated),'stored markers have zero output effect '+shape+'/'+model+'/'+separation);check(!JSON.stringify(generated).includes('R1_STORAGE_'),'markers never emitted '+shape+'/'+model+'/'+separation);outputs.push({shape,model,separation,...generated})}else without.push(generated);
    check(JSON.stringify(profiles)===profilesBefore&&JSON.stringify(creatures)===nativeBefore,'generation read-only '+shape+'/'+model+'/'+separation+'/'+markers);index++;
   }
  }
 }
 mangaState.storyAdult=true;check(mangaCreatures().length===0,'person-only adult story excludes Creatures');
 check(creatureAdultAuthorizations.size===0&&resultAccessResources.size===0,'markers never register permission or resources');
 return {passed:true,checks,outputs,counts:{normal:outputs.length,manga:outputs.length,panels:outputs.reduce((n,o)=>n+o.panels.length,0)},data:{catalog,characterBasicPresets,detailOptions,outfitSets,genders:characterGenderByValue,creatureBasicPresets,creatureCandidateBase,owners:[...creatureFeatureOwnerIndex].map(([k,v])=>[k,[...v]]),adapters:[...afEnsureRegistry()],creatureFields,creatureFeatureLabels,creatureSpeciesGroups}};
})}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const result={passed:false,baselineURL:baseline,targetURL:url,physicalDevice:false,publicOrigin:false};
 try{
  const live=await page(browser,url);result.contracts=await contracts(live.p);
  const expected=result.contracts.extensions;await live.p.reload();await live.p.waitForFunction(()=>appReady&&actorFormStorageReady);
  assert.deepEqual(await live.p.evaluate(()=>afCopy(actorExtensions)),expected);assert.equal(await live.p.evaluate(()=>creatureAdultAuthorizations.size),0);
  result.contracts.checks.push('actual reload retains values and starts with no receipt grants');
  const download=live.p.waitForEvent('download');await live.p.evaluate(()=>downloadJson());const jsonFile=path.join(root,'r1-v4-export.json');await(await download).saveAs(jsonFile);
  await live.p.locator('#backupFile').setInputFiles(jsonFile);await live.p.waitForFunction(e=>JSON.stringify(actorExtensions)===JSON.stringify(e),expected);
  assert.equal(await live.p.evaluate(()=>creatureAdultAuthorizations.size),0);result.contracts.checks.push('actual v4 download/import retains values without permission');
  const legacy=JSON.parse(fs.readFileSync(jsonFile,'utf8'));legacy.version=3;delete legacy.actorFormCatalog;
  for(const w of [legacy.workingState,...legacy.favorites,...(legacy.promptHistory||[]).map(h=>h.working)].filter(Boolean))delete w.actorExtensions;
  const legacyFile=path.join(root,'r1-v3-import.json');fs.writeFileSync(legacyFile,JSON.stringify(legacy));
  await live.p.locator('#backupFile').setInputFiles(legacyFile);await live.p.waitForFunction(()=>actorExtensions.version===3&&Object.keys(actorExtensions.byActor).length===0);
  assert.equal(await live.p.evaluate(()=>creatureAdultAuthorizations.size),0);assert.equal(await live.p.evaluate(()=>creatures.length),4);
  result.contracts.checks.push('actual v3 import preserves native actors, initializes extensions and grants none');
  await live.p.locator('#backupFile').setInputFiles(jsonFile);await live.p.waitForFunction(e=>JSON.stringify(actorExtensions)===JSON.stringify(e),expected);
  await live.p.evaluate(()=>{const a=creatureAdultState('creature:r1-a');a.byMode.full.scene.extra='R1_PAGEHIDE_EVENT';saveCreatureAdultState('creature:r1-a',a);clearTimeout(workingSaveTimer);scene.extra='R1_PAGEHIDE_ONLY';window.addEventListener('pagehide',()=>{sessionStorage.setItem('r1-pagehide-observed','yes')},{once:true})});
  await live.p.goto('about:blank');await live.p.goto(url);await live.p.waitForFunction(()=>appReady&&actorFormStorageReady);
  assert.equal(await live.p.evaluate(()=>sessionStorage.getItem('r1-pagehide-observed')),'yes');assert.equal(await live.p.evaluate(()=>creatureAdultState('creature:r1-a').byMode.full.scene.extra),'R1_PAGEHIDE_EVENT');assert.equal(await live.p.evaluate(()=>scene.extra),'R1_PAGEHIDE_ONLY');
  result.contracts.checks.push('actual browser pagehide persists pending ordinary state and retains markers');assert.deepEqual(live.errors,[]);await live.context.close();
  console.log('R1 contracts completed:',result.contracts.checks.length);
  const captures={};for(const [phase,target]of Object.entries({before:baseline,after:url})){console.log('R1 full-text phase:',phase);const x=await page(browser,target);captures[phase]=await matrix(x.p);assert.deepEqual(x.errors,[]);await x.context.close()}
  assert.deepEqual(captures.after,captures.before,'starting-main/candidate full text and deep data equality');
  fs.writeFileSync(path.join(root,'r1-generation-fulltext.json'),JSON.stringify(captures));
  const d=captures.after.data,counts={character:d.catalog.character.length,personPresets:Object.values(d.characterBasicPresets).reduce((n,a)=>n+a.length,0),species:d.creatureCandidateBase.species.length,creaturePresets:d.creatureBasicPresets.length,features:d.creatureCandidateBase.features.length,creatureCandidates:Object.values(d.creatureCandidateBase).reduce((n,a)=>n+a.length,0),adapters:d.adapters.length};
  assert.deepEqual(counts,{character:1390,personPresets:1384,species:94,creaturePresets:60,features:275,creatureCandidates:500,adapters:1444});
  result.matrix={counts:captures.after.counts,dataCounts:counts,markerComparisons:captures.after.counts.normal,baselineEqual:true,checks:captures.after.checks.length,outputsSHA256:sha(JSON.stringify(captures.after.outputs)),fingerprints:Object.fromEntries(Object.entries(d).map(([k,v])=>[k,sha(JSON.stringify(v))]))};
  result.passed=true;console.log('PASS R1',result.contracts.checks.length,'contracts;',result.matrix.counts,'full-text pairs and marker non-output');
 }catch(e){result.failure=e.stack;throw e}finally{fs.writeFileSync(path.join(root,'r1-results.json'),JSON.stringify(result,null,2));await browser.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
