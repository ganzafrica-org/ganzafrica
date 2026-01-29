"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
    Clock,
    Users,
    Calendar as CalendarIcon,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Download,
    Eye,
    Edit,
    MoreVertical,
    Timer,
    MapPin,
    Briefcase,
    TrendingUp,
    UserCheck,
    Building
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

// Dummy attendance data with enhanced features
const attendanceData = [
    {
        id: 1,
        employeeId: "GZ001",
        name: "Jean Baptiste Mukamana",
        department: "Human Resources",
        date: "2024-12-10",
        checkIn: "08:15",
        checkOut: "17:30",
        totalHours: "9h 15m",
        status: "present",
        attendanceType: "office",
        location: "Kigali Office",
        project: "HR System Implementation",
        task: "Employee onboarding review",
        managerApproval: true,
        overtime: "1h 15m",
        breaks: "1h 00m",
        leaveStatus: null
    },
    {
        id: 2,
        employeeId: "GZ002",
        name: "Marie Claire Nsengimana",
        department: "Agriculture",
        date: "2024-12-10",
        checkIn: "08:45",
        checkOut: "17:15",
        totalHours: "8h 30m",
        status: "late",
        attendanceType: "field",
        location: "Musanze Field Site",
        project: "Sustainable Farming Initiative",
        task: "Field data collection",
        managerApproval: true,
        overtime: "0h 00m",
        breaks: "1h 00m",
        leaveStatus: null
    },
    {
        id: 3,
        employeeId: "GZ003",
        name: "David Niyonkuru",
        department: "Fellowship Program",
        date: "2024-12-10",
        checkIn: "09:00",
        checkOut: "18:00",
        totalHours: "9h 00m",
        status: "present",
        attendanceType: "training",
        location: "Youth Development Workshop",
        project: "Fellowship Training Program",
        task: "Attend leadership workshop",
        managerApproval: true,
        overtime: "1h 00m",
        breaks: "1h 00m",
        leaveStatus: null
    },
    {
        id: 4,
        employeeId: "GZ004",
        name: "Grace Mukamana",
        department: "Environment",
        date: "2024-12-10",
        checkIn: "-",
        checkOut: "-",
        totalHours: "0h 00m",
        status: "on_leave",
        attendanceType: "leave",
        location: "-",
        project: "Climate Adaptation Project",
        task: "-",
        managerApproval: false,
        overtime: "0h 00m",
        breaks: "0h 00m",
        leaveStatus: "Annual Leave"
    },
    {
        id: 5,
        employeeId: "GZ005",
        name: "Emmanuel Nshimiyimana",
        department: "Land Management",
        date: "2024-12-10",
        checkIn: "-",
        checkOut: "-",
        totalHours: "0h 00m",
        status: "pending_approval",
        attendanceType: "no_task",
        location: "Remote",
        project: "Land Registry System",
        task: "No tasks assigned",
        managerApproval: false,
        overtime: "0h 00m",
        breaks: "0h 00m",
        leaveStatus: null
    }
]

// Weekly attendance chart data
const weeklyAttendanceData = [
    { day: "Mon", present: 78, late: 5, absent: 2, onLeave: 3 },
    { day: "Tue", present: 80, late: 3, absent: 2, onLeave: 3 },
    { day: "Wed", present: 82, late: 2, absent: 1, onLeave: 2 },
    { day: "Thu", present: 79, late: 4, absent: 2, onLeave: 3 },
    { day: "Fri", present: 75, late: 6, absent: 4, onLeave: 3 },
]

// Attendance types data
const attendanceTypesData = [
    { type: "Office", count: 45, percentage: 52 },
    { type: "Field Work", count: 28, percentage: 32 },
    { type: "Training/Events", count: 8, percentage: 9 },
    { type: "Remote", count: 6, percentage: 7 }
]

// Event attendance data
const eventAttendanceData = [
    {
        id: 1,
        eventName: "Climate Change Workshop",
        date: "2024-12-10",
        type: "Training",
        targetGroup: "All Staff",
        totalInvited: 85,
        attendees: 72,
        status: "ongoing"
    },
    {
        id: 2,
        eventName: "Youth Leadership Seminar",
        date: "2024-12-08",
        type: "Workshop",
        targetGroup: "Fellows",
        totalInvited: 25,
        attendees: 23,
        status: "completed"
    },
    {
        id: 3,
        eventName: "Quarterly Review Meeting",
        date: "2024-12-05",
        type: "Meeting",
        targetGroup: "Management",
        totalInvited: 12,
        attendees: 11,
        status: "completed"
    }
]

