// Run immutable inherited tests; project only the explicitly authorized additive data.
const fs=require('fs'),path=require('path'),Module=require('module');
const original=path.resolve(__dirname,'../forms-environment/replay.cjs');
let source=fs.readFileSync(original,'utf8');
function replace(old,next){if(!source.includes(old))throw Error('Adapter anchor missing: '+old);source=source.split(old).join(next)}
replace('seaart-tool-pwa-v5-forms-structures-environment-ui-v1-http-cache-v1','seaart-tool-pwa-v5-tg-yugioh-phase1-v1-http-cache-v1');
replace('^person-specific-/','^person-specific-|^character-extension-tg-/');
replace("!id.startsWith('form-specific-')","!id.startsWith('form-specific-')&&!id.startsWith('form-person-character-extension-tg-')");
replace("!id.startsWith(\\'form-specific-\\')","!id.startsWith(\\'form-specific-\\')&&!id.startsWith(\\'form-person-character-extension-tg-\\')");
const names=require('../../src/tokyo-ghoul-phase1.json').characters.map(r=>r.value);
const projection='Object.fromEntries(Object.entries(characterBasicPresets).filter(([value])=>!'+JSON.stringify(names)+'.includes(value)))';
replace("}s=s.replace(/process.exitCode", "}s=s.replaceAll('characterBasicPresets,detailOptions:', 'characterBasicPresets:"+projection+",detailOptions:');s=s.replace(/process.exitCode");
if(process.argv[2]==='tests/forms-environment/pwa.cjs')source=source.replace("if(relative==='tests/horror/replay-pwa.cjs')","if(relative==='tests/forms-environment/pwa.cjs')source=source.replace('seaart-tool-pwa-v5-forms-structures-environment-ui-v1-http-cache-v1',cache);if(relative==='tests/horror/replay-pwa.cjs')");
if(process.argv[2]==='tests/forms-environment/ui.cjs')source=source.replace("const replay=new Module(file,module);","source=source.split(\"locator('[data-apply-person-form]').last()\").join(\"locator('[data-apply-person-form$=\\\"-kagune\\\"]').first()\");const replay=new Module(file,module);");
const replay=new Module(original,module);replay.filename=original;replay.paths=Module._nodeModulePaths(path.dirname(original));replay._compile(source,original);
