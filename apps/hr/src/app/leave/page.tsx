// ✅ Data integrated — uses useLeaves()
// Fake data removed: leaveRequests from @/data/employee-data
// Fields not in API response: department, days (calculated), appliedDate, approver, coveringEmployee (fallbacks)

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaveProvider } from "@/components/sections/calendar/LeaveContext";
import { LeaveCalendar } from "@/components/sections/calendar/LeaveCalendar";
import { Button } from "@/components/ui/button";
import { Calendar, CircleUser, ClipboardList, Plus, Search } from "lucide-react";
import Link from "next/link";
import { BalanceCards } from "@/components/sections/leave/balance-cards";
import { RequestLeaveDialog } from "@/components/sections/leave/request-leave-dialog";
import { useMyLeave } from "@/hooks/useLeaveBalances";
import { TimeOffStats } from "@/data/Header-data";
import { StatsHeader } from "@/components/sections/header";
import { LeaveRequestsTable } from "@/components/sections/leave/leave-requests-table";
import { LeaveDetailSheet } from "@/components/sections/sheets/leave-detail-sheet";
import type { EmployeeLeaveRequest } from "@/types/employee-leave";
import type { Leave } from "@/types/api";
import { useLeaves } from "@/hooks/useLeaves";
import { isLeaveStatus } from "@/components/sections/leave/leave-utils";

const formatLeaveTypeLabel = (type?: string) => {
  if (!type) return "—";
  const normalized = type.toLowerCase().replace(/_/g, " ");
  const labels: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    maternity: "Maternity Leave",
    paternity: "Paternity Leave",
    unpaid: "Personal Leave",
    other: "Study Leave",
  };
  return labels[normalized] ?? type;
};

const normalizeLeaveType = (type?: string) => {
  if (!type) return "";
  return formatLeaveTypeLabel(type).toLowerCase();
};

const mapLeaveToRequest = (leave: Leave, index: number): EmployeeLeaveRequest => {
  const start = parseISO(leave.startDate);
  const end = parseISO(leave.endDate);
  const days =
    Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
      ? 0
      : Math.max(1, differenceInCalendarDays(end, start) + 1);
  const normalizedStatus = (leave.status ?? "pending").toLowerCase();

  return {
    id: Number.parseInt(leave.id, 10) || index + 1,
    employeeId: leave.employeeId ?? "—",
    name: leave.employeeName ?? "—",
    department: "—",
    leaveType: formatLeaveTypeLabel(leave.type),
    startDate: leave.startDate,
    endDate: leave.endDate,
    days,
    status: isLeaveStatus(normalizedStatus) ? normalizedStatus : "pending",
    appliedDate: leave.startDate ?? "—",
    reason: leave.reason ?? "—",
    approver: "—",
    coveringEmployee: "—",
  };
};

const Page = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<EmployeeLeaveRequest | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);

  const { data: leavesResponse, isLoading, isError } = useLeaves();
  const { data: myLeave } = useMyLeave();

  const leaveList = Array.isArray(leavesResponse) ? leavesResponse : [];

  const leaveRequests = useMemo(() => leaveList.map(mapLeaveToRequest), [leaveList]);

  const openLeaveSheet = useCallback((request: EmployeeLeaveRequest) => {
    setSelectedRequest(request);
    setIsSheetOpen(true);
  }, []);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) setSelectedRequest(null);
  }, []);

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

  const filteredRequests = leaveRequests.filter((request) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !query ||
      request.name.toLowerCase().includes(query) ||
      request.employeeId.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || request.status === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "all" ||
      normalizeLeaveType(request.leaveType) === typeFilter.toLowerCase() ||
      request.leaveType.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen p-0 w-full flex justify-center">
      <div className="flex flex-col gap-6 w-full">
        <StatsHeader
          title="Time Off"
          subtitle="Manage GanzAfrica Leaves"
          scrolled={scrolled}
          stats={TimeOffStats}
          ClassName="w-full"
        />
        {/* Tab I want */}
        <Tabs defaultValue="requests" className="w-full flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="h-auto w-fit gap-1 rounded-xl bg-slate-200 p-1.5">
              <TabsTrigger
                value="mine"
                className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                <CircleUser className="size-4 shrink-0" />
                My Time Off
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                <ClipboardList className="size-4 shrink-0" />
                Leave Requests
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                <Calendar className="size-4 shrink-0" />
                Leave Calendar
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/leave/approvals">Approvals</Link>
              </Button>
              <Button onClick={() => setRequestOpen(true)}>
                <Plus className="mr-1.5 size-4" /> Request time off
              </Button>
            </div>
          </div>

          <TabsContent value="mine" className="space-y-6">
            <BalanceCards balances={myLeave?.balances ?? []} />
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search requests..."
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
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[180px] border-slate-200">
                        <SelectValue placeholder="Leave Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                        <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                        <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                        <SelectItem value="Maternity Leave">Maternity Leave</SelectItem>
                        <SelectItem value="Study Leave">Study Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6 overflow-x-auto">
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
                  <LeaveRequestsTable
                    data={filteredRequests}
                    onRowClick={openLeaveSheet}
                    onViewDetails={openLeaveSheet}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calendar">
            <Card className="shadow-sm bg-transparent">
              <CardContent className="p-0">
                <LeaveProvider>
                  <LeaveCalendar />
                </LeaveProvider>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <RequestLeaveDialog open={requestOpen} onOpenChange={setRequestOpen} />

      {selectedRequest && (
        <LeaveDetailSheet
          open={isSheetOpen}
          onOpenChange={handleSheetOpenChange}
          request={selectedRequest}
          onViewDetails={openLeaveSheet}
        />
      )}
    </div>
  );
};

export default Page;
