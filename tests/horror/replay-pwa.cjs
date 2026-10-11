// Original update/offline contracts unchanged; only the approved cache name changes.
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.join(__dirname,'../creature-motif-person-pwa.cjs');
let source=fs.readFileSync(file,'utf8');
const old='seaart-tool-pwa-v4-motif-person-v1-http-cache-v1';
if(source.split(old).length!==3)throw Error('Unexpected SW cache-name anchor count');
source=source.split(old).join('seaart-tool-pwa-v5-horror-v1-http-cache-v1');
const replay=new Module(file,module);replay.filename=file;replay.paths=module.paths;replay._compile(source,file);
