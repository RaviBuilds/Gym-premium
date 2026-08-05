import type { Program } from "@/types/content";

/**
 * The nine training disciplines — Homepage-Architecture.md §3 Programs.
 * Hook lines are drawn from each program's own existing page copy on the
 * live site (headlines/pull-quotes already written for that program), not
 * invented — see Homepage-Experience-Blueprint.md's headline bank and the
 * original site audit in 01-business-analysis.md.
 */
export const programs: Program[] = [
  {
    slug: "cardio",
    name: "Cardio",
    hook: "Amazing things come to those who sweat.",
    imageSrc: "/images/programs/cardio.jpg",
    imageAlt: "Cardio training equipment at Infiniti Fitness",
  },
  {
    slug: "strength-training",
    name: "Strength Training",
    hook: "Build a powerful foundation and lift beyond it.",
    imageSrc: "/images/programs/strength-training.jpg",
    imageAlt: "Free weight strength training area at Infiniti Fitness",
  },
  {
    slug: "crossfit",
    name: "Crossfit",
    hook: "Climb. Row. Lift. Repeat.",
    imageSrc: "/images/programs/crossfit.jpg",
    imageAlt: "Crossfit training session at Infiniti Fitness",
  },
  {
    slug: "kick-boxing",
    name: "Kick-boxing",
    hook: "Give your workout routine a kick.",
    imageSrc: "/images/programs/kick-boxing.jpg",
    imageAlt: "Kick-boxing training at Infiniti Fitness",
  },
  {
    slug: "hiit-high-intensity-interval-training",
    name: "HIIT",
    hook: "Build muscle. Slash fat. Fast.",
    imageSrc: "/images/programs/hiit.jpg",
    imageAlt: "High-intensity interval training class at Infiniti Fitness",
  },
  {
    slug: "self-defence",
    name: "Self-Defence",
    hook: "Boost the warrior within you.",
    imageSrc: "/images/programs/self-defence.jpg",
    imageAlt: "Self-defence training at Infiniti Fitness",
  },
  {
    slug: "functional-training",
    name: "Functional Training",
    hook: "Engage multiple muscle groups in a single movement.",
    // Real Infiniti Fitness functional zone (pull-up rig, tire, battle
    // ropes) — replaces a generic stock photo, per the elevation brief's
    // "reuse authentic photography" mandate. Verified individually (not via
    // a batched read) before use.
    imageSrc: "/images/atmosphere/rethibowli-outdoor.jpg",
    imageAlt: "Functional training zone with battle ropes and pull-up rig at Infiniti Fitness Rethibowli",
  },
  {
    slug: "rock-climbing",
    name: "Rock Climbing",
    hook: "Every mountain top is within reach if you just keep climbing.",
    imageSrc: "/images/programs/rock-climbing.jpg",
    imageAlt: "Indoor rock climbing wall at Infiniti Fitness",
  },
  {
    slug: "steam",
    name: "Steam",
    hook: "Recover in our Relaxation Station.",
    imageSrc: "/images/programs/steam.jpg",
    imageAlt: "Steam recovery room at Infiniti Fitness",
  },
];
