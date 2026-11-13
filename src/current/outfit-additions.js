// Shipped wardrobe definitions. Register before settings merge and foundation capture.
// Tuples contain [prompt value, Japanese label]; colors remain editable per part.
const waOutfitAdditions=[
 {id:'school-swimsuit',name:'スクール水着',value:'school swimsuit',group:'水着・スポーツ',parts:{upper:['school swimsuit','スクール水着']}},
 {id:'racing-swimsuit',name:'競泳水着',value:'racing swimsuit',group:'水着・スポーツ',parts:{upper:['racing swimsuit','競泳水着']}},
 {id:'separate-school-swimsuit',name:'セパレートスクール水着',value:'two-piece school swimsuit',group:'水着・スポーツ',parts:{upper:['school swimsuit top','スクール水着のトップス'],lower:['school swim shorts','スクール水着のパンツ']}},
 {id:'tankini',name:'タンキニ',value:'tankini',group:'水着・スポーツ',parts:{upper:['tankini top','タンキニのトップス'],lower:['bikini bottom','水着の下']}},
 {id:'rash-guard-set',name:'ラッシュガードセット',value:'rash guard and swim shorts',group:'水着・スポーツ',parts:{upper:['long-sleeved rash guard','長袖ラッシュガード'],lower:['swim shorts','スイムパンツ']}},
 {id:'high-waisted-bikini',name:'ハイウエストビキニ',value:'high-waisted bikini',group:'水着・スポーツ',parts:{upper:['bikini top','水着の上'],lower:['high-waisted bikini bottom','ハイウエストビキニの下']}},
 {id:'frilled-bikini',name:'フリルビキニ',value:'frilled bikini',group:'水着・スポーツ',parts:{upper:['frilled bikini top','フリルビキニの上'],lower:['frilled bikini bottom','フリルビキニの下']}},
 {id:'board-shorts',name:'サーフパンツ',value:'board shorts',group:'水着・スポーツ',parts:{lower:['board shorts','サーフパンツ']}},
 {id:'micro-bikini',name:'マイクロビキニ',value:'micro bikini',group:'水着・スポーツ',parts:{upper:['micro bikini top','マイクロビキニの上'],lower:['micro bikini bottom','マイクロビキニの下']}},
 {id:'reverse-bunny',name:'逆バニー',value:'reverse bunny suit',group:'バニー・コスプレ',parts:{upper:['reverse bunny suit','逆バニーの衣装本体'],head:['bunny ears','うさ耳'],hands:['wrist cuffs','カフス'],accessory:['detached collar with bow tie','付け襟・蝶ネクタイ']}},
 {id:'gothic-qipao',name:'白黒ゴシックチャイナ',value:'black and white gothic qipao',group:'中華・ファンタジー',parts:{upper:['white gothic cutout qipao with black trim','白黒ゴシックチャイナの衣装本体'],hands:['white wide detached sleeves with black trim','白黒ゴシックチャイナの付け袖'],accessory:['black decorative waist straps','黒いウエスト装飾ベルト']}},
 {id:'gothic-maid',name:'ゴシックメイド',value:'gothic maid outfit',group:'ゴシック・コスプレ',parts:{upper:['gothic frilled maid blouse','ゴシックメイドのフリルブラウス'],lower:['gothic maid skirt','ゴシックメイドのスカート'],head:['maid headdress','メイドカチューシャ'],accessory:['apron','エプロン']}},
 {id:'corset-dress',name:'コルセットドレス',value:'corset dress',group:'ゴシック・コスプレ',parts:{upper:['lace-up corset bodice','編み上げコルセット'],lower:['full dress skirt','ドレスのフレアスカート'],hands:['detached puff sleeves','パフスリーブの付け袖']}},
 {id:'cutout-dress',name:'カットアウトドレス',value:'cutout dress',group:'フォーマル・舞台',parts:{upper:['waist-cutout dress','ウエストカットアウトのドレス']}},
 {id:'sister-dress',name:'シスタードレス',value:'high-collared nun dress and veil',group:'ゴシック・コスプレ',parts:{upper:['high-collared nun dress','立ち襟のシスタードレス'],head:['veil','ヴェール']}},
 {id:'wa-gothic',name:'和風ゴシック',value:'wa gothic outfit',group:'和風・ファンタジー',parts:{upper:['gothic kimono-style top','和風ゴシックの着物風トップス'],lower:['frilled skirt','フリルスカート'],accessory:['obi belt','帯']}},
 {id:'chinese-combat',name:'中華風戦闘服',value:'Chinese-style combat outfit',group:'中華・ファンタジー',parts:{upper:['mandarin-collar combat top','立ち襟の中華風戦闘トップス'],lower:['martial arts trousers','武術用パンツ'],hands:['decorative arm guards','装飾付きアームガード']}},
 {id:'arabian-dancer',name:'アラビアン風踊り子',value:'Arabian dancer outfit',group:'フォーマル・舞台',parts:{upper:['ornamented dancer top','装飾付き踊り子トップス'],lower:['harem pants','ハーレムパンツ'],head:['dancer veil','踊り子のヴェール']}},
 {id:'harness-bodysuit',name:'ハーネスボディスーツ',value:'harness bodysuit',group:'ゴシック・コスプレ',parts:{upper:['harness bodysuit','ハーネスボディスーツ本体'],accessory:['decorative harness straps','装飾ハーネス'],feet:['boots','ブーツ']}},
 {id:'cyber-bodysuit',name:'サイバーボディスーツ',value:'cybernetic bodysuit',group:'SF・近未来',parts:{upper:['futuristic bodysuit','近未来ボディスーツ'],hands:['futuristic armored bracers','近未来の装甲アームガード'],accessory:['glowing circuit ornaments','発光する回路装飾']}},
 {id:'armored-princess',name:'騎士姫ドレス',value:'armored princess dress',group:'ファンタジー・戦闘',parts:{upper:['dress bodice with breastplate','胸当て付きドレスの上半身'],lower:['royal dress skirt','騎士姫のドレススカート'],hands:['gauntlets','手甲']}}
];
function waRegisterOutfits(){
 for(const entry of waOutfitAdditions){
  if(!catalog.outfit.some(row=>row.value.toLowerCase()===entry.value.toLowerCase()))catalog.outfit.push({id:'outfit-extra-'+entry.id,name:entry.name,value:entry.value,group:entry.group});
  const parts={};
  for(const [field,[value,name]]of Object.entries(entry.parts)){
   parts[field]=value;
   outfitPartNames[value]??=name;
   const group=field==='upper'?entry.group:field==='lower'?(/skirt/.test(value)?'スカート・ドレス':'パンツ'):field==='feet'?'靴':field==='head'?'帽子・頭装備':field==='hands'?'手袋・腕防具':'衣装装飾';
   for(const store of [detailBuiltin[field],detailOptions[field].options])if(!store.some(row=>row[0]===value))store.push([value,name,group]);
  }
  outfitSets[entry.value]??=parts;
 }
}
