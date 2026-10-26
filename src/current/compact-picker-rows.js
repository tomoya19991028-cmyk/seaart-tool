
// Reuse the three lighting panes and their existing values/Undo callbacks.
const crPreviousSimple=renderSimpleTarget;
renderSimpleTarget=function(){
 const result=crPreviousSimple.apply(this,arguments);if(simpleActive?.key!=='lighting')return result;
 const color=simpleDialog.querySelector('#lightingColorOpen'),control=simpleDialog.querySelector('#lightingColorControl');if(!color)return result;
 const tabs=[...simpleTabs.children];for(const tab of tabs){const select=tab.onclick;tab.onclick=function(event){euLightOpen=false;return select.call(this,event)};if(euLightOpen){tab.classList.remove('active');tab.setAttribute('aria-selected','false')}}
 color.title=color.textContent;color.setAttribute('aria-label',color.title);color.textContent='光の色';color.setAttribute('role','tab');color.setAttribute('aria-selected',String(euLightOpen));
 color.onclick=()=>{euLightOpen=true;renderSimpleTarget()};simpleTabs.append(color);control?.remove();return result;
};
// Nine stock hair modes occupy two complete rows: five buttons, then four.
// Original mode IDs, selected colors, and click handlers remain on the same nodes.
const crPreviousPalette=renderColorPalette;
renderColorPalette=function(){
 const result=crPreviousPalette.apply(this,arguments),modes=$('colorPaletteModes'),kind=paletteContext?.kind;modes.dataset.paletteKind=kind||'';if(kind!=='hair')return result;
 const rows=[...structuralBuiltin.hairMode,...structuralPresetCustom.hairMode],buttons=[...modes.children],short={single:'単色',two:'2色',mesh:'メッシュ',inner:'インナー',streak:'ハイライト',tips:'毛先',ombre:'グラデ',split:'左右分け',roots:'根元'};
 buttons.forEach((button,i)=>{const value=rows[i]?.[0];button.title=button.textContent;button.setAttribute('aria-label',button.textContent);button.dataset.paletteMode=value||'';if(short[value])button.textContent=short[value]});
 const count=Math.ceil(buttons.length/2);modes.replaceChildren();for(const batch of [buttons.slice(0,count),buttons.slice(count)]){if(!batch.length)continue;const row=node('div',undefined,'paletteModeRow');row.style.setProperty('--mode-columns',String(batch.length));row.append(...batch);modes.append(row)}return result;
};
// The existing character-specific toggle is shared by every person Picker.
// Move that button instead of copying its state or creating another filter.
let crCharacterAvailable=false;
function crSyncCharacterQuick(){
 const tabs=$('personQuickTabs'),button=personCharacterButton;if(!tabs||!button)return;
 if(simpleDialog.open||$('choiceDialog').open){if(button.parentElement!==personCharacterControls)personCharacterControls.append(button);tabs.classList.remove('characterQuickRow');return;}
 const firstTendency=tabs.querySelector('[data-tendency]');if(firstTendency){if(button.nextElementSibling!==firstTendency)tabs.insertBefore(button,firstTendency)}else if(button.parentElement!==tabs)tabs.append(button);
 personCharacterControls.hidden=true;
 const available=crCharacterAvailable&&!tabs.hidden&&!activePersonPicker?.customOnly&&!adultDisplaySession?.adult&&!(typeof paReady==='function'&&paReady())&&!(typeof spReady==='function'&&spReady());
 button.hidden=!available;button.textContent='キャラ固有';button.title='他のキャラクターを含む固有候補の表示を切り替え';button.setAttribute('aria-label',button.title);tabs.classList.toggle('characterQuickRow',!!available);
 if(available){const favorite=tabs.querySelector('[data-quick="favorite"]');favorite.textContent='お気に入り';favorite.setAttribute('aria-label','お気に入りの候補を表示')}
}
const crPreviousControls=updatePersonCandidateControls;
updatePersonCandidateControls=function(){const result=crPreviousControls.apply(this,arguments);crCharacterAvailable=!personCharacterButton.hidden&&!personCharacterControls.hidden;crSyncCharacterQuick();return result};
const crPreviousConfigure=configurePersonCustom;
configurePersonCustom=function(){const result=crPreviousConfigure.apply(this,arguments);crSyncCharacterQuick();return result};
const crPreviousPerson=renderPersonChoiceDialog;
renderPersonChoiceDialog=function(){const result=crPreviousPerson.apply(this,arguments);crSyncCharacterQuick();return result};
$('personChoiceSearch').oninput=()=>renderPersonChoiceDialog();
crSyncCharacterQuick();
