// Diagnostic only. Unmodified pre-feature HTML; harmless fixtures; no generated adult content.
// These assertions reproduce the blocker, rather than assert that the feature is safe.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { chromium } = require('playwright');
const url = process.env.TARGET_URL || 'http://127.0.0.1:8765/seaart-creature-motif-person/index.html';
const root = process.env.RESULT_DIR || '/workspace/seaart-creature-motif-integration1';

(async () => {
  fs.mkdirSync(root, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext({ serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url);
    await page.waitForFunction(() => appReady && actorFormStorageReady);
    const setup = await page.evaluate(() => {
      const sourceId = crypto.randomUUID();
      restoreCreatures([{ id: sourceId, species: 'pikachu (pokemon)' }]);
      const ref = 'creature:' + sourceId;
      applyActorForm(ref);
      setCreatureRepresentation(ref, 'semi');
      const appearance = anthroBlankAppearance();
      appearance.hair.primary = 'blue hair';
      appearance.eyes.left = 'green eyes';
      appearance.hairStyle = ['short hair'];
      updateCreatureAnthro(ref, 'semi', appearance, anthroDefaultInheritance('semi'));
      clearTimeout(workingSaveTimer);
      const originalId = 'original-motif-' + crypto.randomUUID();
      const marker = { version: 1, originKind: 'creature-motif', adultAccess: 'not-permitted' };
      const source = JSON.stringify({ creature: creatures[0], extension: actorExtensions.byActor[ref] });
      const fixture = captureWorking();
      fixture.originalCharacters = [{ id: originalId, name: 'motif boundary fixture', type: 'woman', motifOrigin: marker }];
      fixture.profiles[originalId] = {
        hairPrimary: catalog.hairColor.find(x => x.value === 'blue hair').id,
        eyeLeft: catalog.eyeColor.find(x => x.value === 'green eyes').id,
        hairStyle: [catalog.hairStyle.find(x => x.value === 'short hair').id]
      };
      fixture.actorExtensions.byActor['person:' + originalId] = {
        ownerRef: { kind: 'person', originalId }, motifOrigin: marker
      };
      afValidateWorking(fixture);
      restoreWorking(fixture);
      clearTimeout(workingSaveTimer);
      const accepted = persist();
      return {
        originalId, sourceId, accepted, owner: actorOwnerForRef('person:' + originalId),
        metadataPreserved: originalCharacters[0].motifOrigin.adultAccess === 'not-permitted',
        includedByAllPeople: allPeople().some(x => x.id === originalId),
        sourceUnchanged: source === JSON.stringify({ creature: creatures[0], extension: actorExtensions.byActor[ref] }),
        registryCount: creatureAdultSubjectDefinitions.length
      };
    });
    assert.equal(setup.accepted, true);
    assert.equal(setup.metadataPreserved, true);
    assert.equal(setup.includedByAllPeople, true);
    assert.equal(setup.sourceUnchanged, true);
    assert.equal(setup.registryCount, 0);
    assert.equal(setup.owner.kind, 'person');

    // Exercise the existing checkbox handler, not a simulated eligibility function.
    const checkbox = await page.evaluate(id => {
      adultScene.enabled = true;
      renderAdult();
      const input = [...$('adultConfirm').querySelectorAll('input[type=checkbox]')].find(x => x.parentElement.textContent.includes('motif boundary fixture'));
      if (!input) throw Error('confirmation input not rendered');
      const enabled = !input.disabled;
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      clearTimeout(workingSaveTimer);
      const result = {
        enabled, confirmed: adultScene.confirmed[id],
        adultReady: adultReady(), adultReadyFor: adultReadyFor(allPeople()),
        metadataStillDenied: originalCharacters[0].motifOrigin.adultAccess === 'not-permitted',
        saved: persist()
      };
      return result;
    }, setup.originalId);
    for (const key of ['enabled', 'confirmed', 'adultReady', 'adultReadyFor', 'metadataStillDenied', 'saved']) assert.equal(checkbox[key], true);

    await page.reload();
    await page.waitForFunction(() => appReady && actorFormStorageReady);
    const reload = await page.evaluate(id => ({
      originalMarker: originalCharacters.find(x => x.id === id)?.motifOrigin,
      extensionMarker: actorExtensions.byActor['person:' + id]?.motifOrigin,
      ready: adultReady(), confirmed: adultScene.confirmed[id],
      grants: { creature: creatureAdultAuthorizations.size, result: resultAccessPermissions.size },
      namespace: actorFormStorageNamespace
    }), setup.originalId);
    assert.equal(reload.originalMarker.adultAccess, 'not-permitted');
    assert.equal(reload.extensionMarker.adultAccess, 'not-permitted');
    assert.equal(reload.ready, true);
    assert.deepEqual(reload.grants, { creature: 0, result: 0 });

    const validation = await page.evaluate(id => {
      const work = captureWorking();
      const settings = JSON.parse(afReadDiskBundle().settings);
      const history = JSON.parse(afReadDiskBundle().history).entries;
      const accepted = (fn) => { try { fn(); return true; } catch { return false; } };
      const changed = afCopy(work);
      changed.originalCharacters[0].motifOrigin.version = 999;
      changed.actorExtensions.byActor['person:' + id].motifOrigin.version = 999;
      const unknownMarkerAccepted = accepted(() => afValidateWorking(changed));
      const stripped = afCopy(work);
      delete stripped.originalCharacters[0].motifOrigin;
      delete stripped.actorExtensions.byActor['person:' + id].motifOrigin;
      const missingMarkerAccepted = accepted(() => afValidateWorking(stripped));
      const backup = { ...settings, format: 'SeaArt Prompt Builder', version: 4, workingState: stripped, promptHistory: history };
      const strippedV4ImportAccepted = accepted(() => afValidateBackup(backup));
      const missingMarkerHistoryAccepted = accepted(() => afValidateHistory([{ positive: '', negative: '', working: stripped }]));
      const favoriteSettings = afCopy(settings);
      favoriteSettings.favorites = [stripped];
      const missingMarkerFavoriteAccepted = accepted(() => afValidateSettings(favoriteSettings));
      restoreWorking(stripped);
      clearTimeout(workingSaveTimer);
      const missingMarkerReady = adultReady();
      restoreWorking(work);
      clearTimeout(workingSaveTimer);
      const newer = afCopy(work);
      newer.actorExtensions.version = 4;
      const newerVersionRejected = !accepted(() => afValidateWorking(newer));
      const before = JSON.stringify({ ram: captureWorking(), disk: { ...localStorage }, undo: undoHistory });
      const newerCommitRejected = !accepted(() => afCommitBundle(settings, newer, history));
      const failedCommitUnchanged = before === JSON.stringify({ ram: captureWorking(), disk: { ...localStorage }, undo: undoHistory });
      return { unknownMarkerAccepted, missingMarkerAccepted, strippedV4ImportAccepted,
        missingMarkerHistoryAccepted, missingMarkerFavoriteAccepted, missingMarkerReady,
        newerVersionRejected, newerCommitRejected, failedCommitUnchanged };
    }, setup.originalId);
    for (const value of Object.values(validation)) assert.equal(value, true);
    assert.deepEqual(errors, []);
    const result = { verdict: 'BLOCKED_SAVE_COMPATIBILITY', diagnosticReproduced: true,
      note: 'Adult eligibility/UI readiness only; no adult candidate selected or generated.',
      browser: browser.version(), url, setup, checkbox, reload, validation, errors };
    fs.writeFileSync(path.join(root, 'save-boundary-results.json'), JSON.stringify(result, null, 2) + '\n');
    console.log('REPRODUCED: legacy person gate ignores denied/missing/unknown motif metadata; extension v4 rejected atomically');
    await context.close();
  } finally { await browser.close(); }
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
