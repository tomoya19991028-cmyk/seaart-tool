
// 成人向けカードを再編：胸詳細・接触/行為のタブ化、4枚ずつの2ページ表示。
(function(){
  const priorDefinitions=pgAdultDefinitions;
  pgAdultDefinitions=function(){
    const source=priorDefinitions(),contact=source.find(function(def){return def[0]==='sexualContact'}),act=source.find(function(def){return def[0]==='sexualAct'}),result=[];
    source.forEach(function(def){
      const key=def[0];
      if(key==='body'||key==='sexualAct')return;
      if(key==='details'){
        const fields=def[2].slice();
        if(!fields.some(function(field){return field[0]==='detail'&&field[1]==='bust'}))fields.unshift(['detail','bust']);
        result.push([key,def[1],fields]);return;
      }
      if(key==='sexualContact'){
        result.push(['sexualInteraction','性的接触・行為',[...(contact?.[2]||[]),...(act?.[2]||[])]]);return;
      }
      if(key==='scene'){
        const effects=def[2].filter(function(field){return ['soundEffect','reactionEffect'].includes(field[1])});
        const scene=def[2].filter(function(field){return !['soundEffect','reactionEffect'].includes(field[1])});
        result.push([key,def[1],scene]);
        if(effects.length)result.push(['effects','擬音・反応エフェクト',effects]);
        return;
      }
      result.push(def);
    });
    return result;
  };

  let page=0,owner='';
  const pageSize=4,interactionTitle='性的接触・行為',effectsTitle='擬音・反応エフェクト';
  const style=document.createElement('style');
  style.textContent='.adultDashboard{grid-template-rows:repeat(2,minmax(0,1fr))!important}.adultDashboardPager{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;flex:none;min-height:42px}.adultDashboardPager[hidden]{display:none!important}.adultDashboardPager button{min-height:40px;padding:6px 12px}.adultDashboardPager span{text-align:center;color:var(--muted);font-size:.85rem;white-space:nowrap}';
  document.head.append(style);

  function updateManagedSummary(card,key,title,person){
    const launch=card?.querySelector(':scope>.personLaunch');if(!launch)return;
    const entries=[],adult=adultScene.people?.[person.id]||{};
    [...card.querySelectorAll('.dialogBody>.personPicker')].forEach(function(box,index){
      const api=box.pickerApi;if(!api)return;
      const act=String(api.source||'').includes('sexualAct')||index===1;
      const heading=key==='sexualInteraction'?(act?'行為':'接触'):(index===0?'擬音':'反応');
      const entry={box,ownerId:key==='effects'?null:person.id,refreshCard:function(){updateManagedSummary(card,key,title,person)}};
      for(const value of asList(api.getValues())){
        const selected=adultCardEntry(entry,value);selected.name=heading+'：'+selected.name;entries.push(selected);
      }
      if(key==='sexualInteraction'){
        const field=act?'sexualActTarget':'contactTarget',target=allPeople().find(item=>item.id===adult[field]);
        if(target)entries.push({name:heading+'の相手：'+target.name,open:()=>launch.click(),remove:function(){adult[field]='';updateManagedSummary(card,key,title,person);dirty()}});
      }
    });
    if(key==='effects')for(const [field,heading] of [['soundEffectText','日本語擬音'],['reactionEffectText','追加エフェクト']]){
      const value=String(adultScene[field]||'').trim();if(!value)continue;
      entries.push({name:heading+'：'+value,value,open:()=>launch.click(),remove:function(){
        adultScene[field]='';updateManagedSummary(card,key,title,person);
        const input=$(field==='soundEffectText'?'adultSoundEffectJapaneseText':'adultReactionEffectFreeText');if(input)input.value='';dirty();
      }});
    }
    renderUnifiedCard(card,launch,title,entries);
  }

  function openTabbedCard(key,title,entries,launch,person,adult){
    const mapped=entries.map(function(entry){return {...entry,tab:entry.tab||entry.title}});
    openAdultDisplayBeforeAudit('details',title,mapped,launch,person,adult);
    if(adultDisplaySession){adultDisplaySession.key=key;adultDisplaySession.adult=adult;renderPersonChoiceDialog()}
  }

  function bindManagedCard(card,key,title,person){
    if(!card)return;
    const launch=card.querySelector(':scope>.personLaunch'),adult=adultScene.people[person.id]||{},boxes=[...card.querySelectorAll('.dialogBody>.personPicker')];
    if(!launch||!boxes.length)return;
    const entries=boxes.map(function(box,index){
      const api=box.pickerApi;if(!api)return null;
      let tab;
      if(key==='sexualInteraction')tab=String(api.source||'').includes('sexualAct')||index===1?'性行為':'性的な接触';
      else tab=String(api.source||'').includes('reactionEffect')||index===1?'反応エフェクト':'擬音';
      return {box:box,field:api.source,title:box.dataset.pickerTitle||api.title,tab:tab,ownerId:person.id,refreshCard:function(){updateManagedSummary(card,key,title,person)}};
    }).filter(Boolean);
    launch.onclick=function(){openTabbedCard(key,title,entries,launch,person,adult)};
    updateManagedSummary(card,key,title,person);
  }

  const priorRenderDashboard=renderAdultDashboard;
  renderAdultDashboard=function(force){
    const person=allPeople().find(function(item){return item.id===personKey})||allPeople()[0];
    if(person?.id!==owner){owner=person?.id||'';page=0}
    const definitions=pgAdultDefinitions(),pageCount=Math.max(1,Math.ceil(definitions.length/pageSize));
    page=Math.max(0,Math.min(page,pageCount-1));
    const existing=$('adultDashboard'),rebuild=!!force||!existing||existing.dataset.page!==String(page)||existing.dataset.owner!==person?.id;
    const fullDefinitions=pgAdultDefinitions;
    pgAdultDefinitions=function(){return definitions.slice(page*pageSize,(page+1)*pageSize)};
    let result;
    try{result=priorRenderDashboard.call(this,rebuild)}finally{pgAdultDefinitions=fullDefinitions}
    const grid=$('adultDashboard');if(!grid||!window.appReady||!adultReady())return result;
    grid.dataset.page=String(page);grid.dataset.pageCount=String(pageCount);
    let pager=$('adultDashboardPager');
    if(!pager){pager=node('nav',undefined,'adultDashboardPager');pager.id='adultDashboardPager'}
    grid.after(pager);pager.hidden=pageCount<2;pager.replaceChildren();
    if(pageCount>1){
      const previous=node('button','前へ','secondary'),label=node('span',(page+1)+' / '+pageCount+' ページ'),next=node('button','次へ','secondary');
      previous.type=next.type='button';previous.disabled=page===0;next.disabled=page===pageCount-1;
      previous.setAttribute('aria-label','前の成人向けカードページ');next.setAttribute('aria-label','次の成人向けカードページ');
      previous.onclick=function(){page=Math.max(0,page-1);renderAdultDashboard(true)};
      next.onclick=function(){page=Math.min(pageCount-1,page+1);renderAdultDashboard(true)};
      pager.append(previous,label,next);
    }
    const currentPerson=allPeople().find(function(item){return item.id===personKey})||allPeople()[0];
    if(currentPerson){bindManagedCard(grid.querySelector('[data-adult-card="sexualInteraction"]'),'sexualInteraction',interactionTitle,currentPerson);bindManagedCard(grid.querySelector('[data-adult-card="effects"]'),'effects',effectsTitle,currentPerson)}
    return result;
  };

  const priorRenderPersonChoice=renderPersonChoiceDialog;
  renderPersonChoiceDialog=function(){
    priorRenderPersonChoice.apply(this,arguments);
    const session=adultDisplaySession;if(session?.key!=='sexualInteraction'||!session.person||!session.adult)return;
    const root=$('personChoiceChoices');if(!root)return;
    const field=session.tab==='性行為'?'sexualActTarget':'contactTarget',others=mfAdultPeople(allPeople()).filter(function(item){return item.id!==session.person.id});
    if(!others.length)return;
    const label=node('label',field==='sexualActTarget'?'性行為の相手':'性的な接触の相手'),select=node('select');
    select.setAttribute('data-adult-target',field);select.setAttribute('aria-label',label.textContent);select.append(new Option('相手を選択',''));
    others.forEach(function(item){select.append(new Option(item.name,item.id))});
    if(!others.some(function(item){return item.id===session.adult[field]}))session.adult[field]='';
    select.value=session.adult[field]||'';
    select.onchange=function(){session.adult[field]=select.value;dirty();const card=document.querySelector('[data-adult-card="sexualInteraction"]');if(card)updateManagedSummary(card,'sexualInteraction',interactionTitle,session.person);renderPersonChoiceDialog()};
    label.append(select);root.prepend(label);
  };

  if(window.appReady){try{renderAdultDashboard(true)}catch(error){console.warn('成人向けカードの再構成に失敗しました',error)}}
})();
