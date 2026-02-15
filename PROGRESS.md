# Progress

## Milestone 1 — Louvre scene load + entry flow scaffold

### Changed files
- `aura-game/src/App.tsx`
- `aura-game/src/types/index.ts`
- `aura-game/src/stores/gameStore.ts`
- `aura-game/src/components/ui/StartView.tsx`
- `aura-game/src/components/louvre/LouvreSceneContainer.tsx`
- `aura-game/src/components/game/Scene.tsx`
- `aura-game/src/components/game/ShotImpact.tsx`
- `aura-game/src/components/game/ShotTracer.tsx`
- `aura-game/src/components/ui/ResultsScreen.tsx`
- `PROGRESS.md`

### Command results
- `pnpm -C aura-game run lint` → pass.
- `pnpm -C aura-game exec tsc -b --pretty false` → pass.
- `pnpm -C aura-game run build` → pass with Vite chunk-size warning only.
