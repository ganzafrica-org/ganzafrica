import React from "react";
import {
  Search,
  Building,
  FileText,
  Mail,
  MoreVertical,
  Eye,
  Plus,
  UserX,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, ColumnDef } from "../table-component";
import DepartmentChartPage from "./department-chart";
import { getInitialsFromName, currencyToFlag } from "@/lib/helpers/employee-util";

interface DisplayEmployeeRow {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  status: string;
  joinDate: string;
  avatar: string;
  manager: string;
  hasAccount: boolean;
  contractCurrency: string | null;
  isActive: boolean;
}

export const EmployeeManagementContent = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  departmentFilter,
  setDepartmentFilter,
  activeFilter,
  setActiveFilter,
  departments,
  filteredEmployees,
  onSelectEmployee,
  onDeactivateEmployee,
  onReactivateEmployee,
  canManageActivation,
  setShowAddSheet,
  getStatusBadge,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  departmentFilter: string;
  setDepartmentFilter: (v: string) => void;
  activeFilter: string;
  setActiveFilter: (v: string) => void;
  departments: string[];
  filteredEmployees: DisplayEmployeeRow[];
  onSelectEmployee: (row: DisplayEmployeeRow) => void;
  onDeactivateEmployee: (row: { id: string; name: string }) => void;
  onReactivateEmployee: (row: { id: string; name: string }) => void;
  canManageActivation: boolean;
  setShowAddSheet: (v: boolean) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}) => {
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
              <SelectTrigger className="w-[150px] border-slate-200 rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="offboarding">Offboarding</SelectItem>
                <SelectItem value="exited">Exited</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px] border-slate-200 rounded-lg">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[150px] border-slate-200 rounded-lg">
                <SelectValue placeholder="Active" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="all">All</SelectItem>
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
  const employeeColumns: ColumnDef<DisplayEmployeeRow>[] = [
    {
      key: "name",
      header: "Employee",
      sortable: true,
      render: (_, employee) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={employee.avatar} />
            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
              {getInitialsFromName(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium flex items-center gap-1.5">
              {employee.name}
              {!employee.hasAccount && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600">
                  no account
                </Badge>
              )}
              {!employee.isActive && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-slate-500">
                  inactive
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> {employee.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      className: "text-sm",
    },
    {
      key: "department",
      header: "Department",
      render: (val) => <Badge variant="outline">{val}</Badge>,
    },
    {
      key: "manager",
      header: "Manager",
      className: "text-sm",
    },
    {
      key: "contractCurrency",
      header: "Flag",
      render: (val) => {
        const flag = currencyToFlag(val as string | null);
        if (!flag)
          return (
            <span className="text-slate-300" title="No active contract">
              —
            </span>
          );
        return (
          <span className="text-lg" title={flag.label}>
            {flag.flag}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (val) => getStatusBadge(val),
    },
    {
      key: "joinDate",
      header: "Hired",
      className: "text-sm",
      render: (val) => (val ? new Date(val).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      header: "",
      render: (_, employee) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelectEmployee(employee)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              {canManageActivation && (
                <>
                  <DropdownMenuSeparator />
                  {employee.isActive ? (
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDeactivateEmployee({ id: employee.id, name: employee.name })}
                    >
                      <UserX className="mr-2 h-4 w-4" /> Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => onReactivateEmployee({ id: employee.id, name: employee.name })}
                    >
                      <UserCheck className="mr-2 h-4 w-4" /> Reactivate
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const renderEmployeeDirectory = () => (
    <DataTable
      columns={employeeColumns}
      data={filteredEmployees}
      onRowClick={onSelectEmployee}
      showToolbar={false}
      showPagination={false}
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
        <div className="flex flex-wrap gap-2">
          {departments.map((dept) => (
            <Badge key={dept} variant="outline" className="text-sm">
              {dept}
            </Badge>
          ))}
        </div>
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
    renderOrgChart,
  };
};
