
// BEGIN ADULT_ENHANCED_MIGRATION
// 成人向け設定の拡張。既存の保存形式と人物別設定を維持したまま追加する。
(function(){
  if(window.__adultEnhancedMigrationLoaded)return;
  window.__adultEnhancedMigrationLoaded=true;

  // 新しい共通演出項目は、旧バックアップを復元したときも保持する。
  const restoreWorkingWithAdultEffects=restoreWorking;
  restoreWorking=function(value,...args){
    const result=restoreWorkingWithAdultEffects(value,...args),saved=value?.adultScene;
    if(saved&&typeof saved==='object'){
      adultScene.soundEffect=asList(saved.soundEffect);
      adultScene.reactionEffect=asList(saved.reactionEffect);
      renderAdult();
    }
    return result;
  };

  const adultSharedEffectLabels={soundEffect:'擬音・音声',reactionEffect:'震え・エフェクト'};
  const adultAuditRuleWithSharedEffects=adultAuditRule;
  adultAuditRule=function(source,value){
    const field=source.slice(6);
    if(adultSharedEffectLabels[field])return {card:'scene',tab:'演出'};
    return adultAuditRuleWithSharedEffects(source,value);
  };
  const adultAuditSourcesWithSharedEffects=adultAuditSources;
  adultAuditSources=function(){
    const result=adultAuditSourcesWithSharedEffects(),seen=new Set(result.map(entry=>entry.box));
    if(!$('adultDashboard'))return result;
    for(const box of $('adultDashboard').querySelectorAll('.adultTile .personPicker[data-picker-source^="adult:"]')){
      const field=box.dataset.pickerSource.slice(6);
      if(!adultSharedEffectLabels[field]||seen.has(box))continue;
      result.push({box,field,title:adultSharedEffectLabels[field],ownerId:null,refreshCard:refreshAdultAuditCards});
    }
    return result;
  };

  const addUnique=function(list,row){
    if(!Array.isArray(list))return;
    const value=String(row[0]||'').toLowerCase();
    if(!list.some(function(x){return String(x[0]||'').toLowerCase()===value}))list.push(row);
  };
  const exposure=[
    ['side boob','横乳','胸'],
    ['under boob','下乳','胸'],
    ['cleavage','胸の谷間','胸'],
    ['topless','上半身裸','胸'],
    ['breasts exposed','胸を露出','胸'],
    ['bare shoulders','肩を露出','肩・背中'],
    ['collarbone visible','鎖骨を露出','肩・背中'],
    ['bare back','背中を露出','肩・背中'],
    ['nape exposed','うなじを露出','肩・背中'],
    ['midriff exposed','お腹を露出','腹部'],
    ['navel visible','へそを露出','腹部'],
    ['bare arms','腕を露出','腕・脚'],
    ['armpits exposed','脇を露出','腕・脚'],
    ['bare legs','脚を露出','腕・脚'],
    ['bare thighs','太ももを露出','腕・脚'],
    ['bare feet','素足','腕・脚'],
    ['buttocks exposed','尻を露出','下半身'],
    ['bottomless','下半身裸','下半身'],
    ['vulva exposed','女性器露出（まんこ）','性器・女性器'],
    ['visible vulva','女性器が見える','性器・女性器'],
    ['visible clitoris','陰核が見える','性器・女性器'],
    ['visible penis','男性器露出（ちんこ）','性器・男性器'],
    ['visible glans','亀頭が見える','性器・男性器'],
    ['visible testicles','陰嚢が見える','性器・男性器'],
    ['visible anus','肛門が見える','性器・肛門']
  ];
  const clothing=[
    ['bra displaced','ブラをずらす','下着の状態'],
    ['bra removed','ブラを外す','下着の状態'],
    ['panties aside','パンツをずらす','下着の状態'],
    ['underwear pulled down','下着を下ろす','下着の状態'],
    ['swimsuit pulled aside','水着をずらす','水着の状態'],
    ['swimsuit loosened','水着を緩める','水着の状態'],
    ['shirt lifted','シャツをたくし上げる','衣装の状態'],
    ['skirt lifted','スカートをたくし上げる','衣装の状態'],
    ['dress lifted','ドレスをたくし上げる','衣装の状態'],
    ['open shirt','シャツを開く','衣装の状態'],
    ['open robe','ガウンを開く','衣装の状態'],
    ['unbuttoned clothing','ボタンを外した服','衣装の状態'],
    ['partially undressed','一部脱衣','衣装の状態'],
    ['clothes removed','衣装を脱いだ状態','衣装の状態'],
    ['wet clothing','濡れた衣装','衣装の状態'],
    ['sheer fabric','透ける布地','衣装の状態'],
    ['transparent fabric','透明感のある布地','衣装の状態']
  ];
  const selfAction=[
    ['masturbation','自慰','本人の動作'],
    ['fingering','指で刺激する','本人の動作'],
    ['using vibrator','バイブを使う','玩具'],
    ['using dildo','ディルドを使う','玩具'],
    ['touching own breasts','自分の胸に触れる','本人の動作'],
    ['touching own nipples','自分の乳首に触れる','本人の動作'],
    ['grinding','身体をこすりつける','本人の動作'],
    ['spreading legs','脚を開く','姿勢'],
    ['showing genitals','性器を見せる','本人の動作'],
    ['edging','寸止め','本人の動作'],
    ['sexual climax','性的な絶頂','状態']
  ];
  const sexualContact=[
    ['kissing','キス','口・顔'],
    ['deep kissing','深いキス','口・顔'],
    ['embracing','抱き合う','全身'],
    ['touching partner','相手に触れる','全身'],
    ['touching partner breasts','相手の胸に触れる','胸'],
    ['touching partner nipples','相手の乳首に触れる','胸'],
    ['touching partner genitals','相手の性器に触れる','性器'],
    ['hand stimulation','手による刺激','性器'],
    ['mutual masturbation','相互自慰','性器'],
    ['oral contact','口による接触','性器'],
    ['body rubbing','身体をこすり合わせる','全身'],
    ['holding partner close','相手を引き寄せる','全身']
  ];
  const sexualAct=[
    ['vaginal intercourse','膣性交','性行為'],
    ['missionary position','正常位（膣性交）','姿勢'],
    ['anal intercourse','肛門性交','性行為'],
    ['oral sex','オーラルセックス','性行為'],
    ['mutual oral sex','相互オーラルセックス','性行為'],
    ['intercourse from behind','後背位（膣性交）','姿勢'],
    ['riding position','騎乗位（膣性交）','姿勢'],
    ['standing intercourse','立位での膣性交','姿勢'],
    ['side-by-side intercourse','側位での膣性交','姿勢'],
    ['protected sex','避妊具を使用（膣性交）','安全設定'],
    ['ejaculation','膣内射精','状態']
  ];
  const clothingTarget=[
    ['shirt','シャツ','上半身'],
    ['jacket','ジャケット','上半身'],
    ['coat','コート','外衣'],
    ['robe','ガウン','外衣'],
    ['collar','襟','上半身'],
    ['tie','ネクタイ','上半身'],
    ['sleeves','袖','上半身'],
    ['shoulder strap','肩紐','上半身'],
    ['skirt','スカート','下半身'],
    ['dress','ドレス','下半身'],
    ['waistband','ウエスト','下半身'],
    ['bra','ブラ','下着'],
    ['underwear','下着','下着'],
    ['panties','パンツ','下着'],
    ['swimsuit','水着','水着'],
    ['outerwear','上着','外衣'],
    ['clothing','衣装','全体']
  ];
  const clothingState=[
    ['neat','整った','基本'],
    ['rumpled','しわのある','基本'],
    ['disheveled','着崩れた','基本'],
    ['loosened','緩めた','開閉・調整'],
    ['open','開いた','開閉・調整'],
    ['unbuttoned','ボタンを外した','開閉・調整'],
    ['untied','ほどいた','開閉・調整'],
    ['rolled up','まくった','開閉・調整'],
    ['displaced','ずらした','位置'],
    ['slipped','ずれた','位置'],
    ['lifted','たくし上げた','位置'],
    ['pulled down','下ろした','位置'],
    ['visible','見えている','露出状態'],
    ['removed','外した','脱衣'],
    ['partially removed','一部脱衣','脱衣'],
    ['fully removed','全身脱衣','脱衣'],
    ['wet','濡れた','質感'],
    ['clinging','張り付いた','質感'],
    ['sheer','透ける','質感'],
    ['transparent','透明感のある','質感'],
    ['torn','破れた','状態']
  ];
  adultPresets.clothingTarget={label:'衣装の対象',items:clothingTarget};
  adultPresets.clothingState={label:'対象の状態',items:clothingState};

  Object.keys(adultPresets||{}).forEach(function(key){
    if(!Array.isArray(adultCustom[key]))adultCustom[key]=[];
  });
  const append=function(key,label,rows){
    adultPresets[key]=adultPresets[key]||{label:label,items:[]};
    adultPresets[key].label=label;
    adultPresets[key].items=adultPresets[key].items||[];
    rows.forEach(function(row){addUnique(adultPresets[key].items,row)});
    if(!Array.isArray(adultCustom[key]))adultCustom[key]=[];
  };
  exposure.forEach(function(row){addUnique(adultPresets.exposure.items,row)});
  append('clothing','衣装の状態',clothing);
  append('selfAction','本人の動作',selfAction);
  append('sexualContact','性的な接触',sexualContact);
  append('sexualAct','性行為',sexualAct);

  // 旧来の文章型候補を整理し、部位・状態・動作を混在させない。
  // 既存の保存済み選択は保持し、未選択の候補一覧だけを新分類へ統一する。
  const cleanExposure=[
    ['fully clothed','通常の服装','基本'],
    ['nude','裸','全身'],
    ['side boob','横乳','胸'],
    ['under boob','下乳','胸'],
    ['cleavage','胸の谷間','胸'],
    ['topless','上半身裸','胸'],
    ['breasts exposed','胸を露出','胸'],
    ['bare shoulders','肩を露出','肩・背中'],
    ['collarbone visible','鎖骨を露出','肩・背中'],
    ['bare back','背中を露出','肩・背中'],
    ['nape exposed','うなじを露出','肩・背中'],
    ['midriff exposed','お腹を露出','腹部'],
    ['navel visible','へそを露出','腹部'],
    ['bare arms','腕を露出','腕・脚'],
    ['armpits exposed','脇を露出','腕・脚'],
    ['bare legs','脚を露出','腕・脚'],
    ['bare thighs','太ももを露出','腕・脚'],
    ['bare feet','素足','腕・脚'],
    ['buttocks exposed','尻を露出','下半身'],
    ['bottomless','下半身裸','下半身'],
    ['vulva exposed','女性器露出（まんこ）','性器・女性器'],
    ['visible vulva','女性器が見える','性器・女性器'],
    ['visible clitoris','陰核が見える','性器・女性器'],
    ['visible penis','男性器露出（ちんこ）','性器・男性器'],
    ['visible glans','亀頭が見える','性器・男性器'],
    ['visible testicles','陰嚢が見える','性器・男性器'],
    ['visible anus','肛門が見える','性器・肛門']
  ];
  const cleanClothing=[
    ['neat clothing','整った服装','基本'],
    ['slightly disheveled clothing','少し着崩れた服装','着崩し'],
    ['loosened collar','襟元を緩める','着崩し'],
    ['open jacket','上着を開ける','着崩し'],
    ['unbuttoned jacket','ジャケットのボタンを外す','着崩し'],
    ['slipped shoulder strap','肩紐がずれた状態','着崩し'],
    ['loosened tie','ネクタイを緩める','着崩し'],
    ['rolled-up sleeves','袖をまくる','着崩し'],
    ['bra displaced','ブラをずらす','下着の状態'],
    ['bra removed','ブラを外す','下着の状態'],
    ['panties aside','パンツをずらす','下着の状態'],
    ['underwear pulled down','下着を下ろす','下着の状態'],
    ['swimsuit pulled aside','水着をずらす','水着の状態'],
    ['swimsuit loosened','水着を緩める','水着の状態'],
    ['shirt lifted','シャツをたくし上げる','衣装の状態'],
    ['skirt lifted','スカートをたくし上げる','衣装の状態'],
    ['dress lifted','ドレスをたくし上げる','衣装の状態'],
    ['open shirt','シャツを開く','衣装の状態'],
    ['open robe','ガウンを開く','衣装の状態'],
    ['unbuttoned clothing','ボタンを外した服','衣装の状態'],
    ['partially undressed','一部脱衣','衣装の状態'],
    ['clothes removed','衣装を脱いだ状態','衣装の状態'],
    ['wet clothing','濡れた衣装','衣装の状態'],
    ['sheer fabric','透ける布地','衣装の状態'],
    ['transparent fabric','透明感のある布地','衣装の状態']
  ];
  adultPresets.exposure.items=cleanExposure;
  adultPresets.clothing.items=cleanClothing;
  adultPresets.selfAction.items=selfAction;
  adultPresets.sexualContact.items=sexualContact;
  adultPresets.sexualAct.items=sexualAct;

  // 衣装の状態だけを再整理。衣装の種類・素材名・場面説明は含めない。
  const reviewedClothingState=[
    ['neat clothing','整った服装','基本'],
    ['rumpled clothing','少し乱れた服装','基本'],
    ['disheveled clothing','着崩れた服装','基本'],
    ['loosened collar','襟元を緩める','上半身'],
    ['open shirt','シャツを開く','上半身'],
    ['unbuttoned jacket','ジャケットのボタンを外す','上半身'],
    ['loosened tie','ネクタイを緩める','上半身'],
    ['rolled-up sleeves','袖をまくる','上半身'],
    ['slipped shoulder strap','肩紐をずらす','上半身'],
    ['one shoulder slipped','片肩をずらす','上半身'],
    ['shirt lifted','シャツをたくし上げる','上半身'],
    ['skirt lifted','スカートをたくし上げる','下半身'],
    ['dress lifted','ドレスをたくし上げる','下半身'],
    ['loosened waistband','ウエストを緩める','下半身'],
    ['bra displaced','ブラをずらす','下着'],
    ['bra removed','ブラを外す','下着'],
    ['underwear visible','下着が見える','下着'],
    ['panties aside','パンツをずらす','下着'],
    ['underwear pulled down','下着を下ろす','下着'],
    ['underwear removed','下着を外す','下着'],
    ['swimsuit displaced','水着をずらす','水着'],
    ['swimsuit loosened','水着を緩める','水着'],
    ['swimsuit pulled down','水着を下ろす','水着'],
    ['swimsuit removed','水着を外す','水着'],
    ['open robe','ガウンを開く','外衣'],
    ['outerwear removed','上着を外す','外衣'],
    ['partially undressed','一部脱衣','脱衣'],
    ['fully undressed','全身脱衣','脱衣'],
    ['clothes removed','衣装を脱いだ状態','脱衣'],
    ['wet clothing','濡れた衣装','質感'],
    ['clinging wet fabric','肌に張り付く濡れた布','質感'],
    ['sheer fabric','透ける布地','質感'],
    ['transparent fabric','透明感のある布地','質感'],
    ['torn clothing','破れた衣装','状態']
  ];
  adultPresets.clothing.items=reviewedClothingState;

  // 成人向けの胸・表情・場面演出も短いタグ候補へ統一する。
  adultBodyOptions.bustShape=[
    ['full breasts','ふっくら','形・質感'],
    ['firm breasts','張りのある','形・質感'],
    ['soft breasts','柔らかい','形・質感'],
    ['round breasts','丸い','形・質感'],
    ['teardrop breasts','しずく型','形・質感'],
    ['close-set breasts','寄った','位置'],
    ['wide-set breasts','離れ気味','位置'],
    ['asymmetrical breasts','左右非対称','形・質感']
  ];
  adultBodyOptions.bustFocus=[
    ['cleavage','胸の谷間','見せ方'],
    ['innerboob','内側の谷間','見せ方'],
    ['sideboob','横乳','見せ方'],
    ['underboob','下乳','見せ方'],
    ['upper breast','上乳','見せ方'],
    ['breast silhouette','胸の輪郭','見せ方'],
    ['emphasize breasts','胸を強調','見せ方']
  ];
  adultBodyOptions.nipple=[
    ['small nipples','小さめ','大きさ'],
    ['large nipples','大きめ','大きさ'],
    ['prominent nipples','目立つ','形・質感'],
    ['pointy nipples','尖った','形・質感'],
    ['puffy nipples','ふっくら','形・質感'],
    ['flat nipples','平ら','状態'],
    ['erect nipples','立っている','状態'],
    ['nipple outline through clothes','服越しの輪郭','状態'],
    ['pink nipples','ピンク色','色'],
    ['brown nipples','茶色','色'],
    ['dark nipples','濃い色','色'],
    ['asymmetrical nipples','左右非対称','形・質感']
  ];
  adultBodyOptions.areola=[
    ['small areolas','小さめ','大きさ'],
    ['large areolas','大きめ','大きさ'],
    ['round areolas','丸い','形・質感'],
    ['wide areolas','幅広','大きさ'],
    ['light areolas','淡い色','色'],
    ['pink areolas','ピンク色','色'],
    ['brown areolas','茶色','色'],
    ['dark areolas','濃い色','色'],
    ['defined areolas','輪郭がはっきり','輪郭'],
    ['soft-edged areolas','輪郭が柔らかい','輪郭'],
    ['asymmetrical areolas','左右非対称','形・質感']
  ];
  const cleanExpression=[
    ['blushing smile','照れた笑顔','表情'],
    ['soft smile','柔らかな微笑み','表情'],
    ['tender smile','甘い微笑み','表情'],
    ['confident smile','自信のある笑顔','表情'],
    ['seductive smile','色気のある微笑み','表情'],
    ['affectionate gaze','親しみのある視線','視線'],
    ['warm gaze','温かい視線','視線'],
    ['longing gaze','熱のこもった視線','視線'],
    ['inviting gaze','誘うような視線','視線'],
    ['heated gaze','熱を帯びた視線','視線'],
    ['half-lidded eyes','伏し目がちな目','目元'],
    ['closed eyes','閉じた目','目元'],
    ['playful wink','いたずらっぽいウインク','目元'],
    ['slightly parted lips','少し開いた唇','口元'],
    ['flushed cheeks','赤らんだ頬','感情'],
    ['shy expression','恥ずかしそうな表情','感情'],
    ['anticipatory expression','期待した表情','感情'],
    ['relaxed expression','力の抜けた表情','感情'],
    ['trusting expression','安心した表情','感情'],
    ['breathless expression','息を弾ませた表情','感情'],
    ['orgasmic expression','絶頂の表情','成人表情'],
    ['ahegao','アヘ顔','成人表情']
  ];
  adultPresets.expression.items=cleanExpression;

  const cleanMood=[
    ['romantic atmosphere','ロマンチック','雰囲気'],
    ['intimate atmosphere','親密','雰囲気'],
    ['tender atmosphere','優しい','雰囲気'],
    ['passionate atmosphere','情熱的','雰囲気'],
    ['playful atmosphere','いたずらっぽい','雰囲気'],
    ['trusting atmosphere','信頼感','雰囲気'],
    ['calm atmosphere','穏やか','雰囲気'],
    ['dreamy atmosphere','夢のよう','雰囲気'],
    ['candlelit atmosphere','ろうそくの光','光・空気'],
    ['moonlit atmosphere','月明かり','光・空気'],
    ['rainy night atmosphere','雨の夜','光・空気'],
    ['warm indoor lighting','暖かな室内光','光・空気'],
    ['soft backlighting','柔らかな逆光','光・空気'],
    ['bedroom setting','寝室','場所'],
    ['sofa setting','ソファ','場所']
  ];
  const cleanPhase=[
    ['before a kiss','キスの前','前段階'],
    ['during a kiss','キスの最中','接触中'],
    ['after a kiss','キスのあと','余韻'],
    ['before an embrace','抱擁の前','前段階'],
    ['during an embrace','抱き合っている','接触中'],
    ['after an embrace','抱擁のあと','余韻'],
    ['before intimacy','親密になる前','前段階'],
    ['during intimacy','親密な場面','進行中'],
    ['after intimacy','親密な場面のあと','余韻'],
    ['quiet moment together','寄り添う静かな場面','雰囲気']
  ];
  const cleanFocus=[
    ['full-body two-shot','二人の全身','構図'],
    ['upper-body two-shot','二人の上半身','構図'],
    ['balanced two-shot','二人を同じ大きさで','構図'],
    ['close-up on faces','顔のアップ','顔・視線'],
    ['focus on eye contact','視線を中心に','顔・視線'],
    ['focus on joined hands','つないだ手を中心に','手・接触'],
    ['focus on body contact','身体の接触を中心に','接触'],
    ['over-the-shoulder view','肩越しの構図','構図'],
    ['side profile two-shot','二人の横顔','構図'],
    ['soft-focus background','背景をぼかす','演出']
  ];
  adultSharedBase.mood=cleanMood;
  adultSharedBase.phase=cleanPhase;
  adultSharedBase.focus=cleanFocus;

  // 乳首・乳輪は露出項目から分離し、サイズ・色・状態として扱う。
  const nippleExposure=new Set(['show off nipple','nipples visible through fabric','areolas visible through fabric']);
  adultPresets.exposure.items=adultPresets.exposure.items.filter(function(row){return !nippleExposure.has(row[0])});
  ['flat nipples','wide nipples','visible nipple shape'].forEach(function(v,i){
    addUnique(adultBodyOptions.nipple,[v,['平ら','幅広','形がわかる'][i],i===2?'形・質感':'状態']);
  });
  ['brown areolas','distinct areola ring','smooth areola texture'].forEach(function(v,i){
    addUnique(adultBodyOptions.areola,[v,['茶色の乳輪','乳輪の輪郭が明確','滑らかな質感'][i],i===0?'色':i===1?'輪郭':'状態']);
  });

  // 旧 action/contact を新しい分類へ移す。旧データを消さず、重複だけ整理する。
  const legacyActPattern=/vaginal|anal|oral|intercourse|fellatio|sex\\b|ejaculat|cum|climax|riding dildo/i;
  const legacySelfPattern=/masturb|fingering|dildo|vibrator|handjob|footjob|grinding|urination|pee|edging/i;
  const clothingLegacyMap={
    'neat clothing':{state:'neat'},
    'slightly disheveled clothing':{state:'disheveled'},
    'rumpled clothing':{state:'rumpled'},
    'disheveled clothing':{state:'disheveled'},
    'loosened collar':{target:'collar',state:'loosened'},
    'open shirt':{target:'shirt',state:'open'},
    'unbuttoned jacket':{target:'jacket',state:'unbuttoned'},
    'loosened tie':{target:'tie',state:'loosened'},
    'rolled-up sleeves':{target:'sleeves',state:'rolled up'},
    'slipped shoulder strap':{target:'shoulder strap',state:'slipped'},
    'one shoulder slipped':{target:'shoulder strap',state:'slipped'},
    'shirt lifted':{target:'shirt',state:'lifted'},
    'skirt lifted':{target:'skirt',state:'lifted'},
    'dress lifted':{target:'dress',state:'lifted'},
    'loosened waistband':{target:'waistband',state:'loosened'},
    'bra displaced':{target:'bra',state:'displaced'},
    'bra removed':{target:'bra',state:'removed'},
    'underwear visible':{target:'underwear',state:'visible'},
    'panties aside':{target:'panties',state:'displaced'},
    'underwear pulled down':{target:'underwear',state:'pulled down'},
    'underwear removed':{target:'underwear',state:'removed'},
    'swimsuit displaced':{target:'swimsuit',state:'displaced'},
    'swimsuit loosened':{target:'swimsuit',state:'loosened'},
    'swimsuit pulled down':{target:'swimsuit',state:'pulled down'},
    'swimsuit removed':{target:'swimsuit',state:'removed'},
    'open robe':{target:'robe',state:'open'},
    'outerwear removed':{target:'outerwear',state:'removed'},
    'partially undressed':{target:'clothing',state:'partially removed'},
    'fully undressed':{target:'clothing',state:'fully removed'},
    'clothes removed':{target:'clothing',state:'removed'},
    'wet clothing':{target:'clothing',state:'wet'},
    'clinging wet fabric':{target:'clothing',state:'clinging'},
    'sheer fabric':{target:'clothing',state:'sheer'},
    'transparent fabric':{target:'clothing',state:'transparent'},
    'torn clothing':{target:'clothing',state:'torn'}
  };
  const migrate=function(){
    Object.values(adultScene.people||{}).forEach(function(p){
      p.selfAction=Array.isArray(p.selfAction)?p.selfAction:[];
      p.sexualContact=Array.isArray(p.sexualContact)?p.sexualContact:[];
      p.sexualAct=Array.isArray(p.sexualAct)?p.sexualAct:[];
      p.clothingTarget=Array.isArray(p.clothingTarget)?p.clothingTarget:[];
      p.clothingState=Array.isArray(p.clothingState)?p.clothingState:[];
      p.clothingStateTargets=p.clothingStateTargets&&typeof p.clothingStateTargets==='object'&&!Array.isArray(p.clothingStateTargets)?p.clothingStateTargets:{};
      asList(p.clothing).forEach(function(value){
        const mapped=clothingLegacyMap[value];
        if(!mapped)return;
        if(mapped.target&&!p.clothingTarget.includes(mapped.target))p.clothingTarget.push(mapped.target);
        if(mapped.state&&!p.clothingState.includes(mapped.state))p.clothingState.push(mapped.state);
      });
      const legacyClothingTargets=asList(p.clothingTarget);
      if(legacyClothingTargets.length&&p.clothingState.length){
        p.clothingState.forEach(function(state){
          if(!Array.isArray(p.clothingStateTargets[state])||!p.clothingStateTargets[state].length)p.clothingStateTargets[state]=legacyClothingTargets.slice();
        });
      }
      const oldAction=asList(p.action),oldContact=asList(p.contact);
      oldAction.forEach(function(value){
        const target=legacyActPattern.test(value)?p.sexualAct:legacySelfPattern.test(value)?p.selfAction:p.sexualContact;
        if(!target.includes(value))target.push(value);
      });
      oldContact.forEach(function(value){if(!p.sexualContact.includes(value))p.sexualContact.push(value)});
      if(p.target){
        if(p.sexualAct.some(function(v){return legacyActPattern.test(v)}))p.sexualActTarget=p.target;
        if(p.sexualContact.length)p.contactTarget=p.target;
      }
      p.action=[];
      p.contact=[];
      p.clothing=[];
      p.clothingTarget=[];
      if(Array.isArray(p.exposure))p.exposure=p.exposure.filter(function(v){return !nippleExposure.has(v)});
    });
  };
  migrate();

  const enhancedDefinitions=function(){
    return [
      ['body','胸サイズ',[['detail','bust']]],
      ['exposure','露出',[['adult','exposure']]],
      ['details','胸の詳細',[['body','bustShape'],['body','bustFocus'],['body','nipple'],['body','areola']]],
      ['clothingState','衣装の状態',[['adult','clothingState']]],
      ['selfAction','本人の動作',[['adult','selfAction']]],
      ['sexualContact','性的な接触',[['adult','sexualContact']]],
      ['sexualAct','性行為',[['adult','sexualAct']]],
      ['expression','表情',[['adult','expression']]],
      ['scene','場面・演出',[['shared','mood'],['shared','phase'],['shared','focus'],['shared','soundEffect'],['shared','reactionEffect']]]
    ];
  };
  pgAdultDefinitions=enhancedDefinitions;

  const oldAdultReadyFor=adultReadyFor;
  adultReadyFor=function(people){
    return !!adultScene.consent&&oldAdultReadyFor(people);
  };
  if(typeof adultReady==='function'){
    const oldAdultReady=adultReady;
    adultReady=function(){
      return !!adultScene.consent&&oldAdultReady();
    };
  }

  const adultClothingTargetFields=[['upper','上半身'],['lower','下半身'],['legwear','脚装備'],['head','頭'],['hands','手・腕'],['feet','足元'],['accessory','装飾品']];
  const adultClothingOptionsForPerson=function(person){
    const profile=profiles[person.id]||{},inherited=typeof inheritedOutfitParts==='function'?inheritedOutfitParts(profile):null,result=[],seen=new Set();
    adultClothingTargetFields.forEach(function(pair){
      const field=pair[0],part=pair[1],own=asList(profile.detail?.[field]),raw=own.length?own:(inherited?.[field]?[typeof outfitDetailValue==='function'?outfitDetailValue(field,inherited[field]):inherited[field]]:[]);
      raw.forEach(function(value){
        if(!value||seen.has(value))return;
        seen.add(value);
        const name=typeof detailLabel==='function'?detailLabel(field,value):value;
        result.push({value:value,name:part+'：'+name,group:part,field:field});
      });
    });
    return result;
  };
  const adultClothingTargetPromptValue=function(person,value){
    const found=adultClothingOptionsForPerson(person).find(function(row){return row.value===value});
    return found&&typeof personOutputValue==='function'?personOutputValue('detail:'+found.field,value):value;
  };
  const adultClothingRelationTag=function(person,state,target){
    const stateTag=personOutputValue('adult:clothingState',state)||state,targetTag=adultClothingTargetPromptValue(person,target),prefix={
      'rolled up':'rolled-up',
      'pulled down':'pulled-down',
      'partially removed':'partially removed',
      'fully removed':'fully removed'
    }[state]||stateTag;
    if(state==='visible')return targetTag+' visible';
    return [prefix,targetTag].filter(Boolean).join(' ');
  };

  // 対人関係を持つ候補は、行為者・相手・関係全体を別々のタグへ展開する。
  // 例：riding position → vaginal riding / vaginally penetrated in a riding position / relation between A and B
  const relation=function(sourcePrompt,targetPrompt,relationPrompt){return {sourcePrompt:sourcePrompt,targetPrompt:targetPrompt||'',relationPrompt:relationPrompt||''}};
  const adultRelationPromptMap={
    selfAction:{
      'masturbation':relation('masturbation'),
      'fingering':relation('fingering'),
      'using vibrator':relation('using vibrator'),
      'using dildo':relation('using dildo'),
      'touching own breasts':relation('touching own breasts'),
      'touching own nipples':relation('touching own nipples'),
      'grinding':relation('grinding'),
      'spreading legs':relation('spreading legs'),
      'showing genitals':relation('showing genitals'),
      'edging':relation('edging'),
      'sexual climax':relation('sexual climax')
    },
    sexualContact:{
      'kissing':relation('kissing','being kissed','kissing between Character A and Character B'),
      'deep kissing':relation('deep kissing','being deeply kissed','deep kissing between Character A and Character B'),
      'embracing':relation('embracing','being embraced','embrace between Character A and Character B'),
      'touching partner':relation('touching partner','being touched','touching between Character A and Character B'),
      'touching partner breasts':relation('touching partner breasts','breasts being touched','touching partner breasts between Character A and Character B'),
      'touching partner nipples':relation('touching partner nipples','nipples being touched','touching partner nipples between Character A and Character B'),
      'touching partner genitals':relation('touching partner genitals','genitals being touched','touching partner genitals between Character A and Character B'),
      'hand stimulation':relation('hand stimulation','receiving hand stimulation','hand stimulation between Character A and Character B'),
      'mutual masturbation':relation('mutual masturbation','mutual masturbation','mutual masturbation between Character A and Character B'),
      'oral contact':relation('oral contact','receiving oral contact','oral contact between Character A and Character B'),
      'body rubbing':relation('body rubbing','being rubbed','body rubbing between Character A and Character B'),
      'holding partner close':relation('holding partner close','being held close','holding partner close between Character A and Character B')
    },
    sexualAct:{
      'vaginal intercourse':relation('vaginal intercourse','being penetrated vaginally','vaginal intercourse between Character A and Character B'),
      'missionary position':relation('missionary position during vaginal intercourse','being vaginally penetrated in missionary position','vaginal intercourse in missionary position between Character A and Character B'),
      'anal intercourse':relation('anal intercourse','being penetrated anally','anal intercourse between Character A and Character B'),
      'oral sex':relation('performing oral sex','receiving oral sex','oral sex between Character A and Character B'),
      'mutual oral sex':relation('mutual oral sex','mutual oral sex','mutual oral sex between Character A and Character B'),
      'intercourse from behind':relation('vaginal intercourse from behind','being vaginally penetrated from behind','vaginal intercourse from behind between Character A and Character B'),
      'riding position':relation('vaginal riding position','being vaginally penetrated in a riding position','vaginal intercourse in a riding position between Character A and Character B'),
      'standing intercourse':relation('standing vaginal intercourse','being vaginally penetrated while standing','standing vaginal intercourse between Character A and Character B'),
      'side-by-side intercourse':relation('side-by-side vaginal intercourse','being vaginally penetrated side by side','side-by-side vaginal intercourse between Character A and Character B'),
      'protected sex':relation('condom-protected vaginal intercourse','receiving condom-protected vaginal penetration','condom-protected vaginal intercourse between Character A and Character B'),
      'ejaculation':relation('ejaculation inside the vagina','receiving ejaculation inside the vagina','ejaculation inside the vagina between Character A and Character B')
    }
  };
  const adultRelationFieldLabels={sexualContact:'sexual contact',sexualAct:'sexual act'};
  const adultRelationDefinition=function(field,value){
    return adultRelationPromptMap[field]?.[value]||relation(value,'',adultRelationFieldLabels[field]+' between Character A and Character B');
  };
  const adultRelationRecords=function(people){
    if(!Array.isArray(people)||!adultReadyFor(people))return [];
    const eligible=mfAdultPeople(people),records=[];
    for(const source of eligible){
      const adult=adultScene.people[source.id]||{};
      for(const [field,targetField] of [['sexualContact','contactTarget'],['sexualAct','sexualActTarget']]){
        const target=eligible.find(function(candidate){return candidate.id===adult[targetField]&&candidate.id!==source.id});
        if(!target)continue;
        for(const value of asList(adult[field]))records.push({field,value,source,target,definition:adultRelationDefinition(field,value)});
      }
    }
    return records;
  };
  const adultRelationTargetPromptEntries=function(person,people){
    return adultRelationRecords(people).filter(function(record){return record.target.id===person.id&&record.definition.targetPrompt}).map(function(record){
      return {prompt:record.definition.targetPrompt,weight:profiles[record.source.id]?.itemWeights?.['adult:'+record.field]?.[record.value]??1};
    });
  };

  adultPersonPrompt=function(person,people){
    if(mfIsMotif(person.id)||mfIsMotif(adultScene.people[person.id]?.target)||!adultReadyFor(people))return [];
    const p=adultScene.people[person.id]||{},items=[];
    const fields=['exposure','selfAction','sexualContact','sexualAct','expression','bustShape','bustFocus','nipple','areola'];
    fields.forEach(function(field){
      asList(p[field]).forEach(function(value){
        const mapped=adultRelationPromptMap[field]?.[value],prompt=mapped?.sourcePrompt||personOutputValue('adult:'+field,value);
        items.push(explicitWeight(prompt,profiles[person.id]?.itemWeights?.['adult:'+field]?.[value]??1));
      });
      if(typeof scTags==='function')items.push(...scTags('adult',p,field));
    });
    adultRelationTargetPromptEntries(person,people).forEach(function(entry){items.push(explicitWeight(entry.prompt,entry.weight))});
    const targetOptions=new Set(adultClothingOptionsForPerson(person).map(function(row){return row.value})),relations=p.clothingStateTargets&&typeof p.clothingStateTargets==='object'?p.clothingStateTargets:{};
    asList(p.clothingState).forEach(function(state){
      asList(relations[state]).filter(function(target){return targetOptions.has(target)}).forEach(function(target){
        items.push(adultClothingRelationTag(person,state,target));
      });
    });
    if(typeof scTags==='function')items.push(...scTags('adult',p,null,fields));
    return [...new Set(items.filter(Boolean))];
  };

  const previousAdultInteractionPrompt=adultInteractionPrompt;
  adultInteractionPrompt=function(people){
    const records=adultRelationRecords(people);
    if(!records.length)return previousAdultInteractionPrompt(people);
    const prompts=[...new Set(records.map(function(record){
      return String(record.definition.relationPrompt||'').replace(/\bCharacter A\b/g,record.source.name).replace(/\bCharacter B\b/g,record.target.name);
    }).filter(Boolean))];
    if(!prompts.length)return [];
    return typeof promptIsNatural==='function'&&promptIsNatural()?[prompts.join('. ')+'.']:prompts;
  };

  const addConsent=function(){
    const holder=$('adultConfirm');if(!holder||holder.querySelector('[data-adult-consent]'))return;
    const label=node('label',undefined,'negativeChoice');
    const check=node('input');check.type='checkbox';check.checked=!!adultScene.consent;check.setAttribute('data-adult-consent','true');
    check.onchange=function(){adultScene.consent=check.checked;renderAdult();dirty()};
    label.append(check,node('span','登場人物全員が成人で、性的表現に合意していることを確認'));
    holder.append(label);
  };
  const oldRenderAdult=renderAdult;
  renderAdult=function(){
    oldRenderAdult();
    addConsent();
  };

  const targetControl=function(root,labelText,adult,field,person){
    if(!root||!adult||!person||root.querySelector('[data-adult-target=\"'+field+'\"]'))return;
    const others=mfAdultPeople(allPeople()).filter(function(x){return x.id!==person.id});
    if(!others.length)return;
    const label=node('label',labelText),select=node('select');
    select.setAttribute('data-adult-target',field);
    select.append(new Option('相手を選択', ''));
    others.forEach(function(x){select.append(new Option(x.name,x.id))});
    select.value=adult[field]||'';
    select.onchange=function(){adult[field]=select.value;dirty()};
    label.append(select);root.prepend(label);
  };

  const oldRenderAdultDashboard=renderAdultDashboard;
  renderAdultDashboard=function(force){
    oldRenderAdultDashboard(force);
    const person=allPeople().find(function(x){return x.id===personKey})||allPeople()[0];
    if(!person)return;
    const p=adultScene.people[person.id]||{};
    const contactCard=document.querySelector('[data-adult-card=\"sexualContact\"]');
    const actCard=document.querySelector('[data-adult-card=\"sexualAct\"]');
    targetControl(contactCard?.querySelector('dialog .dialogBody'),'接触する相手',p,'contactTarget',person);
    targetControl(actCard?.querySelector('dialog .dialogBody'),'性行為の相手',p,'sexualActTarget',person);
    addConsent();
  };

  // 新カードも既存のSeaArt式候補ダイアログで開く。
  const openEnhanced=function(key,title,entries,launch,person,adult){
    activePersonPicker=adultDisplayPicker(entries[0]);
    personQuickMode='all';configurePersonCustom();configureQuickTendencies('personQuickTabs',false,'audience');
    const tabs=[...new Set(entries.map(function(entry){return entry.tab||title}))];
    adultDisplaySession={key:key,title:title,entries:entries,tabs:tabs,tab:tabs[0],person:person,adult:adult,enhanced:true};
    lastPersonLaunch=launch;personBefore={root:window.scrollY||0,inner:$('workspaceMain').scrollTop||0};
    $('personChoiceTitle').textContent=person.name+'：'+title;
    $('personChoiceSearch').value='';$('personChoiceDialog').classList.add('adultDisplayDialog');
    adultDisplayTabs.hidden=tabs.length<2;adultDisplayTabs.classList.toggle('scrollableTabs',tabs.length>2);adultDisplayTabs.classList.toggle('simpleTabs',tabs.length===2);updatePersonCandidateControls();adultDisplayGroups();
    renderPersonChoiceDialog();$('personChoiceDialog').showModal();
  };
  const adultClothingTargetContext=function(person){
    const profile=profiles[person.id]??={};
    return {profile,field:'clothingStateTargets',source:'adult:clothingStateTarget',colorable:false,weight:function(){return 1},weightBounds:[1,1],key:function(value){return value},setWeight:function(){},setColor:function(){},remove:function(){}};
  };
  const adultClothingStateName=function(state,api){
    return (api.options||[]).find(function(row){return row[0]===state})?.[1]||state;
  };
  const adultClothingTargetRows=function(person){
    return adultClothingOptionsForPerson(person).map(function(row){return [row.value,row.name,row.group]});
  };
  const adultClothingTargetEntry=function(person,adult,state,stateApi,card){
    adult.clothingStateTargets??={};
    const rows=adultClothingTargetRows(person),available=new Set(rows.map(function(row){return row[0]})),context=adultClothingTargetContext(person),source='';
    const api={
      title:adultClothingStateName(state,stateApi)+'の対象',source:source,ownerId:person.id,options:rows,context:context,
      getValues:function(){return asList(adult.clothingStateTargets?.[state]).filter(function(value){return available.has(value)})},
      setValues:function(values){
        const next=asList(values).filter(function(value){return available.has(value)});
        adult.clothingStateTargets??={};
        if(next.length)adult.clothingStateTargets[state]=next;else delete adult.clothingStateTargets[state];
        refreshEnhancedCardSummaries();updatePersonBadges();
      },
      refresh:function(){refreshEnhancedCardSummaries();updatePersonBadges()}
    };
    return {box:{pickerApi:api},field:'clothingStateTargets.'+state,title:api.title,tab:'対象',ownerId:person.id,refreshCard:api.refresh};
  };
  const enhanceCardLaunches=function(){
    document.querySelectorAll('[data-adult-card]').forEach(function(card){
      const key=card.dataset.adultCard;
      if(!['exposure','clothingState','selfAction','sexualContact','sexualAct'].includes(key))return;
      const launch=card.querySelector(':scope>.personLaunch');
      const person=allPeople().find(function(x){return x.id===personKey})||allPeople()[0];
      const adult=person&&(adultScene.people[person.id]||{});
      const boxes=[...card.querySelectorAll('.personPicker')];
      if(key==='clothingState'&&person&&adult&&boxes.length){
        const stateBox=boxes[0],original=stateBox.pickerApi,entries=[];
        const stateApi={...original,title:'状態',getValues:original.getValues,setValues:function(values){original.setValues(values);syncTargets();},refresh:function(){original.refresh();syncTargets();refreshEnhancedCardSummaries();}};
        const stateEntry={box:{pickerApi:stateApi},field:'clothingState',title:'状態',tab:'状態',ownerId:person.id,refreshCard:stateApi.refresh};
        const syncTargets=function(){
          adult.clothingStateTargets??={};
          const selectedStates=asList(stateApi.getValues()),rows=adultClothingTargetRows(person),available=new Set(rows.map(function(row){return row[0]}));
          Object.keys(adult.clothingStateTargets).forEach(function(state){
            if(!selectedStates.includes(state))delete adult.clothingStateTargets[state];
            else adult.clothingStateTargets[state]=asList(adult.clothingStateTargets[state]).filter(function(value){return available.has(value)});
            if(selectedStates.includes(state)&&!adult.clothingStateTargets[state]?.length)delete adult.clothingStateTargets[state];
          });
          const targets=selectedStates.map(function(state){return adultClothingTargetEntry(person,adult,state,stateApi,card)});
          if(!targets.length){
            const guideApi={title:'対象',source:'',ownerId:person.id,options:[],context:adultClothingTargetContext(person),getValues:function(){return[]},setValues:function(){},refresh:function(){}};
            targets.push({box:{pickerApi:guideApi},field:'clothingStateTargets',title:'対象',tab:'対象',ownerId:person.id,refreshCard:function(){}});
          }
          entries.splice(0,entries.length,stateEntry,...targets);
          if(adultDisplaySession?.key==='clothingState')adultDisplaySession.entries=entries;
        };
        entries.push(stateEntry);syncTargets();
        if(!launch)return;
        launch.onclick=function(){openEnhanced(key,card.querySelector('strong')?.textContent||'衣装の状態',entries,launch,person,adult)};
        return;
      }
      const entries=boxes.map(function(box){
        const api=box.pickerApi;
        const tab={exposure:'露出',clothingState:'衣装状態',selfAction:'本人の動作',sexualContact:'性的な接触',sexualAct:'性行為'}[key]||key;
        return {box:box,field:api.source,title:box.dataset.pickerTitle||key,tab:tab,ownerId:person?.id,refreshCard:api.refresh};
      });
      if(!launch||!entries.length||!person)return;
      launch.onclick=function(){openEnhanced(key,card.querySelector('strong')?.textContent||key,entries,launch,person,adult)};
    });
  };
  const adultCardTitles={
    exposure:'露出',
    clothingState:'衣装の状態',
    selfAction:'本人の動作',
    sexualContact:'性的な接触',
    sexualAct:'性行為',
    expression:'表情',
    scene:'場面・演出'
  };
  const refreshEnhancedCardSummaries=function(){
    document.querySelectorAll('[data-adult-card]').forEach(function(card){
      const key=card.dataset.adultCard,title=adultCardTitles[key];if(!title)return;
      const launch=card.querySelector(':scope>.personLaunch');if(!launch)return;
      const person=allPeople().find(x=>x.id===personKey)||allPeople()[0];if(!person)return;
      const adult=adultScene.people[person.id]||{},entries=[];
      for(const box of card.querySelectorAll('.dialogBody>.personPicker')){
        const api=box.pickerApi;if(!api)continue;
        for(const value of asList(api.getValues())){
          const selected=adultCardEntry({box,ownerId:person.id,refreshCard:refreshEnhancedCardSummaries},value);
          if(key==='clothingState'){
            const drop=selected.remove;
            selected.remove=function(){delete adult.clothingStateTargets?.[value];drop()};
          }
          entries.push(selected);
          if(key==='clothingState')for(const target of asList(adult.clothingStateTargets?.[value])){
            const row=adultClothingOptionsForPerson(person).find(row=>row.value===target);
            entries.push({name:selected.name+'：'+(row?.name||target),value:target,open:()=>launch.click(),remove:function(){
              const kept=asList(adult.clothingStateTargets?.[value]).filter(v=>v!==target);
              if(kept.length)adult.clothingStateTargets[value]=kept;else delete adult.clothingStateTargets[value];
              refreshEnhancedCardSummaries();updatePersonBadges();dirty();
            }});
          }
        }
      }
      renderUnifiedCard(card,launch,title,entries);
    });
  };
  const renderPersonChoiceBeforeClothingRelation=renderPersonChoiceDialog;
  renderPersonChoiceDialog=function(){
    renderPersonChoiceBeforeClothingRelation();
    const session=adultDisplaySession;
    if(!session||session.key!=='clothingState'||session.tab!=='対象')return;
    const root=$('personChoiceChoices'),person=session.person,hasTargets=adultClothingTargetRows(person).length>0,hasStates=asList(session.adult?.clothingState).length>0;
    root.prepend(node('p',hasTargets?(hasStates?'状態ごとに、通常の「衣装」で選んだ対象を指定します。':'先に「状態」タブで状態を選択してください。'):'先に通常の「衣装」タブで衣装を選択してください。','hint'));
  };
  const renderAdultPartnerSelector=function(root,session){
    if(!root||!session||!['sexualContact','sexualAct'].includes(session.key)||!session.person||!session.adult)return;
    const field=session.key==='sexualContact'?'contactTarget':'sexualActTarget',others=mfAdultPeople(allPeople()).filter(function(person){return person.id!==session.person.id});
    if(!others.length)return;
    const label=node('label',session.key==='sexualContact'?'性的な接触の相手':'性行為の相手'),select=node('select');
    select.setAttribute('data-adult-target',field);select.setAttribute('aria-label',label.textContent);
    select.append(new Option('相手を選択',''));
    others.forEach(function(person){select.append(new Option(person.name,person.id))});
    if(!others.some(function(person){return person.id===session.adult[field]}))session.adult[field]='';
    select.value=session.adult[field]||'';
    select.onchange=function(){session.adult[field]=select.value;dirty();renderPersonChoiceDialog()};
    label.append(select);root.prepend(label);
  };
  const renderPersonChoiceBeforeAdultPartner=renderPersonChoiceDialog;
  renderPersonChoiceDialog=function(){
    renderPersonChoiceBeforeAdultPartner();
    renderAdultPartnerSelector($('personChoiceChoices'),adultDisplaySession);
  };
  const renderDashboardBeforeEnhanced=renderAdultDashboard;
  renderAdultDashboard=function(force){
    renderDashboardBeforeEnhanced(force);
    enhanceCardLaunches();
    refreshEnhancedCardSummaries();
    const person=allPeople().find(function(x){return x.id===personKey})||allPeople()[0];
    if(!person)return;
    const p=adultScene.people[person.id]||{};
    const contactCard=document.querySelector('[data-adult-card="sexualContact"]');
    const actCard=document.querySelector('[data-adult-card="sexualAct"]');
    targetControl(contactCard?.querySelector('dialog .dialogBody'),'接触する相手',p,'contactTarget',person);
    targetControl(actCard?.querySelector('dialog .dialogBody'),'性行為の相手',p,'sexualActTarget',person);
    addConsent();
  };
  enhanceCardLaunches();
  refreshEnhancedCardSummaries();

  // 候補編集画面にも新しい成人向け分類を表示する。
  const editor=$('editCategory');
  [['adult:clothingState','成人：対象の状態'],['adult:selfAction','成人：本人の動作'],['adult:sexualContact','成人：性的な接触'],['adult:sexualAct','成人：性行為']].forEach(function(pair){
    if(editor&&![...editor.options].some(function(o){return o.value===pair[0]}))editor.append(new Option(pair[1],pair[0]));
  });
  if(window.appReady){try{renderAdult();renderAdultDashboard(true)}catch(error){console.warn('成人向け拡張の初期化に失敗しました',error)}}
})();
// END ADULT_ENHANCED_MIGRATION
