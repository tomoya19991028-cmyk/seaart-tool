#!/usr/bin/env python3
"""One-time, checked integration with the existing bundle and source producers."""
from pathlib import Path
import os
p=Path(__file__).resolve().parent.parent/'index.html';p=Path(os.environ.get('HORROR_BUILD_HTML',str(p)));b=p.read_bytes()
def change(old,new,count=1):
    global b
    old=old.encode();new=new.encode()
    actual=b.count(old)
    if actual!=count:raise RuntimeError(f'Anchor count {actual} != {count}: {old[:100]!r}')
    b=b.replace(old,new)
change("const actorFormStorageNamespace='creature-adult-v1/result-access-v1/motif-person-v1';","const actorFormMotifNamespace='creature-adult-v1/result-access-v1/motif-person-v1';\r\nconst actorFormStorageNamespace=actorFormMotifNamespace+'/horror-v1';")
old="const actorFormStorageKeys=Object.freeze({settings:'seaart-prompt-builder-v4-creature-adult-v1-result-access-v1-motif-person-v1',working:'SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1',history:'SeaArt_generated_prompts_v2-creature-adult-v1-result-access-v1-motif-person-v1',marker:'SeaArt_actor_forms_commit_creature_adult_v1_result_access_v1_motif_person_v1',journal:'SeaArt_actor_forms_recovery_creature_adult_v1_result_access_v1_motif_person_v1'});"
new=old.replace('const actorFormStorageKeys','const actorFormMotifStorageKeys')+"\r\nconst actorFormStorageKeys=Object.freeze({settings:'seaart-prompt-builder-v5-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1',working:'SeaArt_working_state_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1',history:'SeaArt_generated_prompts_v2-creature-adult-v1-result-access-v1-motif-person-v1-horror-v1',marker:'SeaArt_actor_forms_commit_creature_adult_v1_result_access_v1_motif_person_v1_horror_v1',journal:'SeaArt_actor_forms_recovery_creature_adult_v1_result_access_v1_motif_person_v1_horror_v1'});"
change(old,new)
change("afAssert(afObject(value)&&[2,3,4].includes(value.version),'未対応の設定versionです');","afAssert(afObject(value)&&[2,3,4,5].includes(value.version),'未対応の設定versionです');if(value.version===5){hValidateWorkspace(value.horrorWorkspace);hValidateCatalog(value.horrorCatalogChanges)}")
change('if(value.version===4){afAssert(value.actorFormCatalog!==undefined);','if(value.version>=4){afAssert(value.actorFormCatalog!==undefined);')
change("afAssert(afObject(value)&&afObject(value.selected),'作業設定が不正です');","afAssert(afObject(value)&&afObject(value.selected),'作業設定が不正です');if(value.horror!==undefined){hValidateHorror(value.horror);hValidateActorIds(value)}if(value.horrorIncludedWorkspace!==undefined)hValidateWorkspace(value.horrorIncludedWorkspace);hValidateMangaIds(value.mangaState);")
change('afAssert(value.version===4);afValidateSettings(value)','afAssert(value.version===(namespace===actorFormStorageNamespace?5:4));afValidateSettings(value)')
change('keys===actorFormStorageKeys?actorFormStorageNamespace:keys===actorFormResultAccessStorageKeys?','keys===actorFormStorageKeys?actorFormStorageNamespace:keys===actorFormMotifStorageKeys?actorFormMotifNamespace:keys===actorFormResultAccessStorageKeys?')
change('function afBundleStartup(bundle,migrating=false){const settings=JSON.parse(bundle.settings);','function afBundleStartup(bundle,migrating=false){const settings=JSON.parse(bundle.settings);hLoadBundle(settings,JSON.parse(bundle.working).working);')
change('const resultAccessPrior=afReadMigrationBundle(actorFormResultAccessStorageKeys,true,actorFormResultAccessNamespace);',"const motifPrior=afReadMigrationBundle(actorFormMotifStorageKeys,true,actorFormMotifNamespace);if(motifPrior)return afBundleStartup(motifPrior,true);\r\n  const resultAccessPrior=afReadMigrationBundle(actorFormResultAccessStorageKeys,true,actorFormResultAccessNamespace);")
change('function afCommitBundle(settings,working,history){',"function afCommitBundle(settings,working,history){\r\n if(horrorStaging)return true;afAssert(!actorFormCommitActive,'保存処理が重複しています');")
change('settings.version=4;settings.actorFormCatalog=','settings.version=5;settings.horrorWorkspace=hValidateWorkspace(horrorWorkspace);settings.horrorCatalogChanges=hValidateCatalog(horrorCatalogChanges);settings.actorFormCatalog=')
change("input.format==='SeaArt Prompt Builder'&&[3,4].includes(input.version)","input.format==='SeaArt Prompt Builder'&&[3,4,5].includes(input.version)")
change('if(input.version===4)afAssert(input.workingState.actorExtensions!==undefined)','if(input.version>=4)afAssert(input.workingState.actorExtensions!==undefined)')
change('if(input.version===4)for(const h of input.promptHistory||[])','if(input.version>=4)for(const h of input.promptHistory||[])')
# The import route already validates before applying; permit only the newly validated v5.
change('[3,4].includes(incoming.version)','[3,4,5].includes(incoming.version)')
# Optional IDs stay absent for old, unconfigured snapshots. New IDs are never guessed on import.
change('function normalizeManga(x){return {count:',"function normalizeManga(x){hValidateMangaIds(x);return {...(x?.mangaId?{mangaId:x.mangaId}:{}),count:")
change("panels:Array.from({length:6},(_,i)=>({description:","panels:Array.from({length:6},(_,i)=>({... (x?.panels?.[i]?.id?{id:x.panels[i].id}:{}),description:")
change('function captureWorking(){return {','function captureWorking(){return {...(Object.keys(horrorState.byActor).length||Object.keys(horrorState.byManga).length||horrorState.unresolved.length?{horror:hCopy(horrorState)}:{}),')
change('const favorite={...(originalCharacters.some(r=>mfIsMotif(r.id))?', 'const favorite={...(Object.keys(horrorState.byActor).length||Object.keys(horrorState.byManga).length||horrorState.unresolved.length?{horror:hCopy(horrorState)}:{}),...(originalCharacters.some(r=>mfIsMotif(r.id))?')
change('afRestoreExtensions(f.actorExtensions,idMap,f.creatures||[])}','afRestoreExtensions(f.actorExtensions,idMap,f.creatures||[]);horrorState=f.horror?hRemapState(f.horror,idMap):horrorEmptyState()}')
change('function mangaKeepSubjectSettings(panel,source){','function mangaKeepSubjectSettings(panel,source){if(source?.id)panel.id=source.id;')
change('const changes=preview.steps.map((step,index)=>({index,before:','const changes=preview.steps.map((step,index)=>({index,...(mangaState.panels[index].id?{panelId:mangaState.panels[index].id}:{}),before:')
change('const panel=mangaState.panels[change.index];if(!panel)continue;','const panel=change.panelId?mangaState.panels.find(p=>p.id===change.panelId):mangaState.panels[change.index];if(!panel)continue;')
change('mangaState.panels.forEach((panel,index)=>mangaKeepSubjectSettings(panel,current[index]));','mangaState.panels.forEach((panel,index)=>mangaKeepSubjectSettings(panel,panel.id?current.find(p=>p.id===panel.id):current[index]));')
change('function saveCurrentWorking(){if(restoringLocalWorking)return;','function saveCurrentWorking(){if(restoringLocalWorking||actorFormCommitActive||horrorStaging||hActionBusy)return;')
# Resolve asynchronous image loads by the stable identity captured before decoding.
# The legacy path without IDs retains its original slot behavior.
change("const url=URL.createObjectURL(file),img=new Image();try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});if(composeImages[i])URL.revokeObjectURL(composeImages[i].url);composeImages[i]={img,url,name:file.name};status.textContent=file.name;drawComposedPage()}","const uploadMangaId=mangaState.mangaId||null,uploadPanelId=mangaState.panels[i]?.id||null,url=URL.createObjectURL(file),img=new Image();try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});const target=uploadPanelId&&uploadMangaId?mangaState.mangaId===uploadMangaId?mangaState.panels.findIndex(p=>p.id===uploadPanelId):-1:i;if(target<0){URL.revokeObjectURL(url);toast('対象のコマが変更・削除されたため、画像の読込を中止しました');return}if(composeImages[target])URL.revokeObjectURL(composeImages[target].url);composeImages[target]={img,url,name:file.name};status.textContent=file.name;if(uploadPanelId){composeSignature='';renderCompose()}else drawComposedPage()}")
change('afValidateOwner(entry.ownerRef);if(entry.selectedFormId', 'afValidateOwner(entry.ownerRef);if(entry.specificFormOwnership!==undefined)ufValidateOwnership(entry.specificFormOwnership);if(entry.selectedFormId')
change("if(t.closest('#choiceDialogChoices .modalOption .edit","if(t.closest('[data-env-atomic]'))return;if(t.closest('#choiceDialogChoices .modalOption .edit")
change("'captureVersion','detailCustom','weights'];afAssert","'captureVersion','detailCustom','weights','specificExtras'];if(value.specificExtras!==undefined){afAssert(owner.kind==='person'&&value.captureVersion===1);ufValidateExtras(value.specificExtras)}afAssert")
change('function dirty(){if(creatureHumanEditorOpen()',"function dirty(){if(typeof creatureHumanEditorOpen==='function'&&creatureHumanEditorOpen()")
change('}actorStandardForms=forms;return forms;','}ufRegisterForms(forms);actorStandardForms=forms;return forms;')
change("showOther||selected.includes(x.value)||(kind==='creature'?key!=='features'||creatureFeatureAllowed(creatures.find(c=>c.id===draft.ref.slice(9)),x.value,false):personCharacterCandidateAllowed({source,ownerId:draft.ref.slice(7)},kind==='catalog'?rows.find(r=>r[0]===x.value)?.[3]:x.value,false))","(kind==='creature'?(showOther||selected.includes(x.value)||key!=='features'||creatureFeatureAllowed(creatures.find(c=>c.id===draft.ref.slice(9)),x.value,false)):ufOwnCandidate(source,kind==='catalog'?rows.find(r=>r[0]===x.value)?.[3]:x.value,draft.ref,selected.includes(x.value),showOther))")
change("const render=()=>{list.replaceChildren();const selected=get(),query=search.value.normalize('NFKC').toLowerCase();let shown=options.filter","const render=()=>{ufRefreshFormGroups(groups,options,source,draft.ref,get(),showOther,kind);list.replaceChildren();const selected=get(),query=search.value.normalize('NFKC').toLowerCase();let shown=options.filter")
# Existing raw generators remain the unset fast path. A separate source producer
# applies configured horror before token composition (see embed-horror.py).
p.write_bytes(b)
