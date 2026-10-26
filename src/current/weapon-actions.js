// Shared weapon semantics and editor. Persistent instances live only in poseActions.
const waGroups=['剣・刀','槍・長柄','斧・打撃','弓','クロスボウ','銃','投擲','魔法具','その他'];
const waFamilies={sword:['剣・刀','剣・長剣・曲刀'],greatsword:['剣・刀','大剣'],katana:['剣・刀','刀'],rapier:['剣・刀','レイピア'],dagger:['剣・刀','短剣'],dual:['剣・刀','双剣'],spear:['槍・長柄','槍・三叉槍'],halberd:['槍・長柄','ハルバード'],scythe:['槍・長柄','大鎌'],axe:['斧・打撃','斧・戦斧'],blunt:['斧・打撃','ハンマー・メイス'],bow:['弓','弓'],crossbow:['クロスボウ','クロスボウ'],gun:['銃','銃（種類未指定）'],rifle:['銃','ライフル'],revolver:['銃','リボルバー'],throwing:['投擲','投げナイフ'],staff:['魔法具','杖'],book:['魔法具','魔導書'],orb:['魔法具','魔法の球'],other:['その他','その他・未分類']};
const waBuiltinFamilies={
 sword:'sword',longsword:'sword',scimitar:'sword',greatsword:'greatsword',katana:'katana',rapier:'rapier',dagger:'dagger','dual swords':'dual',spear:'spear',trident:'spear',halberd:'halberd',scythe:'scythe',axe:'axe','battle axe':'axe',hammer:'blunt',mace:'blunt',bow:'bow',longbow:'bow','magic bow':'bow',crossbow:'crossbow',gun:'gun',rifle:'rifle',revolver:'revolver','throwing knives':'throwing','magic wand':'staff',staff:'staff','crystal staff':'staff',spellbook:'book','magic orb':'orb','other weapon':'other',
 'sword blade wrapped in electric arcs':'sword','one-handed sword emitting violet light':'sword','greatsword wreathed in flames':'greatsword','spear with an elongated crystalline ice blade':'spear','staff projecting a luminous magic circle':'staff','bow with a luminous energy string':'bow','twin swords with glowing blades':'dual'
};
function waFamily(p,value){return p?.weaponFamilies?.[value]||waBuiltinFamilies[value]||'other'}
function waGroup(value){return waFamilies[waBuiltinFamilies[value]||'other'][0]}
function waIsBow(value,p){return waFamily(p,value)==='bow'}
function waWeapons(p){return paEquip(p).filter(r=>r.field==='weapon'&&!/shield|buckler/.test(r.id))}
function waWeaponName(value){return personOptionEdits['detail:weapon|'+value]?.name||detailOptions.weapon.options.find(r=>r[0]===value)?.[1]||value}
const waBlades=['sword','greatsword','katana','rapier','dagger','dual'];
const waPoints=[...waBlades,'spear','halberd','scythe'];
// A preset specializes an existing structured verb. The same definition generates
// English and validates instances from both entry points; no equipment-only tags.
const waPresets=[
 ['carry-hold','手に持つ','weapon-carry','holding {use}',null,'carry'],
 ['carry-ready','構える','weapon-carry','readying {use}',null,'carry'],
 ['carry-lower','武器を下ろす','weapon-carry','holding {use} lowered',null,'carry'],
 ['carry-back','背負う','weapon-carry','carrying {use} on their back',null,'carry'],
 ['carry-waist','腰に装備','weapon-carry','carrying {use} at their waist',null,'carry'],
 ['carry-shoulder','肩に担ぐ','weapon-carry','carrying {use} over their shoulder',['greatsword','axe','blunt','scythe'],'carry'],
 ['carry-drawn','抜刀状態','weapon-carry','with {use} drawn',waBlades,'carry'],
 ['carry-sheathed','鞘に収めた状態','weapon-carry','with {use} sheathed',waBlades,'carry'],
 ['carry-planted','地面に突き立てる','weapon-carry','with {use} planted in the ground',waPoints,'carry'],
 ['carry-ground','地面につく','weapon-carry','resting {use} on the ground',['staff'],'carry'],
 ['wind-up','振りかぶる','swing','winding up to swing {use}',['sword','axe','scythe']],
 ['swing','振る','swing','swinging {use}',['sword','dual']],
 ['thrust','突く','thrust','thrusting {use}',['sword','greatsword','katana','rapier','dagger','spear','halberd']],
 ['parry','刃で受ける','defend','blocking with the blade of {use}',['sword','rapier']],
 ['great-wind','大きく振りかぶる','swing','winding up for a broad swing of {use}',['greatsword']],
 ['swing-down','振り下ろす','swing','swinging {use} downward',['greatsword','axe']],
 ['sweep','薙ぎ払う','swing','sweeping {use} in a broad arc',['greatsword','scythe']],
 ['draw-blade','抜刀する','draw-weapon','drawing {use}',['katana']],
 ['slash','斬る','swing','slashing with {use}',['katana','dagger']],
 ['sheathe-blade','納刀する','sheathe-weapon','sheathing {use}',['katana']],
 ['point-tip','切先を向ける','aim-weapon','pointing the tip of {use}',['rapier']],
 ['dagger-ready','構える','ready-weapon','readying {use}',['dagger']],
 ['dual-ready','二刀を構える','ready-weapon','readying {use} as a pair',['dual']],
 ['dual-cross','交差させる','cross','crossing the blades of {use}',['dual']],
 ['axe-side','横に薙ぐ','swing','sweeping {use} sideways',['axe']],
 ['blunt-up','振り上げる','raise','raising {use} to strike',['blunt']],
 ['blunt-down','叩き下ろす','swing','bringing {use} down in a strike',['blunt']],
 ['blunt-side','横に振る','swing','swinging {use} sideways',['blunt']],
 ['spear-point','穂先を向ける','aim-weapon','pointing the head of {use}',['spear']],
 ['pole-sweep','薙ぐ','swing','sweeping {use}',['spear','halberd']],
 ['halberd-down','斬り下ろす','swing','slashing downward with {use}',['halberd']],
 ['scythe-hook','引き寄せるように振る','swing','swinging {use} in an inward pulling arc',['scythe']],
 ['bow-nock','矢をつがえる','nock-arrow','nocking an arrow on {use}',['bow']],
 ['bow-draw','弦を引く','pull','pulling {target}',['bow']],
 ['bow-aim','引き絞って狙う','pull','pulling {target} to full draw and aiming {use}',['bow']],
 ['bow-release','矢を放つ','release-arrow','releasing an arrow from {use}',['bow']],
 ['bow-after','放った直後','release-arrow','just after releasing an arrow from {use}',['bow']],
 ['crossbow-ready','構える','ready-weapon','readying {use}',['crossbow']],
 ['ranged-aim','狙う','aim-weapon','aiming {use}',['crossbow','gun','rifle','revolver']],
 ['crossbow-fire','発射する','fire-weapon','firing {use}',['crossbow']],
 ['crossbow-after','発射直後','fire-weapon','just after firing {use}',['crossbow']],
 ['gun-point','銃口を向ける','aim-weapon','pointing the muzzle of {use}',['gun']],
 ['rifle-shoulder','肩に付けて構える','ready-weapon','shouldering {use} in a ready stance',['rifle']],
 ['gun-fire','撃つ','fire-weapon','firing {use}',['gun','rifle','revolver']],
 ['gun-after','撃った直後','fire-weapon','just after firing {use}',['gun','rifle','revolver']],
 ['throw-ready','投げる構え','ready-weapon','poised to throw {use}',['throwing']],
 ['throw','投げる','throw','throwing {use}',['throwing']],
 ['throw-after','手から離れた直後','throw','just after releasing {use} from their hand',['throwing']],
 ['staff-raise','掲げる','raise','raising {use}',['staff']],
 ['staff-point','先端を向ける','aim-weapon','pointing the tip of {use}',['staff']],
 ['staff-cast','魔法を放つ','cast-equipment','releasing magic from {use}',['staff']],
 ['staff-circle','魔法陣を展開する','cast-equipment','projecting a magic circle from {use}',['staff']],
 ['book-open','開いて持つ','open','holding {use} open',['book']],
 ['book-page','ページをめくる','turn-page','turning a page of {use}',['book']],
 ['book-raise','掲げる','raise','raising {use}',['book']],
 ['book-cast','本から魔法を放つ','cast-equipment','releasing magic from {use}',['book']],
 ['orb-palm','手に載せる','support','holding {use} on their palm',['orb']],
 ['orb-cup','両手で包む','cup','cupping {use} in both hands',['orb']],
 ['orb-float','浮かべる','levitate-equipment','levitating {use}',['orb']],
 ['orb-present','前にかざす','raise','holding {use} out in front of them',['orb']],
 ['orb-cast','魔力を放つ','cast-equipment','releasing magical energy from {use}',['orb']],
 ['generic-hold','手に持つ','ready-weapon','holding {use}',['other']],
 ['generic-ready','構える','ready-weapon','readying {use}',['other']],
 ['generic-use','汎用の使用動作','use-equipment','using {use}',['other']]
].map(([id,name,action,phrase,families=null,role='use'])=>({id,name,action,phrase,families,role}));
const waPresetMap=new Map(waPresets.map(d=>[d.id,d]));
const waDefinitions=[['weapon-carry','武器の携帯・持ち方','carrying'],['ready-weapon','武器を構える','readying'],['aim-weapon','照準・切先を向ける','aiming'],['nock-arrow','矢をつがえる','nocking an arrow'],['release-arrow','弓から矢を放つ','releasing an arrow'],['fire-weapon','射撃','firing'],['draw-weapon','抜刀する','drawing a weapon'],['sheathe-weapon','納刀する','sheathing a weapon'],['cast-equipment','魔法具から発動','casting magic'],['turn-page','ページをめくる','turning a page'],['levitate-equipment','魔法具を浮かべる','levitating'],['use-equipment','武器を使う','using equipment']].map(([id,name,value])=>({id,name,value,group:'武器の使用動作',use:true,required:'use',weaponOnly:true}));
function waDefinition(a){const preset=waPresetMap.get(a?.weaponAction);if(!preset)return null;return {id:preset.action,name:preset.name,value:preset.phrase,group:'武器の使用動作',use:true,required:'use',weaponOnly:true,target:preset.role==='use'?'optional':undefined,targetType:'all',direction:preset.role==='use',phase:['swing','thrust'].includes(preset.action),preset}}
function waRef(a){return a.use?.kind==='equipment'&&a.use.field==='weapon'?a.use:a.target?.kind==='equipment'&&a.target.field==='weapon'?a.target:null}
function waFor(p,value,role){return paRows(p).filter(a=>waRef(a)?.id===value&&(!role||(waPresetMap.get(a.weaponAction)?.role||'use')===role))}
function waChoices(p,value,role){return waPresets.filter(d=>d.role===role&&(!d.families||d.families.includes(waFamily(p,value))))}
function waHasOpponent(d){return d?.role==='use'&&!['bow-draw','bow-nock','book-open','book-page','orb-palm','orb-cup','orb-float'].includes(d.id)}
function waProblem(a,p){
 const d=waPresetMap.get(a.weaponAction);if(!d)return '武器動作の定義が見つかりません';
 if(a.action!==d.action)return '武器動作と基本動作が一致しません';
 if(a.use?.kind!=='equipment'||a.use.field!=='weapon')return '使用武器が未設定です';
 if(d.families&&!d.families.includes(waFamily(p,a.use.id)))return 'この系統では使えない動作です';
 if(['bow-draw','bow-aim'].includes(d.id)&&!(a.target?.kind==='equipment'&&a.target.field==='weapon'&&a.target.id===a.use.id&&a.target.part==='bowstring'))return '使用武器と弓弦の参照が一致しません';
 if(a.grip&&!['normal','reverse'].includes(a.grip))return '持ち方が不明です';
 return '';
}
function waPhrase(a,p,context={}){
 const d=waPresetMap.get(a.weaponAction),use=paResolve(a.use,p,context),target=paResolve(a.target,p,context),aim=paResolve(a.aim,p,context);if(!d||!use)return '';
 let text=d.phrase.replaceAll('{use}',use.noun).replaceAll('{target}',target?.noun||'');
 const other=d.id==='bow-aim'?aim:waHasOpponent(d)?target:null;
 if(other)text+=(d.id==='parry'?' against ':' toward ')+other.noun;
 if(a.phase==='retracted')text='just after retracting '+use.noun+(other?' from '+other.noun:'');
 const hand=paPart(a.movingPart)?.[2];if(hand&&d.id!=='orb-cup')text+=' with '+hand;
 if(a.grip)text+=a.grip==='reverse'?' in a reverse grip':' in a forward grip';
 if(a.direction){const direction=paDirections.find(r=>r[0]===a.direction)?.[2];if(direction)text+=' '+direction}
 if(a.phase==='follow-through')text='follow-through after '+text;
 return text;
}
function waConflictRows(p,value){
 const carries=waFor(p,value,'carry').filter(a=>['carry-back','carry-waist','carry-sheathed','carry-shoulder','carry-planted'].includes(a.weaponAction));
 const uses=waFor(p,value,'use');return uses.length?carries:[];
}
function waConflicts(p){return waWeapons(p).flatMap(w=>waConflictRows(p,w.id).map(a=>waWeaponName(w.id)+'：'+waPresetMap.get(a.weaponAction).name+' と '+waFor(p,w.id,'use').map(a=>paName(a)).join('／')+' が競合しています'))}
function waApplyPreset(p,value,presetId,activeId=''){
 const d=waPresetMap.get(presetId);if(!d||!waChoices(p,value,d.role).some(x=>x.id===presetId)||!waWeapons(p).some(x=>x.id===value))return null;
 const old=paRows(p).find(a=>a.id===activeId);if(old&&waRef(old)?.id!==value)return null;
 const priorTarget=old?.aim||old?.target,other=priorTarget&&!(priorTarget.kind==='equipment'&&priorTarget.id===value&&priorTarget.part==='bowstring')?structuredClone(priorTarget):null;
 const a={...(old||{}),id:old?.id||'pa-'+crypto.randomUUID(),action:d.action,weaponAction:d.id,use:{kind:'equipment',field:'weapon',id:value}};
 for(const key of ['target','aim','style','phase','orientation','targetPart','targetRelation'])delete a[key];
 if(['bow-draw','bow-aim'].includes(d.id)){a.target={...a.use,part:'bowstring'};if(d.id==='bow-aim'&&other)a.aim=other}
 else if(waHasOpponent(d)&&other)a.target=other;
 if(d.id==='orb-cup')a.movingPart='both-hands';
 if(['orb-float','throw-after'].includes(d.id))delete a.movingPart;
 if(!waBlades.includes(waFamily(p,value)))delete a.grip;
 p.poseActions??=[];if(old)p.poseActions[p.poseActions.indexOf(old)]=a;else p.poseActions.push(a);p.poseActionsVersion=1;return a;
}
function waDrop(p,id){p.poseActions=paRows(p).filter(a=>a.id!==id);const used=new Set(paRows(p).map(a=>a.groupId));p.poseGroups=(p.poseGroups||[]).filter(g=>used.has(g.id))}
function waContextOwner(ctx,p){return ctx.owner||(ctx.creatureState?subjectActor(creatures.find(c=>'creature:'+c.id===ctx.creatureState.ref)):subjectActor(p))}
function waEdit(ctx,fn,label='武器の装備・動作を編集'){ctx.guard?.();if(!ctx.transient)saveUndo(label);fn();ctx.changed()}
function waRequest(root,p,session,ctx,value,presetId,activeId){
 const draft=structuredClone(p),next=waApplyPreset(draft,value,presetId,activeId);if(!next)return;
 const conflicts=waConflictRows(draft,value),apply=resolve=>waEdit(ctx,()=>{if(resolve){for(const c of conflicts)waApplyPreset(p,value,'carry-ready',c.id)}const a=waApplyPreset(p,value,presetId,activeId);if(a)session[waPresetMap.get(presetId).role+'Id']=a.id});
 if(!conflicts.length){apply(false);return}
 const box=node('div',undefined,'waConflict');box.setAttribute('role','alert');box.dataset.weaponConflict='';
 box.append(node('p',waConflicts(draft).join('。')));
 if(waPresetMap.get(presetId).role==='carry')box.append(paButton('構えるに変更して適用',()=>waEdit(ctx,()=>{const a=waApplyPreset(p,value,'carry-ready',activeId);if(a)session.carryId=a.id})));
 else box.append(paButton('競合する携帯状態を「構える」に変更して適用',()=>apply(true)));
 box.append(paButton('取消',()=>ctx.redraw()));root.querySelector('[data-weapon-conflict]')?.remove();root.prepend(box);
}
function waDrawActionFields(root,a,p,ctx){
 const d=waPresetMap.get(a.weaponAction);if(!d)return;
 const change=(key,value)=>waEdit(ctx,()=>{if(value) a[key]=value;else delete a[key]});
 if(!['orb-float','orb-cup','throw-after'].includes(d.id))paField(root,'手の補足',[['','指定なし'],['one-hand','片手'],['left-hand','左手'],['right-hand','右手'],['both-hands','両手']],a.movingPart||'',v=>change('movingPart',v),'weaponHand');
 if(waBlades.includes(waFamily(p,a.use?.id)))paField(root,'順手・逆手',[['','指定なし'],['normal','順手'],['reverse','逆手']],a.grip||'',v=>change('grip',v),'weaponGrip');
 if(d.role==='use'){
  if(waHasOpponent(d)){
   const key=d.id==='bow-aim'?'aim':'target',refs=['actor','object','equipment'].flatMap(kind=>paTargetChoices(p,{action:'defend'},kind,{query:'',owner:waContextOwner(ctx,p),labels:true})).filter(r=>!(r.kind==='equipment'&&r.field==='weapon'&&r.id===a.use?.id)),refKey=r=>JSON.stringify([r.kind,r.field||'',r.id]);
   const owner=waContextOwner(ctx,p),choices=refs.filter(r=>!(owner?.kind===r.kind&&owner?.id===r.id));
   paField(root,d.id==='bow-aim'?'狙う相手（弓弦とは別・任意）':'相手・作用先（任意）',[['','指定なし'],...choices.map(r=>[refKey(r),r.name])],a[key]?refKey(a[key]):'',v=>{let ref;if(v){const [kind,field,id]=JSON.parse(v);ref={kind,id,...(field?{field}:{})}}change(key,ref)},key==='aim'?'weaponAim':'weaponTarget');
   if(a[key]&&!paResolve(a[key],p,{owner}))root.append(node('p','相手不在：この相手への英文は省略します。','paWarning'));
   if(['character','creature'].includes(a[key]?.kind))paField(root,'相手の部位（任意）',[['','相手全体'],...paBody.map(r=>r.slice(0,2))],a[key].part||'',v=>waEdit(ctx,()=>{if(v)a[key].part=v;else delete a[key].part}),'weaponTargetPart');
  }
  paField(root,'方向（任意）',paDirections,a.direction||'',v=>change('direction',v),'weaponDirection');
  if(['swing','thrust'].includes(d.action))paField(root,'動作の時点',[['','動作中'],['follow-through','振り抜いた直後'],...(d.action==='thrust'?[['retracted','引き戻した直後']]:[])],a.phase||'',v=>change('phase',v),'weaponPhase');
 }
 const weight=node('input');weight.type='number';weight.min='.1';weight.max='2';weight.step='.1';weight.value=paWeight(p,a);weight.setAttribute('aria-label','武器動作の強調度');weight.onchange=()=>{const n=Number(weight.value);if(Number.isFinite(n)&&n>=.1&&n<=2)change('weight',n);else weight.value=paWeight(p,a)};const label=node('label','強調度');label.append(weight);root.append(label);
 if(paColor(p,a))root.append(node('p','以前の動作色：'+paColor(p,a)+'（保持中）。武器の色は武器カードで設定できます。','paNotice'));
 root.append(node('p',paProblem(a,p)||paPhrase(a,p),'paNotice'));
}
function waOpenPersonPose(personId,id){
 if(simpleDialog.open)simpleDialog.close();personKey=personId;personGroup='basic';personPage=0;layoutPeople();
 document.querySelector('.profile[data-person-id="'+CSS.escape(personId)+'"] [data-atomic-pose]')?.pickerApi.open(id);
}
function waDraw(root,p,session,ctx){
 root.classList.add('waEditor');root.replaceChildren();const weapons=waWeapons(p);
 if(session.weaponTarget===undefined&&weapons.length===1)session.weaponTarget=weapons[0].id;
 paField(root,'対象武器',[['','武器を選んでください'],...weapons.map(w=>[w.id,waWeaponName(w.id)])],session.weaponTarget||'',v=>{session.weaponTarget=v;delete session.carryId;delete session.useId;ctx.redraw()},'weaponOwner');
 const missing=paRows(p).filter(a=>waRef(a)&&!weapons.some(w=>w.id===waRef(a).id));
 for(const a of missing){const line=node('div',undefined,'paWarning');line.append(node('span',waWeaponName(waRef(a).id)+'：'+paName(a)+'（対象武器不在）'),paButton('× 動作を解除',()=>waEdit(ctx,()=>waDrop(p,a.id))));root.append(line)}
 if(!weapons.length){root.append(node('p','先に武器タブで使う武器を選んでください。','paNotice'),paButton('武器を選ぶ',ctx.selectWeapons));waDrawLegacy(root,p,session,ctx);return}
 const value=session.weaponTarget;if(!weapons.some(w=>w.id===value)){root.append(node('p','対象武器を選択してください。解除した武器は自動で付け替えません。','paNotice'));waDrawLegacy(root,p,session,ctx);return}
 root.append(node('h3',waWeaponName(value)));
 if(!Object.hasOwn(waBuiltinFamilies,value))paField(root,'独自武器の系統（任意）',[['','未分類（汎用）'],...Object.entries(waFamilies).map(([k,v])=>[k,v[1]])],p.weaponFamilies?.[value]||'',family=>waEdit(ctx,()=>{p.weaponFamilies??={};if(family)p.weaponFamilies[value]=family;else delete p.weaponFamilies[value]}),'weaponFamily');
 for(const role of ['carry','use']){
  const area=node('section',undefined,'waSection');area.dataset.weaponRole=role;area.append(node('h3',role==='carry'?'携帯・持ち方':'使用動作'));const rows=waFor(p,value,role);
  if(!Object.hasOwn(session,role+'Id')&&rows.length)session[role+'Id']=rows[0].id;
  const a=rows.find(a=>a.id===session[role+'Id']);
  if(rows.length)paField(area,'編集する'+(role==='carry'?'携帯状態':'動作'),[['','新しく追加'],...rows.map((a,i)=>[a.id,(i+1)+'. '+paSummary(a,p)])],a?.id||'',id=>{session[role+'Id']=id;ctx.redraw()},role+'Instance');
  paField(area,role==='carry'?'持ち方を選ぶ':'使い方を選ぶ',[['','指定なし'],...waChoices(p,value,role).map(d=>[d.id,d.name])],a?.weaponAction||'',id=>{if(!id){if(a)waEdit(ctx,()=>waDrop(p,a.id));return}waRequest(root,p,session,ctx,value,id,a?.id||'')},role+'Preset');
  if(a){if(a.weaponAction)waDrawActionFields(area,a,p,ctx);else area.append(node('p','既存ポーズです。この動作IDだけを編集します。','paNotice'));
   area.append(paButton('ポーズでこの動作を編集',()=>ctx.openPose(a.id)),paButton('× この指定を解除',()=>waEdit(ctx,()=>waDrop(p,a.id))));
  }
  if(role==='use'&&rows.length>1)area.append(node('p','同じ武器に複数の動作があります。上の「編集する動作」で対象を切り替えてください。','paWarning'));
  root.append(area);
 }
 for(const text of waConflicts(p))root.append(node('p',text,'paWarning'));
 waDrawLegacy(root,p,session,ctx);
}
const waLegacyMap={'holding a weapon':'carry-hold','readying a weapon':'carry-ready','drawn weapon':'carry-drawn','weapon on back':'carry-back','weapon at waist':'carry-waist','weapon planted in the ground':'carry-planted'};
function waDrawLegacy(root,p,session,ctx){
 const values=asList(p.detail?.weaponState);if(!values.length&&!p.detailCustom?.weaponState)return;
 const section=node('details',undefined,'waLegacy');section.open=true;section.append(node('summary','以前の共通状態'),node('p','武器との対応がない旧指定です。移す武器を選んでから明示的に移行できます。','paNotice'));
 for(const value of values){const row=node('div',undefined,'waLegacyRow'),preset=waLegacyMap[value],edited=personOptionEdits['detail:weaponState|'+value]?.value,duplicate=waFor(p,session.weaponTarget,'carry').some(a=>a.weaponAction===preset),can=!duplicate&&(!edited||edited===value)&&waWeapons(p).some(w=>w.id===session.weaponTarget)&&waChoices(p,session.weaponTarget,'carry').some(d=>d.id===preset);
  row.append(node('span',detailLabel('weaponState',value)));
  if(edited&&edited!==value)row.append(node('p','英文を編集した旧指定です。共通状態として保持しています。','paNotice'));
  if(duplicate)row.append(node('p','この武器には同じ状態があります。重複を避けるため、移行前にどちらかの指定を解除してください。','paWarning'));
  const move=paButton('この武器へ移す',()=>{if(!can)return;const draft=structuredClone(p);waApplyPreset(draft,session.weaponTarget,preset);if(waConflicts(draft).length){row.append(node('p','使用動作と競合します。携帯・持ち方を調整してから移してください。','paWarning'));return}waEdit(ctx,()=>{const a=waApplyPreset(p,session.weaponTarget,preset);if(!a)return;const weight=p.itemWeights?.weaponState?.[value];if(weight!==undefined)a.weight=weight;const shade=p.itemColors?.weaponState?.[value];if(shade)a.color=typeof shade==='string'?shade:[shade.primary,shade.secondary].filter(Boolean).join(' ');p.detail.weaponState=asList(p.detail.weaponState).filter(v=>v!==value);personItemContext('detail:weaponState',ctx.personId||null,p)?.remove(value)})});move.disabled=!can;row.append(move,paButton('× 旧指定を解除',()=>waEdit(ctx,()=>{p.detail.weaponState=asList(p.detail.weaponState).filter(v=>v!==value)})));section.append(row);
 }
 if(p.detailCustom?.weaponState){const text=node('textarea');text.value=p.detailCustom.weaponState;text.setAttribute('aria-label','追加した共通状態（英語）');text.onchange=()=>waEdit(ctx,()=>{p.detailCustom.weaponState=text.value});section.append(node('label','追加した共通状態（英語）'),text,paButton('× 追加した共通状態を解除',()=>waEdit(ctx,()=>{p.detailCustom.weaponState=''})))}root.append(section);
}
function waSimpleContext(){const s=simpleActive,p=profiles[s.personId];return {personId:s.personId,changed:()=>simpleRefresh(),redraw:()=>renderSimpleTarget(),selectWeapons:()=>{s.section='武器';renderSimpleTarget()},openPose:id=>waOpenPersonPose(s.personId,id)}}
function waCardEntries(p,open,drop){return paRows(p).filter(a=>waRef(a)).map(a=>({label:waWeaponName(waRef(a).id)+'：'+paName(a)+(paProblem(a,p)?'（'+paProblem(a,p)+'）':''),name:waWeaponName(waRef(a).id)+'：'+paName(a),value:a.id,field:'poseActions',action:a,open:()=>open(a),remove:()=>drop(a)}))}
function waOpenPersonWeapon(personId,a){openSimpleTarget('weapon',personId,'装備・動作');simpleActive.weaponTarget=waRef(a)?.id;simpleActive[(waPresetMap.get(a.weaponAction)?.role||'use')+'Id']=a.id;renderSimpleTarget()}
function waOpenCreatureWeapon(s,mode,initial=null){
 uHumanGuard(s,mode);const p=s.byMode[mode].record,d=actorFormDialogShell('unifiedHumanGroupDialog','武器'),session={tab:initial?'装備・動作':'武器',...(initial?{weaponTarget:waRef(initial)?.id,[(waPresetMap.get(initial.weaponAction)?.role||'use')+'Id']:initial.id}:{})};$(d.id+'Title').textContent='武器';
 const ctx={transient:true,creatureState:s,guard:()=>uHumanGuard(s,mode),redraw:draw,changed:()=>{creatureHumanEditorMark();draw()},selectWeapons:()=>{session.tab='武器';draw()},openPose:id=>{d.close();s.tab='basic';s.page=0;renderCreatureHumanEditor();$('creatureHumanEditorGrid')?.querySelector('[data-atomic-pose]')?.pickerApi.open(id)}};
 function draw(){ctx.guard();for(const child of [...d.children].slice(1))child.remove();const tabs=node('div',undefined,'waTabs');for(const tab of ['武器','装備・動作']){const b=paButton(tab,()=>{session.tab=tab;draw()});b.setAttribute('role','tab');b.setAttribute('aria-selected',String(session.tab===tab));tabs.append(b)}d.append(tabs);const body=node('div',undefined,'dialogBody waEditor');d.append(body);if(session.tab==='装備・動作'){waDraw(body,p,session,ctx);return}
  const query=node('input');query.type='search';query.placeholder='武器を検索';query.setAttribute('aria-label','武器を検索');query.value=session.query||'';query.oninput=()=>{session.query=query.value;renderList()};body.append(query);
  paField(body,'武器の分類',[['','すべての分類'],...waGroups.map(g=>[g,g])],session.category||'',v=>{session.category=v;renderList()},'weaponCategory');
  paField(body,'表示',[['all','すべて'],['selected','選択中'],['favorite','★お気に入り']],session.filter||'all',v=>{session.filter=v;renderList()},'weaponFilter');const list=node('div',undefined,'waWeaponList');body.append(list);body.append(paButton('候補管理',()=>{const target=candidateAddTarget('detail:weapon');openCandidateManage(target.section,'detail:weapon')}),paButton('独自武器を追加',()=>openEditor('detail:weapon')));
  function renderList(){list.replaceChildren();for(const [value,rawName,rawGroup]of detailOptions.weapon.options){if(/shield|buckler/.test(value))continue;const selected=asList(p.detail.weapon).includes(value),edit=personOptionEdits['detail:weapon|'+value],name=edit?.name||rawName,group=candidateDisplayRule('detail:weapon',value,name,rawGroup).group;if(maIsHidden('detail:weapon',value)&&!selected||session.category&&group!==session.category||session.query&&!(name+' '+value).toLowerCase().includes(session.query.toLowerCase())||session.filter==='selected'&&!selected||session.filter==='favorite'&&!usageFavorite('person:武器',value))continue;
    const row=node('div',undefined,'waWeaponRow'),label=node('label',name),check=node('input');check.type='checkbox';check.checked=selected;check.dataset.value=value;check.onchange=()=>waEdit(ctx,()=>{p.detail.weapon=check.checked?[...new Set([...asList(p.detail.weapon),value])]:asList(p.detail.weapon).filter(v=>v!==value);if(check.checked)usageRemember('person:武器',value)});label.prepend(check);row.append(label,paButton(usageFavorite('person:武器',value)?'★':'☆',()=>{toggleUsageFavorite('person:武器',value);renderList()}),paButton('編集',()=>openPersonOptionEditor({source:'detail:weapon'},value,name,group)));list.append(row);
  }}renderList();
 }
 const editors=[$('editor'),$('personOptionEditor'),maDialog],refresh=()=>{if(d.open&&s===creatureHumanEditorState)draw()};for(const editor of editors)editor?.addEventListener('close',refresh);
 draw();d.onclose=()=>{for(const editor of editors)editor?.removeEventListener('close',refresh);if(s===creatureHumanEditorState)renderCreatureHumanEditor()};actorFormFocusReturn(d,null);
}
