# Agentic Loop Harness (Long-Duration)

A lightweight operational harness for long-running coding loops where speed matters but quality must compound over time.

## Why this helps

This harness creates structure around rapid iteration:

- **Momentum without chaos** via a loop-by-loop brief (`iterations/iteration-XXX.md`)
- **Quality gates that do not regress** across long sessions
- **State persistence** (`state.json`) so context survives fatigue/context-window resets
- **Simple metrics** (`metrics.csv`) to detect when you are spinning instead of shipping

## Quick start

```bash
cd aura-game
node scripts/agent-loop-harness.mjs init \
  --objective "Ship scenario-select UX + reliability improvements" \
  --backlog "Critical: fix mobile clipping|Refactor state transitions|Test one-shot lock" \
  --constraints "Keep release build stable|No new runtime dependencies"

node scripts/agent-loop-harness.mjs next
# Execute the generated loop brief

node scripts/agent-loop-harness.mjs log \
  --momentum 8 --quality 7 --risk 3 --confidence 8 \
  --done "Critical: fix mobile clipping" \
  --add-backlog "Ship copy polish for failure states"

node scripts/agent-loop-harness.mjs status
```

## Recommended operating rhythm

1. **Init once per mission** with a concrete user-visible objective.
2. **Run `next` before every coding burst** to generate a fresh, bounded loop brief.
3. **At loop end, run `log`** with objective scoring and backlog mutations.
4. **Check `status` every 2-3 loops** to detect drift, blockers, or quality decay.
5. **Re-init** when objective materially changes (new epic, architecture pivot, release mode).

## Scoring model (practical defaults)

- `momentum` (0-10): How much user-visible progress shipped this loop?
- `quality` (0-10): Did architecture/UI/copy/test posture improve or degrade?
- `risk` (0-10): How much unresolved risk did the loop introduce?
- `confidence` (0-10): How confident are you this loop is merge-safe?

If momentum falls for 3 loops in a row, split backlog items into smaller, demoable slices.

## Files generated

- `.agent-loop/<run-id>/state.json` — objective, backlog, gates, loop counters
- `.agent-loop/<run-id>/iterations/iteration-XXX.md` — actionable per-loop brief template
- `.agent-loop/<run-id>/metrics.csv` — loop telemetry for trend checks
- `.agent-loop/<run-id>/README.md` — run summary

## Design notes

- No external services required.
- No package installs required.
- Keeps defaults opinionated but fully overridable (quality gates, constraints, loop count).
- Works across web/app/automation/research projects.
