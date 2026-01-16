# Three.js Game Development Skill

## Overview

Guide for building the "Aura of the 21st Century" game using React + Three.js.

## Tech Stack

```
React 18 + TypeScript
├── Three.js (3D rendering)
│   ├── @react-three/fiber (React bindings)
│   ├── @react-three/drei (helpers)
│   └── @react-three/postprocessing (effects)
├── Tailwind CSS (UI styling)
├── Zustand (state management)
└── Howler.js (audio)
```

## Installation

After running `init-artifact.sh`, add Three.js dependencies:

```bash
pnpm install three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm install -D @types/three
pnpm install zustand howler
pnpm install -D @types/howler
```

## Project Structure

```
src/
├── App.tsx                 # Main app with routing
├── components/
│   ├── game/
│   │   ├── Scene.tsx       # Three.js canvas wrapper
│   │   ├── Crosshair.tsx   # Aiming reticle with breath sway
│   │   ├── Panorama.tsx    # 360° environment
│   │   ├── Target.tsx      # Clickable value targets
│   │   ├── Bullet.tsx      # Bullet trajectory animation
│   │   └── ValueMesh.tsx   # Damage calculation overlay
│   ├── ui/
│   │   ├── ScoreDisplay.tsx    # Sotheby's style receipt
│   │   ├── CriticReview.tsx    # Post-shot voiceover
│   │   └── ScenarioSelect.tsx  # Level selection
│   └── effects/
│       ├── BulletTime.tsx      # Slow-mo effect
│       └── DamageBloom.tsx     # Value cascade animation
├── hooks/
│   ├── useBreathSway.ts    # Crosshair movement
│   ├── useBallistics.ts    # Bullet physics
│   └── useGameState.ts     # Zustand store
├── data/
│   ├── scenarios/          # JSON configs per level
│   ├── targets/            # Value mesh definitions
│   └── reviews/            # Critic dialogue
└── assets/
    ├── textures/           # Panorama images
    ├── audio/              # Sounds + voiceover
    └── fonts/              # Typography
```

## Core Components

### Scene Setup

```tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'

function GameScene() {
  return (
    <Canvas camera={{ fov: 75, position: [0, 0, 0] }}>
      <Environment files="/panorama.hdr" background />
      <Targets />
      <Crosshair />
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.3}
      />
    </Canvas>
  )
}
```

### Breath Sway Hook

```tsx
import { useFrame } from '@react-three/fiber'
import { useState, useRef } from 'react'

export function useBreathSway() {
  const time = useRef(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  
  useFrame((_, delta) => {
    time.current += delta
    // Breath cycle: ~4 seconds
    const breathPhase = (time.current % 4) / 4
    const sway = Math.sin(breathPhase * Math.PI * 2) * 0.02
    const pulse = Math.sin(time.current * 8) * 0.005 // Heartbeat
    
    setOffset({
      x: sway + pulse,
      y: Math.cos(breathPhase * Math.PI * 2) * 0.015
    })
  })
  
  return offset
}
```

### Ballistics System

```tsx
interface BulletParams {
  origin: Vector3
  direction: Vector3
  velocity: number      // m/s (9mm: ~375, .45: ~260)
  mass: number          // grams
}

interface BallisticResult {
  trajectory: Vector3[]
  impactPoint: Vector3
  impactVelocity: number
  penetrationDepth: number
}

export function calculateTrajectory(params: BulletParams): BallisticResult {
  const gravity = 9.81
  const airResistance = 0.01
  const dt = 0.001 // Time step (1ms)
  
  const trajectory: Vector3[] = []
  let pos = params.origin.clone()
  let vel = params.direction.clone().multiplyScalar(params.velocity)
  
  for (let t = 0; t < 2; t += dt) { // Max 2 seconds
    // Apply gravity
    vel.y -= gravity * dt
    
    // Apply air resistance
    vel.multiplyScalar(1 - airResistance * dt)
    
    // Update position
    pos.add(vel.clone().multiplyScalar(dt))
    trajectory.push(pos.clone())
    
    // Check for collision...
  }
  
  return { trajectory, impactPoint: pos, ... }
}
```

