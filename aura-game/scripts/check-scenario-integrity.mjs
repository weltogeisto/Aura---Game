import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SCENARIOS, SCENARIO_MATURITY_MATRIX, SCENARIO_ROLLOUT_WAVES } from '../src/data/scenarios.ts';
import { SCENARIO_SEEDS } from '../src/data/scenarios/registry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const scenarioDataDir = path.join(projectRoot, 'src', 'data');
const scenarioModulesDir = path.join(scenarioDataDir, 'scenarios');

const MIN_CRITIC_POOL_SIZE = 1;
const FORBIDDEN_PLACEHOLDER_PATTERN = /(todo|tbd|placeholder|lorem ipsum|coming soon|fixme)/i;

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

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

for (const [key, scenario] of Object.entries(SCENARIOS)) {
  const maturity = SCENARIO_MATURITY_MATRIX[key];
  if (!maturity) {
    findings.push(`Scenario "${key}" is missing a maturity matrix entry.`);
    continue;
  }

  if (scenario.id !== key) {
    findings.push(`Scenario key "${key}" does not match scenario.id "${scenario.id}".`);
  }

  if (scenario.metadata.status !== maturity.status) {
    findings.push(`Scenario "${key}" metadata.status (${scenario.metadata.status}) must match maturity matrix (${maturity.status}).`);
  }

  if (scenarioIds.has(scenario.id)) {
    findings.push(`Duplicate scenario.id detected: "${scenario.id}".`);
  }
  scenarioIds.add(scenario.id);

  if (!isNonEmptyString(scenario.name)) {
    findings.push(`Scenario "${scenario.id}" is missing a non-empty name.`);
  }

  if (!isNonEmptyString(scenario.description)) {
    findings.push(`Scenario "${scenario.id}" is missing a non-empty description.`);
  }

  if (!isNonEmptyString(scenario.metadata?.region)) {
    findings.push(`Scenario "${scenario.id}" is missing metadata.region.`);
  }

  if (!isNonEmptyString(scenario.panoramaAsset?.lowRes) || !isNonEmptyString(scenario.panoramaAsset?.highRes)) {
    findings.push(`Scenario "${scenario.id}" must define panoramaAsset.lowRes and panoramaAsset.highRes.`);
  }

  if (!scenario.criticLines) {
    findings.push(`Scenario "${scenario.id}" is missing criticLines.`);
  } else {
    for (const poolName of ['low', 'mid', 'high']) {
      const pool = scenario.criticLines[poolName];
      if (!Array.isArray(pool) || pool.length < MIN_CRITIC_POOL_SIZE) {
        findings.push(
          `Scenario "${scenario.id}" criticLines.${poolName} must contain at least ${MIN_CRITIC_POOL_SIZE} entries.`
        );
        continue;
      }

      pool.forEach((line, index) => {
        if (!isNonEmptyString(line)) {
          findings.push(`Scenario "${scenario.id}" criticLines.${poolName}[${index}] must be a non-empty string.`);
          return;
        }

        if (FORBIDDEN_PLACEHOLDER_PATTERN.test(line)) {
          findings.push(`Scenario "${scenario.id}" criticLines.${poolName}[${index}] contains placeholder text: "${line}".`);
        }
      });
    }
  }

  if (FORBIDDEN_PLACEHOLDER_PATTERN.test(scenario.description)) {
    findings.push(`Scenario "${scenario.id}" description contains placeholder text.`);
  }

  for (const target of scenario.targets) {
    if (!isNonEmptyString(target.id) || !isNonEmptyString(target.name)) {
      findings.push(`Scenario "${scenario.id}" has a target with missing id/name.`);
    }

    if (typeof target.description === 'string' && FORBIDDEN_PLACEHOLDER_PATTERN.test(target.description)) {
      findings.push(`Scenario "${scenario.id}" target "${target.id}" contains placeholder text in description.`);
    }
  }

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

  if (scenario.metadata.status === 'playable') {
    const completeness = Object.values(scenario.metadata.contentCompleteness).every(Boolean);
    if (!completeness) {
      findings.push(`Scenario "${key}" is playable but content completeness gates are not all true.`);
    }

    const incompleteGates = Object.entries(maturity.exitCriteria)
      .filter(([, criterion]) => !criterion.done)
      .map(([criterionName]) => criterionName);
    if (incompleteGates.length > 0) {
      findings.push(`Scenario "${key}" is playable but has open exit criteria: ${incompleteGates.join(', ')}.`);
    }
  }
}

const waveOne = SCENARIO_ROLLOUT_WAVES[1] ?? [];
if (waveOne.length !== 3 || !waveOne.includes('louvre')) {
  findings.push('Rollout wave 1 must include exactly three scenarios and contain "louvre".');
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

console.log('✅ Scenario integrity check passed (IDs + offline asset references + content quality).');
