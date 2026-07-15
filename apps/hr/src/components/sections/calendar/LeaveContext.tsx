"use client";

import React, { createContext, useContext, useState } from "react";
import {
  LeaveContextType,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  TeamMember,
  PublicHoliday,
} from "@/types/leave";
import { doRangesOverlap } from "@/lib/date-utils";
import { mock_holidays, mock_leaves, mock_team_members } from "@/data/leave-data";

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export function LeaveProvider({ children }: { children: React.ReactNode }) {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mock_leaves);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>(mock_holidays);

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
    return mock_team_members.find((member) => member.id === id);
  };

  const value: LeaveContextType = {
    teamMembers: mock_team_members,
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
