# Asset Acceptance Checklist

Use this quick gate before marking a scenario asset set as release-ready.

## Audio quality

- [ ] **Material identity is obvious**: impact sounds are clearly distinguishable for `stone`, `metal`, `glass`, `wood`, and `fabric` in blind A/B checks.
- [ ] **Venue alignment**: each scenario `impactProfile` matches its venue mood (museum/cathedral/industrial/vault/library).
- [ ] **Loudness target**: perceived loudness remains consistent across scenarios (no abrupt jumps when switching venues).
- [ ] **Peak safety**: no audible clipping; true peak remains `<= -1 dBTP` for impact/UI and ambient stems.
- [ ] **Loop quality**: ambient loops have no audible click/pop at loop boundary over at least 5 repetitions.

## Performance and memory

- [ ] **Memory budget**: textures + decoded audio for active scenario remain within desktop budget envelope.
- [ ] **Asset budget compliance**: files meet limits in `docs/desktop-release.md` (resolution, compression, payload size).
- [ ] **Cold-load check**: playable state reached within release load-time budget.

## Offline and fallback behavior

- [ ] **Offline path validation**: `pnpm run assets:check` passes with no remote URL/path violations.
- [ ] **Fallback panorama color**: scenario still renders legibly if panorama file fails to decode.
- [ ] **Fallback audio behavior**: missing/failed audio asset does not block gameplay input or state transitions.
