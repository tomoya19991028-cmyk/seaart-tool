let hnReturnContext=null;hNav.remove();
function hnSummary(ref){const a=horrorState.byActor[ref];return [({normal:'通常',partial:'部分怪異',complete:'完全怪異'})[a?.state||'normal'],hTypes.find(t=>t.id===a?.primaryTypeId)?.label].filter(Boolean).join('・')}
function hnConfigured(ref){const a=horrorState.byActor[ref];return !!a&&(a.state!=='normal'||!!a.primaryTypeId||!!a.secondaryTypeIds?.length||Object.values(a.features||{}).some(f=>f.enabled)||Object.values(a.structure||{}).some(v=>v!=='unset')||Object.values(a.originalFeaturePolicies||{}).some(p=>p.mode!=='keep')||!!a.autoFeatures?.enabled||!!a.autoFeatures?.excludedIds?.length||a.intensity!=='medium')}
function hnOpenActor(ref){hAssert(actorOwnerForRef(ref),'対象の人物・生物が見つかりません');const creature=ref.startsWith('creature:'),id=ref.slice(ref.indexOf(':')+1),context={kind:creature?'creature':'person',id,scroll:$('workspaceMain').scrollTop};if(creature&&$('creatureDialog').open){context.picker={...creaturePicker};context.query=$('creatureSearch').value;context.quick=creatureQuickMode;context.other=creatureOtherFeaturesVisible;context.listScroll=$('creatureChoices').scrollTop;$('creatureDialog').close()}hnReturnContext=context;hActorRef=ref;hCardScope='';hPage=0;hSelectDisplayMode('normal');showMobileTab('horror');hRender();$('horrorBack').focus({preventScroll:true})}
function hnBack(){const c=hnReturnContext;hnReturnContext=null;if(c?.kind==='manga'){showMobileTab('manga');const i=mangaState.mangaId===c.mangaId?mangaState.panels.findIndex(p=>p.id===c.panelId):-1;if(i>=0&&i<mangaState.count){mangaEditGroup=c.group;openMangaPanel(i,true);$('mangaEditDialog').querySelector('.dialogBody').scrollTop=c.scroll;$('horrorMangaEntry').focus({preventScroll:true})}return}showMobileTab('people');if(c?.kind==='creature'){if(creatures.some(x=>x.id===c.id))activeCreatureId=c.id;setCharacterKind('creature');if(c.picker&&creatures.some(x=>x.id===c.id)){creaturePicker={...c.picker};creatureQuickMode=c.quick;creatureOtherFeaturesVisible=c.other;$('creatureSearch').value=c.query;renderCreaturePicker();$('creatureDialog').showModal();$('creatureChoices').scrollTop=c.listScroll;$('creatureHorrorOpen').focus({preventScroll:true})}}else{if(c?.id&&allPeople().some(p=>p.id===c.id))personKey=c.id;setCharacterKind('person');setPersonGroup('features');document.querySelector('#profiles [data-hn-actor="person:'+personKey+'"] .personLaunch')?.focus({preventScroll:true})}$('workspaceMain').scrollTop=c?.scroll||0}
const hnHead=$('horrorPanel').querySelector('.screenHead'),hnBackButton=hButton('戻る',hnBack,'secondary'),hnActorLabel=node('label',undefined,'hnActorLabel');hnBackButton.id='horrorBack';hnActorLabel.append(node('span','設定する対象'),$('horrorActor'));hnHead.classList.add('hnHead');hnHead.append(hnBackButton,hnActorLabel);
const hnCreatureOpen=hButton('',()=>hCall(()=>{const c=currentCreature();hAssert(c,'生物を選択してください');hnOpenActor('creature:'+c.id)}),'secondary hnCreatureEntry');hnCreatureOpen.id='creatureHorrorOpen';hnCreatureOpen.append(node('strong','ホラー・怪異'),node('span'));$('creatureCandidateCount').before(hnCreatureOpen);
function hnRefresh(){for(const card of document.querySelectorAll('#profiles [data-hn-actor]')){const text=hnSummary(card.dataset.hnActor);if(card.querySelector('small').textContent!==text)card.querySelector('small').textContent=text;card.classList.toggle('hasSelection',hnConfigured(card.dataset.hnActor))}const c=currentCreature();hnCreatureOpen.hidden=!c||creaturePicker?.group[0]!=='features';hnCreatureOpen.querySelector('span').textContent=c?hnSummary('creature:'+c.id)+' ›':'';updatePersonBadges()}
const hnProfilesBefore=renderProfiles;renderProfiles=function(...args){const result=hnProfilesBefore.apply(this,args);hnRefresh();return result};
const hnPickerBefore=renderCreaturePicker;renderCreaturePicker=function(...args){const result=hnPickerBefore.apply(this,args);hnRefresh();return result};
const hnRenderBefore=hRender;hRender=function(...args){const result=hnRenderBefore.apply(this,args);hnRefresh();return result};
const hnTabBefore=showMobileTab;showMobileTab=function(tab,...args){if(tab!=='horror'&&document.body.dataset.mobileTab==='horror')hnReturnContext=null;return hnTabBefore.call(this,tab,...args)};
hMangaEntry.onclick=()=>hCall(()=>{const panel=hMangaEntryPanel;hAssert(panel&&mangaState.panels.includes(panel),'対象コマが変更されました');if(!mangaState.mangaId)hTransaction('漫画IDを初期化',()=>hEnsureManga(),{recordUndo:false});hnReturnContext={kind:'manga',mangaId:mangaState.mangaId,panelId:panel.id,group:mangaEditGroup,scroll:$('mangaEditDialog').querySelector('.dialogBody').scrollTop};$('mangaEditDialog').close();const preferred=characterKind==='creature'?'creature:'+activeCreatureId:'person:'+personKey;hActorRef=actorOwnerForRef(preferred)?preferred:hActors()[0]?.ref||'';hPanelId=panel.id;hCardScope=panel.id;hPage=0;hSelectDisplayMode('manga');showMobileTab('horror');hPanelDialog()});
const hnAddBefore=$('addCreature').onclick,hnAddDialog=node('dialog',undefined,'utilityDialog hnAddDialog');hnAddDialog.id='horrorCreatureAddDialog';document.body.append(hnAddDialog);
$('addCreature').onclick=()=>{hnAddDialog.replaceChildren();const head=node('div',undefined,'dialogHead'),body=node('div',undefined,'dialogBody');head.append(node('h2','生物を追加'),hButton('閉じる',()=>hnAddDialog.close(),'quiet'));body.append(hButton('通常の生物',()=>{hnAddDialog.close();hnAddBefore.call($('addCreature'))}));const name=hInput(body,'怪異の名前','独立怪異'),species=hSelect(body,'基本種類',horrorInitialCatalog.independent_species.map(s=>[s.value,s.label]),'ghost');body.append(hButton('独立した怪異を追加',()=>hCall(()=>{const id=hCreateIndependent(name.value.trim()||'独立怪異',species.value);hnAddDialog.close();activeCreatureId=id;showMobileTab('people');setCharacterKind('creature');hnOpenActor('creature:'+id)})));hnAddDialog.append(head,body);hnAddDialog.showModal()};

