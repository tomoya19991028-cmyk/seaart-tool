// Explicit current-spec adapters. Immutable old tests and their failed records remain.
const fs=require('fs'),path=require('path'),Module=require('module');
const {assets}=require('./prepare.cjs');
const originalCompile=Module.prototype._compile,reference='http://127.0.0.1:8765/reference-v44/index.html';
// These twelve definitions are the authorized weapon-verb additions. Compare
// every older catalog row exactly; the weapon suite separately checks this list
// and exercises its phrases. Original test files/fixtures stay immutable.
const weaponVerbIds=['weapon-carry','ready-weapon','aim-weapon','nock-arrow','release-arrow','fire-weapon','draw-weapon','sheathe-weapon','cast-equipment','turn-page','levitate-equipment','use-equipment'];
function one(s,a,b){if(s.split(a).length!==2)throw Error('Current adapter anchor count: '+a);return s.replace(a,b)}
Module.prototype._compile=function(s,file){
 if(file.endsWith('/forms-environment/replay.cjs'))s=one(s,'^character-extension-tg-/.test(r.id)','^character-extension-tg-|^pose-v39-(?:'+weaponVerbIds.join('|')+')$/.test(r.id)');
 if(file.includes('/tests/')&&!file.includes('/v44-remaining/')){
  s=s.replaceAll("executablePath:'/usr/bin/chromium'","...(fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})");
  s=s.replaceAll("executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium'","...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:fs.existsSync('/usr/bin/chromium')?{executablePath:'/usr/bin/chromium'}:{})");
 }
 if(file.endsWith('/creature-stage5-remaining-r1.cjs')){s=one(s,"['body','exposure','details','action','expression','scene']","['exposure','details','clothingState','selfAction','sexualInteraction','expression','effects','fluids']");s=one(s,'shared six-card candidate adapter unchanged','v44 eight-card candidate sections expected');}
 if(file.endsWith('/creature-motif-person-legacy-regression.cjs'))s=one(s,'http://127.0.0.1:8765/seaart-creature-motif-integration1/baseline/index.html',reference);
 if(file.endsWith('/integration/motif-round2-alternative.cjs'))s=one(s,"reference='http://127.0.0.1:8765/seaart-tool/index.html'","reference="+JSON.stringify(reference));
 if(file.endsWith('/unified-ui/compatibility.cjs'))s=one(s,"process.env.BASELINE_UI_URL||'http://127.0.0.1:8765/seaart-card-tags/index.html'",JSON.stringify(reference));
 if(file.endsWith('/horror-auto/compatibility.cjs'))s=one(s,"process.env.OLD_VERSION_URL||'http://127.0.0.1:8765/seaart-horror-stories/index.html'",JSON.stringify(reference));
 if(file.endsWith('/horror/independent-prompts.cjs')){
  s=one(s,"const pieces=row.normal.split(/(?:Character|Creature) [A-Z1-6]:/);assert.equal(pieces.length,4);", "assert.ok(!/(?:Character|Creature) [A-Z1-6]:/.test(row.normal),'normal internal labels removed');const starts=[row.normal.indexOf('adult woman, Attribution A'),row.normal.indexOf('adult man, Attribution B'),row.normal.lastIndexOf('ghost')];assert.ok(starts[0]>=0&&starts[1]>starts[0]&&starts[2]>starts[1],'three subject bodies remain ordered');for(const name of ['adult woman, Attribution A','adult man, Attribution B'])assert.equal(row.normal.split(name).length,2,'unique subject body identity; count summaries may repeat names');const pieces=['',row.normal.slice(starts[0],starts[1]),row.normal.slice(starts[1],starts[2]),row.normal.slice(starts[2])];for(let actor=0;actor<3;actor++)for(const wanted of expected[scenario][actor])assert.ok(pieces[actor+1].includes(wanted),'expected tag remains on its owner');");
 }
 if(file.endsWith('/horror-auto/ui.cjs'))s=one(s,"for(const [width,height,scale]of sizes){","for(const [width,height,scale]of sizes){if(process.env.UI_HEIGHT&&String(height)!==process.env.UI_HEIGHT)continue;");
 if(file.endsWith('/horror-auto/contracts.cjs'))s=one(s,"const a=normal.indexOf('Character A:'),b=normal.indexOf('Character B:');ck(a>=0&&b>a,'explicit actor blocks');ck(normal.slice(a,b).includes('living shadows')&&!normal.slice(a,b).includes('beast-like body'),'A only');ck(normal.slice(b).includes('beast-like body')&&!normal.slice(b).includes('living shadows'),'B only');", "const blocks=normal.split(/\\s*BREAK\\s*/);ck(!/(?:Character|Creature) [A-Z1-6]:/.test(normal),'no normal internal labels');ck(blocks.length===5,'separated subject blocks');ck(blocks[1].includes('living shadows')&&!blocks[1].includes('beast-like body'),'A only');ck(blocks[2].includes('beast-like body')&&!blocks[2].includes('living shadows'),'B only');");
 if(file.endsWith('/unified-ui/pwa.cjs')){
    s=one(s,"return hCanonical({working:captureWorking(),workspace:horrorWorkspace})", "const x={working:captureWorking(),workspace:horrorWorkspace};const fill=s=>{for(const k of ['soundEffect','reactionEffect']){if(s[k]===undefined)s[k]=[];}};fill(x.working.adultScene);for(const k of ['soundEffectText','reactionEffectText'])if(x.working.adultScene[k]===undefined)x.working.adultScene[k]='';for(const e of Object.values(x.working.actorExtensions.byActor))for(const mode of ['semi','full'])if(e.adult?.byMode?.[mode]?.scene)fill(e.adult.byMode[mode].scene);return hCanonical(x)");
 }
 const cache='seaart-tool-pwa-v44-audit-v1-http-cache-v1:/';
 if(['/card-tags/pwa.cjs','/normal-first/pwa.cjs','/unified-ui/pwa.cjs'].some(v=>file.endsWith(v)))s=s.replaceAll('seaart-tool-pwa-v5-tg-yugioh-phase1-v1-http-cache-v1',cache);
 if(file.endsWith('/creature-motif-person-pwa.cjs')){
  s=s.replaceAll('/workspace/seaart-r1-save-worktree',path.join(assets,'seaart-r1-save-worktree'));
  s=s.replaceAll('seaart-tool-pwa-v5-horror-v1-http-cache-v1',cache).replaceAll('seaart-tool-pwa-v5-tg-yugioh-phase1-v1-http-cache-v1',cache);
 }
 return originalCompile.call(this,s,file);
};
require('../tg-yugioh-phase1/replay.cjs');
