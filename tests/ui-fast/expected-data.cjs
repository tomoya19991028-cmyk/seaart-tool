// Project only the release's declared additions onto immutable older fixtures.
// Never read the final expected values from the candidate's completed presets.
const assert=require('assert/strict');
const folded=s=>s.normalize('NFKC').toLowerCase();
function anatomy(value,data){const next=structuredClone(value);if(!next.detail)return next;for(const move of data.bodyMoves){const rows=next.detail[move.field];if(!Array.isArray(rows)||!rows.includes(move.value))continue;next.detail[move.field]=rows.flatMap(v=>v===move.value?move.clothing:[v]);next.detail.bodyFeatures=[...new Set([...(next.detail.bodyFeatures||[]),...move.body])];}return next;}
function preset(owner,value,data){const next=structuredClone(value),row=data.outfits.find(r=>r.owners.some(n=>folded(n)===folded(owner)));if(row&&!next.outfit){next.outfit=row.value;next.detail={...Object.fromEntries(Object.entries(row.parts).filter(([f])=>f!=='legwear').map(([f,v])=>[f,[v]])),...next.detail};}return anatomy(next,data);}
function presets(before,data,jp){const source=structuredClone(before);if(jp)for(const member of jp.members){const owner=member.roman+' (VSPO!)';assert(!Object.hasOwn(source,owner),'new VSPO owner collides with an old owner');const value={id:'standard',name:'標準',...structuredClone(member.preset)};for(const [field,mode]of [['hair','single'],['eyes','same']])if(value[field]&&!Object.hasOwn(value[field],'mode'))value[field].mode=mode;source[owner]=[value];}return Object.fromEntries(Object.entries(source).map(([owner,forms])=>[owner,forms.map(f=>preset(owner,f,data))]));}
function forms(before,data){return {...structuredClone(before),forms:before.forms.map(f=>anatomy(f,data))};}
function detailRow(field,row,data){
 const relabeled=new Set(['lower|dark trousers','feet|dark shoes','feet|dark boots','feet|white shoes','legwear|white thighhigh socks']);
 if(!relabeled.has(field+'|'+row[0]))return row;
 const declared=data.outfits.find(r=>r.parts[field]===row[0]);
 assert(declared,'Missing declared clothing label '+field+'/'+row[0]);
 return [row[0],declared.partNames[field],'キャラクター代表衣装'];
}
module.exports={anatomy,preset,presets,forms,detailRow};
