# Progress

## Milestone 5 — Build Stabilization & Full Game Loop

Completed (2026-02-15):

### Build Fixes (49 TypeScript errors → 0)
- **BallisticsSystem.tsx**: Rewrote to properly import and wire `simulateShot` from `lib/ballistics/simulation.ts`. Added `hashSeed`, `collectSimulationObjects` helpers. Replaced undefined `fireShotResult`/`finalizeShot` with correct `commitShot`/`finalizeResults` store methods. Resolved all `impact`/`sampled`/`raycaster` undefined variable references.
- **ShotTracer.tsx**: Removed duplicate `const basePositions` declaration.
- **types/index.ts**: Added `isMvp?: boolean` to `Scenario` interface.
- **scenarios.ts**: Added `metadata` (region, difficulty, status) to all 9 scenario definitions. Refactored `createScenario` to auto-infer `contentCompleteness` from scenario data.
- **ScenarioSelect.tsx**: Imported `ScenarioStatus` type, wired `STATUS_LABELS` map.
- **validation.ts**: Relaxed parameter type to accept metadata without `contentCompleteness` (computed at creation time).
- **simulation.ts**: Changed `let direction` to `const direction` (lint fix).

### Test Fixes (4/6 → 9/9 passing)
- Created Node.js custom module loader (`tests/loader.mjs` + `tests/register-loader.mjs`) to resolve `@/` path alias and extensionless imports in the Node.js test runner.
- Fixed `store-shot-resolution.test.ts`: replaced dead `fireShotResult` calls with `commitShot`, added gamePhase reset between successive commits.

### Scenario Metadata
All 9 scenarios now have metadata with status:
- **Playable**: Louvre
- **Prototype**: St. Peter's, Topkapi, TSMC, Hermitage, MoMA, Borges Library
- **Locked**: Forbidden City, Federal Reserve

## CI Status

- `pnpm lint` — pass (0 errors)
- `pnpm build` — pass (tsc + vite build)
- `pnpm test:core` — pass (9/9 tests)

## Milestone 4 — Louvre one-shot loop (value mesh + critic + egg)

Completed:
- Added deterministic post-shot result modeling (score, location, critic output).
- Added explicit Dadaist hit tagging and hidden Louvre placement for the easter egg.
- Added conditional anti-value scoring and critic-path branching for Dadaist hits.
- Hardened replay reset path to restore one-shot lock, score, and critic state.

## What's Working

- **Full game loop**: menu → scenario-select → aiming → click → ballistics simulation → scoring → results → replay
- **Ballistics engine**: trajectory, ricochet, penetration, material behavior (7 material types)
- **Scoring system**: value mesh sampling, critic line generation, easter egg detection
- **All 9 scenarios**: targets defined, critic lines, easter eggs (Dadaist + Systemic) per scenario
- **3D rendering**: Canvas, panorama, room shell, museum lighting, target objects, quality tiers
- **UI flow**: Start → Louvre demo or all scenarios, results with breakdown, replay/restart

## What Remains

### Tier 1 — Required for playable release
- Real panorama assets (currently using procedural SVG gradients)
- Audio (Howler.js configured, no audio files)
- Complete critic line pools for 7 prototype scenarios (Louvre is complete)
- Promote prototype scenarios to playable after content review

### Tier 2 — Quality and polish
- Breath sway crosshair animation
- Typewriter effect for critic reviews
- Material-specific impact sounds
- Ambient room audio per scenario
- Mobile responsive layout

### Tier 3 — Designed but not yet built
- Insurance Adjuster post-shot debate
- Provenance Roulette (forgery reveal)
- Curator's Revenge event
- Photo mode, replay system
- Desktop packaging (Tauri configured, no installer generation)
- Multiplayer "Auction" mode (concept only)

## Minimal Release Checklist (Desktop Beta)

- [ ] **Versioning:** Bump `aura-game/package.json` version and set release tag (`vX.Y.Z-beta.N`).
- [ ] **Smoke Checks:** `pnpm run build:canonical` succeeds; desktop wrapper starts offline with assets from `release/web/current`.
- [ ] **Known Issues:** Document open issues + workarounds in release notes before distribution.
