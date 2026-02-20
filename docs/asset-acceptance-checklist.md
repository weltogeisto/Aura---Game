# Asset Acceptance Checklist

Use this quick gate before marking a scenario asset set as release-ready.

## Audio quality

- [ ] **Loudness**: integrated loudness normalized (target around `-16 LUFS` for UI/impact, `-20 LUFS` to `-18 LUFS` for ambient beds).
- [ ] **Peak safety**: true peak does not clip (`<= -1 dBTP`).
- [ ] **Loop quality**: ambient loops have no audible click/pop at loop boundary over at least 5 repetitions.

## Performance and memory

- [ ] **Memory budget**: textures + decoded audio for active scenario remain within desktop budget envelope.
- [ ] **Asset budget compliance**: files meet limits in `docs/desktop-release.md` (resolution, compression, payload size).
- [ ] **Cold-load check**: playable state reached within release load-time budget.

## Offline and fallback behavior

- [ ] **Offline path validation**: `pnpm run assets:check` passes with no remote URL/path violations.
- [ ] **Fallback panorama color**: scenario still renders legibly if panorama file fails to decode.
- [ ] **Fallback audio behavior**: missing/failed audio asset does not block gameplay input or state transitions.
