import test from 'node:test';
import assert from 'node:assert/strict';
import { UI_COPY_MAP, KEY_UI_STRINGS } from '../src/data/uiCopyMap.ts';

const SENTENCE_ENDING = /[.!?…]$/;

test('ui copy map snapshot for release positioning and core actions', () => {
  assert.deepEqual(
    {
      release: UI_COPY_MAP.release,
      startView: {
        overline: UI_COPY_MAP.startView.overline,
        title: UI_COPY_MAP.startView.title,
        ctaPrimary: UI_COPY_MAP.startView.ctaPrimary,
      },
      mainMenu: {
        overline: UI_COPY_MAP.mainMenu.overline,
        ctaScenarioSelect: UI_COPY_MAP.mainMenu.ctaScenarioSelect,
      },
      results: {
        overline: UI_COPY_MAP.results.overline,
        scoreLabel: UI_COPY_MAP.results.scoreLabel,
        criticLabel: UI_COPY_MAP.results.criticLabel,
      },
    },
    {
      release: {
        badge: 'Desktop Beta',
        title: 'Aura of the 21st Century',
        subtitle: '6 Szenarien spielbar: Louvre, St. Peter\'s, Topkapi, TSMC, MoMA, Borges Library.',
      },
      startView: {
        overline: 'Aura / Desktop Beta',
        title: 'Aura of the 21st Century',
        ctaPrimary: 'Szenario wählen',
      },
      mainMenu: {
        overline: 'Desktop Beta',
        ctaScenarioSelect: 'Szenario wählen',
      },
      results: {
        overline: 'Run complete',
        scoreLabel: 'Total score',
        criticLabel: 'Critic',
      },
    }
  );
});

test('key ui strings keep concise tone and sentence punctuation', () => {
  for (const line of KEY_UI_STRINGS) {
    assert.ok(line.trim().length > 12, `copy too short: ${line}`);
    assert.ok(!line.includes('lorem ipsum'), `placeholder detected: ${line}`);
    assert.ok(!line.includes('TODO'), `TODO detected: ${line}`);

    if (line.includes(' ') && !line.includes(':') && !line.includes('…')) {
      assert.match(line, SENTENCE_ENDING, `line should end as sentence: ${line}`);
    }
  }
});

test('beta limitation copy explicitly documents all three honesty constraints', () => {
  const limitationText = UI_COPY_MAP.limitations.items.join(' ');

  assert.match(limitationText, /Single-shot constraint|Single-shot/i);
  assert.match(limitationText, /remain locked|scenario/i);
  assert.match(limitationText, /Performance tiers|FPS/i);
});
