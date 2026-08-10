"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";
import { EmployeeManagementContent } from "@/components/sections/employee/employee-tabs-management";
import { StatsHeader } from "@/components/sections/header";
import { useEmployees, useDepartments } from "@/hooks/useEmployees";
import { Badge } from "@/components/ui/badge";
import type { Employee, EmployeeLifecycleStatus, EmployeeStats } from "@/types/api";
import { AddEmployeeSheet } from "@/components/sections/sheets/add-employee-sheet";

const PAGE_SIZE = 25;

export const getStatusBadge = (status: EmployeeLifecycleStatus | string) => {
  switch (status) {
    case "onboarding":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Onboarding</Badge>;
    case "active":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    case "on_leave":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">On Leave</Badge>;
    case "offboarding":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Offboarding</Badge>;
    case "exited":
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Exited</Badge>;
    default:
      return <Badge variant="outline">{status ?? "—"}</Badge>;
  }
};

/** DataTable/employee-tabs-management still expect a flat display row — this is the only place that shape is built. */
const mapEmployeeForDisplay = (emp: Employee) => ({
  id: emp.id,
  name: `${emp.first_name} ${emp.last_name}`.trim(),
  email: emp.work_email ?? emp.personal_email ?? "—",
  position: emp.job_title ?? "—",
  department: emp.department ?? "—",
  status: emp.status,
  joinDate: emp.hired_at ?? "",
  avatar: emp.picture ?? "",
  manager: emp.manager ? `${emp.manager.first_name} ${emp.manager.last_name}`.trim() : "—",
  hasAccount: !!emp.account,
});

function computeStats(data: Employee[], total: number): EmployeeStats {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    total,
    active: data.filter((e) => e.status === "active").length,
    onLeave: data.filter((e) => e.status === "on_leave").length,
    newThisMonth: data.filter((e) => e.hired_at && new Date(e.hired_at) >= startOfMonth).length,
  };
}

const Page = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    data: employeesResponse,
    isLoading,
    isError,
  } = useEmployees({
    search: searchTerm || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    department: departmentFilter === "all" ? undefined : departmentFilter,
    page,
    limit: PAGE_SIZE,
  });
  const { data: departments } = useDepartments();

  const total = employeesResponse?.total ?? 0;
  const totalPages = employeesResponse?.pages ?? 1;
  const employeeList = useMemo(() => employeesResponse?.data ?? [], [employeesResponse]);

  const displayEmployees = useMemo(() => employeeList.map(mapEmployeeForDisplay), [employeeList]);
  const stats = useMemo(() => computeStats(employeeList, total), [employeeList, total]);

  const mappedStats = [
    { icon: Briefcase, label: "Total Employees", value: stats.total.toString() },
    { icon: Briefcase, label: "Active", value: stats.active.toString() },
    { icon: Briefcase, label: "On Leave", value: stats.onLeave.toString() },
    { icon: Briefcase, label: "New This Month", value: stats.newThisMonth.toString() },
  ];

  const sections = EmployeeManagementContent({
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    departmentFilter,
    setDepartmentFilter,
    departments: departments ?? [],
    filteredEmployees: displayEmployees,
    onSelectEmployee: (row: { id: string }) => router.push(`/employees/${row.id}`),
    setShowAddSheet,
    getStatusBadge,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, departmentFilter]);

  useEffect(() => {
    const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null;

    const onScroll = () => {
      const y = mainEl ? mainEl.scrollTop : window.scrollY;
      setScrolled(y > 10);
    };

    onScroll();
    if (mainEl) {
      mainEl.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f6f8fb] dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="space-y-6">
        <StatsHeader
          title="Employee"
          subtitle="Manage your team"
          scrolled={scrolled}
          stats={mappedStats}
          isLoading={isLoading}
        />
        <Tabs defaultValue="employees" className="flex flex-col">
          <div>{sections.renderFilterBar()}</div>

          <TabsContent value="employees">
            {isLoading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Loading...
              </div>
            )}

            {isError && (
              <div className="flex items-center justify-center py-12 text-red-500">
                Failed to load data. Please try again.
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {sections.renderEmployeeDirectory()}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 py-2 bg-white rounded-md border">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="departments">
            {!isLoading && !isError && sections.renderDepartmentOverview()}
          </TabsContent>

          <TabsContent value="org-chart">
            {!isLoading && !isError && sections.renderOrgChart()}
          </TabsContent>
        </Tabs>

        <AddEmployeeSheet open={showAddSheet} onOpenChange={setShowAddSheet} />
      </div>
    </div>
  );
};

export default Page;
