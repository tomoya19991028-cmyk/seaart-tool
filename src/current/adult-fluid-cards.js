
// 成人向けの追加候補と、種類・状態・付着先を分けた体液カード。
(function(){
  if(window.__adultFluidCardV1)return;
  window.__adultFluidCardV1=true;

  function addUnique(rows,row){
    if(!Array.isArray(rows))return;
    if(!rows.some(function(old){return String(old[0]).toLowerCase()===String(row[0]).toLowerCase()}))rows.push(row);
  }
  function addPreset(field,label,rows){
    adultPresets[field]=adultPresets[field]||{label:label,items:[]};
    adultPresets[field].label=label;
    adultPresets[field].items=Array.isArray(adultPresets[field].items)?adultPresets[field].items:[];
    rows.forEach(function(row){addUnique(adultPresets[field].items,row)});
    if(!Array.isArray(adultCustom[field]))adultCustom[field]=[];
  }

  addUnique(adultBodyOptions.bustShape,['sagging breasts','垂れた胸','形・質感']);
  addUnique(adultBodyOptions.nipple,['inverted nipples','陥没乳首','形・質感']);
  addUnique(adultPresets.exposure.items,['pubic hair','陰毛','性器・詳細']);
  addPreset('sexualContact','性的な接触',[
    ['nipple licking','乳首舐め','胸'],
    ['breast massage','胸揉み','胸'],
    ['clitoris stimulation','クリトリス刺激','性器']
  ]);
  addPreset('sexualAct','性行為',[
    ['reverse cowgirl','背面騎乗位（膣性交）','姿勢'],
    ['legs up missionary','足上げ正常位（膣性交）','姿勢']
  ]);
  const featuredAdultExpressions=[
    ['ohogao','オホ顔','成人表情'],
    ['heart-shaped pupils','ハート目','成人表情'],
    ['wavy mouth','乱れた口元','成人表情']
  ];
  const featuredAdultExpressionValues=new Set(featuredAdultExpressions.map(function(row){return row[0]}));
  // The audit picker hides uncatalogued legacy rows before personManualCandidateAllowed runs.
  // Register these newly curated adult expressions as visible rows at the audit-routing stage.
  const visibleAdultExpressionValues=[
    ...featuredAdultExpressionValues,
    'aroused expression','lustful gaze','expression of pleasure','ecstatic expression',
    'orgasmic expression','teary-eyed pleasure','lewd smile'
  ];
  for(const value of visibleAdultExpressionValues)
    adultAuditDisplayRules['adult:expression'][value]={card:'expression',tab:'表情'};
  const priorCommonAdultExpression=commonAdultExpression;
  commonAdultExpression=function(value){return featuredAdultExpressionValues.has(value)?null:priorCommonAdultExpression(value)};
  const priorManualCandidateAllowed=personManualCandidateAllowed;
  personManualCandidateAllowed=function(source,value,name,query,picked,kind,picker){
    if(featuredAdultExpressionValues.has(value)&&(source==='adult:expression'||source==='catalog:expression'||picker?.title==='成人表情'))return true;
    return priorManualCandidateAllowed.apply(this,arguments);
  };
  adultPresets.expression.label='成人表情';
  for(const row of featuredAdultExpressions.slice().reverse()){
    const existingIndex=adultPresets.expression.items.findIndex(function(old){return old[0]===row[0]});
    if(existingIndex>=0)adultPresets.expression.items.splice(existingIndex,1);
    adultPresets.expression.items.unshift(row);
  }
  addUnique(adultSharedBase.reactionEffect,['steam','湯気・熱気','画面効果']);

  addPreset('fluidType','体液の種類',[
    ['saliva','唾液','種類'],
    ['pussy juice','愛液','種類'],
    ['semen','精液','種類']
  ]);
  addPreset('fluidState','状態・排出',[
    ['dripping','滴り','状態'],
    ['stringy fluid','糸引き','状態'],
    ['squirting','潮吹き','排出'],
    ['puddle','溜まり','状態']
  ]);
  addPreset('fluidTarget','付着先',[
    ['on skin','肌','対象'],
    ['on face','顔','対象'],
    ['on breasts','胸','対象'],
    ['on abdomen','腹部','対象'],
    ['on genitals','性器','対象'],
    ['on thighs','太もも','対象'],
    ['on clothing','衣装','対象'],
    ['on bedding','寝具','対象']
  ]);

  const priorDefinitions=pgAdultDefinitions;
  pgAdultDefinitions=function(){
    const definitions=priorDefinitions().map(function(definition){return definition[0]==='expression'?[definition[0],'成人表情',definition[2]]:definition});
    if(!definitions.some(function(row){return row[0]==='fluids'}))
      definitions.push(['fluids','体液・付着',[['adult','fluidType'],['adult','fluidState'],['adult','fluidTarget']]]);
    return definitions;
  };

  const relationOverrides={
    sexualContact:{
      'nipple licking':{
        sourcePrompt:"licking the partner's nipples",
        targetPrompt:'having their nipples licked',
        relationPrompt:"Character A licking Character B's nipples"
      },
      'breast massage':{
        sourcePrompt:"massaging the partner's breasts",
        targetPrompt:'having their breasts massaged',
        relationPrompt:"Character A massaging Character B's breasts"
      },
      'clitoris stimulation':{
        sourcePrompt:"stimulating the partner's clitoris",
        targetPrompt:'having their clitoris stimulated',
        relationPrompt:"Character A stimulating Character B's clitoris"
      }
    },
    sexualAct:{
      'reverse cowgirl':{
        sourcePrompt:'reverse cowgirl position during vaginal intercourse',
        targetPrompt:'being vaginally penetrated in reverse cowgirl position',
        relationPrompt:'vaginal intercourse in reverse cowgirl position between Character A and Character B'
      },
      'legs up missionary':{
        sourcePrompt:'legs-up missionary position during vaginal intercourse',
        targetPrompt:'being vaginally penetrated in legs-up missionary position',
        relationPrompt:'vaginal intercourse in legs-up missionary position between Character A and Character B'
      }
    }
  };

  const priorAdultPersonPrompt=adultPersonPrompt;
  adultPersonPrompt=function(person,people){
    const output=priorAdultPersonPrompt.apply(this,arguments);
    if(!person||!Array.isArray(people)||!adultReadyFor(people)||mfIsMotif(person.id)||mfIsMotif(adultScene.people?.[person.id]?.target))return output;
    const items=Array.isArray(output)?output.slice():[];
    const eligible=mfAdultPeople(people);
    for(const source of eligible){
      const adult=adultScene.people[source.id]||{};
      for(const field of ['sexualContact','sexualAct']){
        const targetField=field==='sexualContact'?'contactTarget':'sexualActTarget';
        const target=eligible.find(function(candidate){return candidate.id===adult[targetField]&&candidate.id!==source.id});
        for(const value of asList(adult[field])){
          const mapping=relationOverrides[field]?.[value];
          if(!mapping)continue;
          const weight=profiles[source.id]?.itemWeights?.['adult:'+field]?.[value]??1;
          if(source.id===person.id){
            const oldPrompt=explicitWeight(personOutputValue('adult:'+field,value),weight);
            for(let i=items.length-1;i>=0;i--)if(items[i]===oldPrompt)items.splice(i,1);
            items.push(explicitWeight(mapping.sourcePrompt,weight));
          }
          if(target?.id===person.id&&mapping.targetPrompt)
            items.push(explicitWeight(mapping.targetPrompt,weight));
        }
      }
    }
    const adult=adultScene.people[person.id]||{};
    for(const field of ['fluidType','fluidState','fluidTarget']){
      for(const value of asList(adult[field]))
        items.push(explicitWeight(personOutputValue('adult:'+field,value),profiles[person.id]?.itemWeights?.['adult:'+field]?.[value]??1));
    }
    return [...new Set(items.filter(Boolean))];
  };

  const priorAdultInteractionPrompt=adultInteractionPrompt;
  adultInteractionPrompt=function(people){
    const previous=priorAdultInteractionPrompt.apply(this,arguments);
    if(!Array.isArray(people)||!adultReadyFor(people))return previous;
    const eligible=mfAdultPeople(people),remove=new Set(),specific=[];
    for(const source of eligible){
      const adult=adultScene.people[source.id]||{};
      for(const field of ['sexualContact','sexualAct']){
        const targetField=field==='sexualContact'?'contactTarget':'sexualActTarget';
        const target=eligible.find(function(candidate){return candidate.id===adult[targetField]&&candidate.id!==source.id});
        if(!target)continue;
        for(const value of asList(adult[field])){
          const mapping=relationOverrides[field]?.[value];
          if(!mapping)continue;
          remove.add((field==='sexualContact'?'sexual contact':'sexual act')+' between '+source.name+' and '+target.name);
          specific.push(mapping.relationPrompt.replace(/\bCharacter A\b/g,source.name).replace(/\bCharacter B\b/g,target.name));
        }
      }
    }
    if(!specific.length)return previous;
    const oldParts=(Array.isArray(previous)?previous:[previous]).filter(Boolean).flatMap(function(value){return String(value).split(/(?<=\.)\s+/)}).map(function(value){return value.trim()}).filter(Boolean);
    const kept=oldParts.filter(function(value){return !remove.has(value.replace(/[.]+$/,''))});
    const combined=[...new Set([...kept,...specific])];
    return typeof promptIsNatural==='function'&&promptIsNatural()?[combined.join('. ').replace(/[.]+$/,'')+'.']:combined;
  };

  function fluidCardSummary(){
    const grid=$('adultDashboard'),tile=grid?.querySelector('[data-adult-card="fluids"]');
    if(!tile)return;
    const launch=tile.querySelector(':scope>.personLaunch'),boxes=[...tile.querySelectorAll('.dialogBody>.personPicker')];
    if(!launch||boxes.length!==3)return;
    const headings=['種類','状態','付着先'],entries=[];
    boxes.forEach(function(box,index){
      const api=box.pickerApi;if(!api)return;
      for(const value of asList(api.getValues())){
        const label=api.options.find(function(row){return row[0]===value})?.[1]||value;
        entries.push({
          name:headings[index]+'：'+label,
          value:value,
          remove:function(){api.setValues(asList(api.getValues()).filter(function(v){return v!==value}));dirty();fluidCardSummary()},
          open:function(){launch.click()}
        });
      }
    });
    renderUnifiedCard(tile,launch,'体液・付着',entries);
  }
  function bindFluidCard(){
    if(!adultReady())return;
    const person=allPeople().find(function(item){return item.id===personKey})||allPeople()[0];
    const tile=$('adultDashboard')?.querySelector('[data-adult-card="fluids"]');
    if(!person||!tile)return;
    const launch=tile.querySelector(':scope>.personLaunch'),boxes=[...tile.querySelectorAll('.dialogBody>.personPicker')];
    if(!launch||boxes.length!==3)return;
    const tabs=['種類','状態','付着先'];
    const entries=boxes.map(function(box,index){
      const api=box.pickerApi;
      return {box:box,field:api?.source,title:box.dataset.pickerTitle||api?.title,tab:tabs[index],ownerId:person.id,refreshCard:fluidCardSummary};
    });
    launch.onclick=function(){openGroupedPersonDisplay('details','体液・付着',entries,launch,person)};
    fluidCardSummary();
  }

  const priorRefreshAuditCards=refreshAdultAuditCards;
  refreshAdultAuditCards=function(){
    const result=priorRefreshAuditCards.apply(this,arguments);
    fluidCardSummary();
    return result;
  };
  const priorRenderAdultDashboard=renderAdultDashboard;
  renderAdultDashboard=function(){
    const result=priorRenderAdultDashboard.apply(this,arguments);
    bindFluidCard();
    return result;
  };
  if(window.appReady)renderAdultDashboard(true);
})();
