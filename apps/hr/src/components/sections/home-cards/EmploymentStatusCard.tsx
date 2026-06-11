"use client"

import React from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

export function EmploymentStatusCard () {
    return (
        <Card className="border-0 shadow-sm rounded-lg">
            <CardHeader className="flex flex-row justify-between">
                <CardTitle className="font-semibold text-slate-800 dark:text-slate-300">Employee Status</CardTitle>
                <button className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                    <MoreHorizontal size={18} className="text-slate-400" />
                </button>
            </CardHeader>
            <CardContent className="pb-3">

                {/* Bubble Area */}
                <div className="flex items-center justify-center overflow-hidden">
                    <div
                        className="relative scale-75 sm:scale-100"
                        style={{ width: "240px", height: "220px" }}
                    >
                        {/* Happy – large blue bubble (left) */}
                        <div
                            className="absolute rounded-full flex items-center justify-center"
                            style={{
                                width: "160px",
                                height: "160px",
                                top: "20px",
                                left: "0px",
                                backgroundColor: "rgba(187, 247, 208, 0.75)",
                            }}
                        >
                            <span className="text-white font-bold text-3xl">12</span>
                        </div>

                        {/* Neutral – medium blue bubble (right) */}
                        <div
                            className="absolute rounded-full flex items-center justify-center"
                            style={{
                                width: "120px",
                                height: "120px",
                                top: "40px",
                                left: "118px",
                                backgroundColor: "rgba(74, 222, 128, 0.75)",
                            }}
                        >
                            <span className="text-white font-bold text-xl">20</span>
                        </div>

                        {/* Other – small purple bubble (bottom center) */}
                        <div
                            className="absolute rounded-full flex items-center justify-center"
                            style={{
                                width: "72px",
                                height: "72px",
                                top: "152px",
                                left: "84px",
                                backgroundColor: "rgba(21, 128, 61, 0.75)",
                            }}
                        >
                            <span className="text-white font-bold text-sm">2</span>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: "rgba(187, 247, 208, 0.75)" }}
                        />
                        <span className="text-xs text-slate-500">Permanent</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: "rgba(74, 222, 128, 0.75)" }}
                        />
                        <span className="text-xs text-slate-500">contact</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: "rgba(21, 128, 61, 0.75)" }}
                        />
                        <span className="text-xs text-slate-500">Internship</span>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}