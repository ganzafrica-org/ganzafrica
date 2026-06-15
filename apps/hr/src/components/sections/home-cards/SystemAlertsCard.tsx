"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

const alerts = [
  {
    id: "a1",
    icon: AlertCircle,
    title: "Performance Reviews Due",
    subtitle: "5 employees need performance reviews this week",
    tone: "warning" as const,
  },
  {
    id: "a2",
    icon: Info,
    title: "Contract Renewals",
    subtitle: "3 contracts expiring in the next 30 days",
    tone: "info" as const,
  },
  {
    id: "a3",
    icon: CheckCircle2,
    title: "System Backup Complete",
    subtitle: "Daily backup completed successfully at 2:00 AM",
    tone: "success" as const,
  },
]

const toneStyles = {
  warning: {
    wrap: "bg-orange-50 border-orange-100",
    icon: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
  },
  info: {
    wrap: "bg-slate-50 border-slate-100",
    icon: "text-slate-600",
    badge: "bg-slate-100 text-slate-700",
  },
  success: {
    wrap: "bg-emerald-50 border-emerald-100",
    icon: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
}

export function SystemAlertsCard() {
  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-300">System Alerts</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {alerts.map((a) => {
          const Icon = a.icon
          const t = toneStyles[a.tone]
          return (
            <div key={a.id} className={`rounded-2xl border dark:border-none p-4 dark:bg-white/10 ${t.wrap}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${t.icon}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-white/60">{a.subtitle}</div>
                  </div>
                </div>
                <Badge className={`border-0 rounded-md ${t.badge}`}>{a.tone}</Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

