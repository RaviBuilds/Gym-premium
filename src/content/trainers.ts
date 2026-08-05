import type { Trainer } from "@/types/content";

/**
 * The six named trainers — Homepage-Architecture.md §5 Meet the Trainers.
 * Names, titles, and the "Mr Nizamabad" competitive title are real, sourced
 * from the live site's trainer section (01-business-analysis.md audit).
 * Photo-to-name pairing was verified against the live site's own markup
 * (each trainer's photo is the exact file the current site links to their
 * name with) before these paths were assigned — see public/images/trainers.
 */
export const trainers: Trainer[] = [
  {
    slug: "mohammed-wajeed",
    name: "Mohammed Wajeed",
    title: "Fitness Guru",
    achievementBadge: "Mr Nizamabad",
    imageSrc: "/images/trainers/mohammed-wajeed.jpg",
    imageAlt: "Mohammed Wajeed, Fitness Guru and Mr Nizamabad titleholder",
  },
  {
    slug: "dhanveer-prakash",
    name: "Dhanveer Prakash",
    title: "Nutritionist & Fitness Trainer",
    imageSrc: "/images/trainers/dhanveer-prakash.jpg",
    imageAlt: "Dhanveer Prakash, Nutritionist and Fitness Trainer",
  },
  {
    slug: "ruma-mehar",
    name: "Ruma Mehar",
    title: "Professional Fitness & Weight Loss Trainer",
    imageSrc: "/images/trainers/ruma-mehar.jpg",
    imageAlt: "Ruma Mehar, Professional Fitness and Weight Loss Trainer",
  },
  {
    slug: "mohammed-yousuf",
    name: "Mohammed Yousuf",
    title: "Personal Trainer & Fitness Counsellor",
    imageSrc: "/images/trainers/mohammed-yousuf.jpg",
    imageAlt: "Mohammed Yousuf, Personal Trainer and Fitness Counsellor",
  },
  {
    slug: "mohiuddin-ahmed",
    name: "Mohiuddin Ahmed",
    title: "General & Personal Trainer",
    imageSrc: "/images/trainers/mohiuddin-ahmed.jpg",
    imageAlt: "Mohiuddin Ahmed, General and Personal Trainer",
  },
  {
    slug: "anuradh-aleti",
    name: "Anuradh Aleti",
    title: "CrossFit & Personal Trainer",
    imageSrc: "/images/trainers/anuradh-aleti.jpg",
    imageAlt: "Anuradh Aleti, CrossFit and Personal Trainer",
  },
];
