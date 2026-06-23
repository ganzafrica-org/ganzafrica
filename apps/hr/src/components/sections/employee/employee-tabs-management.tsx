import React from "react";
import {
    Search,
    Users,
    Building,
    FileText,
    Mail,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    UserX,
    UserCheck,
    Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DataTable, ColumnDef } from "../table-component";
import DepartmentChartPage from "./department-chart";


export const EmployeeManagementContent = ({
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    departmentFilter, setDepartmentFilter,
    countryFilter, setCountryFilter,
    filteredEmployees,
    setSelectedEmployee,
    setShowDetailsDialog,
    setIsEditing,
    setEditForm,
    handleDeleteEmployee,
    countries,
    getCountryFlag,
    getStatusBadge,
    employeeStats
}: any) => {

    // 1. FILTER BAR SECTION
    const renderFilterBar = () => (
        <Card className="mb-6 rounded-lg">
            <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-lg"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px] border-slate-200 rounded-lg">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on_leave">On Leave</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-[160px] border-slate-200 rounded-lg">
                                <SelectValue placeholder="Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                <SelectItem value="Human Resources">Human Resources</SelectItem>
                                <SelectItem value="East Africa Operations">East Africa Ops</SelectItem>
                                {/* Add other departments here */}
                            </SelectContent>
                        </Select>
                        <Select value={countryFilter} onValueChange={setCountryFilter}>
                            <SelectTrigger className="w-[140px] border-slate-200 rounded-lg">
                                <SelectValue placeholder="Country" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Countries</SelectItem>
                                {countries.map((country: string) => (
                                    <SelectItem key={country} value={country}>
                                        {getCountryFlag(country)} {country}
                                        </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="ml-auto">
                        <Button
                            onClick={() => setShowAddSheet(true)}
                            variant="outline"
                            className="bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Employee
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // 2. EMPLOYEE DIRECTORY SECTION
    const employeeColumns: ColumnDef<any>[] = [
        {
            key: "name",
            header: "Employee",
            sortable: true,
            render: (_, employee) => (
                <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                            {employee.name.split(' ').map((n: any) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {employee.email}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: "position",
            header: "Position",
            sortable: true,
            className: "text-sm"
        },
        {
            key: "department",
            header: "Department",
            sortable: true,
            render: (val) => <Badge variant="outline">{val}</Badge>
        },
        {
            key: "location",
            header: "Location",
            render: (_, employee) => (
                <div className="text-xs">
                    {getCountryFlag(employee.country)} {employee.location}
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (val) => getStatusBadge(val)
        },
        {
            key: "joinDate",
            header: "Join Date",
            sortable: true,
            className: "text-sm",
            render: (val) => new Date(val).toLocaleDateString()
        },
        {
            key: "actions",
            header: "Actions",
            render: (_, employee) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedEmployee(employee); setShowDetailsDialog(true); setIsEditing(false); }}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedEmployee(employee); setEditForm({...employee}); setShowDetailsDialog(true); setIsEditing(true); }}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteEmployee(employee.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const renderEmployeeDirectory = () => (
        <DataTable
            columns={employeeColumns}
            data={filteredEmployees}
            onRowClick={(employee) => {
                setSelectedEmployee(employee);
                setShowDetailsDialog(true);
                setIsEditing(false);
            }}
            showToolbar={false} // Since filter bar is rendered separately
            className="mb-5"
        />
    );

    // 3. DEPARTMENT SECTION
    const renderDepartmentOverview = () => (
        <Card className="rounded-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    Department Overview
                </CardTitle>
                <CardDescription>Employee distribution and statistics</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                {/*<StatGrid stats={employeeStats} />*/}
            </CardContent>
        </Card>
    );

    // 4. ORG CHART SECTION
    const renderOrgChart = () => (
        <Card>
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-600" />
                    Organization Chart
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <DepartmentChartPage />
            </CardContent>
        </Card>
    );

    return {
        renderFilterBar,
        renderEmployeeDirectory,
        renderDepartmentOverview,
        renderOrgChart
    };
};