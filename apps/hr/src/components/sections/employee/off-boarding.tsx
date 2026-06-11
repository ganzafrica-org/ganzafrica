"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    UserMinus,
    Search,
    Download,
    Eye,
    Edit,
    MoreVertical,
    Plus,
    FileText,
    Calendar,
    User,
    Building,
    Mail,
    Package,
    MessageSquare,
    TrendingDown,
    CheckCircle,
    Clock,
    DollarSign,
    MapPin,
    Archive
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"

// Dummy offboarding data
const offboardingData = [
    {
        id: 1,
        employeeId: "GZ011",
        name: "Patricia Uwimana",
        email: "patricia.uwimana@ganzafrica.org",
        position: "Marketing Coordinator",
        department: "Administration",
        manager: "Sarah Uwimana",
        lastWorkingDay: "2024-12-25",
        resignationDate: "2024-12-10",
        reason: "career_advancement",
        status: "in_progress",
        progress: 65,
        exitInterviewCompleted: false,
        profileImage: "",
        tasks: [
            { id: 1, title: "Submit resignation letter", status: "completed", dueDate: "2024-12-10", assignee: "Employee" },
            { id: 2, title: "Manager acknowledgment", status: "completed", dueDate: "2024-12-11", assignee: "Manager" },
            { id: 3, title: "HR documentation", status: "completed", dueDate: "2024-12-12", assignee: "HR" },
            { id: 4, title: "Asset return checklist", status: "in_progress", dueDate: "2024-12-20", assignee: "IT" },
            { id: 5, title: "Knowledge transfer sessions", status: "in_progress", dueDate: "2024-12-22", assignee: "Manager" },
            { id: 6, title: "Exit interview", status: "pending", dueDate: "2024-12-23", assignee: "HR" },
            { id: 7, title: "Final clearance", status: "pending", dueDate: "2024-12-24", assignee: "HR" }
        ],
        assets: [
            { name: "Dell Laptop", tag: "GZ-LT-015", returned: true },
            { name: "iPhone 13", tag: "GZ-PH-008", returned: false },
            { name: "Office Keys", tag: "GZ-KEY-003", returned: false }
        ],
        finalSettlement: {
            basicSalary: 2500,
            overtimePay: 200,
            leaveEncashment: 800,
            bonus: 500,
            deductions: 150,
            netPay: 3850
        }
    },
    {
        id: 2,
        employeeId: "GZ012",
        name: "Samuel Niyonkuru",
        email: "samuel.niyonkuru@ganzafrica.org",
        position: "Field Coordinator",
        department: "Agriculture",
        manager: "David Nshimiyimana",
        lastWorkingDay: "2024-12-30",
        resignationDate: "2024-12-05",
        reason: "relocation",
        status: "pending",
        progress: 25,
        exitInterviewCompleted: false,
        profileImage: "",
        tasks: [
            { id: 1, title: "Submit resignation letter", status: "completed", dueDate: "2024-12-05", assignee: "Employee" },
            { id: 2, title: "Manager acknowledgment", status: "completed", dueDate: "2024-12-06", assignee: "Manager" },
            { id: 3, title: "HR documentation", status: "in_progress", dueDate: "2024-12-15", assignee: "HR" },
            { id: 4, title: "Handover documentation", status: "pending", dueDate: "2024-12-25", assignee: "Employee" },
            { id: 5, title: "Asset return checklist", status: "pending", dueDate: "2024-12-28", assignee: "IT" },
            { id: 6, title: "Exit interview", status: "pending", dueDate: "2024-12-29", assignee: "HR" }
        ],
        assets: [
            { name: "MacBook Pro", tag: "GZ-LT-012", returned: false },
            { name: "Vehicle", tag: "GZ-VH-002", returned: false },
            { name: "Field Equipment", tag: "GZ-EQ-005", returned: false }
        ],
        finalSettlement: {
            basicSalary: 3200,
            overtimePay: 400,
            leaveEncashment: 1200,
            bonus: 0,
            deductions: 200,
            netPay: 4600
        }
    },
    {
        id: 3,
        employeeId: "GZ013",
        name: "Claire Mukamana",
        email: "claire.mukamana@ganzafrica.org",
        position: "Research Assistant",
        department: "Environment",
        manager: "Grace Mukamana",
        lastWorkingDay: "2024-12-15",
        resignationDate: "2024-11-30",
        reason: "personal_reasons",
        status: "completed",
        progress: 100,
        exitInterviewCompleted: true,
        profileImage: "",
        tasks: [
            { id: 1, title: "Submit resignation letter", status: "completed", dueDate: "2024-11-30", assignee: "Employee" },
            { id: 2, title: "Manager acknowledgment", status: "completed", dueDate: "2024-12-01", assignee: "Manager" },
            { id: 3, title: "HR documentation", status: "completed", dueDate: "2024-12-02", assignee: "HR" },
            { id: 4, title: "Knowledge transfer", status: "completed", dueDate: "2024-12-10", assignee: "Employee" },
            { id: 5, title: "Asset return", status: "completed", dueDate: "2024-12-12", assignee: "IT" },
            { id: 6, title: "Exit interview", status: "completed", dueDate: "2024-12-13", assignee: "HR" },
            { id: 7, title: "Final settlement", status: "completed", dueDate: "2024-12-15", assignee: "finance" }
        ],
        assets: [
            { name: "Dell Laptop", tag: "GZ-LT-018", returned: true },
            { name: "Monitor", tag: "GZ-MON-012", returned: true },
            { name: "Access Card", tag: "GZ-AC-025", returned: true }
        ],
        finalSettlement: {
            basicSalary: 1800,
            overtimePay: 0,
            leaveEncashment: 600,
            bonus: 300,
            deductions: 100,
            netPay: 2600
        }
    }
]

