import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// @ts-expect-error -- Node ESM loader is authored in .mjs for runtime compatibility
const { resolve: loaderResolve } = await import('./loader.mjs');

test('relative imports from /src/ fall back to extension resolution', () => {
  const root = mkdtempSync(join(tmpdir(), 'loader-src-'));
  try {
    const srcDir = join(root, 'src');
    mkdirSync(srcDir, { recursive: true });

    const parentPath = join(srcDir, 'entry.ts');
    const targetPath = join(srcDir, 'module.ts');
    writeFileSync(parentPath, '');
    writeFileSync(targetPath, 'export const ok = true;');

    const calls: string[] = [];
    const nextResolve = (specifier: string) => {
      calls.push(specifier);
      if (specifier === './module') {
        const err = new Error('not found') as Error & { code?: string };
        err.code = 'ERR_MODULE_NOT_FOUND';
        throw err;
      }
      return { url: specifier };
    };

    const result = loaderResolve(
      './module',
      { parentURL: pathToFileURL(parentPath).href },
      nextResolve,
    );

    assert.equal(calls.length, 2);
    assert.equal(calls[0], './module');
    assert.equal(calls[1], pathToFileURL(targetPath).href);
    assert.deepEqual(result, { url: pathToFileURL(targetPath).href });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('non-/src/ parent URLs do not enter relative fallback branch', () => {
  const root = mkdtempSync(join(tmpdir(), 'loader-non-src-'));
  try {
    const parentDir = join(root, 'not-source');
    mkdirSync(parentDir, { recursive: true });
    const parentPath = join(parentDir, 'entry.ts');
    writeFileSync(parentPath, '');

    // This file would be discoverable by extension fallback if the branch were entered.
    const fallbackPath = join(root, 'outside.ts');
    writeFileSync(fallbackPath, 'export const shouldNotResolve = true;');

    const calls: string[] = [];
    const notFound = new Error('not found') as Error & { code?: string };
    notFound.code = 'ERR_MODULE_NOT_FOUND';

    const nextResolve = (specifier: string) => {
      calls.push(specifier);
      throw notFound;
    };

    assert.throws(
      () => loaderResolve('../outside', { parentURL: pathToFileURL(parentPath).href }, nextResolve),
      (err: unknown) => err === notFound,
    );
    assert.deepEqual(calls, ['../outside']);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
