// Additional catalog UI and stories use the existing candidates, overlays and v5 transaction.
// The display target is transient; applying a story writes only existing per-panel fields.
let hsStoryTarget='';
const hsStoryGenre={id:'horror-change',name:'ホラー・変化系',patterns:hsStoryDefinitions.map(def=>({...def,byCount:Object.fromEntries(Array.from({length:6},(_,i)=>{const n=i+1;return [n,Array.from({length:n},(_,j)=>hCopy(def.steps[n===1?5:Math.round(j*5/(n-1))]))]}))}))};
mangaStoryPresets.push(hsStoryGenre);
function hsSelection(){const s=mangaStorySelection();return {...s,isHorror:s.genre?.id===hsStoryGenre.id}}
function hsTargets(pattern){return hActors().filter(a=>!pattern?.personOnly||a.kind==='person')}
function hsTargetValid(pattern){return hsTargets(pattern).some(a=>a.ref===hsStoryTarget)}
const hsTargetRow=node('label',undefined,'field');hsTargetRow.id='horrorStoryTargetRow';hsTargetRow.append(node('span','変化させる対象'));
const hsTargetSelect=node('select');hsTargetSelect.id='horrorStoryTarget';hsTargetSelect.setAttribute('aria-label','変化させる対象');hsTargetRow.append(hsTargetSelect);$('mangaStoryPreview').before(hsTargetRow);
hsTargetSelect.onchange=()=>{hsStoryTarget=hsTargetSelect.value;mangaStoryPreview=null;renderMangaStory()};
const hsSignatureBefore=mangaStorySignature;
mangaStorySignature=function(){const s=hsSelection();if(!s.isHorror)return hsSignatureBefore();return hCanonical({selection:hsSignatureBefore(),target:hsStoryTarget,working:captureWorking(),workspace:horrorWorkspace,catalog:hDefinitions()})};
const hsRenderBefore=renderMangaStory;
renderMangaStory=function(...args){const result=hsRenderBefore.apply(this,args),s=hsSelection();hsTargetRow.hidden=!s.isHorror;if(!s.isHorror)return result;
 const targets=hsTargets(s.pattern);hsTargetSelect.replaceChildren(new Option('対象を選択してください',''),...targets.map(a=>new Option(a.label+(a.kind==='creature'?'（生物）':'（人物）'),a.ref)));hsTargetSelect.value=hsTargetValid(s.pattern)?hsStoryTarget:'';
 const valid=hsTargetValid(s.pattern);$('mangaStoryPreviewOpen').disabled||=!valid;$('mangaStoryApply').disabled||=!valid;
 $('mangaStoryHint').textContent=!valid?'変化させる対象を選択してください。負傷のプリセットは人物専用です。':'プレビュー後に確認して適用します。他の人物・生物、通常画像の外見、下書きは保持します。適用は通常Undoで戻せます。';
 if(mangaStoryPreview)for(const [i,row]of [...$('mangaStorySteps').children].entries()){const step=mangaStoryPreview.steps[i];row.append(node('small',[step.state?{normal:'通常',partial:'部分怪異',complete:'完全怪異'}[step.state]:'怪異設定は保持',step.state==='normal'?'':step.features.map(id=>hFeature(id)?.label).join('・'),step.damage?'傷：'+(step.damage.map(v=>detailLabel('damage',v)).join('・')||'なし'):'',step.pose].filter(Boolean).join(' / ')))}
 // The existing persistent story-Undo owns scene-only fields. A combined story uses normal Undo.
 if(s.story.applied?.genre===hsStoryGenre.id)$('undoMangaStory').hidden=true;
 return result;
};
const hsPreviewBefore=previewMangaStory;
previewMangaStory=function(){const s=hsSelection();if(s.isHorror&&!hsTargetValid(s.pattern)){mangaStoryPreview=null;renderMangaStory();return false}return hsPreviewBefore()};
function hsApplySteps(ref,steps){
 const actor=hActors().find(a=>a.ref===ref);hAssert(actor,'変化対象が見つかりません');hEnsureManga();
 for(const [i,step]of steps.entries()){
  const panel=mangaState.panels[i],section=actor.kind==='person'?'people':'creatures',id=ref.slice(ref.indexOf(':')+1);panel[section]??={};const entry=panel[section][id]??={};
  // Targeted action/expression blocks, rather than shared action text, preserve other actors.
  if(actor.kind==='person'){entry.pose=step.pose;entry.expression=step.expression;if(step.damage)setMangaDamage(id,i,{values:step.damage,weights:{},custom:''})}
  else entry.action=step.pose;
  panel.storyRole=step.role;
  if(step.state===null)continue; // Ordinary damage never writes the horror overlay.
  const base=hEnsureActor(ref),local=hEnsurePanel(ref,panel.id),ids=new Set([...hDefinitions().map(f=>f.id),...Object.keys(base.features),...Object.keys(local.features)]);
  local.state=step.state;
  for(const fid of ids)local.features[fid]={mode:step.features.includes(fid)?'on':'off',weight:step.intensity==='high'?1.4:step.intensity==='low'?1:1.2,parameters:{intensity:step.intensity}};
  // Preserve all original sources; never rewrite the source profile, Creature or motif metadata.
  for(const source of hSources(ref))local.originalFeaturePolicies[source.sourceRef]={mode:'keep'};
  for(const fid of step.features){const feature=hFeature(fid);hAssert(feature,'候補が変更されました。再プレビューしてください');Object.assign(local.structure,feature.structure)}
 }
 // Recheck the resolver before persist so any conflicting source/structure is atomic failure.
 for(const panel of mangaState.panels.slice(0,steps.length))hAssert(!hResolved(ref,panel).conflicts.length,'元特徴・構造との競合があります。怪異設定を確認して再プレビューしてください');
}
const hsApplyBefore=applyMangaStory;
applyMangaStory=function(){const s=hsSelection();if(!s.isHorror)return hsApplyBefore();const preview=mangaStoryPreview;
 if(!hsTargetValid(s.pattern)||!preview||preview.signature!==mangaStorySignature()||afReadDiskBundle()?.marker.revision!==actorFormLastBundle?.marker.revision||mangaState.storyAdult){mangaStoryPreview=null;renderMangaStory();return false}
 const name=hsTargets(s.pattern).find(a=>a.ref===hsStoryTarget).label;
 if(!confirm('「'+s.pattern.name+'」を'+name+'の'+mangaState.count+'コマへ適用しますか？\n対象のコマ別動作・表情'+(s.pattern.personOnly?'・傷':'・怪異設定')+'を置き換えます。共有の場面設定・他の対象・下書きは保持します。通常Undoで戻せます。'))return false;
 hAssert(preview.signature===mangaStorySignature(),'確認中に設定または保存が変わりました。再プレビューしてください');
 hTransaction('ホラーストーリーを適用',()=>{hsApplySteps(hsStoryTarget,preview.steps);mangaState.story.applied={genre:s.genre.id,pattern:s.pattern.id,count:mangaState.count,at:new Date().toISOString()};mangaState.story.undo=null});
 mangaStoryPreview=null;markGenerationDirty();renderMangaStory();toast('ストーリーを適用しました。コマ別に編集・通常Undoで復元できます');return true;
};
// Original listeners captured the previous function; rebind only the story preview/apply entry.
$('mangaStoryPreviewOpen').onclick=()=>hCall(previewMangaStory);$('mangaStoryApply').onclick=()=>hCall(applyMangaStory);

