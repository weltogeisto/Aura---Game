# Desktop Beta Packaging & Signing Guide

This guide documents the **beta desktop release flow** (Tauri wrapper + canonical web artifacts).

## Canonical Build Input (single source of truth)

From `aura-game/`:

```bash
pnpm run build:canonical
```

This must produce and stage:

- `release/web/current/dist` (authoritative output from Vite build)
- `release/web/current/bundle.html` (optional artifact generated from that Vite output)

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
2. Scene-load entry phase is present (`scenario-select`)
3. Shot-flow phases are present (`aiming`, `shooting`)
4. Missing-asset guard string is compiled (`Asset path must resolve offline`)
5. Compiled static assets directory exists


## Docs ↔ package.json Consistency Check

From `aura-game/`:

```bash
pnpm run docs:check:desktop-release-scripts
```

This check fails if any script referenced as `pnpm run ...` in this document is missing from `aura-game/package.json`.

## Signing Placeholders

> Fill these before public distribution.

### macOS

- [ ] `APPLE_TEAM_ID=...`
- [ ] `APPLE_ID=...`
- [ ] `APPLE_APP_SPECIFIC_PASSWORD=...`
- [ ] `APPLE_SIGNING_IDENTITY=Developer ID Application: ...`
- [ ] Notarization pipeline wired in CI

### Windows

- [ ] `WINDOWS_CERTIFICATE_THUMBPRINT=...`
- [ ] `WINDOWS_CERTIFICATE_PATH=...`
- [ ] `WINDOWS_CERTIFICATE_PASSWORD=...`
- [ ] Timestamp server configured

### Linux (optional for beta)

- [ ] Package signing key configured (if distributing signed packages)
- [ ] Repository metadata signing process defined

## Offline Runtime Policy

Desktop beta builds must remain fully offline at runtime:

- No CDN dependencies for panorama/audio/UI assets
- No remote fetches required for boot or gameplay
- `scripts/check-offline-assets.mjs` must stay green before packaging
