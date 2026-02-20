#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const version = packageJson.version
const releaseTag = process.argv[2] ?? process.env.GITHUB_REF_NAME ?? ''

if (!releaseTag) {
  console.error('❌ Missing release tag. Pass as argument or set GITHUB_REF_NAME.')
  process.exit(1)
}

const expected = `v${version}`
const prereleasePattern = /^v\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)\.\d+)?$/

if (!prereleasePattern.test(releaseTag)) {
  console.error(`❌ Release tag "${releaseTag}" does not match convention vMAJOR.MINOR.PATCH[-(alpha|beta|rc).N].`)
  process.exit(1)
}

if (releaseTag !== expected) {
  console.error(`❌ Release tag "${releaseTag}" does not match package.json version "${version}" (expected ${expected}).`)
  process.exit(1)
}

console.log(`✅ Release tag ${releaseTag} matches package.json version ${version}.`)
