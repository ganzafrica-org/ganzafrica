"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Calendar as CalendarIcon,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Download,
    Eye,
    MoreVertical,
    Plus,
    TrendingUp,
    Mail,
    User,
    Building,
    AlertTriangle
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns"

const leaveRequests = [
    {
        id: 1,
        employeeId: "GZ001",
        name: "Jean Baptiste Mukamana",
        department: "Human Resources",
        leaveType: "Annual Leave",
        startDate: "2024-12-20",
        endDate: "2024-12-27",
        days: 6,
        status: "pending",
        appliedDate: "2024-12-08",
        reason: "Family vacation during Christmas holidays",
        approver: "Sarah Uwimana",
        coveringEmployee: "Marie Claire Nsengimana"
    },
    {
        id: 2,
        employeeId: "GZ002",
        name: "Marie Claire Nsengimana",
        department: "Agriculture",
        leaveType: "Sick Leave",
        startDate: "2024-12-12",
        endDate: "2024-12-13",
        days: 2,
        status: "approved",
        appliedDate: "2024-12-11",
        reason: "Medical appointment and recovery",
        approver: "David Nshimiyimana",
        coveringEmployee: "Grace Mukamana"
    },
    {
        id: 3,
        employeeId: "GZ003",
        name: "David Niyonkuru",
        department: "Fellowship Program",
        leaveType: "Study Leave",
        startDate: "2024-12-15",
        endDate: "2024-12-19",
        days: 5,
        status: "approved",
        appliedDate: "2024-12-05",
        reason: "University examinations",
        approver: "Grace Uwimana",
        coveringEmployee: "Emmanuel Nshimiyimana"
    },
    {
        id: 4,
        employeeId: "GZ004",
        name: "Grace Mukamana",
        department: "Environment",
        leaveType: "Maternity Leave",
        startDate: "2025-01-15",
        endDate: "2025-04-15",
        days: 90,
        status: "approved",
        appliedDate: "2024-11-20",
        reason: "Maternity leave for childbirth",
        approver: "Sarah Uwimana",
        coveringEmployee: "Marie Claire Nsengimana"
    }
]

const leaveBalances = [
    {
        employeeId: "GZ001",
        name: "Jean Baptiste Mukamana",
        department: "Human Resources",
        position: "HR Manager",
        annualLeave: { used: 8, remaining: 14, total: 22 },
        sickLeave: { used: 3, remaining: 7, total: 10 },
        personalLeave: { used: 2, remaining: 3, total: 5 },
        carryOver: 2
    },
    {
        employeeId: "GZ002",
        name: "Marie Claire Nsengimana",
        department: "Agriculture",
        position: "Agricultural Specialist",
        annualLeave: { used: 12, remaining: 10, total: 22 },
        sickLeave: { used: 5, remaining: 5, total: 10 },
        personalLeave: { used: 1, remaining: 4, total: 5 },
        carryOver: 0
    },
    {
        employeeId: "GZ003",
        name: "David Niyonkuru",
        department: "Fellowship Program",
        position: "Youth Fellow",
        annualLeave: { used: 6, remaining: 16, total: 22 },
        sickLeave: { used: 1, remaining: 9, total: 10 },
        personalLeave: { used: 0, remaining: 5, total: 5 },
        carryOver: 3
    },
    {
        employeeId: "GZ004",
        name: "Grace Mukamana",
        department: "Environment",
        position: "Environmental Consultant",
        annualLeave: { used: 15, remaining: 7, total: 22 },
        sickLeave: { used: 2, remaining: 8, total: 10 },
        personalLeave: { used: 3, remaining: 2, total: 5 },
        carryOver: 1
    },
    {
        employeeId: "GZ005",
        name: "Emmanuel Nshimiyimana",
        department: "Land Management",
        position: "Land Surveyor",
        annualLeave: { used: 10, remaining: 12, total: 22 },
        sickLeave: { used: 4, remaining: 6, total: 10 },
        personalLeave: { used: 2, remaining: 3, total: 5 },
        carryOver: 1
    },
    {
        employeeId: "GZ006",
        name: "Patricia Uwimana",
        department: "Administration",
        position: "Administrative Assistant",
        annualLeave: { used: 18, remaining: 4, total: 22 },
        sickLeave: { used: 6, remaining: 4, total: 10 },
        personalLeave: { used: 4, remaining: 1, total: 5 },
        carryOver: 0
    }
]

