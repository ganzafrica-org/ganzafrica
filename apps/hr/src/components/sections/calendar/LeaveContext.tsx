"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  LeaveContextType,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  TeamMember,
  PublicHoliday,
} from "@/types/leave";
import { doRangesOverlap } from "@/lib/date-utils";
import { mock_holidays } from "@/data/leave-data";
import { useLeaveCalendar } from "@/hooks/useLeaveBalances";
import type { CalendarLeaveEvent } from "@/services/leave-balances.service";

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

// The mock LeaveType/LeaveStatus unions predate the real leave model — map the real backend
// values onto the closest existing display label rather than widening the union everywhere it's
// used purely for a name/badge/emoji lookup.
const TYPE_LABELS: Record<string, LeaveType> = {
  ANNUAL: "Annual Leave",
  SICK: "Sick Leave",
  MATERNITY: "Maternity Leave",
  PATERNITY: "Personal Leave",
  UNPAID: "Casual",
  OTHER: "Study Leave",
};

function toMockLeave(e: CalendarLeaveEvent): LeaveRequest | null {
  // Cancelled requests aren't a meaningful "away" event — leave them off the calendar, same as
  // they'd never have shown up under the old approved-only query.
  if (e.status !== "Pending" && e.status !== "Approved" && e.status !== "Rejected") return null;
  return {
    id: e.id,
    employeeId: e.employeeId,
    leaveType: TYPE_LABELS[e.type] ?? "Casual",
    startDate: new Date(e.startDate),
    endDate: new Date(e.endDate),
    notes: e.reason,
    status: e.status as LeaveStatus,
    requestedAt: new Date(e.startDate),
  };
}

function toTeamMember(e: CalendarLeaveEvent): TeamMember {
  return {
    id: e.employeeId,
    name: e.employeeName,
    department: "",
    avatar: e.employeePicture ?? "",
  };
}

export function LeaveProvider({ children }: { children: React.ReactNode }) {
  // A generously wide, fixed window rather than tracking FullCalendar's live visible range as the
  // user navigates — simpler, and comfortably covers normal month/week browsing either direction.
  const { from, to } = useMemo(() => {
    const start = new Date();
    start.setUTCFullYear(start.getUTCFullYear() - 1);
    const end = new Date();
    end.setUTCFullYear(end.getUTCFullYear() + 1);
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) };
  }, []);

  const { data: events } = useLeaveCalendar(from, to);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>(mock_holidays);

  useEffect(() => {
    if (!events) return;
    setLeaveRequests(events.map(toMockLeave).filter((l): l is LeaveRequest => l !== null));
    const byEmployee = new Map<string, TeamMember>();
    events.forEach((e) => byEmployee.set(e.employeeId, toTeamMember(e)));
    setTeamMembers([...byEmployee.values()]);
  }, [events]);

  const addLeaveRequest = (
    employeeId: string,
    leaveType: LeaveType,
    startDate: Date,
    endDate: Date,
    notes: string,
  ) => {
    const newLeave: LeaveRequest = {
      id: String(Date.now()),
      employeeId,
      leaveType,
      startDate,
      endDate,
      notes,
      status: "Pending",
      requestedAt: new Date(),
    };
    setLeaveRequests([...leaveRequests, newLeave]);
  };

  const updateLeaveRequest = (updatedRequest: LeaveRequest) => {
    setLeaveRequests(
      leaveRequests.map((leave) => (leave.id === updatedRequest.id ? updatedRequest : leave)),
    );
  };

  const deleteLeaveRequest = (id: string) => {
    setLeaveRequests(leaveRequests.filter((leave) => leave.id !== id));
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus) => {
    setLeaveRequests(
      leaveRequests.map((leave) => (leave.id === id ? { ...leave, status } : leave)),
    );
  };

  const addPublicHoliday = (holiday: Omit<PublicHoliday, "id">) => {
    const newHoliday: PublicHoliday = {
      ...holiday,
      id: String(Date.now()),
    };
    setPublicHolidays([...publicHolidays, newHoliday]);
  };

  const updatePublicHoliday = (updatedHoliday: PublicHoliday) => {
    setPublicHolidays(publicHolidays.map((h) => (h.id === updatedHoliday.id ? updatedHoliday : h)));
  };

  const deletePublicHoliday = (id: string) => {
    setPublicHolidays(publicHolidays.filter((h) => h.id !== id));
  };

  const getFilteredLeaves = (
    selectedMemberId?: string,
    selectedLeaveType?: LeaveType,
    dateRange?: { start: Date; end: Date },
  ): LeaveRequest[] => {
    return leaveRequests.filter((leave) => {
      if (selectedMemberId && leave.employeeId !== selectedMemberId) {
        return false;
      }
      if (selectedLeaveType && leave.leaveType !== selectedLeaveType) {
        return false;
      }
      if (dateRange) {
        const hasOverlap = doRangesOverlap(
          leave.startDate,
          leave.endDate,
          dateRange.start,
          dateRange.end,
        );
        if (!hasOverlap) {
          return false;
        }
      }
      return true;
    });
  };

  const getTeamMemberById = (id: string): TeamMember | undefined => {
    return teamMembers.find((member) => member.id === id);
  };

  const value: LeaveContextType = {
    teamMembers,
    leaveRequests,
    publicHolidays,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest,
    updateLeaveStatus,
    addPublicHoliday,
    updatePublicHoliday,
    deletePublicHoliday,
    getFilteredLeaves,
    getTeamMemberById,
  };

  return <LeaveContext.Provider value={value}>{children}</LeaveContext.Provider>;
}

export function useLeaveContext() {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error("useLeaveContext must be used within LeaveProvider");
  }
  return context;
}
