/**
 * Accessibility helper functions — §13 Accessibility.
 *
 * Small, framework-agnostic utilities used across components to keep ARIA
 * wiring consistent (e.g. every Tabs/Accordion instance builds its ids the
 * same way) rather than each component inventing its own id scheme.
 */

/**
 * Deterministic id pair for a tab/tabpanel or accordion header/panel
 * relationship, per §13's ARIA recommendations ("Tabs... need proper
 * tab/tabpanel role relationships", "Accordion headers need aria-expanded
 * state and control the visibility of their associated panel").
 */
export function getDisclosureIds(baseId: string) {
  return {
    triggerId: `${baseId}-trigger`,
    panelId: `${baseId}-panel`,
  };
}

/**
 * Slugify a label into a stable, DOM-safe id fragment — used when a
 * component only has human-readable text to key off of (e.g. building a
 * branch-tab id from "Gachibowli"/"Rethibowli").
 */
export function slugify(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Standard descriptive alt-text builders — §13 Accessibility "Alt text
 * strategy" and §Homepage-Architecture.md's per-section accessibility notes.
 * Centralizing the pattern here means every program card, trainer frame and
 * location card produces alt text in the same shape instead of ad hoc
 * strings drifting apart across components — directly resolving the current
 * site's sitewide generic "gallery grid image" alt-text gap.
 */
export const altText = {
  program: (programName: string, branch?: string) =>
    `${programName} training session at Infiniti Fitness${branch ? ` ${branch}` : ""}`,
  trainer: (name: string, title: string) => `${name}, ${title}`,
  location: (branchName: string, detail: string) => `Infiniti Fitness ${branchName} — ${detail}`,
} as const;
