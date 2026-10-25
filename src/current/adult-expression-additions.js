
// 成人向け表情に、短く性的なタグだけを追加する。
(function(){
  const additions=[
    ['aroused expression','興奮した表情','性的な反応'],
    ['lustful gaze','欲情した視線','性的な視線'],
    ['expression of pleasure','快感の表情','性的な反応'],
    ['ecstatic expression','恍惚の表情','性的な反応'],
    ['orgasmic expression','絶頂の表情','性的な反応'],
    ['teary-eyed pleasure','快感で涙ぐむ','性的な反応'],
    ['lewd smile','淫らな笑み','性的な反応']
  ];
  const items=adultPresets.expression.items;
  for(const row of additions){
    if(!items.some(function(item){return String(item[0]).toLowerCase()===row[0].toLowerCase()}))items.push(row);
  }
  if(window.appReady){try{renderAdultDashboard(true)}catch(error){console.warn('成人向け表情候補の更新に失敗しました',error)}}
})();
