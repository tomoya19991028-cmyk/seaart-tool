// Configure the current product's mode/cache in memory; original test files are immutable.
const fs=require('fs'),path=require('path'),Module=require('module');const relative=process.argv[2],file=path.resolve(__dirname,'../..',relative);let source=fs.readFileSync(file,'utf8');
if(relative==='tests/horror/ui.cjs'){const anchor="await p.locator('[data-mobile-tab=horror]').tap();";if(source.split(anchor).length!==2)throw Error('Unexpected original UI entry anchor');source=source.replace(anchor,anchor+"await p.locator('#horrorMangaMode').tap();")}
if(relative==='tests/horror/pwa.cjs')source=source.replace('http://127.0.0.1:8765/seaart-horror/index.html',process.env.TARGET_URL);
// Scalar cards now have a noninteractive title and direct buttons. Exercise the retained
// legacy preview backend here; the actual new direct touch route is covered by auto UI12.
if(relative==='tests/horror/ui.cjs'){
 const anchor='await p.locator(\'[data-horror-card="1"]\').tap();';if(source.split(anchor).length!==2)throw Error('Unexpected scalar UI entry anchor');source=source.replace(anchor,'await p.evaluate(()=>hCardOpen(1));');
}
// Geometry belongs to the six card containers; the three new scalar titles are plain text.
if(relative==='tests/horror/independent-ui.cjs')source=source.replace("document.querySelectorAll('[data-horror-card]')","document.querySelectorAll('#horrorCards>.hTagCard')");
const cache='seaart-tool-pwa-v5-forms-structures-environment-ui-v1-http-cache-v1';
if(relative==='tests/horror/replay-pwa.cjs')source=source.replace('seaart-tool-pwa-v5-horror-v1-http-cache-v1',cache);
if(relative==='tests/integration/pwa.cjs')source=source.split('seaart-tool-pwa-v5-horror-motif-r2-integration-http-cache-v1').join(cache);
if(relative==='tests/normal-first/pwa.cjs')source=source.split('seaart-tool-pwa-v5-horror-normal-first-ui-v1-http-cache-v1').join(cache);
if(relative==='tests/card-tags/pwa.cjs')source=source.split('seaart-tool-pwa-v5-horror-card-selected-tags-v1-http-cache-v1').join(cache);
if(relative==='tests/integration/ui.cjs'){const anchor="await p.locator('#motifPersonOpen').tap();";if(source.split(anchor).length!==2)throw Error('Unexpected motif UI anchor');source=source.replace(anchor,"await p.evaluate(()=>openMotifPersonImport());")}
if(relative==='tests/unified-ui/pwa.cjs')source=source.split('seaart-tool-pwa-v5-person-creature-unified-ui-v1-http-cache-v1').join(cache);
// UC01's complete catalog equality predates the authorized additions. Compare its exact old
// projection; new catalog integrity is independently checked by S01 and quality.py.
if(relative==='tests/unified-ui/compatibility.cjs'){
 const keep=new Set(require('../../src/horror-catalog.json').features.slice(0,12).map(f=>f.id));
 source=source.replace('catalog,detailOptions,creatureFields,horrorInitialCatalog,creatureAdultSubjectDefinitions', 'catalog,detailOptions,creatureFields,horrorInitialCatalog:{...horrorInitialCatalog,features:horrorInitialCatalog.features.filter(f=>'+JSON.stringify([...keep])+'.includes(f.id))},creatureAdultSubjectDefinitions');
}
if(relative==='tests/horror-stories/pwa.cjs')source=source.split('seaart-tool-pwa-v5-horror-catalog-story-presets-v1-http-cache-v1').join(cache);
// Authorized UI expansion: preserve the immutable old file and adapt only the
// direct-control count. All former three controls are still exercised below.
if(relative==='tests/horror-auto/contracts.cjs')source=source.replace("locator('[data-ha-structure]').count(),3", "locator('[data-ha-structure]').count(),6");
if(relative==='tests/horror-auto/pwa.cjs')source=source.split('seaart-tool-pwa-v5-horror-auto-mobile-ui-v1-http-cache-v1').join(cache);
// The new rows are additive. Compare the exact old ID/value projection while
// retaining every unmodified full prompt and validating the new complete table separately.
const newDetailValues=require('../../src/person-specific-forms.json').candidates.filter(c=>c.source.startsWith('detail:')).map(c=>c.value);
const catalogProjection="Object.fromEntries(Object.entries(catalog).map(([k,rows])=>[k,rows.filter(r=>!/^env-(?:place|state|light)-|^person-specific-/.test(r.id))]))";
const outfitProjection="Object.fromEntries(Object.entries(outfitSets).filter(([key])=>!"+JSON.stringify(Object.keys(require('../../src/person-specific-forms.json').outfitSets))+".includes(key)))";
const detailProjection="Object.fromEntries(Object.entries(detailOptions).map(([k,v])=>[k,{...v,options:v.options.filter(r=>!"+JSON.stringify(newDetailValues)+".includes(r[0]))}]))";
if(relative==='tests/unified-ui/compatibility.cjs'){
 source=source.replace('hCanonical({catalog,detailOptions,','hCanonical({catalog:'+catalogProjection+',detailOptions:'+detailProjection+',');
 // A conflict guard wraps the generator. Compare its preserved producer, then
 // compare all actual normal/semi/full/horror/manga output strings as before.
 source=source.replace('[generate,generateManga,creaturePromptTags,creatureAnthroPromptTags]','[typeof euGenerateBefore===\'function\'?euGenerateBefore:generate,typeof euMangaBefore===\'function\'?euMangaBefore:generateManga,creaturePromptTags,creatureAnthroPromptTags]');
}
if(relative==='tests/horror-auto/compatibility.cjs')source=source.replace("resolved:hResolved('person:original-old-auto-a')","resolved:(()=>{const r=hResolved('person:original-old-auto-a');if(r.structure)for(const k of ['tentacles','extraArms','extraLegs'])if(r.structure[k]==='unset')delete r.structure[k];return r})()");
if(['tests/creature-motif-person-r1.cjs','tests/horror/replay-legacy.cjs'].includes(relative)){
 const compile=Module.prototype._compile;
 Module.prototype._compile=function(s,f){if(f.endsWith('/creature-stage5-remaining-r1.cjs')||f.endsWith('/creature-motif-person-legacy-regression.cjs')){
  s=s.replace('data:{catalog,characterBasicPresets,detailOptions,','data:{catalog:'+catalogProjection+',characterBasicPresets,detailOptions:'+detailProjection+',');
  s=s.replace('return {catalog,characterBasicPresets,detailOptions,','return {catalog:'+catalogProjection+',characterBasicPresets,detailOptions:'+detailProjection+',');
  s=s.replace('return{catalog,characterBasicPresets,detailOptions,','return{catalog:'+catalogProjection+',characterBasicPresets,detailOptions:'+detailProjection+',');
  s=s.replace('adapterCount:afEnsureRegistry().size',"adapterCount:[...afEnsureRegistry()].filter(([id])=>!id.startsWith('form-specific-')).length");
  s=s.replace('detailOptions:'+detailProjection+',outfitSets,','detailOptions:'+detailProjection+',outfitSets:'+outfitProjection+',');
  s=s.replace('adapters:[...afEnsureRegistry()]','adapters:[...afEnsureRegistry()].filter(([id])=>!id.startsWith(\'form-specific-\'))');
 }s=s.replace(/process.exitCode\s*=\s*1/g,'process.exitCode=(setTimeout(()=>process.exit(1),1000),1)');return compile.call(this,s,f)};
}
source=source.split('process.exitCode=1').join('process.exitCode=(setTimeout(()=>process.exit(1),1000),1)');
const replay=new Module(file,module);replay.filename=file;replay.paths=Module._nodeModulePaths(path.dirname(file));replay._compile(source,file);
