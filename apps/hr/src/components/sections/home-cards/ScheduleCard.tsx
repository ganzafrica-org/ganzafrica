"use client"

import React, { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const meetings = [
  {
    id: "m1",
    title: "Meeting with Clients",
    time: "8:30 - 10:30 AM",
    location: "345 Silva, CA",
    people: ["https://i.pravatar.cc/80?img=26", "https://i.pravatar.cc/80?img=38", "https://i.pravatar.cc/80?img=44"],
  },
  {
    id: "m2",
    title: "Book Discussion",
    time: "2:30 - 3:30 PM",
    location: "Los Angeles, CA",
    people: ["https://i.pravatar.cc/80?img=58", "https://i.pravatar.cc/80?img=12"],
  },
  {
    id: "m3",
    title: "Brief for reference, color, style",
    time: "2:00 - 3:45 PM",
    location: "San Diego, CA",
    people: ["https://i.pravatar.cc/80?img=5"],
  },
]

export function ScheduleCard() {
  const [tab, setTab] = useState<"meetings" | "events" | "holiday">("meetings")
  const filtered = useMemo(() => {
    if (tab !== "meetings") return []
    return meetings
  }, [tab])

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Schedule</CardTitle>
        <button
          type="button"
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="font-semibold text-slate-900">July 2026</div>
          <div className="flex items-center gap-1">
            <button type="button" className="p-1 rounded hover:bg-slate-100">
              <ChevronLeft className="h-4 w-4 text-slate-500" />
            </button>
            <button type="button" className="p-1 rounded hover:bg-slate-100">
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-[11px] text-slate-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={`blank-${i}`} className="h-8" />
          ))}
          {Array.from({ length: 12 }).map((_, i) => {
            const day = i + 1
            const isSelected = day === 4
            return (
              <div
                key={day}
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                  isSelected ? "bg-emerald-100 text-emerald-800 font-semibold" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {day}
              </div>
            )
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input className="h-10 pl-9 rounded-full bg-slate-50 border-slate-200 dark:border-none" placeholder="Search" />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("meetings")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              tab === "meetings" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Meetings
          </button>
          <button
            type="button"
            onClick={() => setTab("events")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              tab === "events" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Events
          </button>
          <button
            type="button"
            onClick={() => setTab("holiday")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              tab === "holiday" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Holiday
          </button>
        </div>

        <div className="space-y-3">
          {filtered.map((m) => (
            <div key={m.id} className="rounded-lg bg-gradient-to-r from-emerald-50 to-purple-50 dark:bg-white/10 p-4">
              <div className="flex items-start justify-between gap-3 dark:bg-white/10">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{m.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{m.time}</div>
                </div>
                <Badge variant="secondary" className="bg-brand-accent text-slate-700 rounded-lg">
                  {m.location}
                </Badge>
              </div>
              <div className="mt-3 flex -space-x-2">
                {m.people.map((src, idx) => (
                  <Avatar key={idx} className="h-7 w-7 border-2 border-white">
                    <AvatarImage src={src} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          ))}
          {tab !== "meetings" && (
            <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/10">No items in this tab yet.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

