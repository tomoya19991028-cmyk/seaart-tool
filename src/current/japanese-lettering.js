
// Japanese sound lettering and focused English-text negatives; existing choices remain intact.
(function(){
  if(window.__japaneseSoundAndEnglishTextV1)return;
  window.__japaneseSoundAndEnglishTextV1=true;

  const englishNegatives=[
    ['english_onomatopoeia','英語の擬音','English onomatopoeia, English sound-effect words'],
    ['english_dialogue','英語のセリフ','English dialogue'],
    ['english_balloons','英語の吹き出し','English words inside speech balloons'],
    ['latin_image_words','画像内の英字','Latin alphabet characters in visible image']
  ];
  for(const row of englishNegatives)
    if(!negativeOptions.some(old=>old[0]===row[0]))negativeOptions.push(row);

  const japaneseSoundCandidates=[
    ['Japanese sound-effect lettering, exact Japanese text "ドクン"','ドクン（鼓動）','日本語の擬音'],
    ['Japanese sound-effect lettering, exact Japanese text "ドキッ"','ドキッ（驚き）','日本語の擬音'],
    ['Japanese sound-effect lettering, exact Japanese text "はぁ…"','はぁ…（息）','日本語の擬音'],
    ['Japanese sound-effect lettering, exact Japanese text "びくっ"','びくっ（反応）','日本語の擬音'],
    ['Japanese sound-effect lettering, exact Japanese text "ぴくっ"','ぴくっ（小さな反応）','日本語の擬音'],
    ['Japanese sound-effect lettering, exact Japanese text "ぷるぷる"','ぷるぷる（震え）','日本語の擬音'],
    ['Japanese sound-effect lettering, exact Japanese text "ぎゅっ"','ぎゅっ（力を入れる音）','日本語の擬音']
  ];
  for(const row of japaneseSoundCandidates)
    if(!adultSharedBase.soundEffect.some(old=>old[0]===row[0]))adultSharedBase.soundEffect.push(row);

  adultScene.soundEffectText=typeof adultScene.soundEffectText==='string'?adultScene.soundEffectText:'';
  adultScene.reactionEffectText=typeof adultScene.reactionEffectText==='string'?adultScene.reactionEffectText:'';
  const startupAdultScene=actorFormStartup?.working?.working?.adultScene;
  if(startupAdultScene){
    adultScene.soundEffect=asList(startupAdultScene.soundEffect);
    adultScene.reactionEffect=asList(startupAdultScene.reactionEffect);
    adultScene.soundEffectText=typeof startupAdultScene.soundEffectText==='string'?startupAdultScene.soundEffectText:'';
    adultScene.reactionEffectText=typeof startupAdultScene.reactionEffectText==='string'?startupAdultScene.reactionEffectText:'';
  }
  const hasJapanese=value=>/[\u3040-\u30ff\u3400-\u9fff]/.test(String(value||''));
  function hasJapaneseSoundText(){
    if(hasJapanese(adultScene.soundEffectText))return true;
    return asList(adultScene.soundEffect).some(value=>{
      const output=personOutputValue('adult:soundEffect',value);
      return /Japanese sound-effect lettering, exact Japanese text/i.test(output)&&hasJapanese(output);
    });
  }
  function japaneseTextIsActive(){
    const people=allPeople();
    return people.length>0&&!people.some(person=>mfIsMotif(person.id))&&adultReadyFor(people)&&hasJapaneseSoundText();
  }

  const broadTextNegative=negativeOptions.find(row=>row[0]==='text')?.[2]||'watermark, logo, text, speech bubble';
  const priorSelectedNegativeTags=selectedNegativeTags;
  selectedNegativeTags=function(){
    const tags=priorSelectedNegativeTags.apply(this,arguments);
    // Keep watermark/logo suppression, but do not negate the Japanese lettering the user requested.
    if(!japaneseTextIsActive())return tags;
    return tags.flatMap(tag=>{
      if(tag===broadTextNegative)return ['watermark, logo'];
      return ['text','speech bubble','speech bubbles'].includes(String(tag).trim().toLowerCase())?[]:[tag];
    });
  };

  const priorAdultScenePrompt=adultScenePrompt;
  adultScenePrompt=function(people){
    const result=priorAdultScenePrompt.apply(this,arguments);
    if(!Array.isArray(people)||people.some(person=>mfIsMotif(person.id))||!adultReadyFor(people))return result;
    const chunks=Array.isArray(result)?result.slice():[];
    const literal=String(adultScene.soundEffectText||'').trim();
    for(const phrase of literal.split(/[\r\n、,]+/).map(value=>value.trim()).filter(Boolean).slice(0,8)){
      const safe=phrase.replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\s+/g,' ');
      chunks.push('Japanese manga sound-effect lettering, exact Japanese text "'+safe+'"');
    }
    const reaction=String(adultScene.reactionEffectText||'').trim();
    if(reaction)chunks.push(...splitTags(reaction));
    return [...new Set(chunks.filter(Boolean))];
  };

  function refreshEffectSummary(){
    const card=$('adultDashboard')?.querySelector('[data-adult-card="effects"]');
    if(!card)return;
    const launch=card.querySelector(':scope>.personLaunch'),entries=[];
    [...card.querySelectorAll('.dialogBody>.personPicker')].forEach((box,index)=>{
      const api=box.pickerApi;if(!api)return;
      for(const value of asList(api.getValues())){
        const selected=adultCardEntry({box,ownerId:null,refreshCard:refreshEffectSummary},value);
        selected.name=(index===0?'擬音：':'反応：')+selected.name;entries.push(selected);
      }
    });
    for(const [field,title] of [['soundEffectText','日本語擬音'],['reactionEffectText','追加エフェクト']]){
      const value=String(adultScene[field]||'').trim();if(!value)continue;
      entries.push({name:title+'：'+value,value,open:()=>launch.click(),remove:function(){
        adultScene[field]='';refreshEffectSummary();
        const input=$(field==='soundEffectText'?'adultSoundEffectJapaneseText':'adultReactionEffectFreeText');if(input)input.value='';
        dirty();
      }});
    }
    renderUnifiedCard(card,launch,'擬音・反応エフェクト',entries);
  }

  const priorRenderPersonChoice=renderPersonChoiceDialog;
  renderPersonChoiceDialog=function(){
    const result=priorRenderPersonChoice.apply(this,arguments),session=adultDisplaySession;
    if(session?.key!=='effects'||!session.person)return result;
    const root=$('personChoiceChoices'),soundTab=session.tab==='擬音',field=soundTab?'soundEffectText':'reactionEffectText';
    const wrap=node('div',undefined,'field adultEffectFreeInput'),label=node('label',soundTab?'日本語の擬音を自由入力':'追加の反応エフェクト（英語タグ）'),input=node('textarea');
    input.id=soundTab?'adultSoundEffectJapaneseText':'adultReactionEffectFreeText';label.htmlFor=input.id;
    input.rows=2;input.maxLength=160;
    input.placeholder=soundTab?'例：ドクン、はぁ…、びくっ':'例：subtle aftershocks, fine motion lines';
    input.value=String(adultScene[field]||'');
    input.setAttribute('aria-label',label.textContent);
    input.oninput=function(){
      adultScene[field]=input.value;
      refreshEffectSummary();
      dirty();
    };
    wrap.append(label,input,node('small',soundTab?'複数入力は「、」または改行で区切れます。':'複数の英語タグはカンマ区切りで入力できます。','hint'));
    root.append(wrap);
    return result;
  };

  const priorRenderAdultDashboard=renderAdultDashboard;
  renderAdultDashboard=function(){const result=priorRenderAdultDashboard.apply(this,arguments);refreshEffectSummary();return result};

  const priorRestoreWorking=restoreWorking;
  restoreWorking=function(snapshot){
    const result=priorRestoreWorking.apply(this,arguments),saved=snapshot?.adultScene||{};
    adultScene.soundEffect=asList(saved.soundEffect);
    adultScene.reactionEffect=asList(saved.reactionEffect);
    adultScene.soundEffectText=typeof saved.soundEffectText==='string'?saved.soundEffectText:'';
    adultScene.reactionEffectText=typeof saved.reactionEffectText==='string'?saved.reactionEffectText:'';
    refreshEffectSummary();
    dirty();
    return result;
  };

  const priorOpenNegativeCategory=openNegativeCategory;
  openNegativeCategory=function(index){
    const result=priorOpenNegativeCategory.apply(this,arguments);
    if(index===3){
      const body=$('negativeCategoryDialog')?.querySelector('.dialogBody');
      if(body)body.prepend(node('p','日本語の擬音を指定すると、汎用の「文字・ロゴ・吹き出し」から文字抑制だけを外し、透かし・ロゴは維持します。英語表記の抑制は下の候補から選べます。','hint'));
    }
    return result;
  };

  if(window.appReady&&$('negativeChoices'))renderNegative();
  if(window.appReady){renderAdultDashboard(true);refreshEffectSummary();if(startupAdultScene)dirty()}
})();
