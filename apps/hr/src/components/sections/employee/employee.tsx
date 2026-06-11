"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Search,
    MoreVertical,
    Eye,
    Edit,
    Users,
    Mail,
    Calendar,
    Building,
    UserCheck,
    UserX,
    Download,
    Upload,
    FileText,
    AlertCircle,
    CheckCircle,
    TrendingUp,
    Globe,
    Trash2,
    LayoutDashboard,
    Contact,
    CreditCard,
    MoreHorizontal
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
import { Label } from "@/components/ui/label"
import { ReusableSheet } from '@/components/sections/sheets/sheet-component'
import {departmentStats, employees_table_data} from "@/data/employee-data";

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'active':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
        case 'on_leave':
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200">On Leave</Badge>
        case 'inactive':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getCountryFlag = (country: string) => {
    const flags = {
        'Rwanda': '🇷🇼',
        'Kenya': '🇰🇪',
        'South Africa': '🇿🇦',
        'Uganda': '🇺🇬',
        'Tanzania': '🇹🇿'
    }
    return flags[country as keyof typeof flags] || '🌍'
}

const OrganizationChart = ({ setSelectedEmployee, setShowDetailsDialog, setIsEditing }: any) => {

    const getSubordinates = (managerId: string) => {
        return employees_table_data.filter(emp => emp.managerId === managerId)
    }

    const renderEmployeeNode = (employee: any, isRoot = false) => {
        const subordinates = getSubordinates(employee.employeeId)

        return (
            <div key={employee.id} className="flex flex-col items-center">
                <div className={`relative ${isRoot ? 'mb-8' : 'mb-4'}`}>
                    <Card className={`hover:shadow-lg transition-all duration-300 ${
                        isRoot ? 'border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-emerald-50' :
                            employee.level === 1 ? 'border-green-300 bg-green-50' :
                                employee.level === 2 ? 'border-blue-300 bg-blue-50' :
                                    'border-gray-300'
                    }`}>
                        <CardContent
                            className="p-4 text-center min-w-[200px] cursor-pointer"
                            onClick={() => {
                                setSelectedEmployee(employee);
                                setShowDetailsDialog(true);
                                setIsEditing(false);
                            }}
                        >
                            <Avatar className="h-12 w-12 mx-auto mb-2">
                                <AvatarImage src={employee.avatar} />
                                <AvatarFallback className="bg-green-100 text-green-600">
                                    {employee.name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <h4 className="font-semibold text-sm">{employee.name}</h4>
                            <p className="text-xs text-muted-foreground">{employee.position}</p>
                            <p className="text-xs text-blue-600">{employee.department}</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <span className="text-xs">{getCountryFlag(employee.country)}</span>
                                <span className="text-xs text-muted-foreground">{employee.country}</span>
                            </div>
                            <div className="mt-2">
                                {getStatusBadge(employee.status)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {subordinates.length > 0 && (
                    <div className="relative">

                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-300"></div>


                        {subordinates.length > 1 && (
                            <div className="absolute top-6 left-0 right-0 h-px bg-gray-300"></div>
                        )}

                        <div className={`flex gap-8 pt-6 ${subordinates.length > 1 ? 'justify-center' : 'justify-center'}`}>
                            {subordinates.map((subordinate) => (
                                <div key={subordinate.id} className="relative">

                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-300"></div>
                                    {renderEmployeeNode(subordinate)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const ceo = employees_table_data.find(emp => emp.level === 0)

    return (
        <div className="w-full overflow-x-auto">
            <div className="min-w-max p-8">
                {ceo && renderEmployeeNode(ceo, true)}
            </div>
        </div>
    )
}

export default function EmployeesPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [departmentFilter, setDepartmentFilter] = useState("all")
    const [countryFilter, setCountryFilter] = useState("all")
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<any>(null)

    const handleEditClick = (employee: any) => {
        setEditForm({ ...employee })
        setIsEditing(true)
    }

    const handleDeleteEmployee = (id: number) => {
        // In a real app, this would be an API call
        console.log("Deleting employee:", id)
        setShowDetailsDialog(false)
        setSelectedEmployee(null)
    }

    const handleSaveEdit = () => {
        // In a real app, this would be an API call
        console.log("Saving employee data:", editForm)
        setIsEditing(false)
        setSelectedEmployee(editForm)
    }

    const filteredEmployees = employees_table_data.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || employee.status === statusFilter
        const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
        const matchesCountry = countryFilter === "all" || employee.country === countryFilter
        return matchesSearch && matchesStatus && matchesDepartment && matchesCountry
    })

    const countries = [...new Set(employees_table_data.map(emp => emp.country))].sort()

    return (
        <div className="min-h-screen p-6 bg-transparent">
            <div className="max-w-full space-y-6">

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                            Employee Management
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Upload className="h-4 w-4 " />
                            Import
                        </Button>
                        <Button>
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>


                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">Total Employees</CardTitle>
                            <Users className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">97</div>
                            <p className="text-xs text-emerald-100 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                +8 this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Active Employees</CardTitle>
                            <UserCheck className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">91</div>
                            <p className="text-xs text-blue-100">
                                93.8% of total workforce
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-100">Departments</CardTitle>
                            <Building className="h-5 w-5 text-amber-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">8</div>
                            <p className="text-xs text-amber-100">
                                Active departments
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Countries</CardTitle>
                            <Globe className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{countries.length}</div>
                            <p className="text-xs text-purple-100">
                                Geographic presence
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="employees" className="space-y-6">
                    <TabsList className="bg-white shadow-sm border w-full">
                        <TabsTrigger value="employees" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                            <Users className="h-4 w-4 mr-2" />
                            Employees
                        </TabsTrigger>
                        <TabsTrigger value="departments" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                            <Building className="h-4 w-4 mr-2" />
                            Departments
                        </TabsTrigger>
                        <TabsTrigger value="org-chart" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <FileText className="h-4 w-4 mr-2" />
                            Organization Chart
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="employees" className="space-y-6">

                        <Card >
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
                                            <SelectTrigger className="w-[130px] border-slate-200">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="on_leave">On Leave</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                            <SelectTrigger className="w-[160px] border-slate-200">
                                                <SelectValue placeholder="Department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Departments</SelectItem>
                                                <SelectItem value="Agriculture">Agriculture</SelectItem>
                                                <SelectItem value="Environment">Environment</SelectItem>
                                                <SelectItem value="Land Management">Land Management</SelectItem>
                                                <SelectItem value="Human Resources">Human Resources</SelectItem>
                                                <SelectItem value="Fellowship Program">Fellowship Program</SelectItem>
                                                <SelectItem value="East Africa Operations">East Africa Ops</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={countryFilter} onValueChange={setCountryFilter}>
                                            <SelectTrigger className="w-[140px] border-slate-200">
                                                <SelectValue placeholder="Country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Countries</SelectItem>
                                                {countries.map(country => (
                                                    <SelectItem key={country} value={country}>
                                                        {getCountryFlag(country)} {country}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        <Card >
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Employee Directory
                                </CardTitle>
                                <CardDescription>Complete list of all employees across all locations</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Position</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Join Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEmployees.map((employee) => (
                                            <TableRow key={employee.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => {
                                                setSelectedEmployee(employee)
                                                setShowDetailsDialog(true)
                                                setIsEditing(false)
                                            }}>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center space-x-3 cursor-default">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={employee.avatar} />
                                                            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                                                {employee.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{employee.name}</div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {employee.email}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {employee.employeeId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{employee.position}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Reports to: {employee.manager}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {employee.department}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm">{getCountryFlag(employee.country)}</span>
                                                        <div>
                                                            <div className="text-sm font-medium">{employee.location}</div>
                                                            <div className="text-xs text-muted-foreground">{employee.country}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(employee.status)}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {new Date(employee.joinDate).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
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
                                                                setIsEditing(false)
                                                            }}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedEmployee(employee)
                                                                setEditForm({ ...employee })
                                                                setShowDetailsDialog(true)
                                                                setIsEditing(true)
                                                            }}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Generate Report
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600"
                                                                onClick={() => handleDeleteEmployee(employee.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete Employee
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {employee.status === 'active' ? (
                                                                <DropdownMenuItem className="text-amber-600">
                                                                    <UserX className="mr-2 h-4 w-4" />
                                                                    Mark On Leave
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem className="text-green-600">
                                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                                    Mark Active
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

                    <TabsContent value="departments" className="space-y-6">
                        <Card>
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5 text-blue-600" />
                                    Department Overview
                                </CardTitle>
                                <CardDescription>Employee distribution and statistics across departments</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {departmentStats.map((dept) => (
                                        <div key={dept.name} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all duration-300">
                                            <div>
                                                <h4 className="font-medium">{dept.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {dept.count} total employees
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                    <span>{dept.active} Active</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                                    <span>{dept.onLeave} On Leave</span>
                                                </div>
                                                <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="org-chart" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                    Organization Chart
                                </CardTitle>
                                <CardDescription>Visual representation of organizational hierarchy and reporting structure</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <OrganizationChart 
                                    setSelectedEmployee={setSelectedEmployee} 
                                    setShowDetailsDialog={setShowDetailsDialog} 
                                    setIsEditing={setIsEditing} 
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>


                {showDetailsDialog && selectedEmployee && (
                    <ReusableSheet 
                        open={showDetailsDialog} 
                        onOpenChange={setShowDetailsDialog}
                        footer={
                            <div className="flex w-full gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-200 text-slate-600 hover:bg-white"
                                    onClick={() => {
                                        if (isEditing) {
                                            setIsEditing(false)
                                        } else {
                                            setShowDetailsDialog(false)
                                        }
                                    }}
                                >
                                    {isEditing ? "Cancel" : "Close"}
                                </Button>
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSaveEdit()
                                        } else {
                                            // Example action like "Generate Report" or similar to "Reschedule" in the mockup
                                            console.log("Secondary action")
                                        }
                                    }}
                                >
                                    {isEditing ? "Save Changes" : "Download PDF"}
                                </Button>
                            </div>
                        }
                    >
                        <div className="flex h-full">
                            {/* Side Tabs */}
                            <div className="w-16 border-r flex flex-col items-center py-6 gap-6 bg-slate-50/50">
                                <div className="p-2 bg-white rounded-xl shadow-sm border text-blue-600">
                                    <Building className="h-5 w-5" />
                                </div>
                                <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
                                    <LayoutDashboard className="h-5 w-5" />
                                </div>
                                <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
                                    <Contact className="h-5 w-5" />
                                </div>
                                <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-6 border-b space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span>Employee ID</span>
                                            <span className="font-mono font-bold text-slate-900">#{selectedEmployee.employeeId}</span>
                                            <span className="mx-1">•</span>
                                            <span className="flex items-center gap-1">
                                                <Building className="h-3 w-3" />
                                                STAFF
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border"
                                                onClick={() => {
                                                    if (isEditing) {
                                                        handleSaveEdit()
                                                    } else {
                                                        setIsEditing(true)
                                                        setEditForm({ ...selectedEmployee })
                                                    }
                                                }}
                                            >
                                                <Edit className="h-4 w-4 text-slate-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                                            <AvatarImage src={selectedEmployee.avatar} />
                                            <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-bold">
                                                {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm text-slate-500">Change Status</span>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-3">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    {selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                                                    <MoreHorizontal className="h-3 w-3 ml-1" />
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 pt-2">
                                        <div className="space-y-1">
                                            <div className="text-[10px] uppercase font-semibold text-slate-400">Position</div>
                                            <div className="text-sm font-medium flex items-center gap-1.5">
                                                <Building className="h-3.5 w-3.5 text-slate-400" />
                                                {selectedEmployee.position}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] uppercase font-semibold text-slate-400">Join Date</div>
                                            <div className="text-sm font-medium flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {new Date(selectedEmployee.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] uppercase font-semibold text-slate-400">Department</div>
                                            <div className="text-sm font-medium flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                                {selectedEmployee.department}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            General info
                                        </h4>
                                        {isEditing ? (
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-name" className="text-[10px] uppercase font-bold text-slate-400">Full Name</Label>
                                                    <Input
                                                        id="edit-name"
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-phone" className="text-[10px] uppercase font-bold text-slate-400">Phone Number</Label>
                                                    <Input
                                                        id="edit-phone"
                                                        value={editForm.phone}
                                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-position" className="text-[10px] uppercase font-bold text-slate-400">Position</Label>
                                                    <Input
                                                        id="edit-position"
                                                        value={editForm.position}
                                                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-email" className="text-[10px] uppercase font-bold text-slate-400">Email</Label>
                                                    <Input
                                                        id="edit-email"
                                                        value={editForm.email}
                                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-location" className="text-[10px] uppercase font-bold text-slate-400">Location</Label>
                                                    <Input
                                                        id="edit-location"
                                                        value={editForm.location}
                                                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Full Name</div>
                                                    <div className="text-sm font-medium text-slate-900">{selectedEmployee.name}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Phone Number</div>
                                                    <div className="text-sm font-medium text-slate-900">{selectedEmployee.phone}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Age</div>
                                                    <div className="text-sm font-medium text-slate-900">28</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Email</div>
                                                    <div className="text-sm font-medium text-slate-900">{selectedEmployee.email}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Gender</div>
                                                    <div className="text-sm font-medium text-slate-900">Female</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-slate-400">Address</div>
                                                    <div className="text-sm font-medium text-slate-900">{selectedEmployee.location}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            Work Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Manager</div>
                                                <div className="text-sm font-medium text-slate-900">{selectedEmployee.manager}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] uppercase font-bold text-slate-400">Salary</div>
                                                <div className="text-sm font-medium text-slate-900">{selectedEmployee.salary}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEmployee.skills.map((skill: string, index: number) => (
                                                <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal text-xs px-3 py-1">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ReusableSheet>
                )}
            </div>
        </div>
    )
}