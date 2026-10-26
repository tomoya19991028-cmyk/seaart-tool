
// 成人画面内ですでに限定されているため、胸サイズの見出しを短くする。
(function(){
  if(detailOptions?.bust)detailOptions.bust.label='胸の大きさ';
  if(window.appReady){try{renderAdultDashboard(true)}catch(error){console.warn('胸サイズ表示の更新に失敗しました',error)}}
})();
