export { AnimationWrapper } from "./AnimationWrapper";
export type { AnimationWrapperProps, RevealVariant } from "./AnimationWrapper";

// getStaggerDelay lives in @/lib/design-tokens, not here — it's a plain, pure
// function with no hooks/browser APIs, and AnimationWrapper.tsx is marked
// "use client", which makes every export from that file client-only. Server
// Components (most homepage sections) need to call getStaggerDelay while
// mapping content arrays into staggered children, so it lives in a
// directive-free module instead. Import it directly from "@/lib/design-tokens".

export { ParallaxLayer } from "./ParallaxLayer";

// The camera system's wrapper form. New section motion should use this rather
// than ParallaxLayer — see src/lib/motion/camera-tokens.ts for why the depth
// vocabulary replaced the old drift-per-section presets.
export { CameraLayer, CameraGroup } from "./CameraLayer";
export type { CameraLayerProps } from "./CameraLayer";

export { AnimatedDivider } from "./AnimatedDivider";
export type { AnimatedDividerProps } from "./AnimatedDivider";

export { CountUp } from "./CountUp";
export type { CountUpProps } from "./CountUp";

export { MagneticButton } from "./MagneticButton";

export { ScrollProgressBar } from "./ScrollProgressBar";

export { KineticHeadline } from "./KineticHeadline";

export { MaskedLine } from "./MaskedLine";
export type { MaskedLineProps } from "./MaskedLine";
