# DEVLOG — Aura of the 21st Century

Agent development log. Most recent session first.

---

## Session 2026-02-26

### Assessment

At session start:
- Build: passing (tsc + vite)
- Lint: clean (0 errors)
- Tests: 15/15 passing
- All 9 scenarios: marked `status: 'playable'` in both scenario files and maturity matrix

Key finding: UI copy was stale — showed "6 playable scenarios" while all 9 were already playable in code (Hermitage, Forbidden City, Federal Reserve had been promoted in a previous session but copy wasn't updated).

### What I did

1. **Fixed stale UI copy** (`src/data/uiCopyMap.ts`)
   - `release.subtitle`: "6 Szenarien spielbar" → "9 Szenarien spielbar" (all 9 listed by name)
   - `startView.body`: "Sechs Räume, sechs Kontexte" → "Neun Räume, neun Kontexte — Kunst, Kapital, Code, Buchstaben, Macht"
   - `mainMenu.scenarioSummary`: Updated to "Alle 9 Szenarien vollständig spielbar" with full list
   - `limitations.items[1]`: Removed stale "three scenarios remain locked" text; replaced with honest note about panorama assets being procedural SVGs
   - `scenarioSelect.deskBriefBody` and `readinessItems`: Updated to reflect all 9 rooms being fully playable

2. **Improved SVG panoramas** (`public/assets/panoramas/*.svg`)
   All 9 venue panoramas replaced with richer, more atmospheric SVG backgrounds featuring:
   - Proper ceiling/wall/floor zones with gradients
   - Repeated architectural elements (columns, frames, tiles, shelves)
   - Venue-specific color palettes and details
   - Ceiling lights, floor patterns, decorative elements

3. **Updated project docs**
   - `todo.md`: Moved completed items to "recently completed", updated tier lists
   - `PROGRESS.md`: Added Milestone 7 entry

### What works now

- Full game loop: start → 9 playable scenarios → aim → shoot → results → replay
- All 9 scenarios show "Playable" status in scenario selector
- UI copy is accurate and consistent
- Panorama backgrounds are visually richer (still procedural, not photo assets)
- 15/15 tests pass, build clean, lint clean

### What's next (highest priority)

1. Real panorama photo assets — biggest remaining gap between current state and finished
2. Audio files (SFX + ambient) — Howler.js wired, no actual audio loaded
3. `other`-type target visual polish (generic boxes for gold bars, floors, etc.)

---

## Prior sessions (summary)

### Session ~2026-02-22 (beta transition)
- Bumped version to `0.3.0-beta.1`
- Hermitage, Forbidden City, Federal Reserve scenario data completed (scoring + critic lines + `status: 'playable'`)
- TypeWriter hook wired to ResultsScreen critic output
- Mobile responsive layout improvements

### Session ~2026-02-20 (Milestone 6)
- All 9 scenarios received scoring blocks and three-tier critic line pools
- St. Peter's, Topkapi, TSMC, MoMA, Borges Library promoted to playable
- Lint fixes (react-hooks v7 set-state-in-effect rules)
- ScenarioSelect accessibility and copy improvements

### Session ~2026-02-15 (Milestone 5)
- 49 TypeScript errors → 0
- BallisticsSystem rewired to correct store methods
- Tests: 4/6 → 15/15 passing
- Custom Node.js module loader for test runner (`@/` alias resolution)
