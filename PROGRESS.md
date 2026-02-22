# Progress

## Changelog

- **2026-02-22 — Beta transition (`0.3.0-beta.1`)**: Bumped `aura-game/package.json` to `0.3.0-beta.1` and aligned release docs to versioned staging output under `release/web/v0.3.0-beta.1` (with `release/web/current` staying as desktop runtime alias).

## Milestone 6 — Scenario Promotion & UX Polish

Completed (2026-02-20):

### Build Fixes
- **scenarios.ts**: Defined and exported `SCENARIO_MATURITY_MATRIX` (`ScenarioMaturityEntry` interface) for all 9 scenarios, fixing `ReferenceError` that crashed module load and caused 11+ TypeScript errors. Added `SCENARIO_ROLLOUT_WAVES` derived export.
- **check-scenario-integrity.mjs**: Added missing `SCENARIO_MATURITY_MATRIX` and `SCENARIO_ROLLOUT_WAVES` imports.
- **@types/howler**: Installed as devDependency; removes `TS7016` declaration-file error for Howler.js.

### Scenario Promotion (5 new playable scenarios)
All five scenarios received: scoring block, three-tier critic line pools (3 lines each), `status: 'playable'` in metadata and maturity matrix. Critic lines follow CRITIC_VOICE.md spec (≤30 words, no exclamation points, world-weary register).
- **St. Peter's Basilica** — stone/bronze/sacred-atmosphere register
- **Topkapi Palace** — Ottoman gem/gold-leaf register
- **TSMC Clean Room** — silicon/precision-optics/yield register
- **MoMA** — contemporary-art meta-commentary register
- **Borges Library** — philosophical/text-as-commodity register

### Scenario Status (updated)
- **Playable (6)**: Louvre, St. Peter's, Topkapi, TSMC, MoMA, Borges Library
- **Locked (3)**: Hermitage, Forbidden City, Federal Reserve

### Lint Fixes (pre-existing, react-hooks v7 rule `set-state-in-effect`)
- **useTypewriter.ts**: Replaced synchronous `setVisibleChars` calls inside effect body with a closure-local `counter` variable in `setInterval`; disabled case derived at render time via `effectiveChars`.
- **Crosshair.tsx**: Replaced synchronous `setBreathOffset({ x: 0, y: 0 })` in early-return branch with `swayActive` boolean derived from `gamePhase`; sway applied conditionally at render time.
- **ScenarioSelect.tsx**: Removed unused `getScenarioStatusMessage` import and unused `locked` variable.
- **App.tsx**: Rendered `<GameAudioDirector />` component that was imported but never used (restores audio lifecycle).

### UX Polish
- **ResultsScreen.tsx**: Wired `useTypewriter` hook for critic output (22ms/char, respects `reducedMotion` accessibility flag). Cursor `|` blinks during reveal, disappears on completion.
- **uiCopyMap.ts**: Updated all scenario-agnostic UI strings — subtitle, startView title/cta, mainMenu summary, limitations copy — to reflect 6 playable scenarios.

## CI Status

- `pnpm lint` — pass (0 errors)
- `pnpm typecheck` — pass (0 errors)
- `pnpm test:core` — pass (13/13 tests)
- `pnpm build` — pass (tsc + vite build)

---

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

### Tier 1 — Required for public release
- Real panorama assets for all 6 playable scenarios (currently procedural SVG gradients)
- Audio files (Howler.js wired, no .ogg/.mp3 assets on disk)
- Promote remaining 3 locked scenarios (Hermitage, Forbidden City, Federal Reserve): panorama assets + critic lines + content review

### Tier 2 — Quality and polish
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
