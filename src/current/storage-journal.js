// Recovery snapshots are temporary duplicates of the saved settings/history.
// Compress only this journal: primary keys, backup JSON and recovery semantics
// retain their existing formats. The codec is vendored lz-string 1.5.0 (MIT).
// LZ-string compatible streaming encoder. The dictionary/bit format follows the
// vendored lz-string codec (MIT, copyright 2013 Pieroxy) in the protected source.
// Branching shares work on the two journals' identical snapshot prefix. The
// existing decoder, checksum, primary storage keys and transaction checks stay
// unchanged. Each branch owns its dictionary and output buffer.
function wbJournalEncoder(seed=null){
 const dictionary=seed?new Map(seed.dictionary):new Map(),pending=seed?new Set(seed.pending):new Set(),data=seed?seed.data.slice():[];
 let word=seed?.word||'',enlarge=seed?.enlarge??2,size=seed?.size??3,bits=seed?.bits??2,value=seed?.value??0,position=seed?.position??0;
 function write(count,n){for(let i=0;i<count;i++){value=(value<<1)|(n&1);if(position===14){data.push(String.fromCharCode(value+32));position=0;value=0}else position++;n>>=1}}
 function grow(){if(--enlarge===0){enlarge=2**bits;bits++}}
 function token(){if(pending.has(word)){const code=word.charCodeAt(0);write(bits,code<256?0:1);write(code<256?8:16,code);grow();pending.delete(word)}else write(bits,dictionary.get(word));grow()}
 return {
  append(text){for(let i=0;i<text.length;i++){const c=text.charAt(i);if(!dictionary.has(c)){dictionary.set(c,size++);pending.add(c)}const next=word+c;if(dictionary.has(next))word=next;else{token();dictionary.set(next,size++);word=c}}return this},
  fork(){return wbJournalEncoder({dictionary,pending,data,word,enlarge,size,bits,value,position})},
  finish(){if(word!=='')token();write(bits,2);while(true){value<<=1;if(position===14){data.push(String.fromCharCode(value+32));break}position++}return data.join('')+' '}
 };
}
function wbEncodeJournalPair(journal){
 // phase is the only differing field. Its property order has no schema meaning.
 const {phase,...snapshot}=journal,prefix=JSON.stringify(snapshot).slice(0,-1)+',"phase":',encoder=wbJournalEncoder().append(prefix),out={};
 for(const phase of ['pending','committed']){
  const tail=JSON.stringify(phase)+'}',text=prefix+tail,payload=encoder.fork().append(tail).finish(),packed=JSON.stringify({encoding:'seaart-journal-lz16-v1',characters:text.length,checksum:afHash(text),payload});
  out[phase]=packed.length<text.length?packed:text;
 }
 return out;
}

function afEncodeJournal(journal){
 const text=JSON.stringify(journal);
 const packed=JSON.stringify({encoding:'seaart-journal-lz16-v1',characters:text.length,checksum:afHash(text),payload:LZString.compressToUTF16(text)});
 return packed.length<text.length?packed:text;
}
function afDecodeJournal(value){
 if(!afObject(value)||!Object.hasOwn(value,'encoding'))return value;
 afAssert(value.encoding==='seaart-journal-lz16-v1'&&Number.isSafeInteger(value.characters)&&value.characters>0&&typeof value.checksum==='string'&&typeof value.payload==='string','復旧情報の圧縮形式が不正です');
 const text=LZString.decompressFromUTF16(value.payload);
 afAssert(typeof text==='string'&&text.length===value.characters&&afHash(text)===value.checksum,'復旧情報の完全性を確認できません');
 return JSON.parse(text);
}
