# Agent Task Checklist Mapping

## Requested Scope

- [x] Build a post-shot results view with total score, hit location label, and deterministic critic output.
- [x] Add a hidden Dadaist target to the Louvre scene and tag it for explicit hit detection.
- [x] Implement conditional scoring and critique variation for Dadaist hits.
- [x] Ensure restart resets gameplay state, score state, critic state, and one-shot lock.
- [x] Run lint, build, and type-check verification commands.

## Evidence Map

| Checklist item | Evidence |
| --- | --- |
| Results view includes score + hit location + deterministic critic line | `aura-game/src/components/ui/ResultsScreen.tsx`, `aura-game/src/components/game/BallisticsSystem.tsx` |
| Hidden Dadaist target + explicit tag | `aura-game/src/data/scenarios.ts`, `aura-game/src/components/game/TargetObjects.tsx` |
| Dadaist scoring/critique variation | `aura-game/src/components/game/BallisticsSystem.tsx` |
| Restart reset behavior | `aura-game/src/stores/gameStore.ts`, `aura-game/src/components/ui/ScenarioSelect.tsx` |
| Validation checks | `pnpm lint`, `pnpm exec tsc -b`, `pnpm build` |
