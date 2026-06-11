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
    DollarSign,
    Users,
    Calculator,
    Search,
    Download,
    Eye,
    Edit,
    MoreVertical,
    FileText,
    CheckCircle,
    CreditCard,
    Percent,
    TrendingUp,
    Building,
    AlertCircle
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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart, PieChart, Pie, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

const payrollData = [
    {
        id: 1,
        employeeId: "GZ001",
        name: "Jean Baptiste Mukamana",
        department: "Human Resources",
        position: "HR Manager",
        baseSalary: 45000,
        grossSalary: 47250,
        netSalary: 36450,
        allowances: {
            transport: 500,
            medical: 200,
            meal: 150,
            housing: 1400
        },
        deductions: {
            tax: 8500,
            pension: 1350,
            insurance: 950
        },
        overtime: 0,
        bonus: 0,
        payDate: "2024-12-25",
        status: "processed",
        bankAccount: "****1234",
        payslipGenerated: true
    },
    {
        id: 2,
        employeeId: "GZ002",
        name: "Marie Claire Nsengimana",
        department: "Agriculture",
        position: "Agricultural Specialist",
        baseSalary: 38000,
        grossSalary: 40280,
        netSalary: 31024,
        allowances: {
            transport: 600,
            medical: 200,
            meal: 150,
            fieldWork: 1330
        },
        deductions: {
            tax: 7056,
            pension: 1140,
            insurance: 860
        },
        overtime: 480,
        bonus: 0,
        payDate: "2024-12-25",
        status: "pending",
        bankAccount: "****5678",
        payslipGenerated: false
    },
    {
        id: 3,
        employeeId: "GZ003",
        name: "David Niyonkuru",
        department: "Fellowship Program",
        position: "Youth Fellow",
        baseSalary: 24000,
        grossSalary: 25200,
        netSalary: 20664,
        allowances: {
            transport: 400,
            medical: 150,
            meal: 100,
            training: 550
        },
        deductions: {
            tax: 3536,
            pension: 720,
            insurance: 280
        },
        overtime: 0,
        bonus: 500,
        payDate: "2024-12-25",
        status: "processed",
        bankAccount: "****9012",
        payslipGenerated: true
    },
    {
        id: 4,
        employeeId: "GZ004",
        name: "Grace Mukamana",
        department: "Environment",
        position: "Environmental Consultant",
        baseSalary: 42000,
        grossSalary: 44100,
        netSalary: 34038,
        allowances: {
            transport: 550,
            medical: 200,
            meal: 150,
            research: 1200
        },
        deductions: {
            tax: 7762,
            pension: 1260,
            insurance: 840
        },
        overtime: 0,
        bonus: 0,
        payDate: "2024-12-25",
        status: "pending",
        bankAccount: "****3456",
        payslipGenerated: false
    },
    {
        id: 5,
        employeeId: "GZ005",
        name: "Emmanuel Nshimiyimana",
        department: "Land Management",
        position: "Land Surveyor",
        baseSalary: 36000,
        grossSalary: 37800,
        netSalary: 29484,
        allowances: {
            transport: 500,
            medical: 200,
            meal: 150,
            equipment: 950
        },
        deductions: {
            tax: 6636,
            pension: 1080,
            insurance: 600
        },
        overtime: 320,
        bonus: 0,
        payDate: "2024-12-25",
        status: "failed",
        bankAccount: "****7890",
        payslipGenerated: false
    }
]

const payrollSummary = {
    totalEmployees: 83,
    totalGrossPay: 3547200,
    totalNetPay: 2738064,
    totalDeductions: 809136,
    totalTax: 594720,
    totalPension: 126816,
    totalInsurance: 87600,
    processingDate: "2024-12-25",
    month: "December 2024"
}

const monthlyPayrollData = [
    { month: "Jul", gross: 3420000, net: 2638200, deductions: 781800 },
    { month: "Aug", gross: 3465000, net: 2672850, deductions: 792150 },
    { month: "Sep", gross: 3510000, net: 2707700, deductions: 802300 },
    { month: "Oct", gross: 3525000, net: 2719500, deductions: 805500 },
    { month: "Nov", gross: 3540000, net: 2731800, deductions: 808200 },
    { month: "Dec", gross: 3547200, net: 2738064, deductions: 809136 },
]

const departmentPayrollData = [
    { department: "Agriculture", employees: 25, totalPay: 950000, avgPay: 38000 },
    { department: "Environment", employees: 18, totalPay: 756000, avgPay: 42000 },
    { department: "Land Mgmt", employees: 12, totalPay: 456000, avgPay: 38000 },
    { department: "HR", employees: 5, totalPay: 225000, avgPay: 45000 },
    { department: "Admin", employees: 8, totalPay: 320000, avgPay: 40000 },
    { department: "Fellowship", employees: 15, totalPay: 360000, avgPay: 24000 },
]

