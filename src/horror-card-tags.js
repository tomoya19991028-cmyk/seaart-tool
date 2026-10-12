// Card summaries read the existing overlay. Scope is transient, never a saved setting.
let hCardScope='';
const hCardScopeRow=node('label',undefined,'hCardScopeRow');hCardScopeRow.append(node('span','カードの適用範囲'));
const hCardScopeSelect=node('select');hCardScopeSelect.id='horrorCardScope';hCardScopeSelect.setAttribute('aria-label','カードの適用範囲');hCardScopeRow.append(hCardScopeSelect);hModeHint.after(hCardScopeRow);
hCardScopeSelect.onchange=()=>{hCardScope=hCardScopeSelect.value;hRender()};
function hCardPanel(){return hDisplayMode==='manga'&&hCardScope?mangaState.panels.find(p=>p.id===hCardScope)||null:null}
function hCardContext(){const ref=hActorRef,panel=hCardPanel(),actor=ref&&actorOwnerForRef(ref)?hNormalActor(ref):null,local=panel?horrorState.byManga[mangaState.mangaId]?.byPanel[panel.id]?.byActor[ref]:null;return {ref,panel,actor,local,policies:{...actor?.originalFeaturePolicies,...local?.originalFeaturePolicies}}}
function hCardToken(){return hCanonical({ref:hActorRef,scope:hDisplayMode==='manga'?hCardScope:'',context:hActorRef?hContext(hActorRef,hCardPanel()):null,definitions:hDefinitions()})}
function hCardSelected(c){
 if(!c.actor)return {};
 // Show retained selections even in normal state; the actual generator stays suppressed.
 const context=hContext(c.ref,c.panel),actor={...c.actor,state:'partial'};let manga=context.manga;
 if(c.panel&&c.local){manga=hCopy(manga);manga.byPanel[c.panel.id].byActor[c.ref].state='partial'}
 return resolveHorrorActor({...context,actor,manga}).effective;
}
function hCardRemove(ref,pid,id,token){
 hAssert(hActorRef===ref&&(hCardPanel()?.id||null)===pid&&hCardToken()===token,'対象・コマ・設定が変わりました。カードを開き直してください');
 const c=hCardContext();hAssert(c.actor&&hFeature(id),'対応する対象・候補がありません');
 hAssert(!Object.values(c.policies).some(p=>p.mode==='replace'&&p.featureRef===id),'元特徴の変更先は「元特徴」で変更してください');
 const selected=hCardSelected(c);hAssert(selected[id],'候補は既に解除されています');
 // Narrow, user-requested deselection only. Other shared/destructive confirmations remain.
 const previous=pid?c.local?.features[id]||selected[id]:c.actor.features[id];
 hAssert(previous,'元の候補設定がありません');
 return hSetFeature(ref,id,pid?{mode:'off',weight:previous.weight||1,parameters:hCopy(previous.parameters||{})}:{...hCopy(previous),enabled:false},pid);
}
function hCardSourceName(source){if(source.id){const row=item(source.field,source.id);if(row)return row.name}const option=detailOptions[source.field]?.options?.find(row=>row[0]===source.value)||creatureFields.features?.options?.find(row=>row[0]===source.value);return option?.[1]||source.value}
function hCardSummary(index,c){
 const a=c.actor,local=c.local,state=local&&local.state!=='inherit'?local.state:a?.state||'normal',scope=c.panel?'コマ'+(mangaState.panels.indexOf(c.panel)+1):'共有基本設定';
 const stateNames={normal:'通常',partial:'部分怪異',complete:'完全怪異'},structureNames={unset:'未指定',present:'あり',absent:'なし'},structure={...a?.structure,...local?.structure};
 if(index===0){const who=hActors().find(x=>x.ref===c.ref);return who?who.label+'（'+(a?.origin==='independent'?'独立怪異':who.kind==='person'?'人物':'Creature')+'）':'対象を選択してください'}
 if(index===1)return stateNames[state]+(c.panel?(local?.state&&local.state!=='inherit'?'（コマ指定）':'（基本を継承）'):'');
 if(index===2)return [a?.primaryTypeId?'主：'+(hTypes.find(t=>t.id===a.primaryTypeId)?.label||'対応先不明'):'主：未選択',...(a?.secondaryTypeIds||[]).map(id=>'補助：'+(hTypes.find(t=>t.id===id)?.label||'対応先不明')),c.panel?'種類は共有':''].filter(Boolean).join('・');
 if(index===3)return ({low:'低',medium:'中',high:'高'}[a?.intensity||'medium'])+(c.panel?'（共有）':'');
 if(index===4)return [['wings','翼'],['horns','角'],['tail','尻尾']].map(([key,name])=>name+'：'+structureNames[structure[key]||'unset']).join('・');
 if(index===5){const sources=c.ref?hSources(c.ref):[],changed=Object.entries(c.policies).filter(([,p])=>p.mode!=='keep');return changed.length?changed.map(([key,p])=>{const source=sources.find(s=>s.sourceRef===key);return (source?hCardSourceName(source):'対応先不明')+'：'+(p.mode==='replace'?'変更 → '+(hFeature(p.featureRef)?.label||'対応先不明'):'除外')}).join('・'):'維持（全て）'}
 if(index>=6&&index<=11)return !a?'未選択':state==='normal'?'通常（選択保持・出力OFF）':scope;
 if(index===12)return c.panel?scope+'・'+stateNames[state]:'表示'+mangaState.count+'コマ・全'+mangaState.panels.length+'コマ';
 if(index===13){const ranges=horrorState.byManga[mangaState.mangaId]?.continuityRanges.filter(r=>r.actorRef===c.ref)||[];return ranges.length?ranges.map(r=>{const start=mangaState.panels.findIndex(p=>p.id===r.startPanelId),end=mangaState.panels.findIndex(p=>p.id===r.endPanelId);return start<0||end<0?'対応先不明の範囲':'コマ'+(start+1)+'〜'+(end+1)}).join('・'):'未選択'}
 if(index===14){const data=horrorState.byManga[mangaState.mangaId],fixed=Object.values(data?.byPanel||{}).filter(p=>p.byActor[c.ref]).length;return 'コマ別設定：'+fixed+'件・変更前後を確認'}
 if(index===15)return horrorWorkspace.drafts.length+'件・未確定（生成対象外）';
 if(index===16)return 'ゴミ箱：'+horrorWorkspace.trash.length+'件・救出保留：'+horrorWorkspace.recoveryPending.length+'件';
 return '保存v5・JSON書出／読込・対応付け';
}
const hCardTagsStyle=node('style');hCardTagsStyle.textContent=`
.hCardScopeRow{display:flex;align-items:center;gap:8px;flex:none;margin:0 0 4px;font-size:.75rem}.hCardScopeRow[hidden]{display:none}.hCardScopeRow select{flex:1;min-width:0;min-height:44px}
#horrorCards>.hTagCard{display:flex;flex-direction:column;padding:6px;gap:4px;border:1px solid var(--border);border-radius:12px;background:var(--raised);min-width:0;min-height:0;overflow:hidden}
#horrorCards .hCardLaunch{flex:none;width:100%;min-width:0;min-height:44px;padding:4px;text-align:left;white-space:normal;background:transparent;border:0;overflow-wrap:anywhere}
#horrorCards .hCardLaunch strong{display:block}#horrorCards .hCardLaunch small{margin:2px 0;font-size:.7rem;line-height:1.25;display:block;max-height:2.5em;overflow:auto;white-space:normal;overflow-wrap:anywhere;color:var(--muted)}
#horrorCards .chips{display:flex;flex-wrap:wrap;align-content:flex-start;gap:4px;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-width:thin;margin:0;padding:0}
#horrorCards .personSelectedItem{display:flex;max-width:100%;min-width:0;flex:none;border:1px solid #467b74;border-radius:8px;background:#284e4b;color:#dbf5ee;overflow:hidden;align-items:stretch}
#horrorCards .personSelectedOpen{flex:1;min-width:0;min-height:44px;white-space:normal;overflow-wrap:anywhere;text-align:left;padding:4px 6px;background:transparent;color:inherit;border:0}
#horrorCards .personSelectedName{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;white-space:normal;overflow-wrap:anywhere;line-height:1.2;font-size:.78rem}#horrorCards .personSelectedOpen small{display:block;font-size:.65rem}
#horrorCards .personSelectedRemove{flex:none;width:44px;min-width:44px;min-height:44px;padding:0;background:transparent;color:inherit;border:0;border-left:1px solid #467b74;font-size:1rem}
#horrorCards .hCardFixed{font-size:.72rem;overflow-wrap:anywhere;padding:4px;color:var(--muted)}
body[data-mobile-tab=horror] #horrorPanel{overflow-y:auto}
@media(max-height:480px){#horrorPanel .hGrid{flex:none}}
`;document.head.append(hCardTagsStyle);
const hCardTagsRenderBefore=hRender;
hRender=function(...args){const result=hCardTagsRenderBefore.apply(this,args);if(hCardScope&&!mangaState.panels.some(p=>p.id===hCardScope))hCardScope='';hCardScopeRow.hidden=hDisplayMode!=='manga';hModeHint.hidden=hDisplayMode==='manga';hCardScopeSelect.replaceChildren(new Option('共有基本設定（通常画像・漫画全体）',''),...mangaState.panels.filter(p=>p.id).map(p=>new Option('コマ'+(mangaState.panels.indexOf(p)+1)+(mangaState.panels.indexOf(p)>=mangaState.count?'（非表示）':''),p.id)));hCardScopeSelect.value=hCardScope;hCardScopeSelect.disabled=hDisplayMode!=='manga'||hImportPending||actorFormImportBusy||actorFormStartup.blocked;
 const c=hCardContext(),selected=hCardSelected(c),token=hCardToken();
 for(const launch of [...$('horrorCards').children]){const index=Number(launch.dataset.horrorCard),title=launch.firstChild.textContent,card=node('div',undefined,'hCard hTagCard'),group=['頭・顔','目・口','皮膚・体表','四肢・体型','翼・角・尻尾','演出・動作'][index-6],entries=[];
 launch.replaceWith(card);card.append(launch);launch.classList.remove('hCard');launch.classList.add('hCardLaunch');card.onclick=event=>{if(!event.target.closest('button'))launch.click()};
 if(group){for(const [id,value]of Object.entries(selected)){const f=hFeature(id);if(f?.group!==group)continue;const fixed=Object.values(c.policies).some(p=>p.mode==='replace'&&p.featureRef===id);entries.push({name:f.label,value:id,context:{weight:()=>value.weight||1},open:()=>launch.click(),remove:()=>hCall(()=>hCardRemove(c.ref,c.panel?.id||null,id,token)),fixed,id})}
 renderUnifiedCard(card,launch,title,entries,false);for(const [i,wrap]of [...card.querySelector('.chips').children].entries()){const entry=entries[i],remove=wrap.querySelector('.personSelectedRemove');wrap.querySelector('.personSelectedOpen').title=entry.name;if(entry.fixed){remove.remove();wrap.append(node('span','元特徴で変更','hCardFixed'))}else{remove.dataset.horrorCardRemove=entry.id;remove.disabled=launch.disabled}}
 }
 const small=node('small',launch.disabled?'漫画モードで利用':group&&!entries.length?'未選択':hCardSummary(index,c));launch.replaceChildren(node('strong',title),small);
 if(group&&c.panel)launch.onclick=()=>hCall(()=>{hPanelId=c.panel.id;hFeatureDialog(group,c.panel.id)});
 if(c.panel&&[1,4,5].includes(index))launch.onclick=()=>hCall(()=>{hPanelId=c.panel.id;hPanelDialog()});
 card.classList.toggle('hasSelection',!!entries.length);}
 const cards=$('horrorCards'),scale=Math.max(1,parseFloat(getComputedStyle(document.documentElement).fontSize)/16),rows=Array.from({length:3},(_,row)=>{const cells=[...cards.children].slice(row*2,row*2+2),selected=cells.some(card=>card.classList.contains('hasSelection'));return Math.ceil(Math.max((selected?116:56)*scale,...cells.map(card=>card.querySelector('[data-horror-card]').getBoundingClientRect().height+18+(card.classList.contains('hasSelection')?Math.max(46,...[...card.querySelectorAll('.personSelectedItem')].map(tag=>tag.getBoundingClientRect().height)):0))))});cards.style.gridTemplateRows=rows.map(n=>'minmax('+n+'px,1fr)').join(' ');cards.style.minHeight=(rows.reduce((a,b)=>a+b,0)+16)+'px';
 return result;
};
// Explicit panel entry/selection adopts the same stable ID for the card view.
const hCardPanelDialogBefore=hPanelDialog;
hPanelDialog=function(...args){const result=hCardPanelDialogBefore.apply(this,args),select=$('horrorDialogBody').querySelector('[aria-label="対象コマ"]');if(!select)return result;
 const adopt=()=>{hCardScope=select.value;const returnCard=hFocusReturn?.dataset.horrorCard;hRender();if(returnCard)hFocusReturn=document.querySelector('[data-horror-card="'+returnCard+'"]')||hFocusReturn};
 const before=select.onchange;select.onchange=function(...args){const result=before?.apply(this,args);adopt();return result};adopt();return result;
};
hRender();
