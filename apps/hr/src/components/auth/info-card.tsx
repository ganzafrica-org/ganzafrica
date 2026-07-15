import { cn } from "@/lib/utils";

type InfoCardVariant = "highlight" | "meeting" | "glass";

interface InfoCardProps {
  title: string;
  subtitle?: string;
  variant?: InfoCardVariant;
  className?: string;
  children?: React.ReactNode;
}

export function InfoCard({
  title,
  subtitle,
  variant = "highlight",
  className,
  children,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md",
        variant === "highlight" && "bg-[#f9df6d] text-slate-900",
        variant === "meeting" && "border border-white/60 bg-white/95 text-slate-900",
        variant === "glass" && "border border-white/40 bg-white/20 text-white",
        className,
      )}
    >
      <p className="text-sm font-semibold leading-tight">{title}</p>
      {subtitle && (
        <p
          className={cn(
            "mt-0.5 text-xs",
            variant === "highlight" ? "text-slate-700" : "text-slate-500",
          )}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
