// Independent attribution checks, retaining complete observed text; no expected fixture is rewritten.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{chromium}=require('playwright');
const root=process.env.RESULT_DIR||'/workspace/seaart-horror-independent-20261011/prompts',url=process.env.TARGET_URL||'http://127.0.0.1:8765/seaart-horror/index.html';fs.mkdirSync(root,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']}),c=await b.newContext({serviceWorkers:'block'}),p=await c.newPage(),errors=[],result={tests:[],physicalDevice:false,seaArtImagesGenerated:false};p.on('pageerror',e=>errors.push(e.message));try{
 await p.goto(url);await p.waitForFunction(()=>appReady&&actorFormStorageReady);const observations=await p.evaluate(()=>{
  originalCharacters=[{id:'original-sep-a',name:'Attribution A',type:'adult woman'},{id:'original-sep-b',name:'Attribution B',type:'adult man'}];profiles={'original-sep-a':{detail:{skinColor:['tan skin']}},'original-sep-b':{detail:{skinColor:['tan skin']}}};restoreCreatures([{id:'sep-c',name:'Attribution Creature',species:'ghost',features:['tail']}]);renderProfiles();renderCreatures();mangaState=normalizeManga({count:2});hSetActor('person:original-sep-a',{state:'partial'});hSetActor('person:original-sep-b',{state:'normal'});hSetActor('creature:sep-c',{state:'normal'});const rows=[],state=captureWorking(),source=hCanonical({profiles,creatures,originalCharacters});
  const scenarios=['A-only','B-only','different-A-B','person-creature','panel-normal','local-overrides-global','weighted-intensity','replace-exclude'];
  for(const scenario of scenarios){restoreWorking(state);const a=horrorState.byActor['person:original-sep-a'],bb=horrorState.byActor['person:original-sep-b'],cc=horrorState.byActor['creature:sep-c'];horrorState.byManga={};a.features={};bb.features={};cc.features={};a.state='normal';bb.state='normal';cc.state='normal';
   const set=(actor,id,weight=1,parameters={})=>{actor.state='partial';actor.features[id]={enabled:true,weight,parameters}};
   if(scenario!=='B-only')set(a,'horror-feature-mask-face');if(['B-only','different-A-B'].includes(scenario))set(bb,'horror-feature-gray-skin');
   if(scenario==='person-creature')set(cc,'horror-feature-long-fingers');
   if(scenario==='panel-normal')hEnsurePanel('person:original-sep-a',mangaState.panels[1].id).state='normal';
   if(scenario==='local-overrides-global'){a.state='normal';const local=hEnsurePanel('person:original-sep-a',mangaState.panels[0].id);local.state='partial';local.features['horror-feature-mask-face']={mode:'on',weight:1,parameters:{}}}
   if(scenario==='weighted-intensity'){set(a,'horror-feature-glowing-eyes',1.7,{intensity:'high'});a.intensity='low'}
   if(scenario==='replace-exclude'){a.originalFeaturePolicies={'detail:skinColor:tan skin':{mode:'replace',featureRef:'horror-feature-gray-skin'}};bb.state='partial';bb.originalFeaturePolicies={'detail:skinColor:tan skin':{mode:'exclude'}}}
   for(const model of ['standard','illustrious','anima','sdxl','noobai','pony','krea'])for(const separation of ['none','standard','strong']){modelFamily=model;subjectSeparationMode=separation;generate();generateManga();rows.push({scenario,model,separation,normal:$('positive').value,negative:$('negative').value,manga:$('mangaPositive').value,mangaNegative:$('mangaNegative').value,panels:[...$('mangaIndividual').querySelectorAll('textarea')].map(x=>x.value),resolved:{normal:['person:original-sep-a','person:original-sep-b','creature:sep-c'].map(ref=>hResolved(ref).tokens.map(hWeighted)),panels:mangaState.panels.slice(0,2).map(panel=>['person:original-sep-a','person:original-sep-b','creature:sep-c'].map(ref=>hResolved(ref,panel).tokens.map(hWeighted)))},sourcesUnchanged:source===hCanonical({profiles,creatures,originalCharacters})})}
  }return rows;
 });
 const tags=['mask-like face','gray skin','long fingers','intensely glowing eyes'];
 const expected={
  'A-only':[['mask-like face'],[],[]],
  'B-only':[[],['gray skin'],[]],
  'different-A-B':[['mask-like face'],['gray skin'],[]],
  'person-creature':[['mask-like face'],[],['long fingers']],
  'panel-normal':[['mask-like face'],[],[]],
  'local-overrides-global':[[],[],[]],
  'weighted-intensity':[['mask-like face','(intensely glowing eyes:1.7)'],[],[]],
  'replace-exclude':[['mask-like face','gray skin'],[],[]]
 };
 for(const scenario of [...new Set(observations.map(r=>r.scenario))]){let error=null;const rows=observations.filter(r=>r.scenario===scenario);try{assert.equal(rows.length,21);for(const row of rows){assert.equal(row.sourcesUnchanged,true);assert.equal(row.panels.length,2);assert.ok(!row.negative.includes('mask-like face'));assert.ok(!row.mangaNegative.includes('mask-like face'));
   assert.deepEqual(row.resolved.normal,expected[scenario]);
   if(row.separation!=='none'){const pieces=row.normal.split(/(?:Character|Creature) [A-Z1-6]:/);assert.equal(pieces.length,4);for(let actor=0;actor<3;actor++)for(const tag of tags)if(!expected[scenario][actor].some(t=>t.includes(tag)))assert.ok(!pieces[actor+1].includes(tag),`${scenario}/${row.model}/${row.separation}: wrong normal actor ${actor} ${tag}`)}
   for(let i=0;i<2;i++){const text=row.panels[i],wanted=expected[scenario].map(x=>[...x]);if(scenario==='local-overrides-global'&&i===0)wanted[0]=['mask-like face'];if(scenario==='panel-normal'&&i===1)wanted[0]=[];assert.deepEqual(row.resolved.panels[i],wanted);for(let actor=0;actor<3;actor++){const label=['Character A:','Character B:','Creature A:'][actor];const blocks=[...text.matchAll(new RegExp(label+'(.*?)(?=Character [A-Z](?=:|,|$)|Creature [A-Z](?=:|,|$)|, panel [0-9]|$)','g'))].map(m=>m[1]);assert.ok(blocks.length,`${scenario} missing ${label}`);for(const tag of tags)if(!wanted[actor].some(t=>t.includes(tag)))assert.ok(blocks.every(block=>!block.includes(tag)),`${scenario}/${row.model}/${row.separation}: wrong panel actor ${actor} ${tag}`)}
    for(const expected of row.resolved.panels[i].flat())assert.ok(text.includes(expected),`${scenario} missing ${expected}`);
    if((scenario==='panel-normal'&&i===1)||(scenario==='local-overrides-global'&&i===1))assert.ok(!text.includes('mask-like face'),`${scenario} leaked into normal panel`)
   }
   if(scenario==='B-only')assert.deepEqual(row.resolved.normal[0],[]);if(scenario==='A-only')assert.deepEqual(row.resolved.normal[1],[]);
   if(scenario==='weighted-intensity')assert.ok(row.normal.includes(':1.7)'));
   if(scenario==='replace-exclude'){assert.ok(!row.panels.some(text=>text.includes('tan skin')));assert.ok(row.panels.every(text=>text.includes('gray skin')))}
  }}catch(e){error=e.stack}result.tests.push({id:'P'+String(result.tests.length+1).padStart(2,'0'),scenario,passed:!error,rows:rows.length,error});console.log(error?'FAIL':'PASS',scenario);}
 assert.deepEqual(errors,[]);result.passed=result.tests.every(t=>t.passed);result.fullTextRows=observations.length;result.normalExplicitAttributionRows=observations.filter(r=>r.separation!=='none').length;result.separationNoneLimitation='Existing none mode emits a shared list; actor resolver isolation is tested but explicit normal actor blocks are intentionally absent.';fs.writeFileSync(path.join(root,'fulltext.json'),JSON.stringify(observations,null,2));fs.writeFileSync(path.join(root,'results.json'),JSON.stringify(result,null,2));if(!result.passed)process.exitCode=1;
 }finally{await c.close();await b.close()}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
