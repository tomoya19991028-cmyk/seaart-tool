const{launch,pageFor,startServer,suite,assert,fixture,layers}=require('./helpers.cjs');
(async()=>{const s=suite('background-effects-boundaries'),server=await startServer(),browser=await launch();try{const{page:p,context,errors}=await pageFor(browser,server.url);
 await s.test('BG-human-Creature-and-horror-scene-only-output-and-latest-edit',async()=>{
  await fixture(p);await layers(p,'balanced');const r=await p.evaluate(()=>{
   const ref='creature:creature-environment-wolf',entry=creatureAnthroEntry(ref);entry.representation.mode='full';entry.humanProfile.byMode.full.detail.weapon=['bow'];entry.humanProfile.byMode.full.hair.primary='blue hair';actorExtensions.byActor[ref]=entry;waApplyPreset(entry.humanProfile.byMode.full,'bow','bow-aim');
   hSetActor('person:original-environment-hero',{state:'complete',primaryTypeId:'horror-type-shadow',autoFeatures:{version:1,enabled:true,excludedIds:[]}});
   hSetActor(ref,{state:'partial',primaryTypeId:'horror-type-beast'});hSetFeature(ref,'horror-feature-sharp-claws',{enabled:true,weight:1.3,parameters:{}});
   generate();const before=$('positive').value,saved=hCanonical({actor:actorExtensions,horror:horrorState});
   environmentDesign.view='landscape-only';generate();generateManga();const only={normal:$('positive').value,page:$('mangaPositive').value,panels:[...$('mangaIndividual').querySelectorAll('textarea')].map(t=>t.value)};
   profiles['original-environment-hero'].detail.weapon=['spear'];profiles['original-environment-hero'].poseActions=[];waApplyPreset(profiles['original-environment-hero'],'spear','thrust');
   environmentDesign.view='balanced';generate();mangaState.panels[0].environmentOverrides={version:1,view:{mode:'custom',value:'landscape-only'}};generateManga();clearTimeout(workingSaveTimer);
   return{before,only,after:$('positive').value,mixed:[...$('mangaIndividual').querySelectorAll('textarea')].map(t=>t.value),saved:saved===hCanonical({actor:actorExtensions,horror:horrorState})};
  });assert(r.saved);assert.match(r.before,/shadow|claws/);for(const text of[r.only.normal,r.only.page,...r.only.panels]){assert(!/Environment hero|blue hair|wolf|bowstring|sharp claws|living shadows|Character [A-Z]:|Creature [A-Z]:/.test(text));assert(text.includes('moonlight'))}assert(r.after.includes('spear'));assert(!/Environment hero|wolf|bowstring|living shadows/.test(r.mixed[0]));assert.match(r.mixed[1],/spear|bowstring|shadow/);return{humanCreature:true,horror:true,storedActorsKept:true,latestActorEdit:true,mixedPanelBoundary:true};
 });
 assert.deepEqual(errors,[]);await context.close();s.save();}finally{await browser.close();await server.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
