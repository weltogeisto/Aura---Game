# Progress Log

## Milestone 2 — One-shot input loop (aim + fire lock + reset)

### Decisions
- Aim input now supports hybrid controls: mouse for coarse positioning plus keyboard fine adjustment (`Arrow` keys and `WASD`) for precision nudging.
- Run-state is explicitly tracked in Zustand with `hasFired`, `shotTimestamp`, and `fireBlocked`, plus a dedicated `resetRunState()` action to reset only per-run shot state.
- Fire handling is protected at click-handler level (`hasFired` early return) and at store-action level (`fireShotResult` one-shot guard) to avoid accidental duplicate transitions.
- UI now surfaces blocked-fire feedback (`Shot already fired. Reset to shoot again.`) and updated input copy in HUD.
- Post-shot transition remains automatic and is only triggered by the first accepted shot (`fireShotResult` sets `shooting`, then `finalizeShot` moves to `results`).
- Added store-level tests to verify one-shot guard behavior and reset semantics.

### Command output summary
- `pnpm lint` (pass)
  - `eslint .` completed with no errors.
- `pnpm test` (pass)
  - `node --test --experimental-strip-types tests/*.test.ts`
  - 2 tests passed (`one-shot guard`, `resetRunState semantics`).
- `pnpm build` (pass)
  - `tsc -b && vite build`
  - Production bundle built successfully.
