"use client";

import React from "react";
import Link from "next/link";
import { Task, TeamMember } from "@/lib/types";
import { UserAvatar } from "./user-avatar";

export function TeamGrid({ members, tasks, activeCounts }: { members: TeamMember[]; tasks: Task[]; activeCounts: Record<string, number> }): React.JSX.Element {
  const tasksByUser: Record<string, Task[]> = {};
  for (const m of members) tasksByUser[m.id] = [];
  for (const t of tasks) {
    for (const uid of t.assignees) {
      // Only add tasks for users that are in the members list
      if (tasksByUser[uid]) {
        tasksByUser[uid].push(t);
      }
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {members.map(m => {
        const list = tasksByUser[m.id] || [];
        const visible = list.slice(0, 3);
        const more = list.length - visible.length;
        return (
          <div key={m.id} className="rounded-2xl border border-black/5 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full overflow-hidden" style={{ backgroundColor: (m as any).color }}>
                <UserAvatar 
                  userId={parseInt(m.id)} 
                  size="lg"
                  className="h-10 w-10"
                  fallbackColor={(m as any).color}
                />
              </div>
              <div>
                <div className="font-medium leading-tight">{m.name}</div>
                <div className="text-xs text-gray-500">{m.email}</div>
              </div>
              <div className="ml-auto text-sm">
                <span className="text-gray-500">Active</span> <span className="font-semibold">{activeCounts[m.id] || 0}</span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {visible.map(t => (
                <div key={t.id} className="px-3 py-2 rounded-md bg-gradient-to-r from-indigo-50 to-purple-50 border border-black/5 text-sm">
                  {t.title}
                </div>
              ))}
            </div>
            {more > 0 && (
              <div className="mt-3">
                <button className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500">View all</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


