const base=require('../v44-audit/helpers.cjs');
async function fixture(page,kind='mixed'){
 return page.evaluate(kind=>{
  for(const d of document.querySelectorAll('dialog[open]'))d.close();
  if(!window.bgBlank)window.bgBlank=captureWorking();restoreWorking(afCopy(bgBlank));
  if(typeof environmentDesign!=='undefined')environmentDesign=undefined;
  selected.character=[];originalCharacters=[];profiles={};creatures=[];actorExtensions={version:4,byActor:{}};horrorState=horrorEmptyState();
  for(const k of ['composition','background','weather','time','lighting','mood'])selected[k]=[];
  $('extra').value='';$('customCharacter').value='';$('colorStyle').value='';renderingExpressions=[];scene={relation:[],composition:[],extra:''};
  if(kind!=='empty'&&kind!=='creature'){
   originalCharacters=[{id:'original-environment-hero',name:'Environment hero',type:'adult woman'}];
   const p=profiles['original-environment-hero']={hairPrimary:catalog.hairColor.find(r=>r.value==='blue hair').id,detail:{weapon:['bow'],effect:['ice magic']}};
   waApplyPreset(p,'bow','bow-aim');
  }
  if(kind==='mixed'||kind==='creature'||kind==='human')creatures=normalizeCreatures([{id:'creature-environment-wolf',name:'Forest companion',species:'wolf',color:'red',actions:['standing']}]);
  if(profiles['original-environment-hero']&&creatures.length)profiles['original-environment-hero'].poseActions[0].aim={kind:'creature',id:'creature-environment-wolf'};
  renderProfiles();renderCreatures();mangaState=normalizeManga();mangaState.count=2;renderManga();hEnsureManga();
  if(typeof bdUI!=='undefined'){bdUI.index=null;bdUI.panelId=null;bdUI.pending={};bdUI.filter='all';bdUI.query='';bdUI.limit=48}
  showMobileTab('choices');choicePage=0;layoutChoices();clearTimeout(workingSaveTimer);undoHistory.splice(0);$('undoOpen').disabled=true;
  return {working:captureWorking(),actors:subjectActors().map(a=>({id:a.id,kind:a.kind}))};
 },kind);
}
async function layers(page,view='landscape-only'){
 return page.evaluate(view=>{
  const ref=id=>bdRef(item('background',id));environmentDesign={version:1,shared:true,layers:{foreground:[ref('bd-object-flowers')],middle:[ref('background-31'),ref('bd-object-boat')],distant:[ref('background-27')]},view,effects:{'screen-bloom':{strength:'weak'}}};
  selected.lighting=['lighting-11','lighting-environment-moonlight'];clearTimeout(workingSaveTimer);
 },view);
}
module.exports={...base,fixture,layers};
