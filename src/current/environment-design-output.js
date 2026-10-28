// Resolve a complete drawing plan without touching selected/profiles/Creature
// state. Legacy output paths use this only after an explicit new setting.
function bdEffectPhrase(id,setting){
 const row=bdEffectRow(id),def=bdEffectDef(id);if(!row||!row.value)return '';
 let text=def?.alias?.startsWith('color:')&&row.value===def.value&&(bdPaletteAliases[def.alias.slice(6)]||[]).includes(setting.value)?setting.value:row.value;
 if(['screen-film-grain','screen-noise'].includes(id)&&setting.grain){if(id==='screen-noise'&&text==='fine image noise')text='image noise';text=({fine:'fine ',medium:'medium-sized ',coarse:'coarse '}[setting.grain])+text}
 if(def?.strength&&setting.strength)text=({weak:'subtle ',medium:'moderate ',strong:'pronounced '}[setting.strength])+text;
 const scope=def?.scope==='foreground'?'foreground':def?.scope==='background'?'background':def?.scope==='flex'?(setting.scope||'all'):'all';
 if(scope==='foreground'&&!['screen-foreground-bokeh'].includes(id))text+=' concentrated in the foreground';
 if(scope==='background'&&!['screen-background-blur','screen-background-flow'].includes(id))text+=' concentrated in the background';
 if(id==='screen-background-blur'&&scope==='background')text+=' with the background out of focus';
 return text;
}
function bdPlan(panel=null){
 const effective=bdEffective(panel),active=bdHasDesign(),warnings=[...bdConflictMessages(effective)],layers=effective.background.layers||{},layerIds=new Set(),background=[];
 for(const [layer,refs]of Object.entries(layers)){for(const ref of refs){const row=bdResolveRef(ref);if(!row){warnings.push((ref.name||'背景候補')+'は参照先が見つかりません');continue}layerIds.add(row.id);const density={sparse:'sparse ',normal:'',dense:'dense '}[ref.density]||'',role={foreground:'in the foreground',middle:'in the middle distance',distant:'in the distant background'}[layer];background.push(density+row.value+' '+role)}}
 const flat=[];for(const ref of effective.background.selected){const row=bdResolveRef(ref);if(!row){warnings.push((ref.name||'背景候補')+'は参照先が見つかりません');continue}if(layerIds.has(row.id)){warnings.push('共通背景「'+row.name+'」と層の指定が重複しています。層の指定を優先して出力します');continue}flat.push(weighted(({sparse:'sparse ',normal:'',dense:'dense '}[ref.density]||'')+row.value,'background'))}
 background.unshift(...flat,...(effective.background.text||[]));
 const landscapeOnly=effective.view==='landscape-only',composition=[],effects=[],ownedComposition=new Set(),ownedColors=new Set(),existingFlow=selected.composition.includes('composition-67')&&item('composition','composition-67')?.value==='sharp face, directional motion blur in the background';
 for(const d of bdEffectDefs)if(d.alias?.startsWith('color:'))for(const value of bdPaletteAliases[d.alias.slice(6)]||[])ownedColors.add(value);
 for(const [id,setting]of Object.entries(effective.effects)){
  const def=bdEffectDef(id),row=bdEffectRow(id);if(!row){warnings.push((setting.name||'保存済みの画面効果')+'の参照先が見つかりません');continue}
  const alias=!setting.standalone&&def?.alias&&row.value===def.value?def.alias:null;
  if(alias?.startsWith('composition:'))ownedComposition.add(alias.slice(12));
  // A legacy compound retains its full text. Do not add another flow effect.
  if(id==='screen-background-flow'&&existingFlow&&!landscapeOnly&&!setting.replaceCompound){continue}
  if(alias?.startsWith('color:')&&!panel){continue}
  const text=bdEffectPhrase(id,setting);if(text)effects.push(alias?.startsWith('composition:')?explicitWeight(text,setting.weight??globalTagWeight('composition',def.value)):text);
 }
 for(const id of selected.composition){const row=item('composition',id);if(!row)continue;if(ownedComposition.has(id))continue;if(effective.view&&id==='composition-44'&&row.value==='environment-focused composition')continue;if(id==='composition-67'&&existingFlow&&(effective.effects['screen-background-flow']?.replaceCompound||(panel&&effective.effectsMode==='off'))){warnings.push('旧複合構図「顔は鮮明・背景に流れ」は保持し、この出力では使用しません');continue}if(panel&&id==='composition-21'&&(effective.effectsMode==='off'||effective.effectsMode==='custom'))continue;if(landscapeOnly&&bdCompositionNeedsSubject(row)){warnings.push('人物用の構図「'+row.name+'」は風景のみでは出力しません');continue}composition.push(weighted(row.value,'composition'))}
 if(effective.view)composition.push(explicitWeight([environmentDesign?.viewColor,bdViewTags[effective.view]].filter(Boolean).join(' '),environmentDesign?.viewWeight??(effective.view==='landscape'&&selected.composition.includes('composition-44')?globalTagWeight('composition','environment-focused composition'):1)));
 const channel=field=>(effective.background[field]||bdChannelRefs(field)).map(r=>bdResolveChannel(field,r)).filter(r=>{if(!r)warnings.push('コマの環境候補に参照先が見つからないものがあります');return !!r});
 const weather=channel('weather'),time=channel('time'),lighting=[];
 // Semantic IDs, not arbitrary text fragments, identify the old morning-mist
 // compound and the generic fog choice. Preserve independently edited English.
 const oldMist=effective.background.selected.map(bdResolveRef).find(r=>r?.id==='background-99'&&r.value==='morning mist');
 const weatherTags=weather.filter(r=>!(oldMist&&['fog','foggy','foggy weather','mist','light mist','morning mist'].includes(r.value))).map(r=>weighted(r.value,'weather'));
 for(const r of channel('lighting')){if(landscapeOnly&&bdSubjectLightStock[r.id]===r.value){warnings.push('人物由来の光「'+r.name+'」は風景のみでは出力しません');continue}lighting.push(weighted(r.value,'lighting'))}
 const styles=renderingStyleTags().filter(value=>!panel||!ownedColors.has(value));
 const result={active,panel,effective,landscapeOnly,background,weather:weatherTags,time:time.map(r=>weighted(r.value,'time')),lighting,composition,effects,styles,warnings:[...new Set(warnings)]};
 return result;
}
function bdCompositionNeedsSubject(row){return bdSubjectCompositionStock[row.id]===row.value}

