# Todo

Open work items ordered by priority tier.

## Recently completed

- [x] **Accessibility preset persistence** — `reducedMotion`, `highContrast`, and `aimAssist` now persist via local storage with safe fallback behavior when storage is unavailable.

## Tier 1 — Blockers for public release

- [ ] **Panorama assets** — Replace procedural SVG gradients with real equirectangular panoramas for all 6 playable scenarios. Louvre, St. Peter's, Topkapi, TSMC, MoMA, Borges Library. Asset pipeline: 8192×4096 JPEG hi-res + 2048×1024 JPEG lo-res per venue, placed under `aura-game/public/panoramas/`.
- [ ] **Audio files** — Record or license impact SFX + ambient loops for 6 playable venues. Howler.js is wired; no `.ogg`/`.mp3` assets on disk. See `aura-game/src/data/scenarios/utils.ts` for `audioAsset` fields.
- [ ] **Hermitage promotion** — Add criticLines (3 × 3) and scoring block to `hermitage.ts`, flip status to `playable` in file and maturity matrix. Panorama asset required first.
- [ ] **Forbidden City promotion** — Same pattern as Hermitage. Panorama asset required first.
- [ ] **Federal Reserve promotion** — Same pattern. High-value targets; economist register for critic lines.

## Tier 2 — Polish before beta release

- [ ] **Mobile responsive layout** — All screens (StartView, ScenarioSelect, ResultsScreen) need breakpoint handling below 768px. HUD controls overlay overlaps on small viewports.
- [ ] **Material-specific impact sounds** — Ballistics system tags `material` on hit; map to distinct SFX (marble crack, bronze ring, glass shatter, silicon shatter, paper tear).
- [ ] **Ambient room audio** — Loop per-scenario background audio (church reverb, cleanroom hum, gallery silence) once audio assets exist.
- [ ] **Version bump** — Bump `aura-game/package.json` `version` field to `0.3.0-beta.1` before next distribution.

## Tier 3 — Future features

- [ ] **Insurance Adjuster** — Post-shot interstitial: NPC debate between player's score and a fictional adjuster. See `INSURANCE_ADJUSTER.md`.
- [ ] **Provenance Roulette** — Forgery reveal mechanic: after certain targets are hit, a secondary roll determines authenticity, modifying final damage.
- [ ] **Curator's Revenge** — Timed escalating events after shot (guards, lockdowns, media) presented as UI flashes.
- [ ] **Photo mode** — Freeze frame on hit; allow screenshot with HUD hidden.
- [ ] **Replay system** — Store shot trajectory + result; allow replay view from multiple camera angles.
- [ ] **Desktop packaging** — Tauri shell is configured (`src-tauri/`); no installer generation or signing workflow yet.
- [ ] **Multiplayer Auction mode** — Design doc only; no implementation started.
