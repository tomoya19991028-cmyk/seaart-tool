// Execute immutable existing assertions against integrated URL/cache.
// No expected/fixture/source file is rewritten.
const fs=require('fs'),path=require('path'),Module=require('module');
const relative=process.argv[2];if(!relative||!/^tests\/[\w/-]+\.cjs$/.test(relative))throw Error('Supply an existing test path');
const file=path.resolve(__dirname,'../..',relative);let source=fs.readFileSync(file,'utf8');
if(relative==='tests/horror/pwa.cjs'){
 const old='http://127.0.0.1:8765/seaart-horror/index.html';if(source.split(old).length!==2)throw Error('Unexpected URL anchors');source=source.replace(old,process.env.TARGET_URL);
}
if(relative==='tests/horror/replay-pwa.cjs'){
 const old='seaart-tool-pwa-v5-horror-v1-http-cache-v1';if(source.split(old).length!==2)throw Error('Unexpected cache anchors');source=source.replace(old,'seaart-tool-pwa-v5-horror-motif-r2-integration-http-cache-v1');
}
const replay=new Module(file,module);replay.filename=file;replay.paths=Module._nodeModulePaths(path.dirname(file));replay._compile(source,file);
