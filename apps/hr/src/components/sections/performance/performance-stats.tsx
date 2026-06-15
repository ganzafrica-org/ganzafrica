import React from "react"
import { StatGrid } from "@/components/sections/stat-grid"
import { Trophy, Target, CheckCircle, Star } from "lucide-react"

export const PerformanceStats = () => {
    const stats = [
        {
            title: "Average Rating",
            value: "4.2",
            trendText: "+0.3 from last quarter",
            icon: Star,
            color: "" // No color means white card
        },
        {
            title: "Goal Completion",
            value: "85%",
            trendText: "Q4 2024 average",
            icon: Target,
            color: "" // White card
        },
        {
            title: "Reviews Completed",
            value: "68",
            trendText: "15 pending reviews",
            icon: CheckCircle,
            color: "from-orange-400 to-orange-500"
        },
        {
            title: "High Performers",
            value: "23",
            trendText: "Rating 4.5+ employees",
            icon: Trophy,
            color: "from-purple-500 to-indigo-600"
        }
    ]

    return <StatGrid stats={stats} />
}
