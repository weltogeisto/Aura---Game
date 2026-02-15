# Progress

## Milestone 4 — Louvre one-shot loop (value mesh + critic + egg)

Completed:
- Added deterministic post-shot result modeling (score, location, critic output).
- Added explicit Dadaist hit tagging and hidden Louvre placement for the easter egg.
- Added conditional anti-value scoring and critic-path branching for Dadaist hits.
- Hardened replay reset path to restore one-shot lock, score, and critic state.

## Final CI

Command outcomes:
- `pnpm lint` — pass.
- `pnpm exec tsc -b` — pass.
- `pnpm build` — pass.


## Minimal Release-Checkliste (Desktop Beta)

- [ ] **Versionierung:** `aura-game/package.json` Version erhöhen und Release-Tag setzen (`vX.Y.Z-beta.N`).
- [ ] **Smoke-Checks:** `pnpm run build:canonical` erfolgreich; Desktop-Wrapper startet offline mit Assets aus `release/web/current`.
- [ ] **Known Issues:** Offene Punkte + Workarounds vor Distribution in den Release Notes dokumentieren.

