"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  isActive: boolean;
  onClick: () => void;
}

export function NavItem({ icon: Icon, label, subtitle, isActive, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 rounded-md transition-all border-l-4 mb-2",
        isActive
          ? "bg-slate-100 border-l-brand-dark dark:bg-amber-950/30"
          : "border-l-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 flex-shrink-0",
            isActive ? "text-brand-dark" : "text-neutral-500 dark:text-neutral-400",
          )}
          size={20}
        />
        <div>
          <div
            className={cn(
              "font-medium",
              isActive
                ? "text-neutral-900 dark:text-neutral-50"
                : "text-neutral-700 dark:text-neutral-300",
            )}
          >
            {label}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400 leading-snug">
            {subtitle}
          </div>
        </div>
      </div>
    </button>
  );
}