const chartConfig = {
    present: {
        label: "Present",
        color: "#10b981",
    },
    late: {
        label: "Late",
        color: "#f59e0b",
    },
    absent: {
        label: "Absent",
        color: "#ef4444",
    },
    onLeave: {
        label: "On Leave",
        color: "#8b5cf6",
    },
} satisfies ChartConfig

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'present':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Present</Badge>
        case 'late':
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Late</Badge>
        case 'absent':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Absent</Badge>
        case 'on_leave':
            return <Badge className="bg-purple-100 text-purple-800 border-purple-200">On Leave</Badge>
        case 'pending_approval':
            return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getAttendanceTypeBadge = (type: string) => {
    switch (type) {
        case 'office':
            return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Office</Badge>
        case 'field':
            return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Field Work</Badge>
        case 'training':
            return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Training/Event</Badge>
        case 'remote':
            return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">Remote</Badge>
        case 'leave':
            return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Leave</Badge>
        case 'no_task':
            return <Badge className="bg-gray-100 text-gray-800 border-gray-200">No Task</Badge>
        default:
            return <Badge variant="outline">{type}</Badge>
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'present':
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'late':
            return <AlertCircle className="h-4 w-4 text-amber-600" />
        case 'absent':
            return <XCircle className="h-4 w-4 text-red-600" />
        case 'on_leave':
            return <CalendarIcon className="h-4 w-4 text-purple-600" />
        case 'pending_approval':
            return <Clock className="h-4 w-4 text-yellow-600" />
        default:
            return <Clock className="h-4 w-4 text-gray-600" />
    }
}

