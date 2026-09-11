/**
 * Circular "% complete" indicator — originally local to onboarding/me/page.tsx, now shared so the
 * StatsHeader on both the employee and HR onboarding pages can use the same visual for overall
 * progress instead of a plain number. `variant="dark"` swaps the track/text colors to read on the
 * StatsHeader's brand-dark background; the default "light" variant is unchanged from the original.
 */
interface ProgressRingProps {
  percent: number;
  variant?: "light" | "dark";
}

export function ProgressRing({ percent, variant = "light" }: ProgressRingProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const isDark = variant === "dark";

  return (
    <svg
      viewBox="0 0 100 100"
      className="size-28 shrink-0"
      role="img"
      aria-label={`${percent}% complete`}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        className={isDark ? "text-white/15" : "text-slate-200"}
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        className={isDark ? "text-brand-accent transition-all" : "text-emerald-500 transition-all"}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - (percent / 100) * circumference}
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        className={
          isDark
            ? "fill-white text-[22px] font-semibold"
            : "fill-slate-800 text-[22px] font-semibold"
        }
      >
        {percent}%
      </text>
    </svg>
  );
}