// The shell is placed at build time. These hooks update only the affected view;
// there is deliberately no document-wide MutationObserver.
const wbTitles={choices:'シーン',people:'キャラクター',finish:'仕上げ',manga:'漫画',result:'生成結果',horror:'ホラー・怪異'};
const wbIconPaths={scene:'M3 4h18v16H3z M3 14l5-5 5 5 3-3 5 5',people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M19 9v6 M16 12h6',finish:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',manga:'M3 3h18v18H3z M3 10h18 M10 10v11 M16 3v7',result:'M7 3h10l4 4v14H3V3z M7 11h10 M7 15h7 M16 3v5h5',settings:'M4 7h16 M4 17h16 M8 4v6 M16 14v6',horror:'M5 21V9a7 7 0 0 1 14 0v12l-4-2-3 2-3-2-4 2 M9 10h.01 M15 10h.01 M10 14h4',body:'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M5 12l7-2 7 2 M12 10v6 M8 22l4-6 4 6',light:'M12 3v2 M3 12h2 M19 12h2 M8 12a4 4 0 1 1 8 0c0 2-2 3-2 5h-4c0-2-2-3-2-5 M10 21h4',camera:'M4 7h4l2-3h4l2 3h4v13H4z M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6',effect:'m13 2-3 8H5l5 5-2 7 11-13h-6z',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',clothing:'m8 3-6 5 4 4 2-2v11h8V10l2 2 4-4-6-5a4 4 0 0 1-8 0',color:'M12 3S5 10 5 15a7 7 0 0 0 14 0c0-5-7-12-7-12',weapon:'m4 20 4-4 M3 15l6 6 M7 17 19 3h2v2L9 19'};
function wbText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function wbCardIcon(card){const k=card.dataset.detailField||card.dataset.pickerSource||card.dataset.colorKind||card.dataset.setting||card.dataset.creatureGroup||card.id;if(card.dataset.hnActor)return'horror';if(/effect|Effects/.test(k))return'effect';if(/weapon/.test(k))return'weapon';if(/lighting/.test(k))return'light';if(/composition/.test(k))return'camera';if(/background/.test(k))return'scene';if(/eye|gaze/.test(k))return'eye';if(/color|skin/i.test(k))return'color';if(/outfit|upper|lower|feet|head|hands|accessory/.test(k))return'clothing';if(/character/.test(k))return'people';if(/body|features|damage|pose/.test(k))return'body';return'settings'}
function wbDecorate(root){for(const card of root.querySelectorAll('.personPicker,.picker,.toolCard')){const icon=wbCardIcon(card);if(card.dataset.wbIcon===icon)continue;card.dataset.wbIcon=icon;const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><path d="'+(wbIconPaths[icon]||wbIconPaths.settings)+'"/></svg>';card.style.setProperty('--wb-card-icon','url("data:image/svg+xml,'+encodeURIComponent(svg)+'")')}}
function wbDisclosure(root,id,title){if(!root||$(id))return;const details=node('details',undefined,'wbDisclosure');details.id=id;root.before(details);details.append(node('summary',title),root)}
function wbEnhanceDialog(dialog){dialog.classList.add('wbSheet');const host=dialog.querySelector(':scope>form')||dialog;let head=host.querySelector(':scope>.dialogHead,:scope>.candidateHeader,:scope>.bdHead,:scope>header,:scope>.row:has(>h2)');if(!head){const h=host.querySelector(':scope>h2');if(h){head=node('div',undefined,'dialogHead');h.before(head);head.append(h);for(const b of [...host.children])if(b.tagName==='BUTTON'&&/^(閉じる|キャンセル)$/.test(b.textContent.trim()))head.append(b)}}if(head){head.classList.add('wbSheetHead');for(const b of head.querySelectorAll('button'))if(b.matches('[data-close],#choiceDialogClose,#personChoiceClose,#horrorDialogClose')||/^(閉じる|完了|キャンセル)$/.test(b.textContent.trim())){b.dataset.wbClose='';b.setAttribute('aria-label',b.getAttribute('aria-label')||b.textContent.trim()||'閉じる');b.title=b.getAttribute('aria-label')}const title=head.querySelector('h2');if(title&&!dialog.hasAttribute('aria-labelledby')&&!dialog.hasAttribute('aria-label')){if(!title.id)title.id=(dialog.id||'wbDialog')+'Title';dialog.setAttribute('aria-labelledby',title.id)}}}
const wbNativeShowModal=HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal=function(...args){wbEnhanceDialog(this);return wbNativeShowModal.apply(this,args)};
function wbSyncShell(){const tab=document.body.dataset.mobileTab||'choices';wbText($('wbPageTitle'),wbTitles[tab]||'SeaArt');wbText($('wbSceneMeta'),'人物 '+allPeople().length+' ／ 生物 '+creatures.length);const name=$('modelFamily').selectedOptions[0]?.textContent||'標準',short=name.replace('（従来の出力）','').replace('（その他）','');wbText($('wbModelShortcut'),short+' ▾');wbText($('wbOutputSettings')?.querySelector('span'),short+'・分離設定');wbText($('wbResultModel'),'モデル・キャラ分離：'+short+' ›');for(const b of document.querySelectorAll('.mobileSections [data-mobile-tab]'))b.setAttribute('aria-current',b.dataset.mobileTab===(tab==='horror'?(hnReturnContext?.kind==='manga'?'manga':'people'):tab)?'page':'false')}
function wbOpenOutput(){const d=$('wbOutputDialog');if(!d.open)d.showModal()}
const wbOutputBody=$('wbOutputDialog').querySelector('.dialogBody');
for(const el of [$('resultPanel').querySelector('.modelControls'),$('resultModelHelp'),$('subjectSeparationSettings')])if(el)wbOutputBody.append(el);
$('wbOutputSettings').onclick=wbOpenOutput;$('wbModelShortcut').onclick=wbOpenOutput;$('wbResultModel').onclick=wbOpenOutput;$('wbOutputClose').onclick=()=>$('wbOutputDialog').close();
wbDisclosure($('unifiedCreaturePresetBar'),'wbCreaturePresetTools','基本設定・形態');
const wbReset=$('mobileReset');$('toolMenu').querySelector('.dialogBody').append(node('h3','操作'),wbReset);wbReset.classList.add('menuButton');wbReset.addEventListener('click',()=>$('toolMenu').close());
pgPage=function(entries){return {page:0,total:1,entries:entries.slice()}};
maPageChoiceCards=function(){if(!window.appReady)return;for(const key of selectionCardKeys)off($('picker-'+key),hiddenCategories.has(key));for(const tile of $('pickers').querySelectorAll('[data-main-card]'))off(tile,false);off($('choicePager'),true)};
const wbPageBefore=showMobileTab,wbScrollPositions=new Map();
showMobileTab=function(tab,...args){const previous=document.body.dataset.mobileTab;if(previous!==tab)wbScrollPositions.set(previous,$('workspaceMain').scrollTop);const result=wbPageBefore.call(this,tab,...args);wbSyncShell();if(previous!==tab)$('workspaceMain').scrollTop=tab==='horror'?0:wbScrollPositions.get(tab)||0;return result};
const wbLayoutBefore=layoutPeople;layoutPeople=function(...args){const result=wbLayoutBefore.apply(this,args);updatePersonBadges();return result};
const wbProfilesBefore=renderProfiles;renderProfiles=function(...args){const result=wbProfilesBefore.apply(this,args);wbDecorate($('profiles'));wbSyncShell();return result};
const wbCreaturesBefore=renderCreatures;renderCreatures=function(...args){const result=wbCreaturesBefore.apply(this,args);wbDecorate($('creatureGrid'));wbSyncShell();return result};
const wbFinishBefore=refreshFinishSummaries;refreshFinishSummaries=function(...args){const result=wbFinishBefore.apply(this,args);wbDecorate($('finishingSection'));wbSyncShell();return result};
const wbHorrorTabs=node('div',undefined,'segments wbHorrorTabs');wbHorrorTabs.setAttribute('aria-label','怪異設定の分類');
for(const [index,label]of ['基本','特徴','漫画・管理'].entries()){const b=node('button',label,'secondary');b.type='button';b.dataset.wbHorrorPage=index;b.onclick=()=>{hPage=index;hRender()};wbHorrorTabs.append(b)}$('horrorCards').before(wbHorrorTabs);
const wbHorrorBefore=hRender;hRender=function(...args){const result=wbHorrorBefore.apply(this,args);for(const b of wbHorrorTabs.children){const active=Number(b.dataset.wbHorrorPage)===hPage;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))}return result};
function wbSimpleTheme(){const root=$('simpleMangaTool').shadowRoot;if(!root||root.getElementById('wbSimpleStyle'))return;const style=node('style',`:host{--panel:#152130;--line:#2d4056;--accent:#79e2c6;--muted:#a5b6c9;background:#0d141e;color:#edf4fa}button{border-radius:9px;min-height:36px}dialog,dialog.cm-dialog{background:#0d141e;color:#edf4fa;border-color:#2d4056;width:min(720px,96vw);max-width:96vw}button.active,[aria-pressed=true]{background:#17463e;color:#79e2c6}.cm-dialog .choice-card-grid{display:block}.cm-dialog .cm-candidate{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:6px;border-bottom:1px solid #2d4056}.cm-dialog .option-card{height:auto;min-height:52px;text-align:left;border:0;background:transparent}.cm-dialog .cm-star{position:static}`);style.id='wbSimpleStyle';root.append(style)}
$('menuSimpleManga').addEventListener('click',()=>queueMicrotask(wbSimpleTheme));
if(window.wbPerformanceMode){const nativeBadges=updatePersonBadges,nativeProfiles=renderProfiles;let depth=0,pending=false;updatePersonBadges=function(...args){if(depth){pending=true;return}return nativeBadges.apply(this,args)};renderProfiles=function(...args){depth++;try{return nativeProfiles.apply(this,args)}finally{depth--;if(!depth&&pending){pending=false;nativeBadges()}}}}
for(const d of document.querySelectorAll('dialog[open]'))wbEnhanceDialog(d);
layoutChoices();layoutPeople();hnRefresh();wbDecorate(document);wbSyncShell();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wbCompleteBoot,{once:true});else wbCompleteBoot();

