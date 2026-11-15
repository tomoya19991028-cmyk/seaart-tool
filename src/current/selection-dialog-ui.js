// Presentation only: reuse native controls, callbacks, candidate data and saves.
const selectionUIIds=new Set(['choiceDialog','backgroundDesignDialog','personChoiceDialog','creatureDialog','normalSceneDialog','sceneChoiceDialog','mangaSceneDialog','simpleSelectionDialog','colorPaletteDialog','horrorDialog','weatherTimeDialog','managedCandidateDialog','picker']);
const selectionUILists='#bdBody,.candidateList,.sceneChoiceList,#sceneChoiceChoices,#mangaSceneChoices,#mangaSceneOptions,#mangaSceneList,.simpleList,.choice-card-grid';
const selectionUIOpen=new Set(),selectionUIStates=new WeakMap();
let selectionUIView='list',selectionUITitleId=0;
const selectionUIStyles=`
.selectionSheet{--selection-accent:#79e2c6;--selection-bg:#0d141e;--selection-raised:#17293c;--selection-line:#34475d;--selection-text:#edf4fa;--selection-muted:#a9bad0;box-sizing:border-box!important;width:min(720px,calc(100vw - 16px))!important;max-width:calc(100vw - 16px)!important;height:min(880px,calc(100dvh - 16px))!important;max-height:calc(100dvh - 16px)!important;padding:0!important;border:1px solid var(--selection-line)!important;border-radius:16px 16px 0 0!important;background:var(--selection-bg)!important;color:var(--selection-text)!important;position:fixed!important;inset:auto 0 0!important;margin:0 auto!important;overflow:hidden!important}
.selectionSheet[open]{display:flex!important;flex-direction:column!important}
.selectionSheet::backdrop{background:#020810ad;backdrop-filter:blur(3px)}
.selectionSheet.selectionPalette{height:auto!important}
.selectionSheet>.selectionHead{display:flex!important;align-items:center;flex:none!important;gap:8px!important;margin:0!important;padding:12px!important;border-bottom:1px solid var(--selection-line)!important;background:var(--selection-bg)!important;flex-wrap:nowrap!important}
.selectionSheet>.dialog-head.selectionHead{flex-direction:column;align-items:stretch}
.selectionSheet .cm-dialog-title-row{display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:8px!important;width:100%;margin:0!important}
.selectionSheet .cm-head-actions{display:flex!important;align-items:center;flex-wrap:nowrap!important;gap:6px!important;flex:none}
.selectionSheet .selectionHead :is(h2,h3){flex:1;min-width:0!important;max-width:none!important;margin:0!important;font-size:16px!important;line-height:1.5!important;font-weight:650;white-space:nowrap!important;overflow:hidden;text-overflow:ellipsis}
.selectionSheet .selectionHead :is(button,.cm-instant-control){box-sizing:border-box;min-height:44px!important;height:44px!important;min-width:44px;flex:none;padding:8px 10px!important;border:1px solid var(--selection-line)!important;border-radius:9px!important;background:var(--selection-raised)!important;color:var(--selection-text)!important;font-size:12px!important;line-height:1.3;white-space:nowrap}
.selectionSheet .selectionHead .cm-instant-control{display:flex!important;align-items:center;justify-content:center;margin:0!important}
.selectionSheet .selectionHead .cm-instant-control>span{padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:inherit!important;min-height:0!important;font:inherit!important}
.selectionSheet .selectionHead .cm-instant-control select{inset:0!important;width:100%!important;height:100%!important;min-height:44px!important}
.selectionSheet .selectionHead button[data-selection-close]{width:44px!important;min-width:44px!important;padding:0!important;margin-left:auto;font-size:0!important}
.selectionSheet .selectionHead button[data-selection-close]::before{content:'×';font-size:24px;font-weight:400;line-height:1}
.selectionSheet :is(input[type=search],#pickerSearch,.smu-search-row input){box-sizing:border-box!important;min-height:44px!important;height:44px;max-width:100%;padding:10px 12px!important;border:1px solid var(--selection-line)!important;border-radius:9px!important;background:#101d2b!important;color:var(--selection-text)!important;font-size:16px!important;line-height:1.4}
.selectionSheet>:is(input[type=search],#pickerSearch){flex:none;width:calc(100% - 24px)!important;margin:10px 12px!important}
.selectionSheet>.dialog-head :is(input[type=search],#pickerSearch){width:100%!important;margin:0!important}
.selectionSheet>label[for]{margin:8px 12px 0;font-size:12px;color:var(--selection-muted)}
.selectionSheet :is(.dialog-body,.dialogBody,.candidateList,.simpleList){min-height:0;overscroll-behavior:contain}
.selectionSheet>:is(.dialog-body,.dialogBody){flex:1;max-height:none!important;overflow:auto!important;padding:12px!important}
.selectionSheet>.bdBody{flex:1;min-height:0;max-height:none!important;overflow:auto!important;padding:0 12px 12px!important}
.selectionSheet>.bdTools:not([hidden]){display:flex;gap:8px;margin:10px 12px!important;flex:none}
.selectionSheet>.bdTools input[type=search]{flex:1;width:100%}
.selectionSheet>.bdTabs:not([hidden]),.selectionSheet>.bdQuick:not([hidden]){margin:0 12px 8px!important;flex:none}
.selectionSheet>.bdFilters{margin:0 12px 8px}
.selectionSheet.selectionCardMode>#bdBody{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:8px}
.selectionSheet.selectionCardMode>#bdBody>:not(.bdCandidateRow){grid-column:1 / -1}
.selectionSheet.selectionCardMode>#bdBody>.bdCandidateRow{box-sizing:border-box;min-height:72px;padding:10px!important;border:1px solid var(--selection-line)!important;border-radius:10px!important;background:var(--selection-raised)!important}
.selectionSheet>.hBody{flex:1;min-height:0;max-height:none!important;overflow:auto!important;padding:12px}
.selectionSheet>footer{flex:none;padding:10px 12px;border-top:1px solid var(--selection-line)}
.selectionSheet input:is([type=checkbox],[type=radio]){accent-color:var(--selection-accent)}
.selectionSheet>.dialog-body{display:flex!important;flex-direction:column;gap:8px!important;overflow:hidden!important}
.selectionSheet>.dialog-body>*{margin-top:0!important;margin-bottom:0!important}
.selectionSheet>.dialog-body>:not(.choice-card-grid){flex-shrink:0}
.selectionSheet>.dialog-body>.choice-card-grid{flex:1;min-height:0!important;max-height:none!important;overflow:auto!important}
.selectionSheet .catalog-selected{flex:none;max-height:22dvh;overflow:auto}
.selectionSheet>.selectionCandidates{flex:1;min-height:0!important;overflow:auto!important;padding:0 12px 12px!important}
.selectionSheet>:is(.quickTabs,.candidateQuickTabs,.simpleTabs,.simpleTools):not([hidden]){box-sizing:border-box!important;width:auto!important;min-width:0!important;max-width:calc(100% - 24px)!important;margin:0 12px 8px!important}
.selectionSheet :is(.quickTabs,.candidateQuickTabs,.simpleTabs,.dialog-filters,.smu-filters,.smu-audience,.bdTabs,.bdQuick):not([hidden]){display:flex!important;flex-wrap:wrap!important;gap:6px!important}
.selectionSheet #personQuickTabs.characterQuickRow:not([hidden]){display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-auto-flow:row!important}
.selectionSheet :is(.quickTabs,.candidateQuickTabs,.simpleTabs,.dialog-filters,.smu-filters,.smu-audience,.bdTabs,.bdQuick)>button{box-sizing:border-box!important;min-height:40px!important;height:auto!important;min-width:44px!important;width:auto!important;max-width:100%!important;flex:1 1 auto!important;padding:8px 10px!important;border:1px solid var(--selection-line)!important;border-radius:9px!important;background:var(--selection-raised)!important;color:var(--selection-text)!important;font-size:12px!important;line-height:1.4;white-space:normal!important;overflow-wrap:anywhere}
.selectionSheet :is(.quickTabs,.candidateQuickTabs,.simpleTabs,.dialog-filters,.smu-filters,.smu-audience,.bdTabs,.bdQuick)>button:is(.active,.primary,[aria-pressed=true]){border-color:var(--selection-accent)!important;background:var(--selection-accent)!important;color:#10342d!important;font-weight:650}
.selectionSheet :is(.catalog-info,#characterMatchCount,#personChoiceCount,#creatureCandidateCount){font-size:12px!important;color:var(--selection-muted)!important}
.selectionSheet>:is(#characterMatchCount,#personChoiceCount,#creatureCandidateCount){margin:0 12px 8px!important;flex:none}
.selectionSheet .selectionView:not([hidden]){display:flex;align-items:center;justify-content:flex-end;gap:4px;flex:none;margin:8px 0;padding:0}
.selectionSheet>.selectionView:not([hidden]){margin:0 12px 8px}
.selectionViewLabel{margin-right:4px;color:var(--selection-muted);font-size:12px}
.selectionSheet .selectionViewButton{box-sizing:border-box;min-height:36px;min-width:48px;padding:6px 9px;border:1px solid var(--selection-line);border-radius:8px;background:var(--selection-raised);color:var(--selection-text);font-size:12px}
.selectionSheet .selectionViewButton[aria-pressed=true]{border-color:var(--selection-accent);background:var(--selection-accent);color:#10342d;font-weight:650}
.selectionSheet.selectionListMode .selectionCandidates:not([hidden]):not(.uiOff){display:block!important;grid-template-columns:none!important}
.selectionSheet.selectionListMode :is(.smu-candidate,.cm-candidate){display:grid!important;grid-template-columns:minmax(0,1fr) 44px!important;gap:6px!important;margin:0!important;padding:4px 0!important;border:0!important;border-bottom:1px solid var(--selection-line)!important;border-radius:0!important;background:transparent!important}
.selectionSheet.selectionListMode .option-card{box-sizing:border-box;display:grid!important;grid-template-columns:22px minmax(0,1fr) auto;column-gap:8px;align-items:center;position:relative!important;width:100%!important;min-width:0!important;min-height:52px!important;height:auto!important;margin:0!important;padding:8px 6px!important;border:0!important;border-bottom:1px solid var(--selection-line)!important;border-radius:0!important;background:transparent!important;color:var(--selection-text)!important;text-align:left!important}
.selectionSheet.selectionListMode :is(.smu-candidate,.cm-candidate)>.option-card{border-bottom:0!important}
.selectionSheet.selectionListMode .option-card[aria-pressed]::before{content:'';grid-column:1;grid-row:1 / span 3;box-sizing:border-box;width:22px;height:22px;border:1px solid #8fa1b7;border-radius:5px;background:#182b3e;text-align:center;line-height:20px;color:#10342d}
.selectionSheet.selectionListMode .option-card[aria-pressed=true]::before{content:'✓';border-color:var(--selection-accent);background:var(--selection-accent);font-weight:750}
.selectionSheet.selectionListMode .option-card.smu-choice::before{content:none}
.selectionSheet.selectionListMode .smu-check{grid-column:1;grid-row:1 / span 3;box-sizing:border-box;width:22px!important;height:22px!important;min-width:22px!important;border:1px solid #8fa1b7;border-radius:5px;line-height:20px;text-align:center;color:#10342d}
.selectionSheet.selectionListMode .smu-choice[aria-pressed=true] .smu-check{background:var(--selection-accent);border-color:var(--selection-accent)}
.selectionSheet.selectionListMode .smu-candidate-text{grid-column:2 / -1;grid-row:1 / span 3;display:flex;flex-direction:column;align-items:flex-start;justify-self:stretch;min-width:0;width:100%;text-align:left!important}
.selectionSheet.selectionListMode .smu-candidate-text strong{font-size:14px!important;font-weight:500!important;line-height:1.5;text-align:left!important;white-space:normal;overflow-wrap:anywhere}
.selectionSheet.selectionListMode .smu-candidate-text small{font-size:11px!important;text-align:left!important;color:var(--selection-muted)}
.selectionSheet.selectionListMode .option-card>strong{grid-column:2;grid-row:1;min-width:0;max-width:100%;font-size:14px!important;font-weight:500!important;line-height:1.5;white-space:normal!important;overflow-wrap:anywhere;text-align:left!important;justify-self:stretch!important}
.selectionSheet.selectionListMode .option-card>:is(small,.catalog-badges){grid-column:2;min-width:0;max-width:100%;margin:2px 0 0;font-size:11px!important;color:var(--selection-muted);text-align:left!important;justify-self:stretch!important}
.selectionSheet.selectionListMode .option-card>.card-check{grid-column:3;grid-row:1;font-size:10px;color:var(--selection-accent)}
.selectionSheet.selectionListMode .option-card>.favorite-toggle{grid-column:3;grid-row:1 / span 3;position:static!important;justify-self:end;margin:0!important}
.selectionSheet.selectionListMode .option-card:has(>.favorite-toggle)>.card-check{grid-column:2;grid-row:auto}
.selectionSheet.selectionListMode :is(.favorite-toggle,.cm-star,.quickStar){box-sizing:border-box!important;position:static!important;width:44px!important;min-width:44px!important;height:44px!important;min-height:44px!important;align-self:center;padding:0!important;border:1px solid var(--selection-line)!important;border-radius:9px!important;background:var(--selection-raised)!important;color:#e2c467!important;font-size:18px!important}
.selectionSheet.selectionListMode .mangaSceneOption{box-sizing:border-box;width:100%;min-height:52px;margin:0;padding:10px;border:0;border-bottom:1px solid var(--selection-line);border-radius:0;background:transparent;color:var(--selection-text);font-size:14px;text-align:left}
.selectionSheet.selectionListMode .mangaSceneOption.active{background:var(--selection-raised);color:var(--selection-accent)}
.selectionSheet.selectionListMode .modalOption{min-height:52px!important;gap:8px!important;padding:8px 2px!important;border-bottom:1px solid var(--selection-line)!important;background:transparent!important;color:var(--selection-text)!important;font-size:14px!important}
.selectionSheet.selectionListMode .modalOption input[type=checkbox]{width:22px;height:22px;min-height:22px;accent-color:var(--selection-accent)}
.selectionSheet.selectionListMode .modalOption>button:not(.quickStar){box-sizing:border-box;min-width:44px;min-height:44px!important;padding:8px 9px!important;border:1px solid var(--selection-line)!important;border-radius:9px!important;background:var(--selection-raised)!important;color:var(--selection-text)!important;font-size:12px!important}
.selectionSheet.selectionCardMode .choice-card-grid:not([hidden]):not(.uiOff){display:grid!important}
.selectionSheet.selectionCardMode>.selectionCandidates:not([hidden]):not(.uiOff){display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:8px}
.selectionSheet.selectionCardMode>.selectionCandidates>.modalOption{box-sizing:border-box;min-height:72px;padding:10px!important;border:1px solid var(--selection-line)!important;border-radius:10px!important;background:var(--selection-raised)!important}
.selectionSheet.selectionCardMode>.selectionCandidates>:is(h2,h3,h4,.candidateGroupHeading){grid-column:1 / -1}
.selectionSheet :is(button,input,select):focus-visible{outline:2px solid var(--selection-accent)!important;outline-offset:2px}
@media(min-width:850px){.selectionSheet{inset:0!important;margin:auto!important;border-radius:16px!important;max-height:94dvh!important;height:min(880px,94dvh)!important}.selectionSheet.selectionPalette{height:auto!important}}
@media(max-width:360px){.selectionSheet>.selectionHead{padding:10px 8px!important;gap:5px!important}.selectionSheet .cm-dialog-title-row{gap:5px!important}.selectionSheet .cm-head-actions{gap:4px!important}.selectionSheet .selectionHead :is(button,.cm-instant-control){padding:7px!important;font-size:11px!important}.selectionSheet .selectionHead :is(h2,h3){font-size:14px!important}}
/* Horror owns its body scroll and remembered position; keep its flex frame. */
@media(max-height:500px){.selectionSheet{height:calc(100dvh - 8px)!important;max-height:calc(100dvh - 8px)!important}.selectionSheet>.selectionHead{padding:6px 8px!important}.selectionSheet>:is(.dialog-body,.dialogBody){padding:8px!important}.selectionSheet[open]:not(#horrorDialog){display:block!important;overflow:auto!important}.selectionSheet>.selectionHead{position:sticky;top:0;z-index:5}.selectionSheet>.dialog-body{display:block!important;overflow:visible!important}.selectionSheet :is(.candidateList,.choice-card-grid){min-height:160px!important;max-height:none!important;overflow:visible!important}}
/* Compact chrome; native filters and callbacks remain the source of truth. */
.selectionSheet>.selectionHead{position:relative;z-index:10;padding:8px 10px!important;gap:6px!important}
.selectionSheet .selectionHead :is(h2,h3){white-space:normal!important;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.35!important}
.selectionSheet .selectionSearchLabel{position:absolute!important;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);margin:0!important}
.selectionSheet>:is(input[type=search],#pickerSearch){margin:6px 12px!important}
.selectionSheet .selectionSettings{position:static!important;flex:none;margin:0!important;border:0!important;padding:0!important;background:transparent!important}
.selectionSheet .selectionSettings>summary{display:flex!important;align-items:center;justify-content:center;box-sizing:border-box;min-width:44px;min-height:44px;margin:0!important;padding:8px!important;border:1px solid var(--selection-line);border-radius:9px;background:var(--selection-raised);color:var(--selection-text);font-size:12px;line-height:1.3;cursor:pointer;list-style:none;white-space:nowrap}
.selectionSheet .selectionSettings>summary::-webkit-details-marker{display:none}
.selectionSheet .selectionSettings[open]>summary{border-color:var(--selection-accent);color:var(--selection-accent)}
.selectionSheet .selectionSettingsBody{position:absolute!important;z-index:25;top:calc(100% - 1px);left:10px;right:10px;box-sizing:border-box;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px;padding:12px!important;max-height:min(55dvh,400px);overflow:auto;overscroll-behavior:contain;border:1px solid var(--selection-line);border-radius:10px;background:var(--selection-bg);box-shadow:0 8px 24px #0008}
.selectionSheet .selectionSettingsBody:empty{display:none}
.selectionSheet .selectionSettingsBody>.selectionView:not([hidden]){display:contents!important}
.selectionSheet .selectionSettingsBody .selectionViewLabel{display:none}
.selectionSheet .selectionSettingsBody>:is(button,.cm-instant-control),.selectionSheet .selectionSettingsBody>.selectionView>.selectionViewButton{box-sizing:border-box;flex:1 1 0!important;min-width:44px!important;width:auto!important;height:auto!important;padding:8px 4px!important;white-space:normal!important;overflow-wrap:anywhere}
.selectionSheet .selectionSettingsBody>.cm-instant-control>span{white-space:normal!important;overflow-wrap:anywhere}
.selectionSheet .selectionSettingsBody .selectionViewButton{min-height:44px;min-width:44px}
.selectionSheet .selectionSettingsBody .selectionViewButton[aria-pressed=true]{border-color:var(--selection-accent)!important;background:var(--selection-accent)!important;color:#10342d!important}
.selectionSheet .selectionSettingsBody>.cm-instant-control{position:relative;display:flex!important;align-items:center;justify-content:center;min-width:90px;min-height:44px;border:1px solid var(--selection-line);border-radius:9px;background:var(--selection-raised);padding:8px 4px!important;font-size:13px}
.selectionSheet .selectionSettingsBody>.cm-instant-control>span{padding:0!important;border:0!important;background:transparent!important;color:var(--selection-text)!important}
.selectionSheet .selectionSettingsBody>.cm-instant-control>select{position:absolute!important;inset:0!important;opacity:0;width:100%!important;height:100%!important;cursor:pointer}
.selectionSheet .selectionSettingsBody>:is(.candidateCategoryMenu,#choiceSortMenu,#personSortMenu,#creatureSortMenu,.bdFilters){order:1;flex:1 0 100%;position:static!important;inset:auto!important;width:100%!important;max-width:100%!important;margin:0!important;max-height:none!important;box-shadow:none!important}
.selectionSheet .selectionSettingsBody .candidateCategoryMenu:not([hidden]),.selectionSheet .selectionSettingsBody :is(#choiceSortMenu,#personSortMenu,#creatureSortMenu):not([hidden]){display:flex!important;flex-wrap:wrap!important;gap:6px!important}
.selectionSheet .selectionSettingsBody button{height:auto!important;min-height:44px!important;max-width:100%;white-space:normal!important;overflow-wrap:anywhere}
.selectionSheet .selectionSettingsBody>.bdFooter{order:2;flex:1 0 100%;border:0!important;width:100%;padding:0!important;margin:0!important}
.selectionSheet>:is(.candidateList,.selectionCandidates,.bdBody,.hBody,.dialog-body,.dialogBody){flex:1 1 auto!important;min-height:0!important;max-height:none!important}
.selectionSheet>.candidateList{overflow:auto!important}
.selectionSheet>.selectionFoot{display:flex!important;align-items:center;gap:8px;flex:none!important;position:relative;z-index:11;box-sizing:border-box;width:100%;min-height:60px;margin:0!important;padding:8px 12px max(8px,env(safe-area-inset-bottom))!important;border-top:1px solid var(--selection-line);background:var(--selection-bg);color:var(--selection-text)}
.selectionSheet .selectionStatus{flex:1;min-width:0;font-size:13px;line-height:1.4;overflow-wrap:anywhere}
.selectionSheet .selectionFootClose{flex:none;box-sizing:border-box;min-width:88px!important;min-height:44px!important;margin:0!important;padding:9px 14px!important;border:1px solid var(--selection-accent)!important;border-radius:9px!important;background:var(--selection-accent)!important;color:#10342d!important;font-size:14px!important;line-height:1.4;white-space:normal}
.selectionSheet .selectionFootNative{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0!important;padding:0!important;border:0!important}
.selectionSheet .selectionFootNative:empty{display:none}
.selectionSheet .selectionFootNative button{min-height:44px!important;margin:0!important;font-size:13px;white-space:normal}
.selectionSheet>.selectionOldHint,.selectionSheet>#doneSceneDialog{display:none!important}
.selectionSheet :is(button,input,select,summary):focus-visible{outline:2px solid var(--selection-accent)!important;outline-offset:2px}
@media(max-width:400px){.selectionSheet .selectionFoot:has(.selectionFootNative:not(:empty)){flex-wrap:wrap}.selectionSheet .selectionFootNative:not(:empty){order:3;width:100%}}
@media(max-height:500px){.selectionSheet[open]:not(#horrorDialog){display:flex!important;overflow:hidden!important}.selectionSheet>.selectionHead{position:relative!important;top:auto!important;padding:4px 8px!important}.selectionSheet>.dialog-body{display:block!important;overflow:auto!important}.selectionSheet>.dialog-body>.choice-card-grid{min-height:120px!important;overflow:visible!important}.selectionSheet :is(.candidateList,.choice-card-grid){min-height:0!important}.selectionSheet>.selectionFoot{min-height:52px;padding-top:4px!important;padding-bottom:max(4px,env(safe-area-inset-bottom))!important}.selectionSheet .selectionSettingsBody{max-height:55dvh}}
`;
function selectionUIStylesFor(root){
 if(!root||root.getElementById('selectionDialogUIStyle'))return;
 const style=document.createElement('style');style.id='selectionDialogUIStyle';style.textContent=selectionUIStyles;
 (root.nodeType===Node.DOCUMENT_NODE?root.head:root).append(style);
}
function selectionUIEligible(dialog){
 const root=dialog.getRootNode();
 return (root===document||root.host?.id==='simpleMangaTool')&&(selectionUIIds.has(dialog.id)||dialog.classList.contains('candidateDialog')||dialog.classList.contains('finishSettingsSheet')||root.host?.id==='simpleMangaTool'&&dialog.matches('.option-editor')&&dialog.querySelector('.palette-grid,.palette-types,.wardrobe-editor'));
}
// Read live native state rather than counting only currently visible search results.
function selectionUICount(dialog){
 if(dialog.getRootNode()===document){
  if(dialog.id==='personChoiceDialog')return activePersonPicker?.atomicPose&&paReady()?paRows(paSession.p).length+asList(paSession.p.pose).length:activePersonPicker?asList(activePersonPicker.getValues()).length:null;
  if(dialog.id==='choiceDialog')return activeChoiceKey?asList(selected[activeChoiceKey]).length:null;
  if(dialog.id==='creatureDialog')return creaturePicker?asList(currentCreature()?.[creaturePicker.field]).filter(v=>v!==''&&v!==null&&v!==undefined).length:null;
  if(dialog.id==='normalSceneDialog')return normalSceneValues(normalSceneField).length;
  if(dialog.id==='sceneChoiceDialog')return asList(scene[activeSceneField]).length;
  if(dialog.id==='simpleSelectionDialog'&&simpleActive){
   if(simpleActive.key==='weapon'&&simpleActive.section==='装備・動作')return null;
   return simpleRows(simpleActive.key).filter(r=>r.section===simpleActive.section&&simplePicked(r)).length;
  }
  if(dialog.id==='colorPaletteDialog'&&paletteContext){const {kind,p}=paletteContext;return [0,...(paletteVisibleSecond(p,kind)?[1]:[])].filter(slot=>!!paletteValue(p,kind,slot)).length}
  if(dialog.id==='backgroundDesignDialog'){
   const e=bdEffective(bdPanel());if(bdUI.kind==='color')return Object.keys(e.effects).filter(id=>bdEffectRow(id)?.group==='色調').length;
   if(bdUI.kind==='effects')return Object.keys(e.effects).filter(id=>bdEffectRow(id)?.group!=='色調').length;
   return e.background.selected.length+Object.values(e.background.layers||{}).flat().length;
  }
 }else{
  const selected=dialog.querySelector('.smu-selected-head>strong,.catalog-selected>summary');
  if(selected){const count=selected.textContent.match(/選択中\s*(\d+)件/);if(count)return Number(count[1])}
  if(dialog.id==='picker'&&dialog.querySelector('.direct-selected'))return dialog.querySelectorAll('.direct-selected>.selection').length;
 }
 return null;
}
function selectionUICompact(dialog,head){
 if(!head)return;
 const state=selectionUIStates.get(dialog),host=head.querySelector('.cm-head-actions')||head.querySelector(':scope>.row:has(h2,h3)')||head;
 let settings=head.querySelector('.selectionSettings');
 if(!settings){
  settings=document.createElement('details');settings.className='selectionSettings';settings.open=!!state?.settingsOpen;
  const summary=document.createElement('summary');summary.textContent='表示設定';
  const body=document.createElement('div');body.className='selectionSettingsBody';settings.append(summary,body);
  host.append(settings);
  settings.addEventListener('toggle',()=>{if(state)state.settingsOpen=settings.open});
 }
 const close=host.querySelector(':scope>[data-selection-close]');if(settings.parentElement!==host||close&&settings.nextElementSibling!==close)host.insertBefore(settings,close||null);
 const body=settings.querySelector('.selectionSettingsBody');
 // Keep manga controls inside their native actions host, so native redraw cleanup still finds them.
 for(const control of head.querySelectorAll('.candidateCategoryButton,#choiceSortOpen,#personSortOpen,#creatureSortOpen,.cm-instant-control,.bdFilterToggle'))if(control.parentElement!==body)body.append(control);
 for(const panel of dialog.querySelectorAll(':scope>.candidateCategoryMenu,:scope>#choiceSortMenu,:scope>#personSortMenu,:scope>#creatureSortMenu,:scope>.bdFilters,:scope>.bdFooter'))if(panel.parentElement!==body)body.append(panel);
 for(const bar of dialog.querySelectorAll('.selectionView'))if(bar.parentElement!==body)body.append(bar);
 settings.hidden=![...body.children].some(e=>!e.hidden&&getComputedStyle(e).display!=='none'&&!e.matches('.candidateCategoryMenu,#choiceSortMenu,#personSortMenu,#creatureSortMenu,.bdFilters'));
 let foot=dialog.querySelector(':scope>.selectionFoot');
 if(!foot){
  foot=document.createElement('footer');foot.className='selectionFoot';
  const status=document.createElement('span');status.className='selectionStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
  const close=document.createElement('button');close.type='button';close.className='selectionFootClose';close.textContent='閉じる';
  close.onclick=()=>{const native=dialog.querySelector('.selectionHead [data-selection-close]');if(native)native.click()};foot.append(status,close);dialog.append(foot);
 }
 const nativeFooter=dialog.querySelector('#horrorDialogFooter');if(nativeFooter&&nativeFooter.parentElement!==foot){nativeFooter.classList.add('selectionFootNative');foot.insertBefore(nativeFooter,foot.querySelector('button'))}
 for(const hint of dialog.querySelectorAll(':scope>p.small'))if(/^(複数選択できます。選択中の内容は人物カードに表示されます。|選択済みはカードに表示され、×で解除できます。|色見本を選ぶと、対応する英語タグを使います。)$/.test(hint.textContent.trim()))hint.classList.add('selectionOldHint');
 const count=selectionUICount(dialog),text=count===null?(nativeFooter?.querySelector('button')?.textContent==='保存する'?'保存するまで変更は未確定':'設定内容を編集中'):count+'件選択中',status=foot.querySelector('.selectionStatus');if(status.textContent!==text)status.textContent=text;
}