// Exit reasons data
const exitReasonsData = [
    { reason: "Career Advancement", count: 15, fill: "#10b981" },
    { reason: "Better Compensation", count: 12, fill: "#3b82f6" },
    { reason: "Relocation", count: 8, fill: "#f59e0b" },
    { reason: "Personal Reasons", count: 6, fill: "#8b5cf6" },
    { reason: "Work-Life Balance", count: 4, fill: "#ef4444" },
    { reason: "Other", count: 3, fill: "#6b7280" }
]

// Monthly offboarding trends
const monthlyOffboardingData = [
    { month: "Jul", voluntary: 3, involuntary: 1, total: 4 },
    { month: "Aug", voluntary: 5, involuntary: 0, total: 5 },
    { month: "Sep", voluntary: 2, involuntary: 2, total: 4 },
    { month: "Oct", voluntary: 7, involuntary: 1, total: 8 },
    { month: "Nov", voluntary: 4, involuntary: 1, total: 5 },
    { month: "Dec", voluntary: 6, involuntary: 0, total: 6 }
]

// Department turnover
const departmentTurnoverData = [
    { department: "Agriculture", turnover: 8.5, total: 25 },
    { department: "Environment", turnover: 12.2, total: 18 },
    { department: "HR", turnover: 5.0, total: 5 },
    { department: "Administration", turnover: 15.0, total: 8 },
    { department: "Fellowship", turnover: 20.0, total: 15 }
]

