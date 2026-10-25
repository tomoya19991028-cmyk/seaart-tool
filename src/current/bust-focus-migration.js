
// 胸の見せ方を露出・本人の動作へ統合し、専用欄を廃止する。
(function(){
  const focusExposureMap={'cleavage':'cleavage','innerboob':'innerboob','inner boob':'innerboob','sideboob':'side boob','side boob':'side boob','underboob':'under boob','under boob':'under boob','upper breast':'upper breast'};
  const focusActionMap={'breast silhouette':'breast silhouette','emphasize breasts':'emphasize breasts'};
  const canonicalExposureRows=[['innerboob','内側の谷間','胸'],['upper breast','上乳','胸']];
  const actionRows=[
    ['handjob','手コキポーズ','対人動作'],
    ['fellatio','フェラチオポーズ','対人動作'],
    ['spread pussy','くぱぁ','姿勢'],
    ['breast silhouette','胸の輪郭','姿勢'],
    ['emphasize breasts','胸を強調','姿勢']
  ];
  function addRow(list,row){if(!Array.isArray(list))return;if(!list.some(function(item){return String(item[0]).toLowerCase()===String(row[0]).toLowerCase()}))list.push(row)}
  const oldFocusRows=[...(adultBodyOptions.bustFocus||[]),...(adultCustom.bustFocus||[])];
  canonicalExposureRows.forEach(function(row){addRow(adultPresets.exposure.items,row)});
  actionRows.forEach(function(row){addRow(adultPresets.selfAction.items,row)});
  for(const row of oldFocusRows){
    const value=String(row[0]||''),lower=value.toLowerCase(),exposureValue=focusExposureMap[lower],actionValue=focusActionMap[lower];
    const field=exposureValue?'exposure':'selfAction',target=exposureValue||actionValue||value;
    if(field==='exposure'&&!adultPresets.exposure.items.some(function(item){return item[0]===target})&&!adultCustom.exposure.some(function(item){return item[0]===target}))addRow(adultCustom.exposure,[target,row[1]||value,'胸']);
    if(field==='selfAction'&&!adultPresets.selfAction.items.some(function(item){return item[0]===target})&&!adultCustom.selfAction.some(function(item){return item[0]===target}))addRow(adultCustom.selfAction,[target,row[1]||value,'姿勢']);
  }
  adultBodyOptions.bustFocus=[];

  const priorDefinitions=pgAdultDefinitions;
  pgAdultDefinitions=function(){return priorDefinitions().map(function(definition){return definition[0]==='details'?[definition[0],definition[1],definition[2].filter(function(field){return field[1]!=='bustFocus'})]:definition})};
  const renderAdultBodyBeforeFocusRemoval=renderAdultBodyForSelected;
  renderAdultBodyForSelected=function(){
    const result=renderAdultBodyBeforeFocusRemoval.apply(this,arguments),body=$('adultBodyPickers');
    if(body)[...body.querySelectorAll('.personPicker')].filter(function(box){return box.dataset.pickerTitle==='胸の見せ方'}).forEach(function(box){box.remove()});
    return result;
  };

  function pushUnique(values,value){if(!values.some(function(existing){return String(existing).toLowerCase()===String(value).toLowerCase()}))values.push(value)}
  function migrateFocus(personId){
    const person=adultScene.people?.[personId];if(!person)return false;
    const oldValues=asList(person.bustFocus);if(!oldValues.length)return false;
    person.exposure=asList(person.exposure);person.selfAction=asList(person.selfAction);
    const profile=profiles[personId]||{},weights=profile.itemWeights?.['adult:bustFocus']||{};
    for(const oldValue of oldValues){
      const lower=String(oldValue).toLowerCase(),field=focusExposureMap[lower]?'exposure':'selfAction',value=focusExposureMap[lower]||focusActionMap[lower]||oldValue;
      pushUnique(person[field],value);
      const weight=weights[oldValue];if(weight!==undefined){profile.itemWeights??={};profile.itemWeights['adult:'+field]??={};if(profile.itemWeights['adult:'+field][value]===undefined)profile.itemWeights['adult:'+field][value]=weight}
    }
    delete person.bustFocus;return true;
  }
  let migrationPending=false;
  function migrateAllFocus(){let changed=false;for(const personId of Object.keys(adultScene.people||{}))changed=migrateFocus(personId)||changed;if(changed)migrationPending=true;return changed}
  function persistMigration(){if(!migrationPending||!window.appReady)return;if(typeof markGenerationDirty==='function')markGenerationDirty();if(typeof scheduleWorkingSave==='function')scheduleWorkingSave();migrationPending=false}
  const priorRenderDashboard=renderAdultDashboard;
  renderAdultDashboard=function(){migrateAllFocus();persistMigration();return priorRenderDashboard.apply(this,arguments)};
  const priorAdultPrompt=adultPersonPrompt;
  adultPersonPrompt=function(person,people){migrateFocus(person?.id);persistMigration();return priorAdultPrompt.apply(this,arguments)};
  migrateAllFocus();persistMigration();

  const editor=$('editCategory');if(editor){for(const option of [...editor.options])if(option.value==='adult:bustFocus')option.remove()}
})();
