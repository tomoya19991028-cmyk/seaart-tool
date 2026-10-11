// Reuse immutable attribution assertions with two API-created round-2 people.
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.join(__dirname,'../horror/independent-prompts.cjs');let source=fs.readFileSync(file,'utf8');
const start=source.indexOf("  originalCharacters=["),end=source.indexOf("hSetActor('person:original-sep-a'",start);if(start<0||end<0)throw Error('Unexpected prompt fixture anchors');
const seed=`
 restoreCreatures([{id:'sep-c',name:'Attribution Creature',species:'ghost',features:['tail']}]);applyActorForm('creature:sep-c');setCreatureRepresentation('creature:sep-c','semi');
 const appearance=anthroBlankAppearance();appearance.hair={primary:'blue hair',secondary:'',mode:'single'};appearance.outfit=['casual clothes'];appearance.detail.upper=['shirt'];updateCreatureAnthro('creature:sep-c','semi',appearance,anthroDefaultInheritance('semi'));persist();clearTimeout(workingSaveTimer);
 for(const [suffix,name,type]of [['000000000001','Attribution A','adult woman'],['000000000002','Attribution B','adult man']]){
  const random=crypto.randomUUID.bind(crypto);let once=true;crypto.randomUUID=()=>once?(once=false,'00000000-0000-4000-8000-'+suffix):random();
  try{const preview=mfImportPreview('sep-c','semi'),id=mfCreatePerson(preview,Object.keys(preview.groups).filter(k=>preview.groups[k].available),name,type);profiles[id].detail??={};profiles[id].detail.skinColor=['tan skin']}finally{crypto.randomUUID=random}
 }
 renderProfiles();renderCreatures();mangaState=normalizeManga({count:2});
 `;
source=source.slice(0,start)+seed+source.slice(end);
source=source.split('original-sep-a').join('original-motif-00000000-0000-4000-8000-000000000001').split('original-sep-b').join('original-motif-00000000-0000-4000-8000-000000000002');
const replay=new Module(file,module);replay.filename=file;replay.paths=Module._nodeModulePaths(path.dirname(file));replay._compile(source,file);
