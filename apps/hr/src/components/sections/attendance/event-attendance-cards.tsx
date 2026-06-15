import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Eye, Edit, Download, Calendar as CalendarIcon, UserCheck } from "lucide-react"
import { format } from "date-fns"

interface EventAttendanceCardsProps {
    data: any[]
}

export const EventAttendanceCards = ({ data }: EventAttendanceCardsProps) => {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-all duration-300 border border-slate-200">
                    <CardHeader className="pb-3 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-lg">{event.eventName}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                                        {event.type}
                                    </Badge>
                                    <Badge variant="outline" className="border-slate-200">
                                        {event.targetGroup}
                                    </Badge>
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Attendees
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Mark Attendance
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Download className="mr-2 h-4 w-4" />
                                        Export List
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(event.date), "MMMM d, yyyy")}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Attendance Rate</span>
                                <span className="font-medium">
                                    {Math.round((event.attendees / event.totalInvited) * 100)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(event.attendees / event.totalInvited) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">
                                    {event.attendees} attended
                                </span>
                                <span className="text-muted-foreground">
                                    of {event.totalInvited} invited
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-3 border-t">
                            <Button variant="outline" size="sm" className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 border-green-200 text-green-600 hover:bg-green-50">
                                <UserCheck className="h-3 w-3 mr-1" />
                                Mark Attendance
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