const leaveCalendarData = [
    { date: "2024-12-12", employees: ["Marie Claire Nsengimana"], type: "sick" },
    { date: "2024-12-13", employees: ["Marie Claire Nsengimana"], type: "sick" },
    { date: "2024-12-15", employees: ["David Niyonkuru"], type: "study" },
    { date: "2024-12-16", employees: ["David Niyonkuru"], type: "study" },
    { date: "2024-12-17", employees: ["David Niyonkuru"], type: "study" },
    { date: "2024-12-18", employees: ["David Niyonkuru"], type: "study" },
    { date: "2024-12-19", employees: ["David Niyonkuru"], type: "study" },
    { date: "2024-12-20", employees: ["Jean Baptiste Mukamana"], type: "annual" },
    { date: "2024-12-21", employees: ["Jean Baptiste Mukamana"], type: "annual" },
    { date: "2024-12-22", employees: ["Jean Baptiste Mukamana"], type: "annual" },
    { date: "2024-12-23", employees: ["Jean Baptiste Mukamana"], type: "annual" },
    { date: "2024-12-24", employees: ["Jean Baptiste Mukamana"], type: "annual" },
    { date: "2024-12-27", employees: ["Jean Baptiste Mukamana"], type: "annual" },
]

const monthlyLeaveData = [
    { month: "Jan", annual: 45, sick: 12, personal: 8, maternity: 2 },
    { month: "Feb", annual: 38, sick: 15, personal: 6, maternity: 1 },
    { month: "Mar", annual: 52, sick: 8, personal: 10, maternity: 3 },
    { month: "Apr", annual: 67, sick: 20, personal: 12, maternity: 2 },
    { month: "May", annual: 43, sick: 6, personal: 9, maternity: 1 },
    { month: "Jun", annual: 59, sick: 18, personal: 15, maternity: 2 },
]

const leaveTypeDistribution = [
    { name: "Annual Leave", value: 65, fill: "#10b981" },
    { name: "Sick Leave", value: 20, fill: "#f59e0b" },
    { name: "Personal Leave", value: 10, fill: "#3b82f6" },
    { name: "Maternity/Paternity", value: 5, fill: "#8b5cf6" },
]