function bdNegativeTags({manga=false,subjects=true,lettering=false}={}){
 let tags=selectedNegativeTags(manga,{subjects}).flatMap(splitTags);
 if(drawingIsMonochrome())tags=tags.filter(t=>!['monochrome','grayscale'].includes(t));
 if(lettering)tags=tags.filter(t=>!['text','speech bubble','speech bubbles','lettering'].includes(t.trim().toLowerCase()));
 if(manga)tags.unshift(...splitTags((drawingIsMonochrome()?'':'monochrome, grayscale, ')+'wrong panel count, missing panel, extra panel, merged panels, broken panel borders, '+(subjects?'fused bodies, merged characters, blended faces, inconsistent character appearance, duplicate limbs, ':'')+(lettering?'watermark, logo':'text, speech bubbles, lettering, watermark')));
 return [...new Set(tags)];
}
function bdNegativeOptionAllowed(row){return !new Set(['anatomy','hands','face','eyes','body','duplicate','people_fused','people_count','multiple_people','extra_people','missing_people','effect_face','panel_character']).has(row[0])&&!new Set(['人数・複数人','複数人物','人体・顔','手・指','顔・目','体・骨格','人物','人数','身体','手','衣装・装備']).has(negativeProblemGroupById[row[0]])}
function bdEnvironmentTags(plan){return [...plan.background,...plan.weather,...plan.time,...plan.lighting,...plan.composition,...plan.effects]}
function bdModelPrefix(plan){const actorQuality=new Set(['detailed face','detailed eyes','detailed hands','detailed clothing']);return modelPrefix().filter(tag=>!plan.landscapeOnly||!actorQuality.has(subjectWeightedValue(tag).value))}
function bdFreeTextNotice(plan){if(!plan.landscapeOnly)return [];const fields=[$('extra').value,scene.extra,scene.sceneExtra,plan.panel?.description].filter(x=>typeof x==='string'&&x.trim());const edited=Object.keys(plan.effective.effects).some(id=>{const row=bdEffectRow(id),def=bdEffectDef(id);return row&&(!def||row.value!==def.value)});return fields.length||edited?['風景のみでも自由入力・独自英文はそのまま出力します。人物の指示を含む場合は内容を確認してください']:[]}
function bdShowWarnings(plans){const warnings=[...new Set(plans.flatMap(p=>[...p.warnings,...bdFreeTextNotice(p)]))];let root=$('environmentOutputWarnings');if(!root){root=node('p',undefined,'hint');root.id='environmentOutputWarnings';root.setAttribute('role','status');$('storageStatus').after(root)}root.hidden=!warnings.length;root.textContent=warnings.join(' ／ ')}
function bdGenerateLandscape(plan){
 const extras=[$('extra').value,scene.extra,scene.sceneExtra].filter(v=>typeof v==='string'&&v.trim()).flatMap(splitTags),style=[...drawingArtTags(),...plan.styles],tags=[...bdModelPrefix(plan),...style,...bdEnvironmentTags(plan),...['background','weather','time','lighting','mood','extra'].flatMap(key=>maNormalTags(key)),...selected.mood.map(id=>item('mood',id)).filter(Boolean).map(r=>weighted(r.value,'mood')),...extras];
 $('positive').value=modelFamily==='krea'?['Landscape illustration.',...tags].join(' '):[...new Set(tags)].join(', ');$('negative').value=bdNegativeTags({subjects:false}).join(', ');resultEditing=false;resultView='text';$('manualEditNotice').classList.add('hidden');renderResultTags();$('status').textContent='風景のみのプロンプトを生成しました';bdShowWarnings([plan]);markGenerationFresh();
}
function bdGenerateManga(){
 renderManga();const panels=mangaState.panels.slice(0,mangaState.count),plans=panels.map(bdPlan),people=mangaPeople(),creatureActors=mangaCreatures(),drawing=mangaDrawingSettings(),present=panels.map((p,i)=>plans[i].landscapeOnly?[]:subjectActors({panel:p,panelIndex:i,adult:!!mangaState.storyAdult,scopedActions:true,compactRelations:true}));
 const visiblePeople=new Set(present.flat().filter(a=>a.kind==='character').map(a=>a.id)),visibleCreatures=new Set(present.flat().filter(a=>a.kind==='creature').map(a=>a.id)),pagePeople=people.filter(p=>visiblePeople.has(p.id)),pageCreatures=creatureActors.filter(c=>visibleCreatures.has(c.id));
 const identities=new Map(pagePeople.map(p=>{const index=people.findIndex(a=>a.id===p.id),tags=profileTags(profiles[p.id]||{},{subjects:false,poses:false,expressions:false,placement:false,damage:false});return [p.id,`Character ${String.fromCharCode(65+index)}: ${p.tag}`+(tags.length?', '+tags.join(', '):'')]}));
 const commonDrawing=drawing.tags.filter(t=>!bdEffectDefs.some(d=>d.alias?.startsWith('color:')&&(bdPaletteAliases[d.alias.slice(6)]||[]).includes(t))),sceneParts=[],perPanel=[];
 for(let i=0;i<panels.length;i++){
  const panel=panels[i],plan=plans[i],actors=present[i],ctx={panel,panelIndex:i,adult:!!mangaState.storyAdult,scopedActions:true,compactRelations:true},ps=people.filter(p=>actors.some(a=>a.kind==='character'&&a.id===p.id)),cs=creatureActors.filter(c=>actors.some(a=>a.kind==='creature'&&a.id===c.id));
  hMangaPanelContext(panel);
  const counts=plan.landscapeOnly?[]:[...(ps.length?[ps.length+(ps.length===1?' person':' people')]:[]),...(cs.length?[cs.length+(cs.length===1?' creature':' creatures')]:[])];
  const camera=plan.landscapeOnly&&Object.values(bdSubjectCompositionStock).includes(panel.camera)?'':panel.camera;
  const parts=[`panel ${i+1}`,...counts,camera,...bdEnvironmentTags(plan),...(!plan.landscapeOnly?mangaPanelStoryTags(panel,actors,ctx):[]),...actors.filter(a=>a.kind==='character').map(a=>mangaCharacterPresence(a,panel.people?.[a.id],ctx)),...cs.map(c=>mangaCreaturePresence(c,panel.creatures?.[c.id],true,ctx)),...actors.flatMap(a=>subjectActionTags(a,ctx)),...actors.flatMap(a=>subjectSettingTags(a,ctx)),...(!plan.landscapeOnly?subjectLegacyTags(ctx):[]),panel.mood,...(!plan.landscapeOnly?normalScenePrompt(false):splitTags(scene.sceneExtra||'')),panel.description,panel.bubble,panel.sound].filter(Boolean);
  if(ps.length>1)parts.push('distinct characters, separate bodies, distinct faces');if(cs.length>1)parts.push('distinct creatures, separate bodies');if(ps.length&&cs.length)parts.push('distinct people and creatures, separate bodies');
  const filtered=[...new Set(parts)];sceneParts.push(filtered.join(', '));
  const localIdentities=ps.map(p=>hConfigured()?hPanelPersonIdentity(p,identities.get(p.id),panel):identities.get(p.id)),localCreatures=cs.map(c=>hConfigured()?hPanelCreatureIdentity(c,panel):mangaCreatureIdentity(c));
  perPanel.push([...bdModelPrefix({landscapeOnly:!actors.length}),drawing.panel,...commonDrawing,...localIdentities,...localCreatures,...filtered,...(ps.length?['consistent character designs']:[]),...(cs.length?['consistent creature designs']:[])].join(', '));
 }
 if(hGenerationContext?.mode==='manga')hGenerationContext.panel=null;
 const hasLettering=panels.some(p=>p.bubble||p.sound),positive=[...bdModelPrefix({landscapeOnly:present.some(a=>!a.length)}),drawing.page,...commonDrawing,`${mangaState.format} page`,`exactly ${panels.length} clearly separated panels`,`${mangaLayoutPrompt(mangaState.layout)} panel arrangement`,`${mangaState.reading} reading order`,'clean panel borders',...drawing.consistency,...(pagePeople.length?['consistent characters across all panels']:[]),...(pageCreatures.length?['consistent creature designs across all panels']:[]),...(hasLettering?['speech bubbles and Japanese sound effects only in specified panels']:[]),...pagePeople.map(p=>identities.get(p.id)),...pageCreatures.map(mangaCreatureIdentity),...sceneParts.map((p,i)=>`Panel ${i+1}: ${p}`)];
 $('mangaPositive').value=positive.join(', ');$('mangaNegative').value=bdNegativeTags({manga:true,subjects:present.every(a=>a.length>0),lettering:hasLettering}).join(', ');
 const root=$('mangaIndividual');root.replaceChildren();perPanel.forEach((prompt,i)=>{const wrap=node('div',undefined,'mangaIndividual'),label=node('label','コマ'+(i+1)),area=node('textarea'),copy=node('button','コピー','secondary');area.value=prompt;copy.type='button';copy.onclick=()=>copyHistoryText(area.value);wrap.append(label,area,copy);root.append(wrap)});$('mangaStatus').textContent=panels.length+'コマのプロンプトを生成しました。ネガティブはページ共通です。';bdShowWarnings(plans);markGenerationFresh();
}
