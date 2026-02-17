import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..', '..')
const packageJsonPath = path.join(repoRoot, 'aura-game', 'package.json')
const releaseDocPath = path.join(repoRoot, 'docs', 'desktop-release.md')

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
const releaseDoc = await readFile(releaseDocPath, 'utf8')

const referencedScripts = [...releaseDoc.matchAll(/pnpm run ([\w:-]+)/g)].map((match) => match[1])
const uniqueReferencedScripts = [...new Set(referencedScripts)]

const missingScripts = uniqueReferencedScripts.filter((scriptName) => !(scriptName in packageJson.scripts))

if (missingScripts.length > 0) {
  console.error('Missing package.json scripts referenced by docs/desktop-release.md:')
  for (const scriptName of missingScripts) {
    console.error(`- ${scriptName}`)
  }
  process.exit(1)
}

console.log(
  `docs/desktop-release.md script references validated (${uniqueReferencedScripts.length} scripts).`,
)
