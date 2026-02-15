# Value Mesh Scoring

## Asset format
- Each target can define `valueMesh: number[][]`.
- `valueMesh` is sampled as a normalized UV grid (`u,v` in `[0,1]`).
- Rows are top-to-bottom in texture space after V-flip (`v=1` maps to row 0).
- If `valueMesh` is missing, scoring falls back to the target's scalar `value`.

## UV mapping assumptions
- Impact UV comes from triangle intersection (`Raycaster` UV output).
- UV is clamped to `[0,1]` before indexing.
- Grid lookup:
  - `x = floor(clamp(u) * width)`
  - `y = floor((1 - clamp(v)) * height)`
  - index is clamped to valid array bounds.

## Fallback behavior
Fallback value is used when:
1. Impact has no UV,
2. Mesh grid is missing or empty,
3. Sampled cell is not a valid number.

## Scoring equation
Final impact score is deterministic and integer-rounded:

`score = round(sampledValue * zoneMultiplier * criticalModifier)`

Where:
- `sampledValue` comes from `valueMesh` (or fallback scalar value),
- `zoneMultiplier` defaults to `1`,
- `criticalModifier` defaults to `1`.

## Determinism rules
- Shot sway is seed-driven (Mulberry32 PRNG).
- Seed derives from scenario id + normalized crosshair coordinates.
- Ballistic simulation uses fixed timestep integration and deterministic gravity.
- Same seed + same inputs + same scene geometry => same impact and score.
