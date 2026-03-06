# Todo

Open work items ordered by priority tier.

## Recently completed

- [x] **Accessibility preset persistence** — `reducedMotion`, `highContrast`, and `aimAssist` now persist via local storage with safe fallback behavior when storage is unavailable.
- [x] **Hermitage promotion** — criticLines (3 × 3), scoring block, `status: 'playable'` in file and maturity matrix.
- [x] **Forbidden City promotion** — Same pattern. All targets, critic lines, scoring calibrated.
- [x] **Federal Reserve promotion** — Same pattern. Economist register for critic lines. All 9 scenarios now playable.
- [x] **UI copy update** — Release subtitle, startView body, mainMenu scenarioSummary, limitations items all updated to reflect 9 playable scenarios.
- [x] **Mobile responsive layout** — StartView, ScenarioSelect, and ResultsScreen now use mobile-first spacing/typography with `dvh` viewport caps to avoid clipping and overflow below 768px.
- [x] **Panorama SVG improvements** — All 9 venue SVGs updated with richer architectural detail, gradients, and atmospheric layering.

## Tier 1 — Required for public release

- [ ] **Real panorama assets** — Replace procedural SVG panoramas with real equirectangular JPEGs for all 9 playable venues. Asset pipeline is now prewired in scenario config (`/panoramas/<id>-2048.jpg` + `/panoramas/<id>-8192.jpg`) with fail-soft SVG fallback until licensed photos are staged under `aura-game/public/panoramas/`.
- [ ] **Audio files** — Record or license impact SFX + ambient loops for all 9 venues. Howler.js is wired; no `.ogg`/`.mp3` assets on disk. Sentinel strings `data:audio/x-aura-ambient,<venue>` are used as placeholders.

## Tier 2 — Polish before public beta

- [ ] **Material-specific impact sounds** — Ballistics system tags `material` on hit; map to distinct SFX (marble crack, bronze ring, glass shatter, silicon shatter, paper tear). Requires audio assets above.
- [ ] **Ambient room audio** — Loop per-scenario background audio (church reverb, cleanroom hum, gallery silence) once audio assets exist.
- [ ] **`other` target type visual polish** — Targets typed as `other` (mosaic-table, gold-bar, parquet-floor, etc.) render as generic boxes via `InteractiveObjectTarget`. These could benefit from more distinct geometry or materials per `material` field.

## Tier 3 — Future features

- [ ] **Insurance Adjuster** — Post-shot interstitial: NPC debate between player's score and a fictional adjuster. See `INSURANCE_ADJUSTER.md`.
- [ ] **Provenance Roulette** — Forgery reveal mechanic: after certain targets are hit, a secondary roll determines authenticity, modifying final damage.
- [ ] **Curator's Revenge** — Timed escalating events after shot (guards, lockdowns, media) presented as UI flashes.
- [ ] **Photo mode** — Freeze frame on hit; allow screenshot with HUD hidden.
- [ ] **Replay system** — Store shot trajectory + result; allow replay view from multiple camera angles.
- [ ] **Desktop packaging** — Tauri shell is configured (`src-tauri/`); no installer generation or signing workflow yet.
- [ ] **Multiplayer Auction mode** — Design doc only; no implementation started.
