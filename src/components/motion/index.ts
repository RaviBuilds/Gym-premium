export { AnimationWrapper } from "./AnimationWrapper";
export type { AnimationWrapperProps, RevealVariant } from "./AnimationWrapper";

// getStaggerDelay lives in @/lib/design-tokens, not here — it's a plain, pure
// function with no hooks/browser APIs, and AnimationWrapper.tsx is marked
// "use client", which makes every export from that file client-only. Server
// Components (most homepage sections) need to call getStaggerDelay while
// mapping content arrays into staggered children, so it lives in a
// directive-free module instead. Import it directly from "@/lib/design-tokens".

export { ParallaxLayer } from "./ParallaxLayer";

export { AnimatedDivider } from "./AnimatedDivider";
export type { AnimatedDividerProps } from "./AnimatedDivider";

export { CountUp } from "./CountUp";
export type { CountUpProps } from "./CountUp";

export { MagneticButton } from "./MagneticButton";

export { ScrollProgressBar } from "./ScrollProgressBar";

export { KineticHeadline } from "./KineticHeadline";
