// Resolve derived features without writing selections or rewriting the 84 manual definitions.
const haTypes=new Map(horrorAutoDefinitions.types.map(type=>[type.id,type]));
const haVirtual=new Map();
const haPartNames={wings:'翼',horns:'角',tail:'尻尾',tentacles:'触手',extraArms:'追加腕',extraLegs:'追加脚'};
for(const type of haTypes.values())for(const state of ['partial','complete']){
 const scope=state==='partial'?'部分':'全身';
 const body={id:'horror-auto-'+type.id.slice(12)+'-body-'+state,label:scope+type.label+'化',tag:type.body[state],group:'四肢・体型',structure:{},conflict:'horror-auto-body',material:type.material,applicableStates:[state],revision:1,continuity:'persistent'};haVirtual.set(body.id,body);
 for(const [part,tags]of Object.entries(type.structures)){const def={id:'horror-auto-'+type.id.slice(12)+'-'+part+'-'+state,label:type.label+'の'+haPartNames[part]+'（'+scope+'）',tag:tags[state],group:['tentacles','extraArms','extraLegs'].includes(part)?'四肢・体型':'翼・角・尻尾',structure:{[part]:'present'},material:type.material,applicableStates:[state],revision:1,continuity:'persistent'};haVirtual.set(def.id,def)}
}
for(const trait of horrorAutoDefinitions.traits)haVirtual.set(trait.id,{...trait,structure:{},applicableStates:trait.states,revision:1,continuity:'persistent'});
const haFeatureBefore=hFeature;
hFeature=function(id){return haFeatureBefore(id)||haVirtual.get(id)||null};
const haContextBefore=hContext;
hContext=function(ref,panel=null){const c=haContextBefore(ref,panel),local=panel?c.manga?.byPanel[panel.id]?.byActor[ref]:null;if(c.actor?.autoFeatures||local?.autoFeatures||Object.keys(c.actor?.features||{}).some(id=>haVirtual.has(id))||Object.keys(local?.features||{}).some(id=>haVirtual.has(id)))c.definitions=[...c.definitions,...haVirtual.values()];return c};
function haPolicy(actor,local=null){
 const base=actor?.autoFeatures,own=local?.autoFeatures;
 return {enabled:own?.mode==='on'?true:own?.mode==='off'?false:base?.enabled===true,excludedIds:own?.mode==='on'?[...own.excludedIds]:[...new Set([...(base?.excludedIds||[]),...(own?.excludedIds||[])])],mode:own?.mode||'inherit'};
}
function haNormalized(tag){const match=String(tag).match(/^\((.*):[\d.]+\)$/s);return (match?match[1]:String(tag)).trim().toLowerCase().replace(/\s+/g,' ')}
function haMaterial(id,tag=''){
 if(haVirtual.has(id))return haVirtual.get(id).material||null;
 if(/spectral|ghostly|ghost/.test(tag))return 'spectral';if(/shadow|dark vapor/.test(tag))return 'shadow';if(/curs|posses/.test(tag))return 'cursed';if(/artificial|mechanical/.test(tag))return 'artificial';
 if(/wings?|horns?|tail|tentacles?|extra arms|four arms|extra legs|kagune|kakuja|scales|ceramic|chitin/.test(tag))return 'organic';return null;
}
function haIncompatible(a,b){if(!a||!b||a===b||a==='cursed'||b==='cursed')return false;return (['spectral','shadow'].includes(a)&&['organic','artificial'].includes(b))||(['organic','artificial'].includes(a)&&['spectral','shadow'].includes(b))}
function haProposals(context,manual){
 const actor=context.actor,local=context.panel?context.manga?.byPanel[context.panel.id]?.byActor[context.actorRef]:null,policy=haPolicy(actor,local),state=manual.state;
 if(!policy.enabled||state==='normal')return {policy,entries:[],conflicts:[],reasons:[]};
 const primary=haTypes.get(actor.primaryTypeId),out=[],reasons=[],conflicts=[],seen=new Set(),strength={low:1,medium:1.2,high:1.4}[actor.intensity]||1.2;
 if(!primary){if(actor.primaryTypeId)conflicts.push('自動特徴の主種類に対応する定義がありません');else reasons.push('自動特徴には主種類を選択してください');return {policy,entries:[],conflicts,reasons}}
 const defs=new Map(context.definitions.map(f=>[f.id,f])),manualIds=new Set(manual.tokens.map(t=>t.featureId)),manualTags=new Set(manual.tokens.map(t=>haNormalized(t.tag))),keptSources=(context.sources||[]).filter(s=>!manual.removals.includes(s.sourceRef));
 const add=(id,weight=1,part=null)=>{
  if(seen.has(id))return;seen.add(id);const f=defs.get(id)||haVirtual.get(id);if(!f){conflicts.push('自動特徴の候補定義が不明です: '+id);return}
  const entry={id,label:f.label,group:f.group,part,tag:f.intensityTags?.[actor.intensity]||f.tag,weight:Number((strength*weight).toFixed(1)),definition:f,status:'active'};
  if(policy.excludedIds.includes(id))entry.status='excluded';
  else if(local?.features[id]?.mode==='off'||(!local?.features[id]||local.features[id].mode==='inherit')&&actor.features[id]?.enabled===false)entry.status='manual-off';
  else if(manualIds.has(id)||manualTags.has(haNormalized(entry.tag))||keptSources.some(s=>haNormalized(s.value)===haNormalized(entry.tag)))entry.status='manual';
  if(entry.status==='active'&&part){const manualParts=manual.tokens.filter(t=>hFeature(t.featureId)?.structure?.[part]==='present'),sourceParts=keptSources.filter(s=>s.structure===part),others=[...manualParts.map(t=>({id:t.featureId,tag:t.tag,label:hFeature(t.featureId)?.label})),...sourceParts.map(s=>({id:null,tag:s.value,label:'元特徴 '+s.value}))];
   for(const other of others)if(haIncompatible(f.material,haMaterial(other.id,other.tag)))conflicts.push('自動 '+f.label+'と'+other.label+'の材質・形態が競合しています');
   if(others.length&&!conflicts.some(message=>message.includes(f.label)))entry.status='manual';
  }
  if(entry.status==='active'&&id.includes('-body-')&&haVirtual.has(id))for(const token of manual.tokens)if(token.featureId!==id&&haVirtual.has(token.featureId)&&token.featureId.includes('-body-'))conflicts.push('自動 '+f.label+'と固定済み '+hFeature(token.featureId).label+'の身体の種類が競合しています');
  if(entry.status==='active'&&!part&&haVirtual.has(id)&&state==='complete'&&['spectral','shadow'].includes(f.material))for(const t of manual.tokens)if(['horror-feature-ceramic-skin','horror-feature-chitin-seams','horror-feature-glass-scales'].includes(t.featureId))conflicts.push('自動 '+f.label+'と手動 '+hFeature(t.featureId).label+'の身体材質が競合しています');
  out.push(entry);
 };
 add('horror-auto-'+primary.id.slice(12)+'-body-'+state);for(const id of primary.primary[state])add(id);
 for(const typeId of actor.secondaryTypeIds){const type=haTypes.get(typeId);if(!type){conflicts.push('自動特徴の補助種類に対応する定義がありません');continue}for(const id of type.secondary)add(id,.8)}
 for(const trait of horrorAutoDefinitions.traits)if(trait.typeId===primary.id&&trait.states.includes(state))add(trait.id);
 const structure={...actor.structure,...local?.structure};for(const part of Object.keys(haPartNames))if(structure[part]==='present')add('horror-auto-'+primary.id.slice(12)+'-'+part+'-'+state,1,part);
 return {policy,entries:out,conflicts,reasons};
}
const haResolveBefore=resolveHorrorActor;
resolveHorrorActor=function(context){
 const local=context.panel?context.manga?.byPanel[context.panel.id]?.byActor[context.actorRef]:null;
 if(haPolicy(context.actor,local).enabled||Object.keys(context.actor?.features||{}).some(id=>haVirtual.has(id))||Object.keys(local?.features||{}).some(id=>haVirtual.has(id)))context={...context,definitions:[...new Map([...(context.definitions||hDefinitions()).map(f=>[f.id,f]),...haVirtual]).values()]};
 const manual=haResolveBefore(context);
 if(!context.actor||!haPolicy(context.actor,local).enabled)return manual;
 // Ownership and ordinary state suppression remain the original resolver's authority.
 if(manual.conflicts.includes('対象の所有者が一致しません'))return manual;
 const plan=haProposals(context,manual),active=plan.entries.filter(e=>e.status==='active'),features={...context.actor.features},manualIds=new Set(manual.tokens.map(t=>t.featureId));
 // A manually fixed derived body/structure retains its generated slot, without reordering the 84 manual candidates.
 for(const e of plan.entries)if(e.status==='active')features[e.id]={enabled:true,weight:e.weight,parameters:{intensity:context.actor.intensity}};else if(e.status==='manual'&&haVirtual.has(e.id)&&manualIds.has(e.id))features[e.id]=hCopy(manual.effective[e.id]);
 const resolved=active.length||plan.entries.some(e=>e.status==='manual'&&haVirtual.has(e.id)&&manualIds.has(e.id))?haResolveBefore({...context,actor:{...context.actor,features}}):manual;
 const tokens=[],seen=new Set();for(const token of resolved.tokens){const key=haNormalized(token.tag);if(seen.has(key))continue;seen.add(key);tokens.push({...token,origin:manualIds.has(token.featureId)?'manual':'auto'})}
 return {...resolved,tokens,effective:manual.effective,auto:plan,conflicts:[...new Set([...resolved.conflicts,...plan.conflicts])],reasons:[...new Set([...resolved.reasons,...plan.reasons])]};
};
const haDependencyBefore=hDependency;
hDependency=function(item){const d=haDependencyBefore(item);if(!d.valid)return d;const refs=hRefs(item),a=horrorState.byActor[refs.actorRef],local=horrorState.byManga[refs.mangaId]?.byPanel[refs.panelId]?.byActor[refs.actorRef];if(!a?.autoFeatures&&!local?.autoFeatures)return d;const value={...d.value,automatic:{version:horrorAutoDefinitions.version,primaryTypeId:a.primaryTypeId,secondaryTypeIds:a.secondaryTypeIds,base:a.autoFeatures||null,local:local?.autoFeatures||null,intensity:a.intensity}};return {...d,value,digest:afHash(hCanonical(value))}};

// Provenance is UI metadata, not a difference in shared manga appearance.
function haSemanticToken(token){const {origin,...value}=token;return value}
hSharedResolved=function(ref){const results=hVisiblePanels(ref).map(p=>hResolved(ref,p));if(!results.length)return {tokens:[],removals:[]};return {tokens:results[0].tokens.filter(t=>t.continuity==='persistent'&&results.every(r=>r.tokens.some(v=>hEqual(haSemanticToken(t),haSemanticToken(v))))),removals:[...new Set(results.flatMap(r=>r.removals))]}};
