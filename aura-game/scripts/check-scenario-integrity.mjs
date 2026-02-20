import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SCENARIOS } from '../src/data/scenarios.ts';
import { SCENARIO_SEEDS } from '../src/data/scenarios/registry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const scenarioDataDir = path.join(projectRoot, 'src', 'data');
const scenarioModulesDir = path.join(scenarioDataDir, 'scenarios');

const walkFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
};

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

const registryIds = new Set(SCENARIO_SEEDS.map((seed) => seed.id));
if (registryIds.size !== SCENARIO_SEEDS.length) {
  findings.push('Scenario registry contains duplicate IDs in SCENARIO_SEEDS.');
}

for (const scenarioId of registryIds) {
  if (!SCENARIOS[scenarioId]) {
    findings.push(`Scenario registry ID "${scenarioId}" is missing in SCENARIOS map.`);
  }
}

const scenarioModuleFiles = await readdir(scenarioModulesDir, { withFileTypes: true });
const moduleIds = scenarioModuleFiles
  .filter((entry) => entry.isFile() && entry.name.endsWith('.ts'))
  .map((entry) => entry.name)
  .filter((fileName) => !['registry.ts', 'utils.ts', 'validation.ts'].includes(fileName))
  .map((fileName) => fileName.replace(/\.ts$/, ''));

for (const moduleId of moduleIds) {
  if (!registryIds.has(moduleId)) {
    findings.push(`Scenario module "${moduleId}.ts" exists but is not listed in SCENARIO_SEEDS.`);
  }
}

for (const scenarioId of registryIds) {
  if (!moduleIds.includes(scenarioId)) {
    findings.push(`Scenario ID "${scenarioId}" is listed in SCENARIO_SEEDS but module file is missing.`);
  }
}

const sourceFiles = (await walkFiles(scenarioDataDir)).filter((filePath) =>
  filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.mjs')
);

const pathLiteralPattern = /['"](\.?\.?\/[^'"\n]+|\/[^'"\n]+)['"]/g;
for (const sourceFile of sourceFiles) {
  const source = await readFile(sourceFile, 'utf8');

  for (const match of source.matchAll(pathLiteralPattern)) {
    const rawPath = match[1];
    if (rawPath.startsWith('data:') || rawPath.includes('${')) continue;

    const resolved = rawPath.startsWith('/')
      ? path.join(projectRoot, 'public', rawPath.slice(1))
      : path.resolve(path.dirname(sourceFile), rawPath);

    try {
      await access(resolved);
    } catch {
      findings.push(
        `Broken asset/content path in ${path.relative(projectRoot, sourceFile)}: "${rawPath}" -> "${path.relative(projectRoot, resolved)}"`
      );
    }
  }
}

if (findings.length > 0) {
  console.error('❌ Scenario integrity check failed:');
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log('✅ Scenario integrity check passed (IDs + registry/module sync + offline asset references).');