function soLabel(e){return e.label+(e.caption?' · '+e.caption:'')}
function soRow(parent,title,entries,open){if(!entries.length&&!$('overviewShowAll').checked)return;const row=node('div',undefined,'dashboardRow'),link=node('button',undefined,'dashboardLink');link.type='button';link.append(node('strong',title),node('span',entries.length?entries.map(soLabel).join(' / '):'未設定'));link.onclick=open;row.append(link);const chips=node('div',undefined,'dashboardChips');for(const e of entries){if(!e.remove)continue;const chip=node('span',undefined,'weightedChip'),edit=node('button',soLabel(e),'chipName'),remove=node('button','×','chipRemove');edit.type=remove.type='button';edit.onclick=()=>e.open?e.open():open();remove.setAttribute('aria-label',e.label+'を解除');remove.onclick=()=>{e.remove();soRefresh()};chip.append(edit,remove);chips.append(chip)}if(chips.children.length)row.append(chips);parent.append(row);return row}
function soRefresh(){if($('selectedOverviewDialog').open)renderSelectedOverview()}
function soJump(person,group,launch){$('selectedOverviewDialog').close();personKey=person.id;showMobileTab('people');setCharacterKind('person');setPersonGroup(group);launch?.click()}
function soWithPerson(person,group,fn){const before={id:personKey,group:personGroup};personKey=person.id;personGroup=group;try{return fn()}finally{personKey=before.id;personGroup=before.group;layoutPeople()}}
function soCustomRow(parent,card,person=null,creature=null){const owner=person?.id||personKey,cid=creature?.id||activeCreatureId,entries=scList(card,owner,cid).map(id=>card.options.find(o=>o.id===id)).filter(o=>o&&maOptionAllowed(card,o)).map(o=>({label:o.name,caption:card.weights&&scWeight(card,o.id,owner,cid)!==1?'強調 '+scWeight(card,o.id,owner,cid).toFixed(1):'',remove:()=>maUnselect(card.id,o.id,owner,cid)}));soRow(parent,card.name,entries,()=>{$('selectedOverviewDialog').close();if(person){personKey=owner;showMobileTab('people');setCharacterKind('person');setPersonGroup(pgPlacement(card).group)}else showMobileTab('choices');maChoose(card.id,owner,cid)})}
function soCardEntries(card,person,group){
 const entries=[],title=card.querySelector(':scope>.personLaunch strong,:scope>.colorCardLaunch strong')?.textContent||card.dataset.pickerTitle||'',owner=fn=>()=>soWithPerson(person,group,fn);
 for(const container of card.querySelectorAll(':scope>.chips,:scope>.summaryChips'))for(const chip of container.children){const edit=chip.querySelector('.personSelectedOpen,.summaryChipName,.chipName'),remove=chip.querySelector('.personSelectedRemove,.summaryChipRemove,.chipRemove');if(!edit)continue;const label=edit.querySelector('.personSelectedName')?.textContent||[...edit.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join('').trim()||edit.textContent,caption=[...edit.querySelectorAll('small')].map(e=>e.textContent).filter(Boolean).join('・');entries.push({label,caption,open:owner(()=>edit.click()),...(remove?{remove:owner(()=>remove.click())}:{})})}
 for(const box of [card,...card.querySelectorAll('.dialogBody .personPicker')]){const api=box.pickerApi;if(!api||api.atomicPose)continue;for(const value of asList(api.getValues())){const label=api.options?.find(r=>r[0]===value)?.[1]||String(value),existing=entries.find(e=>e.label===label||e.label===String(value));if(existing){existing.label=label;continue}const context=personItemContext(api.source,person.id),refresh=()=>{api.refresh?.();card.refresh?.();dirty();soRefresh()},drop=()=>{saveUndo('選択一覧から解除');api.setValues(asList(api.getValues()).filter(v=>v!==value));context?.remove(value);refresh()};entries.push({label,caption:context?attributeCaption(context,value):'',open:owner(()=>context?openPersonItemDetails(context,value,label,refresh,drop):api.open()),remove:owner(drop)})}}
 if(card.dataset.colorKind&&!entries.length){const p=profiles[person.id]||{},hair=card.dataset.colorKind==='hair',field=hair?'hairColor':'eyeColor',slots=hair?['hairPrimary','hairSecondary']:['eyeLeft','eyeRight'];for(const [i,key]of slots.entries()){const id=p[key]||(!i?p[field]:''),option=item(field,id);if(option)entries.push({label:option.name,remove:()=>{saveUndo('色を解除');delete p[key];if(!i)delete p[field];renderProfiles();dirty()}})}}
 if(card.dataset.hnActor&&hnConfigured(card.dataset.hnActor))entries.push({label:hnSummary(card.dataset.hnActor)});
 if(!entries.length&&card.classList.contains('hasSelection')){const text=card.querySelector(':scope>.personLaunch small,:scope>.colorCardLaunch small')?.textContent;if(text&&text!=='未設定')entries.push({label:text})}return {title,entries};
}
function soPerson(wrap,person){const profile=[...$('profiles').children].find(e=>e.dataset.personId===person.id);if(!profile)return;for(const child of [...wrap.children])if(child.tagName!=='SUMMARY')child.remove();const cards=[...profile.querySelectorAll('.personPicker')].filter(e=>!e.dataset.mainCard&&!e.parentElement.closest('.personPicker'));for(const [group,name]of [['basic','基本'],['colors','髪・目'],['clothing','衣装'],['equipment','装備・エフェクト'],['features','身体・ダメージ']]){const section=node('section',undefined,'dashboardGroup');section.append(node('h4',name));for(const card of cards){const actual=card.closest('.personGroup')?.dataset.group||(card.matches('.clothingTile')||card.closest('.outfitSetTile')?'clothing':'equipment');if(actual!==group)continue;const {title,entries}=soCardEntries(card,person,group),launch=card.querySelector(':scope>.personLaunch,:scope>.colorCardLaunch');if(title)soRow(section,title,entries,()=>soJump(person,group,launch))}for(const card of mainMaintenance.cards.filter(c=>scSection(c)==='person'&&!c.hidden&&pgPlacement(c).group===group))soCustomRow(section,card,person);if(section.querySelector('.dashboardRow'))wrap.append(section)}if(adultReady()&&mfAdultPeople(allPeople()).some(p=>p.id===person.id))soAdult(wrap,person);if(wrap.children.length===1)wrap.append(node('p','個別設定なし','hint'))}
function soOpenAdult(person,key){soJump(person,'adult');const find=()=>$('adultDashboard')?.querySelector('[data-adult-card="'+key+'"]>.personLaunch'),buttons=()=>[...$('adultDashboardPager')?.querySelectorAll('button')||[]];for(let i=0;i<pgAdultDefinitions().length&&!find();i++){const prev=buttons()[0];if(!prev||prev.disabled)break;prev.click()}for(let i=0;i<pgAdultDefinitions().length&&!find();i++){const next=buttons().at(-1);if(!next||next.disabled)break;next.click()}find()?.click()}
function soAdult(wrap,person){const section=node('section',undefined,'dashboardGroup'),adult=adultScene.people[person.id]||{},p=profiles[person.id]||{};section.append(node('h4','成人向け'));for(const [key,title,fields]of pgAdultDefinitions()){const entries=[];for(const [kind,field]of fields){const record=kind==='detail'?p.detail||{}:kind==='shared'?adultScene:adult,rows=kind==='detail'?detailOptions[field]?.options:[...(adultPresets[field]?.items||adultBodyOptions[field]||adultSharedBase[field]||[]),...(adultCustom[field]||[])];for(const value of asList(record[field])){const label=rows?.find(r=>r[0]===value)?.[1]||String(value);entries.push({label,remove:()=>{saveUndo('選択一覧から解除');record[field]=asList(record[field]).filter(v=>v!==value);dirty();renderAdultDashboard(true)}})}}if(key==='sexualInteraction')for(const [field,label]of [['contactTarget','接触の相手'],['sexualActTarget','行為の相手']]){const target=allPeople().find(p=>p.id===adult[field]);if(target)entries.push({label:label+'：'+target.name})}if(key==='effects')for(const [field,label]of [['soundEffectText','日本語擬音'],['reactionEffectText','追加エフェクト']])if(adultScene[field]?.trim())entries.push({label:label+'：'+adultScene[field],remove:()=>{saveUndo('選択一覧から解除');adultScene[field]='';renderAdult();dirty()}});soRow(section,title,entries,()=>soOpenAdult(person,key))}for(const card of mainMaintenance.cards.filter(c=>!c.hidden&&(scSection(c)==='adult'||scSection(c)==='person'&&pgPlacement(c).group==='adult')))soCustomRow(section,card,person);if(section.querySelector('.dashboardRow'))wrap.append(section)}
function soEnvironment(section){const effective=bdEffective(),background=effective.background,entries=[];for(const ref of background.selected)entries.push({label:bdResolveRef(ref)?.name||ref.name||'見つからない背景',remove:()=>{bdUI.index=null;bdUI.panelId=null;bdEditBackground('背景を解除',b=>{b.selected=b.selected.filter(r=>r.id!==ref.id)})}});for(const [layer,refs]of Object.entries(background.layers||{}))for(const ref of refs)entries.push({label:bdLayerNames[layer]+'：'+(bdResolveRef(ref)?.name||ref.name||'見つからない候補'),remove:()=>{bdUI.index=null;bdUI.panelId=null;bdEditBackground('背景の層から解除',b=>{b.layers[layer]=(b.layers[layer]||[]).filter(r=>r.id!==ref.id)})}});if(effective.view)entries.push({label:'見せ方：'+bdViews[effective.view],remove:()=>{bdUI.index=null;bdUI.panelId=null;bdSetView('')}});soRow(section,'背景・風景',entries,()=>{$('selectedOverviewDialog').close();showMobileTab('choices');bdOpen('background')})}
function soEffectEntries(color){return Object.entries(bdEffective().effects).filter(([id])=>(bdEffectRow(id)?.group==='色調')===color).map(([id,s])=>({label:(bdEffectRow(id)?.name||s.name||'見つからない効果')+(s.strength?'（'+({weak:'弱',medium:'中',strong:'強'}[s.strength]||s.strength)+'）':'')+(s.scope&&s.scope!=='all'?'・'+bdScopeNames[s.scope]:''),remove:()=>{bdUI.index=null;bdUI.panelId=null;bdSetEffect(id,null)}}))}
function soCatalogEntry(field,id){const row=item(field,id);if(!row)return null;const context=field==='character'?null:globalItemContext(field,row.value),refresh=()=>{renderAll();dirty();soRefresh()},remove=()=>{saveUndo('選択一覧から解除');selected[field]=selected[field].filter(v=>v!==id);context?.remove(row.value);refresh()};return {label:row.name,caption:context?attributeCaption(context,row.value):'',remove,...(context?{open:()=>openPersonItemDetails(context,row.value,row.name,refresh,remove)}:{})}}
function soGlobal(root){const section=[...root.children].find(s=>s.querySelector(':scope>h3')?.textContent==='画像全体');if(!section)return;section.replaceChildren(node('h3','画像全体'));for(const key of selectionOrder){const card=selectionCardByKey[key];if(!card)continue;if(key==='background'){soEnvironment(section);continue}const entries=card.fields.flatMap(f=>selected[f].filter(id=>!(f==='composition'&&(id==='composition-44'&&bdCommonView()==='landscape'||id==='composition-21'&&bdStockEffect('screen-background-blur')&&bdEffective().effects['screen-background-blur']))).map(id=>soCatalogEntry(f,id)).filter(Boolean)),title=$('picker-'+key)?.querySelector('.choiceLaunch strong')?.textContent||card.label;soRow(section,title,entries,()=>{$('selectedOverviewDialog').close();showMobileTab('choices');openSelectionCard(key)})}for(const card of mainMaintenance.cards.filter(c=>['selection','scene'].includes(scSection(c))&&!c.hidden))soCustomRow(section,card);const entries=Object.entries(normalSceneFields).flatMap(([f,def])=>normalSceneValues(f).map(v=>({label:def.name+'：'+(candidateDisplayEdit('scene:'+f,v)?.name||normalSceneLabel(f,v))})));if(scene.sceneExtra?.trim())entries.push({label:scene.sceneExtra});soRow(section,'状況・関係',entries,()=>{$('selectedOverviewDialog').close();openNormalScene()})}
function soFinish(root){const section=[...root.children].find(s=>s.querySelector(':scope>h3')?.textContent==='仕上げ');if(!section)return;section.replaceChildren(node('h3','仕上げ'));const open=(id,prepare)=>()=>{$('selectedOverviewDialog').close();showMobileTab('finish');prepare?.();openDialog(id)},effects=kind=>()=>{$('selectedOverviewDialog').close();showMobileTab('finish');bdOpen(kind)};soRow(section,'モデル・キャラ分離',[{label:$('modelFamily').selectedOptions[0]?.textContent||modelFamily},{label:'分離：'+({none:'なし',standard:'標準',strong:'強'}[subjectSeparationMode]||subjectSeparationMode)}],()=>{$('selectedOverviewDialog').close();showMobileTab('finish');wbOpenOutput()});soRow(section,'画風・タッチ',selected.style.map(id=>soCatalogEntry('style',id)).filter(Boolean),open('artDialog',renderArt));soRow(section,'線・塗りの表現',renderingStyleTags().filter(v=>renderingStyleRole(v)!=='color').map(v=>({label:renderingStyleLabel(v)})),open('styleDialog',renderStyleControls));const color=soEffectEntries(true),names=new Set(color.map(e=>e.label));for(const v of renderingStyleTags().filter(v=>renderingStyleRole(v)==='color')){const label=renderingStyleLabel(v);if(!names.has(label))color.push({label})}soRow(section,'色・色調',color,effects('color'));soRow(section,'画面エフェクト',soEffectEntries(false),effects('effects'));soRow(section,'品質・ディテール',[{label:qualitySummary()}],open('qualityDialog',renderQuality));soRow(section,'強調度',collectWeightEntries().filter(e=>Number(e.get())!==1).map(e=>({label:e.label+' '+Number(e.get()).toFixed(1)})),open('weightsDialog',renderWeights));soRow(section,'ネガティブ',negativeOptions.filter(o=>negativeSelected.includes(o[0])).map(o=>({label:o[1]})),open('negativeDialog',renderNegative));soRow(section,'出力順',[{label:promptOrderMode==='recommended'?'モデル別推奨順':'指定した順序'}],open('orderDialog',renderOrder));soRow(section,'追加指定',splitTags($('extra').value).map(v=>{const c=globalItemContext('extra',v),refresh=()=>{renderExtraChips();dirty();soRefresh()},remove=()=>{saveUndo('選択一覧から解除');$('extra').value=splitTags($('extra').value).filter(x=>x!==v).join(', ');delete tagWeights.extra?.[v];refresh()};return{label:v,caption:attributeCaption(c,v),open:()=>openPersonItemDetails(c,v,v,refresh,remove),remove}}),open('tagsDialog',renderExtraChips))}
const soHumanBefore=uHumanOverview;uHumanOverview=function(root,c){const before=root.children.length;soHumanBefore(root,c);for(const section of [...root.children].slice(before)){const mode=section.dataset.uAnthroMode,p=anthroAppearanceRecord(creatureHumanAppearance(c,mode)),row=[...section.querySelectorAll('.uSummaryRow')].find(r=>r.querySelector('strong')?.textContent==='基本');if(row){const span=row.querySelector('span'),parts=span.textContent.split('・').filter(v=>v!=='未設定');parts.push(...paRows(p).map(a=>paSummary(a,p)),...['gaze','faceDirection'].filter(k=>p[k]).map(k=>gvLabel(p,k)));span.textContent=[...new Set(parts)].join('・')||'未設定'}}};
const soOverviewBefore=renderSelectedOverview;renderSelectedOverview=function(...args){const result=soOverviewBefore.apply(this,args),root=$('selectedOverviewBody');for(const wrap of root.querySelectorAll('.overviewPerson')){const p=allPeople().find(p=>p.id===wrap.dataset.personId);if(p)soPerson(wrap,p)}if(overviewScope==='all'){soGlobal(root);soFinish(root)}for(const c of creatures.filter(c=>overviewScope==='all'||overviewScope?.kind==='creature'&&overviewScope.id===c.id)){const ref='creature:'+c.id;if(hnConfigured(ref)){const section=node('section',undefined,'dashboardSection');section.append(node('h3',creatureName(c)+'：ホラー・怪異'));soRow(section,'ホラー・怪異',[{label:hnSummary(ref)}],()=>{$('selectedOverviewDialog').close();activeCreatureId=c.id;showMobileTab('people');setCharacterKind('creature');hnOpenActor(ref)});root.append(section)}}$('selectedOverviewTitle').textContent=overviewScope==='all'?'選択一覧':overviewScope?.kind==='creature'?(creatures.find(c=>c.id===overviewScope.id)?.name||'生物')+'の選択一覧':(allPeople().find(p=>p.id===overviewScope)?.name||'人物')+'の選択一覧';const hint=$('selectedOverviewDialog').querySelector('.overviewHint');if(hint)hint.textContent='項目名から設定を開き、×で選択を解除できます。';return result};
$('overviewShowAll').onchange=()=>renderSelectedOverview();document.addEventListener('close',e=>{if(e.target!==$('selectedOverviewDialog')&&$('selectedOverviewDialog').open)soRefresh()},true);

function gsInputSignature(){try{const w=captureWorking();for(const k of ['positive','negative','mangaPositive','mangaNegative','resultAccess','selectionOrder','hiddenCategories','cardPlacements'])delete w[k];if(w.mangaState){delete w.mangaState.mangaId;for(const p of w.mangaState.panels||[])delete p.id}return hCanonical({working:w,definitions:Object.fromEntries(Object.entries(catalog).map(([k,rows])=>[k,rows.map(r=>[r.id,r.value])])),personOptionEdits,detailBuiltin,detailPresetCustom,adultCustom,candidateExtras,negativePresetCustom,selectPresetCustom,structuralPresetCustom,cards:mainMaintenance.cards,horrorCatalogChanges})}catch{return null}}
let gsCommittedInput=gsInputSignature();const gsPersistBefore=persist;
persist=function(...args){const result=gsPersistBefore.apply(this,args);if(result){const next=gsInputSignature();if(next!==null){if(gsCommittedInput!==null&&next!==gsCommittedInput)markGenerationDirty();gsCommittedInput=next}}return result};
const gsFreshBefore=markGenerationFresh;markGenerationFresh=function(...args){const result=gsFreshBefore.apply(this,args);gsCommittedInput=gsInputSignature();return result};

// Use the live dashboard definitions for adult management. Candidate IDs and
// stores remain the existing detail:/adult: sources; groups are UI only.
function acSourceId(kind,field){return (kind==='detail'?'detail:':'adult:')+field}
function acFieldName(kind,field,fallback=''){
 const compact={bust:'大きさ',bustShape:'形・質感',soundEffect:'擬音',reactionEffect:'反応エフェクト'};
 return compact[field]||adultPresets[field]?.label||adultEditorGroups.find(row=>row[0]===field)?.[1]||detailOptions[field]?.label||fallback||field;
}
const acTargetsBefore=candidateAddTargets;
candidateAddTargets=function(...args){
 const targets=acTargetsBefore.apply(this,args),known=new Set(targets.map(t=>t.id));
 for(const [,title,fields]of pgAdultDefinitions())for(const [kind,field]of fields){
  const id=acSourceId(kind,field);if(known.has(id))continue;
  const rows=kind==='detail'?detailOptions[field]?.options:adultPresets[field]?.items||adultBodyOptions[field]||adultSharedBase[field];
  if(!Array.isArray(rows))continue;
  targets.push({section:'adult',id,label:acFieldName(kind,field,title),kind:kind==='detail'?'detail':'adult',field});known.add(id);
 }
 return targets;
};
function acManagementGroups(){
 const targets=new Map(candidateAddTargets().map(t=>[t.id,t]));
 const groups=pgAdultDefinitions().map(([key,title,fields])=>({id:'native:adult:'+key,key,title,fields:fields.map(([kind,field])=>({id:acSourceId(kind,field),title:acFieldName(kind,field),target:targets.get(acSourceId(kind,field))})).filter(f=>f.target&&candidateTargetManageable(f.target))})).filter(g=>g.fields.length);
 for(const card of mainMaintenance.cards.filter(c=>scSection(c)==='adult')){const id='main:'+card.id,target=targets.get(id);if(target)groups.push({id,key:card.id,title:card.name,fields:[{id,title:card.name,target}],custom:card})}
 return groups;
}
// The enhanced cards use their live option stores, whereas expression still
// deliberately uses the older audit/archiving UI. Do not treat a missing entry
// in that older audit table as proof that a current enhanced option is archived.
function acCurrentManagedCandidate(t,r){
 if(t?.kind!=='adult')return false;
 const current=pgAdultDefinitions().some(([key,,fields])=>key!=='expression'&&fields.some(([kind,field])=>kind!=='detail'&&acSourceId(kind,field)===t.id));
 if(!current)return false;
 const rows=adultPresets[t.field]?.items||adultBodyOptions[t.field]||adultSharedBase[t.field]||[];
 return rows.some(row=>row[0]===r.key);
}
const acLegacyCandidateBefore=maLegacyCandidate;
maLegacyCandidate=function(t,r){return acCurrentManagedCandidate(t,r)?false:acLegacyCandidateBefore(t,r)};
const acItemsBefore=ruItemCards;
ruItemCards=function(...args){
 if(ruView.section!=='adult')return acItemsBefore.apply(this,args);
 return acManagementGroups().map(g=>({id:g.id,name:g.title,section:'adult',visible:g.custom?!g.custom.hidden:true,...(g.custom?{custom:g.custom}:{adultCardKey:g.key})}));
};
const acCandidatesBefore=ruCandidates;
ruCandidates=function(...args){
 if(ruView.section!=='adult')return acCandidatesBefore.apply(this,args);
 const groups=acManagementGroups(),group=groups.find(g=>g.id===ruView.target||g.fields.some(f=>f.id===ruView.target))||groups[0];
 if(!group)return acCandidatesBefore.apply(this,args);
 const field=group.fields.find(f=>f.id===ruView.target)||group.fields[0];ruView.target=field.id;
 const result=acCandidatesBefore.apply(this,args),select=$('maintenanceCandidateTarget');if(!select)return result;
 select.replaceChildren(...groups.map(g=>new Option(g.title,g.id)));select.value=group.id;
 select.onchange=()=>{const next=groups.find(g=>g.id===select.value);if(!next)return;ruView.target=next.fields[0].id;ruView.query='';ruView.group='';ruRender()};
 if(group.fields.length>1){
  const tabs=node('nav',undefined,'segments maintenanceTabs acFieldTabs');tabs.setAttribute('aria-label','管理する分類');tabs.style.setProperty('--ac-field-count',group.fields.length);
  for(const f of group.fields){const b=maButton(f.title,()=>{ruView.target=f.id;ruView.query='';ruView.group='';ruRender()},'secondary'+(field.id===f.id?' active':''));b.dataset.adultManageField=f.id;b.setAttribute('aria-pressed',String(field.id===f.id));tabs.append(b)}
  select.parentElement.after(tabs);
 }
 return result;
};
// Native saves may rebuild the workbench and close its dialogs. Keep an adult
// management edit in the same source after a successful form submission.
for(const [formId,dialogId]of [['editForm','editor'],['personOptionEditForm','personOptionEditor']]){
 const form=$(formId),before=form.onsubmit;
 form.onsubmit=function(...args){const returnHere=maDialog.open&&ruView.section==='adult',target=ruView.target,result=before.apply(this,args);if(returnHere&&!$(dialogId).open&&adultReady())ruOpen('adult',target,'candidates');return result};
}
const acIconBefore=wbCardIcon;
wbCardIcon=function(card){return ({exposure:'clothing',clothingState:'clothing',selfAction:'body',details:'body',sexualInteraction:'people',expression:'people',effects:'effect',fluids:'color'})[card.dataset.adultCard]||acIconBefore(card)};
function acSyncDashboard(){const grid=$('adultDashboard');if(!grid)return;for(const [key,title]of pgAdultDefinitions()){const strong=grid.querySelector('[data-adult-card="'+key+'"]>.personLaunch>strong');if(strong){wbText(strong,title);if(key==='effects'&&title.includes('エフェクト')&&!strong.querySelector('.acTitleTail')){const split=title.indexOf('エフェクト');strong.replaceChildren(document.createTextNode(title.slice(0,split)),node('span',title.slice(split),'acTitleTail'))}}}wbDecorate(grid)}
const acAuditBefore=refreshAdultAuditCards;
refreshAdultAuditCards=function(...args){const result=acAuditBefore.apply(this,args);acSyncDashboard();return result};
const acDashboardBefore=renderAdultDashboard;
renderAdultDashboard=function(...args){const result=acDashboardBefore.apply(this,args);acSyncDashboard();return result};
if(window.appReady)renderAdultDashboard(true);

// Current screen vocabulary, retaining candidate IDs and all saved scope keys.
selectionCardByKey.background.label='背景・風景';
const ncTargetsBefore=candidateAddTargets;
candidateAddTargets=function(...args){return ncTargetsBefore.apply(this,args).map(t=>{
 const title=t.section==='selection'?{background:'背景・風景',lighting:'光・ライティング'}[t.id]:t.section==='person'?{pose:'ポーズ・体勢','detail:upper':'上の服','detail:lower':'下の服','detail:head':'頭・髪の装飾','detail:feet':'靴'}[t.id]:null;
 return title?{...t,label:title}:t;
})};

// The old "場面" editor already feeds normal images and manga. Expose that
// existing editor beside mood choices instead of creating another data store.
const ncMood=$('picker-mood'),ncTools=node('div',undefined,'ncContextTools'),ncOpen=node('button','状況・関係 ›','secondary'),ncChips=node('div',undefined,'ncContextChips');
ncOpen.id='ncSceneContextOpen';ncOpen.type='button';ncOpen.setAttribute('aria-label','状況・関係を設定');ncOpen.onclick=()=>openNormalScene();
ncChips.id='ncSceneContextChips';ncChips.hidden=true;ncTools.append(ncOpen);ncMood.append(ncChips,ncTools);
function ncContextEntries(){
 const entries=Object.keys(normalSceneFields).flatMap(field=>normalSceneValues(field).map(value=>({field,value,label:candidateDisplayEdit('scene:'+field,value)?.name||normalSceneLabel(field,value)})));
 if(scene.sceneExtra?.trim())entries.push({field:'extra',value:scene.sceneExtra,label:scene.sceneExtra.trim()});
 return entries;
}
function ncOpenEntry(entry){
 if(entry.field!=='extra')normalSceneField=entry.field;
 openNormalScene();if(entry.field==='extra')$('normalSceneExtra').focus();
}
function ncRemoveEntry(entry){
 if(entry.field!=='extra')return changeNormalScene(entry.field,entry.value,false);
 saveUndo('状況・関係の追加指定を解除');scene.sceneExtra='';renderNormalScene();dirty();
}
function ncSyncContext(){
 const entries=ncContextEntries();ncChips.replaceChildren();ncChips.hidden=!entries.length;
 for(const entry of entries.slice(0,3)){
  const chip=node('span',undefined,'personSelectedItem'),open=node('button',entry.label,'personSelectedOpen'),remove=node('button','×','personSelectedRemove');
  open.type=remove.type='button';open.onclick=()=>ncOpenEntry(entry);open.title=normalSceneFields[entry.field]?.name||'追加指定';
  remove.setAttribute('aria-label',entry.label+'を解除');remove.onclick=()=>ncRemoveEntry(entry);
  chip.append(open,remove);ncChips.append(chip);
 }
 if(entries.length>3){const more=node('button','ほか'+(entries.length-3)+'件','quiet');more.type='button';more.onclick=()=>openNormalScene();ncChips.append(more)}
 const hasMood=!!selected.mood.length;ncMood.classList.toggle('hasSelection',hasMood||!!entries.length);
 if(!hasMood)wbText(ncMood.querySelector('.choiceLaunch>small'),entries.length?'状況・関係：'+entries.length+'件':'未設定');
}
const ncSceneBefore=renderNormalScene;renderNormalScene=function(...args){const result=ncSceneBefore.apply(this,args);ncSyncContext();return result};
const ncSummariesBefore=renderSelectionCardSummaries;renderSelectionCardSummaries=function(...args){const result=ncSummariesBefore.apply(this,args);ncSyncContext();return result};
const ncShellBefore=wbSyncShell;wbSyncShell=function(...args){const result=ncShellBefore.apply(this,args);ncSyncContext();return result};
$('normalSceneExtra').addEventListener('input',ncSyncContext);
ncSyncContext();

const psApplyBefore=applyActorForm;
applyActorForm=function(ref,formId=actorSelectedForm(ref)?.id,scope){
 if(scope!==undefined||!psFormHasClothing(ref,formId))return psApplyBefore(ref,formId,scope||'all');
 let dialog=$('psScopeDialog');if(!dialog){dialog=node('dialog',undefined,'utilityDialog psScopeDialog');dialog.id='psScopeDialog';const head=node('div',undefined,'dialogHead');head.append(node('h2','適用する設定を選ぶ'),actorFormButton('閉じる',()=>dialog.close(),'quiet'));dialog.append(head,node('div',undefined,'dialogBody'));document.body.append(dialog)}
 const form=resolveActorForm(actorOwnerForRef(ref),formId),body=dialog.querySelector('.dialogBody');body.replaceChildren(node('p',form.name,'psFormName'));
 const descriptions={appearance:'髪・目・身体・固有の特徴など。今の衣装を保持します。',clothing:'衣装セット・服・靴・装飾品。他の外見を保持します。',all:'衣装と、それ以外の基本外見をまとめて適用します。'};
 for(const mode of ['appearance','clothing','all']){
  const button=node('button',undefined,'secondary psScopeChoice');button.type='button';button.dataset.applyScope=mode;button.append(node('strong',psScopeNames[mode]+'を適用'),node('small',descriptions[mode]));
  try{buildActorApplyPlan(ref,formId,mode)}catch(error){button.disabled=true;button.lastChild.textContent=error.message}
  button.onclick=()=>{if(psApplyBefore(ref,formId,mode)){dialog.close();if($('actorFormManagerDialog')?.open)renderActorFormManager()}};body.append(button);
 }
 dialog.showModal();return false;
};
const psControlsBefore=renderActorFormControls;
renderActorFormControls=function(ref,root,select,apply,status){
 const result=psControlsBefore.apply(this,arguments),selected=actorSelectedForm(ref);
 if(selected&&psFormHasClothing(ref,selected.id)){
  apply.disabled=!actorFormStorageReady||!['appearance','clothing','all'].some(scope=>{try{buildActorApplyPlan(ref,selected.id,scope);return true}catch{return false}});
  apply.title='衣装以外・衣装のみ・両方から適用する設定を選べます。';
 }
 let create=root.querySelector('.psCreateBasic');if(!create){create=actorFormButton('現在の外見を登録',()=>openActorFormEditor(ref,null,true,create),'secondary psCreateBasic');root.append(create)}
 create.onclick=()=>{try{openActorFormEditor(ref,null,true,create)}catch(error){shortToast(error.message)}};
 create.hidden=!!selected||!actorOwnerForRef(ref);return result;
};
if(window.appReady)refreshActorFormUI();

// The ordinary character selector keeps its native filtering, rows and events.
// Read caches exist only inside one synchronous open/render operation.
if(window.wbPerformanceMode){
 let wcReadScope=null;const wcRows=new Map();
 function wcRead(fn,receiver,args){
  if(wcReadScope)return fn.apply(receiver,args);
  wcReadScope={};try{return fn.apply(receiver,args)}finally{wcReadScope=null}
 }
 const wcHiddenBefore=maIsHidden;
 maIsHidden=function(source,key){
  if(Array.isArray(mainMaintenance.hidden)&&!mainMaintenance.hidden.length)return false;
  if(source==='catalog:character'&&wcReadScope){
   const rows=catalog.character;
   if(wcReadScope.rows!==rows||wcReadScope.length!==rows.length){
    const byKey=new Map();for(const row of rows)for(const value of [row.id,row.value])if(!byKey.has(value))byKey.set(value,row.id);
    Object.assign(wcReadScope,{rows,length:rows.length,byKey});
   }
   return mainMaintenance.hidden.includes(maKey(source,wcReadScope.byKey.get(key)||key));
  }
  return wcHiddenBefore(source,key);
 };
 const wcPagedBefore=renderPagedOptions;
 renderPagedOptions=function(root,entries,kind,makeRow){
  if(kind!=='choice'||activeChoiceKey!=='character'||root!==$('choiceDialogChoices'))return wcPagedBefore(root,entries,kind,makeRow);
  // Small filtered lists need no containment, including reused offscreen rows.
  root.classList.toggle('wbLargeCharacterList',entries.length>100);
  const live=new Set(catalog.character.map(row=>row.id));for(const id of wcRows.keys())if(!live.has(id))wcRows.delete(id);
  const fragment=document.createDocumentFragment(),used=new Set();
  for(const entry of entries){
   const signature=JSON.stringify([entry,characterFavoriteValues.has(entry.value)]),cached=wcRows.get(entry.id);
   const row=cached&&cached.signature===signature&&cached.factory===choiceOptionRow&&!used.has(cached.row)?cached.row:makeRow(entry);
   const check=row.querySelector('input[type=checkbox]');if(check)check.checked=false;
   row.dataset.wcCharacterId=entry.id;used.add(row);wcRows.set(entry.id,{signature,factory:choiceOptionRow,row});fragment.append(row);
  }
  if(!entries.length)fragment.append(node('p','該当する選択肢がありません','small'));root.append(fragment);
 };
 const wcRenderBefore=renderChoiceDialog;
 renderChoiceDialog=function(...args){
  const character=activeChoiceKey==='character';$('choiceDialog').classList.toggle('wbCharacterPickerFast',character);
  return character?wcRead(wcRenderBefore,this,args):wcRenderBefore.apply(this,args);
 };
 const wcOpenBefore=openChoiceDialog;
 openChoiceDialog=function(...args){
  if(args[0]!=='character'){wcRows.clear();$('choiceDialog').classList.remove('wbCharacterPickerFast');return wcOpenBefore.apply(this,args)}
  return wcRead(function(){
   // Native opening wrappers request the same list twice. Let their setup run,
   // then render once, before this call returns. No candidate is deferred.
   const renderer=renderChoiceDialog;let requested=false,result;
   $('choiceDialogChoices').replaceChildren();
   renderChoiceDialog=()=>{requested=true};
   try{result=wcOpenBefore.apply(this,args)}finally{renderChoiceDialog=renderer}
   if(requested)renderer.call(this);return result;
  },this,[]);
 };
}
