"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    Users,
    UserPlus,
    Clock,
    AlertCircle,
    CheckCircle,
    DollarSign,
    BarChart3,
    Activity,
    Shield,
    Database,
    Settings,
    Bell,
    Eye,
    ArrowRight,
    GraduationCap,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// System overview data
const systemMetrics = {
    totalUsers: 83,
    activeUsers: 77,
    newUsers: 5,
    totalRevenue: 2840000,
    monthlyGrowth: 12.5,
    systemUptime: 99.8,
    activeProjects: 24,
    pendingApprovals: 12
}

// User distribution data
const userDistributionData = [
    { role: "Employees", count: 45, percentage: 54, fill: "#10b981" },
    { role: "Fellows", count: 15, percentage: 18, fill: "#3b82f6" },
    { role: "Alumni", count: 18, percentage: 22, fill: "#f59e0b" },
    { role: "HR Staff", count: 5, percentage: 6, fill: "#8b5cf6" }
]

// Monthly growth data
const monthlyGrowthData = [
    { month: "Jul", users: 68, revenue: 2420000, projects: 18 },
    { month: "Aug", users: 72, revenue: 2580000, projects: 20 },
    { month: "Sep", users: 75, revenue: 2650000, projects: 22 },
    { month: "Oct", users: 78, revenue: 2720000, projects: 23 },
    { month: "Nov", users: 80, revenue: 2780000, projects: 24 },
    { month: "Dec", users: 83, revenue: 2840000, projects: 24 }
]

// Department performance
const departmentPerformanceData = [
    { department: "Agriculture", employees: 25, productivity: 92, satisfaction: 4.3 },
    { department: "Environment", employees: 18, productivity: 88, satisfaction: 4.1 },
    { department: "Land Management", employees: 12, productivity: 85, satisfaction: 4.0 },
    { department: "HR", employees: 5, productivity: 95, satisfaction: 4.5 },
    { department: "Administration", employees: 8, productivity: 90, satisfaction: 4.2 },
    { department: "Fellowship", employees: 15, productivity: 87, satisfaction: 4.4 }
]

// Recent activities
const recentActivities = [
    {
        id: 1,
        type: "user_registration",
        message: "New employee Alice Uwimana joined Environment department",
        time: "2 hours ago",
        status: "success",
        user: "Alice Uwimana"
    },
    {
        id: 2,
        type: "system_alert",
        message: "Backup completed successfully - 2.4GB",
        time: "4 hours ago",
        status: "info",
        user: "System"
    },
    {
        id: 3,
        type: "approval_request",
        message: "Leave request from David Niyonkuru requires approval",
        time: "6 hours ago",
        status: "warning",
        user: "David Niyonkuru"
    },
    {
        id: 4,
        type: "milestone",
        message: "Q4 performance reviews completed - 94% participation",
        time: "1 day ago",
        status: "success",
        user: "HR Team"
    },
    {
        id: 5,
        type: "security",
        message: "Password policy updated - affects all users",
        time: "2 days ago",
        status: "info",
        user: "Security Team"
    }
]

// System health data
const systemHealthData = [
    { metric: "CPU Usage", value: 45, status: "good" },
    { metric: "Memory Usage", value: 62, status: "good" },
    { metric: "Disk Space", value: 78, status: "warning" },
    { metric: "Network", value: 92, status: "excellent" }
]

// Quick stats for different modules
const moduleStats = [
    {
        module: "HR Management",
        icon: Users,
        stats: [
            { label: "Total Employees", value: "83" },
            { label: "Open Positions", value: "12" },
            { label: "Attendance Rate", value: "94.2%" },
            { label: "Pending Requests", value: "7" }
        ],
        trend: "+5.2%",
        color: "bg-blue-50 border-blue-200"
    },
    {
        module: "Alumni Network",
        icon: GraduationCap,
        stats: [
            { label: "Total Alumni", value: "156" },
            { label: "Active Members", value: "89" },
            { label: "Job Placements", value: "23" },
            { label: "Events This Month", value: "4" }
        ],
        trend: "+8.1%",
        color: "bg-green-50 border-green-200"
    },
    {
        module: "Financial Overview",
        icon: DollarSign,
        stats: [
            { label: "Monthly Payroll", value: "$284K" },
            { label: "Operational Costs", value: "$156K" },
            { label: "Budget Utilization", value: "78%" },
            { label: "Cost per Employee", value: "$3.4K" }
        ],
        trend: "+2.3%",
        color: "bg-purple-50 border-purple-200"
    }
]

