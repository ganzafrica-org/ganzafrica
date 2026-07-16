"use client";

import { useRouter } from "next/navigation";
import { QuickAccessCard } from "@/components/sections/settings/quick-access-card";
import { quick_access_items } from "@/data/settings-data";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 max-w-[80%] gap-6 mt-5">
        {quick_access_items.map((item) => (
          <QuickAccessCard
            key={item.path}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={() => router.push(item.path)}
          />
        ))}
      </div>
    </div>
  );
}
