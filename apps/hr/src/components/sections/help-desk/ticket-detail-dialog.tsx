"use client"

import React from "react"
import { MessageSquare, Tag, ThumbsUp } from "lucide-react"
import { ReusableSheet } from "../sheets/sheet-component"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface TicketDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ticket: any;
    getStatusBadge: (status: string) => React.ReactNode;
    getPriorityBadge: (priority: string) => React.ReactNode;
    getCategoryIcon: (category: string) => React.ReactNode;
    formatTimeAgo: (dateString: string) => string;
}

export const TicketDetailDialog = ({
    open,
    onOpenChange,
    ticket,
    getStatusBadge,
    getPriorityBadge,
    getCategoryIcon,
    formatTimeAgo
}: TicketDetailDialogProps) => {
    if (!ticket) return null

    return (
        <ReusableSheet
            open={open}
            onOpenChange={onOpenChange}
            title={`Ticket Details - ${ticket.id}`}
            description={ticket.title}
            maxWidth="sm:max-w-[700px]"
            footer={
                <div className="flex w-full gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button variant="outline" className="flex-1">
                        Update Status
                    </Button>
                    <Button className="flex-1 bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white font-bold">
                        <MessageSquare className="mr-2 h-4 w-4" /> Reply
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 p-6">
                <div className="grid grid-cols-2 gap-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Submitted By</Label>
                            <div className="flex items-center space-x-2 mt-1">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                        {/* Use optional chaining or coalescing to prevent the crash */}
                                        {(ticket.submittedBy ?? "")
                                            .split(' ')
                                            .map((n: string) => n[0])
                                            .join('')
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    {/* Display "N/A" or handle empty string if the name is missing */}
                                    <p className="text-sm font-medium">{ticket.submittedBy ?? "N/A"}</p>
                                    <p className="text-xs text-muted-foreground">{ticket.submittedByEmail ?? ""}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Department</Label>
                            <p className="text-sm mt-1">{ticket.department}</p>
                        </div>
                        <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Description</Label>
                            <p className="text-sm mt-1 text-muted-foreground leading-relaxed">{ticket.description}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Status</Label>
                                <div className="mt-1">{getStatusBadge(ticket.status)}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] uppercase font-bold text-slate-400">Priority</Label>
                                <div className="mt-1">{getPriorityBadge(ticket.priority)}</div>
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Category</Label>
                            <div className="flex items-center gap-2 mt-1">
                                {getCategoryIcon(ticket.category)}
                                <span className="text-sm">{ticket.category}</span>
                            </div>
                        </div>
                        <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Assigned To</Label>
                            <p className="text-sm mt-1">{ticket.assignedTo}</p>
                        </div>
                        <div>
                            <Label className="text-[10px] uppercase font-bold text-slate-400">Created</Label>
                            <p className="text-sm mt-1">{new Date(ticket.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Tags</Label>
                    <div className="flex gap-2 mt-1">
                        {(ticket.tags ?? []).map((tag: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                <Tag className="mr-1 h-3 w-3" />
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>

                {ticket.videoUrl && (
                    <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl mb-4">
                        <Label className="text-[10px] uppercase font-bold text-green-700">Video</Label>
                        <div className="mt-2">
                            <video src={ticket.videoUrl} className="w-full h-auto rounded-xl" controls autoPlay muted />
                        </div>
                    </div>
                )}

                <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Conversation</Label>
                    <div className="mt-2 space-y-3">
                        {(ticket.messages ?? []).map((message: any) => (
                            <div key={message.id} className="border rounded-xl p-4 bg-white shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold">{message.author}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {/* Optional chaining on timestamp is also a good safety practice */}
                                        {formatTimeAgo(message?.timestamp)}
                                    </span>
                                </div>
                                <p className="text-sm leading-relaxed text-slate-600">{message.message}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Add Reply</Label>
                    <div className="mt-2 relative">
                        <Textarea
                            placeholder="Type your response here..."
                            className="min-h-[100px] rounded-xl border-slate-200"
                        />
                    </div>
                </div>

                {ticket.satisfaction && (
                    <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
                        <Label className="text-[10px] uppercase font-bold text-green-700">Customer Satisfaction</Label>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <ThumbsUp key={i} className={`h-4 w-4 ${i < ticket.satisfaction ? 'text-green-500 fill-green-500' : 'text-gray-300'
                                        }`} />
                                ))}
                            </div>
                            <span className="text-sm font-bold text-green-700">
                                {ticket.satisfaction}/5 stars
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </ReusableSheet>
    )
}