const chartConfig = {
    users: {
        label: "Users",
        color: "#10b981",
    },
    revenue: {
        label: "Revenue",
        color: "#3b82f6",
    },
    projects: {
        label: "Projects",
        color: "#f59e0b",
    },
    productivity: {
        label: "Productivity",
        color: "#8b5cf6",
    },
    satisfaction: {
        label: "Satisfaction",
        color: "#ef4444",
    },
} satisfies ChartConfig

const getActivityIcon = (type: string) => {
    switch (type) {
        case 'user_registration':
            return <UserPlus className="h-4 w-4 text-green-600" />
        case 'system_alert':
            return <Activity className="h-4 w-4 text-blue-600" />
        case 'approval_request':
            return <Clock className="h-4 w-4 text-yellow-600" />
        case 'milestone':
            return <CheckCircle className="h-4 w-4 text-green-600" />
        case 'security':
            return <Shield className="h-4 w-4 text-purple-600" />
        default:
            return <Bell className="h-4 w-4 text-gray-600" />
    }
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'success':
            return 'text-green-600'
        case 'warning':
            return 'text-yellow-600'
        case 'error':
            return 'text-red-600'
        case 'info':
            return 'text-blue-600'
        default:
            return 'text-gray-600'
    }
}

const getHealthStatus = (value: number) => {
    if (value >= 90) return { color: 'bg-green-500', text: 'Excellent' }
    if (value >= 70) return { color: 'bg-yellow-500', text: 'Good' }
    if (value >= 50) return { color: 'bg-orange-500', text: 'Warning' }
    return { color: 'bg-red-500', text: 'Critical' }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">Welcome back, Administrator</h2>
                        <p className="text-green-100 mt-1">
                            Here's what's happening at GanzAfrica today
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-green-100">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-lg font-semibold">All Systems Operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemMetrics.totalUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+{systemMetrics.newUsers}</span> new this month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(systemMetrics.totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+{systemMetrics.monthlyGrowth}%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemMetrics.systemUptime}%</div>
                        <p className="text-xs text-muted-foreground">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemMetrics.pendingApprovals}</div>
                        <p className="text-xs text-muted-foreground">
                            Requires attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="system">System Health</TabsTrigger>
                    <TabsTrigger value="modules">Module Stats</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {/* Charts Row */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Growth Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Growth Trends</CardTitle>
                                <CardDescription>Users, revenue, and projects over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Area type="monotone" dataKey="users" stackId="1" stroke="var(--color-users)" fill="var(--color-users)" fillOpacity={0.3} />
                                            <Area type="monotone" dataKey="projects" stackId="2" stroke="var(--color-projects)" fill="var(--color-projects)" fillOpacity={0.3} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        {/* User Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Distribution</CardTitle>
                                <CardDescription>Breakdown of users by role</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={chartConfig} className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={userDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ role, count }) => `${role}: ${count}`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {userDistributionData.map((entry, index) => (
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

                    {/* Recent Activities and Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* Recent Activities */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Recent Activities</CardTitle>
                                <CardDescription>Latest system activities and events</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3">
                                            {getActivityIcon(activity.type)}
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm">{activity.message}</p>
                                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                                            </div>
                                            <Badge variant="outline" className={getStatusColor(activity.status)}>
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
                                <CardDescription>Common administrative tasks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="mr-2 h-4 w-4" />
                                    Manage Users
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Settings className="mr-2 h-4 w-4" />
                                    System Settings
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Generate Reports
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Database className="mr-2 h-4 w-4" />
                                    Database Backup
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Button>
                                <Button variant="outline" className="w-full justify-start">
                                    <Shield className="mr-2 h-4 w-4" />
                                    Security Audit
                                    <ArrowRight className="ml-auto h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    {/* Department Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Department Performance Overview</CardTitle>
                            <CardDescription>Productivity and satisfaction metrics by department</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departmentPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="department" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="productivity" fill="var(--color-productivity)" />
                                        <Bar dataKey="satisfaction" fill="var(--color-satisfaction)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    {/* Detailed Analytics Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">User Engagement</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-blue-600">87%</div>
                                <p className="text-sm text-muted-foreground mt-2">Daily active users</p>
                                <div className="mt-4">
                                    <Progress value={87} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Platform Adoption</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-green-600">94%</div>
                                <p className="text-sm text-muted-foreground mt-2">Feature utilization</p>
                                <div className="mt-4">
                                    <Progress value={94} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-center">Satisfaction Score</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-purple-600">4.6</div>
                                <p className="text-sm text-muted-foreground mt-2">Out of 5.0 rating</p>
                                <div className="mt-4">
                                    <Progress value={92} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="system" className="space-y-4">
                    {/* System Health Metrics */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Health</CardTitle>
                                <CardDescription>Real-time system performance metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {systemHealthData.map((metric, index) => {
                                        const status = getHealthStatus(metric.value)
                                        return (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{metric.metric}</span>
                                                    <span className="font-medium">{metric.value}%</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Progress value={metric.value} className="flex-1" />
                                                    <Badge className={`${status.color} text-white`}>
                                                        {status.text}
                                                    </Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Server Statistics</CardTitle>
                                <CardDescription>Infrastructure performance overview</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 border rounded-lg">
                                            <div className="text-lg font-bold text-green-600">99.8%</div>
                                            <p className="text-xs text-muted-foreground">Uptime</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <div className="text-lg font-bold text-blue-600">45ms</div>
                                            <p className="text-xs text-muted-foreground">Response Time</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <div className="text-lg font-bold text-purple-600">2.4GB</div>
                                            <p className="text-xs text-muted-foreground">Data Processed</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <div className="text-lg font-bold text-orange-600">156</div>
                                            <p className="text-xs text-muted-foreground">Active Sessions</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent System Logs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Logs</CardTitle>
                            <CardDescription>Recent system events and notifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {[
                                    { time: "2024-12-10 15:30", level: "INFO", message: "Daily backup completed successfully" },
                                    { time: "2024-12-10 14:45", level: "WARN", message: "High memory usage detected on server-2" },
                                    { time: "2024-12-10 13:20", level: "INFO", message: "Security scan completed - no threats detected" },
                                    { time: "2024-12-10 12:15", level: "INFO", message: "Database optimization completed" },
                                    { time: "2024-12-10 11:00", level: "ERROR", message: "Failed login attempt from unknown IP" }
                                ].map((log, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 border rounded">
                                        <Badge variant={log.level === 'ERROR' ? 'destructive' : log.level === 'WARN' ? 'secondary' : 'outline'}>
                                            {log.level}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">{log.time}</span>
                                        <span className="text-sm flex-1">{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="modules" className="space-y-4">
                    {/* Module Statistics */}
                    <div className="grid gap-6">
                        {moduleStats.map((module, index) => (
                            <Card key={index} className={module.color}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg">
                                                <module.icon className="h-6 w-6 text-gray-700" />
                                            </div>
                                            <div>
                                                <CardTitle>{module.module}</CardTitle>
                                                <CardDescription>
                                                    Growth: <span className="text-green-600 font-medium">{module.trend}</span> this month
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Eye className="mr-1 h-3 w-3" />
                                            View Details
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        {module.stats.map((stat, statIndex) => (
                                            <div key={statIndex} className="text-center p-3 bg-white rounded-lg">
                                                <div className="text-2xl font-bold">{stat.value}</div>
                                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Critical Alerts */}
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="text-orange-800 flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5" />
                        System Alerts & Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                            <div>
                                <p className="font-medium">Disk Space Warning</p>
                                <p className="text-sm text-muted-foreground">Server storage at 78% capacity</p>
                            </div>
                            <Button size="sm" variant="outline">
                                Resolve
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200">
                            <div>
                                <p className="font-medium">Security Update Available</p>
                                <p className="text-sm text-muted-foreground">Critical security patch ready for deployment</p>
                            </div>
                            <Button size="sm" variant="outline">
                                Update
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3  rounded-lg border border-green-200 bg-green-50">
                            <div>
                                <p className="font-medium text-green-800">Backup Completed</p>
                                <p className="text-sm text-green-600">Daily system backup successful - 2.4GB</p>
                            </div>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}