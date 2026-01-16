# Technical Systems Skill

## Value Mesh Architecture

### Layer Structure
```
┌────────────────────────────────────────────────┐
│  360° HDR Cube Map (three-wall panoramic view) │
├────────────────────────────────────────────────┤
│  16-bit Grayscale Value Texture               │
│  - #FFFFFF = maximum value                    │
│  - #000000 = zero value                       │
│  - Variable density per object type           │
├────────────────────────────────────────────────┤
│  Destruction Shader Layer                      │
│  - Radial damage propagation                  │
│  - Material-specific spread patterns          │
├────────────────────────────────────────────────┤
│  Systemic Trigger Network                      │
│  - Infrastructure nodes                       │
│  - Chain reaction pathways                    │
└────────────────────────────────────────────────┘
```

### Grid Density Guidelines

| Element Type | Grid Density | Value Distribution |
|--------------|--------------|-------------------|
| Masterpiece painting | 20×30 micro-cells | Equal per cell |
| Sculpture | 3D mapped cells | Higher at faces, hands |
| Architecture | Low density | Minimal unless historic |
| Decorative arts | Medium density | Concentrated at craft points |
| Easter eggs | Single cell | Extreme values |

### Material Properties

| Material | Penetration | Spread Pattern | Sound |
|----------|-------------|----------------|-------|
| Canvas | Full pass-through | Radial tear | Rip |
| Wood | Partial embed | Splinter spray | Crack |
| Bronze | Surface dent | Minimal | Ping |
| Glass | Shatter | Radial fracture | Crash |
| Gold | Full embed | None | Thud |
| Stone/Marble | Chip | Localized | Crack |
| Paper | Full pass-through | Entry/exit holes | Whisper |

## Ballistics Engine

### Core Variables

| Variable | Implementation |
|----------|----------------|
| Gravity | 9mm: ~0.5m drop at 50m / .45 ACP: ~0.8m drop |
| Wind | Indoor: 0-2 m/s from HVAC |
| Breath sway | Sinusoidal pulse, ~1.5 sec period |
| Aim stability | Crosshair aligns in 200-400ms windows |

### Obstacle Physics

**Ricochet:**
- Angle of incidence > 60° from normal = ricochet
- Energy loss: 40-60% per bounce
- Maximum 2 bounces before embed

**Refraction (through glass):**
- Offset calculation based on glass thickness
- Bulletproof glass: no penetration, energy absorbed
- Display glass: penetration with 5-15° deflection

**Penetration:**
- Canvas: 100% pass-through, minimal energy loss
- Wood (thin): 80% pass-through, 30% energy loss
- Wood (thick): embed or deflect
- Metal: surface damage only

### Timing Systems

**Moving Targets:**
- OHT vehicles (TSMC): 3-second crossing patterns
- Rotating displays (Topkapi): 8-second rotation
- Passing figures: random intervals, 2-5 second gaps

**Breath Cycle:**
```
Inhale (0.75s) → Hold (0.3s) → Exhale (0.75s) → Hold (0.2s)
                     ↑
              Optimal shot window
```

## Post-Shot Sequence

### The Appraisal (2-3 seconds)
1. Slow-motion bullet cam
2. Impact visualization
3. Damage bloom spreading across value grid
4. Numbers cascade upward

### Score Display
```
┌─────────────────────────────────┐
│ SOTHEBY'S DAMAGE ASSESSMENT    │
├─────────────────────────────────┤
│ Primary Impact: €XXX,XXX,XXX   │
│ Collateral: €XX,XXX,XXX        │
│ Chain Reaction: €XXX,XXX,XXX   │
├─────────────────────────────────┤
│ TOTAL CULTURAL DAMAGE:         │
│ €X,XXX,XXX,XXX                 │
└─────────────────────────────────┘
```

### The Critic's Review
- Triggered after score display
- 3-5 second voiceover
- Unique to target hit

## Systemic Trigger Implementation

### Trigger Types

| Type | Detection | Activation |
|------|-----------|------------|
| Point trigger | Single-cell hit | Immediate |
| Pressure trigger | Cumulative damage threshold | Delayed |
| Chain trigger | Sequence of hits | Progressive |

### Chain Reaction Timing

```
TRIGGER HIT
    ↓ (0.5s delay)
INITIAL EFFECT (visual)
    ↓ (1-2s propagation)
SECONDARY EFFECTS
    ↓ (cumulative)
FINAL STATE + DAMAGE TALLY
```

## Audio Design Framework

### Per-Scenario Ambient Layers

| Layer | Content |
|-------|---------|
| Base | Room tone, HVAC, electronics |
| Human | Footsteps, murmurs, breathing |
| Mechanical | Clocks, machinery, vehicles |
| Atmospheric | Wind, echoes, resonance |

### Impact Sounds

- Material-specific (see Material Properties table)
- Reverb matched to space size
- Secondary sounds for chain reactions

### Critic Voice
- Dry, close-mic recording
- Minimal reverb (intimate, in-head)
- Slight compression for presence
