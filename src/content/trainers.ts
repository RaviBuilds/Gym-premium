import type { Trainer } from "@/types/content";

/**
 * The six named trainers — Homepage-Architecture.md §5 Meet the Trainers.
 * Names, titles, and the "Mr Nizamabad" competitive title are real, sourced
 * from the live site's trainer section (01-business-analysis.md audit).
 * Photo-to-name pairing was verified against the live site's own markup
 * (each trainer's photo is the exact file the current site links to their
 * name with) before these paths were assigned — see public/images/trainers.
 *
 * CONTENT HONESTY CONTRACT — design.md §7.2, Requirement 8.3.
 * Nothing here may be fabricated.
 *
 * - `discipline` is a rewording of that coach's own `title` and nothing more.
 *   Rewording an existing fact is allowed; inferring a new one is not. Each
 *   entry below carries the source title inline so the derivation is auditable.
 * - `signatureAchievement` is set only where a real achievement already exists
 *   in the data. Today that is Mohammed Wajeed's "Mr Nizamabad" title, mapped
 *   across verbatim from `achievementBadge`. No other coach has one.
 *   `achievementBadge` is retained on Wajeed for back-compat.
 * - `yearsExperience`, `certifications` and `philosophy` are DELIBERATELY ABSENT
 *   on all six coaches. They are owner inputs (Open Questions 1–4) and have not
 *   been supplied. Do not add them, estimate them, or fill them with
 *   placeholders — Requirement 8.1 depends on their absence making
 *   `resolveCombinedYears` return `null` rather than publishing a partial sum as
 *   a fact. Populate them only from what the gym owner actually provides.
 */
export const trainers: Trainer[] = [
  {
    slug: "mohammed-wajeed",
    name: "Mohammed Wajeed",
    title: "Fitness Guru",
    achievementBadge: "Mr Nizamabad",
    imageSrc: "/images/trainers/mohammed-wajeed.png",
    imageAlt: "Mohammed Wajeed, Fitness Guru and Mr Nizamabad titleholder",
    /** From title "Fitness Guru". */
    discipline: ["Fitness Coaching"],
    signatureAchievement: "Mr Nizamabad",
    backdropSrc: "/back/mohammed-wajeed.jpg",
    lead: true,
  },
  {
    slug: "dhanveer-prakash",
    name: "Dhanveer Prakash",
    title: "Nutritionist & Fitness Trainer",
    imageSrc: "/images/trainers/dhanveer-prakash.png",
    imageAlt: "Dhanveer Prakash, Nutritionist and Fitness Trainer",
    /** From title "Nutritionist & Fitness Trainer". */
    discipline: ["Nutrition", "Personal Training"],
    backdropSrc: "/back/dhanveer-prakash.jpg",
  },
  {
    slug: "ruma-mehar",
    name: "Ruma Mehar",
    title: "Professional Fitness & Weight Loss Trainer",
    imageSrc: "/images/trainers/ruma-mehar.png",
    imageAlt: "Ruma Mehar, Professional Fitness and Weight Loss Trainer",
    /** From title "Professional Fitness & Weight Loss Trainer". */
    discipline: ["Fitness Training", "Weight Loss"],
    backdropSrc: "/back/ruma-mehar.jpg",
  },
  {
    slug: "mohammed-yousuf",
    name: "Mohammed Yousuf",
    title: "Personal Trainer & Fitness Counsellor",
    imageSrc: "/images/trainers/mohammed-yousuf.png",
    imageAlt: "Mohammed Yousuf, Personal Trainer and Fitness Counsellor",
    /** From title "Personal Trainer & Fitness Counsellor". */
    discipline: ["Personal Training", "Fitness Counselling"],
    backdropSrc: "/back/mohammed-yousuf.jpg",
  },
  {
    slug: "mohiuddin-ahmed",
    name: "Mohiuddin Ahmed",
    title: "General & Personal Trainer",
    imageSrc: "/images/trainers/mohiuddin-ahmed.png",
    imageAlt: "Mohiuddin Ahmed, General and Personal Trainer",
    /** From title "General & Personal Trainer". */
    discipline: ["General Training", "Personal Training"],
    backdropSrc: "/back/mohiuddin-ahmed.jpg",
  },
  {
    slug: "anuradh-aleti",
    name: "Anuradh Aleti",
    title: "CrossFit & Personal Trainer",
    imageSrc: "/images/trainers/anuradh-aleti.png",
    imageAlt: "Anuradh Aleti, CrossFit and Personal Trainer",
    /** From title "CrossFit & Personal Trainer". */
    discipline: ["CrossFit", "Personal Training"],
    backdropSrc: "/back/anuradh-aleti.jpg",
  },
];
