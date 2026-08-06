# Motion System Architecture

**Status**: Foundation Complete ✅  
**Date**: 2026-08-05  
**Phase**: Final Cinematic Polish - Motion Foundation

## Overview

This document describes the reusable motion foundation created for the Infiniti Fitness homepage. This is NOT about animating sections yet—this is the design system for motion that every section will consume in future tasks.

## What Was Built

### 1. Motion Presets System (`src/lib/motion-presets.ts`)

A centralized token system for motion configurations—like Tailwind for animations.

**Reveal Presets:**
- `small`: 12px translateY (subtle, secondary content)
- `medium`: 24px translateY (default, most content)
- `large`: 40px translateY (hero-scale content)

**Parallax Presets:**
- `slow`: 0.3x scroll speed, 24px max drift
- `medium`: 0.5x scroll speed, 32px max drift
- `fast`: 0.7x scroll speed, 40px max drift

**Stagger Presets:**
- `tight`: 50ms per item
- `medium`: 80ms per item (default)
- `wide`: 120ms per item

**Scale Presets:**
- `subtle`: 1.02x (text-heavy cards)
- `medium`: 1.04x (image cards)
- `large`: 1.06x (featured items)

**Duration Presets:**
- `fast`: 180ms (button press)
- `standard`: 500ms (scroll reveals)
- `counter`: 1200ms (count-up animations)

All presets use the unified easing curve: `[0.16, 1, 0.3, 1]`

### 2. Motion Hooks (`src/lib/hooks/`)

**`useScrollProgress()`**
```typescript
const { ref, scrollYProgress } = useScrollProgress();
const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
```
Track scroll progress (0-1) for an element.

**`useParallax()`**
```typescript
const { ref, y, isDisabled } = useParallax({ preset: "medium" });
```
Apply parallax with preset configurations.

**`useScrollReveal()`**
```typescript
const { ref, isInView } = useScrollReveal();
```
Viewport intersection detection for reveals.

### 3. Responsive Motion (`src/lib/motion-responsive.ts`)

Utilities to scale motion distances by breakpoint:
- Desktop: 100% of specified distance
- Tablet: 75% of specified distance  
- Mobile: 50% of specified distance

```typescript
getResponsiveDistance(40, "mobile") // 20px
getResponsiveDistance(40, "desktop") // 40px
```

### 4. Enhanced Components

**AnimationWrapper** - Now supports presets:
```typescript
// Old way (still works):
<AnimationWrapper variant="fade-up" delay={0.2}>

// New way (presets):
<AnimationWrapper preset="medium" delay={0.2}>
```

**ParallaxLayer** - Now supports presets:
```typescript
// Old way (still works):
<ParallaxLayer disableOnMobile>

// New way (presets):
<ParallaxLayer preset="medium" disableOnMobile>
```

## Design Principles

### 1. Unified Timing
Everything uses the same easing curve: `[0.16, 1, 0.3, 1]`  
Character: ease-out, feels like physical inertia (expensive, not bouncy)

### 2. Closed Vocabulary
No arbitrary values. All distances derived from 8px base scale:
- 12px, 24px, 32px, 40px, 48px

### 3. GPU-Only Performance
All presets use GPU-accelerated properties:
- ✅ `transform`, `opacity`, `scale`
- ❌ `width`, `height`, `margin`, `padding`, `filter blur`, `box-shadow`

### 4. Accessibility First
Every preset respects `prefers-reduced-motion` automatically:
- Motion disabled → static final state
- No configuration needed per-section

### 5. Responsive by Default
Motion distances scale down on smaller screens automatically

## File Structure

```
src/
├── lib/
│   ├── motion-presets.ts          [NEW] Preset system
│   ├── motion-responsive.ts       [NEW] Responsive utilities
│   ├── hooks/
│   │   ├── index.ts              [NEW] Hook exports
│   │   ├── use-scroll-progress.ts [NEW] Scroll tracking
│   │   ├── use-scroll-reveal.ts   [NEW] Viewport detection
│   │   └── use-parallax.ts        [NEW] Parallax helper
│   └── design-tokens.ts           [UPDATED] References presets
└── components/
    └── motion/
        ├── AnimationWrapper.tsx   [UPDATED] Preset support
        └── ParallaxLayer.tsx      [UPDATED] Preset support
```

## Usage Examples

### Basic Reveal with Preset
```typescript
import { AnimationWrapper } from "@/components/motion";

<AnimationWrapper preset="large" delay={0.3}>
  <h2>Headline</h2>
</AnimationWrapper>
```

### Parallax with Preset
```typescript
import { ParallaxLayer } from "@/components/motion";

<ParallaxLayer preset="medium" disableOnMobile>
  <img src="..." alt="..." />
</ParallaxLayer>
```

### Custom Scroll Animation
```typescript
import { useScrollProgress } from "@/lib/hooks";
import { motion, useTransform } from "framer-motion";

const { ref, scrollYProgress } = useScrollProgress();
const y = useTransform(scrollYProgress, [0, 1], [0, 100]);

<div ref={ref}>
  <motion.div style={{ y }}>
    <img src="..." alt="..." />
  </motion.div>
</div>
```

### Responsive Motion Distance
```typescript
import { getResponsiveDistance, getCurrentBreakpoint } from "@/lib/motion-responsive";

const breakpoint = getCurrentBreakpoint();
const distance = getResponsiveDistance(40, breakpoint);
// Desktop: 40px, Tablet: 30px, Mobile: 20px
```

## Motion Specification Reference

All values trace back to:
- `specifications/02-motion-system.md` - Motion vocabulary
- `specifications/01-design-system.md` - Design tokens
- `specifications/00-design-principles.md` - Core principles

## Next Steps

Future tasks will use these APIs to add motion to homepage sections:

1. **Hero** - Use `preset="large"` for hero-scale reveals
2. **Programs** - Use `preset="medium"` with stagger
3. **Facilities** - Use `ParallaxLayer` with `preset="medium"` on banners
4. **Testimonials** - Use scale-in-settle preset (Tier 3 choreography)
5. **All sections** - Consume presets instead of hardcoded values

## Verification

All checks passed:

✅ TypeScript compilation (`npm run typecheck`)  
✅ ESLint (`npm run lint`)  
✅ Production build (`npm run build`)  
✅ No visual changes to homepage  
✅ Backward compatibility maintained  

## Impact

**Files Created**: 7  
**Files Modified**: 3  
**Breaking Changes**: None (backward compatible)  
**Visual Changes**: None (foundation only)

The homepage appears identical after this task. The motion foundation is now available for future implementation tasks to consume.
