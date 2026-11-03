// Build the lazy manga payload from resolved sources, independently of index.html.
const fs=require('fs'),assert=require('assert/strict');
const codec=require('../src/vendor/lz-string-1.5.0.js');
const source=fs.readFileSync(0,'utf8'),packed=codec.compressToBase64(source);
assert.equal(codec.decompressFromBase64(packed),source,'Manga payload roundtrip');
process.stdout.write(packed);
