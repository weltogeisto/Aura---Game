import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIOS } from '../src/data/scenarios.ts';

const scenarioEntries = Object.entries(SCENARIOS);

test('panorama contract: low-res fallback stays SVG while medium/high target JPEG pipeline', () => {
  for (const [id, scenario] of scenarioEntries) {
    assert.match(
      scenario.panoramaAsset.lowRes,
      /^\/assets\/panoramas\/[a-z-]+\.svg$/,
      `${id} lowRes should remain local SVG fallback`
    );
    assert.match(
      scenario.panoramaAsset.mediumRes ?? '',
      /^\/panoramas\/[a-z-]+-2048\.jpg$/,
      `${id} mediumRes should target 2048 JPEG asset`
    );
    assert.match(
      scenario.panoramaAsset.highRes,
      /^\/panoramas\/[a-z-]+-8192\.jpg$/,
      `${id} highRes should target 8192 JPEG asset`
    );
  }
});
