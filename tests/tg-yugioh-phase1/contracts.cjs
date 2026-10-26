const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'../..'),dir=process.env.RESULT_DIR,url=process.env.TARGET_URL,baseline=process.env.PHASE1_BASELINE_URL||'http://127.0.0.1:8765/seaart-phase1-baseline/index.html';
const result={tests:[],physicalDevice:false,seaArtGeneration:false,publicOrigin:false};
const original=require('./baseline-contract.json');
const beforeDefinitions=JSON.parse(require('child_process').execFileSync('git',['show','3fd1bb9fc34be09d85e3eef71cc1f6122f9054b8:src/person-specific-forms.json'],{cwd:root,encoding:'utf8'}));
fs.mkdirSync(dir,{recursive:true});
(async()=>{
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
async function test(id,fn){
 if(process.env.TEST_IDS&&!process.env.TEST_IDS.split(',').includes(id))return;
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:393,height:800}}),page=await context.newPage(),errors=[];
 page.setDefaultNavigationTimeout(90000);page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 try{await page.goto(url);await page.waitForFunction(()=>appReady&&actorFormStorageReady);await page.evaluate(()=>{
  window.ck=(v,m)=>{if(!v)throw Error(m)};
  window.choose=(value)=>{const row=catalog.character.find(x=>x.value===value||x.id===value);ck(row,'owner exists');selected.character=[row.id];personKey=row.id;profiles[row.id]??={};renderProfiles();return 'person:'+row.id};
  window.special=(ref,id='kakugan')=>actorFormsForOwner(actorOwnerForRef(ref)).find(f=>f.uSpecific?.id===id);
  window.standard=ref=>actorFormsForOwner(actorOwnerForRef(ref)).find(f=>f.legacyPresetId==='standard');
  window.apply=(ref,f)=>commitActorApplyPlan(buildActorApplyPlan(ref,f.id));
 });const detail=await fn(page,context);assert.deepEqual(errors,[]);result.tests.push({id,passed:true,detail});console.log('PASS',id)}
 catch(e){result.tests.push({id,passed:false,error:e.stack,pageErrors:errors});console.error('FAIL',id,e.message)}
 finally{await context.close();fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2))}
}
await test('TG01',async p=>{
 const actual=await p.evaluate(()=>({rows:catalog.character,base:characterBasicPresets,forms:[...afEnsureRegistry().values()],definitions:personSpecificDefinitions}));
 assert.equal(actual.rows.length,1405);assert.equal(actual.rows.filter(r=>r.group==='東京喰種').length,21);
 assert.deepEqual(actual.rows.filter(r=>original.catalog.character.some(x=>x.id===r.id)),original.catalog.character);
 assert.deepEqual(actual.definitions.forms.slice(0,11),beforeDefinitions.forms);assert.deepEqual(actual.definitions.candidates.slice(0,beforeDefinitions.candidates.length),beforeDefinitions.candidates);
 for(const [key,value]of Object.entries(original.presets))assert.deepEqual(actual.base[key],value);
 assert.equal(actual.forms.filter(f=>f.uSpecific).length,19);assert.equal(actual.forms.filter(f=>f.ownerRef.kind==='creature').length,60);
 return {oldRows:1390,newRows:15,oldForms:11,newForms:8};
});
await test('TG02',p=>p.evaluate(()=>{
 const rows=[];for(const row of tokyoGhoulPhase1.characters){const ref=choose(row.id),id=row.id;
  profiles[id]={expression:[catalog.expression[0].id],pose:[catalog.pose[0].id],detail:{damage:['bruise'],bodyFeatures:['cat ears']}};paMigrate(profiles[id]);const keep=hCanonical({expression:profiles[id].expression,pose:profiles[id].pose,poseActions:profiles[id].poseActions,damage:profiles[id].detail.damage});
  const f=standard(ref);ck(f,'standard registered');apply(ref,f);const x=profiles[id];ck(item('hairColor',x.hairPrimary).value===row.preset.hair.primary,'hair');ck(item('eyeColor',x.eyeLeft).value===row.preset.eyes.left,'eyes');
  ck(asList(x.detail.bodyFeatures).includes('cat ears'),'manual body retained');ck(keep===hCanonical({expression:x.expression,pose:x.pose,poseActions:x.poseActions,damage:x.detail.damage}),'unrelated settings retained');
  ck(x.outfit.length===1&&outfitSetForValue(item('outfit',x.outfit[0]).value),'outfit registered');rows.push({id,standard:f.id});}
 return rows;
}));
await test('TG03',p=>p.evaluate(()=>{
 for(const def of personSpecificDefinitions.forms){const row=catalog.character.find(r=>characterCanonicalValue(r.value,r.name)===def.owner);ck(row,'form owner');for(const [field,values]of Object.entries(def.detail||{}))for(const value of values)ck(detailOptions[field].options.some(r=>r[0]===value),'candidate resolves');}
 for(const slug of ['arima','hide','akira','uta']){const ref=choose('character-extension-tg-'+slug);ck(!actorFormsForOwner(actorOwnerForRef(ref)).some(f=>f.uSpecific),'human/permanent eyes have no activation forms');}
 ck(catalog.character.filter(r=>r.group==='東京喰種'&&/佐々木|Haise/.test(r.name+r.value)).length===0,'no duplicate Haise');
 ck(catalog.character.some(r=>r.value==='Uta (One Piece)'),'other work Uta retained');return {allReferencesValid:true};
}));
await test('TG04',p=>p.evaluate(()=>{
 const out=[];for(const def of personSpecificDefinitions.forms.slice(11)){const ref=choose(def.owner),id=ref.slice(7);apply(ref,standard(ref));
  (profiles[id].detail.eyeDetail??=[]).push('slit pupils');profiles[id].detail.bodyFeatures=['cat ears'];const hair=hCanonical([profiles[id].hairPrimary,profiles[id].hairStyle]);const clothing=hCanonical([profiles[id].outfit,profiles[id].detail.upper,profiles[id].detail.lower]);
  const n=undoHistory.length;apply(ref,special(ref));ck(undoHistory.length===Math.min(n+1,10),'one Undo');ck(profiles[id].detail.eyeDetail.includes('slit pupils'),'manual eyes kept');
  ck(hair===hCanonical([profiles[id].hairPrimary,profiles[id].hairStyle])&&clothing===hCanonical([profiles[id].outfit,profiles[id].detail.upper,profiles[id].detail.lower]),'eye-only apply');
  ck(profiles[id].detail.eyeDetail.includes(def.detail.eyeDetail[0]),'black sclera applied');
  if(def.owner==='Ken Kaneki (Tokyo Ghoul)'){ck(profiles[id].eyeMode==='odd','left/right mode');ck(item('eyeColor',profiles[id].eyeRight).value==='gray eyes','right eye stays gray');}
  else ck(profiles[id].eyeMode==='same','both eyes');
  apply(ref,standard(ref));ck(!profiles[id].detail.eyeDetail.includes(def.detail.eyeDetail[0]),'owned eye trait removed');ck(profiles[id].detail.eyeDetail.includes('slit pupils')&&profiles[id].detail.bodyFeatures.includes('cat ears'),'manual traits remain');out.push(def.owner);}
 return out;
}));
await test('TG05',p=>p.evaluate(()=>{
 const ref=choose('Ken Kaneki (Tokyo Ghoul)'),id=ref.slice(7);apply(ref,standard(ref));profiles[id].detail.bodyFeatures=['cat ears'];apply(ref,special(ref,'kagune'));
 hSetActor(ref,{structure:{...horrorState.byActor[ref].structure,extraArms:'present'}});apply(ref,special(ref));
 ck(!profiles[id].detail.bodyFeatures.includes('red rinkaku kagune extending from the lower back'),'old organ removed');ck(profiles[id].detail.bodyFeatures.includes('cat ears'),'manual body kept');
 ck(horrorState.byActor[ref].structure.tentacles==='unset'&&horrorState.byActor[ref].structure.extraArms==='present','structure ownership');ck(item('hairColor',profiles[id].hairPrimary).value==='black hair','old white hair released');
 apply(ref,standard(ref));return {previousKaguneReleased:true};
}));
await test('TG06',p=>p.evaluate(()=>{
 const ref=choose('character-extension-tg-nishiki'),id=ref.slice(7);apply(ref,standard(ref));const f=special(ref);apply(ref,f);apply(ref,f);apply(ref,f);
 ck(profiles[id].detail.eyeDetail.filter(x=>x===f.uSpecific.detail.eyeDetail[0]).length===1,'no duplicate eye traits');apply(ref,standard(ref));ck(!asList(profiles[id].detail.eyeDetail).includes(f.uSpecific.detail.eyeDetail[0]),'repeat release');return {idempotentAppearance:true};
}));
await test('TG07',p=>p.evaluate(()=>{
 const ref=choose('Rize Kamishiro (Tokyo Ghoul)'),id=ref.slice(7);apply(ref,standard(ref));const f=special(ref);const tag=f.uSpecific.detail.eyeDetail[0];profiles[id].detail.eyeDetail=[tag,'slit pupils'];apply(ref,f);apply(ref,standard(ref));
 ck(profiles[id].detail.eyeDetail.includes(tag),'preexisting manual same trait retained');return {manualBeforeApply:true};
}));
await test('TG08',p=>p.evaluate(()=>{
 const ref=choose('Touka Kirishima (Tokyo Ghoul)'),id=ref.slice(7);apply(ref,standard(ref));apply(ref,special(ref));profiles[id].hairPrimary=catalog.hairColor.find(r=>r.value==='pink hair').id;
 profiles[id].detail.effect=['blue aura'];apply(ref,special(ref));ck(item('hairColor',profiles[id].hairPrimary).value==='pink hair','eye form does not change manual hair');ck(profiles[id].detail.effect.includes('blue aura'),'manual aura');
 apply(ref,standard(ref));ck(item('hairColor',profiles[id].hairPrimary).value==='purple hair','explicit standard hair wins');return {priorityDocumented:true};
}));
await test('TG09',p=>p.evaluate(()=>{
 const ref=choose('character-extension-tg-hinami');apply(ref,standard(ref));hSetActor(ref,{state:'partial',primaryTypeId:'horror-type-ghost',autoFeatures:{version:1,enabled:true,excludedIds:[]},structure:{wings:'present',horns:'unset',tail:'unset',tentacles:'absent',extraArms:'unset',extraLegs:'unset'}});
 const old=hCanonical(horrorState.byActor[ref]);apply(ref,special(ref));ck(hCanonical(horrorState.byActor[ref])===old,'eyes do not mutate auto or structures');ck(!asList(profiles[ref.slice(7)].detail.bodyFeatures).some(v=>/kagune|tentacle|wing/.test(v)),'no invented organs');return {horrorIndependent:true};
}));
await test('TG10',p=>p.evaluate(()=>{
 const ref=choose('character-extension-tg-yomo');apply(ref,standard(ref));const other=catalog.character.find(r=>r.value==='Touka Kirishima (Tokyo Ghoul)');selected.character.push(other.id);profiles[other.id]={detail:{bodyFeatures:['cat ears'],damage:['bruise']}};
 restoreCreatures([{id:'phase1-creature',species:'wolf',name:'Creature'}]);renderProfiles();actorExtensions=afValidateExtensions(actorExtensions);const old=hCanonical({other:profiles[other.id],creatures,entry:actorExtensions.byActor['person:'+other.id]});apply(ref,special(ref));
 ck(old===hCanonical({other:profiles[other.id],creatures,entry:actorExtensions.byActor['person:'+other.id]}),'other actors unchanged');return {twoPeopleAndCreature:true};
}));
await test('TG11',p=>p.evaluate(()=>{
 const ref=choose('Ken Kaneki (Tokyo Ghoul)');apply(ref,standard(ref));hSetActor(ref,{state:'partial'});hEnsureManga();const panel=mangaState.panels[0];
 hTransaction('panel fixture',()=>{const local=hEnsurePanel(ref,panel.id);local.state='normal';local.structure.tentacles='absent';local.features['horror-feature-long-fingers']={mode:'off'};});
 const old=hCanonical({byManga:horrorState.byManga,panels:mangaState.panels,count:mangaState.count});apply(ref,special(ref));ck(old===hCanonical({byManga:horrorState.byManga,panels:mangaState.panels,count:mangaState.count}),'fixed panels remain');return {mangaFixedPreserved:true};
}));
await test('TG12',p=>p.evaluate(()=>{
 const ref=choose('character-extension-tg-nishiki');apply(ref,standard(ref));profiles[ref.slice(7)].detail.damage=['bruise'];const old=captureWorking(),oldHorror=hCopy(horrorState);apply(ref,special(ref));$('undoOpen').click();
 ck(hEqual(profiles,old.profiles)&&hEqual(actorExtensions,old.actorExtensions)&&hEqual(horrorState,oldHorror), 'Undo restores actors');return {oneApplyUndo:true};
}));
for(const key of ['settings','working','history','marker','journal'])await test('FAILSAFE-'+key,p=>p.evaluate(key=>{
 const ref=choose('character-extension-tg-hinami');apply(ref,standard(ref));persist();clearTimeout(workingSaveTimer);const before=hCanonical({working:captureWorking(),favorites,promptHistory,undoHistory,raw:Object.fromEntries(Object.entries(actorFormStorageKeys).map(([k,v])=>[k,localStorage.getItem(v)]))});
 const set=Storage.prototype.setItem;let failed=false,rejected=false;Storage.prototype.setItem=function(k,v){if(!failed&&k===actorFormStorageKeys[key]){failed=true;throw new DOMException('fixture quota','QuotaExceededError')}return set.call(this,k,v)};
 try{apply(ref,special(ref))}catch{rejected=true}finally{Storage.prototype.setItem=set}
 ck(rejected,'storage failure rejected');ck(before===hCanonical({working:captureWorking(),favorites,promptHistory,undoHistory,raw:Object.fromEntries(Object.entries(actorFormStorageKeys).map(([k,v])=>[k,localStorage.getItem(v)]))}),'exact rollback');return {key,rolledBack:true};
},key));
await test('TG13',async p=>{
 const before=await p.evaluate(()=>{const ref=choose('character-extension-tg-nishiki');apply(ref,standard(ref));apply(ref,special(ref));persist();clearTimeout(workingSaveTimer);return {profiles:hCopy(profiles),ext:hCopy(actorExtensions)}});
 await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);assert.deepEqual(await p.evaluate(()=>({profiles,ext:actorExtensions})),before);return {reload:true};
});
await test('TG14',p=>p.evaluate(()=>{
 const ref=choose('character-extension-tg-hinami');apply(ref,standard(ref));apply(ref,special(ref));$('favoriteName').value='phase1 named';$('saveFavorite').click();const expected=hCopy(favorites.at(-1));apply(ref,standard(ref));restoreWorking(expected);
 ck(hEqual(actorExtensions,expected.actorExtensions)&&hEqual(profiles,expected.profiles),'named restore');generate();recordGeneration('normal');const history=hCopy(promptHistory[0]);apply(ref,standard(ref));restoreWorking(history.working);generate();ck($('positive').value===history.positive,'history prompt restore');return {named:true,history:true};
}));
async function importFile(page,backup){await page.locator('#backupFile').setInputFiles({name:'phase1.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.waitForFunction(()=>!hImportPending);if(await page.locator('#horrorDialog').isVisible())await page.locator('#horrorDialogFooter').getByRole('button',{name:'保存する',exact:true}).click();}
await test('TG15',async p=>{
 const backup=await p.evaluate(()=>{const ref=choose('character-extension-tg-yomo');apply(ref,standard(ref));apply(ref,special(ref));return hBackup({includeDrafts:false,includeTrash:false})});
 const c=await browser.newContext({serviceWorkers:'block'}),q=await c.newPage();q.on('dialog',d=>d.accept());await q.goto(url);await q.waitForFunction(()=>appReady&&actorFormStorageReady);await importFile(q,backup);await q.waitForFunction(()=>selected.character.includes('character-extension-tg-yomo'));
 assert.deepEqual(await q.evaluate(()=>({profiles,ext:actorExtensions})),{profiles:backup.workingState.profiles,ext:backup.workingState.actorExtensions});await c.close();return {actualJSONRoundTrip:true};
});
for(const version of [3,4,5])await test('OLDJSON-'+version,async p=>{
 const c=await browser.newContext({serviceWorkers:'block'}),old=await c.newPage();old.on('dialog',d=>d.accept());await old.goto(version===5?'http://127.0.0.1:8765/seaart-horror-auto/index.html':'http://127.0.0.1:8765/seaart-old-main/index.html');await old.waitForFunction(()=>appReady&&actorFormStorageReady);
 await old.evaluate(()=>{const row=catalog.character.find(r=>r.value==='Jaden Yuki (Yu-Gi-Oh! GX)');selected.character=[row.id];profiles[row.id]={detail:{damage:['bruise']}};renderProfiles();persist()});const downloaded=old.waitForEvent('download');await old.evaluate(()=>downloadJson());const download=await downloaded;const file=path.join(dir,'old-'+version+'.json');await download.saveAs(file);const backup=JSON.parse(fs.readFileSync(file));
 if(version===3){backup.version=3;delete backup.actorFormCatalog;for(const w of [backup.workingState,...backup.favorites,...(backup.promptHistory||[]).map(h=>h.working)].filter(Boolean))delete w.actorExtensions;}
 assert.equal(backup.version,version);await importFile(p,backup);await p.waitForFunction(()=>selected.character.some(id=>catalog.character.find(r=>r.id===id)?.value==='Jaden Yuki (Yu-Gi-Oh! GX)'));
 assert(await p.evaluate(()=>tokyoGhoulPhase1.characters.every(row=>catalog.character.some(x=>x.id===row.id)&&characterBasicPresets[row.value]?.length===1)));
 assert.equal(await p.evaluate(()=>catalog.character.filter(r=>r.group.startsWith('遊戯王')).length),14);await c.close();return {version,actualOldExportImport:true};
});
await test('TG16',p=>p.evaluate(()=>{
 const ref=choose('Ken Kaneki (Tokyo Ghoul)');apply(ref,standard(ref));const id=duplicateActorForm(ref,special(ref).id),copy=resolveActorForm(actorOwnerForRef(ref),id);apply(ref,copy);ck(profiles[ref.slice(7)].eyeMode==='odd','copy keeps laterality');
 const plain=createActorCustomForm(ref,'自由形態',blankActorFormAppearance(ref));apply(ref,resolveActorForm(actorOwnerForRef(ref),plain));ck(!asList(profiles[ref.slice(7)].detail.eyeDetail).includes('red kakugan in the left eye with a black sclera'),'free switch releases eyes');
 deleteActorCustomForm(ref,id,false);ck(!resolveActorForm(actorOwnerForRef(ref),id),'delete');$('undoOpen').click();ck(resolveActorForm(actorOwnerForRef(ref),id),'maintenance Undo');return {copy:true,free:true,managementUndo:true};
}));
await test('TG17',p=>p.evaluate(()=>{
 const ref=choose('character-extension-tg-nishiki'),f=special(ref),picker={source:'detail:eyeDetail',ownerId:ref.slice(7)},value=f.uSpecific.detail.eyeDetail[0];personCharacterCandidatesVisible=false;ck(!personCharacterCandidateAllowed(picker,value,false),'OFF hides');apply(ref,f);ck(personCharacterCandidateAllowed(picker,value,true),'selected stays visible');
 personCharacterCandidatesVisible=true;ck(personCharacterCandidateAllowed(picker,value,false),'own ON');const human=choose('character-extension-tg-arima');ck(personCharacterCandidateAllowed({source:picker.source,ownerId:human.slice(7)},value,false),'v44 other owner visible');return {offOnContract:true,crossOwnerV44:true};
}));
await test('TG18',p=>p.evaluate(presets=>{
 let checked=0;for(const [owner,forms]of Object.entries(presets))for(const form of forms){if(!form.outfit)continue;const row=catalog.outfit.find(r=>r.value===form.outfit);ck(row,'old outfit retained');const owners=characterCandidateOwners('catalog:outfit',row.id);ck(!owners||owners.has(owner),'old outfit owner must stay visible: '+owner);checked++;}
 const row=catalog.outfit.find(r=>r.value==='black sleeveless shirt and dark trousers'),owners=characterCandidateOwners('catalog:outfit',row.id);ck(owners.has('Genos (One Punch Man)')&&owners.has('Uta (Tokyo Ghoul)'),'shared existing outfit owners');return {oldPresetOutfitsChecked:checked,genosAndUtaShared:true};
},original.presets));
await test('YG01',async p=>{
 await p.evaluate(()=>{choiceFilterState.character={group:'遊戯王GX',sort:'original'};openChoiceDialog('character')});assert.equal(await p.locator('#characterGroup').inputValue(),'遊戯王');
 assert.equal(await p.locator('#characterGroup option').filter({hasText:/^遊戯王/}).count(),1);assert.equal(await p.locator('#choiceDialogChoices .modalOption').count(),14);
 assert.equal(await p.evaluate(()=>characterFilterGroup('遊戯王GO RUSH!!')),'遊戯王GO RUSH!!');return {sevenToOne:true,count:14};
});
await test('YG02',async p=>{
 await p.evaluate(()=>openChoiceDialog('character'));await p.locator('#characterGroupHeader').click();await p.locator('#characterGroupMenu [data-category="遊戯王"]').click();const counts={};for(const q of ['GX',"5D's",'VRAINS','SEVENS','ZEXAL','ARC-V']){await p.locator('#choiceDialogSearch').fill(q);counts[q]=await p.locator('#choiceDialogChoices .modalOption').count();}
 assert.deepEqual(counts,{GX:2,"5D's":2,VRAINS:1,SEVENS:1,ZEXAL:1,'ARC-V':1});await p.locator('#choiceDialogSearch').fill('');await p.locator('#choiceDialogChoices .modalOption').first().click();assert.equal(await p.evaluate(()=>selected.character.length),1);return counts;
});
await test('YG03',p=>p.evaluate(()=>{
 const rows=catalog.character.filter(r=>r.group.startsWith('遊戯王'));for(const row of rows){const f=characterBasicPresets[row.value];ck(f?.length===1,'standard reference retained');ck(!actorFormsForOwner({kind:'person',catalogId:row.id,value:row.value}).some(f=>f.uSpecific),'no other-work forms added');}
 const persona=catalog.character.filter(r=>r.group==='ペルソナ');ck(persona.length===10&&displayGroupNames('catalog:character',persona.map(r=>[r.id,r.name,r.group])).join()==='ペルソナ','Persona unchanged');return {yugioh:14,persona:10};
}));
await test('ALIAS01',async p=>{
 await p.evaluate(()=>openChoiceDialog('character'));for(const q of ['高槻泉','オウル','オロチ','スケアクロウ','佐々木琲世']){await p.locator('#choiceDialogSearch').fill(q);assert.equal(await p.locator('#choiceDialogChoices .modalOption').count(),1,q);}
 return {aliasesResolveWithoutExtraCharacters:true};
});
await test('MODEL01',async p=>{
 async function collect(page){return page.evaluate(()=>{const values=['Ken Kaneki (Tokyo Ghoul)','Touka Kirishima (Tokyo Ghoul)'];selected.character=values.map(value=>catalog.character.find(r=>r.value===value).id);profiles=Object.fromEntries(selected.character.map((id,i)=>[id,{hairPrimary:catalog.hairColor[i].id,eyeLeft:catalog.eyeColor[i].id,expression:[catalog.expression[i].id],detail:{damage:['bruise']}}]));restoreCreatures([{id:'phase1-model-creature',species:'wolf',name:'Creature'}]);renderProfiles();subjectSeparationMode='strong';const out={};for(const family of ['standard','illustrious','anima','sdxl','noobai','pony','krea']){modelFamily=family;generate();generateManga();out[family]={positive:$('positive').value,negative:$('negative').value,manga:$('mangaPositive').value,mangaNegative:$('mangaNegative').value}}return out;});}
 // v44 intentionally changes escaping and subject phrasing; this immutable golden was collected from the supplied v44, not the fixed product.
 const golden=require('../v44-audit/fixtures/v44-model-samples.json'),actual=await collect(p);assert.deepEqual(actual,golden.outputs);fs.writeFileSync(path.join(dir,'seven-model-fulltexts.json'),JSON.stringify({sourceHTMLSHA256:golden.sourceHTMLSHA256,actual},null,2));return {models:7,normalAndMangaExact:true,baseline:'attached v44'};
});
await test('MODEL02',p=>p.evaluate(()=>{
 const ref=choose('character-extension-tg-nishiki');apply(ref,standard(ref));apply(ref,special(ref));const out={};for(const family of ['standard','illustrious','anima','sdxl','noobai','pony','krea']){modelFamily=family;generate();const prompt=$('positive').value;ck(prompt.includes('red kakugan in both eyes with black sclera'),'eye detail in '+family);ck(!/kagune|tentacles|bird wings|cat tail/.test(prompt),'no unimplemented anatomy');out[family]=prompt;}return out;
}));
await browser.close();result.passed=result.tests.every(t=>t.passed);fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exit(1)});
