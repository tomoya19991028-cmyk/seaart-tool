// Recovery snapshots are temporary duplicates of the saved settings/history.
// Compress only this journal: primary keys, backup JSON and recovery semantics
// retain their existing formats. The codec is vendored lz-string 1.5.0 (MIT).
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
