# Aura of the 21st Century — Desktop Beta Vertical Slice

A satirical single-shot destruction game prototype focused on a polished Louvre scenario and a reproducible desktop-beta delivery path.

## Quickstart

```bash
cd aura-game
pnpm install
pnpm dev
```

Open the local Vite URL and run the loop:
1. Start view → Main menu
2. Select an available scenario (currently Louvre is MVP)
3. Aim once, fire once, review score + critic output

## Canonical Build (Desktop Beta Handoff)

```bash
cd aura-game
pnpm run build:canonical
```

This is the release entrypoint aligned with `WEB_BUILD.md` and `DESKTOP_BETA_PLAN.md`:
- validates offline-safe assets
- builds production web artifacts
- generates a single-file bundle artifact
- stages everything under `release/web/current` for desktop wrapping

## Architecture at a Glance

- **Frontend:** React 19 + TypeScript + Vite
- **3D Runtime:** Three.js via `@react-three/fiber` and `@react-three/drei`
- **State:** Zustand (`src/stores/gameStore.ts`) for game phase, shot lock, score, critic output
- **Data-driven scenarios:** `src/data/scenarios.ts` (targets, value maps, critic lines, MVP gating)
- **Copy system:**
  - `src/data/uiCopyMap.ts` for centralized screen copy, CTA labels, hints, score/critic framing, and beta limitation language
  - `src/data/copy.ts` for normalized scenario text and gameplay microcopy export
- **Rendering adaptability:** render tiers + FPS guard in `src/lib/renderSettings.ts`

## Gameplay Loop

1. **Briefing:** Player enters desktop beta vertical slice context (single polished scenario, one-shot premise).
2. **Scenario select:** Available-now scenarios can be launched; maturing scenarios are visible but locked.
3. **Aiming phase:** One bullet only. HUD communicates controls and lock behavior.
4. **Shot + evaluation:** Ballistics resolves impact, value mesh samples cultural value zones, score is computed.
5. **Results:** Critic line + breakdown + replay/new-scenario options.

## Known Limitations (Beta Honesty)

- One shot is hard-locked per run (no in-run reload).
- Scenario maturity is uneven (Louvre polished first, other rooms still iterating).
- Performance tiers may auto-step down visual fidelity to preserve responsive input under sustained FPS pressure.
