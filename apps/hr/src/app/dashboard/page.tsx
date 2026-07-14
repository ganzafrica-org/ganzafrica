"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Users,
    UserPlus,
    Calendar,
    Clock,
    FileText,
    AlertCircle,
    CheckCircle,
    Plus,
    Eye
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, PieChart, Pie, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Dummy data for charts
const recruitmentData = [
    { month: "Jan", applications: 45, hired: 8 },
    { month: "Feb", applications: 52, hired: 12 },
    { month: "Mar", applications: 38, hired: 6 },
    { month: "Apr", applications: 67, hired: 15 },
    { month: "May", applications: 73, hired: 18 },
    { month: "Jun", applications: 59, hired: 14 },
]

const attendanceData = [
    { day: "Mon", present: 95, absent: 5 },
    { day: "Tue", present: 92, absent: 8 },
    { day: "Wed", present: 98, absent: 2 },
    { day: "Thu", present: 94, absent: 6 },
    { day: "Fri", present: 89, absent: 11 },
]

const departmentData = [
    { name: "Agriculture", employees: 25, fill: "#10b981" },
    { name: "Environment", employees: 18, fill: "#3b82f6" },
    { name: "Land Management", employees: 12, fill: "#f59e0b" },
    { name: "Administration", employees: 8, fill: "#ef4444" },
    { name: "HR", employees: 5, fill: "#8b5cf6" },
]

const leaveRequestsData = [
    { week: "W1", approved: 12, pending: 3, rejected: 1 },
    { week: "W2", approved: 8, pending: 5, rejected: 2 },
    { week: "W3", approved: 15, pending: 2, rejected: 0 },
    { week: "W4", approved: 10, pending: 4, rejected: 1 },
]

const chartConfig = {
    applications: {
        label: "Applications",
        color: "#10b981",
    },
    hired: {
        label: "Hired",
        color: "#3b82f6",
    },
    present: {
        label: "Present",
        color: "#10b981",
    },
    absent: {
        label: "Absent",
        color: "#ef4444",
    },
    approved: {
        label: "Approved",
        color: "#10b981",
    },
    pending: {
        label: "Pending",
        color: "#f59e0b",
    },
    rejected: {
        label: "Rejected",
        color: "#ef4444",
    },
} satisfies ChartConfig

// Recent activities dummy data
const recentActivities = [
    {
        id: 1,
        type: "recruitment",
        message: "New application received for Agricultural Specialist position",
        time: "5 minutes ago",
        status: "new"
    },
    {
        id: 2,
        type: "leave",
        message: "Leave request approved for Marie Claire Nsengimana",
        time: "1 hour ago",
        status: "approved"
    },
    {
        id: 3,
        type: "onboarding",
        message: "Onboarding completed for David Niyonkuru",
        time: "2 hours ago",
        status: "completed"
    },
    {
        id: 4,
        type: "performance",
        message: "Performance review due for 5 employees",
        time: "3 hours ago",
        status: "due"
    },
]

const quickActions = [
    { icon: UserPlus, label: "Post New Job", href: "/hr/recruitment/new" },
    { icon: Users, label: "Add Employee", href: "/hr/employees/new" },
    { icon: Calendar, label: "Schedule Interview", href: "/hr/recruitment/interviews" },
    { icon: FileText, label: "Generate Report", href: "/hr/reports" },
]

export default function HRDashboard() {
    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">68</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+3</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-blue-600">5</span> applications this week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">94.2%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+1.2%</span> from last week
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">7</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-orange-600">3</span> leave requests
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Recruitment ViewEmployeeContents */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recruitment Overview</CardTitle>
                        <CardDescription>Applications vs Hires over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={recruitmentData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="applications" fill="var(--color-applications)" />
                                    <Bar dataKey="hired" fill="var(--color-hired)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Attendance Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Attendance</CardTitle>
                        <CardDescription>Present vs Absent employees this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={attendanceData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="present" stroke="var(--color-present)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="absent" stroke="var(--color-absent)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Department Distribution and Leave Requests */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Department Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department Distribution</CardTitle>
                        <CardDescription>Employee count by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={departmentData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="employees"
                                    >
                                        {departmentData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Leave Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Requests</CardTitle>
                        <CardDescription>Monthly leave request status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={leaveRequestsData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar dataKey="approved" fill="var(--color-approved)" />
                                    <Bar dataKey="pending" fill="var(--color-pending)" />
                                    <Bar dataKey="rejected" fill="var(--color-rejected)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Recent Activities and Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Recent Activities */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activities</CardTitle>
                        <CardDescription>Latest HR activities and notifications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className={`mt-1 h-2 w-2 rounded-full ${
                                        activity.status === 'new' ? 'bg-blue-500' :
                                            activity.status === 'approved' ? 'bg-green-500' :
                                                activity.status === 'completed' ? 'bg-green-500' :
                                                    'bg-orange-500'
                                    }`} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                    <Badge variant={
                                        activity.status === 'new' ? 'default' :
                                            activity.status === 'approved' || activity.status === 'completed' ? 'secondary' :
                                                'outline'
                                    }>
                                        {activity.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                            <Eye className="mr-2 h-4 w-4" />
                            View All Activities
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common HR tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {quickActions.map((action, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                className="w-full justify-start"
                                asChild
                            >
                                <a href={action.href}>
                                    <action.icon className="mr-2 h-4 w-4" />
                                    {action.label}
                                </a>
                            </Button>
                        ))}
                        <Button className="w-full bg-green-600 hover:bg-green-700 mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            New HR Task
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* System Alerts */}
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="text-orange-800 flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        System Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                            <div>
                                <p className="text-sm font-medium">Performance Reviews Due</p>
                                <p className="text-xs text-muted-foreground">5 employees need performance reviews this week</p>
                            </div>
                            <Button size="sm" variant="outline">
                                Review
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                            <div>
                                <p className="text-sm font-medium">Contract Renewals</p>
                                <p className="text-xs text-muted-foreground">3 contracts expiring in the next 30 days</p>
                            </div>
                            <Button size="sm" variant="outline">
                                View
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3  rounded-lg border border-green-200 bg-green-50">
                            <div>
                                <p className="text-sm font-medium text-green-800">System Backup Complete</p>
                                <p className="text-xs text-green-600">Daily backup completed successfully at 2:00 AM</p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}