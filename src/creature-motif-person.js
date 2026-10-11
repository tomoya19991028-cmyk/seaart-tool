// Independent original people: copy only resolved general appearance, never source identity.
let mfImportState=null;
function mfSelectionSnapshot(){return {version:1,personKey:allPeople().some(p=>p.id===personKey)?personKey:allPeople()[0]?.id||'',personGroup,personPage}}
function mfResolveCandidate(field,value){
 const standard=mbStandardSeed.catalog[field]?.find(r=>r.value===value),rows=catalog[field]?.filter(r=>r.id===standard?.id&&r.value===value)||[];
 afAssert(standard&&rows.length===1&&!maIsHidden('catalog:'+field,rows[0].id),'未登録・変更済み・非表示の候補です');
 afAssert(!personOptionEdits['catalog:'+field+'|'+value]&&!personOptionEdits['catalog:'+field+'|'+rows[0].id],'編集された候補は取込み対象外です');return afCopy(rows[0]);
}
function mfSavedAppearance(sourceId,mode){
 afAssert(['semi','full'].includes(mode),'参考にする外見を選択してください');const rows=creatures.filter(c=>c.id===sourceId);afAssert(rows.length===1,'参考元Creatureが存在しないか重複しています');
 const ref='creature:'+sourceId,e=actorExtensions.byActor[ref];afAssert(e?.humanProfile?.version===1&&e.humanProfile.byMode[mode]&&afOwnerKey(e.ownerRef)===afOwnerKey(actorOwnerForRef(ref)),'このモードの保存済み外見がありません');
 afAssert(!(actorExtensions.quarantined||[]).some(q=>q.actorRef===ref&&['owner-changed','missing-actor-or-owner','duplicate-creature-id'].includes(q.reason)),'参考元が隔離されています');validateAnthroAppearance(e.humanProfile.byMode[mode]);return afCopy(e.humanProfile.byMode[mode]);
}
// Reviewed import policy; not candidate data. Exact standard rows and owner-free values only.
const mfGeneralImportValues=Object.freeze({"outfit":["casual clothes","formal suit","tuxedo","kimono","yukata","hakama","hanfu","gothic outfit","lab coat","chef uniform","pilot uniform","spacesuit","wizard robe","adventurer outfit","cleric robes","pirate outfit","cowboy outfit","tracksuit","sportswear","pajamas","hoodie","sweater","long coat","leather jacket","cyberpunk outfit","steampunk outfit","t-shirt","blouse","cardigan","denim jacket","jeans","overalls","one-piece dress","summer dress","winter clothes","spring outfit","raincoat","trench coat","puffer jacket","coat and scarf","workwear","light armor","robe and cape","royal attire","elven outfit","priest robes","martial arts uniform","hunter outfit","casual kimono","jinbei","hanbok","hiking outfit","ski suit","smart casual office outfit","denim coordinated outfit","men's shirt and slacks","men's casual suit","women's blouse and long skirt","women's pantsuit","t-shirt and jeans","sweater and long skirt","wizard outfit","priest outfit","formal gown","combat suit"],"upper":["white blouse","shirt","jacket","hoodie","sweater","robe","polo shirt","denim shirt","striped shirt","oversized sweater","cardigan","turtleneck sweater","vest","waistcoat","long-sleeved blouse","kimono top","tailored blazer","silk blouse","dress shirt","formal waistcoat","embroidered jacket","chainmail shirt","ceremonial robes","mage cloak","armored jacket","military coat","high-collared tunic","fur-lined cloak","t-shirt","blouse","denim jacket","trench coat","puffer jacket","leather jacket"],"lower":["long skirt","trousers","shorts","leggings","hakama pants","pleated skirt","flared skirt","pencil skirt","layered skirt","asymmetrical skirt","long dress skirt","wide-leg pants","skinny jeans","cargo pants","leather pants","denim shorts","culottes","track pants","slacks","armored skirt","leather trousers","tabard","split skirt","battle kilt","jeans"],"feet":["boots","high heels","sneakers","sandals","ankle boots","knee-high boots","combat boots","platform boots","loafers","ballet flats","dress shoes","Mary Jane shoes","geta sandals","wooden clogs","armored boots","greaves","winged sandals"],"legwear":["thighhigh socks","knee socks","tights","stockings","leggings","leg armor","ankle socks","patterned tights","leg warmers"],"bodyFeatures":["cat ears","fox ears","wolf ears","dog ears","rabbit ears","bear ears","mouse ears","deer ears","cow ears","horse ears","pointy ears","long pointy ears","demon horns","dragon horns","goat horns","bull horns","antlers","single horn","two horns","multiple horns"],"accessory":["earrings","necklace","choker","cape","belt","brooch","eyepatch","scarf","pendant","locket","pearl necklace","gold earrings","silver earrings","gemstone brooch","armlet","anklet","amulet","magic talisman","feathered cape","ornate epaulettes","decorative chains","apron","bracelets","rings","jeweled ring","wristwatch","bangles","hand jewelry"]});
function mfResolveGeneralCandidate(field,value,kind){
 afAssert(mfGeneralImportValues[field]?.includes(value),'確認済みの一般候補ではありません');
 if(kind==='catalog'){const row=mfResolveCandidate(field,value),seed=mbStandardSeed.catalog[field].find(r=>r.value===value);afAssert(catalog[field].filter(r=>r.value===value).length===1&&row.name===seed.name&&row.group===seed.group&&!row.group?.includes('キャラクター')&&!characterCandidateOwners('catalog:'+field,row.id),'分類・所有者が一致しません');return row}
 const seed=mbStandardSeed.detailBuiltin[field]?.filter(r=>r[0]===value)||[],rows=detailOptions[field]?.options.filter(r=>r[0]===value)||[];
 afAssert(seed.length===1&&rows.length===1&&JSON.stringify(seed[0])===JSON.stringify(rows[0])&&!maIsHidden('detail:'+field,value)&&!personOptionEdits['detail:'+field+'|'+value]&&!detailPresetCustom[field]?.some(r=>r[0]===value),'候補ID・value・分類が変更または非表示です');
 afAssert(!rows[0][2]?.includes('キャラクター')&&!characterCandidateOwners('detail:'+field,value),'原作固有候補は取込み対象外です');return {id:value,value,name:rows[0][1],group:rows[0][2]};
}
function mfValidateImportSelection(preview,choices){
 afAssert(!hImportPending&&!hActionBusy&&!horrorStaging&&!actorFormImportBusy,'読込・保存・復旧が進行中です。完了後に操作してください');
 afAssert(actorFormStorageReady&&!actorFormStartup.blocked,'保存の準備ができていません');afAssert(afObject(preview)&&Array.isArray(choices)&&new Set(choices).size===choices.length,'取込み項目が不正です');
 const current=mfImportPreview(preview.sourceId,preview.mode);afAssert(preview.revision===actorFormLastBundle.marker.revision&&preview.signature===current.signature,'参考元または保存内容が更新されています。プレビューを開き直してください');
 afAssert(choices.every(k=>Object.hasOwn(current.groups,k)&&current.groups[k].available),'選択した項目を取り込めません');return current;
}
function mfApplyImportGroups(profile,current,choices){
 const result=afCopy(profile);
 for(const key of choices){if(key==='clothingColors')continue;const part=afCopy(current.groups[key].profile);for(const [field,value]of Object.entries(part))result[field]=['detail','colorWeights','itemWeights'].includes(field)?{...(result[field]||{}),...value}:value;
  if(key==='hairStyle'){result.itemWeights??={};result.itemWeights.hairStyle=afCopy(part.itemWeights?.hairStyle||{})}
  if(key==='hairColor'||key==='eyeColor'){const kind=key==='hairColor'?'hair':'eye';result.colorWeights??={};result.colorWeights[kind]=afCopy(part.colorWeights?.[kind]||{});if(key==='hairColor'&&part.hairMode==='single')result.hairSecondary='';if(key==='eyeColor'&&part.eyeMode==='same')result.eyeRight=''}
  if(current.groups[key].kind==='detail'){result.detailCustom??={};result.detailCustom[key]=''}
  if(key==='outfit'){result.outfitExpandedFrom=item('outfit',result.outfit.at(-1))?.value||''}
 }
 if(choices.includes('clothingColors'))for(const key of choices.filter(k=>Object.hasOwn(mfGeneralImportValues,k)&&k!=='bodyFeatures')){result.itemColors??={};if(Object.keys(current.groups[key].colors).length)result.itemColors[key]={...(result.itemColors[key]||{}),...afCopy(current.groups[key].colors)}}
 return result;
}
function mfImportPreview(sourceId,mode){
 const a=mfSavedAppearance(sourceId,mode),groups={},excluded=[];
 const weight=v=>{afAssert(individualWeightSteps.includes(Number(v)),'候補の重みが不正です');return Number(v)};
 for(const [key,title,kind,field,slots,modeKey,modes]of [['hairColor','髪色','hair','hairColor',['primary','secondary'],'hairMode',structuralBuiltin.hairMode.map(r=>r[0])],['eyeColor','目の色','eyes','eyeColor',['left','right'],'eyeMode',structuralBuiltin.eyeMode.map(r=>r[0])]]){
  try{const colors=a[kind];afAssert(modes.includes(colors.mode),'未対応の色モードです');const second=colors.mode!==(kind==='hair'?'single':'same'),values=[colors[slots[0]],...(second?[colors[slots[1]]]:[])];afAssert(values.every(Boolean),'色の指定が不足しています');const rows=values.map(v=>mfResolveCandidate(field,v)),profile={[modeKey]:colors.mode},names=kind==='hair'?['hairPrimary','hairSecondary']:['eyeLeft','eyeRight'];rows.forEach((r,i)=>profile[names[i]]=r.id);
   const map=a.weights.colorWeights[kind==='hair'?'hair':'eye']||{},w={};for(const [i,slot]of ['primary','secondary'].entries())if(rows[i]&&map[slot]!==undefined)w[slot]=weight(map[slot]);if(Object.keys(w).length)profile.colorWeights={[kind==='hair'?'hair':'eye']:w};groups[key]={title,available:true,label:rows.map(r=>r.name).join('／'),profile};
  }catch(error){groups[key]={title,available:false,label:error.message,profile:{}}}
 }
 const styles=[],styleWeights={};for(const value of a.hairStyle)try{const row=mfResolveCandidate('hairStyle',value),v=a.weights.itemWeights.hairStyle?.[value];if(v!==undefined)styleWeights[value]=weight(v);styles.push(row)}catch{excluded.push('髪型：対応を確認できない候補')}
 groups.hairStyle={title:'一般髪型',available:styles.length>0,label:styles.map(r=>r.name).join('／')||'取込み可能な髪型なし',profile:{hairStyle:styles.map(r=>r.id),...(Object.keys(styleWeights).length?{itemWeights:{hairStyle:styleWeights}}:{})}};
 const specs=[['outfit','一般衣装セット','catalog'],['upper','上半身','detail'],['lower','下半身','detail'],['feet','靴','detail'],['legwear','靴下・レッグウェア','detail'],['bodyFeatures','一般の耳・角','detail'],['accessory','一般装飾','detail']];
 for(const [field,title,kind]of specs){const rows=[],weights={},colors={};for(const value of kind==='catalog'?a[field]:a.detail[field])try{const row=mfResolveGeneralCandidate(field,value,kind),n=a.weights.itemWeights[field]?.[value],shade=a.weights.itemColors[field]?.[value];if(n!==undefined)weight(n);if(shade!==undefined){afAssert(afObject(shade)&&Object.keys(shade).every(k=>['primary','secondary'].includes(k))&&Object.values(shade).every(v=>itemColorPalette.some(r=>r[0]===v)),'未対応の部位色です');}rows.push(row);if(n!==undefined)weights[value]=weight(n);if(shade!==undefined)colors[value]=afCopy(shade)}catch(error){excluded.push(title+'：'+value+'（'+error.message+'）')}
  const profile=kind==='catalog'?{[field]:rows.map(r=>r.id)}:{detail:{[field]:rows.map(r=>r.value)}};profile.itemWeights={[field]:weights};groups[field]={title,field,kind,available:rows.length>0,label:rows.map(r=>r.name+(weights[r.value]!==undefined&&weights[r.value]!==1?' · 強調'+weights[r.value].toFixed(1):'')).join('／')||'取込み対象外（対応する指定なし）',profile,colors};
 }
 groups.clothingColors={title:'選択項目の衣装・装飾色',available:specs.some(([field])=>field!=='bodyFeatures'&&Object.keys(groups[field].colors).length),label:specs.filter(([field])=>field!=='bodyFeatures').flatMap(([field])=>Object.entries(groups[field].colors).map(([value,shade])=>(groups[field].title+'：'+value+' → '+Object.values(shade).filter(Boolean).map(v=>itemColorPalette.find(r=>r[0]===v)?.[1]).join('／')))).join('、')||'取込み対象外（対応する色なし）',profile:{}};
 if(a.body.length||Object.entries(a.detail).some(([k,v])=>v.length&&!specs.some(([f])=>f===k)))excluded.push('体格・身体構造・未対応部位：取込み対象外');if(Object.values(a.detailCustom).some(Boolean)||a.gaze||a.faceDirection)excluded.push('自由入力・視線・方向：取込み対象外');
 return {sourceId,mode,revision:actorFormLastBundle.marker.revision,signature:JSON.stringify(a),groups,excluded};
}
function mfBuildCreatePlan(preview,choices,name,type){
 const current=mfValidateImportSelection(preview,choices);
 name=String(name||'').trim();afAssert(name&&name.length<=80&&!/[\r\n\x00-\x1f]/.test(name),'人物名を80文字以内で入力してください');afAssert(['adult woman','adult man'].includes(type),'一般identityを選択してください');
 const id='original-motif-'+crypto.randomUUID(),metadata={version:1,actorId:id,originKind:'creature-motif',createdAt:new Date().toISOString(),adultAccess:'denied'},profile=mfApplyImportGroups({motifPersonId:id},current,choices);
 return {record:{id,name,type,motifPerson:afCopy(metadata)},profile,extension:{ownerRef:{kind:'person',originalId:id},motifPerson:afCopy(metadata)},expectedRevision:current.revision,sourceId:current.sourceId,mode:current.mode,signature:current.signature};
}
function mfCreatePerson(preview,choices,name,type){
 const plan=mfBuildCreatePlan(preview,choices,name,type),ui=mfSelectionSnapshot(),screen=document.body.dataset.mobileTab,kind=characterKind,busy=undoBusy;
 try{undoBusy=true;const id=hTransaction('Creatureモチーフ人物を作成',()=>{
  afAssert(plan.expectedRevision===actorFormLastBundle.marker.revision,'保存内容が更新されています');
  originalCharacters.push(afCopy(plan.record));profiles[plan.record.id]=afCopy(plan.profile);actorExtensions.byActor['person:'+plan.record.id]=afCopy(plan.extension);afPromoteExtensions();personKey=plan.record.id;personGroup='basic';personPage=0;
  afValidateWorking(captureWorking());renderProfiles();showMobileTab('people');setCharacterKind('person');layoutPeople();renderManga();markGenerationDirty();return plan.record.id;
 });undoHistory.at(-1).state.motifPersonSelection=ui;return id}
 catch(error){personKey=ui.personKey;personGroup=ui.personGroup;personPage=ui.personPage;try{showMobileTab(screen);setCharacterKind(kind);renderProfiles();layoutPeople();renderManga()}catch{}clearTimeout(workingSaveTimer);throw error}
 finally{undoBusy=busy}
}
function mfReimportTarget(id){
 afAssert(mfIsMotif(id),'通常人物への上書き取込みはできません');mfValidateWorking(captureWorking(),afValidateExtensions(actorExtensions),{mainMaintenance});
 const rows=originalCharacters.filter(r=>r.id===id);afAssert(rows.length===1&&profiles[id],'対象人物が存在しません');return JSON.stringify({record:rows[0],profile:profiles[id],extension:actorExtensions.byActor['person:'+id]});
}
function mfReimportPerson(preview,choices,id,targetSignature){
 const current=mfValidateImportSelection(preview,choices);afAssert(mfReimportTarget(id)===targetSignature,'対象人物が更新されました。プレビューを開き直してください');afAssert(choices.some(k=>k!=='clothingColors'),'取込み項目を選択してください');
 const profile=mfApplyImportGroups(profiles[id],current,choices),ui=mfSelectionSnapshot(),busy=undoBusy;
 try{undoBusy=true;return hTransaction('モチーフ人物へ一般外見を再取込み',()=>{profiles[id]=profile;afValidateWorking(captureWorking());renderProfiles();layoutPeople();renderManga();markGenerationDirty();return id})}
 catch(error){personKey=ui.personKey;personGroup=ui.personGroup;personPage=ui.personPage;try{renderProfiles();layoutPeople();renderManga()}catch{}clearTimeout(workingSaveTimer);throw error}finally{undoBusy=busy}
}
// Only general appearance participates in a motif draft's source dependency.
function mfHorrorAppearanceDependency(ref){
 const id=ref.startsWith('person:')?ref.slice(7):null;if(!id||!mfIsMotif(id))return null;
 const p=profiles[id]||{},keys=['hairColor','hairPrimary','hairSecondary','hairMode','eyeColor','eyeLeft','eyeRight','eyeMode','hairStyle','outfit','outfitExpandedFrom','detail','detailCustom','itemWeights','itemColors','colorWeights'];
 return Object.fromEntries(keys.filter(k=>p[k]!==undefined).map(k=>[k,afCopy(p[k])]));
}
for(const kind of ['normal','manga']){const original=kind==='normal'?generate:generateManga,guard=function(...args){mfValidateWorking(captureWorking(),afValidateExtensions(actorExtensions),{mainMaintenance});return original.apply(this,args)};if(kind==='normal')generate=guard;else generateManga=guard}
const mfCaptureWorking=captureWorking;captureWorking=function(){const state=mfCaptureWorking();if(originalCharacters.some(r=>mfIsMotif(r.id)))state.motifPersonSelection=mfSelectionSnapshot();return state};
const mfRestoreWorking=restoreWorking;restoreWorking=function(state,...args){const result=mfRestoreWorking(state,...args);if(state.motifPersonSelection){const u=state.motifPersonSelection;personKey=allPeople().some(p=>p.id===u.personKey)?u.personKey:allPeople()[0]?.id||'';personGroup=mfIsMotif(personKey)&&u.personGroup==='adult'?'basic':u.personGroup;personPage=u.personPage;layoutPeople()}return result};
function closeMotifPersonImport(){const d=$('motifPersonImport'),trigger=mfImportState?.trigger;mfImportState=null;$('motifPersonImportBody').replaceChildren();if(d.open)d.close();trigger?.focus({preventScroll:true})}
function mfImportChoices(){return [...$('motifPersonImportBody').querySelectorAll('[data-motif-import]:checked')].map(x=>x.dataset.motifImport)}
function mfExistingImportLabel(profile,key,group){
 if(group.kind==='detail')return asList(profile.detail?.[key]).map(v=>detailOptions[key].options.find(r=>r[0]===v)?.[1]||v).join('／');
 if(key==='hairColor')return [profile.hairPrimary||profile.hairColor,...(profile.hairMode&&profile.hairMode!=='single'?[profile.hairSecondary]:[])].filter(Boolean).map(id=>item('hairColor',id)?.name||id).join('／');
 if(key==='eyeColor')return [profile.eyeLeft||profile.eyeColor,...(profile.eyeMode==='odd'?[profile.eyeRight]:[])].filter(Boolean).map(id=>item('eyeColor',id)?.name||id).join('／');
 return asList(profile[key]).map(id=>item(key,id)?.name||id).join('／');
}
function renderMotifPersonImportPlan(){
 const s=mfImportState;if(!s?.preview)return;const root=$('motifPersonPlanned');root.replaceChildren();const choices=mfImportChoices(),base=s.targetId?profiles[s.targetId]:{};
 root.append(node('strong',s.targetId?'変更予定（未選択項目は維持）':'取込み予定'));
 for(const key of choices.filter(k=>k!=='clothingColors')){const g=s.preview.groups[key],before=s.targetId?mfExistingImportLabel(base,key,g):'';root.append(node('p',g.title+'：'+(before?before+' → ':'')+g.label,'hint'));if(s.targetId&&base.detailCustom?.[key])root.append(node('p',g.title+'の自由入力は置換します','hint'))}
 if(choices.includes('clothingColors'))root.append(node('p','色はONの衣装・部位・一般装飾だけに取込みます。','hint'));if(choices.includes('outfit'))root.append(node('p','衣装セットの部位は個別に選択してください。未選択部位は自動追加しません。','hint'));if(!choices.length)root.append(node('p','外見の取込みなし','hint'));
}
function renderMotifPersonImportPreview(){
 const s=mfImportState;if(!s)return;const root=$('motifPersonPreview');root.replaceChildren();try{s.preview=mfImportPreview($('motifPersonSource').value,$('motifPersonMode').value);for(const [key,g]of Object.entries(s.preview.groups)){const row=node('label',undefined,'mfImportChoice'),input=node('input');input.type='checkbox';input.dataset.motifImport=key;input.disabled=!g.available;input.checked=g.available;input.onchange=()=>{$('motifPersonConfirm').checked=false;renderMotifPersonImportPlan()};row.append(input,node('span',g.title+'：'+g.label));root.append(row)}
  const planned=node('div');planned.id='motifPersonPlanned';root.append(planned);root.append(node('p','取込み対象外：'+(['原作identity・species・Native特徴・成人設定・相手参照',...s.preview.excluded].join('／')),'hint'));$('motifPersonCreate').disabled=false;renderMotifPersonImportPlan();
 }catch(error){s.preview=null;root.append(node('p',error.message,'hint'));$('motifPersonCreate').disabled=true}
}
function openMotifPersonImport(trigger=$('motifPersonOpen'),targetId=null){
 const d=$('motifPersonImport'),body=$('motifPersonImportBody');body.replaceChildren();let targetSignature=null;if(targetId)targetSignature=mfReimportTarget(targetId);mfImportState={trigger,preview:null,targetId,targetSignature};
 d.querySelector('h2').textContent=targetId?'モチーフ人物へ一般外見を再取込み':'Creatureモチーフから人物を作成';$('motifPersonCreate').textContent=targetId?'選択項目を再取込み':'人物を作成';
 const source=node('select');source.id='motifPersonSource';source.setAttribute('aria-label','参考元Creature');for(const [i,c]of creatures.entries()){const o=node('option',creatureName(c,i));o.value=c.id;source.append(o)}
 const mode=node('select');mode.id='motifPersonMode';mode.setAttribute('aria-label','保存済み外見');for(const [value,label]of [['semi','半擬人化'],['full','完全擬人化']]){const o=node('option',label);o.value=value;mode.append(o)}
 const name=node('input');name.id='motifPersonName';name.maxLength=80;name.placeholder='新しいオリジナル人物名';const type=node('select');type.id='motifPersonType';for(const [value,label]of structuralBuiltin.personType.filter(([v])=>['adult woman','adult man'].includes(v))){const o=node('option',label+'（一般identity）');o.value=value;type.append(o)}
 if(targetId){const person=originalCharacters.find(r=>r.id===targetId);name.value=person.name;name.readOnly=true;type.value=person.type;type.disabled=true}
 const field=(label,input)=>{const box=node('label',undefined,'field');box.append(node('span',label),input);body.append(box)};field('参考元Creature',source);field('保存済みの外見',mode);const preview=node('div');preview.id='motifPersonPreview';body.append(preview);field(targetId?'取込み先の人物名（維持）':'新人物名',name);field('一般identity',type);
 const confirm=node('label',undefined,'mfImportChoice'),check=node('input');check.id='motifPersonConfirm';check.type='checkbox';confirm.append(check,node('span',targetId?'変更予定を確認しました。成人向け設定・資格は変更しません。':'独立した人物として作成します。成人向け機能は利用できません。'));body.append(confirm,node('p','元Creatureは変更せず生成対象に残ります。同時に生成すると別の2被写体として扱います。','hint'));
 source.onchange=mode.onchange=()=>{check.checked=false;renderMotifPersonImportPreview()};name.oninput=type.onchange=()=>check.checked=false;renderMotifPersonImportPreview();d.showModal();$('motifPersonClose').focus({preventScroll:true});
}
function mfRefreshReimportButton(){const button=$('motifPersonReimport');if(button)button.hidden=!mfIsMotif(personKey)||!originalCharacters.some(r=>r.id===personKey)}
const mfStyle=node('style');mfStyle.textContent=`
#motifPersonImport{box-sizing:border-box;width:min(96vw,600px);max-width:96vw;max-height:calc(100dvh - 24px);height:min(740px,calc(100dvh - 24px));padding:0;overflow:hidden}
#motifPersonImport[open]{display:flex;flex-direction:column}#motifPersonImport .dialogHead,#motifPersonImport .mfImportFoot{flex:none;padding:12px;border-bottom:1px solid var(--border);gap:8px}#motifPersonImport .dialogHead h2{font-size:1rem;min-width:0;overflow-wrap:anywhere}#motifPersonImportBody{flex:1;min-height:0;overflow:auto;padding:12px;overscroll-behavior:contain}#motifPersonImport .mfImportFoot{display:flex;border-top:1px solid var(--border);border-bottom:0}#motifPersonImport button,#motifPersonImport select,#motifPersonImport input:not([type=checkbox]){min-height:44px}#motifPersonImport input[type=checkbox]{width:20px;min-height:20px;flex:none}#motifPersonImport .field{display:flex;flex-direction:column;gap:5px;margin:10px 0}#motifPersonImport select,#motifPersonImport input{max-width:100%;box-sizing:border-box}#motifPersonImport .mfImportChoice{display:flex;align-items:center;gap:8px;min-height:44px;padding:7px 0;overflow-wrap:anywhere}.personBar.mfPersonBar{flex-wrap:wrap;height:auto;flex:none}.personBar.mfPersonBar>select{min-width:0;flex:1}#motifPersonOpen{min-height:44px;white-space:normal;flex-basis:100%;width:100%;margin-top:4px}#motifPersonImport .hint{overflow-wrap:anywhere}`;document.head.append(mfStyle);
const mfDialog=node('dialog',undefined,'utilityDialog');mfDialog.id='motifPersonImport';const mfHead=node('div',undefined,'dialogHead'),mfClose=node('button','閉じる','secondary'),mfBody=node('div'),mfFoot=node('div',undefined,'mfImportFoot'),mfCancel=node('button','キャンセル','secondary'),mfCreate=node('button','人物を作成');mfClose.id='motifPersonClose';mfBody.id='motifPersonImportBody';mfCreate.id='motifPersonCreate';for(const b of [mfClose,mfCancel,mfCreate])b.type='button';mfHead.append(node('h2','Creatureモチーフから人物を作成'),mfClose);mfFoot.append(mfCancel,mfCreate);mfDialog.append(mfHead,mfBody,mfFoot);document.body.append(mfDialog);mfClose.onclick=mfCancel.onclick=closeMotifPersonImport;
mfDialog.addEventListener('close',()=>{if(!mfDialog.open)closeMotifPersonImport()});mfCreate.onclick=()=>{if(!mfImportState?.preview||!$('motifPersonConfirm')?.checked){shortToast('作成前の確認を選択してください');return}try{const s=mfImportState,id=s.targetId?mfReimportPerson(s.preview,mfImportChoices(),s.targetId,s.targetSignature):mfCreatePerson(s.preview,mfImportChoices(),$('motifPersonName').value,$('motifPersonType').value);closeMotifPersonImport();shortToast(s.targetId?'一般外見を再取込みしました':'独立した人物を作成しました')}catch(error){shortToast(error.message)}};
const mfOpen=node('button','Creatureモチーフから人物を作成','secondary');mfOpen.id='motifPersonOpen';mfOpen.type='button';mfOpen.onclick=()=>openMotifPersonImport(mfOpen);$('addOriginal').parentElement.classList.add('mfPersonBar');$('addOriginal').parentElement.append(mfOpen);

const mfReimport=node('button','このモチーフ人物へ一般外見を再取込み','secondary');mfReimport.id='motifPersonReimport';mfReimport.type='button';mfReimport.hidden=true;mfReimport.onclick=()=>{try{openMotifPersonImport(mfReimport,personKey)}catch(error){shortToast(error.message)}};$('addOriginal').parentElement.append(mfReimport);
const mfLayoutPeople=layoutPeople;layoutPeople=function(...args){const result=mfLayoutPeople.apply(this,args);mfRefreshReimportButton();return result};mfRefreshReimportButton();
const mfRound2Style=node('style');mfRound2Style.textContent='#motifPersonReimport:not([hidden]){min-height:44px;white-space:normal;flex-basis:100%;width:100%;margin-top:4px}#motifPersonPlanned{padding:10px;border:1px solid var(--border);border-radius:8px;margin:8px 0}#motifPersonImport .mfImportChoice input+span{min-width:0}#motifPersonImport .mfImportFoot>button{min-width:0;flex:1;white-space:normal}';document.head.append(mfRound2Style);
