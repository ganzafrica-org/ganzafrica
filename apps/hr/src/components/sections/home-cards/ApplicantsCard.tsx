"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Info, PawPrint, TrendingDown } from "lucide-react"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

export function ApplicantsCard() {
    const data = {
        datasets: [
            {
                data: [78.19, 21.81],
                backgroundColor: ["#22c55e", "#f1f5f9"],
                borderWidth: 0,
                cutout: "70%",
            },
        ],
    }

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
    }

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
                            <div className="text-4xl font-bold text-slate-900 leading-tight">78.19%</div>
                            <div className="text-sm text-slate-400 mt-1">Jan, 2022</div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm font-medium text-slate-500">
                                Remaining <span className="text-slate-900 font-bold">3,992</span>
                            </div>
                            <div className="flex items-center gap-1 text-white font-medium">
                                <div className="rounded-full bg-brand-accent p-1">
                                    <TrendingDown size={12} className="rotate-180" />
                                </div>
                                <span>1.25% vs Last month</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-32 w-32">
                        <Doughnut data={data} options={options} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}