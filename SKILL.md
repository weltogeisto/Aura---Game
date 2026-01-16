# Aura of the 21st Century — Claude Skills

## Overview

This directory contains skills for Claude to effectively work on "Aura of the 21st Century," a satirical destruction game built with React + Three.js.

## When to Use These Skills

Read the relevant skill files BEFORE:
- Writing new scenarios or game content
- Implementing Three.js game components
- Building React UI components
- Creating Critic dialogue
- Setting up the build system

## Available Skills

### Game Design

| Skill | File | Use When |
|-------|------|----------|
| Project Context | `skills/PROJECT_CONTEXT.md` | Starting any work on this project |
| Scenario Design | `skills/SCENARIO_DESIGN.md` | Creating or modifying scenarios |
| Critic Voice | `skills/CRITIC_VOICE.md` | Writing any Critic dialogue |
| Easter Egg Design | `skills/EASTER_EGG_DESIGN.md` | Designing hidden targets |
| Borges Library | `skills/BORGES_LIBRARY.md` | Working on Scenario 9 or book list |
| Technical Systems | `skills/TECHNICAL_SYSTEMS.md` | Value Mesh and ballistics |

### Development

| Skill | File | Use When |
|-------|------|----------|
| Three.js Game | `skills/THREE_JS_GAME.md` | Building 3D game components |
| Web Build | `skills/WEB_BUILD.md` | Setting up project, bundling |
| Frontend Design | `skills/FRONTEND_DESIGN.md` | UI/UX, styling, typography |

## Quick Reference: Tech Stack

```
React 18 + TypeScript + Vite
├── Three.js (@react-three/fiber, drei, postprocessing)
├── Tailwind CSS + shadcn/ui
├── Zustand (state management)
└── Howler.js (audio)
```

## Quick Reference: Build Commands

```bash
# Initialize new project
cd web_build
bash scripts/init-artifact.sh aura-game
cd aura-game

# Add Three.js
pnpm install three @react-three/fiber @react-three/drei
pnpm install -D @types/three
pnpm install zustand howler

# Development
pnpm dev

# Bundle for distribution
bash ../scripts/bundle-artifact.sh
```

## Quick Reference: The Five Principles

1. **Value is constructed** — Cultural worth is assigned, not discovered
2. **Destruction reveals** — Each shot exposes something about the target
3. **The hidden beats the obvious** — Easter eggs outvalue primary targets
4. **Respect the canon** — Kant and Hegel treated with proper weight
5. **Stirner is the key** — The hidden book explains the game's meaninglessness

## Quick Reference: The Stirner Paradox

> *Radical individualism cannot be commodified. But perverted, it becomes hyper-capitalism: algorithms mining "Goldadern des Begehrens."*

## File Structure

```
aura_of_the_21st_century/
├── README.md
├── docs/                    # Game design documents
├── scenarios/               # Level specifications
├── assets/                  # Visual references
├── claude_skills/           # ← You are here
│   ├── SKILL.md
│   └── skills/
│       ├── PROJECT_CONTEXT.md
│       ├── SCENARIO_DESIGN.md
│       ├── CRITIC_VOICE.md
│       ├── EASTER_EGG_DESIGN.md
│       ├── BORGES_LIBRARY.md
│       ├── TECHNICAL_SYSTEMS.md
│       ├── THREE_JS_GAME.md     # NEW
│       ├── WEB_BUILD.md         # NEW
│       └── FRONTEND_DESIGN.md   # NEW
└── web_build/               # Build scripts
    └── scripts/
        ├── init-artifact.sh
        ├── bundle-artifact.sh
        └── shadcn-components.tar.gz
```

## Common Tasks

### Starting a New Build
1. Read `WEB_BUILD.md`
2. Run init script
3. Add Three.js dependencies
4. Read `THREE_JS_GAME.md` for component structure

### Building a Scenario Component
1. Read `SCENARIO_DESIGN.md` for data structure
2. Read `THREE_JS_GAME.md` for implementation
3. Read `FRONTEND_DESIGN.md` for UI elements

### Writing Critic Lines
1. Read `CRITIC_VOICE.md`
2. Keep under 30 words
3. End on observation, not reaction

### Creating UI Components
1. Read `FRONTEND_DESIGN.md` for aesthetics
2. Use shadcn/ui components as base
3. Follow typography and color guidelines

## Do Not

- Mock canonical philosophers
- Explain the jokes  
- Make the Critic enthusiastic or moralistic
- Let primary targets exceed easter egg values
- Use generic "AI slop" aesthetics (purple gradients, Inter font)
- Add living authors to Borges Library
- Change Stirner's €∞ value or hidden location
