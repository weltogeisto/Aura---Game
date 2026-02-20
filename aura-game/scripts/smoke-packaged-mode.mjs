#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..', '..');
const DIST_DIR = join(repoRoot, 'release', 'web', 'current', 'dist');

const checks = [];
const addCheck = (name, ok, details) => checks.push({ name, ok, details });

const parseRefs = (html) =>
  [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((ref) => ref && !/^https?:\/\//i.test(ref) && !ref.startsWith('data:') && !ref.startsWith('#'));

addCheck('canonical staged dist exists', existsSync(DIST_DIR), DIST_DIR);

if (existsSync(DIST_DIR)) {
  const indexPath = join(DIST_DIR, 'index.html');
  addCheck('app boot entry (index.html) exists', existsSync(indexPath), indexPath);

  if (existsSync(indexPath)) {
    const indexHtml = readFileSync(indexPath, 'utf8');
    const refs = parseRefs(indexHtml);
    const scriptRef = refs.find((ref) => /\.js$/i.test(ref));
    const cssRefs = refs.filter((ref) => /\.css$/i.test(ref));

    addCheck('app boot script reference present', Boolean(scriptRef), scriptRef ?? 'missing script tag');

    for (const cssRef of cssRefs) {
      const cssPath = join(DIST_DIR, cssRef.replace(/^[./]+/, ''));
      addCheck(`stylesheet exists (${cssRef})`, existsSync(cssPath), cssPath);
    }

    for (const ref of refs) {
      const target = join(DIST_DIR, ref.replace(/^[./]+/, ''));
      addCheck(`referenced asset exists (${ref})`, existsSync(target), target);
    }

    const jsPath = scriptRef ? join(DIST_DIR, scriptRef.replace(/^[./]+/, '')) : null;
    addCheck('boot script file exists', Boolean(jsPath && existsSync(jsPath)), jsPath ?? 'missing script path');

    if (jsPath && existsSync(jsPath)) {
      const bundle = readFileSync(jsPath, 'utf8');
      addCheck('scene load entry point compiled', bundle.includes('scenario-select'), 'expects "scenario-select" phase');
      addCheck('critical path includes aiming phase', bundle.includes('aiming'), 'expects "aiming" phase');
      addCheck('critical path includes shooting phase', bundle.includes('shooting'), 'expects "shooting" phase');
      addCheck('critical path includes results phase', bundle.includes('results'), 'expects "results" phase');
      addCheck('shot action copy compiled', bundle.includes('Center your aim, then commit to the only shot.'), 'expects aiming hint copy in bundle');
      addCheck(
        'missing-asset guard compiled for packaged mode',
        bundle.includes('Asset path must resolve offline'),
        'expects offline asset error guard string in production bundle'
      );
    }
  }

  const assetDir = join(DIST_DIR, 'assets');
  const hasAssets = existsSync(assetDir) && readdirSync(assetDir).length > 0;
  addCheck('compiled static assets exist', hasAssets, assetDir);
}

const failed = checks.filter((check) => !check.ok);
for (const check of checks) {
  const icon = check.ok ? '✅' : '❌';
  console.log(`${icon} ${check.name}: ${check.details}`);
}

if (failed.length) {
  console.error(`\n❌ Packaged-mode smoke checklist failed (${failed.length} check(s)).`);
  process.exit(1);
}

console.log('\n✅ Packaged-mode smoke checklist passed.');
