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
    Plus,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Users,
    Mail,
    Phone,
    MapPin,
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
    Globe
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

const employees = [
    {
        id: 1,
        employeeId: "GZ001",
        name: "Jean Baptiste Mukamana",
        email: "jean.mukamana@ganzafrica.org",
        phone: "+250 788 123 456",
        position: "HR Manager",
        department: "Human Resources",
        status: "active",
        joinDate: "2024-01-15",
        location: "Kigali, Rwanda",
        country: "Rwanda",
        manager: "Sarah Uwimana",
        managerId: "GZ000",
        salary: "$45,000",
        avatar: "",
        skills: ["HR Management", "Recruitment", "Employee Relations"],
        emergencyContact: {
            name: "Marie Mukamana",
            relationship: "Spouse",
            phone: "+250 788 654 321"
        },
        level: 2
    },
    {
        id: 2,
        employeeId: "GZ002",
        name: "Marie Claire Nsengimana",
        email: "marie.nsengimana@ganzafrica.org",
        phone: "+250 788 234 567",
        position: "Agricultural Specialist",
        department: "Agriculture",
        status: "active",
        joinDate: "2024-02-01",
        location: "Musanze, Rwanda",
        country: "Rwanda",
        manager: "David Nshimiyimana",
        managerId: "GZ006",
        salary: "$38,000",
        avatar: "",
        skills: ["Sustainable Farming", "Crop Management", "Research"],
        emergencyContact: {
            name: "Paul Nsengimana",
            relationship: "Father",
            phone: "+250 788 765 432"
        },
        level: 3
    },
    {
        id: 3,
        employeeId: "GZ003",
        name: "David Niyonkuru",
        email: "david.niyonkuru@ganzafrica.org",
        phone: "+250 788 345 678",
        position: "Youth Fellow",
        department: "Fellowship Program",
        status: "active",
        joinDate: "2024-03-01",
        location: "Kigali, Rwanda",
        country: "Rwanda",
        manager: "Grace Uwimana",
        managerId: "GZ007",
        salary: "Stipend",
        avatar: "",
        skills: ["Community Engagement", "Project Coordination", "Research"],
        emergencyContact: {
            name: "Agnes Niyonkuru",
            relationship: "Mother",
            phone: "+250 788 876 543"
        },
        level: 4
    },
    {
        id: 4,
        employeeId: "GZ004",
        name: "Grace Mukamana",
        email: "grace.mukamana@ganzafrica.org",
        phone: "+250 788 456 789",
        position: "Environmental Consultant",
        department: "Environment",
        status: "on_leave",
        joinDate: "2023-06-15",
        location: "Kigali, Rwanda",
        country: "Rwanda",
        manager: "Sarah Uwimana",
        managerId: "GZ000",
        salary: "$42,000",
        avatar: "",
        skills: ["Environmental Assessment", "Policy Analysis", "Sustainability"],
        emergencyContact: {
            name: "John Mukamana",
            relationship: "Brother",
            phone: "+250 788 987 654"
        },
        level: 2
    },
    {
        id: 5,
        employeeId: "GZ005",
        name: "Emmanuel Nshimiyimana",
        email: "emmanuel.nshimiyimana@ganzafrica.org",
        phone: "+250 788 567 890",
        position: "Land Management Coordinator",
        department: "Land Management",
        status: "active",
        joinDate: "2023-01-10",
        location: "Huye, Rwanda",
        country: "Rwanda",
        manager: "Sarah Uwimana",
        managerId: "GZ000",
        salary: "$40,000",
        avatar: "",
        skills: ["GIS", "Land Planning", "Community Relations"],
        emergencyContact: {
            name: "Christine Nshimiyimana",
            relationship: "Wife",
            phone: "+250 788 098 765"
        },
        level: 2
    },
    {
        id: 6,
        employeeId: "GZ006",
        name: "David Nshimiyimana",
        email: "david.nshimiyimana@ganzafrica.org",
        phone: "+250 788 111 222",
        position: "Agriculture Director",
        department: "Agriculture",
        status: "active",
        joinDate: "2022-08-01",
        location: "Kigali, Rwanda",
        country: "Rwanda",
        manager: "Sarah Uwimana",
        managerId: "GZ000",
        salary: "$55,000",
        avatar: "",
        skills: ["Agricultural Leadership", "Strategic Planning", "Team Management"],
        emergencyContact: {
            name: "Grace Nshimiyimana",
            relationship: "Wife",
            phone: "+250 788 333 444"
        },
        level: 1
    },
    {
        id: 7,
        employeeId: "GZ007",
        name: "Grace Uwimana",
        email: "grace.uwimana@ganzafrica.org",
        phone: "+250 788 555 666",
        position: "Fellowship Director",
        department: "Fellowship Program",
        status: "active",
        joinDate: "2022-05-15",
        location: "Kigali, Rwanda",
        country: "Rwanda",
        manager: "Sarah Uwimana",
        managerId: "GZ000",
        salary: "$52,000",
        avatar: "",
        skills: ["Youth Development", "Program Management", "Strategic Leadership"],
        emergencyContact: {
            name: "Jean Uwimana",
            relationship: "Husband",
            phone: "+250 788 777 888"
        },
        level: 1
    },
    {
        id: 8,
        employeeId: "GZ000",
        name: "Sarah Uwimana",
        email: "sarah.uwimana@ganzafrica.org",
        phone: "+250 788 999 000",
        position: "Executive Director",
        department: "Executive",
        status: "active",
        joinDate: "2021-01-01",
        location: "Kigali, Rwanda",
        country: "Rwanda",
        manager: "Board of Directors",
        managerId: null,
        salary: "$75,000",
        avatar: "",
        skills: ["Strategic Leadership", "Organizational Development", "Partnership Management"],
        emergencyContact: {
            name: "Paul Uwimana",
            relationship: "Spouse",
            phone: "+250 788 111 000"
        },
        level: 0
    },
    {
        id: 9,
        employeeId: "GZ008",
        name: "Alice Mukamana",
        email: "alice.mukamana@ganzafrica.org",
        phone: "+254 788 123 456",
        position: "Regional Coordinator",
        department: "East Africa Operations",
        status: "active",
        joinDate: "2023-09-01",
        location: "Nairobi, Kenya",
        country: "Kenya",
        manager: "Sarah Uwimana",
        managerId: "GZ000",
        salary: "$48,000",
        avatar: "",
        skills: ["Regional Management", "Cross-border Operations", "Policy Development"],
        emergencyContact: {
            name: "Peter Mukamana",
            relationship: "Brother",
            phone: "+254 788 654 321"
        },
        level: 1
    },
    {
        id: 10,
        employeeId: "GZ009",
        name: "Samuel Nkomo",
        email: "samuel.nkomo@ganzafrica.org",
        phone: "+27 82 123 4567",
        position: "Research Analyst",
        department: "Research & Development",
        status: "active",
        joinDate: "2024-04-01",
        location: "Cape Town, South Africa",
        country: "South Africa",
        manager: "Alice Mukamana",
        managerId: "GZ008",
        salary: "$35,000",
        avatar: "",
        skills: ["Data Analysis", "Research Methodology", "Report Writing"],
        emergencyContact: {
            name: "Mary Nkomo",
            relationship: "Mother",
            phone: "+27 82 765 4321"
        },
        level: 2
    }
]

