"use client";

import Image from "next/image";
import { InfoCard } from "@/components/auth/info-card";
import { cn } from "@/lib/utils";

const AVATARS = [
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    alt: "Team member 1",
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    alt: "Team member 2",
  },
  {
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop",
    alt: "Team member 3",
  },
  {
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop",
    alt: "Team member 4",
  },
];

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_DATES = [22, 23, 24, 25, 26, 27, 28];

export function LoginHeroPanel({ className }: { className?: string }) {
  return (
    <div className={cn("relative hidden overflow-hidden p-6 lg:block", className)}>
      <div className="relative h-full min-h-[560px] overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)]">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=900&fit=crop"
          alt="Team collaborating in the office"
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/10" />

        {/* Task Review card */}
        <InfoCard
          title="Task Review With Team"
          subtitle="09:30am-10:00am"
          variant="highlight"
          className="absolute left-6 top-8 z-10 max-w-[220px]"
        />

        {/* Calendar strip */}
        <div className="absolute left-6 right-20 top-[42%] z-10 overflow-hidden rounded-2xl border border-white/30 bg-white/15 px-4 py-3 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between gap-2 text-white">
            {WEEK_DAYS.map((day, index) => (
              <div
                key={day}
                className={cn(
                  "flex flex-col items-center rounded-xl px-2 py-1 text-center text-[10px] font-medium",
                  index === 3 && "bg-white/25",
                )}
              >
                <span className="opacity-80">{day}</span>
                <span className="mt-1 text-sm font-semibold">{WEEK_DATES[index]}</span>
              </div>
            ))}
          </div>
          <div
            className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.15)_0_6px,transparent_6px_12px)]"
            aria-hidden="true"
          />
        </div>

        {/* Daily Meeting card */}
        <InfoCard
          title="Daily Meeting"
          subtitle="12:00pm-01:00pm"
          variant="meeting"
          className="absolute bottom-10 left-6 z-10 min-w-[240px]"
        >
          <div className="mt-3 flex -space-x-2">
            {AVATARS.map((avatar) => (
              <div
                key={avatar.src}
                className="relative h-8 w-8 overflow-hidden rounded-full border-2 border-white shadow-sm"
              >
                <Image
                  src={avatar.src}
                  alt={avatar.alt}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Floating avatar stack */}
        <div className="absolute bottom-16 right-6 z-10 flex flex-col gap-3">
          {AVATARS.slice(0, 3).map((avatar, index) => (
            <div
              key={avatar.src}
              className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-white shadow-md"
              style={{ marginRight: index * 4 }}
            >
              <Image src={avatar.src} alt={avatar.alt} fill unoptimized className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
