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
- **Data-driven scenarios:** `src/data/scenarios.ts` builds runtime scenarios from modular seeds in `src/data/scenarios/*.ts` via `src/data/scenarios/registry.ts`
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


## Scenario Content Workflow (verbindlich)

1. **Neues Szenario immer als Modul anlegen:** `src/data/scenarios/<scenario-id>.ts` (Dateiname = `scenario.id`).
2. **Registry aktualisieren:** Modul in `src/data/scenarios/registry.ts` importieren und in `SCENARIO_SEEDS` eintragen.
3. **Nicht in `src/data/scenarios.ts` editieren:** Diese Datei ist nur die Runtime-Aggregation (`SCENARIO_SEEDS -> SCENARIOS`).
4. **Konsistenz-Guard ausführen:** `pnpm run scenarios:check` erkennt Drift zwischen Moduldateien, Registry und Laufzeit-Map.
5. **Vor Merge mindestens Core-Checks:** `pnpm run test:core` und `pnpm run scenarios:check`.

Damit bleibt die Szenario-Pipeline eindeutig: **Quelle = Moduldatei**, **Freigabe = Registry**, **Verwendung = SCENARIOS**.