const deductionBreakdown = [
    { name: "Income Tax", amount: 594720, percentage: 67.4, fill: "#ef4444" },
    { name: "Pension", amount: 126816, percentage: 14.4, fill: "#3b82f6" },
    { name: "Insurance", amount: 87600, percentage: 9.9, fill: "#10b981" },
    { name: "Other", amount: 73008, percentage: 8.3, fill: "#f59e0b" },
]

const chartConfig = {
    gross: {
        label: "Gross Pay",
        color: "#10b981",
    },
    net: {
        label: "Net Pay",
        color: "#3b82f6",
    },
    deductions: {
        label: "Deductions",
        color: "#ef4444",
    },
    totalPay: {
        label: "Total Pay",
        color: "#8b5cf6",
    },
} satisfies ChartConfig

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'processed':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Processed</Badge>
        case 'pending':
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>
        case 'failed':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
        case 'draft':
            return <Badge variant="outline">Draft</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default function PayrollPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [departmentFilter, setDepartmentFilter] = useState("all")
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [showPayslipDialog, setShowPayslipDialog] = useState(false)

    const filteredPayroll = payrollData.filter(record => {
        const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || record.status === statusFilter
        const matchesDepartment = departmentFilter === "all" || record.department === departmentFilter
        return matchesSearch && matchesStatus && matchesDepartment
    })

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
            <div className="max-w-full space-y-6">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                            Payroll Management
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Download className="h-4 w-4" />
                            Export Payroll
                        </Button>
                        <Button>
                            <Calculator className="h-4 w-4" />
                            Process Payments
                        </Button>
                    </div>
                </div>

                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">Total Gross Pay</CardTitle>
                            <DollarSign className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.totalGrossPay)}</div>
                            <p className="text-xs text-emerald-100">
                                December 2024
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Total Net Pay</CardTitle>
                            <CreditCard className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.totalNetPay)}</div>
                            <p className="text-xs text-blue-100">
                                After deductions
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-100">Total Deductions</CardTitle>
                            <Percent className="h-5 w-5 text-amber-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(payrollSummary.totalDeductions)}</div>
                            <p className="text-xs text-amber-100">
                                22.8% of gross pay
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Employees Paid</CardTitle>
                            <Users className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{payrollSummary.totalEmployees}</div>
                            <p className="text-xs text-purple-100">
                                Active employees
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="current" className="space-y-6">
                    <TabsList className="bg-white shadow-sm border w-full">
                        <TabsTrigger value="current" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                            <CreditCard className="h-4 w-4 mr-2" />
                            Current Payroll
                        </TabsTrigger>
                        <TabsTrigger value="history" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                            <FileText className="h-4 w-4 mr-2" />
                            Payroll History
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="taxes" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                            <Calculator className="h-4 w-4 mr-2" />
                            Tax Reports
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="space-y-6">
                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                            December 2024 Payroll
                                        </CardTitle>
                                        <CardDescription>Monthly payroll processing for {payrollSummary.totalEmployees} employees</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button>
                                            <Calculator className="h-4 w-4" />
                                            Recalculate
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Gross Pay</p>
                                        <p className="text-lg font-bold text-green-600">{formatCurrency(payrollSummary.totalGrossPay)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Deductions</p>
                                        <p className="text-lg font-bold text-red-600">-{formatCurrency(payrollSummary.totalDeductions)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Net Pay</p>
                                        <p className="text-lg font-bold text-blue-600">{formatCurrency(payrollSummary.totalNetPay)}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground">Processing Date</p>
                                        <p className="text-lg font-bold">{payrollSummary.processingDate}</p>
                                    </div>
                                </div>

                                
                                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                            <div>
                                                <h4 className="font-medium text-amber-800">Payroll Processing Status</h4>
                                                <p className="text-sm text-amber-700">
                                                    {filteredPayroll.filter(emp => emp.status === 'processed').length} processed,
                                                    {filteredPayroll.filter(emp => emp.status === 'pending').length} pending,
                                                    {filteredPayroll.filter(emp => emp.status === 'failed').length} failed
                                                </p>
                                            </div>
                                        </div>
                                        <Progress
                                            value={(filteredPayroll.filter(emp => emp.status === 'processed').length / filteredPayroll.length) * 100}
                                            className="w-32"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        
                        <Card className="shadow-sm">
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
                                                <SelectItem value="processed">Processed</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="failed">Failed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                            <SelectTrigger className="w-[180px] border-slate-200">
                                                <SelectValue placeholder="Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Departments</SelectItem>
                                                <SelectItem value="Agriculture">Agriculture</SelectItem>
                                                <SelectItem value="Environment">Environment</SelectItem>
                                                <SelectItem value="Land Management">Land Management</SelectItem>
                                                <SelectItem value="Human Resources">Human Resources</SelectItem>
                                                <SelectItem value="Fellowship Program">Fellowship Program</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                            <FileText className="h-4 w-4" />
                                            Generate Reports
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Employee Payroll Details
                                </CardTitle>
                                <CardDescription>Individual payroll breakdown for each employee</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Base Salary</TableHead>
                                            <TableHead>Gross Pay</TableHead>
                                            <TableHead>Deductions</TableHead>
                                            <TableHead>Net Pay</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPayroll.map((employee) => (
                                            <TableRow key={employee.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                                                {employee.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{employee.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {employee.employeeId} • {employee.position}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{formatCurrency(employee.baseSalary)}</TableCell>
                                                <TableCell className="font-medium text-green-600">{formatCurrency(employee.grossSalary)}</TableCell>
                                                <TableCell className="text-red-600">
                                                    -{formatCurrency(employee.grossSalary - employee.netSalary)}
                                                </TableCell>
                                                <TableCell className="font-bold text-blue-600">{formatCurrency(employee.netSalary)}</TableCell>
                                                <TableCell>{getStatusBadge(employee.status)}</TableCell>
                                                <TableCell>
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
                                                                setShowPayslipDialog(true)
                                                            }}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Payslip
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Payroll
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download Payslip
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {employee.status === 'pending' && (
                                                                <DropdownMenuItem className="text-green-600">
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Process Payment
                                                                </DropdownMenuItem>
                                                            )}
                                                            {employee.status === 'failed' && (
                                                                <DropdownMenuItem className="text-amber-600">
                                                                    <AlertCircle className="mr-2 h-4 w-4" />
                                                                    Retry Payment
                                                                </DropdownMenuItem>
                                                            )}
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

                    <TabsContent value="history" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    Payroll History
                                </CardTitle>
                                <CardDescription>Previous months' payroll records and reports</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                                    <p className="text-lg font-medium">Payroll History Archive</p>
                                    <p className="text-sm">Access previous months' payroll data and detailed reports</p>
                                    <Button className="mt-4" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        View Historical Reports
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        
                        <div className="grid gap-6 md:grid-cols-2">
                            
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        Monthly Payroll Trends
                                    </CardTitle>
                                    <CardDescription>Payroll costs over the last 6 months</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ChartContainer config={chartConfig} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthlyPayrollData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="gross" stroke="var(--color-gross)" strokeWidth={2} />
                                                <Line type="monotone" dataKey="net" stroke="var(--color-net)" strokeWidth={2} />
                                                <Line type="monotone" dataKey="deductions" stroke="var(--color-deductions)" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-blue-600" />
                                        Department Payroll Distribution
                                    </CardTitle>
                                    <CardDescription>Payroll costs by department</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ChartContainer config={chartConfig} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={departmentPayrollData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="department" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="totalPay" fill="var(--color-totalPay)" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>

                        
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <Percent className="h-5 w-5 text-red-600" />
                                        Deduction Breakdown
                                    </CardTitle>
                                    <CardDescription>Distribution of payroll deductions</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ChartContainer config={chartConfig} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={deductionBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ payload }) => `${payload.name}: ${payload.percentage}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="amount"
                                                >
                                                    {deductionBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5 text-green-600" />
                                        Key Payroll Metrics
                                    </CardTitle>
                                    <CardDescription>Important payroll statistics and KPIs</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
                                            <div className="text-2xl font-bold text-green-600">{formatCurrency(42754)}</div>
                                            <p className="text-sm text-muted-foreground">Average Salary</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                                            <div className="text-2xl font-bold text-blue-600">22.8%</div>
                                            <p className="text-sm text-muted-foreground">Avg. Deduction Rate</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                                            <div className="text-2xl font-bold text-purple-600">{formatCurrency(594720)}</div>
                                            <p className="text-sm text-muted-foreground">Total Tax</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-red-50">
                                            <div className="text-2xl font-bold text-orange-600">2.1%</div>
                                            <p className="text-sm text-muted-foreground">YoY Growth</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="taxes" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-purple-600" />
                                    Tax Reports & Compliance
                                </CardTitle>
                                <CardDescription>Tax calculations, PAYE reports, and statutory compliance documents</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <Card className="border border-slate-200 hover:shadow-md transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                                PAYE Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Total PAYE:</span>
                                                <span className="font-medium">{formatCurrency(594720)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Employees:</span>
                                                <span className="font-medium">83</span>
                                            </div>
                                            <Button size="sm" className="w-full" variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Report
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-slate-200 hover:shadow-md transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Building className="h-5 w-5 text-green-600" />
                                                Pension Contributions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Total Pension:</span>
                                                <span className="font-medium">{formatCurrency(126816)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Rate:</span>
                                                <span className="font-medium">3.6%</span>
                                            </div>
                                            <Button size="sm" className="w-full" variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Report
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card className="border border-slate-200 hover:shadow-md transition-all duration-300">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-purple-600" />
                                                Insurance Premiums
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm">Total Insurance:</span>
                                                <span className="font-medium">{formatCurrency(87600)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm">Coverage:</span>
                                                <span className="font-medium">100%</span>
                                            </div>
                                            <Button size="sm" className="w-full" variant="outline">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download Report
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Compliance Status</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span>PAYE Filed</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span>Pension Submitted</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span>Insurance Updated</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                            <span>Annual Return Due</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                
                {showPayslipDialog && selectedEmployee && (
                    <Dialog open={showPayslipDialog} onOpenChange={setShowPayslipDialog}>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Payslip - {selectedEmployee.name}
                                </DialogTitle>
                                <DialogDescription>
                                    December 2024 payslip for {selectedEmployee.employeeId}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                
                                <div className="text-center border-b pb-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg p-4">
                                    <h3 className="text-lg font-bold text-blue-800">GanzAfrica</h3>
                                    <p className="text-sm text-muted-foreground">Employee Payslip - December 2024</p>
                                </div>

                                
                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Employee Name</Label>
                                        <p className="text-sm font-medium">{selectedEmployee.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Employee ID</Label>
                                        <p className="text-sm font-medium">{selectedEmployee.employeeId}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Department</Label>
                                        <p className="text-sm font-medium">{selectedEmployee.department}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-slate-700">Position</Label>
                                        <p className="text-sm font-medium">{selectedEmployee.position}</p>
                                    </div>
                                </div>

                                
                                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                    <h4 className="font-medium mb-3 text-green-800 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Earnings
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Base Salary</span>
                                            <span className="font-medium">{formatCurrency(selectedEmployee.baseSalary)}</span>
                                        </div>
                                        {Object.entries(selectedEmployee.allowances).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span className="capitalize">{key} Allowance</span>
                                                <span className="font-medium">{formatCurrency(value as number)}</span>
                                            </div>
                                        ))}
                                        {selectedEmployee.overtime > 0 && (
                                            <div className="flex justify-between">
                                                <span>Overtime</span>
                                                <span className="font-medium">{formatCurrency(selectedEmployee.overtime)}</span>
                                            </div>
                                        )}
                                        {selectedEmployee.bonus > 0 && (
                                            <div className="flex justify-between">
                                                <span>Bonus</span>
                                                <span className="font-medium">{formatCurrency(selectedEmployee.bonus)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t pt-2 font-medium text-green-700">
                                            <span>Gross Salary</span>
                                            <span>{formatCurrency(selectedEmployee.grossSalary)}</span>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                    <h4 className="font-medium mb-3 text-red-800 flex items-center gap-2">
                                        <Percent className="h-4 w-4" />
                                        Deductions
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        {Object.entries(selectedEmployee.deductions).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span className="capitalize">{key}</span>
                                                <span className="font-medium text-red-600">-{formatCurrency(value as number)}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between border-t pt-2 font-medium text-red-700">
                                            <span>Total Deductions</span>
                                            <span>-{formatCurrency(selectedEmployee.grossSalary - selectedEmployee.netSalary)}</span>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex justify-between text-lg font-bold text-blue-700">
                                        <span>Net Pay</span>
                                        <span>{formatCurrency(selectedEmployee.netSalary)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Amount to be credited to account {selectedEmployee.bankAccount}
                                    </p>
                                    <div className="mt-3 text-xs">
                                        <div className="flex justify-between">
                                            <span>Pay Date:</span>
                                            <span className="font-medium">{selectedEmployee.payDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Status:</span>
                                            <span>{getStatusBadge(selectedEmployee.status)}</span>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="text-center text-xs text-muted-foreground border-t pt-4">
                                    <p>This is a computer-generated payslip and does not require a signature.</p>
                                    <p>Generated on {new Date().toLocaleDateString()} • GanzAfrica Payroll System</p>
                                </div>
                            </div>
                            <DialogFooter className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
                                <Button variant="outline" onClick={() => setShowPayslipDialog(false)}>
                                    Close
                                </Button>
                                <Button>
                                    <Download className=" h-4 w-4" />
                                    Download PDF
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}