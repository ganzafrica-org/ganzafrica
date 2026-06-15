"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Clock, CheckCircle, ThumbsUp, TrendingUp } from "lucide-react"

export const TicketStats = () => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-100">Open Tickets</CardTitle>
                    <MessageSquare className="h-5 w-5 text-emerald-200" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">23</div>
                    <p className="text-xs text-emerald-100 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-emerald-200">5</span> new today
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-100">Avg. Response Time</CardTitle>
                    <Clock className="h-5 w-5 text-blue-200" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">2.4h</div>
                    <p className="text-xs text-blue-100 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-green-200">-0.5h</span> from last week
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-amber-100">Resolution Rate</CardTitle>
                    <CheckCircle className="h-5 w-5 text-amber-200" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">94%</div>
                    <p className="text-xs text-amber-100">
                        This month
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-100">Customer Satisfaction</CardTitle>
                    <ThumbsUp className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">4.6</div>
                    <p className="text-xs text-purple-100">
                        Out of 5.0 rating
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
