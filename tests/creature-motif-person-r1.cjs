// Preserve the original R1 source and fixed output baseline. Only its approved
// extension-version assertion changes from 3 to 4; all 49 contracts/matrices remain.
const fs = require('fs'), path = require('path'), Module = require('module');
const file = path.join(__dirname, 'creature-stage5-remaining-r1.cjs');
let source = fs.readFileSync(file, 'utf8');
const count = source.split('actorExtensions.version===3').length - 1;
if (count !== 1) throw Error('Unexpected R1 schema assertion count; do not rewrite the baseline');
source = source.replace('actorExtensions.version===3', 'actorExtensions.version===4');
const replay = new Module(file, module);
replay.filename = file;
replay.paths = module.paths;
replay._compile(source, file);
