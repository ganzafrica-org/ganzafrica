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
      className="w-full group relative p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left h-full"
    >
      <div className="flex flex-col h-full">
        <div className="mb-4 inline-flex w-fit p-3 bg-slate-100 rounded-lg group-hover:bg-green-200 transition">
          <div className="text-blue-600 text-2xl">{icon}</div>
        </div>
        <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
