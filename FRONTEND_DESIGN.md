# Frontend Design Skill — Aura of the 21st Century

## Visual Identity

### Core Aesthetic

**Hyperreal photography meets surrealist UI.**

The game world is photorealistic (panoramas of real spaces), but the interface elements are deliberately artificial, almost clinical — like museum labels that have become self-aware.

### Mood Board

| Element | Reference |
|---------|-----------|
| World | High-resolution museum photography |
| UI | Sotheby's auction catalogs, insurance forms |
| Typography | Institutional signage, gallery labels |
| Effects | Magritte-style floating frames, Dalí melting |
| Humor | Deadpan, bureaucratic, absurdist |

## Typography

### Primary Fonts

```css
/* Display — for titles, damage numbers */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');

/* Body — for critic text, descriptions */
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap');

/* Mono — for values, technical readouts */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap');
```

### Usage

| Context | Font | Weight |
|---------|------|--------|
| Scenario titles | Playfair Display | 700 |
| Damage values | IBM Plex Mono | 500 |
| Critic reviews | EB Garamond | 400 italic |
| UI labels | IBM Plex Mono | 400 |
| Easter egg reveals | Playfair Display | 400 italic |

## Color Palette

### Light Theme (Default)

```css
:root {
  /* Backgrounds */
  --bg-primary: #FDFBF7;      /* Warm museum white */
  --bg-secondary: #F5F0E6;    /* Parchment */
  --bg-overlay: rgba(0,0,0,0.85);
  
  /* Text */
  --text-primary: #1A1A1A;
  --text-secondary: #666666;
  --text-muted: #999999;
  
  /* Accent */
  --accent-gold: #C9A227;     /* Sotheby's gold */
  --accent-red: #8B0000;      /* Damage indicator */
  --accent-green: #2E5A3C;    /* Easter egg success */
  
  /* Borders */
  --border-light: #E5DFD3;
  --border-dark: #1A1A1A;
}
```

### Dark Theme (Post-Shot)

```css
.dark {
  --bg-primary: #0A0A0A;
  --bg-secondary: #1A1A1A;
  --text-primary: #F5F0E6;
  --text-secondary: #999999;
  --accent-gold: #D4AF37;
}
```

## UI Components

### Score Display (Sotheby's Receipt)

```
┌─────────────────────────────────────────┐
│                                         │
│   S O T H E B Y ' S                     │
│   DAMAGE ASSESSMENT                     │
│   ─────────────────────────────────     │
│                                         │
│   LOT 1: Mona Lisa (da Vinci)          │
│   Impact Zone: Smile                    │
│   Material: Oil on poplar              │
│   Condition: Catastrophic              │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   ITEMIZED DAMAGE                       │
│                                         │
│   Oil Paint Loss ........... €50       │
│   Canvas Integrity ......... €200      │
│   Cultural Significance .... €800M     │
│                                         │
│   ─────────────────────────────────     │
│                                         │
│   TOTAL              €800,000,250      │
│                                         │
│   ─────────────────────────────────     │
│   Authenticated by: The Critic         │
│   Date: [Current Date]                 │
│                                         │
└─────────────────────────────────────────┘
```

### Crosshair

```
     │
     │
─────┼─────
     │
     │
```

- Thin white lines, 1px
- Center gap: 10px (increases with breath sway)
- Subtle drop shadow for visibility
- Pulse animation synced to heartbeat

### Critic Review Overlay

```
┌──────────────────────────────────────────────────┐
│                                                  │
│  "The smile. You shot the smile.                │
│   It was already enigmatic.                     │
│   Now it is... absent."                         │
│                                                  │
│                           — The Critic          │
│                                                  │
└──────────────────────────────────────────────────┘
```

- EB Garamond, italic
- Fade in from black
- Typewriter effect for text
- Gold border accent

### Scenario Select Menu

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    SELECT SCENARIO                         │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │          │  │          │  │          │                 │
│  │  LOUVRE  │  │ ST PETER │  │ TOPKAPI  │                 │
│  │  Paris   │  │ Vatican  │  │ Istanbul │                 │
│  │          │  │          │  │          │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ FORBIDDEN│  │   TSMC   │  │ HERMITAGE│                 │
│  │   CITY   │  │  Fab 18  │  │  Clock   │                 │
│  │ Beijing  │  │  Tainan  │  │ St.Pete  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   FED    │  │   MOMA   │  │  BORGES  │                 │
│  │  RESERVE │  │   NYC    │  │ LIBRARY  │                 │
│  │   NYC    │  │          │  │ Infinite │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

- Grid layout
- Thumbnail images (grayscale until hover)
- Hover: full color + slight zoom
- Click: transition wipe to loading

## Animations

### Page Transitions

```css
@keyframes wipe-to-black {
  0% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
```

### Score Cascade

```css
@keyframes cascade-up {
  0% { 
    transform: translateY(20px); 
    opacity: 0; 
  }
  100% { 
    transform: translateY(0); 
    opacity: 1; 
  }
}

.damage-line {
  animation: cascade-up 0.5s ease-out;
  animation-fill-mode: backwards;
}

.damage-line:nth-child(1) { animation-delay: 0.1s; }
.damage-line:nth-child(2) { animation-delay: 0.2s; }
.damage-line:nth-child(3) { animation-delay: 0.3s; }
```

### Bullet Time

```tsx
// Slow motion during bullet travel
const bulletTimeScale = useSpring(1, { 
  stiffness: 50, 
  damping: 20 
})

// Trigger slow-mo
bulletTimeScale.set(0.1)  // 10% speed

// Return to normal after impact
setTimeout(() => bulletTimeScale.set(1), 2000)
```

## Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Full-screen panorama, bottom UI drawer |
| Tablet (768-1024px) | Side panel for score |
| Desktop (>1024px) | Floating UI panels |

## Accessibility

- Crosshair must have sufficient contrast
- Critic text readable at all times
- Keyboard support for shooting (Spacebar)
- Screen reader announces score
- Reduce motion option (disables slow-mo)
- Quality toggle (Low/Medium/High) for weaker GPUs
- Colorblind-safe accents for gold/red/green indicators

## Visual Polish Targets

- **Panorama fidelity:** 8K source, subtle vignette, and calibrated exposure per room.
- **Material readability:** glass/gloss highlights for modern spaces, matte diffusion for stone/plaster.
- **UI depth:** thin drop shadows + 1px borders to float over bright scenes without feeling modern.
- **Impact feedback:** micro-shake on shot, dust motes, and brief bloom on high-value hits.
- **Cinematic pacing:** slow fade-to-black on score reveal, with gold line wipe.

## Adaptable UI & Feature Hooks

- **Theme variants:** “Museum Daylight” and “After Hours” presets with identical layout.
- **Layout slots:** reserve a right-side panel for platform-specific UI (desktop: score; mobile: drawer).
- **Scalable effects:** tie postprocessing intensity to a quality setting (disable bloom/DOF on Low).
- **Feature flags:** enable/disable Easter egg reveals, commentary overlay, or assist mode without UI refactor.
- **Localization-ready:** keep all text in a single dictionary and avoid UI hardcoding.

## Anti-Patterns to Avoid

❌ Purple gradients  
❌ Rounded corners everywhere  
❌ Inter/Roboto fonts  
❌ Generic card shadows  
❌ Centered everything  
❌ Emoji in UI  
❌ "AI slop" aesthetics  

✅ Sharp edges where appropriate  
✅ Institutional typography  
✅ Asymmetric layouts  
✅ Generous negative space  
✅ Deliberate color restraint  
✅ Deadpan humor in copy  
