"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Briefcase } from "lucide-react";
import { EmployeeManagementContent } from "@/components/sections/employee/employee-tabs-management";
import { StatsHeader } from "@/components/sections/header";
import { useEmployees, useDepartments, useDeleteEmployee } from "@/hooks/useEmployees";
import { getStatusBadge } from "@/lib/helpers/employee-util";
import type { Employee, EmployeeStats } from "@/types/api";
import { AddEmployeeSheet } from "@/components/sections/sheets/add-employee-sheet";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { EmployeeSheet } from "@/components/sections/sheets/employee-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 25;

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
  contractCurrency: emp.contract_currency,
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

const PageContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<{ id: string; name: string } | null>(
    null,
  );
  const searchParams = useSearchParams();
  const deleteEmployee = useDeleteEmployee();
  const { roles } = useAuth();
  // employees:manage (HR only) — director/program_manager have employees:read and can view this
  // page's directory, but the backend 403s them on delete, so don't offer an action that'll fail.
  const canManageEmployees = roles.includes("hr") || roles.includes("admin");

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
    onSelectEmployee: (row: { id: string }) => setSelectedEmployeeId(row.id),
    onDeleteEmployee: (row: { id: string; name: string }) => setDeletingEmployee(row),
    canDeleteEmployee: canManageEmployees,
    setShowAddSheet,
    getStatusBadge,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, departmentFilter]);

  // Deep link from the org chart (or anywhere else): /employees?employee=<id> opens the sheet.
  useEffect(() => {
    const employeeId = searchParams.get("employee");
    if (employeeId) setSelectedEmployeeId(employeeId);
  }, [searchParams]);

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
        <Tabs defaultValue="employees" className="w-full flex flex-col">
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

        <ReusableSheet
          open={!!selectedEmployeeId}
          onOpenChange={(open) => !open && setSelectedEmployeeId(null)}
          maxWidth="w-full sm:max-w-4xl"
        >
          {selectedEmployeeId && (
            <EmployeeSheet employeeId={selectedEmployeeId} onOpenEmployee={setSelectedEmployeeId} />
          )}
        </ReusableSheet>

        <ConfirmDialog
          open={!!deletingEmployee}
          onOpenChange={(open) => !open && setDeletingEmployee(null)}
          title="Delete employee?"
          description={
            deletingEmployee
              ? `This permanently deletes ${deletingEmployee.name}'s employee record, including their contracts, leave history, and onboarding/offboarding progress. Their login is deactivated, not deleted. This cannot be undone.`
              : ""
          }
          confirmLabel="Delete employee"
          isConfirming={deleteEmployee.isPending}
          onConfirm={() => {
            if (!deletingEmployee) return;
            deleteEmployee.mutate(deletingEmployee.id, {
              onSuccess: () => setDeletingEmployee(null),
            });
          }}
        />
      </div>
    </div>
  );
};

const Page = () => (
  <Suspense fallback={null}>
    <PageContent />
  </Suspense>
);

export default Page;
