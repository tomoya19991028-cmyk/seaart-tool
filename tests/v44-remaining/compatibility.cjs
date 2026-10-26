const fs=require('fs'),cp=require('child_process'),zlib=require('zlib');
const {launch,pageFor,startServer,suite,assert,hash,root}=require('../v44-audit/helpers.cjs');
(async()=>{const s=suite('remaining-compatibility'),server=await startServer(),b=await launch();try{
const current=await pageFor(b,process.env.TARGET_URL||server.url),p=current.page;
await s.test('FIXED-independent-original-R1-twelve-datasets-retained',async()=>{
 const bytes=zlib.gunzipSync(fs.readFileSync('tests/fixtures/creature-motif-person-r1-original-baseline.json.gz'));assert.equal(hash(bytes),'e66ce65757f985a23c03d05f1d69d60d214e5169fc093abf72182cfda483d832');const expected=JSON.parse(bytes).after;
 assert.equal(hash(JSON.stringify(expected.outputs)),'7d283415876bc135f201d347063f641fa33ef7f0cc341843d050908195693b5d');
 const d=await p.evaluate(()=>({catalog,characterBasicPresets,detailOptions,outfitSets,genders:characterGenderByValue,creatureBasicPresets,creatureCandidateBase,owners:[...creatureFeatureOwnerIndex].map(([k,v])=>[k,[...v]]),adapters:[...afEnsureRegistry()],creatureFields,creatureFeatureLabels,creatureSpeciesGroups}));
 let rows=0;for(const [field,entries]of Object.entries(expected.data.catalog))for(const row of entries){assert.deepEqual(d.catalog[field].find(r=>r.id===row.id),row,field+'/'+row.id);rows++}
 for(const field of ['characterBasicPresets','outfitSets','genders','creatureFeatureLabels'])for(const [key,value]of Object.entries(expected.data[field]))assert.deepEqual(d[field][key],value,field+'/'+key);
 for(const field of ['creatureBasicPresets','creatureCandidateBase','owners','creatureFields','creatureSpeciesGroups'])assert.deepEqual(d[field],expected.data[field],field);
 for(const [key,value]of Object.entries(expected.data.detailOptions)){assert.equal(d.detailOptions[key].label,key==='bust'?'胸の大きさ':value.label,'detail label '+key);for(const row of value.options){const wanted=key==='subjectRelation'&&row[0]==='facing each other'?['facing each other','向き合う','向き・姿勢']:row;assert(d.detailOptions[key].options.some(r=>JSON.stringify(r)===JSON.stringify(wanted)),'detail '+key+'/'+row[0])}}
 for(const [id,value]of expected.data.adapters)assert.deepEqual(d.adapters.find(row=>row[0]===id)?.[1],value,'adapter '+id);
 return {fixedFixtureSHA256:hash(bytes),datasets:12,oldCatalogRows:rows,standardAdapters:expected.data.adapters.length,baselineNeverRewritten:true,oldFormattedFulltextReplacedByOriginalV44ReplayAndIndependentAttribution:true};
});
await s.test('SAVE-known-empty-defaults-and-nonempty-sound-reaction-reload',async()=>{
 const expected=await p.evaluate(()=>{restoreCreatures([{id:'remaining-c',species:'wolf'}]);setCreatureRepresentation('creature:remaining-c','semi');const a=caBlankAdult();for(const mode of ['semi','full']){a.byMode[mode].scene.soundEffect=[adultSharedBase.soundEffect[0][0]];a.byMode[mode].scene.extra='音声, "保持"\n改行';a.byMode[mode].scene.reactionEffect=[adultSharedBase.reactionEffect[0][0]];}saveCreatureAdultState('creature:remaining-c',a);adultScene.soundEffect=[adultSharedBase.soundEffect[0][0]];adultScene.soundEffectText='人物音声';adultScene.reactionEffect=[adultSharedBase.reactionEffect[0][0]];adultScene.reactionEffectText='人物反応';if(!persist())throw Error('save failed');clearTimeout(workingSaveTimer);return hCanonical(captureWorking())});
 await p.reload();await p.waitForFunction(()=>appReady&&actorFormStorageReady);assert.equal(await p.evaluate(()=>hCanonical(captureWorking())),expected);assert.equal(await p.evaluate(()=>creatureAdultAuthorizations.size+resultAccessPermissions.size),0);return {fullSnapshotEqual:true,nonemptyGeneralAndBothCreatureModesRetained:true,noPermissionGranted:true};
});
await s.test('JSON-old-main-to-current-and-current-new-pose-safe-old-rejection',async()=>{
 const oldServer=await startServer({assetOverrides:{'index.html':cp.execFileSync('git',['show','894d5fbfdfa65e68a50b77acdaa3e497ed31aeca:index.html'],{cwd:root,maxBuffer:8*1024*1024})}}),old=await pageFor(b,oldServer.url);
 try{
  const state=await old.page.evaluate(()=>{originalCharacters=[{id:'original-forward-check',name:'旧人物',type:'adult woman'}];profiles={'original-forward-check':{hairPrimary:catalog.hairColor.find(r=>r.value==='blue hair').id,detail:{damage:['bruise']}}};restoreCreatures([{id:'remaining-old-wolf',species:'wolf',color:'red'}]);renderProfiles();persist();clearTimeout(workingSaveTimer);return captureWorking()});
  await p.evaluate(state=>{restoreWorking(state);clearTimeout(workingSaveTimer)},state);assert.deepEqual(await p.evaluate(()=>({profiles,creatures,originalCharacters})),{profiles:state.profiles,creatures:state.creatures,originalCharacters:state.originalCharacters});
  const incoming=await p.evaluate(()=>{setCreatureRepresentation('creature:remaining-old-wolf','full');const e=actorExtensions.byActor['creature:remaining-old-wolf'];e.humanProfile.byMode.full.poseActionsVersion=1;e.humanProfile.byMode.full.poseActions=[{id:'reverse-only-action',action:'extend',movingPart:'left-arm'}];clearTimeout(workingSaveTimer);return captureWorking()});
  const result=await old.page.evaluate(state=>{clearTimeout(workingSaveTimer);const snapshot=()=>hCanonical({w:captureWorking(),disk:{...localStorage},undo:undoHistory});const before=snapshot();let error='';try{restoreWorking(state)}catch(e){error=e.message}return {error,unchanged:snapshot()===before}},incoming);assert(result.error);assert(result.unchanged);return {forwardPass:true,reverseUnsupported:true,...result,referenceCommit:'894d5fbfdfa65e68a50b77acdaa3e497ed31aeca'};
 }finally{await old.context.close();await oldServer.close()}
});
assert.deepEqual(current.errors,[]);await current.context.close();s.save({testDataOnly:true});}finally{await b.close();await server.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