function selectionUIRefresh(dialog){
 if(!dialog.open)return;
 const head=dialog.querySelector(':scope>.candidateHeader,:scope>.bdHead,:scope>.dialogHead,:scope>.dialog-head,:scope>.simpleHead,:scope>.wbSheetHead,:scope>.row:has(>h2,>h3)');
 if(head){
  head.classList.add('selectionHead');
  const title=head.querySelector('h2,h3');if(title&&!dialog.hasAttribute('aria-label')&&(!dialog.hasAttribute('aria-labelledby')||dialog.dataset.selectionLabel==='true')){if(!title.id)title.id='selectionDialogTitle-'+(++selectionUITitleId);dialog.setAttribute('aria-labelledby',title.id);dialog.dataset.selectionLabel='true'}
  for(const close of head.querySelectorAll('button'))if(/^(閉じる|完了)$/.test(close.textContent.trim())){
   close.dataset.selectionClose='';if(!close.hasAttribute('aria-label'))close.setAttribute('aria-label',close.textContent.trim());
   if(close!==close.parentElement.lastElementChild)close.parentElement.append(close);
  }
  for(const label of head.querySelectorAll('.cm-instant-control')){const text=label.querySelector(':scope>span');if(text?.textContent==='絞り込み ▾')text.textContent='分類 ▾';if(text?.textContent==='並び替え ▾')text.textContent='並び順 ▾';}
 }
 if(head&&dialog.id==='backgroundDesignDialog'){const toggle=dialog.querySelector('.bdTools .bdFilterToggle');if(toggle)head.insertBefore(toggle,head.querySelector('[data-selection-close]'))}
 for(const input of dialog.querySelectorAll('input[type=search],#pickerSearch')){if(!input.hasAttribute('aria-label')&&!input.labels?.length)input.setAttribute('aria-label','候補を検索');for(const label of input.labels||[])if(/^候補を検索$/.test(label.textContent.trim()))label.classList.add('selectionSearchLabel')}
 const search=dialog.querySelector(':scope>input[type=search]'),specific=dialog.querySelector(':scope>#personCharacterCandidateControls');if(search&&specific&&search.nextElementSibling!==specific)search.after(specific);
 const palette=dialog.id==='colorPaletteDialog'||dialog.matches('.option-editor')&&!!dialog.querySelector('.palette-grid,.palette-types,.wardrobe-editor');dialog.classList.toggle('selectionPalette',palette);

 const lists=[...dialog.querySelectorAll(selectionUILists)],list=lists.find(el=>!el.hidden&&!el.classList.contains('uiOff')&&(typeof el.checkVisibility==='function'?el.checkVisibility():el.getClientRects().length>0&&getComputedStyle(el).visibility!=='hidden'));
 const structured=dialog.querySelector('#poseComposeTabs:not([hidden])')||dialog.classList.contains('adultDisplayDialog')||dialog.id==='backgroundDesignDialog'&&!dialog.querySelector('#bdSearch');
 const canSwitch=!!list&&!structured&&!palette;for(const prior of dialog.querySelectorAll('.selectionCandidates'))if(prior!==list||!canSwitch)prior.classList.remove('selectionCandidates');if(canSwitch)list.classList.add('selectionCandidates');
 dialog.classList.toggle('selectionListMode',canSwitch&&selectionUIView==='list');dialog.classList.toggle('selectionCardMode',canSwitch&&selectionUIView==='cards');
 for(const bar of dialog.querySelectorAll('.selectionView'))bar.hidden=!canSwitch;
 if(!list||structured||palette){selectionUICompact(dialog,head);return;}
 let bar=dialog.querySelector('.selectionView');
 if(!bar){
  bar=document.createElement('div');bar.className='selectionView';bar.setAttribute('role','group');bar.setAttribute('aria-label','候補の表示形式');
  const label=document.createElement('span');label.className='selectionViewLabel';label.textContent='表示';bar.append(label);
  for(const [mode,name]of [['list','一覧'],['cards','カード']]){
   const button=document.createElement('button');button.type='button';button.className='selectionViewButton';button.dataset.selectionView=mode;button.textContent=name;button.setAttribute('aria-label','候補を'+name+'で表示');
   button.onclick=()=>{selectionUIView=mode;for(const open of selectionUIOpen)selectionUIRefresh(open)};bar.append(button);
  }
  list.before(bar);
 }
 bar.hidden=false;for(const button of bar.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.selectionView===selectionUIView));
 selectionUICompact(dialog,head);
}
function selectionUIEnhance(dialog){
 if(!selectionUIEligible(dialog))return;
 selectionUIStylesFor(dialog.getRootNode());dialog.classList.add('selectionSheet');selectionUIOpen.add(dialog);
 let state=selectionUIStates.get(dialog);
 if(!state){
  let pending=false;
  const refresh=()=>{if(pending||!dialog.open)return;pending=true;queueMicrotask(()=>{pending=false;if(dialog.open)selectionUIRefresh(dialog)})};
  const observer=new MutationObserver(records=>{
   // Ignore our own status/layout mutations; watch native redraws and selected labels.
   if(records.some(r=>!r.target.closest?.('.selectionFoot')&&!(r.target.closest?.('.selectionSettingsBody')&&[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===Node.ELEMENT_NODE&&n.matches('.selectionView,.candidateCategoryMenu,.bdFooter')))))refresh();
  });
  state={observer,settingsOpen:false};selectionUIStates.set(dialog,state);
  dialog.addEventListener('input',refresh);dialog.addEventListener('change',refresh);dialog.addEventListener('click',refresh);
  dialog.addEventListener('pointerdown',e=>{const menu=dialog.querySelector('.selectionSettings[open]');if(menu&&!menu.contains(e.target)){menu.open=false;state.settingsOpen=false}});
  dialog.addEventListener('cancel',e=>{const menu=dialog.querySelector('.selectionSettings[open]');if(menu){e.preventDefault();menu.open=false;state.settingsOpen=false;menu.querySelector('summary').focus()}});
  dialog.addEventListener('close',()=>{if(dialog.open)return;observer.disconnect();selectionUIOpen.delete(dialog);state.settingsOpen=false;const menu=dialog.querySelector('.selectionSettings');if(menu)menu.open=false});
 }
 state.observer.observe(dialog,{childList:true,subtree:true});selectionUIRefresh(dialog);
 queueMicrotask(()=>{if(dialog.open)selectionUIRefresh(dialog)});
}
const selectionUIShowModalBefore=HTMLDialogElement.prototype.showModal;
HTMLDialogElement.prototype.showModal=function(...args){
 if(selectionUIEligible(this))selectionUIStylesFor(this.getRootNode());else if(this.classList.contains('selectionSheet')){selectionUIStates.get(this)?.observer.disconnect();selectionUIOpen.delete(this);this.classList.remove('selectionSheet','selectionListMode','selectionCardMode','selectionPalette')}
 const result=selectionUIShowModalBefore.apply(this,args);selectionUIEnhance(this);return result;
};
selectionUIStylesFor(document);
for(const dialog of document.querySelectorAll('dialog[open]'))selectionUIEnhance(dialog);
