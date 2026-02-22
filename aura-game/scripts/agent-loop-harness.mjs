#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync, readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'

const DEFAULT_STATE = {
  version: 1,
  objective: '',
  assumptions: [],
  constraints: [],
  qualityGates: [
    'Feature works end-to-end in local environment',
    'Architecture impact documented and bounded',
    'UI/UX and copy quality reviewed',
    'Relevant tests/checks pass or are explicitly deferred with reason'
  ],
  maxIterations: 12,
  currentIteration: 0,
  backlog: [],
  done: [],
  blocked: [],
  loopScore: {
    momentum: 0,
    quality: 0,
    risk: 0
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) {
      args._.push(token)
      continue
    }
    const [key, inlineValue] = token.slice(2).split('=')
    if (inlineValue !== undefined) {
      args[key] = inlineValue
    } else {
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        args[key] = true
      } else {
        args[key] = next
        i += 1
      }
    }
  }
  return args
}

function toList(value) {
  if (!value) return []
  return String(value)
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

function nowStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function loadState(runDir) {
  const path = join(runDir, 'state.json')
  if (!existsSync(path)) {
    throw new Error(`No state.json found in ${runDir}. Run \`init\` first.`)
  }
  return JSON.parse(readFileSync(path, 'utf8'))
}

function saveState(runDir, state) {
  const next = {
    ...state,
    updatedAt: new Date().toISOString()
  }
  writeFileSync(join(runDir, 'state.json'), JSON.stringify(next, null, 2))
}

function ensureRunDir(baseDir, requestedRunId) {
  const root = resolve(baseDir)
  if (!existsSync(root)) mkdirSync(root, { recursive: true })

  if (requestedRunId) {
    const runDir = join(root, requestedRunId)
    if (!existsSync(runDir)) {
      throw new Error(`Run ${requestedRunId} not found under ${root}`)
    }
    return runDir
  }

  const runs = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()

  if (!runs.length) {
    throw new Error(`No runs found in ${root}. Run \`init\` first.`)
  }

  return join(root, runs[runs.length - 1])
}

function bestBacklogItem(state) {
  const remaining = state.backlog.filter((item) => !state.done.includes(item) && !state.blocked.includes(item))
  if (!remaining.length) return null

  const weighted = remaining.map((item) => {
    const lower = item.toLowerCase()
    const score =
      (lower.includes('critical') ? 3 : 0) +
      (lower.includes('blocker') ? 3 : 0) +
      (lower.includes('test') ? 2 : 0) +
      (lower.includes('ship') ? 2 : 0) +
      (lower.includes('refactor') ? 1 : 0)
    return { item, score }
  })

  weighted.sort((a, b) => b.score - a.score)
  return weighted[0].item
}

function renderIterationBrief(state, focusItem) {
  const backlog = state.backlog
    .filter((item) => !state.done.includes(item))
    .map((item) => `- ${item}${state.blocked.includes(item) ? ' [BLOCKED]' : ''}`)
    .join('\n')

  const gates = state.qualityGates.map((gate, idx) => `${idx + 1}. ${gate}`).join('\n')

  return `# Agentic Loop Iteration ${String(state.currentIteration).padStart(3, '0')}

## Objective
${state.objective}

## Current focus
${focusItem ?? 'No active focus item. Refill backlog before continuing.'}

## Backlog snapshot
${backlog || '- (empty)'}

## Quality gates (must stay green)
${gates}

## Execution protocol
1. Deliver a functional slice, not broad rewrites.
2. Leave architectural seams cleaner than before.
3. Upgrade copy + UX where user-facing surface changed.
4. Run only relevant checks and log explicit outcomes.
5. If blocked > 2 loops on same item, split scope and pivot.

## End-of-loop report template
- What shipped:
- Evidence (files/checks/screenshots):
- Risks introduced:
- Follow-ups:
- Confidence (0-10):
`
}

function runInit(args) {
  const baseDir = resolve(args.dir ?? '.agent-loop')
  mkdirSync(baseDir, { recursive: true })

  const runId = args['run-id'] ?? nowStamp()
  const runDir = join(baseDir, runId)
  if (existsSync(runDir)) {
    throw new Error(`Run ${runId} already exists in ${baseDir}`)
  }

  mkdirSync(runDir, { recursive: true })
  mkdirSync(join(runDir, 'iterations'))

  const state = {
    ...DEFAULT_STATE,
    objective: args.objective ?? 'Ship meaningful user-visible progress with each loop.',
    assumptions: toList(args.assumptions),
    constraints: toList(args.constraints),
    backlog: toList(args.backlog),
    maxIterations: Number(args['max-iterations'] ?? DEFAULT_STATE.maxIterations),
    qualityGates: toList(args['quality-gates']).length ? toList(args['quality-gates']) : DEFAULT_STATE.qualityGates
  }

  saveState(runDir, state)
  writeFileSync(
    join(runDir, 'README.md'),
    `# Agent Loop Run ${runId}\n\n- Objective: ${state.objective}\n- Max iterations: ${state.maxIterations}\n- Created: ${state.createdAt}\n`
  )
  writeFileSync(join(runDir, 'metrics.csv'), 'iteration,momentum,quality,risk,confidence,focus\n')

  console.log(`Initialized run: ${runId}`)
  console.log(`Run directory: ${runDir}`)
}

function runNext(args) {
  const runDir = ensureRunDir(args.dir ?? '.agent-loop', args['run-id'])
  const state = loadState(runDir)

  if (state.currentIteration >= state.maxIterations) {
    throw new Error(`Reached max iterations (${state.maxIterations}). Use close/re-init.`)
  }

  state.currentIteration += 1
  const explicitFocus = args.focus ? String(args.focus).trim() : null
  const focusItem = explicitFocus || bestBacklogItem(state)

  const filename = `iteration-${String(state.currentIteration).padStart(3, '0')}.md`
  writeFileSync(join(runDir, 'iterations', filename), renderIterationBrief(state, focusItem))
  saveState(runDir, state)

  console.log(`Prepared ${filename}`)
  console.log(`Focus: ${focusItem ?? 'none'}`)
}

function runLog(args) {
  const runDir = ensureRunDir(args.dir ?? '.agent-loop', args['run-id'])
  const state = loadState(runDir)

  const momentum = Number(args.momentum ?? 0)
  const quality = Number(args.quality ?? 0)
  const risk = Number(args.risk ?? 0)
  const confidence = Number(args.confidence ?? 0)
  const focus = String(args.focus ?? bestBacklogItem(state) ?? 'n/a').replaceAll(',', ';')

  appendFileSync(
    join(runDir, 'metrics.csv'),
    `${state.currentIteration},${momentum},${quality},${risk},${confidence},${focus}\n`
  )

  state.loopScore = { momentum, quality, risk }

  for (const doneItem of toList(args.done)) {
    if (!state.done.includes(doneItem)) state.done.push(doneItem)
  }

  for (const blockedItem of toList(args.blocked)) {
    if (!state.blocked.includes(blockedItem)) state.blocked.push(blockedItem)
  }

  for (const addItem of toList(args['add-backlog'])) {
    if (!state.backlog.includes(addItem)) state.backlog.push(addItem)
  }

  saveState(runDir, state)
  console.log(`Logged loop ${state.currentIteration} metrics in ${runDir}/metrics.csv`)
}

function runStatus(args) {
  const runDir = ensureRunDir(args.dir ?? '.agent-loop', args['run-id'])
  const state = loadState(runDir)

  const remaining = state.backlog.filter((item) => !state.done.includes(item))
  console.log(`Run: ${runDir}`)
  console.log(`Objective: ${state.objective}`)
  console.log(`Iteration: ${state.currentIteration}/${state.maxIterations}`)
  console.log(`Remaining backlog: ${remaining.length}`)
  console.log(`Blocked: ${state.blocked.length}`)
  console.log(`Loop score (momentum/quality/risk): ${state.loopScore.momentum}/${state.loopScore.quality}/${state.loopScore.risk}`)
  if (remaining.length) {
    console.log('Top backlog:')
    for (const item of remaining.slice(0, 8)) console.log(`- ${item}`)
  }
}

function printHelp() {
  console.log(`agent-loop-harness\n
Usage:
  node scripts/agent-loop-harness.mjs init --objective "..." --backlog "item a|item b"
  node scripts/agent-loop-harness.mjs next [--run-id 2026-..] [--focus "..."]
  node scripts/agent-loop-harness.mjs log --momentum 8 --quality 7 --risk 3 --confidence 8 --done "item a"
  node scripts/agent-loop-harness.mjs status [--run-id ...]

Options:
  --dir             Base directory for runs (default: .agent-loop)
  --run-id          Specific run folder
  --max-iterations  Loop cap for the run
  --quality-gates   Pipe-separated quality gates
  --assumptions     Pipe-separated assumptions
  --constraints     Pipe-separated constraints
`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const [command] = args._

  try {
    if (!command || command === 'help' || command === '--help') {
      printHelp()
      return
    }
    if (command === 'init') return runInit(args)
    if (command === 'next') return runNext(args)
    if (command === 'log') return runLog(args)
    if (command === 'status') return runStatus(args)

    throw new Error(`Unknown command: ${command}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    process.exitCode = 1
  }
}

main()
