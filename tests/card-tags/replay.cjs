// Configure the current product's mode/cache in memory; original test files are immutable.
const fs=require('fs'),path=require('path'),Module=require('module');const relative=process.argv[2],file=path.resolve(__dirname,'../..',relative);let source=fs.readFileSync(file,'utf8');
if(relative==='tests/horror/ui.cjs'){const anchor="await p.locator('[data-mobile-tab=horror]').tap();";if(source.split(anchor).length!==2)throw Error('Unexpected original UI entry anchor');source=source.replace(anchor,anchor+"await p.locator('#horrorMangaMode').tap();")}
if(relative==='tests/horror/pwa.cjs')source=source.replace('http://127.0.0.1:8765/seaart-horror/index.html',process.env.TARGET_URL);
const cache='seaart-tool-pwa-v5-horror-card-selected-tags-v1-http-cache-v1';
if(relative==='tests/horror/replay-pwa.cjs')source=source.replace('seaart-tool-pwa-v5-horror-v1-http-cache-v1',cache);
if(relative==='tests/integration/pwa.cjs')source=source.split('seaart-tool-pwa-v5-horror-motif-r2-integration-http-cache-v1').join(cache);
if(relative==='tests/normal-first/pwa.cjs')source=source.split('seaart-tool-pwa-v5-horror-normal-first-ui-v1-http-cache-v1').join(cache);
const replay=new Module(file,module);replay.filename=file;replay.paths=Module._nodeModulePaths(path.dirname(file));replay._compile(source,file);
