"use client";

import { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { useLeaveContext } from "./LeaveContext";
import { LeaveRequest, PublicHoliday } from "@/types/leave";
import { LeaveRequests } from "./LeaveRequests";
import { PublicHolidays } from "./PublicHolidays";
import { LeaveRequestModal } from "./LeaveRequestModal";
import { ViewEditDeleteDrawer } from "./ViewEditDeleteDrawer";
import { ChevronDown, Flag, Plus, Umbrella } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitialsFromName } from "@/lib/helpers/employee-util";

// Same tokens as leave-utils.tsx's getLeaveStatusBadge — approved is the only one this ticket
// asks to change (green); pending/rejected keep the existing status-badge convention rather than
// the calendar's previous, unrelated orange.
const STATUS_BG: Record<string, string> = {
  approved: "bg-green-100 border-green-300 text-green-900",
  pending: "bg-amber-100 border-amber-300 text-amber-900",
  rejected: "bg-red-100 border-red-300 text-red-900",
};

/**
 * A single leave entry's calendar chip: owner avatar (falling back to initials), and a background
 * keyed off status — only "approved" gets the green treatment (punch-list #6); pending/rejected
 * keep the existing status-badge tokens (leave-utils.tsx's getLeaveStatusBadge) rather than the
 * calendar's old, unrelated orange. Exported as its own component (rather than inlined in
 * renderEventContent) so it's testable without mounting FullCalendar, which doesn't render its
 * event content in jsdom.
 */
export function LeaveEventChip({
  leave,
  employee,
}: {
  leave: LeaveRequest;
  employee?: { name: string; avatar: string };
}) {
  const statusKey = (leave.status as string)?.toLowerCase();
  const bg = STATUS_BG[statusKey] ?? "bg-slate-100 border-slate-300 text-slate-900";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex flex-col w-full rounded-lg shadow-sm border-l-4 overflow-hidden cursor-pointer ${bg}`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs px-0.5 pt-0.5">
              <Avatar className="h-4 w-4 shrink-0">
                <AvatarImage src={employee?.avatar || undefined} alt={employee?.name} />
                <AvatarFallback className="text-[8px]">
                  {getInitialsFromName(employee?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{employee?.name}</span>
            </div>
            <div className="text-[10px] opacity-90 truncate mt-0.5 px-0.5">{leave.leaveType}</div>
            {leave.notes && (
              <div className="text-[9px] opacity-80 truncate italic mt-1 border-t border-current/20 pt-1 px-0.5 pb-0.5">
                {leave.notes.length > 40 ? `${leave.notes.substring(0, 40)}...` : leave.notes}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-bold">{employee?.name}</p>
          <p className="text-xs">{leave.leaveType}</p>
          {leave.notes && <p className="text-xs mt-1 italic">{leave.notes}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Data constants
const balances = [
  {
    id: 1,
    name: "Annual Leave",
    available: 8,
  },
];

const requests = [
  {
    id: 1,
    date: "Mar 2nd 2026",
    type: "Annual Leave",
    duration: "1 day",
    status: "Used",
  },
  {
    id: 2,
    date: "Dec 22nd - 31st 2025",
    type: "Annual Leave",
    duration: "6 days",
    status: "Used",
  },
  {
    id: 2,
    date: "Dec 22nd - 31st 2025",
    type: "Sick Leave",
    duration: "6 days",
    status: "Used",
  },
  {
    id: 2,
    date: "Dec 22nd - 31st 2025",
    type: "Maternity Leave",
    duration: "6 days",
    status: "Not used",
  },
];

export function LeaveCalendar() {
  const { leaveRequests, publicHolidays, getTeamMemberById } = useLeaveContext();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveRequest | PublicHoliday | null>(null);
  const [drawerType, setDrawerType] = useState<"LEAVE" | "HOLIDAY">("LEAVE");

  const handleEventClick = (clickInfo: any) => {
    const { leave, holiday, type } = clickInfo.event.extendedProps;
    if (type === "HOLIDAY") {
      setSelectedItem(holiday);
      setDrawerType("HOLIDAY");
    } else {
      setSelectedItem(leave);
      setDrawerType("LEAVE");
    }
    setIsDrawerOpen(true);
  };

  const events = useMemo(() => {
    const leaveEvents = leaveRequests.map((leave) => {
      const employee = getTeamMemberById(leave.employeeId);
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const calendarEnd = new Date(end);
      calendarEnd.setDate(calendarEnd.getDate() + 1);

      return {
        id: leave.id,
        title: employee?.name || "Unknown",
        start: start.toISOString().split("T")[0],
        end: calendarEnd.toISOString().split("T")[0],
        extendedProps: {
          leave,
          employee,
          type: "LEAVE",
        },
      };
    });

    const holidayEvents = publicHolidays.map((holiday) => {
      const start = new Date(holiday.startDate);
      const end = new Date(holiday.endDate);
      const calendarEnd = new Date(end);
      calendarEnd.setDate(calendarEnd.getDate() + 1);

      return {
        id: holiday.id,
        title: holiday.name,
        start: start.toISOString().split("T")[0],
        end: calendarEnd.toISOString().split("T")[0],
        extendedProps: {
          holiday,
          type: "HOLIDAY",
        },
      };
    });

    return [...leaveEvents, ...holidayEvents];
  }, [leaveRequests, publicHolidays, getTeamMemberById]);

  const renderEventContent = (eventInfo: any) => {
    const { type, leave, holiday, employee } = eventInfo.event.extendedProps;

    if (type === "HOLIDAY") {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center items-center gap-1.5 w-full h-8 px-2 rounded-lg bg-brand-accent text-default font-bold overflow-hidden">
                <Flag className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{holiday.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-slate-400 bg-white border border-slate-400 rounded-lg">
              <p>{holiday.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <LeaveEventChip leave={leave} employee={employee} />;
  };

  return (
    <div className="flex overflow-hidden py-6">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border border-gray-200 rounded-lg overflow-y-auto shrink-0 flex flex-col">
        <div className="p-6 space-y-8 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <Button
              size="sm"
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 h-8 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-1" /> Request Leave
            </Button>
          </div>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Time Off Requests
              </h2>
              <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                View All
              </button>
            </div>
            <LeaveRequests />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Public Holidays
              </h2>
            </div>
            <PublicHolidays />
          </section>

          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Annual Leaves
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {balances.map((balance) => (
              <div key={balance.id}>
                <p className="text-sm font-medium text-gray-700">{balance.name}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {balance.available} days available
                </p>
              </div>
            ))}
            <button className="text-sm font-medium text-brand-accent hover:text-brand-dark flex items-center gap-1">
              View details
              <ChevronDown size={14} />
            </button>
          </div>
          <button className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
            View all
          </button>
        </div>
      </div>

      {/* Main Content - FullCalendar */}
      <div className="flex-1 pl-6">
        <div className="bg-white rounded-lg border p-4 h-full">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listMonth",
            }}
            events={events}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="100%"
            dayMaxEvents={true}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              meridiem: false,
            }}
          />
        </div>
      </div>

      {/* Modals & Drawer */}
      <ViewEditDeleteDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedItem}
        type={drawerType}
      />

      <LeaveRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        employeeId="current-user"
      />
    </div>
  );
}
