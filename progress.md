# progress.md

## Milestone 0 — Repo reconnaissance + plan

### Architecture map
- UI entry flow is composed in React components under `aura-game/src/components/ui/`.
- The mobile layout blocker in `todo.md` specifically targets:
  - `StartView.tsx`
  - `ScenarioSelect.tsx`
  - `ResultsScreen.tsx`
- Test harness is Node's built-in test runner (`node --test`) with TS stripping, configured in `aura-game/package.json` scripts.
- Existing CI-like local checks for this scope are `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

### Plan
1. Implement responsive layout refinements in the three target UI components.
2. Add regression tests that assert mobile-oriented class contracts exist.
3. Update docs/logging artifacts (`progress.md`, `todo.md`, `NOTES.md`, README note).
4. Run lint/typecheck/tests and fix any failures.
5. Capture visual proof with a mobile viewport screenshot.

### Risks + mitigations
- Risk: Tailwind class-only changes can silently regress.
  - Mitigation: add test coverage that checks key responsive class patterns.
- Risk: viewport-height handling differs on mobile browser chrome changes.
  - Mitigation: prefer dynamic viewport units (`dvh`) for wrappers and capped modal heights.
- Risk: styling changes accidentally affect desktop hierarchy.
  - Mitigation: keep desktop behavior behind existing `sm/md/lg` variants.

### Test plan tied to acceptance criteria
- AC1 (StartView readable <768px): static class contract test + visual screenshot.
- AC2 (ScenarioSelect scrollable and badge wrapping): static class contract test + visual screenshot.
- AC3 (ResultsScreen no horizontal overflow and tappable CTAs): static class contract test + visual screenshot.
- AC4 (no regressions): `pnpm lint`, `pnpm typecheck`, `pnpm test`.

## Milestone 1 — Core implementation
- Updated all three target UI screens with mobile-first typography/spacing and viewport-safe scroll containers.
- Replaced modal cap units from `vh` to `dvh` for more robust mobile viewport behavior.

## Milestone 2 — Tests + hardening
- Added `tests/mobile-layout.test.ts` to pin responsive class contracts for all three screens.

## Milestone 3 — Docs + final verification
- Added `NOTES.md` with external validation links and decisions.
- Updated `todo.md` to mark mobile responsive layout as complete.
- Updated `aura-game/README.md` known limitations to reflect improved mobile screen behavior.

## Follow-up — screenshot reliability
- Added a DEV-only `window.__AURA_DEVTOOLS__.store` hook in `src/main.tsx` so Playwright can force deterministic UI states (especially ResultsScreen) without relying on WebGL shot simulation in headless mode.
- Re-captured mobile screenshots using explicit UI-state setup to avoid black-screen artifacts.
