import { cn } from "@/lib/utils";

function Skeleton({ className, ref, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      ref={ref as any}
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
