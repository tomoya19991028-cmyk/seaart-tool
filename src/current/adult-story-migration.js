
// 成人向けの漫画プリセットを、既存のストーリー選択から選べるようにする。
(function(){
  const adultGenreId='adult-story';
  const adultActionPriority={'consensual sex':70,'oral sex':68,'masturbating':66,'caressing':48,'kissing':46,'undressing':36,'embracing tightly':28,'looking at the other character':10};
  const adultRolePriority={'main erotic panel':60,'climax lead-up panel':52,'kissing panel':42,'caressing panel':40,'intimate approach panel':28,'establishing erotic panel':18,'afterglow panel':5};
  function adultCoreIndex(steps){
    let best=0,bestScore=-Infinity;const middle=(steps.length-1)/2;
    steps.forEach(function(step,index){const score=(adultRolePriority[step.storyRole]||0)+(adultActionPriority[step.storyAction]||0)-Math.abs(index-middle);if(score>bestScore){best=index;bestScore=score}});
    return best;
  }
  function adultCameraVariant(step,variant){
    const cameras=['full-body shot','cowboy shot','upper body shot','close-up'];
    const current=cameras.indexOf(step.camera);return cameras[(Math.max(0,current)+variant)%cameras.length];
  }
  function adaptAdultStorySteps(source,count){
    const steps=(source||[]).map(function(step){return {...step}});if(!steps.length)return [];
    const core=adultCoreIndex(steps);
    if(count===1)return [{...steps[core]}];
    if(count===2){const opener=core===0?Math.min(1,steps.length-1):0;return [{...steps[opener]},{...steps[core]}]}
    if(count===3){const middle=core===0?Math.min(1,steps.length-1):core;return [{...steps[0]},{...steps[middle]},{...steps[steps.length-1]}]}
    if(count<=steps.length)return steps.slice(0,count);
    const expanded=steps.slice(),extra=count-steps.length,leadIndex=Math.max(0,core-1),lead={...steps[leadIndex],camera:adultCameraVariant(steps[leadIndex],1)};
    if(['consensual sex','oral sex','masturbating'].includes(steps[core].storyAction))lead.storyRole='climax lead-up panel';
    else if(steps[leadIndex].storyAction==='kissing')lead.storyRole='kissing panel';
    else if(steps[leadIndex].storyAction==='caressing')lead.storyRole='caressing panel';
    expanded.splice(core,0,lead);
    if(extra>1){const coreCopy={...steps[core],camera:adultCameraVariant(steps[core],2)};expanded.splice(core+2,0,coreCopy)}
    return expanded.slice(0,count);
  }
  const adultPatterns=mangaPagePresetRows('adult').map(function(preset){
    return {id:preset.id,name:preset.name,adultStory:true,pagePresetId:preset.id,count:preset.count,byCount:Object.fromEntries([1,2,3,4,5,6].map(function(count){return [count,adaptAdultStorySteps(preset.steps,count)]}))};
  });
  let adultGenre=mangaStoryPresets.find(function(genre){return genre.id===adultGenreId});
  if(adultGenre)adultGenre.patterns=adultPatterns;
  else{adultGenre={id:adultGenreId,name:'成人向け',patterns:adultPatterns};mangaStoryPresets.push(adultGenre)}

  const adultStorySelected=function(){return mangaStorySelection().genre?.id===adultGenreId};
  const adultStoryRequirement=function(pattern,steps){
    if(!pattern)return '';
    if(!Array.isArray(steps)||steps.length!==mangaState.count)return '選択中のコマ数に合わせた構成を用意できませんでした。';
    if(steps.some(function(step){return String(step.storySubject||'').includes('second character')})&&mangaPeople().length<2)return 'この構成には人物が2人以上必要です。';
    if(!adultReady())return '人物ページで、登場人物全員の成人確認と合意確認を完了してください。';
    return '';
  };

  const oldMangaStorySignature=mangaStorySignature;
  mangaStorySignature=function(){
    const signature=oldMangaStorySignature();
    if(!adultStorySelected())return signature;
    const panelState=mangaState.panels.slice(0,mangaState.count).map(function(panel){return [panel.storySubject,panel.storyPose,panel.storyExpression,panel.storyAction,panel.place,panel.camera]});
    return JSON.stringify([signature,panelState]);
  };

  const adultRoleNames={'establishing erotic panel':'導入','intimate approach panel':'接近','kissing panel':'キス','caressing panel':'愛撫','main erotic panel':'見せ場','climax lead-up panel':'絶頂前','afterglow panel':'余韻'};
  const adultSubjectNames={'first character':'A','second character':'B','two characters, first character and second character':'AとB','body focus':'身体中心'};
  const adultPoseNames={'standing':'立つ','sitting':'座る','lying down':'寝ている','lying on back':'仰向け','lying on stomach':'うつ伏せ','lying on side':'横向き','straddling':'またがる','facing each other':'向かい合う','embracing':'抱き合う'};
  const adultExpressionNames={'shy expression':'恥じらい','pleasured expression':'うっとり','seductive expression':'誘惑的','blushing expression':'照れ','serious expression':'真剣','happy expression':'幸せ'};
  const adultActionNames={'looking at the other character':'相手を見つめる','kissing':'キスする','embracing tightly':'抱きしめる','caressing':'愛撫する','undressing':'脱がす','masturbating':'自慰','oral sex':'オーラル','consensual sex':'性行為'};
  const renderMangaStoryBeforeAdult=renderMangaStory;
  renderMangaStory=function(){
    const result=renderMangaStoryBeforeAdult.apply(this,arguments),selection=mangaStorySelection();
    if(selection.genre?.id!==adultGenreId)return result;
    const reason=adultStoryRequirement(selection.pattern,selection.steps),available=!!selection.pattern&&!reason;
    $('mangaStoryPreviewOpen').disabled=!available;
    const previewMatches=!!(mangaStoryPreview?.adultStory&&mangaStoryPreview.signature===mangaStorySignature());
    $('mangaStoryApply').disabled=!available||!previewMatches;
    $('mangaStoryHint').textContent=reason||'1〜6コマに合わせて展開します。プレビュー後に適用できます。人物の基本設定とコマ割りは保持されます。';
    if(previewMatches){
      const list=$('mangaStorySteps');list.replaceChildren();
      for(const [index,step] of mangaStoryPreview.steps.entries()){
        const row=node('li'),title=node('strong',adultRoleNames[step.storyRole]||step.label||'コマ'+(index+1));
        const place=mangaSceneName('place',step.place)||step.place||'';
        const detail=[adultSubjectNames[step.storySubject]||'',adultActionNames[step.storyAction]||step.storyAction||'',adultPoseNames[step.storyPose]||step.storyPose||'',adultExpressionNames[step.storyExpression]||step.storyExpression||'',place].filter(Boolean).join('・');
        row.append(title,node('span',detail,'small'));list.append(row);
      }
      const note=$('mangaStoryPreview').querySelector('p.small');
      if(note)note.textContent='適用すると各コマの成人向け場面・主役・体勢・表情・行動、場所・カメラを設定します。人物の基本設定は保持されます。';
    }
    const adultApplied=!!(mangaState.storyAdult&&mangaState.story?.applied?.genre===adultGenreId&&lastMangaPageBeforePreset);
    const undo=$('undoMangaStory');
    undo.hidden=!adultApplied&&!selection.story.undo?.changes.length;
    if(adultApplied){undo.disabled=false;undo.textContent='適用を戻す'}
    return result;
  };

  const previewMangaStoryBeforeAdult=previewMangaStory;
  previewMangaStory=function(){
    if(!adultStorySelected())return previewMangaStoryBeforeAdult();
    const selection=mangaStorySelection(),reason=adultStoryRequirement(selection.pattern,selection.steps);
    if(reason){mangaStoryPreview=null;renderMangaStory();toast(reason);return false}
    mangaStoryPreview={genre:selection.genre.id,pattern:selection.pattern.id,count:mangaState.count,steps:JSON.parse(JSON.stringify(selection.steps)),signature:mangaStorySignature(),adultStory:true};
    renderMangaStory();return true;
  };

  const applyMangaStoryBeforeAdult=applyMangaStory;
  applyMangaStory=function(){
    if(!adultStorySelected())return applyMangaStoryBeforeAdult();
    const selection=mangaStorySelection(),preview=mangaStoryPreview,reason=adultStoryRequirement(selection.pattern,selection.steps);
    if(reason||!preview?.adultStory||preview.signature!==mangaStorySignature()){
      mangaStoryPreview=null;renderMangaStory();if(reason)toast(reason);return false;
    }
    const preset=resolveMangaPagePreset(selection.pattern.pagePresetId);
    if(!preset?.adult){toast('成人向けストーリーを適用できませんでした');return false}
    lastMangaPageBeforePreset=JSON.parse(JSON.stringify(mangaState));
    mangaState.story=normalizeMangaStory();mangaState.storyAdult=true;mangaStoryPreview=null;
    for(let index=0;index<6;index++){
      const previous=mangaState.panels[index],step=selection.steps[index]||{};
      mangaState.panels[index]={description:step.description||'',camera:step.camera||'',background:'',place:step.place||'',action:'',beat:'',mood:'',storyRole:step.storyRole||'',storySubject:step.storySubject||'',storyPose:step.storyPose||'',storyExpression:step.storyExpression||'',storyAction:step.storyAction||'',creatures:normalizeMangaCreatures(previous?.creatures),people:{}};
      mangaKeepSubjectSettings(mangaState.panels[index],previous);
    }
    const story=mangaState.story??=normalizeMangaStory();
    story.genre=adultGenreId;story.pattern=selection.pattern.id;story.applied={genre:adultGenreId,pattern:selection.pattern.id,count:mangaState.count,at:new Date().toISOString()};story.undo=null;
    $('undoMangaPagePreset').hidden=false;renderManga();mangaView='panels';layoutManga();dirty();renderMangaStory();toast(selection.pattern.name+'を'+mangaState.count+'コマに適用しました');return true;
  };

  const undoMangaStoryBeforeAdult=$('undoMangaStory').onclick;
  $('undoMangaStory').onclick=function(event){
    if(mangaState.storyAdult&&mangaState.story?.applied?.genre===adultGenreId&&lastMangaPageBeforePreset){
      const mode=mangaStoryMode;undoMangaPagePreset();setMangaStoryMode(mode);return true;
    }
    return undoMangaStoryBeforeAdult?.call(this,event);
  };
  renderMangaStory();
})();