export default function AttendancePage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [departmentFilter, setDepartmentFilter] = useState("all")
    const [attendanceTypeFilter, setAttendanceTypeFilter] = useState("all")
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const filteredAttendance = attendanceData.filter(record => {
        const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || record.status === statusFilter
        const matchesDepartment = departmentFilter === "all" || record.department === departmentFilter
        const matchesType = attendanceTypeFilter === "all" || record.attendanceType === attendanceTypeFilter
        return matchesSearch && matchesStatus && matchesDepartment && matchesType
    })

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
            <div className="max-w-full space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                            Attendance Management
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button>
                            <Timer className="h-4 w-4" />
                            Bulk Check-in
                        </Button>
                    </div>
                </div>

                {/* Header Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">Today's Attendance</CardTitle>
                            <Users className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">94.2%</div>
                            <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-emerald-200">78</span> present, <span className="text-red-200">5</span> absent
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Late Arrivals</CardTitle>
                            <AlertCircle className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">5</div>
                            <p className="text-xs text-blue-100">
                                6% of present employees
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-100">Field Workers</CardTitle>
                            <Briefcase className="h-5 w-5 text-amber-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">28</div>
                            <p className="text-xs text-amber-100">
                                On project sites today
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Event Attendance</CardTitle>
                            <UserCheck className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">72</div>
                            <p className="text-xs text-purple-100">
                                Climate workshop attendees
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="daily" className="space-y-6">
                    <TabsList className="bg-white shadow-sm border w-full">
                        <TabsTrigger value="daily" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                            <Clock className="h-4 w-4 mr-2" />
                            Daily Attendance
                        </TabsTrigger>
                        <TabsTrigger value="events" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Event Attendance
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="approvals" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approvals
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily" className="space-y-6">
                        {/* Controls */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search employees..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[150px] border-slate-200">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="present">Present</SelectItem>
                                                <SelectItem value="late">Late</SelectItem>
                                                <SelectItem value="absent">Absent</SelectItem>
                                                <SelectItem value="on_leave">On Leave</SelectItem>
                                                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={attendanceTypeFilter} onValueChange={setAttendanceTypeFilter}>
                                            <SelectTrigger className="w-[150px] border-slate-200">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="office">Office</SelectItem>
                                                <SelectItem value="field">Field Work</SelectItem>
                                                <SelectItem value="training">Training/Event</SelectItem>
                                                <SelectItem value="remote">Remote</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-[180px] justify-start text-left font-normal border-slate-200",
                                                        !selectedDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={selectedDate}
                                                    onSelect={(date) => date && setSelectedDate(date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Attendance Table */}
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                    Daily Attendance - {format(selectedDate, "MMMM d, yyyy")}
                                </CardTitle>
                                <CardDescription>Real-time attendance tracking across all work types</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Check In</TableHead>
                                            <TableHead>Check Out</TableHead>
                                            <TableHead>Total Hours</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Project/Task</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAttendance.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                                                {record.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{record.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {record.employeeId} • {record.department}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {getAttendanceTypeBadge(record.attendanceType)}
                                                        {record.leaveStatus && (
                                                            <div className="text-xs text-purple-600">
                                                                {record.leaveStatus}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(record.status)}
                                                        <span className={record.status === 'late' ? 'text-amber-600' : ''}>{record.checkIn}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{record.checkOut}</TableCell>
                                                <TableCell className="font-medium">{record.totalHours}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {getStatusBadge(record.status)}
                                                        {!record.managerApproval && record.status === 'pending_approval' && (
                                                            <div className="text-xs text-amber-600">Awaiting manager approval</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-sm">{record.project}</div>
                                                        <div className="text-xs text-muted-foreground">{record.task}</div>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                                            <span>{record.location}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Record
                                                            </DropdownMenuItem>
                                                            {record.status === 'pending_approval' && (
                                                                <DropdownMenuItem className="text-green-600">
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Approve Attendance
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <Timer className="mr-2 h-4 w-4" />
                                                                Manual Check-in/out
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-6">
                        {/* Event Attendance Cards */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {eventAttendanceData.map((event) => (
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
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        {/* Charts Row */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Weekly Attendance Trends */}
                            <Card>
                                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        Weekly Attendance Trends
                                    </CardTitle>
                                    <CardDescription>Daily attendance patterns this week</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ChartContainer config={chartConfig} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={weeklyAttendanceData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="day" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="present" fill="var(--color-present)" />
                                                <Bar dataKey="late" fill="var(--color-late)" />
                                                <Bar dataKey="absent" fill="var(--color-absent)" />
                                                <Bar dataKey="onLeave" fill="var(--color-onLeave)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Attendance Types Distribution */}
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-blue-600" />
                                        Attendance Types
                                    </CardTitle>
                                    <CardDescription>Work location distribution</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {attendanceTypesData.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <Building className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.type}</p>
                                                        <p className="text-sm text-muted-foreground">{item.count} employees</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-blue-600">{item.percentage}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                                    <CardTitle className="text-center">Overall Attendance Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center p-6">
                                    <div className="text-4xl font-bold text-green-600">94.2%</div>
                                    <p className="text-sm text-muted-foreground mt-2">This month average</p>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Target:</span>
                                            <span className="font-medium">95%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Last month:</span>
                                            <span className="font-medium">92.8%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                                    <CardTitle className="text-center">Punctuality Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center p-6">
                                    <div className="text-4xl font-bold text-blue-600">87.5%</div>
                                    <p className="text-sm text-muted-foreground mt-2">On-time arrivals</p>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Late arrivals:</span>
                                            <span className="font-medium text-amber-600">12.5%</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Avg. late time:</span>
                                            <span className="font-medium">23 min</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
                                    <CardTitle className="text-center">Field Work Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center p-6">
                                    <div className="text-4xl font-bold text-purple-600">32%</div>
                                    <p className="text-sm text-muted-foreground mt-2">Field-based attendance</p>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>Projects active:</span>
                                            <span className="font-medium">12</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Field sites:</span>
                                            <span className="font-medium">8</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="approvals" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-yellow-600" />
                                    Pending Approvals
                                </CardTitle>
                                <CardDescription>Attendance records requiring manager approval</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {attendanceData
                                        .filter(record => record.status === 'pending_approval')
                                        .map((record) => (
                                            <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-yellow-100 text-yellow-700">
                                                            {record.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{record.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {record.department} • {record.task || 'No task assigned'}
                                                        </p>
                                                        <p className="text-xs text-yellow-700">
                                                            Reason: {record.attendanceType === 'no_task' ? 'No tasks assigned for the day' : 'Manual attendance entry'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="destructive">
                                                        <XCircle className="h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                    <Button>
                                                        <CheckCircle className="h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    {attendanceData.filter(record => record.status === 'pending_approval').length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                            <p>No pending approvals</p>
                                            <p className="text-sm">All attendance records are up to date</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}