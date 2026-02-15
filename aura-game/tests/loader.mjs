import { resolve as pathResolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const SRC_DIR = pathResolve(import.meta.dirname, '..', 'src');

const TS_EXTENSIONS = ['.ts', '.tsx'];

function tryResolveWithExtension(filePath) {
  // If file already has an extension that exists, use it
  if (existsSync(filePath)) return filePath;

  // Try adding .ts or .tsx
  for (const ext of TS_EXTENSIONS) {
    const withExt = filePath + ext;
    if (existsSync(withExt)) return withExt;
  }

  // Try as directory with index
  for (const ext of TS_EXTENSIONS) {
    const indexPath = pathResolve(filePath, 'index' + ext);
    if (existsSync(indexPath)) return indexPath;
  }

  return filePath;
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const bare = pathResolve(SRC_DIR, specifier.slice(2));
    const resolved = tryResolveWithExtension(bare);
    const mapped = pathToFileURL(resolved).href;
    return nextResolve(mapped, context);
  }

  // For relative imports within src/, try extension resolution too
  if (context.parentURL && context.parentURL.includes('/src/') && specifier.startsWith('./') || specifier.startsWith('../')) {
    try {
      return nextResolve(specifier, context);
    } catch (err) {
      if (err.code === 'ERR_MODULE_NOT_FOUND' && context.parentURL) {
        const parentDir = pathResolve(fileURLToPath(context.parentURL), '..');
        const bare = pathResolve(parentDir, specifier);
        const resolved = tryResolveWithExtension(bare);
        if (resolved !== bare) {
          return nextResolve(pathToFileURL(resolved).href, context);
        }
      }
      throw err;
    }
  }

  return nextResolve(specifier, context);
}
