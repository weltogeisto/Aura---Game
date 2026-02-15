import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, 'public');
const scenarioConfigPath = path.join(projectRoot, 'src', 'data', 'scenarios.ts');

const allowedUrlFragments = new Set([
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
]);

const isUnexpectedRemoteUrl = (value) => {
  const matches = value.match(/https?:\/\/[^\s'"`)>]+/g) ?? [];
  return matches.filter((url) => !allowedUrlFragments.has(url));
};

const walkPublicFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkPublicFiles(fullPath)));
      continue;
    }

    files.push(fullPath);
  }

  return files;
};

const findings = [];

const scenarioContent = await readFile(scenarioConfigPath, 'utf8');
const scenarioRemoteUrls = isUnexpectedRemoteUrl(scenarioContent);
if (scenarioRemoteUrls.length > 0) {
  findings.push({
    file: path.relative(projectRoot, scenarioConfigPath),
    urls: scenarioRemoteUrls,
  });
}

for (const publicFile of await walkPublicFiles(publicDir)) {
  const content = await readFile(publicFile, 'utf8');
  const remoteUrls = isUnexpectedRemoteUrl(content);
  if (remoteUrls.length > 0) {
    findings.push({
      file: path.relative(projectRoot, publicFile),
      urls: remoteUrls,
    });
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

console.log('✅ Offline asset audit passed (scenario config + public assets have no runtime remote fetch URLs).');