const chartConfig = {
    annual: {
        label: "Annual Leave",
        color: "#10b981",
    },
    sick: {
        label: "Sick Leave",
        color: "#f59e0b",
    },
    personal: {
        label: "Personal Leave",
        color: "#3b82f6",
    },
    maternity: {
        label: "Maternity/Paternity",
        color: "#8b5cf6",
    },
} satisfies ChartConfig

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
        case 'pending':
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getLeaveTypeColor = (type: string) => {
    switch (type) {
        case 'Annual Leave':
            return 'bg-green-100 text-green-800 border-green-200'
        case 'Sick Leave':
            return 'bg-amber-100 text-amber-800 border-amber-200'
        case 'Personal Leave':
            return 'bg-blue-100 text-blue-800 border-blue-200'
        case 'Maternity Leave':
            return 'bg-purple-100 text-purple-800 border-purple-200'
        case 'Study Leave':
            return 'bg-indigo-100 text-indigo-800 border-indigo-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

const LeaveCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const getLeaveForDate = (date: Date) => {
        return leaveCalendarData.find(leave =>
            isSameDay(new Date(leave.date), date)
        )
    }

    const getLeaveTypeClass = (type: string) => {
        switch (type) {
            case 'annual': return 'bg-green-500'
            case 'sick': return 'bg-amber-500'
            case 'personal': return 'bg-blue-500'
            case 'study': return 'bg-indigo-500'
            case 'maternity': return 'bg-purple-500'
            default: return 'bg-gray-500'
        }
    }

    return (
        <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                            Leave Calendar
                        </CardTitle>
                        <CardDescription>Team leave schedule overview</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(addDays(currentDate, -30))}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentDate(addDays(currentDate, 30))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-center">
                        {format(currentDate, "MMMM yyyy")}
                    </h3>
                </div>

                
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground">
                            {day}
                        </div>
                    ))}
                </div>

                
                <div className="grid grid-cols-7 gap-1">
                    
                    {Array.from({ length: monthStart.getDay() }, (_, i) => (
                        <div key={`empty-${i}`} className="h-16"></div>
                    ))}

                    
                    {days.map(day => {
                        const leave = getLeaveForDate(day)
                        const isCurrentDay = isToday(day)

                        return (
                            <div
                                key={day.toISOString()}
                                className={`h-16 p-1 border rounded-lg hover:bg-slate-50 transition-colors ${
                                    isCurrentDay ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                                }`}
                            >
                                <div className="text-sm font-medium mb-1">
                                    {format(day, 'd')}
                                </div>
                                {leave && (
                                    <div className="space-y-1">
                                        {leave.employees.map((employee, idx) => (
                                            <div
                                                key={idx}
                                                className={`text-xs px-1 py-0.5 rounded text-white truncate ${getLeaveTypeClass(leave.type)}`}
                                                title={employee}
                                            >
                                                {employee.split(' ')[0]}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                
                <div className="mt-4 pt-4 border-t">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Annual Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                            <span>Sick Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Personal Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                            <span>Study Leave</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded"></div>
                            <span>Maternity Leave</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function LeaveManagementPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")
    const [selectedRequest, setSelectedRequest] = useState<any>(null)
    const [showApprovalDialog, setShowApprovalDialog] = useState(false)

    const filteredRequests = leaveRequests.filter(request => {
        const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || request.status === statusFilter
        const matchesType = typeFilter === "all" || request.leaveType === typeFilter
        return matchesSearch && matchesStatus && matchesType
    })

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
            <div className="max-w-full space-y-6">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                            Leave Management
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4" />
                            New Request
                        </Button>
                    </div>
                </div>

                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">Pending Requests</CardTitle>
                            <Clock className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">8</div>
                            <p className="text-xs text-emerald-100">
                                Awaiting approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Approved This Month</CardTitle>
                            <CheckCircle className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">45</div>
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-green-200">+12%</span> from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-100">Total Leave Days</CardTitle>
                            <CalendarIcon className="h-5 w-5 text-amber-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">234</div>
                            <p className="text-xs text-amber-100">
                                Days taken this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Avg. Response Time</CardTitle>
                            <TrendingUp className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">2.3</div>
                            <p className="text-xs text-purple-100">
                                Days to approve/reject
                            </p>
                        </CardContent>
                    </Card>
                </div>

                
                <div className="grid gap-6 lg:grid-cols-3">
                    
                    <div className="lg:col-span-1">
                        <LeaveCalendar />
                    </div>

                    
                    <div className="lg:col-span-2">
                        <Tabs defaultValue="requests" className="space-y-6">
                            <TabsList className="bg-white shadow-sm border w-full">
                                <TabsTrigger value="requests" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Leave Requests
                                </TabsTrigger>
                                <TabsTrigger value="balances" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                                    <User className="h-4 w-4 mr-2" />
                                    Employee Balances
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                                    <TrendingUp className="h-4 w-4 mr-2" />
                                    Analytics
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="requests" className="space-y-6">
                                
                                <Card className="shadow-sm">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                            <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                                <div className="relative flex-1 max-w-sm">
                                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Search requests..."
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
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="approved">Approved</SelectItem>
                                                        <SelectItem value="rejected">Rejected</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                                    <SelectTrigger className="w-[180px] border-slate-200">
                                                        <SelectValue placeholder="Leave Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Types</SelectItem>
                                                        <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                                                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                                        <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                                                        <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                                                        <SelectItem value="Study Leave">Study Leave</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                
                                <Card className="shadow-sm">
                                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-blue-600" />
                                            Leave Requests
                                        </CardTitle>
                                        <CardDescription>Manage employee leave requests and approvals</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Employee</TableHead>
                                                    <TableHead>Leave Type</TableHead>
                                                    <TableHead>Period</TableHead>
                                                    <TableHead>Days</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRequests.map((request) => (
                                                    <TableRow key={request.id} className="hover:bg-slate-50">
                                                        <TableCell>
                                                            <div className="flex items-center space-x-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                                                        {request.name.split(' ').map(n => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <div className="font-medium">{request.name}</div>
                                                                    <div className="text-sm text-muted-foreground">{request.department}</div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getLeaveTypeColor(request.leaveType)}>
                                                                {request.leaveType}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-sm">
                                                                <div>{format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d, yyyy")}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium">{request.days} days</TableCell>
                                                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreVertical className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem onClick={() => setSelectedRequest(request)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    {request.status === 'pending' && (
                                                                        <>
                                                                            <DropdownMenuItem className="text-green-600">
                                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                                Approve
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem className="text-red-600">
                                                                                <XCircle className="mr-2 h-4 w-4" />
                                                                                Reject
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem>
                                                                        <Mail className="mr-2 h-4 w-4" />
                                                                        Send Message
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

                            <TabsContent value="balances" className="space-y-6">
                                
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                    {leaveBalances.map((employee) => (
                                        <Card key={employee.employeeId} className="hover:shadow-md transition-all duration-300 border border-slate-200">
                                            <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarFallback className="bg-green-100 text-green-600">
                                                                {employee.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <CardTitle className="text-base">{employee.name}</CardTitle>
                                                            <CardDescription className="text-sm">{employee.position}</CardDescription>
                                                            <CardDescription className="text-xs">{employee.department}</CardDescription>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        Carry Over: {employee.carryOver}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">Annual Leave</span>
                                                        <span className="text-muted-foreground">
                                                            {employee.annualLeave.remaining}/{employee.annualLeave.total}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(employee.annualLeave.remaining / employee.annualLeave.total) * 100}
                                                        className="h-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{employee.annualLeave.used} used</span>
                                                        <span>{employee.annualLeave.remaining} remaining</span>
                                                    </div>
                                                </div>

                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">Sick Leave</span>
                                                        <span className="text-muted-foreground">
                                                            {employee.sickLeave.remaining}/{employee.sickLeave.total}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(employee.sickLeave.remaining / employee.sickLeave.total) * 100}
                                                        className="h-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{employee.sickLeave.used} used</span>
                                                        <span>{employee.sickLeave.remaining} remaining</span>
                                                    </div>
                                                </div>

                                                
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">Personal Leave</span>
                                                        <span className="text-muted-foreground">
                                                            {employee.personalLeave.remaining}/{employee.personalLeave.total}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={(employee.personalLeave.remaining / employee.personalLeave.total) * 100}
                                                        className="h-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>{employee.personalLeave.used} used</span>
                                                        <span>{employee.personalLeave.remaining} remaining</span>
                                                    </div>
                                                </div>

                                                
                                                {employee.annualLeave.remaining < 5 && (
                                                    <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                        <span className="text-xs text-amber-700">Low annual leave balance</span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="analytics" className="space-y-6">
                                
                                <div className="grid gap-6 md:grid-cols-1">
                                    
                                    <Card>
                                        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                                            <CardTitle className="flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                                Monthly Leave Trends
                                            </CardTitle>
                                            <CardDescription>Leave requests by type over time</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <ChartContainer config={chartConfig} className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={monthlyLeaveData}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis />
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                        <Bar dataKey="annual" fill="var(--color-annual)" />
                                                        <Bar dataKey="sick" fill="var(--color-sick)" />
                                                        <Bar dataKey="personal" fill="var(--color-personal)" />
                                                        <Bar dataKey="maternity" fill="var(--color-maternity)" />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>

                                    
                                    <Card >
                                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
                                            <CardTitle className="flex items-center gap-2">
                                                <Building className="h-5 w-5 text-blue-600" />
                                                Leave Type Distribution
                                            </CardTitle>
                                            <CardDescription>Breakdown of leave types this year</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <ChartContainer config={chartConfig} className="h-[300px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={leaveTypeDistribution}
                                                            cx="50%"
                                                            cy="50%"
                                                            labelLine={false}
                                                            label={({ name, value }) => `${name}: ${value}%`}
                                                            outerRadius={80}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                        >
                                                            {leaveTypeDistribution.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Pie>
                                                        <ChartTooltip content={<ChartTooltipContent />} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </div>

                                
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Card className="shadow-sm">
                                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                                            <CardTitle className="text-center">Approval Rate</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center p-6">
                                            <div className="text-4xl font-bold text-green-600">96%</div>
                                            <p className="text-sm text-muted-foreground mt-2">Overall approval rate</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                        <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b">
                                            <CardTitle className="text-center">Avg. Response Time</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center p-6">
                                            <div className="text-4xl font-bold text-blue-600">2.3</div>
                                            <p className="text-sm text-muted-foreground mt-2">Days to process</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="shadow-sm">
                                        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                                            <CardTitle className="text-center">Utilization Rate</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-center p-6">
                                            <div className="text-4xl font-bold text-purple-600">85%</div>
                                            <p className="text-sm text-muted-foreground mt-2">Leave days used</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                
                {selectedRequest && (
                    <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Leave Request Details</DialogTitle>
                                <DialogDescription>
                                    Complete information for {selectedRequest.name}'s leave request
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Employee</Label>
                                        <p className="text-sm">{selectedRequest.name} ({selectedRequest.employeeId})</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Department</Label>
                                        <p className="text-sm">{selectedRequest.department}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Leave Type</Label>
                                        <Badge className={getLeaveTypeColor(selectedRequest.leaveType)}>
                                            {selectedRequest.leaveType}
                                        </Badge>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Status</Label>
                                        {getStatusBadge(selectedRequest.status)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Start Date</Label>
                                        <p className="text-sm">{format(new Date(selectedRequest.startDate), "MMMM d, yyyy")}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">End Date</Label>
                                        <p className="text-sm">{format(new Date(selectedRequest.endDate), "MMMM d, yyyy")}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Reason</Label>
                                    <p className="text-sm text-muted-foreground">{selectedRequest.reason}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Approver</Label>
                                        <p className="text-sm">{selectedRequest.approver}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Covering Employee</Label>
                                        <p className="text-sm">{selectedRequest.coveringEmployee}</p>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                    Close
                                </Button>
                                {selectedRequest.status === 'pending' && (
                                    <Button className="bg-green-600 hover:bg-green-700">
                                        Review Request
                                    </Button>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}