# Release Artifact Staging

This folder reserves a stable structure for desktop packaging inputs without changing the current web flow.

## Convention

- `release/web/current/` → latest build handoff for wrapper tooling.
- `release/web/v<version>/` → immutable snapshot for a specific app version.

Both folders are produced by:

```bash
cd aura-game
pnpm run build:canonical
```

Expected contents:

- `dist/` (Vite production output)
- `bundle.html` (single-file artifact, when generated)

## Desktop beta packaging

Tauri is configured to bundle the app from `release/web/current/dist` so desktop packaging always follows the canonical web build flow.

See `docs/desktop-release.md` for platform-specific packaging commands, signing placeholders, and packaged-mode smoke checks.

## Release branch gate

For `release/*` branches, `pnpm run ci:full` is a hard gate for both merge and release promotion. If it fails, the branch is not releasable.
