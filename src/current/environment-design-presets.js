// Recipes reference stable catalog IDs and typed effect options, not finished
// prompt strings. The preview is detached and never calls restoreWorking.
const bdPresetDefs=[
 {id:'rain-cleared-city',name:'雨上がりの街',place:['background-64'],details:['env-state-013','env-state-014'],time:['time-2'],effects:{'screen-bloom':{strength:'weak'}}},
 {id:'dappled-forest',name:'木漏れ日の森',place:['background-23'],details:['bd-detail-tree-roots','bd-detail-fresh-leaves'],layers:{foreground:['bd-object-leaves']},lighting:['lighting-environment-sunlight','lighting-5']},
 {id:'lake-snow-mountains',name:'湖と雪山',layers:{foreground:['bd-object-flowers'],middle:['background-31','bd-object-boat'],distant:['background-27']},view:'landscape'},
 {id:'dusk-harbor',name:'夕暮れの港町',place:['background-66'],details:['bd-detail-water-reflections'],time:['time-2'],effects:{'screen-warm-tone':{}}},
 {id:'lantern-approach',name:'灯籠の参道',place:['background-36'],layers:{middle:['bd-object-shrine-path','bd-object-lanterns']},time:['time-4'],lighting:['bd-light-lantern'],effects:{'screen-foreground-bokeh':{strength:'weak'}}},
 {id:'fantasy-ruins',name:'幻想的な遺跡',place:['background-34'],details:['env-state-018','env-state-025'],weather:['weather-4'],lighting:['lighting-18']},
 {id:'sunset-coast',name:'海岸の夕景',place:['background-28'],details:['bd-detail-shoreline'],layers:{distant:['bd-object-horizon']},weather:['weather-environment-sunset-sky'],time:['time-3'],effects:{'screen-lens-flare':{strength:'weak'}}},
 {id:'quiet-moonlight',name:'静かな月夜',place:['background-31'],details:['bd-detail-water-reflections'],weather:['weather-environment-full-moon'],time:['time-4'],lighting:['lighting-environment-moonlight']},
 {id:'snowy-city-night',name:'雪の街の夜',place:['background-4'],details:['env-state-028','bd-detail-lit-windows'],weather:['weather-3'],time:['time-4']},
 {id:'epic-adventure',name:'壮大な冒険風景',layers:{foreground:['background-25'],middle:['bd-object-road'],distant:['bd-object-giant-ruins']},view:'landscape'}
];
function bdPresetToken(panel=null){return afHash(hCanonical({working:captureWorking(),panelId:panel?.id||null,catalog:catalog.background,effects:catalog.screenEffect,lighting:catalog.lighting}))}
function bdPresetPlan(id,replace=false,panel=null){
 const recipe=bdPresetDefs.find(p=>p.id===id);afAssert(recipe,'プリセットが見つかりません');const before=bdEffective(panel),background=bdCopy(before.background);delete background.text;background.layers??={};const effects=bdCopy(before.effects),channels={},changes=[],add=(label,kind,names)=>changes.push({label,kind,text:names.join('・')||'未指定'});
 const refs=ids=>ids.map(id=>{const r=item('background',id);afAssert(r,'プリセットの背景候補が見つかりません');return bdRef(r)}),places=refs(recipe.place||[]),details=refs(recipe.details||[]),oldPlace=background.selected.filter(r=>!euState(bdResolveRef(r))),oldDetails=background.selected.filter(r=>euState(bdResolveRef(r)));
 if(replace){background.selected=[...places,...details];background.layers={};add('背景内容','置換',background.selected.map(r=>r.name))}else{
  if(places.length){if(oldPlace.length||panel?.place||panel?.background)add('場所','保持',oldPlace.map(r=>r.name).concat([panel?.place,panel?.background].filter(Boolean)));else{background.selected.push(...places);add('場所','追加',places.map(r=>r.name))}}
  const newDetails=details.filter(r=>!background.selected.some(old=>old.id===r.id));background.selected.push(...newDetails);if(newDetails.length)add('状態・細部','追加',newDetails.map(r=>r.name));
 }
 for(const [layer,ids]of Object.entries(recipe.layers||{})){const next=refs(ids),old=background.layers[layer]||[],missing=next.filter(r=>!old.some(x=>x.id===r.id));background.layers[layer]=replace?next:[...old,...missing];if(missing.length||replace)add(bdLayerNames[layer],replace?'置換':'追加',(replace?next:missing).map(r=>r.name))}
 for(const field of ['weather','time','lighting'])if(recipe[field]){
  const current=background[field]||bdChannelRefs(field),desired=recipe[field].map(id=>{const r=item(field,id);afAssert(r,'プリセットの環境候補が見つかりません');return {source:field,id:r.id,name:r.name,value:r.value}}),name={weather:'天候・空',time:'時間',lighting:'ライティング'}[field];
  if(replace||!current.length){channels[field]=desired;add(name,replace?'置換':'追加',desired.map(r=>r.name))}else add(name,'保持',current.map(r=>r.name));
 }
 let view=before.view;if(recipe.view){if(replace||!view){view=recipe.view;add('見せ方',replace?'置換':'追加',[bdViews[view]])}else add('見せ方','保持',[bdViews[view]])}
 for(const [effect,setting]of Object.entries(recipe.effects||{})){const def=bdEffectDef(effect),row=bdEffectRow(effect);afAssert(row,'プリセットの効果候補が見つかりません');const occupied=Object.keys(effects).find(id=>id===effect||(def?.exclusive&&bdEffectDef(id)?.exclusive===def.exclusive));if(!replace&&occupied){add('画面効果','保持',[bdEffectRow(occupied)?.name||'保存済みの効果']);continue}if(def?.exclusive)for(const other of Object.keys(effects))if(bdEffectDef(other)?.exclusive===def.exclusive)delete effects[other];effects[effect]={...setting,name:row.name,value:row.value};add('画面効果',replace?'置換':'追加',[row.name+(setting.strength?'（'+{weak:'弱',medium:'中',strong:'強'}[setting.strength]+'）':'')])}
 const warnings=bdConflictMessages({...before,background,effects,view});if(panel&&(panel.place||panel.background))warnings.push(replace?'以前のコマ場所・背景の自由入力を、このプリセットの背景へ置換します。Undoで戻せます。':'コマの既存の場所・背景入力は保持します。プリセットとの組合せを確認してください。');
 return {recipeId:id,replace,token:bdPresetToken(panel),panelId:panel?.id||null,background,effects,channels,view,changes,warnings};
}
function bdApplyPreset(plan,panel=null){
 afAssert(plan.token===bdPresetToken(panel),'プレビュー後に設定が変わりました。内容を確認し直してください');
 return bdMutate('背景プリセットを適用',()=>{
  if(panel){hEnsureManga();bdUI.panelId=panel.id;const o=panel.environmentOverrides??={version:1};o.background={mode:'custom',value:{...bdCopy(plan.background),...bdCopy(plan.channels)}};o.effects={mode:'custom',value:bdCopy(plan.effects)};if(plan.view!==bdEffective(panel).view)o.view=plan.view?{mode:'custom',value:plan.view}:{mode:'off'};if(plan.replace){panel.place='';panel.background=''}}
  else{selected.background=plan.background.selected.map(r=>bdResolveRef(r)?.id).filter(Boolean);bdEnsure().layers=bdCopy(plan.background.layers);bdEnsure().density=Object.fromEntries(plan.background.selected.filter(r=>r.density).map(r=>[r.id,r.density]));for(const [field,refs]of Object.entries(plan.channels))selected[field]=refs.map(r=>r.id);bdWriteEffects(plan.effects);if(plan.view!==bdCommonView())bdWriteView(plan.view)}
 });
}
function bdRenderPresets(body){
 body.append(node('p','場所・三層・天候・時間・光・画面効果の組合せです。内容を確認してから適用します。','hint'));
 const choices=node('div',undefined,'bdModes');for(const [replace,label]of [[false,'未設定だけ補完'],[true,'関連設定を置換']]){const b=bdButton(label,()=>{bdUI.replace=replace;bdRenderList()});b.dataset.bdPresetMode=replace?'replace':'fill';b.classList.toggle('active',bdUI.replace===replace);choices.append(b)}body.append(choices);
 for(const recipe of bdPresetDefs){const b=bdButton(recipe.name,()=>{bdUI.preset=recipe.id;bdRenderList()},'secondary bdPick');b.dataset.bdPreset=recipe.id;body.append(b)}
 if(!bdUI.preset)return;const panel=bdPanel(),plan=bdPresetPlan(bdUI.preset,bdUI.replace,panel),preview=node('section',undefined,'bdInspector');preview.dataset.bdPreview='true';preview.append(node('h3','適用前の確認'),node('p','人物・装備・モデル系列は変更しません。','hint'));
 for(const change of plan.changes)preview.append(node('p',change.label+'：'+change.text+'（'+change.kind+'）','bdPreview'));for(const warning of plan.warnings)preview.append(node('p',warning,'hint'));const apply=bdButton('この内容を適用',()=>{bdApplyPreset(plan,panel);bdUI.preset=null;bdRenderList()});apply.dataset.bdApplyPreset='true';apply.disabled=!plan.changes.some(c=>c.kind!=='保持');preview.append(apply,bdButton('キャンセル',()=>{bdUI.preset=null;bdRenderList()}));body.append(preview);
}
