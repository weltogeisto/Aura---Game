#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join('..', 'release', 'web', 'current', 'dist');

const checks = [];
const addCheck = (name, ok, details) => checks.push({ name, ok, details });

addCheck('canonical staged dist exists', existsSync(DIST_DIR), DIST_DIR);

if (existsSync(DIST_DIR)) {
  const indexPath = join(DIST_DIR, 'index.html');
  addCheck('app boot entry (index.html) exists', existsSync(indexPath), indexPath);

  if (existsSync(indexPath)) {
    const indexHtml = readFileSync(indexPath, 'utf8');
    const scriptRefMatch = indexHtml.match(/<script[^>]*src="([^"]+)"/i);
    const jsRef = scriptRefMatch?.[1];
    const jsPath = jsRef ? join(DIST_DIR, jsRef.replace(/^\//, '')) : null;

    addCheck('app boot script reference present', Boolean(jsRef), jsRef ?? 'missing script tag');
    addCheck('boot script file exists', Boolean(jsPath && existsSync(jsPath)), jsPath ?? 'missing script path');

    if (jsPath && existsSync(jsPath)) {
      const bundle = readFileSync(jsPath, 'utf8');
      addCheck('scene load entry point compiled', bundle.includes('scenario-select'), 'expects "scenario-select" phase');
      addCheck('shot flow entry points compiled', bundle.includes('aiming') && bundle.includes('shooting'), 'expects "aiming" and "shooting" phases');
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
