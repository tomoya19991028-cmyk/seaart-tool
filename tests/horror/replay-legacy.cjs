// Preserve the original assertions/expected data; route only its after URL.
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.join(__dirname,'../creature-motif-person-legacy-regression.cjs');
let source=fs.readFileSync(file,'utf8');
const old='http://127.0.0.1:8765/seaart-creature-motif-person/index.html';
if(source.split(old).length!==2)throw Error('Unexpected legacy URL anchor');
source=source.replace(old,process.env.TARGET_URL||'http://127.0.0.1:8765/seaart-horror/index.html');
fs.mkdirSync(process.env.RESULT_DIR,{recursive:true});
const replay=new Module(file,module);replay.filename=file;replay.paths=module.paths;replay._compile(source,file);
