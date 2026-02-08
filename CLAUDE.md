# CLAUDE.md

## Project Overview

**Aura of the 21st Century** — a satirical web-based destruction game where the player has one pistol-caliber shot to inflict maximum "cultural damage" across nine iconic interiors (the Louvre, MoMA, Federal Reserve, etc.). Built with React, Three.js, and TypeScript.

## Tech Stack

- **Framework**: React 19 + TypeScript 5.9 (strict mode)
- **3D Engine**: Three.js 0.182 via @react-three/fiber 9.5
- **Build Tool**: Vite 7
- **State Management**: Zustand 5
- **Styling**: Tailwind CSS 4
- **Audio**: Howler.js
- **Package Manager**: pnpm

## Project Structure

```
aura-game/              # Main application directory
  src/
    components/
      game/             # 3D game components (Scene, BallisticsSystem, etc.)
      ui/               # Menu, scenario select, results screens
    stores/             # Zustand game store
    types/              # TypeScript interfaces
    data/               # Scenario definitions and target data
    lib/                # Render settings, utilities
    assets/             # SVG images
    App.tsx             # Root component
    main.tsx            # Entry point
*.md                    # 26 design/scenario docs at repo root
```

## Common Commands

All commands run from `aura-game/` directory:

```bash
cd aura-game

pnpm install          # Install dependencies
pnpm dev              # Start dev server with HMR
pnpm build            # Type-check (tsc -b) + Vite production build
pnpm lint             # ESLint across all .ts/.tsx files
pnpm preview          # Preview production build locally
```

## Build & Type Checking

- `pnpm build` runs `tsc -b && vite build` — TypeScript must pass before bundling
- Path alias: `@/` maps to `./src/`
- Target: ES2022, JSX: react-jsx
- Strict mode enabled, but `noUnusedLocals` and `noUnusedParameters` are off

## Linting

- ESLint 9 flat config (`eslint.config.js`)
- Extends: `@eslint/js` recommended, `typescript-eslint` recommended, `react-hooks` recommended, `react-refresh/vite`
- Ignores `dist/`

## Architecture

### Game State Flow
`menu` → `scenario-select` → `aiming` → `shooting` → `results`

Managed by a single Zustand store (`src/stores/gameStore.ts`).

### 3D Scene Hierarchy
```
Canvas
├── Fog
├── RenderPerformanceMonitor (adaptive quality: low/medium/high)
├── Panorama (360° background sphere)
├── RoomShell (procedural walls/floor via canvas textures)
├── ValueMesh (value visualization overlay)
├── TargetObjects (clickable 3D targets)
├── BallisticsSystem (ray-casting hit detection)
├── CameraShake, ShotImpact, ShotTracer
└── Crosshair (HUD overlay)
```

### Render Tiers
- **low**: 1 dpr, no postprocessing, 256px textures
- **medium**: 1.5 dpr, postprocessing, 512px textures
- **high**: 2 dpr, postprocessing, 1024px textures
- Auto-degrades based on FPS thresholds (50fps → high, 40fps → medium)

### Key Data Types
- `Target`: id, name, value (currency), position [x,y,z], radius, type (masterpiece/sculpture/easter-egg-*)
- `Scenario`: id, name, targets[], totalMaxValue, criticLines (low/mid/high damage)
- `ShotResult`: hitTargetId, damageAmount, breakdown[], specialEffects[]

## Nine Scenarios

1. The Louvre — Salle des États
2. St. Peter's Basilica — Vatican
3. Topkapi Palace — Imperial Treasury
4. The Forbidden City — Hall of Supreme Harmony
5. TSMC Clean Room — Fab 18
6. The Hermitage — Peacock Clock Room
7. Federal Reserve Gold Vault
8. MoMA — Contemporary Gallery
9. The Borges Library — Canon Room

Each scenario has unique targets, easter eggs, and critic review scripts.

## Testing

No test framework is currently configured. No tests exist yet.

## Code Style Notes

- Use TypeScript strict mode conventions
- Prefer `@/` path alias for imports within `src/`
- Follow existing component patterns in `src/components/game/` for 3D components
- UI components use shadcn/ui patterns with Tailwind
- Game logic and state changes go through the Zustand store, not local component state
