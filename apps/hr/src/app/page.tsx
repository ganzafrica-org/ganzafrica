"use client"

import React, { useEffect, useState } from "react"
import { LeaveSummaryCard } from "@/components/sections/home-cards/LeaveSummaryCard"
import { ScheduleCard } from "@/components/sections/home-cards/ScheduleCard"
import { EmploymentStatusCard } from "@/components/sections/home-cards/EmploymentStatusCard"
import { ApplicantsCard } from "@/components/sections/home-cards/ApplicantsCard"
import { SystemAlertsCard } from "@/components/sections/home-cards/SystemAlertsCard"
import { StatsHeader } from "@/components/sections/header"
import { useAuth } from "@/hooks/useAuth"



const getGreeting = (name?: string): string => {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"
    return name ? `${greeting}, ${name}!` : `${greeting}!`
}

export default function Dashboard() {
    const { user } = useAuth()
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null

        const onScroll = () => {
            const y = mainEl ? mainEl.scrollTop : window.scrollY
            setScrolled(y > 10)
        }

        onScroll()
        if (mainEl) {
            mainEl.addEventListener("scroll", onScroll, { passive: true })
        }
        window.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            if (mainEl) {
                mainEl.removeEventListener("scroll", onScroll)
            }
            window.removeEventListener("scroll", onScroll)
        }
    }, [])

    const title = user ? getGreeting(user.name) : "Hi!"

    return (
        <div className="flex flex-col gap-6 w-full pb-6">
            <StatsHeader title={title} scrolled={scrolled} ClassName="w-full"/>
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="grid gap-6 md:grid-cols-2 flex-1">
                    <LeaveSummaryCard />
                    <EmploymentStatusCard />
                    <ApplicantsCard />
                    <SystemAlertsCard />
                </div>
                <div className="w-full xl:w-[40%]">
                    <ScheduleCard />
                </div>
            </div>
        </div>
    )
}