function hsFeatureFavorites(group){
 const body=$('horrorDialogBody'),defs=hDefinitions().filter(f=>f.group===group),rows=[];
 for(const row of body.querySelectorAll('.hRow')){
  const label=row.querySelector('label')?.textContent,feature=defs.find(f=>label===f.label);if(!feature||row.querySelector('[data-hs-favorite]'))continue;
  const star=node('button',undefined,'secondary');star.type='button';star.dataset.hsFavorite=feature.id;star.setAttribute('aria-label',feature.label+'をお気に入り');
  const refresh=()=>{const active=usageFavorite('horror:features',feature.id);star.textContent=active?'★':'☆';star.setAttribute('aria-pressed',String(active))};
  star.onclick=e=>{e.preventDefault();e.stopPropagation();hCall(()=>{toggleUsageFavorite('horror:features',feature.id);refresh()})};row.append(star);refresh();rows.push({row,feature});
 }
 if(!rows.length)return;
 const filter=node('label',undefined,'hCheck'),check=node('input');check.type='checkbox';check.setAttribute('aria-label','お気に入りのみ');filter.append(check,node('span','★お気に入りのみ'));body.prepend(filter);
 const search=body.querySelector('input:not([type=checkbox]):not([type=number])'),before=search?.oninput;
 const refresh=()=>{before?.call(search);if(check.checked)for(const {row,feature}of rows)row.hidden||=!usageFavorite('horror:features',feature.id)};
 check.onchange=refresh;if(search)search.oninput=refresh;
}
const hsFeatureBefore=hFeatureDialog;
hFeatureDialog=function(group,...args){const result=hsFeatureBefore.call(this,group,...args);hsFeatureFavorites(group);return result};
const hsStyle=node('style');hsStyle.textContent='#horrorStoryTargetRow{margin:8px 0}#horrorStoryTarget{min-height:44px;width:100%}#mangaStorySteps small{display:block;overflow-wrap:anywhere;line-height:1.5}.hRow [data-hs-favorite]{min-width:44px;min-height:44px}';document.head.append(hsStyle);
renderMangaStory();

// Reflect favorite-only Undo in an already open candidate dialog, without reopening it.
const hsCardsRenderBefore=hRender;
hRender=function(...args){const result=hsCardsRenderBefore.apply(this,args);for(const star of document.querySelectorAll('[data-hs-favorite]')){const active=usageFavorite('horror:features',star.dataset.hsFavorite);star.textContent=active?'★':'☆';star.setAttribute('aria-pressed',String(active))}const filter=$('horrorDialogBody').querySelector('[aria-label="お気に入りのみ"]');if(filter?.checked)filter.onchange?.();return result};

// Keep a preset's selected value visible/editable without adding ordinary catalog entries.
const hsExpressionNames={'neutral expression':'通常','worried expression':'不安','serious expression':'真剣','surprised expression':'驚き','frightened expression':'恐れ','intense expression':'強い眼差し','determined expression':'決意','pained expression':'苦痛','exhausted expression':'疲労','terrified expression':'恐怖','vacant expression':'虚ろ','relieved expression':'安堵','hopeful expression':'希望'};
const hsSelectBefore=mangaSelect;
mangaSelect=function(parent,label,choices,value,onchange){if(value&&['ポーズ','表情','生物の行動'].includes(label)&&!choices.some(row=>row[0]===value)){const step=hsStoryDefinitions.flatMap(def=>def.steps).find(step=>(label==='表情'?step.expression:step.pose)===value);if(step)choices=[...choices,[value,label==='表情'?hsExpressionNames[value]||step.label:step.label+'の動作（適用中）']]}return hsSelectBefore(parent,label,choices,value,onchange)};
