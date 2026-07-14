"use client"

import React, { useEffect } from "react"
import { OrganizationChart } from 'primereact/organizationchart'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import 'primereact/resources/themes/lara-light-green/theme.css'
import 'primereact/resources/primereact.min.css'
import { orgData } from "@/data/org-chat-data"

const nodeTemplate = (node: any) => {
    return (
        <div className="p-4 rounded-lg bg-white dark:bg-slate-300 shadow-sm min-w-[200px]">
            <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-white font-bold text-default">
                    {node.data.avatar}
                </div>
                <div className="text-center">
                    <div className="font-bold text-slate-900 text-default">{node.data.name}</div>
                    <div className="text-small font-semibold text-brand-accent uppercase tracking-wider">{node.data.role}</div>
                </div>
            </div>
        </div>
    )
}

export default function OrgChartPage() {
    useEffect(() => {
        const style = document.createElement("style")
        style.innerHTML = `
            .p-organizationchart .p-organizationchart-line-down {
                background: #cbd5e1;
            }
            .p-organizationchart .p-organizationchart-line-left,
            .p-organizationchart .p-organizationchart-line-right,
            .p-organizationchart .p-organizationchart-line-top {
                border-color: #cbd5e1;
            }
        `
        document.head.appendChild(style)
        return () => { document.head.removeChild(style) }
    }, [])

    return (
        <div className="min-h-screen p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-big font-bold text-slate-900 dark:text-white">Organization Chart</h1>
                    <Button variant="outline" className="bg-white hover:bg-brand-accent hover:text-white border-none">
                        <Plus className="mr-2 h-4 w-4" /> Add an Employee
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-8 overflow-auto shadow-sm flex justify-center min-h-[100%]">
                    <OrganizationChart
                        value={orgData}
                        nodeTemplate={nodeTemplate}
                        className="company-org-chart"
                    />
                </div>
            </div>
        </div>
    )
}