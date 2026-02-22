# Release Runbook (Reproducible)

This runbook is the executable checklist for shipping Aura desktop/web artifacts in a reproducible way.

## 0) Preconditions

- Release version already set in `aura-game/package.json`.
- Git tag follows `v${version}` convention.
- Node + pnpm installed.
- For macOS desktop signing: required CI secrets/variables configured (see `docs/desktop-release.md`).

## 1) Build canonical web artifacts

From `aura-game/`:

```bash
pnpm install --frozen-lockfile
pnpm run build:canonical
```

Expected output:

- `release/web/v0.3.0-beta.1/dist`
- `release/web/v0.3.0-beta.1/bundle.html` (optional)
- `release/web/current/dist`
- `release/web/current/checksums.sha256`

## 2) Validate artifacts + smoke

```bash
pnpm run release:artifacts:validate
pnpm run smoke:packaged
```

This gates:

- staged structure and file existence
- checksum integrity
- critical user journey strings (`scenario-select`, `aiming`, `shooting`, `results`)
- offline-asset guard compilation

## 3) Build desktop installer(s)

```bash
pnpm run desktop:bundle:beta:macos
# or
pnpm run desktop:bundle:beta:windows
pnpm run desktop:bundle:beta:linux
```

Output appears under `aura-game/src-tauri/target/`.

## 4) CI release flow

- Push release tag: `git tag vX.Y.Z[-channel.N] && git push origin vX.Y.Z[-channel.N]`
- GitHub Action `.github/workflows/release-desktop.yml` performs:
  - version/tag check
  - canonical build
  - artifact validation + smoke
  - macOS signing + notarized desktop bundle build
  - artifact upload

## 5) Post-build installer checks

- Install generated package on a clean test machine.
- Verify first-launch startup and one end-to-end shot.
- Confirm results screen renders and app runs offline.
- Preserve installer checksum from CI artifact set for release notes.

## 6) Rollback plan

If release candidate fails validation or post-install checks:

1. Stop rollout (do not publish installer links).
2. Re-point distribution channel to previous known-good release artifacts.
3. Re-tag fixed version (never reuse old tag):
   - bad: `v0.3.0-beta.1`
   - fix: `v0.3.0-beta.2`
4. Re-run full flow (build -> validate -> smoke -> installer).

## 7) Minimal audit trail to keep

- Release tag and commit SHA
- `release/web/current/checksums.sha256`
- CI run URL
- Installer filenames and SHA-256 checksums
- Rollback decision notes (if any)
