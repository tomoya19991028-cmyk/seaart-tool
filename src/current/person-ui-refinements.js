
let spView='all';
function spReady(){return activePersonPicker?.source==='detail:skinColor'&&!activePersonPicker.customOnly}
function spRows(){
 const picker=activePersonPicker,rows=maRows(candidateAddTarget('detail:skinColor')).filter(r=>!maIsHidden('detail:skinColor',r.key)||asList(picker.getValues()).includes(r.key));
 for(const key of asList(picker.getValues()))if(!rows.some(r=>r.key===key))rows.push({key,value:key,name:key,group:'保存した肌色'});return rows;
}
function spDraw(){
 const picker=activePersonPicker,root=$('personChoiceChoices'),selectedValues=asList(picker.getValues()),kind='person:'+picker.title,q=$('personChoiceSearch').value.normalize('NFKC').toLowerCase().trim();root.replaceChildren();$('personChoiceDialog').dataset.skinPalette='true';
 $('personChoiceFilters').hidden=true;$('personSortOpen').hidden=true;personLegacyControls.hidden=true;personCharacterControls.hidden=true;personRoleHint.hidden=true;adultAuditLegacyControl.hidden=true;
 const groups=node('div',undefined,'skinPaletteGroups');groups.setAttribute('role','tablist');groups.setAttribute('aria-label','肌色パレットの分類');
 for(const [key,name]of [['all','すべて'],['自然な肌','自然な肌'],['ファンタジー','幻想色'],['白・灰・黒','白・灰・黒']]){const b=paButton(name,()=>{spView=key;spDraw()});b.dataset.skinGroup=key;b.setAttribute('role','tab');b.setAttribute('aria-selected',String(spView===key));b.classList.toggle('active',spView===key);groups.append(b)}root.append(groups);
 root.append(node('p','肌色は1色を選びます。色見本は目安です。光・モデル・画風によって実際の色は変わります。質感や模様は「肌の状態」「身体的特徴」で設定できます。','skinPaletteHelp'));
 const allRows=spRows(),profile=picker.actorEditor?.profile||picker.context?.profile||profiles[picker.ownerId],transient=!!picker.actorEditor;
 function changed(){picker.refresh();updatePersonBadges();if(transient)creatureHumanEditorMark();else dirty();renderPersonChoiceDialog()}
 function choose(value){if(!transient)saveUndo('肌色を選択');picker.setValues([value]);usageRemember(kind,value);changed()}
 if(selectedValues.length){const heading=node('h3','選択中','skinPaletteSection');root.append(heading);for(const value of selectedValues){const r=allRows.find(r=>r.key===value),wrap=node('div',undefined,'skinPaletteSelectedRow'),dot=node('span',undefined,'itemColorDot'),open=paButton(r?.name||value,()=>{const context=picker.context||personItemContext(picker.source,picker.ownerId,profile);if(context)openPersonItemDetails({...context,colorable:false},value,r?.name||value,changed,()=>{if(!transient)saveUndo('肌色を解除');picker.setValues(selectedValues.filter(x=>x!==value));changed()})},'personSelectedOpen'),remove=paButton('×',()=>{if(!transient)saveUndo('肌色を解除');picker.setValues(asList(picker.getValues()).filter(x=>x!==value));changed()},'personSelectedRemove');dot.style.background=spSwatch(value);remove.setAttribute('aria-label',(r?.name||value)+'を解除');wrap.append(dot,open,remove);root.append(wrap)}}
 let rows=allRows.filter(r=>{const meta=spPalette.find(x=>x[0]===r.key),group=meta?.[3]||'追加した肌色';return (spView==='all'||spView===group)&&(r.name+' '+r.value+' '+r.key+' '+group).normalize('NFKC').toLowerCase().includes(q)&&(personQuickMode!=='selected'||selectedValues.includes(r.key))&&(personQuickMode!=='favorite'||usageFavorite(kind,r.key))});
 let current='',grid;for(const r of rows){const group=spPalette.find(x=>x[0]===r.key)?.[3]||'追加した肌色';if(group!==current){current=group;root.append(node('h3',group,'skinPaletteSection'));grid=node('div',undefined,'skinPaletteGrid');root.append(grid)}
  const cell=node('div',undefined,'skinPaletteCell'),button=paButton('',()=>choose(r.key),'skinPalettePick'),sample=node('span',undefined,'skinPaletteSample'),name=node('span',r.name,'skinPaletteName'),star=paButton(usageFavorite(kind,r.key)?'★':'☆',()=>{toggleUsageFavorite(kind,r.key);spDraw()},'quiet skinPaletteStar');sample.style.background=spSwatch(r.key);sample.setAttribute('aria-hidden','true');button.append(sample,name);button.dataset.skinValue=r.key;button.setAttribute('aria-label',r.name+'を肌色に設定');button.setAttribute('aria-pressed',String(selectedValues.includes(r.key)));cell.classList.toggle('selected',selectedValues.includes(r.key));if(selectedValues.includes(r.key))cell.append(node('span','選択中','skinPaletteSelected'));star.setAttribute('aria-label',r.name+'のお気に入り');star.setAttribute('aria-pressed',String(usageFavorite(kind,r.key)));cell.append(button,star);grid.append(cell);
 }
 if(!rows.length)root.append(node('p','該当する肌色がありません。','hint'));$('personChoiceCount').textContent=rows.length+'色を表示';quickTabUpdate('personQuickTabs',personQuickMode);
 const extra=node('div',undefined,'paTools');extra.append(paButton('肌色候補を追加',()=>openEditor('detail:skinColor')),paButton('肌色候補を管理',()=>{const target=candidateAddTarget('detail:skinColor');openCandidateManage(target.section,'detail:skinColor')}));root.append(extra);
}
const spPreviousChoices=renderPersonChoiceDialog;
renderPersonChoiceDialog=function(){
 const dialog=$('personChoiceDialog'),ready=spReady();if(!ready&&dialog.dataset.skinPalette){delete dialog.dataset.skinPalette;$('personChoiceFilters').hidden=!!activePersonPicker?.customOnly;$('personSortOpen').hidden=!!activePersonPicker?.customOnly}
 const result=spPreviousChoices.apply(this,arguments);
 if(ready)spDraw();
 return result;
};
$('personChoiceSearch').oninput=()=>renderPersonChoiceDialog();
const spPreviousProfiles=renderProfiles;renderProfiles=function(){spEnsure();return spPreviousProfiles.apply(this,arguments)};
const spPreviousCreatureEditor=renderCreatureHumanEditor;renderCreatureHumanEditor=function(){spEnsure();const result=spPreviousCreatureEditor.apply(this,arguments),s=creatureHumanEditorState,p=s?.byMode?.[s.mode]?.record,c=s&&creatures.find(c=>'creature:'+c.id===s.ref),owner=c&&subjectActor(c),chip=$('creatureHumanEditorGrid')?.querySelector('[data-editor-card="gaze"] .personSelectedName');if(chip&&p.gaze)chip.textContent=gvLabel(p,'gaze',{owner});return result};
const gvPreviousCreatureDirection=creatureHumanEditorDirection;
creatureHumanEditorDirection=function(key,trigger){
 if(key!=='gaze')return gvPreviousCreatureDirection.apply(this,arguments);
 const s=creatureHumanEditorState,p=s.byMode[s.mode].record,c=creatures.find(c=>'creature:'+c.id===s.ref),owner=subjectActor(c),d=actorFormDialogShell('creatureHumanDirectionDialog','視線');
 const draw=()=>{for(const child of [...d.children].slice(1))child.remove();const body=node('div',undefined,'actorFormList'),tiles=node('div',undefined,'directionTiles gazeTiles');for(const [value,name]of [['','未指定'],...actorDirectionOptions('gaze')]){const b=paButton(name,()=>{p.gaze=value;if(value==='looking at another person')p.gazeTarget=p.gazeTarget??null;else delete p.gazeTarget;creatureHumanEditorMark();if(value==='looking at another person'){renderCreatureHumanEditor();draw()}else{d.close();renderCreatureHumanEditor()}});b.classList.toggle('active',p.gaze===value);b.dataset.gazeValue=value;tiles.append(b)}body.append(tiles);gvRenderEditor(body,p,{owner,transient:true,refresh:()=>{renderCreatureHumanEditor();draw()}});d.append(body)};draw();actorFormFocusReturn(d,trigger);
};
const gvPreviousLinks=subjectLinksActive;subjectLinksActive=function(){return gvPreviousLinks()||Object.values(profiles).some(p=>p.gaze==='looking at another person'&&gvTarget(p))};
const gvPreviousCreatureReferenced=subjectCreatureReferenced;subjectCreatureReferenced=function(c){return gvPreviousCreatureReferenced(c)||[...Object.values(profiles),...Object.values(actorExtensions.byActor).flatMap(e=>e.humanProfile?.version===1?Object.values(e.humanProfile.byMode):[])].some(p=>p.gaze==='looking at another person'&&p.gazeTarget?.kind==='creature'&&p.gazeTarget.id===c.id)};
const spPreviousRestore=restoreWorking;restoreWorking=function(){if(spReady()&&$('personChoiceDialog').open)$('personChoiceDialog').close();for(const dialog of document.querySelectorAll('.gazeDialog[open],#creatureHumanDirectionDialog[open]'))dialog.close();return spPreviousRestore.apply(this,arguments)};
$('personChoiceDialog').addEventListener('close',()=>{delete $('personChoiceDialog').dataset.skinPalette;delete $('personChoiceDialog').dataset.displayKey});
spEnsure();if(window.appReady)renderProfiles();
