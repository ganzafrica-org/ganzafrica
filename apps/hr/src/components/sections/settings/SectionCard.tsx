import React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface SectionCardProps {
    title: string
    children: React.ReactNode
}

export function SectionCard({ title, children }: SectionCardProps) {
    return (
        <Card className="border-neutral-200 dark:border-neutral-800">
            <CardContent className="pt-4">
                <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {title}
                    </div>
                </div>
                {children}
            </CardContent>
        </Card>
    )
}