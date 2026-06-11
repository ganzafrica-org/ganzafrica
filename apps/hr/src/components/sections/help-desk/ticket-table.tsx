"use client"

import React from "react"
import { MessageSquare, MoreVertical, Eye, Edit, User, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { DataTable, ColumnDef } from "../table-component"


interface TicketTableProps {
    tickets: any[];
    onViewDetails: (ticket: any) => void;
    getStatusBadge: (status: string) => React.ReactNode;
    getPriorityBadge: (priority: string) => React.ReactNode;
    getCategoryIcon: (category: string) => React.ReactNode;
    formatTimeAgo: (dateString: string) => string;
}

export const TicketTable = ({
    tickets,
    onViewDetails,
    getStatusBadge,
    getPriorityBadge,
    getCategoryIcon,
    formatTimeAgo
}: TicketTableProps) => {
    const columns: ColumnDef<any>[] = [
        {
            key: "title",
            header: "Ticket",
            sortable: true,
            render: (_, ticket) => (
                <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-sm text-muted-foreground">{ticket.id}</div>
                    <div className="flex gap-1 mt-1">
                        {(ticket.tags ?? []).slice(0, 2).map((tag: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )
        },
        {
            key: "submittedBy",
            header: "Submitted By",
            sortable: true,
            render: (val, ticket) => (
                <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                            {/* Use optional chaining and default to empty string if val is null/undefined */}
                            {(val ?? "").split('').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        {/* Also make sure the display name handles missing values gracefully */}
                        <div className="text-sm font-medium">{val ?? "N/A"}</div>
                        <div className="text-xs text-muted-foreground">{ticket.department ?? "No Department"}</div>
                    </div>
                </div>
            )
        },
        {
            key: "category",
            header: "Category",
            sortable: true,
            render: (val) => (
                <div className="flex items-center gap-2">
                    {getCategoryIcon(val)}
                    <span className="text-sm">{val}</span>
                </div>
            )
        },
        {
            key: "priority",
            header: "Priority",
            sortable: true,
            render: (val) => getPriorityBadge(val)
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (val) => getStatusBadge(val)
        },
        {
            key: "assignedTo",
            header: "Assigned To",
            sortable: true,
            render: (val) => <span className="text-sm">{val}</span>
        },
        {
            key: "updatedAt",
            header: "Last Updated",
            sortable: true,
            render: (val) => <span className="text-sm">{formatTimeAgo(val)}</span>
        },
        {
            key: "actions",
            header: "Actions",
            align: "right",
            render: (_, ticket) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewDetails(ticket)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Reassign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Comment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ]

    return (
        <Card className="rounded-lg">
            <CardContent className="p-6">
                <DataTable
                    columns={columns}
                    data={tickets}
                    onRowClick={(ticket) => onViewDetails(ticket)}
                    showToolbar={false}
                />
            </CardContent>
        </Card>
    )
}
