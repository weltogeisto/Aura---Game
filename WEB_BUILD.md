# Web Build Skill

## Overview

Instructions for building the "Aura of the 21st Century" web game using the included build scripts.

## Canonical Build Entry (Current Repo)

For this repository (already initialized), use:

```bash
cd aura-game
pnpm run build:canonical
```

This runs the offline asset audit, builds the web app, creates `bundle.html`, and stages release-ready artifacts in `release/web/`.

## Prerequisites

- Node.js 18+ 
- pnpm (auto-installed if missing)

## Quick Start

### 1. Initialize Project

```bash
cd web_build
bash scripts/init-artifact.sh aura-game
cd aura-game
```

This creates a React + TypeScript + Vite + Tailwind + shadcn/ui project.

### 2. Add Three.js Dependencies

```bash
pnpm install three @react-three/fiber @react-three/drei @react-three/postprocessing
pnpm install -D @types/three
pnpm install zustand howler
pnpm install -D @types/howler
```

### 3. Development

```bash
pnpm dev
```

Opens at http://localhost:5173

### 4. Bundle for Distribution

```bash
bash ../scripts/bundle-artifact.sh
```

Creates `bundle.html` — a single self-contained file.

## Project Setup After Init

### Directory Structure

After initialization, add game-specific directories:

```
aura-game/
├── src/
│   ├── components/
│   │   ├── game/       # Three.js game components
│   │   ├── ui/         # React UI components  
│   │   └── effects/    # Visual effects
│   ├── hooks/          # Custom React hooks
│   ├── stores/         # Zustand state
│   ├── data/           # Scenario configs
│   └── assets/         # Textures, audio, fonts
├── public/
│   ├── panoramas/      # HDR environment maps
│   └── audio/          # Sound files
└── index.html
```

### Essential Files to Create

1. **src/stores/gameStore.ts** — Zustand game state
2. **src/components/game/Scene.tsx** — Main Three.js canvas
3. **src/components/game/Crosshair.tsx** — Aiming system
4. **src/data/scenarios/*.json** — Level configurations

## shadcn/ui Components Available

Pre-installed and ready to import:

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
```

Full list: accordion, alert, avatar, badge, breadcrumb, button, calendar, card, carousel, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, label, menubar, navigation-menu, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip

## Environment Files

### For Panoramas (HDR/EXR)

Place in `public/panoramas/`:
- louvre.hdr
- st_peters.hdr
- topkapi.hdr
- etc.

Load with drei:
```tsx
import { Environment } from '@react-three/drei'
<Environment files="/panoramas/louvre.hdr" background />
```

### For Equirectangular Images (JPG/PNG)

Alternative for simpler setup:
```tsx
import { useTexture } from '@react-three/drei'

function Panorama({ src }: { src: string }) {
  const texture = useTexture(src)
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}
```

## Build Output

The `bundle-artifact.sh` script produces:

- **bundle.html** — Single file, all JS/CSS inlined
- Works offline
- Can be hosted on GitHub Pages
- Can be shared directly in chat

## Troubleshooting

### Node Version Issues
```bash
node -v  # Must be 18+
nvm use 18  # If using nvm
```

### pnpm Not Found
```bash
npm install -g pnpm
```

### Three.js Type Errors
```bash
pnpm install -D @types/three
```

### Parcel Build Fails
```bash
rm -rf dist .parcel-cache
pnpm exec parcel build index.html --dist-dir dist --no-source-maps
```

## GitHub Pages Deployment

1. Build: `bash scripts/bundle-artifact.sh`
2. Rename: `mv bundle.html index.html`
3. Push to `gh-pages` branch or `/docs` folder
4. Enable Pages in repo settings
