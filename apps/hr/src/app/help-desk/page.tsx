"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { MessageSquare, HelpCircle, BarChart3, Zap, Users, MessageCircle } from "lucide-react"
import { ChartConfig } from "@/components/ui/chart"
import { TicketFilters } from "@/components/sections/help-desk/ticket-filters"
import { TicketTable } from "@/components/sections/help-desk/ticket-table"
import { TicketDetailDialog } from "@/components/sections/help-desk/ticket-detail-dialog"
import { StatsHeader } from "@/components/sections/header"
import { HelpDeskStats } from "@/data/Header-data"
import ChatWidget from "@/components/sections/help-desk/chat-widget"
import { useGetHelpdeskTickets } from "@/hooks/useHelpdesk"

const chartConfig = {
    tickets: { label: "Tickets", color: "#10b981" },
    resolved: { label: "Resolved", color: "#3b82f6" },
    avgTime: { label: "Avg Time (days)", color: "#f59e0b" },
    count: { label: "Count", color: "#8b5cf6" },
    avgHours: { label: "Average Hours", color: "#ef4444" },
    target: { label: "Target Hours", color: "#6b7280" },
} satisfies ChartConfig

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'open': return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Open</Badge>
        case 'in_progress': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>
        case 'resolved': return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>
        case 'closed': return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>
        case 'escalated': return <Badge className="bg-red-100 text-red-800 border-red-200">Escalated</Badge>
        default: return <Badge variant="outline">{status}</Badge>
    }
}

const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'low': return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>
        case 'medium': return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Medium</Badge>
        case 'high': return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>
        case 'critical': return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>
        default: return <Badge variant="outline">{priority}</Badge>
    }
}

const getCategoryIcon = (category: string) => {
    switch (category?.toUpperCase()) {
        case 'IT': return <Zap className="h-4 w-4" />
        case 'HR': return <Users className="h-4 w-4" />
        case 'GENERAL': return <HelpCircle className="h-4 w-4" />
        case 'FINANCE': return <BarChart3 className="h-4 w-4" />
        case 'SECURITY': return <MessageCircle className="h-4 w-4" />
        default: return <MessageSquare className="h-4 w-4" />
    }
}

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
}

const Page = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")
    const [selectedTicket, setSelectedTicket] = useState<any>(null)
    const [showTicketDialog, setShowTicketDialog] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    const { data: tickets, isLoading, isError } = useGetHelpdeskTickets()

    const ticketList = Array.isArray(tickets) ? tickets : []

    const filteredTickets = ticketList.filter(ticket => {
        const matchesSearch =
            ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.description?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || ticket.status?.toLowerCase() === statusFilter
        const matchesCategory = categoryFilter === "all" || ticket.category?.toUpperCase() === categoryFilter.toUpperCase()
        const matchesPriority = priorityFilter === "all" || ticket.priority?.toLowerCase() === priorityFilter
        return matchesSearch && matchesStatus && matchesCategory && matchesPriority
    })

    return (
        <div className="min-h-screen w-full flex flex-col">
            <div className="space-y-6">
                <StatsHeader
                    title="Help Desk"
                    subtitle="Help Desk Management"
                    scrolled={scrolled}
                    stats={HelpDeskStats}
                />
                <div className="flex flex-col gap-6">
                    <Tabs defaultValue="tickets" className="flex flex-col gap-6">
                        <TabsContent value="tickets" className="flex flex-col gap-6 mt-0">
                            <TicketFilters
                                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                                statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                                categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
                                priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter}
                            />

                            {isLoading && (
                                <div className="flex items-center justify-center py-12 text-muted-foreground">
                                    Loading tickets...
                                </div>
                            )}

                            {isError && (
                                <div className="flex items-center justify-center py-12 text-red-500">
                                    Failed to load tickets. Please try again.
                                </div>
                            )}

                            {!isLoading && !isError && (
                                <TicketTable
                                    tickets={filteredTickets}
                                    onViewDetails={(ticket) => {
                                        setSelectedTicket(ticket)
                                        setShowTicketDialog(true)
                                    }}
                                    getStatusBadge={getStatusBadge}
                                    getPriorityBadge={getPriorityBadge}
                                    getCategoryIcon={getCategoryIcon}
                                    formatTimeAgo={formatTimeAgo}
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <TicketDetailDialog
                    open={showTicketDialog}
                    onOpenChange={setShowTicketDialog}
                    ticket={selectedTicket}
                    getStatusBadge={getStatusBadge}
                    getPriorityBadge={getPriorityBadge}
                    getCategoryIcon={getCategoryIcon}
                    formatTimeAgo={formatTimeAgo}
                />
            </div>
            <div className="fixed bottom-0 right-0">
                <ChatWidget />
            </div>
        </div>
    )
}

export default Page