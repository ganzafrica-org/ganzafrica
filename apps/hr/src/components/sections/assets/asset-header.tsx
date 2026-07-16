"use client";

import { MoreVertical, Folder } from "lucide-react";

interface AccessItem {
  id: number;
  title: string;
  size: string;
  count: string;
}

const quickAccessItems: AccessItem[] = [
  {
    id: 1,
    title: "Studio Assets",
    size: "13.2GB",
    count: "198 items",
  },
  {
    id: 2,
    title: "Source",
    size: "6.1GB",
    count: "72 items",
  },
  {
    id: 3,
    title: "Brand Assets",
    size: "7.2GB",
    count: "29 items",
  },
  {
    id: 4,
    title: "Annual Report",
    size: "1.2GB",
    count: ".pdfs",
  },
];

export default function QuickAccess() {
  return (
    <div className="w-full bg-brand-dark rounded-b-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-big text-4xl font-bold text-white">Quick access</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickAccessItems.map((item) => (
          <div key={item.id} className="rounded-lg p-4 border-white/10 pl-6 py-2 border-l">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-white/10 rounded-full">
                <Folder className="w-6 h-6 text-brand-accent" />
              </div>
              <button className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            </div>

            <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
            <p className="text-xs text-white">
              {item.size} • {item.count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
