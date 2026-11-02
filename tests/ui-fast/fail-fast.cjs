const helpers=require('../v44-audit/helpers.cjs');
const originalSuite=helpers.suite;
helpers.suite=name=>{const s=originalSuite(name),test=s.test.bind(s);s.test=async(id,fn)=>{await test(id,fn);if(s.tests.some(t=>t.status==='FAIL')){s.save({stoppedOnFirstFailure:true});throw Error('Stopped after failed test: '+id)}};return s};
