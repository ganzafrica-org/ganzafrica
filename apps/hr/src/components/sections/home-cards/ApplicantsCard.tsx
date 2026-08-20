"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal, Info } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useRecruitmentOpportunities } from "@/hooks/useRecruitment";

ChartJS.register(ArcElement, Tooltip, Legend);

const TERMINAL_STAGES = new Set(["hired", "rejected", "withdrawn"]);

export function ApplicantsCard() {
  const { data: opportunities, isLoading } = useRecruitmentOpportunities();

  const { hireRate, remaining, totalApplications, openOpportunities } = useMemo(() => {
    const rows = opportunities ?? [];
    let total = 0;
    let hired = 0;
    let active = 0;
    for (const opp of rows) {
      total += opp.total;
      hired += opp.stages.hired ?? 0;
      for (const [stage, count] of Object.entries(opp.stages)) {
        if (!TERMINAL_STAGES.has(stage)) active += count ?? 0;
      }
    }
    return {
      hireRate: total > 0 ? Math.round((hired / total) * 1000) / 10 : 0,
      remaining: active,
      totalApplications: total,
      openOpportunities: rows.filter((o) => o.status === "published").length,
    };
  }, [opportunities]);

  const data = {
    datasets: [
      {
        data: [hireRate, Math.max(0, 100 - hireRate)],
        backgroundColor: ["#22c55e", "#f1f5f9"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <Card className="border-0 shadow-sm rounded-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Applicants Summary</span>
            <Info size={14} className="text-slate-400 cursor-pointer" />
          </div>
          <button className="p-2 hover:bg-slate-200 rounded-full transition-colors bg-slate-100/50">
            <MoreHorizontal size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="space-y-4">
            <div>
              <div className="text-4xl font-bold text-slate-900 leading-tight">
                {isLoading ? "—" : `${hireRate}%`}
              </div>
              <div className="text-sm text-slate-400 mt-1">Hire rate, all time</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-slate-500">
                In progress{" "}
                <span className="text-slate-900 font-bold">{isLoading ? "—" : remaining}</span>
              </div>
              <div className="text-sm text-slate-500">
                {isLoading ? "—" : totalApplications} applications across{" "}
                {isLoading ? "—" : openOpportunities} open roles
              </div>
            </div>
          </div>

          <div className="relative h-32 w-32">
            <Doughnut data={data} options={options} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
