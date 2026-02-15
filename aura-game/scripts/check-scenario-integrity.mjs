import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SCENARIOS } from '../src/data/scenarios.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const scenarioSourcePath = path.join(projectRoot, 'src', 'data', 'scenarios.ts');
const scenarioSource = await readFile(scenarioSourcePath, 'utf8');

const findings = [];
const scenarioIds = new Set();

for (const [key, scenario] of Object.entries(SCENARIOS)) {
  if (scenario.id !== key) {
    findings.push(`Scenario key "${key}" does not match scenario.id "${scenario.id}".`);
  }

  if (scenarioIds.has(scenario.id)) {
    findings.push(`Duplicate scenario.id detected: "${scenario.id}".`);
  }
  scenarioIds.add(scenario.id);

  for (const [variant, assetPath] of Object.entries(scenario.panoramaAsset)) {
    if (!variant.toLowerCase().includes('res')) continue;
    if (typeof assetPath !== 'string' || !assetPath) continue;

    if (
      !assetPath.startsWith('data:')
      && !assetPath.startsWith('/')
      && !assetPath.startsWith('./')
      && !assetPath.startsWith('../')
    ) {
      findings.push(`Scenario "${scenario.id}" has non-offline panorama asset (${variant}): ${assetPath}`);
    }
  }
}

const pathLiteralPattern = /['"](\.?\.?\/[^'"\n]+|\/[^'"\n]+)['"]/g;
for (const match of scenarioSource.matchAll(pathLiteralPattern)) {
  const rawPath = match[1];
  if (rawPath.startsWith('data:') || rawPath.includes('${')) continue;

  const resolved = rawPath.startsWith('/')
    ? path.join(projectRoot, 'public', rawPath.slice(1))
    : path.resolve(path.join(projectRoot, 'src', 'data'), rawPath);

  try {
    await access(resolved);
  } catch {
    findings.push(`Broken asset/content path in scenarios.ts: "${rawPath}" -> "${path.relative(projectRoot, resolved)}"`);
  }
}

if (findings.length > 0) {
  console.error('❌ Scenario integrity check failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('✅ Scenario integrity check passed (IDs + offline asset references).');
