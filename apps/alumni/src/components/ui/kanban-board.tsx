"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    MoreVertical,
    Calendar,
    Mail,
    Phone,
    MapPin,
    TrendingUp,
    Bot
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface KanbanItem {
    id: string
    title: string
    subtitle?: string
    description?: string
    status: string
    priority?: 'low' | 'medium' | 'high'
    assignee?: {
        name: string
        avatar?: string
    }
    metadata?: Record<string, any>
    tags?: string[]
    date?: string
}

export interface KanbanColumn {
    id: string
    title: string
    items: KanbanItem[]
    color?: string
    maxItems?: number
}

interface KanbanBoardProps {
    columns: KanbanColumn[]
    onItemMove?: (itemId: string, fromColumn: string, toColumn: string) => void
    onItemClick?: (item: KanbanItem) => void
    onItemAction?: (action: string, item: KanbanItem) => void
    className?: string
}

export function KanbanBoard({
                                columns,
                                onItemMove,
                                onItemClick,
                                onItemAction,
                                className = ""
                            }: KanbanBoardProps) {
    const [draggedItem, setDraggedItem] = useState<KanbanItem | null>(null)
    const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null)
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

    const handleDragStart = (e: React.DragEvent, item: KanbanItem, columnId: string) => {
        setDraggedItem(item)
        setDraggedFromColumn(columnId)
        e.dataTransfer.effectAllowed = 'move'

        e.currentTarget.classList.add('opacity-50')
    }

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('opacity-50')
        setDraggedItem(null)
        setDraggedFromColumn(null)
        setDragOverColumn(null)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDragEnter = (e: React.DragEvent, columnId: string) => {
        e.preventDefault()
        setDragOverColumn(columnId)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()

        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOverColumn(null)
        }
    }

    const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
        e.preventDefault()
        setDragOverColumn(null)

        if (draggedItem && draggedFromColumn && draggedFromColumn !== targetColumnId) {
            onItemMove?.(draggedItem.id, draggedFromColumn, targetColumnId)
        }

        setDraggedItem(null)
        setDraggedFromColumn(null)
    }

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700 border-red-200'
            case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    const getColumnHeaderColor = (columnId: string) => {
        switch (columnId) {
            case 'applied': return 'bg-gradient-to-r from-blue-500 to-blue-600'
            case 'screening': return 'bg-gradient-to-r from-amber-500 to-orange-500'
            case 'interview': return 'bg-gradient-to-r from-purple-500 to-indigo-500'
            case 'assessment': return 'bg-gradient-to-r from-orange-500 to-red-500'
            case 'final': return 'bg-gradient-to-r from-indigo-500 to-purple-600'
            case 'offer': return 'bg-gradient-to-r from-emerald-500 to-green-600'
            case 'hired': return 'bg-gradient-to-r from-green-600 to-emerald-700'
            case 'rejected': return 'bg-gradient-to-r from-red-500 to-red-600'
            default: return 'bg-gradient-to-r from-slate-500 to-slate-600'
        }
    }

    return (
        <div className={`flex gap-6 overflow-x-auto pb-4 ${className}`}>
            {columns.map((column) => (
                <div
                    key={column.id}
                    className="flex-shrink-0 w-80"
                    onDragOver={handleDragOver}
                    onDragEnter={(e) => handleDragEnter(e, column.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, column.id)}
                >
                    <div className={`rounded-xl shadow-sm transition-all duration-200 ${dragOverColumn === column.id ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-lg' : ''}`}>
                        
                        <div className={`${getColumnHeaderColor(column.id)} text-white rounded-t-xl p-4`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm">{column.title}</h3>
                                    <Badge className="bg-white/20 text-white border-white/30 text-xs">
                                        {column.items.length}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20">
                                    <MoreVertical className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        
                        <div className="bg-slate-50 rounded-b-xl p-4 min-h-[600px] max-h-[600px] overflow-y-auto">
                            <div className="space-y-3">
                                {column.items.map((item) => (
                                    <Card
                                        key={item.id}
                                        className="group cursor-pointer hover:shadow-lg transition-all duration-200 bg-white border-0 shadow-sm hover:-translate-y-1"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, item, column.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={() => onItemClick?.(item)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                                            {item.title}
                                                        </h4>
                                                        {item.subtitle && (
                                                            <p className="text-xs text-slate-500 mt-1 truncate">{item.subtitle}</p>
                                                        )}
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <MoreVertical className="h-3 w-3" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => onItemAction?.('view', item)}>
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onItemAction?.('edit', item)}>
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onItemAction?.('schedule', item)}>
                                                                Schedule Interview
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onItemAction?.('email', item)}>
                                                                Send Email
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                
                                                {item.description && (
                                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                        {item.description}
                                                    </p>
                                                )}

                                                
                                                {item.metadata?.cvScore && (
                                                    <div className="flex items-center gap-2">
                                                        <Bot className="h-3 w-3 text-purple-500" />
                                                        <span className="text-xs text-slate-600">CV Score:</span>
                                                        <Badge className={`text-xs ${
                                                            item.metadata.cvScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                                item.metadata.cvScore >= 60 ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                        }`}>
                                                            {item.metadata.cvScore}%
                                                        </Badge>
                                                    </div>
                                                )}

                                                
                                                {item.metadata && (
                                                    <div className="space-y-1">
                                                        {item.metadata.email && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                <Mail className="h-3 w-3 text-blue-500" />
                                                                <span className="truncate">{item.metadata.email}</span>
                                                            </div>
                                                        )}
                                                        {item.metadata.phone && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                <Phone className="h-3 w-3 text-emerald-500" />
                                                                <span>{item.metadata.phone}</span>
                                                            </div>
                                                        )}
                                                        {item.metadata.location && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                <MapPin className="h-3 w-3 text-amber-500" />
                                                                <span className="truncate">{item.metadata.location}</span>
                                                            </div>
                                                        )}
                                                        {item.metadata.experience && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                <TrendingUp className="h-3 w-3 text-purple-500" />
                                                                <span>{item.metadata.experience} experience</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                
                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.tags.slice(0, 3).map((tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 transition-colors"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {item.tags.length > 3 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border-slate-200"
                                                            >
                                                                +{item.tags.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}

                                                
                                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        {item.priority && (
                                                            <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                                                                {item.priority}
                                                            </Badge>
                                                        )}
                                                        {item.date && (
                                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                                <Calendar className="h-3 w-3" />
                                                                {item.date}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {item.assignee && (
                                                        <Avatar className="w-6 h-6">
                                                            {item.assignee.avatar ? (
                                                                <AvatarImage src={item.assignee.avatar} />
                                                            ) : (
                                                                <AvatarFallback className="text-xs bg-gradient-to-br from-emerald-500 to-blue-500 text-white">
                                                                    {item.assignee.name.charAt(0)}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                
                                {column.items.length === 0 && (
                                    <div className="flex items-center justify-center h-32 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-lg">
                                        No applications
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}