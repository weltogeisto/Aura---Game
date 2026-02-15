# Progress

## Milestone 4 — Louvre one-shot loop (value mesh + critic + egg)

Completed:
- Added deterministic post-shot result modeling (score, location, critic output).
- Added explicit Dadaist hit tagging and hidden Louvre placement for the easter egg.
- Added conditional anti-value scoring and critic-path branching for Dadaist hits.
- Hardened replay reset path to restore one-shot lock, score, and critic state.

## Final CI

Command outcomes:
- `pnpm lint` — pass.
- `pnpm exec tsc -b` — pass.
- `pnpm build` — pass.

## Tuning-Hebel (Scoring)

- `aura-game/src/data/scenarios.ts` → `LOUVRE_SCORING.fallbackSampleValue`
- `aura-game/src/data/scenarios.ts` → `LOUVRE_SCORING.defaultZoneMultiplier`
- `aura-game/src/data/scenarios.ts` → `LOUVRE_SCORING.defaultCriticalModifier`
- `aura-game/src/data/scenarios.ts` → `LOUVRE_SCORING.dadaistScore`
- `aura-game/src/data/scenarios.ts` → `SCENARIOS.louvre.targets[*].zoneMultiplier` / `criticalModifier`
