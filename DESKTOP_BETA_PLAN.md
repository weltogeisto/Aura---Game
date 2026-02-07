# Desktop Beta Plan — Aura of the 21st Century

This plan defines the concrete steps to produce a **downloadable desktop beta** using the existing web build workflow. It is organized as parallel workstreams (“subagents”) with clear outputs and a thorough test matrix.

---

## Workstream A — Vertical Slice (Graphics Baseline)

**Goal:** Ship one scenario (Louvre) as a visually polished, playable slice.

**Deliverables**
- 8K panorama with calibrated exposure and restrained postprocessing (bloom + vignette).
- Value mesh + single-shot loop with critic review.
- Crisp, institutional UI overlays aligned with the design system.
- Impact feedback: micro-shake, dust motes, brief bloom spike.

**Exit criteria**
- Single-shot loop is complete and repeatable.
- Score and critic review display reliably after impact.
- Visual polish meets the target look (hyperreal world + clinical UI).

---

## Workstream B — Performance & Adaptability

**Goal:** Ensure the build scales across mid-range GPUs and varied displays.

**Deliverables**
- Quality tiers (Low/Medium/High) for postprocessing, texture size, and DPR.
- GPU load guard (auto-disables heavy effects when FPS drops).
- Desktop layout panel reserved for score; mobile drawer layout kept intact.

**Exit criteria**
- Low tier runs smoothly on mid-range hardware.
- Medium/High tiers are visually distinct and stable.
- UI layout adapts without breaking interaction.

---

## Workstream C — Desktop Packaging (Beta)

**Goal:** Produce installable desktop builds using a webview wrapper.

**Deliverables**
- Web build output (`bundle.html` or `dist/`) is the canonical artifact.
- Desktop wrapper (Tauri or Electron) loads the artifact offline.
- Installers for Windows/macOS (Linux optional).

**Exit criteria**
- Clean install/uninstall.
- App launches offline with no missing assets.
- Core loop runs without runtime errors.

---

## Workstream D — “Cool Feature” Hooks

**Goal:** Add feature hooks that can be turned on without refactors.

**Deliverables**
- Photo mode hook (pause physics, hide UI, high quality render, export).
- Replay hook (record trajectory, slow-mo playback).
- Accessibility presets (reduced motion, aim assist, high contrast).

**Exit criteria**
- Hooks exist behind feature flags.
- Enabling/disabling does not break UI flow.

---

## Test Plan (Thorough)

### Functional
- Single-shot flow: aim → fire → impact → critic → score.
- Value mesh: correct damage scoring.
- Easter egg: Dadaist target triggers and scores properly.

### Visual & Performance
- Quality tiers: noticeable effect scaling and stable FPS.
- GPU guard: disables heavy effects on sustained FPS drops.
- Visual polish: consistent exposure, clean overlays, and readable UI.

### Desktop Packaging
- Offline mode: no network dependency, no missing assets.
- Install/launch/uninstall: clean across platforms.
- Window behavior: resize, fullscreen, DPI scaling.

---

## Release Checklist (Beta)

1. Tag version (e.g., `v0.1.0-beta.1`).
2. Generate installers for target OSes.
3. Publish on GitHub Releases or itch.io.
4. Provide a feedback form + crash log instructions.

---

## Dependencies & Notes

- Follows the existing web build workflow and Three.js architecture.
- Uses the current visual identity and UI guidelines.
- Keeps the build pipeline deterministic (single source artifact for web + desktop).
