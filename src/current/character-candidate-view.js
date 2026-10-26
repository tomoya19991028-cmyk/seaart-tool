
// The fourth primary button is a view, rather than an extra inclusion toggle.
// Keep candidate ownership, selection setters and all persistence unchanged.
function cfPersonView(){return !!activePersonPicker&&!adultDisplaySession&&!(typeof paReady==='function'&&paReady())&&!(typeof spReady==='function'&&spReady())}
const cfManualBefore=personManualCandidateAllowed;
personManualCandidateAllowed=function(source,value,name,query,picked,kind,picker=activePersonPicker){
 if(cfPersonView()&&personCharacterCandidatesVisible&&!characterCandidateOwners(picker.source,value))return false;
 return cfManualBefore.apply(this,arguments);
};
const cfGroupsBefore=personCharacterCandidateGroups;
personCharacterCandidateGroups=function(picker,rows){const result=cfGroupsBefore.apply(this,arguments);return cfPersonView()&&personCharacterCandidatesVisible?result.filter(row=>characterCandidateOwners(picker.source,row[0])):result};
const cfRenderBefore=renderPersonChoiceDialog;
renderPersonChoiceDialog=function(){const result=cfRenderBefore.apply(this,arguments);if(!cfPersonView())return result;
 const own=personCharacterCandidatesVisible;
 if(own){for(const button of $('personQuickTabs').querySelectorAll('[data-quick]')){button.classList.remove('active');button.setAttribute('aria-pressed','false')}
  if(!$('personChoiceChoices').querySelector('input[type="checkbox"],.pickedRow')){
   const exists=displayPersonRows(activePersonPicker).some(row=>characterCandidateOwners(activePersonPicker.source,row[0]));
   const empty=node('p',exists?'条件に一致するキャラ固有候補がありません。':'この項目にはキャラ固有候補が登録されていません。','small');empty.id='characterCandidateEmpty';$('personChoiceChoices').replaceChildren(empty);
  }
 }
 return result;
};
const cfToggleBefore=personCharacterButton.onclick;
personCharacterButton.onclick=function(...args){
 if(simpleDialog.open||$('choiceDialog').open||!cfPersonView())return cfToggleBefore.apply(this,args);
 // Clear intersecting filters on entry so the new view is immediately visible.
 if(!personCharacterCandidatesVisible){personQuickMode='all';$('personChoiceSearch').value='';$('personChoiceGroup').value='';$('personHairTendency').value='';$('personHairKind').value='';$('personOutfitTendency').value=''}
 return cfToggleBefore.apply(this,args);
};
const cfQuickBefore=$('personQuickTabs').onclick;
$('personQuickTabs').onclick=function(event){if(event.target.closest('[data-quick]')&&cfPersonView()&&personCharacterCandidatesVisible){personCharacterCandidatesVisible=false;const groups=$('personChoiceGroup');groups.replaceChildren(new Option('すべての分類',''));for(const name of displayGroupNames(activePersonPicker.source,personCharacterCandidateGroups(activePersonPicker,displayPersonRows(activePersonPicker))))groups.add(new Option(name,name));groups.value='';optionPages.person=0;updatePersonCandidateControls()}
 return cfQuickBefore.call(this,event);
};
// Shared equipment/global Pickers still own this same node while open. Return
// it to its wrapper before their legacy renderer moves the wrapper into place.
const cfSimpleBefore=renderSimpleTarget;
renderSimpleTarget=function(){if(simpleActive?.personId&&!simpleIsGlobal(simpleActive.key)){if(personCharacterButton.parentElement!==personCharacterControls)personCharacterControls.append(personCharacterButton);personCharacterControls.hidden=true;personCharacterButton.hidden=true}return cfSimpleBefore.apply(this,arguments)};
const cfChoiceBefore=renderChoiceDialog;
renderChoiceDialog=function(){if($('choiceDialog').open){if(personCharacterButton.parentElement!==personCharacterControls)personCharacterControls.append(personCharacterButton);personCharacterControls.hidden=true;personCharacterButton.hidden=true}return cfChoiceBefore.apply(this,arguments)};
$('personChoiceSearch').oninput=()=>renderPersonChoiceDialog();
