# Desktop Beta Packaging & Signing Guide

This guide documents the **beta desktop release flow** (Tauri wrapper + canonical web artifacts).

## Versioning & Release Tag Convention

- `aura-game/package.json` is the canonical product version (`MAJOR.MINOR.PATCH[-channel.N]`), currently `0.2.0-beta.1`.
- Every release must be tagged as `v${package.json version}` (example: `v0.2.0-beta.1`).
- Allowed prerelease channels: `alpha`, `beta`, `rc`.

From `aura-game/`:

```bash
pnpm run release:tag:check v0.2.0-beta.1
```

## Canonical Build Input (single source of truth)

From `aura-game/`:

```bash
pnpm run build:canonical
```

This must produce and stage:

- `release/web/current/dist` (authoritative output from Vite build)
- `release/web/current/bundle.html` (optional artifact generated from that Vite output)
- `release/web/current/checksums.sha256` (SHA-256 for all staged release files)

Tauri is configured to load only `release/web/current/dist`, so packaging always follows canonical web output.

Canonical build tooling (`html-inline`) is declared in `aura-game/package.json` and must be installed before build execution. Build scripts do not install or modify dependencies at runtime, so canonical packaging is reproducible offline after install.

## Beta Packaging Commands

From `aura-game/`:

```bash
pnpm run desktop:bundle:beta
# => pnpm run assets:check && pnpm tauri build
```

Platform-specific targets:

```bash
pnpm run desktop:bundle:beta:linux
# => pnpm run assets:check && pnpm tauri build --target x86_64-unknown-linux-gnu
pnpm run desktop:bundle:beta:windows
# => pnpm run assets:check && pnpm tauri build --target x86_64-pc-windows-msvc
pnpm run desktop:bundle:beta:macos
# => pnpm run assets:check && pnpm tauri build --target universal-apple-darwin
```

All bundle commands run `assets:check` first to keep offline assets as a hard gate before packaging.


## Asset Budget (Desktop Beta)

Hard budget for ship-ready offline bundles:

- **Panorama resolution**: one equirectangular source per scenario, target `4096x2048` (fallback `2048x1024` only for low-tier machines).
- **Panorama compression**: prefer `webp` (quality 80-88) for photo assets; `svg` only for stylized/vector panoramas.
- **Panorama size budget**: `<= 1.8 MB` per scenario (`<= 16 MB` for all active scenarios combined in package).
- **Ambient audio**: loop stems in `wav` during production; release as `ogg`/`mp3` where artifact quality is acceptable. Current beta uses offline-embedded ambient clips (no binary asset files in repo).
- **Audio size budget**: ambient `<= 450 KB` per loop, impact/UI `<= 120 KB` per file, total audio payload `<= 8 MB`.
- **Load-time budget**: first playable frame in packaged desktop build should stay under **2.5s** on baseline target hardware (cold start), with all scenario references resolved locally.

If a new asset exceeds budget, either downscale/recompress it or explicitly document why the exception is accepted for the release.

## Smoke Checklist (packaged mode)

After canonical build (and ideally after bundle generation), run:

```bash
pnpm run smoke:packaged
# => node scripts/smoke-packaged-mode.mjs
```

The smoke script verifies:

1. App boot entry (`index.html` + compiled script)
2. Critical user path states are compiled (`scenario-select` → `aiming` → `shooting` → `results`)
3. Critical shot CTA copy is bundled
4. Missing-asset guard string is compiled (`Asset path must resolve offline`)
5. Referenced static assets resolve and assets directory is non-empty

## Release Artifact Validation (CI Gate)

From `aura-game/`:

```bash
pnpm run release:artifacts:validate
```

Validation checks:

- expected release structure under `release/web/current`
- `index.html` refs resolve to real staged files
- checksum manifest (`checksums.sha256`) matches staged artifact contents
- key phase strings exist in the production JS bundle

## Docs ↔ package.json Consistency Check

From `aura-game/`:

```bash
pnpm run docs:check:desktop-release-scripts
```

This check fails if any script referenced as `pnpm run ...` in this document is missing from `aura-game/package.json`.


## Manual QA Protocol (Release Candidate)

For every RC (`rc-*` or equivalent), run this lightweight manual pass on desktop packaging output:

1. **Boot + Navigation**
   - Launch packaged app and confirm start menu, scenario select, and first playable scenario can be entered.
   - Verify locked/prototype scenarios stay non-interactive.
2. **Single-shot core loop**
   - Fire one shot, validate transition `aiming -> shooting -> results`.
   - Use replay/reset actions and confirm state returns to `aiming` with ammo restored and no stale critic output.
3. **Determinism spot-check**
   - Repeat same shot setup (same scenario + same visual aim alignment) and verify critic/score output remains stable.
4. **Desktop-specific display checks**
   - Validate UI readability at 100%, 125%, and 150% OS scale (DPI).
   - Resize window through minimum/medium/fullscreen and verify no critical overlap/clipping for HUD and results screen.
5. **Offline + asset confidence**
   - Run with network disabled (or blocked) and verify boot + scenario load still works.

Record pass/fail plus issue links in the RC note before promotion.

## Signing Placeholders

### Required GitHub Secrets

- `APPLE_CERTIFICATE_P12_BASE64` (Developer ID Application cert in base64)
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_SIGNING_IDENTITY` (example: `Developer ID Application: Team Name (TEAMID)`)
- `APPLE_TEAM_ID`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `KEYCHAIN_PASSWORD` (temporary CI keychain password)

### Required GitHub Variables

- `APPLE_SIGNING_ENABLED=true`

### Pipeline Behavior

On tags matching `v*`:

1. tag/version consistency is validated (`pnpm run release:tag:check`)
2. canonical artifacts are built and validated
3. macOS keychain + certificate import runs in CI
4. Tauri build runs for `universal-apple-darwin` with signing + notarization env vars
5. generated DMG/app bundles are uploaded as workflow artifacts

## Offline Runtime Policy

Desktop beta builds must remain fully offline at runtime:

- No CDN dependencies for panorama/audio/UI assets
- No remote fetches required for boot or gameplay
- `scripts/check-offline-assets.mjs` must stay green before packaging
