import { ReactNode } from "react";

interface QuickAccessCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export function QuickAccessCard({ icon, title, description, onClick }: QuickAccessCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full group relative p-6 bg-card rounded-lg border border-border hover:border-blue-300 hover:shadow-md transition-all text-left h-full"
    >
      <div className="flex flex-col h-full">
        <div className="mb-4 inline-flex w-fit p-3 bg-muted rounded-lg group-hover:bg-green-200 transition">
          <div className="text-blue-600 text-2xl">{icon}</div>
        </div>
        <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
