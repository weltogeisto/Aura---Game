# QA Playbook: Prototype → Ship-Ready

This project follows a **vibecode** flow: move fast to validate gameplay ideas, then iterate hard until quality is release-grade.

## Quality gates

### Prototype quality (speed-first)
Use this level while exploring mechanics and content.

- Core loop is playable end-to-end without blockers.
- Major UX regressions are acceptable if they are known and tracked.
- Data contracts are validated so new content cannot silently break runtime behavior.
- CI requirement: `ci:fast` must pass.

### Ship-ready quality (release confidence)
Use this level before tagging a release candidate.

- All critical gameplay paths are deterministic where expected (scoring/critic output).
- Store state transitions (fire lock, replay, full reset) are verified.
- Asset/scenario references are checked for broken links.
- Offline asset constraints are verified.
- CI requirement: `ci:full` must pass.

## Release-blocking defect classes (hard stop)

A release candidate is blocked if any of these classes are detected:

| Defect class | Definition | CI gate(s) |
| --- | --- | --- |
| Crash / boot failure | App does not start, runtime exception kills game loop, or packaged shell cannot enter core flow. | `pnpm run ci:full` (build + tests), `pnpm run smoke:packaged` |
| Score error | `totalScore`, damage breakdown, or deterministic score-critical paths diverge from expected contract. | `pnpm run ci:full` (full tests incl. shot/store integration) |
| Wrong scenario status | Locked/prototype scenario becomes playable through state regression, or scenario-select order/lock behavior regresses. | `pnpm run ci:full` (scenario-select + run-state tests) |
| Asset miss | Missing panorama/static asset or invalid offline references break runtime content loading. | `pnpm run ci:full` (`assets:check` + `scenarios:check`) |

## CI profiles

Run from `aura-game/`.

- **Fast profile** (developer feedback loop):
  - `pnpm run ci:fast`
  - Includes lint, typecheck, core tests, and scenario integrity checks.
- **Full profile** (release gate):
  - `pnpm run ci:full`
  - Includes fast checks plus full tests and offline asset checks.

## Release branch policy

- `release/*` branches have one hard quality bar: **`ci:full` must be green before merge and before any release tag/candidate promotion**.
- Failed `ci:full` runs are release-blocking by default; no exception path without explicit maintainer sign-off documented in release notes.

## Test matrix

- **Contract tests**
  - Scenario data shape.
  - Required scoring and critic pools.
- **Integration-like tests**
  - Store + shot resolution behavior.
  - Scenario lock behavior and run start constraints.
  - Single-shot lock and reset/replay paths.
  - Special effect and critic output propagation.
  - Critic output determinism.
- **Static checks**
  - Scenario key/id consistency.
  - Asset/path references in scenario data.
  - Content quality checks (required fields, critic pool size, forbidden placeholders).

## Definition of done

A task affecting gameplay/content is done when:

1. Relevant automated checks are green.
2. Failures are either fixed or explicitly documented as non-blocking (prototype only).
3. New scenario/content additions include contract-safe fields and valid references.
