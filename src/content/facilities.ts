import type { LucideIcon } from "lucide-react";
import { Dumbbell, Droplets, Utensils, Lock, Fingerprint, ParkingSquare } from "lucide-react";

export interface Facility {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * Physical amenities — distinct from the Programs grid (which covers
 * training disciplines). These describe what's actually in the building,
 * drawn from real FAQ answers already documented in 01-business-analysis.md
 * (imported equipment, steam room, café, lockers/changing rooms, biometric
 * entry, on-site parking) — not the training programs themselves.
 */
export const facilities: Facility[] = [
  {
    icon: Dumbbell,
    title: "Imported Equipment",
    description: "A wide range of imported equipment and machinery, kept clean and well maintained.",
  },
  {
    icon: Droplets,
    title: "Steam Recovery Room",
    description: "Unwind after training in our steam room — a proper reset for tired muscles.",
  },
  {
    icon: Utensils,
    title: "In-House Café",
    description: "Grilled chicken, protein-packed salads, and fresh juices — built for your goals.",
  },
  {
    icon: Lock,
    title: "Lockers & Changing Rooms",
    description: "Secure lockers during your session, plus a full changing room and washroom.",
  },
  {
    icon: Fingerprint,
    title: "Biometric Entry",
    description: "Every member is linked to our system by biometric and mobile number — no cards to lose.",
  },
  {
    icon: ParkingSquare,
    title: "On-Site Parking",
    description: "Pull up and train — parking is available right outside both branches.",
  },
];
