/**
 * Conversion campaigns — components whose job is to ask, rather than to inform.
 *
 * Kept out of `sections/` and `layout/` deliberately. A campaign is not a section
 * (it is not part of the page's scroll composition) and not chrome (it is not
 * always present); it is a targeted, measured, dismissible ask governed by the
 * rules in `config/conversion.ts`. Anything added here should be gated by
 * `useCampaignGate` and should emit the events in `lib/analytics.ts`, so no
 * campaign can ship without a way to tell whether it is worth its intrusion.
 */

export { TrialInterceptModal } from "./TrialInterceptModal";
