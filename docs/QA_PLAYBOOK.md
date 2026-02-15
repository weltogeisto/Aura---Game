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

## CI profiles

Run from `aura-game/`.

- **Fast profile** (developer feedback loop):
  - `pnpm run ci:fast`
  - Includes lint, typecheck, core tests, and scenario integrity checks.
- **Full profile** (release gate):
  - `pnpm run ci:full`
  - Includes fast checks plus full tests and offline asset checks.

## Test matrix

- **Contract tests**
  - Scenario data shape.
  - Required scoring and critic pools.
- **Integration-like tests**
  - Store + shot resolution behavior.
  - Single-shot lock and reset paths.
  - Special effect and critic output propagation.
  - Critic output determinism.
- **Static checks**
  - Scenario key/id consistency.
  - Asset/path references in scenario data.

## Definition of done

A task affecting gameplay/content is done when:

1. Relevant automated checks are green.
2. Failures are either fixed or explicitly documented as non-blocking (prototype only).
3. New scenario/content additions include contract-safe fields and valid references.
