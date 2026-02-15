import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const scenarioDataDir = path.join(projectRoot, 'src', 'data');

const allowedUrlFragments = new Set([
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
]);

const TEXT_EXTENSIONS = new Set([
  '.html', '.css', '.js', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.svg', '.txt', '.md', '.yaml', '.yml'
]);

const isTextLikeFile = (filePath) => TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase());

const isUnexpectedRemoteUrl = (value) => {
  const matches = value.match(/https?:\/\/[^\s'"`)>]+/g) ?? [];
  return matches.filter((url) => !allowedUrlFragments.has(url));
};

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
const skippedBinary = [];

const scenarioFiles = (await walkFiles(scenarioDataDir)).filter(
  (filePath) => filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.mjs')
);

for (const scenarioFile of scenarioFiles) {
  const content = await readFile(scenarioFile, 'utf8');
  const scenarioRemoteUrls = isUnexpectedRemoteUrl(content);
  if (scenarioRemoteUrls.length > 0) {
    findings.push({
      file: path.relative(projectRoot, scenarioFile),
      urls: scenarioRemoteUrls,
    });
  }
}

for (const publicFile of await walkFiles(publicDir)) {
  if (!isTextLikeFile(publicFile)) {
    skippedBinary.push(path.relative(projectRoot, publicFile));
    continue;
  }

  try {
    const content = await readFile(publicFile, 'utf8');
    const remoteUrls = isUnexpectedRemoteUrl(content);
    if (remoteUrls.length > 0) {
      findings.push({
        file: path.relative(projectRoot, publicFile),
        urls: remoteUrls,
      });
    }
  } catch {
    skippedBinary.push(path.relative(projectRoot, publicFile));
  }
}

if (findings.length > 0) {
  console.error('❌ Offline asset audit failed. Unexpected remote URLs found:');
  for (const finding of findings) {
    console.error(`- ${finding.file}`);
    for (const url of finding.urls) {
      console.error(`  • ${url}`);
    }
  }
  process.exit(1);
}

if (skippedBinary.length > 0) {
  console.log(`ℹ️ Offline asset audit skipped ${skippedBinary.length} non-text public assets.`);
}

console.log('✅ Offline asset audit passed (scenario data + text public assets have no runtime remote fetch URLs).');
