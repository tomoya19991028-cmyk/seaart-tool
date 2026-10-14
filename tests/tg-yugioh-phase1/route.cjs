// Route this immutable current-product suite explicitly; historical PWA keeps its old path.
const fs=require('fs'),path=require('path'),Module=require('module');
const file=path.resolve(__dirname,'../..',process.argv[2]);let source=fs.readFileSync(file,'utf8');
if(process.argv[2]!=='tests/horror/boundaries.cjs')throw Error('Unsupported fixed route');
const old='http://127.0.0.1:8765/seaart-horror/index.html';if(source.split(old).length!==2)throw Error('Unexpected target anchor');
source=source.replace(old,process.env.TARGET_URL);
const replay=new Module(file,module);replay.filename=file;replay.paths=Module._nodeModulePaths(path.dirname(file));replay._compile(source,file);
