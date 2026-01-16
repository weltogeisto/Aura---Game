# AURA OF THE 21ST CENTURY

*"One Shot"*

A satirical destruction game exploring value, art, and absurdity through precision ballistics.

---

## Concept

One bullet. Nine iconic interiors. Infinite philosophical implications.

The player has a single pistol-caliber shot to inflict maximum "cultural damage" in spaces ranging from the Louvre to the Federal Reserve. The game interrogates what we value and why—blending dark humor, Dadaist philosophy, and challenging ballistics puzzles.

---

## Tech Stack

```
React 18 + TypeScript + Vite
├── Three.js (@react-three/fiber)
├── Tailwind CSS + shadcn/ui
├── Zustand (state)
└── Howler.js (audio)
```

---

## Quick Start

```bash
# 1. Initialize project
cd web_build
bash scripts/init-artifact.sh aura-game
cd aura-game

# 2. Add Three.js
pnpm install three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm install -D @types/three
pnpm install zustand howler

# 3. Development
pnpm dev

# 4. Bundle
bash ../scripts/bundle-artifact.sh
```

---

## The Nine Scenarios

1. **The Louvre** — Salle des États (Paris)
2. **St. Peter's Basilica** (Vatican City)
3. **Topkapi Palace** — Imperial Treasury (Istanbul)
4. **The Forbidden City** — Hall of Supreme Harmony (Beijing)
5. **TSMC Clean Room** — Fab 18 (Tainan)
6. **The Hermitage** — Peacock Clock Room (St. Petersburg)
7. **Federal Reserve Gold Vault** (New York)
8. **MoMA** — Contemporary Gallery (New York)
9. **The Borges Library** — Canon Room (Impossible)

---

## Core Mechanics

- **Value Mesh:** 16-bit grayscale overlay maps destruction value per pixel
- **Ballistics Engine:** Realistic drop, wind, breath sway, ricochet, refraction
- **Dual Easter Eggs:** Each scenario contains one Dadaist and one Systemic hidden target
- **The Critic:** Post-shot voiceover evaluates your choice

---

## Project Structure

```
Aura_of_the_21st_Century/
├── README.md
├── docs/
│   ├── GAME_DESIGN_DOCUMENT.md
│   ├── BORGES_LIBRARY_BOOKS.md
│   ├── EASTER_EGGS.md
│   └── CRITICS_REVIEWS.md
├── scenarios/
│   └── [01-09]_*.md
├── claude_skills/
│   ├── SKILL.md                    # Skill index
│   └── skills/
│       ├── PROJECT_CONTEXT.md      # Design philosophy
│       ├── SCENARIO_DESIGN.md      # Level creation
│       ├── CRITIC_VOICE.md         # Writing guide
│       ├── EASTER_EGG_DESIGN.md    # Hidden targets
│       ├── BORGES_LIBRARY.md       # Book list rules
│       ├── TECHNICAL_SYSTEMS.md    # Value/ballistics
│       ├── THREE_JS_GAME.md        # Three.js guide
│       ├── WEB_BUILD.md            # Build system
│       └── FRONTEND_DESIGN.md      # UI/UX
├── web_build/
│   ├── README.md
│   └── scripts/
│       ├── init-artifact.sh
│       ├── bundle-artifact.sh
│       └── shadcn-components.tar.gz
└── assets/
    └── (visual references)
```

---

## Key Design Principles

1. **Value is constructed** — The game exposes how cultural worth is assigned, not discovered
2. **Destruction reveals** — Each shot exposes something about the target's nature
3. **The hidden beats the obvious** — Easter eggs often outvalue primary targets
4. **Respect the canon** — Kant and Hegel are treated with proper philosophical weight
5. **Stirner is the key** — The hidden book explains why the entire game is meaningless

---

## The Stirner Paradox

> *Radical individualism, in its authentic form, is the one thing that cannot be commodified. The Ego resists capture.*

> *But in its perverted form, Stirner's insight becomes the engine of hyper-capitalism: algorithms mining ever-deeper "Goldadern des Begehrens"—veins of gold in human desire.*

---

## Status

| Component | Status |
|-----------|--------|
| Design Documentation | ✓ Complete |
| Scenario Specs | ✓ Complete |
| Easter Egg Design | ✓ Complete |
| Critic's Scripts | ✓ Complete |
| Claude Skills | ✓ Complete |
| Build Scripts | ✓ Complete |
| Technical Implementation | In Progress |
| Art Direction | Pending |
| Sound Design | Pending |

---

## Claude Skills

This project includes Claude-optimized skills in `claude_skills/`. When working with Claude on this project, reference these files for consistent design and implementation.

---

*"The Aura of the 21st Century is not in the object. It is in the algorithm that predicts your desire to destroy it."*
