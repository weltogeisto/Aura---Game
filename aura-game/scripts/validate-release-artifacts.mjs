#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '..', '..')
const RELEASE_CURRENT = resolve(repoRoot, 'release', 'web', 'current')
const DIST_DIR = join(RELEASE_CURRENT, 'dist')
const CHECKSUM_FILE = join(RELEASE_CURRENT, 'checksums.sha256')

const checks = []
const addCheck = (name, ok, details) => checks.push({ name, ok, details })

const normalizeRef = (value) => value?.replace(/^[./]+/, '')

const hashFile = (filePath) => createHash('sha256').update(readFileSync(filePath)).digest('hex')

const parseAssetRefs = (html) => {
  const refs = new Set()
  for (const match of html.matchAll(/(?:src|href)=['"]([^'"]+)['"]/g)) {
    const ref = match[1]
    if (!ref || /^https?:\/\//i.test(ref) || ref.startsWith('data:') || ref.startsWith('#')) continue
    refs.add(ref)
  }
  return [...refs]
}

const listFiles = (rootDir) => {
  const files = []
  const walk = (currentDir) => {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const fullPath = join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else {
        files.push(fullPath)
      }
    }
  }
  walk(rootDir)
  return files
}

addCheck('release/web/current exists', existsSync(RELEASE_CURRENT), RELEASE_CURRENT)
addCheck('release/web/current/dist exists', existsSync(DIST_DIR), DIST_DIR)

if (existsSync(DIST_DIR)) {
  const indexPath = join(DIST_DIR, 'index.html')
  addCheck('dist/index.html exists', existsSync(indexPath), indexPath)

  if (existsSync(indexPath)) {
    const indexHtml = readFileSync(indexPath, 'utf8')
    const refs = parseAssetRefs(indexHtml)

    for (const ref of refs) {
      const normalized = normalizeRef(ref)
      const resolved = normalized ? join(DIST_DIR, normalized) : null
      addCheck(`asset ref resolves: ${ref}`, Boolean(resolved && existsSync(resolved)), resolved ?? 'invalid ref')
    }

    const scriptRef = refs.find((ref) => /\.js$/i.test(ref))
    if (scriptRef) {
      const jsPath = join(DIST_DIR, normalizeRef(scriptRef))
      const bundle = readFileSync(jsPath, 'utf8')
      addCheck('bundle includes scenario-select phase', bundle.includes('scenario-select'), scriptRef)
      addCheck('bundle includes results phase', bundle.includes('results'), scriptRef)
    }
  }

  const assetsDir = join(DIST_DIR, 'assets')
  addCheck('dist/assets exists', existsSync(assetsDir), assetsDir)
  if (existsSync(assetsDir)) {
    const assetEntries = readdirSync(assetsDir)
    addCheck('dist/assets non-empty', assetEntries.length > 0, `${assetEntries.length} file(s)`)
  }

  const bundlePath = join(RELEASE_CURRENT, 'bundle.html')
  addCheck('release/web/current/bundle.html exists', existsSync(bundlePath), bundlePath)

  const files = listFiles(DIST_DIR)
  const checksums = files
    .map((filePath) => {
      const rel = relative(RELEASE_CURRENT, filePath).replace(/\\/g, '/')
      return `${hashFile(filePath)}  ${rel}`
    })
    .sort()

  if (existsSync(bundlePath)) {
    checksums.push(`${hashFile(bundlePath)}  bundle.html`)
  }

  const checksumBody = `${checksums.join('\n')}\n`
  if (existsSync(CHECKSUM_FILE)) {
    const existing = readFileSync(CHECKSUM_FILE, 'utf8')
    addCheck('checksums.sha256 matches release contents', existing === checksumBody, CHECKSUM_FILE)
  } else {
    addCheck('checksums.sha256 exists', false, CHECKSUM_FILE)
  }

  addCheck('all release files are non-empty', files.every((file) => statSync(file).size > 0), `${files.length} file(s)`)
}

const failed = checks.filter((check) => !check.ok)
for (const check of checks) {
  const icon = check.ok ? '✅' : '❌'
  console.log(`${icon} ${check.name}: ${check.details}`)
}

if (failed.length > 0) {
  console.error(`\n❌ Release artifact validation failed (${failed.length} check(s)).`)
  process.exit(1)
}

console.log('\n✅ Release artifact validation passed.')
