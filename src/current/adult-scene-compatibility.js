
// 「場面・演出」カードは他項目と重なるため一覧から外す。
// 保存済みの共有シーン値と成人確認下でのプロンプト出力は互換性のため維持する。
(function(){
  const priorDefinitions=pgAdultDefinitions;
  pgAdultDefinitions=function(){return priorDefinitions().filter(function(definition){return definition[0]!=='scene'})};
  if(window.appReady){try{renderAdultDashboard(true)}catch(error){console.warn('成人向けカードの更新に失敗しました',error)}}
})();