const chartConfig = {
    count: {
        label: "Count",
        color: "#10b981",
    },
    voluntary: {
        label: "Voluntary",
        color: "#3b82f6",
    },
    involuntary: {
        label: "Involuntary",
        color: "#ef4444",
    },
    total: {
        label: "Total",
        color: "#8b5cf6",
    },
    turnover: {
        label: "Turnover %",
        color: "#f59e0b",
    },
} satisfies ChartConfig

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
        case 'in_progress':
            return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
        case 'completed':
            return <Badge className="bg-green-100 text-green-800">Completed</Badge>
        case 'cancelled':
            return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getTaskStatusBadge = (status: string) => {
    switch (status) {
        case 'completed':
            return <Badge className="bg-green-100 text-green-800">Completed</Badge>
        case 'in_progress':
            return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
        case 'pending':
            return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>
        case 'overdue':
            return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getReasonBadge = (reason: string) => {
    switch (reason) {
        case 'career_advancement':
            return <Badge className="bg-blue-100 text-blue-800">Career Advancement</Badge>
        case 'better_compensation':
            return <Badge className="bg-green-100 text-green-800">Better Compensation</Badge>
        case 'relocation':
            return <Badge className="bg-purple-100 text-purple-800">Relocation</Badge>
        case 'personal_reasons':
            return <Badge className="bg-orange-100 text-orange-800">Personal Reasons</Badge>
        case 'work_life_balance':
            return <Badge className="bg-yellow-100 text-yellow-800">Work-Life Balance</Badge>
        case 'involuntary':
            return <Badge className="bg-red-100 text-red-800">Involuntary</Badge>
        default:
            return <Badge variant="outline">{reason}</Badge>
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function OffboardingPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [reasonFilter, setReasonFilter] = useState("all")
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)

    const filteredOffboarding = offboardingData.filter(record => {
        const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || record.status === statusFilter
        const matchesReason = reasonFilter === "all" || record.reason === reasonFilter
        return matchesSearch && matchesStatus && matchesReason
    })

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-full space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                            Employee Offboarding
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-blue-secondaryr text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button>
                            <Plus className="h-4 w-4" />
                            Initiate Offboarding
                        </Button>
                    </div>
                </div>

                {/* Header Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">Active Offboarding</CardTitle>
                            <UserMinus className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">8</div>
                            <p className="text-xs text-emerald-100">
                                In progress this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Turnover Rate</CardTitle>
                            <TrendingDown className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">12.3%</div>
                            <p className="text-xs text-blue-100">
                                Annual turnover rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-100">Avg. Notice Period</CardTitle>
                            <Calendar className="h-5 w-5 text-amber-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">18</div>
                            <p className="text-xs text-amber-100">
                                Days average
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Exit Interviews</CardTitle>
                            <MessageSquare className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">85%</div>
                            <p className="text-xs text-purple-100">
                                Completion rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="active" className="space-y-4">
                    <TabsList className="bg-white shadow-sm border w-full">
                        <TabsTrigger value="active" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                            <UserMinus className="h-4 w-4 mr-2" />
                            Active Offboarding
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Completed
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="exit-interviews" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Exit Interviews
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
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
                                                className="pl-10 border-slate-200 focus:border-red-400 focus:ring-red-400"
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[150px] border-slate-200">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={reasonFilter} onValueChange={setReasonFilter}>
                                            <SelectTrigger className="w-[180px] border-slate-200">
                                                <SelectValue placeholder="Reason" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Reasons</SelectItem>
                                                <SelectItem value="career_advancement">Career Advancement</SelectItem>
                                                <SelectItem value="better_compensation">Better Compensation</SelectItem>
                                                <SelectItem value="relocation">Relocation</SelectItem>
                                                <SelectItem value="personal_reasons">Personal Reasons</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Offboarding Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredOffboarding.map((employee) => (
                                <Card key={employee.id} className="hover:shadow-md transition-all duration-300 ">
                                    <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-pink-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src={employee.profileImage} />
                                                    <AvatarFallback className="bg-red-100 text-red-600">
                                                        {employee.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                                                    <CardDescription>{employee.position}</CardDescription>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        {getStatusBadge(employee.status)}
                                                        {getReasonBadge(employee.reason)}
                                                    </div>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedEmployee(employee)
                                                        setShowDetailsDialog(true)
                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Update Progress
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <MessageSquare className="mr-2 h-4 w-4" />
                                                        Schedule Exit Interview
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Generate Report
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Progress */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Offboarding Progress</span>
                                                <span className="font-medium">{employee.progress}%</span>
                                            </div>
                                            <Progress value={employee.progress} className="h-1" />
                                        </div>

                                        {/* Key Info */}
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
                                                <Calendar className="h-4 w-4 text-red-500" />
                                                <span>Last Day: {employee.lastWorkingDay}</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                                                <Building className="h-4 w-4 text-blue-500" />
                                                <span>{employee.department}</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                                                <User className="h-4 w-4 text-green-500" />
                                                <span>Manager: {employee.manager}</span>
                                            </div>
                                        </div>

                                        {/* Tasks Summary */}
                                        <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-slate-600" />
                                                Tasks Overview
                                            </h4>
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-green-600 bg-green-100 px-2 py-1 rounded">
                                                    {employee.tasks.filter(t => t.status === 'completed').length} completed
                                                </span>
                                                <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                    {employee.tasks.filter(t => t.status === 'in_progress').length} in progress
                                                </span>
                                                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                    {employee.tasks.filter(t => t.status === 'pending').length} pending
                                                </span>
                                            </div>
                                        </div>

                                        {/* Assets Status */}
                                        <div className="space-y-2 p-3 bg-amber-50 rounded-lg">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <Package className="h-4 w-4 text-amber-600" />
                                                Assets Return
                                            </h4>
                                            <div className="flex gap-2 text-xs">
                                                <span className="text-green-600 bg-green-100 px-2 py-1 rounded">
                                                    {employee.assets.filter(a => a.returned).length} returned
                                                </span>
                                                <span className="text-red-600 bg-red-100 px-2 py-1 rounded">
                                                    {employee.assets.filter(a => !a.returned).length} pending
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-3 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                                                onClick={() => {
                                                    setSelectedEmployee(employee)
                                                    setShowDetailsDialog(true)
                                                }}
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1 border-green-primary text-green-primary hover:bg-green-primary hover:text-white">
                                                <Edit className="h-3 w-3" />
                                                Update
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Completed Offboarding
                                </CardTitle>
                                <CardDescription>Successfully completed offboarding processes</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Position</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Last Working Day</TableHead>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Exit Interview</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {offboardingData
                                            .filter(emp => emp.status === 'completed')
                                            .map((employee) => (
                                                <TableRow key={employee.id} className="hover:bg-slate-50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                                                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{employee.name}</div>
                                                                <div className="text-sm text-muted-foreground">{employee.employeeId}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{employee.position}</TableCell>
                                                    <TableCell>{employee.department}</TableCell>
                                                    <TableCell>{employee.lastWorkingDay}</TableCell>
                                                    <TableCell>{getReasonBadge(employee.reason)}</TableCell>
                                                    <TableCell>
                                                        {employee.exitInterviewCompleted ? (
                                                            <Badge className="bg-green-100 text-green-800">Completed</Badge>
                                                        ) : (
                                                            <Badge className="bg-red-100 text-red-800">Not Completed</Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                    Download Report
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

                    <TabsContent value="analytics" className="space-y-4">
                        {/* Charts Row */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Exit Reasons */}
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingDown className="h-5 w-5 text-purple-600" />
                                        Exit Reasons
                                    </CardTitle>
                                    <CardDescription>Breakdown of resignation reasons</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ChartContainer config={chartConfig} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={exitReasonsData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, value }) => `${name}: ${value}`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                >
                                                    {exitReasonsData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Monthly Trends */}
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <Archive className="h-5 w-5 text-blue-600" />
                                        Monthly Offboarding Trends
                                    </CardTitle>
                                    <CardDescription>Voluntary vs involuntary separations</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ChartContainer config={chartConfig} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyOffboardingData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="voluntary" fill="var(--color-voluntary)" />
                                                <Bar dataKey="involuntary" fill="var(--color-involuntary)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Department Turnover */}
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-orange-600" />
                                    Department Turnover Rates
                                </CardTitle>
                                <CardDescription>Annual turnover percentage by department</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <ChartContainer config={chartConfig} className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={departmentTurnoverData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="department" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Bar dataKey="turnover" fill="var(--color-turnover)" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="exit-interviews" className="space-y-4">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-blue-600" />
                                    Exit Interview Summary
                                </CardTitle>
                                <CardDescription>Insights from exit interviews</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-4 md:grid-cols-3 mb-6">
                                    <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                                        <div className="text-3xl font-bold text-green-600">4.2</div>
                                        <p className="text-sm text-muted-foreground">Avg. Rating</p>
                                        <p className="text-xs text-muted-foreground">Overall experience</p>
                                    </div>
                                    <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                                        <div className="text-3xl font-bold text-blue-600">78%</div>
                                        <p className="text-sm text-muted-foreground">Would Recommend</p>
                                        <p className="text-xs text-muted-foreground">Company to others</p>
                                    </div>
                                    <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                                        <div className="text-3xl font-bold text-purple-600">85%</div>
                                        <p className="text-sm text-muted-foreground">Completion Rate</p>
                                        <p className="text-xs text-muted-foreground">Exit interviews</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Employee Offboarding Details Dialog */}
                {showDetailsDialog && selectedEmployee && (
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <UserMinus className="h-5 w-5 text-red-600" />
                                    Offboarding Details - {selectedEmployee.name}
                                </DialogTitle>
                                <DialogDescription>
                                    Complete offboarding process and task management
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Employee Overview */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={selectedEmployee.profileImage} />
                                                <AvatarFallback className="bg-red-100 text-red-600 text-lg">
                                                    {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                                                <p className="text-muted-foreground">{selectedEmployee.position}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {getStatusBadge(selectedEmployee.status)}
                                                    {getReasonBadge(selectedEmployee.reason)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                {selectedEmployee.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                {selectedEmployee.department}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                Manager: {selectedEmployee.manager}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                Resignation: {selectedEmployee.resignationDate}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                Last Day: {selectedEmployee.lastWorkingDay}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                                            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                                                <TrendingDown className="h-4 w-4" />
                                                Offboarding Progress
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Overall Progress</span>
                                                    <span className="font-medium">{selectedEmployee.progress}%</span>
                                                </div>
                                                <Progress value={selectedEmployee.progress} className="h-4" />
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                            <h4 className="font-medium text-green-800 mb-4 flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Final Settlement
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Basic Salary:</span>
                                                    <span className="font-medium">{formatCurrency(selectedEmployee.finalSettlement.basicSalary)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Overtime Pay:</span>
                                                    <span className="font-medium">{formatCurrency(selectedEmployee.finalSettlement.overtimePay)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Leave Encashment:</span>
                                                    <span className="font-medium">{formatCurrency(selectedEmployee.finalSettlement.leaveEncashment)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Bonus:</span>
                                                    <span className="font-medium">{formatCurrency(selectedEmployee.finalSettlement.bonus)}</span>
                                                </div>
                                                <div className="flex justify-between text-red-600">
                                                    <span>Deductions:</span>
                                                    <span className="font-medium">-{formatCurrency(selectedEmployee.finalSettlement.deductions)}</span>
                                                </div>
                                                <div className="flex justify-between font-bold text-green-600 border-t pt-2">
                                                    <span>Net Pay:</span>
                                                    <span>{formatCurrency(selectedEmployee.finalSettlement.netPay)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks List */}
                                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                    <h4 className="font-medium text-purple-800 mb-4 flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Offboarding Tasks
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedEmployee.tasks.map((task: any) => (
                                            <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-white bg-opacity-70">
                                                <div className="flex items-center gap-3">
                                                    <Checkbox
                                                        checked={task.status === 'completed'}
                                                        disabled={task.status === 'completed'}
                                                    />
                                                    <div>
                                                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                            {task.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Due: {task.dueDate} • Assignee: {task.assignee}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getTaskStatusBadge(task.status)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Assets */}
                                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                                    <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Asset Return Status
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedEmployee.assets.map((asset: any, index: number) => (
                                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-white bg-opacity-70">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{asset.name}</p>
                                                        <p className="text-xs text-muted-foreground">{asset.tag}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    {asset.returned ? (
                                                        <Badge className="bg-green-100 text-green-800">Returned</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-100 text-red-800">Pending</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity Timeline */}
                                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                                    <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Recent Activity
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            {
                                                action: 'Task completed: HR documentation',
                                                time: '2 hours ago',
                                                type: 'completed',
                                                icon: CheckCircle,
                                                color: 'text-green-600 bg-green-100'
                                            },
                                            {
                                                action: 'Asset returned: Dell Laptop',
                                                time: '1 day ago',
                                                type: 'asset',
                                                icon: Package,
                                                color: 'text-blue-600 bg-blue-100'
                                            },
                                            {
                                                action: 'Manager acknowledgment received',
                                                time: '3 days ago',
                                                type: 'approval',
                                                icon: User,
                                                color: 'text-purple-600 bg-purple-100'
                                            },
                                            {
                                                action: 'Resignation letter submitted',
                                                time: '6 days ago',
                                                type: 'submission',
                                                icon: FileText,
                                                color: 'text-orange-600 bg-orange-100'
                                            }
                                        ].map((activity, index) => (
                                            <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                                                <div className={`p-2 rounded-full ${activity.color}`}>
                                                    <activity.icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{activity.action}</p>
                                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
                                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                    Close
                                </Button>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Schedule Exit Interview
                                </Button>
                                <Button className="bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Update Progress
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}