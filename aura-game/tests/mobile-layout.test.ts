import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const readComponent = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('StartView uses compact typography and viewport-safe scrolling for mobile', () => {
  const file = readComponent('../src/components/ui/StartView.tsx');
  assert.match(file, /min-h-dvh/);
  assert.match(file, /overflow-y-auto/);
  assert.match(file, /text-2xl[\s\S]*sm:text-4xl/);
});

test('ScenarioSelect keeps modal scrollable with mobile-first spacing and tiny status pill text', () => {
  const file = readComponent('../src/components/ui/ScenarioSelect.tsx');
  assert.match(file, /max-h-\[92dvh\]/);
  assert.match(file, /p-3 text-left transition sm:p-4/);
  assert.match(file, /text-\[10px\][\s\S]*sm:text-xs/);
});

test('ResultsScreen keeps breakdown single-column until larger breakpoints', () => {
  const file = readComponent('../src/components/ui/ResultsScreen.tsx');
  assert.match(file, /max-h-\[92dvh\]/);
  assert.match(file, /grid-cols-1 gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4/);
  assert.match(file, /text-2xl font-bold[\s\S]*sm:text-4xl/);
});
