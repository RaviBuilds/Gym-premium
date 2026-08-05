import { CountUp } from "@/components/motion";
import { BodyText } from "./Heading";

/**
 * StatCounter — Homepage-Architecture.md §2 Trust Strip.
 *
 * `variant="static"` exists because not every Trust Strip figure should
 * roll up from zero — §10 Motion Design is explicit that "Since 2016"
 * should fade in as-is, not count through every intermediate year.
 *
 * No per-stat icon — the elevation pass removed it deliberately (small line
 * icons read as a generic "dashboard widget" tell rather than premium). The
 * number itself is now the sole visual anchor per stat; hover is a plain
 * opacity/lift cue, not a glow, per the "no neon" elevation brief.
 *
 * Hardcodes yellow-on-dark text colors rather than accepting a tone prop:
 * per Design-System.md §3, brand-yellow text is only legible against a dark
 * background (it fails contrast on light surfaces), so StatCounter assumes
 * — like Eyebrow — that its parent section is always tone="dark". The Trust
 * Strip section this is used in is built as a dark PageSection specifically
 * so this assumption holds.
 */
export interface StatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  variant?: "count" | "static";
}

export function StatCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  variant = "count",
}: StatCounterProps) {
  return (
    <div className="group flex flex-col items-center gap-3 text-center transition-transform duration-300 ease-out motion-safe:hover:-translate-y-1">
      <span className="font-display text-stat tabular-nums text-brand-yellow transition-opacity duration-300 ease-out motion-safe:group-hover:opacity-80 lg:text-stat-lg">
        {variant === "count" ? (
          <CountUp end={value} prefix={prefix} suffix={suffix} />
        ) : (
          <>
            {prefix}
            {value}
            {suffix}
          </>
        )}
      </span>
      <BodyText
        size="caption"
        className="uppercase tracking-[0.14em] text-text-secondary-dark/80 transition-colors duration-300 ease-out motion-safe:group-hover:text-text-secondary-dark"
      >
        {label}
      </BodyText>
    </div>
  );
}
