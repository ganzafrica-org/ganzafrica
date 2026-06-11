import { StatCard } from "./stat-card"; // Adjust path as needed
import { LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: string | number;
  trendText: string;
  icon: LucideIcon;
  color?: string;
}

interface StatGridProps {
  stats: StatItem[];
}

export const StatGrid = ({ stats }: StatGridProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          trendText={stat.trendText}
          icon={stat.icon} 
          className={stat.color + " flex-1 min-w-[240px]"}
        />
      ))}
    </div>
  );
};