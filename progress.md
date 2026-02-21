# progress.md

## Batch 0 — Architecture + Plan

### Minimal module surface (targeted)
- `aura-game/src/components/ui/StartView.tsx`
- `aura-game/src/components/ui/ScenarioSelect.tsx`
- `aura-game/src/components/ui/ResultsScreen.tsx`

Reason: all three are explicitly called out in the current Tier-2 mobile todo and can be improved with class-level layout changes without touching game logic/state.

### Risks
- **Auth:** none (no auth layer in this slice).
- **Migrations/data:** none.
- **Concurrency/state races:** low; only presentational class changes, no state transitions altered.
- **Performance:** low-to-medium; reducing oversized typography and overflow on small screens should improve perceived perf and avoid forced scroll jank.
- **Security:** none introduced (no new I/O, rendering external HTML, or permissions changes).

### Acceptance criteria (assumed defaults)
1. StartView remains readable and operable on <768px screens (no clipped headings/buttons).
2. ScenarioSelect list is scrollable and status badges wrap cleanly on mobile.
3. ResultsScreen score/target/CTA blocks remain visible and tappable without horizontal overflow.
4. Existing lint/typecheck/core tests continue to pass.

### Test plan
- Static verification:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test:core`
- Manual UX check:
  - Run dev server and validate all three screens at a narrow viewport (~390x844) with screenshot evidence.

## Batch 1 — Implementation log
- Updated `StartView` spacing/typography/button padding for narrow widths to avoid clipped hero text and cramped controls.
- Updated `ScenarioSelect` container to use viewport-capped scrolling and mobile-first heading/card layout.
- Updated `ResultsScreen` overlay/card sizing and breakdown grid columns for small screens.
- Validation pending: lint, typecheck, tests, mobile screenshot.
