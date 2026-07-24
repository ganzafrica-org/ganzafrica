import React from "react";
import { Calendar, ChevronDown, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultStats, HeaderStat } from "@/data/Header-data";

export type HeaderProps = {
  scrolled?: boolean;
  title: string;
  subtitle?: string;
  /** If omitted, the date button is hidden entirely */
  dateLabel?: string;
  /** If omitted, the add (plus) button is hidden entirely */
  add?: string;
  actions?: React.ReactNode;
  onAddClick?: () => void;
  onDateClick?: () => void;
  ClassName?: string;
  stats?: HeaderStat[];
  isLoading?: boolean;
};

function StatSkeleton() {
  return (
    <div className="bg-transparent pl-6 py-2 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-white/10 rounded-full h-8 w-8" />
        <div className="h-3 w-20 bg-white/10 rounded" />
      </div>
      <div className="h-9 w-24 bg-white/10 rounded" />
    </div>
  );
}

export function StatsHeader({
  scrolled = false,
  title,
  subtitle,
  dateLabel,
  add,
  actions,
  onAddClick,
  onDateClick,
  stats = defaultStats,
  ClassName,
  isLoading = false,
}: HeaderProps) {
  const showAdd = add !== undefined;
  const showDate = dateLabel !== undefined;
  const hasActions = actions !== undefined || showAdd || showDate;

  return (
    <div
      className={`bg-brand-dark px-4 py-8 shadow-sm relative overflow-hidden transition-all duration-300 lg:px-9 lg:py-12 mx-auto ${ClassName} ${
        scrolled ? "mx-0 rounded-none" : "rounded-b-lg"
      }`}
    >
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          {/* Left: title + subtitle */}
          <div className="space-y-2">
            <h1 className="text-big lg:text-4xl font-bold text-white">{title}</h1>
            {!!subtitle && <p className="text-[#00df82] font-medium opacity-90">{subtitle}</p>}
          </div>

          {/* Right: action buttons — only rendered when something is visible */}
          {hasActions && (
            <div className="flex items-center gap-3">
              {actions ?? (
                <>
                  {showAdd && (
                    <Button
                      type="button"
                      onClick={onAddClick}
                      variant="ghost"
                      size="icon"
                      aria-label={add}
                      className="bg-white/10 hover:bg-white/20 text-white rounded-full h-11 w-11 border-none transition-all"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  )}

                  {showDate && (
                    <button
                      type="button"
                      onClick={onDateClick}
                      className="flex items-center bg-[#00df82] px-5 py-2.5 rounded-full font-semibold gap-3 cursor-pointer hover:opacity-90 transition-all text-default"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{dateLabel}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 lg:mt-16">
          {isLoading
            ? Array.from({ length: 4 }).map((_, idx) => <StatSkeleton key={idx} />)
            : stats.map((stat, idx) => {
                const Icon = stat.icon;
                const isDown = stat.delta?.direction === "down";

                return (
                  <div
                    key={`${stat.label}-${idx}`}
                    className={`bg-transparent border-white/10 pl-6 py-2 border-l`}
                  >
                    {/* Icon + Label */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-white/10 rounded-full">
                        {Icon &&
                          (React.isValidElement(Icon)
                            ? Icon
                            : React.createElement(
                                Icon as React.ComponentType<{ className?: string }>,
                                {
                                  className: "h-4 w-4 text-brand-accent",
                                },
                              ))}
                      </div>
                      <span className="text-default font-medium">{stat.label}</span>
                    </div>

                    {/* Value + Delta badge */}
                    <div className="flex items-end gap-3 flex-wrap">
                      <span className="text-4xl font-bold text-white leading-none">
                        {stat.value}
                      </span>

                      {!!stat.delta && (
                        <div
                          className={`flex items-center gap-1 font-bold mb-1 px-1.5 py-0.5 rounded-lg bg-white/10 ${
                            isDown ? "text-red-400" : "text-[#00df82]"
                          }`}
                        >
                          {isDown ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : (
                            <TrendingUp className="h-3 w-3" />
                          )}
                          <span className="text-white">{stat.delta.value}</span>
                        </div>
                      )}
                    </div>

                    {/* Comparison text — moved outside value row so it sits below */}
                    {!!stat.comparison && (
                      <span className="text-brand-accent text-small mt-3 block">
                        {stat.comparison}
                      </span>
                    )}
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
