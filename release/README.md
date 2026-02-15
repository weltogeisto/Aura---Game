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
