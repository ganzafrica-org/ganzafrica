'use client';

import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { useLeaveContext } from './LeaveContext';
import { LeaveRequest, PublicHoliday } from '@/types/leave';
import { LeaveRequests } from './LeaveRequests';
import { PublicHolidays } from './PublicHolidays';
import { LeaveRequestModal } from './LeaveRequestModal';
import { ViewEditDeleteDrawer } from './ViewEditDeleteDrawer';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function LeaveCalendar() {
  const { leaveRequests, publicHolidays, getTeamMemberById } = useLeaveContext();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LeaveRequest | PublicHoliday | null>(null);
  const [drawerType, setDrawerType] = useState<'LEAVE' | 'HOLIDAY'>('LEAVE');

  const handleEventClick = (clickInfo: any) => {
    const { leave, holiday, type } = clickInfo.event.extendedProps;
    if (type === 'HOLIDAY') {
      setSelectedItem(holiday);
      setDrawerType('HOLIDAY');
    } else {
      setSelectedItem(leave);
      setDrawerType('LEAVE');
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
        title: employee?.name || 'Unknown',
        start: start.toISOString().split('T')[0],
        end: calendarEnd.toISOString().split('T')[0],
        extendedProps: {
          leave,
          employee,
          type: 'LEAVE',
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
        start: start.toISOString().split('T')[0],
        end: calendarEnd.toISOString().split('T')[0],
        extendedProps: {
          holiday,
          type: 'HOLIDAY',
        },
      };
    });

    return [...leaveEvents, ...holidayEvents];
  }, [leaveRequests, publicHolidays, getTeamMemberById]);

  const renderEventContent = (eventInfo: any) => {
    const { type, leave, holiday, employee } = eventInfo.event.extendedProps;

    if (type === 'HOLIDAY') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center w-full px-2 py-1 bg-green-600 text-white rounded-full text-[10px] font-bold overflow-hidden">
                <span className="truncate">{holiday.name}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{holiday.name}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    const emojiMap: Record<string, string> = {
      'Annual Leave': '🌴',
      'Sick Leave': '🤒',
      'Sick': '🤒',
      'Emergency': '⚡',
      'Paid': '💰',
      'Casual': '🏖️',
    };

    const emoji = emojiMap[leave.leaveType] || '📅';

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-col w-full p-2 bg-orange-500 text-white rounded-lg shadow-sm border-l-4 border-orange-700 overflow-hidden cursor-pointer">
              <div className="flex items-center gap-1 font-bold text-xs">
                <span>{emoji}</span>
                <span className="truncate">{employee?.name}</span>
              </div>
              <div className="text-[10px] opacity-90 truncate mt-0.5">
                {leave.leaveType}
              </div>
              {leave.notes && (
                <div className="text-[9px] opacity-80 truncate italic mt-1 border-t border-orange-400/30 pt-1">
                  {leave.notes.length > 40 ? `${leave.notes.substring(0, 40)}...` : leave.notes}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-bold">{employee?.name}</p>
            <p className="text-xs">{leave.leaveType}</p>
            {leave.notes && <p className="text-xs mt-1 italic">"{leave.notes}"</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border border-gray-200 rounded-lg overflow-y-auto shrink-0 flex flex-col">
        <div className="p-6 space-y-8 flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <Button size="sm" onClick={() => setIsRequestModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 h-8">
              <Plus className="h-4 w-4 mr-1" /> Request
            </Button>
          </div>
          
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time Off Requests</h2>
              <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">View All</button>
            </div>
            <LeaveRequests />
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Public Holidays</h2>
              <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">View All</button>
            </div>
            <PublicHolidays />
          </section>
        </div>
      </div>

      {/* Main Content - FullCalendar */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listMonth',
            }}
            events={events}
            eventClick={handleEventClick}
            eventContent={renderEventContent}
            height="100%"
            dayMaxEvents={true}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
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
