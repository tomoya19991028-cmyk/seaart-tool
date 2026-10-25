// Supplemental UI regression: normal adult fixture, no image generation or Creature grants.
const {launch,pageFor,startServer,suite,assert}=require('../v44-audit/helpers.cjs');
(async()=>{const s=suite('adult-cards'),server=await startServer(),browser=await launch();try{
 const {page:p,context,errors}=await pageFor(browser,process.env.TARGET_URL||server.url);
 await s.test('ADULT-eight-cards-consent-and-two-pages',async()=>{
  await p.evaluate(()=>{selected.character=[];originalCharacters=[{id:'original-adult-card-audit',name:'Card audit',type:'adult woman'}];profiles={'original-adult-card-audit':{}};personKey=originalCharacters[0].id;renderProfiles();showMobileTab('people');setPersonGroup('adult');$('adultEnabled').checked=true;$('adultEnabled').dispatchEvent(new Event('change'))});
  await p.locator('#adultConfirm input:not([data-adult-consent])').first().check();assert.equal(await p.evaluate(()=>adultReady()),false);
  await p.locator('#adultConfirm [data-adult-consent]').check();assert.equal(await p.evaluate(()=>adultReady()),true);
  const pages=[];for(let i=0;i<2;i++){
   const ids=await p.locator('#adultDashboard [data-adult-card]').evaluateAll(n=>n.map(e=>e.dataset.adultCard));assert.equal(ids.length,4);
   for(const id of ids){await p.locator('#adultDashboard [data-adult-card="'+id+'"] > .personLaunch').click();assert(await p.locator('dialog[open]').count()>0);await p.evaluate(()=>{for(const d of document.querySelectorAll('dialog[open]'))d.close()})}
   pages.push(ids);if(!i)await p.locator('[aria-label="次の成人向けカードページ"]').click();
  }
  assert.equal(new Set(pages.flat()).size,8);assert.equal(await p.evaluate(()=>resultAccessResources.size),0);
  return {pages,ageConfirmationAloneInsufficient:true,consentViaUI:true,generatedImages:false,productionResources:0};
 });assert.deepEqual(errors,[]);await context.close();s.save({physicalDevice:false});
}finally{await browser.close();await server.close()}})().catch(e=>{console.error(e.stack);process.exitCode=1});
