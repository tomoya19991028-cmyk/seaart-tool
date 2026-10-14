// Register shipped entries before the maintenance baseline is captured. They
// must never be misidentified as user edits to the built-in foundations.
// Keep existing rows/order/IDs intact; old backups retain these shipped additions.
for(const {preset,gender,...row} of tokyoGhoulPhase1.characters){
 if(!catalog.character.some(old=>old.id===row.id||old.value.toLowerCase()===row.value.toLowerCase()))catalog.character.push(JSON.parse(JSON.stringify(row)));
 characterGenderByValue[row.value.toLowerCase()]=gender;
}
const characterFilterGroups=new Set(tokyoGhoulPhase1.yugiohGroups);
function characterFilterGroup(group){return characterFilterGroups.has(group)?'遊戯王':group}
function characterSearchAliases(value,aliases=[]){return [...new Set([...aliases,...(tokyoGhoulPhase1.aliasesByValue[value]||[])])]}
function characterSearchText(row){return [row.name||row.label||'',row.value||row.tag||'',row.group||row.work||'',...characterSearchAliases(row.value||row.tag,row.aliases||[])].join(' ')}
for(const row of [...environmentAdditions.places,...environmentAdditions.states])if(!catalog.background.some(x=>x.id===row.id||x.value===row.value))catalog.background.push(JSON.parse(JSON.stringify(row)));
for(const [color,name]of itemColorPalette.filter(r=>r[0]))if(!catalog.lighting.some(x=>x.id==='env-light-'+color||x.value===color+' lighting'))catalog.lighting.push({id:'env-light-'+color,name:name+'の光',value:color+' lighting',group:'光の色',lightingColor:color});
for(const [i,c]of personSpecificDefinitions.candidates.entries()){if(c.source.startsWith('catalog:')){const field=c.source.slice(8);if(!catalog[field].some(x=>x.id==='person-specific-'+i||x.value===c.value))catalog[field].push({id:'person-specific-'+i,name:c.name,value:c.value,group:c.group})}else{const field=c.source.slice(7);for(const store of [detailBuiltin[field],detailOptions[field].options])if(!store.some(x=>x[0]===c.value))store.push([c.value,c.name,c.group])}}

for(const [value,parts]of Object.entries(personSpecificDefinitions.outfitSets))outfitSets[value]={...parts};
