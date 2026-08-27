interface DataRowProps {
  label: string;
  value: string | React.ReactNode;
  variant?: "default" | "muted";
}

export function DataRow({ label, value, variant = "default" }: DataRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span
        className={`text-sm font-medium ${variant === "muted" ? "text-muted-foreground" : "text-foreground/80"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm ${
          variant === "muted" ? "text-muted-foreground" : "text-foreground font-semibold"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