### Value Mesh System

```tsx
interface ValueCell {
  position: Vector2       // UV coordinates
  value: number          // €0 - €∞
  material: MaterialType // canvas, bronze, glass, etc.
  damaged: boolean
}

interface ValueMesh {
  width: number
  height: number
  cells: ValueCell[][]
  totalValue: number
}

// Calculate damage from impact
function calculateDamage(
  mesh: ValueMesh, 
  impactUV: Vector2, 
  material: MaterialType
): number {
  const spreadRadius = getMaterialSpread(material)
  let totalDamage = 0
  
  for (let dx = -spreadRadius; dx <= spreadRadius; dx++) {
    for (let dy = -spreadRadius; dy <= spreadRadius; dy++) {
      const cell = mesh.cells[impactUV.x + dx]?.[impactUV.y + dy]
      if (cell && !cell.damaged) {
        const distance = Math.sqrt(dx*dx + dy*dy)
        const falloff = 1 - (distance / spreadRadius)
        totalDamage += cell.value * falloff
        cell.damaged = true
      }
    }
  }
  
  return totalDamage
}
```

## Material Properties

```tsx
const MATERIALS = {
  canvas: {
    penetration: 1.0,      // Full pass-through
    spread: 3,             // Radial tear cells
    sound: 'rip'
  },
  bronze: {
    penetration: 0.0,      // Surface dent only
    spread: 1,
    sound: 'ping'
  },
  glass: {
    penetration: 0.8,
    spread: 5,             // Shatter pattern
    sound: 'crash'
  },
  wood: {
    penetration: 0.5,
    spread: 2,
    sound: 'crack'
  },
  gold: {
    penetration: 0.0,      // Bullet embeds
    spread: 0,
    sound: 'thud'
  }
}
```

## State Management (Zustand)

```tsx
import { create } from 'zustand'

interface GameState {
  // Current game state
  currentScenario: string | null
  hasShot: boolean
  bulletTrajectory: Vector3[] | null
  
  // Scoring
  damageTotal: number
  hitTargets: string[]
  easterEggTriggered: string | null
  
  // Actions
  setScenario: (id: string) => void
  fireShot: (direction: Vector3) => void
  calculateScore: () => void
  reset: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScenario: null,
  hasShot: false,
  bulletTrajectory: null,
  damageTotal: 0,
  hitTargets: [],
  easterEggTriggered: null,
  
  setScenario: (id) => set({ currentScenario: id, hasShot: false }),
  
  fireShot: (direction) => {
    if (get().hasShot) return
    const trajectory = calculateTrajectory({ direction, ... })
    set({ hasShot: true, bulletTrajectory: trajectory })
  },
  
  // ...
}))
```

## Audio Integration

```tsx
import { Howl } from 'howler'

const sounds = {
  shot: new Howl({ src: ['/audio/shot.mp3'] }),
  impact: {
    canvas: new Howl({ src: ['/audio/rip.mp3'] }),
    bronze: new Howl({ src: ['/audio/ping.mp3'] }),
    glass: new Howl({ src: ['/audio/crash.mp3'] }),
  },
  critic: new Howl({ src: ['/audio/critic.mp3'], sprite: { ... } })
}
```

## Post-Processing Effects

```tsx
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

function Effects() {
  return (
    <EffectComposer>
      <Bloom intensity={0.5} luminanceThreshold={0.9} />
      <Vignette darkness={0.5} />
    </EffectComposer>
  )
}
```

## Performance Tips

1. **Use instancing** for repeated objects (books in Borges Library)
2. **Texture compression** for panoramas (basis/ktx2)
3. **LOD** for complex models
4. **Lazy load** scenarios
5. **Web Workers** for ballistics calculations

## Testing Checklist

- [ ] Breath sway feels natural (not nauseating)
- [ ] Bullet drop is noticeable at distance
- [ ] Glass refraction offset is correct
- [ ] Ricochet angles are plausible
- [ ] Easter egg triggers work
- [ ] Chain reactions cascade properly
- [ ] Score display timing feels dramatic
- [ ] Critic voiceover syncs with action
