"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"
import {MoreHorizontal} from "lucide-react";

const data = [
  { month: "Jan", annual: 2, sick: 1 },
  { month: "Feb", annual: 3, sick: 0 },
  { month: "Mar", annual: 1, sick: 2 },
  { month: "Apr", annual: 4, sick: 1 },
  { month: "May", annual: 2, sick: 1 },
  { month: "Jun", annual: 3, sick: 0 },
]

export function LeaveSummaryCard() {
  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="font-semibold text-slate-800 dark:text-slate-300">Leave summary</CardTitle>
          <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
              <MoreHorizontal size={18} className="text-slate-400" />
          </button>      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-fit w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis hide domain={[0, "dataMax + 1"]} />
              <Tooltip
                cursor={{ stroke: "rgba(15,118,110,0.15)", strokeWidth: 2 }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  boxShadow: "0 10px 30px rgba(2, 6, 23, 0.08)",
                }}
              />
              <Line type="monotone" dataKey="annual" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="sick" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-white/60 dark:bg-white/10 p-3">
            <div className="text-[11px] text-slate-500 dark:text-white">Annual leave</div>
            <div className="mt-1 text-lg font-semibold text-slate-900  dark:text-white">34 Days</div>
            <Badge className="mt-2 bg-emerald-100 text-emerald-800 border-0 rounded-md">Request leave</Badge>
          </div>
          <div className="rounded-2xl border bg-white/60 dark:bg-white/10 p-3">
            <div className="text-[11px] text-slate-500  dark:text-white">Sick leave used</div>
            <div className="mt-1 text-lg font-semibold text-slate-900  dark:text-white">78 Days</div>
            <Badge className="mt-2 bg-emerald-100 text-emerald-800 border-0 rounded-md">Request leave</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