const departmentStats = [
    { name: "Agriculture", count: 25, active: 23, onLeave: 2 },
    { name: "Environment", count: 18, active: 16, onLeave: 2 },
    { name: "Land Management", count: 12, active: 11, onLeave: 1 },
    { name: "Human Resources", count: 5, active: 5, onLeave: 0 },
    { name: "Administration", count: 8, active: 7, onLeave: 1 },
    { name: "Fellowship Program", count: 15, active: 15, onLeave: 0 },
    { name: "East Africa Operations", count: 8, active: 8, onLeave: 0 },
    { name: "Research & Development", count: 6, active: 6, onLeave: 0 }
]

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

const OrganizationChart = () => {
    const getEmployeesByLevel = (level: number) => {
        return employees.filter(emp => emp.level === level)
    }

    const getSubordinates = (managerId: string) => {
        return employees.filter(emp => emp.managerId === managerId)
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
                        <CardContent className="p-4 text-center min-w-[200px]">
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
                            {getStatusBadge(employee.status)}
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

    const ceo = employees.find(emp => emp.level === 0)

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

    const filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || employee.status === statusFilter
        const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
        const matchesCountry = countryFilter === "all" || employee.country === countryFilter
        return matchesSearch && matchesStatus && matchesDepartment && matchesCountry
    })

    const countries = [...new Set(employees.map(emp => emp.country))].sort()

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
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
                                            <TableRow key={employee.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
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
                                                                setShowDetailsDialog(true)
                                                            }}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Generate Report
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
                                <OrganizationChart />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                
                {showDetailsDialog && selectedEmployee && (
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-blue-600" />
                                    Employee Details
                                </DialogTitle>
                                <DialogDescription>
                                    Complete profile information for {selectedEmployee.name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                
                                <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={selectedEmployee.avatar} />
                                        <AvatarFallback className="bg-green-100 text-green-600 text-lg">
                                            {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">{selectedEmployee.name}</h3>
                                        <p className="text-muted-foreground">{selectedEmployee.position}</p>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(selectedEmployee.status)}
                                            <Badge variant="outline">{selectedEmployee.employeeId}</Badge>
                                            <Badge variant="outline" className="flex items-center gap-1">
                                                {getCountryFlag(selectedEmployee.country)}
                                                {selectedEmployee.country}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Contact Information</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                                <a href={`mailto:${selectedEmployee.email}`} className="text-blue-600 hover:underline">
                                                    {selectedEmployee.email}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                                <a href={`tel:${selectedEmployee.phone}`} className="text-blue-600 hover:underline">
                                                    {selectedEmployee.phone}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                <span>{selectedEmployee.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4 text-muted-foreground" />
                                                <span>{getCountryFlag(selectedEmployee.country)} {selectedEmployee.country}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-medium">Work Information</h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                <span>{selectedEmployee.department}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span>Reports to: {selectedEmployee.manager}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>Joined: {new Date(selectedEmployee.joinDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span>Salary: {selectedEmployee.salary}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="space-y-3">
                                    <h4 className="font-medium">Skills & Expertise</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEmployee.skills.map((skill: string, index: number) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {skill}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                
                                <div className="space-y-3">
                                    <h4 className="font-medium">Emergency Contact</h4>
                                    <div className="text-sm space-y-2 p-3 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Name:</span>
                                            <span>{selectedEmployee.emergencyContact.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Relationship:</span>
                                            <span>{selectedEmployee.emergencyContact.relationship}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Phone:</span>
                                            <a href={`tel:${selectedEmployee.emergencyContact.phone}`} className="text-blue-600 hover:underline">
                                                {selectedEmployee.emergencyContact.phone}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
                                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                    Close
                                </Button>
                                <Button className="bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Employee
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}