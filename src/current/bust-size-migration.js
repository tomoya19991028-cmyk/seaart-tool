
// 胸サイズは専用項目へ集約し、胸の形・質感側からサイズ候補を除外する。
(function(){
  const legacyBustSizes=new Map([
    ['flat chest','flat chest'],['small breasts','small breasts'],['medium breasts','medium breasts'],
    ['large breasts','large bust'],['large bust','large bust'],['huge breasts','huge breasts'],['gigantic breasts','gigantic breasts']
  ]);
  const legacySizeRows=[...(adultBodyOptions.bustShape||[]),...(adultCustom.bustShape||[])].filter(function(row){return row[2]==='大きさ'});
  for(const row of legacySizeRows)if(!legacyBustSizes.has(row[0]))legacyBustSizes.set(row[0],row[0]);
  const sizeOptions=detailOptions.bust.options,knownSizeValues=new Set(sizeOptions.map(function(row){return row[0]}));
  for(const [oldValue,newValue] of legacyBustSizes){if(!knownSizeValues.has(newValue)){const source=legacySizeRows.find(function(row){return row[0]===oldValue});sizeOptions.push([newValue,source?.[1]||oldValue,'大きさ']);knownSizeValues.add(newValue)}}
  adultBodyOptions.bustShape=(adultBodyOptions.bustShape||[]).filter(function(row){return row[2]!=='大きさ'&&!legacyBustSizes.has(row[0])});
  let bustMigrationPending=false;
  function migrateBustSize(personId){
    const adult=adultScene.people?.[personId];if(!adult)return false;
    const oldValues=asList(adult.bustShape).filter(function(value){return legacyBustSizes.has(value)});if(!oldValues.length)return false;
    const remaining=asList(adult.bustShape).filter(function(value){return !legacyBustSizes.has(value)});
    if(remaining.length)adult.bustShape=remaining;else delete adult.bustShape;
    const profile=profiles[personId]??={};profile.detail??={};
    if(!asList(profile.detail.bust).length)profile.detail.bust=legacyBustSizes.get(oldValues[oldValues.length-1]);
    profile.adultAppearance=!!profile.detail.bust;
    bustMigrationPending=true;
    return true;
  }
  function migrateAllBustSizes(){let changed=false;for(const personId of Object.keys(adultScene.people||{}))changed=migrateBustSize(personId)||changed;return changed}
  function persistBustMigration(){if(!bustMigrationPending||!window.appReady)return;if(typeof markGenerationDirty==='function')markGenerationDirty();if(typeof scheduleWorkingSave==='function')scheduleWorkingSave();bustMigrationPending=false}
  function withoutBustSizeChoices(callback){
    const original=adultCustom.bustShape;
    if(Array.isArray(original))adultCustom.bustShape=original.filter(function(row){return row[2]!=='大きさ'&&!legacyBustSizes.has(row[0])});
    try{return callback()}finally{if(Array.isArray(original))adultCustom.bustShape=original}
  }
  const renderAdultBodyBeforeBustMigration=renderAdultBodyForSelected;
  renderAdultBodyForSelected=function(){const args=arguments;migrateBustSize(personKey);persistBustMigration();return withoutBustSizeChoices(()=>renderAdultBodyBeforeBustMigration.apply(this,args))};
  const renderAdultDashboardBeforeBustMigration=renderAdultDashboard;
  renderAdultDashboard=function(){const args=arguments;migrateAllBustSizes();persistBustMigration();return withoutBustSizeChoices(()=>renderAdultDashboardBeforeBustMigration.apply(this,args))};
  const adultPersonPromptBeforeBustMigration=adultPersonPrompt;
  adultPersonPrompt=function(person,people){migrateBustSize(person?.id);persistBustMigration();return adultPersonPromptBeforeBustMigration.apply(this,arguments)};
  migrateAllBustSizes();persistBustMigration();
})();
