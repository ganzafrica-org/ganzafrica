"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"

export function CurrentProjectCard() {
  return (
    <Card className="border-0 shadow-sm h-fit border-2-blue-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-slate-700">Current Project</CardTitle>
        <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-1">
          <div className="text-default uppercase tracking-wide text-slate-400">Project Name</div>
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold text-slate-900 leading-tight">Redesign Finance App</div>
            <Badge className="bg-orange-100 text-orange-700 border-0">In progress</Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-text-small uppercase tracking-wide text-slate-400">Project Manager</div>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://i.pravatar.cc/80?img=11" />
              <AvatarFallback>NF</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">Nicole Foster</div>
              <div className="text-xs text-slate-500">Design lead</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Team</div>
            <div className="flex -space-x-2">
              {["https://i.pravatar.cc/80?img=32", "https://i.pravatar.cc/80?img=52", "https://i.pravatar.cc/80?img=15", "https://i.pravatar.cc/80?img=6"].map(
                (src, idx) => (
                  <Avatar key={idx} className="h-8 w-8 border-2 border-white">
                    <AvatarImage src={src} />
                    <AvatarFallback>TM</AvatarFallback>
                  </Avatar>
                )
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Due Date</div>
            <div className="text-sm font-semibold text-slate-900">Oct 24, 2025</div>
            <div className="text-xs text-red-500">2 days left</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

