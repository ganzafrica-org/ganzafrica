"use client";
import { useState, useMemo } from "react";
import { Plus, Filter, MoreHorizontal, ChevronDown, ChevronLeft, ChevronRight, X, Clock, Users } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/components/sidebar-provider";
import PageLayout from "@/components/page-layout";
import { Button } from "@/components/button";
import { Task } from "@/lib/types";
import { initialMembers, initialTasks } from "@/lib/sample-data";
import { mockTeams } from "@/lib/teams-data";

interface Meeting {
  id: string;
  title: string;
  date: Date;
  color: string;
  memberId: string;
  startTime?: string;
  endTime?: string;
}

interface CalendarMember {
  id: string;
  initial: string;
  name: string;
  color: string;
  availability?: { [key: string]: { start: string; end: string }[] };
}

export default function CalendarPage(): React.JSX.Element {
  const [tasks] = useState<Task[]>(initialTasks);
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();
  const [calendarMembers, setCalendarMembers] = useState<CalendarMember[]>([
    { 
      id: '1', 
      initial: 'J', 
      color: '#076297', 
      name: 'John',
      availability: {
        '2020-7-9': [{ start: '09:00', end: '17:00' }],
        '2020-7-10': [{ start: '10:00', end: '18:00' }]
      }
    },
    { 
      id: '2', 
      initial: 'M', 
      color: '#F8B712', 
      name: 'Mary',
      availability: {
        '2020-7-9': [{ start: '08:00', end: '16:00' }],
        '2020-7-12': [{ start: '09:00', end: '17:00' }]
      }
    },
    { 
      id: '3', 
      initial: 'T', 
      color: '#005C30', 
      name: 'Tom',
      availability: {
        '2020-7-14': [{ start: '11:00', end: '19:00' }]
      }
    },
    { 
      id: '4', 
      initial: 'S', 
      color: '#009758', 
      name: 'Sarah',
      availability: {
        '2020-7-8': [{ start: '09:00', end: '17:00' }],
        '2020-7-23': [{ start: '10:00', end: '18:00' }]
      }
    },
    { 
      id: '5', 
      initial: 'D', 
      color: '#073392', 
      name: 'David',
      availability: {
        '2020-7-15': [{ start: '09:00', end: '17:00' }],
        '2020-7-20': [{ start: '10:00', end: '18:00' }]
      }
    },
    { id: '6', initial: 'E', color: '#2F88E1', name: 'Emily', availability: {} },
    { id: '7', initial: 'R', color: '#D42B1D', name: 'Robert', availability: {} },
    { id: '8', initial: 'L', color: '#6366f1', name: 'Lisa', availability: {} },
    { id: '9', initial: 'K', color: '#059669', name: 'Kevin', availability: {} },
    { id: '10', initial: 'A', color: '#7c3aed', name: 'Anna', availability: {} },
    { id: '11', initial: 'P', color: '#dc2626', name: 'Peter', availability: {} },
    { id: '12', initial: 'N', color: '#16a34a', name: 'Nina', availability: {} },
    { id: '13', initial: 'B', color: '#0891b2', name: 'Brian', availability: {} },
    { id: '14', initial: 'C', color: '#c026d3', name: 'Carol', availability: {} },
    { id: '15', initial: 'G', color: '#ea580c', name: 'George', availability: {} },
    { id: '16', initial: 'H', color: '#65a30d', name: 'Helen', availability: {} },
    { id: '17', initial: 'I', color: '#0284c7', name: 'Ian', availability: {} },
    { id: '18', initial: 'V', color: '#db2777', name: 'Victoria', availability: {} },
    { id: '19', initial: 'W', color: '#9333ea', name: 'William', availability: {} },
    { id: '20', initial: 'O', color: '#ca8a04', name: 'Olivia', availability: {} },
    { id: '21', initial: 'F', color: '#15803d', name: 'Frank', availability: {} },
    { id: '22', initial: 'Q', color: '#be123c', name: 'Quinn', availability: {} },
    { id: '23', initial: 'U', color: '#0369a1', name: 'Uma', availability: {} },
    { id: '24', initial: 'X', color: '#a21caf', name: 'Xavier', availability: {} }
  ]);

  const [meetings, setMeetings] = useState<Meeting[]>([
    { id: '1', title: 'Workshop IDND', date: new Date(2020, 6, 3), color: '#076297', memberId: '1', startTime: '10:00', endTime: '12:00' },
    { id: '2', title: 'Deadline: Haystack', date: new Date(2020, 6, 8), color: '#005C30', memberId: '4', startTime: '14:00', endTime: '15:00' },
    { id: '3', title: 'Firewall meeting', date: new Date(2020, 6, 8), color: '#F8B712', memberId: '2', startTime: '09:00', endTime: '10:30' },
    { id: '4', title: 'Preparation: Design', date: new Date(2020, 6, 10), color: '#009758', memberId: '3', startTime: '13:00', endTime: '14:00' },
    { id: '5', title: 'DEV QA', date: new Date(2020, 6, 12), color: '#073392', memberId: '2', startTime: '11:00', endTime: '12:00' },
    { id: '6', title: 'Landingpage finished', date: new Date(2020, 6, 14), color: '#2F88E1', memberId: '3', startTime: '15:00', endTime: '16:00' },
    { id: '7', title: 'This is really long sampl...', date: new Date(2020, 6, 19), color: '#076297', memberId: '1', startTime: '10:00', endTime: '11:00' },
    { id: '8', title: 'Important Goal achieved', date: new Date(2020, 6, 23), color: '#D42B1D', memberId: '4', startTime: '16:00', endTime: '17:00' },
    { id: '9', title: 'This is really long sampl...', date: new Date(2020, 6, 23), color: '#F8B712', memberId: '1', startTime: '09:00', endTime: '10:00' },
    { id: '10', title: 'Design sprint Haystack', date: new Date(2020, 6, 28), color: '#005C30', memberId: '2', startTime: '14:00', endTime: '15:30' },
    { id: '11', title: 'This is really long sampl...', date: new Date(2020, 6, 28), color: '#009758', memberId: '3', startTime: '10:00', endTime: '11:00' },
    { id: '12', title: 'This is really long sampl...', date: new Date(2020, 7, 1), color: '#073392', memberId: '1', startTime: '13:00', endTime: '14:00' },
    { id: '13', title: 'Client Call', date: new Date(2020, 6, 9), color: '#6366f1', memberId: '1', startTime: '10:20', endTime: '10:30' },
    { id: '14', title: 'Zoom Team Sync', date: new Date(2020, 6, 9), color: '#059669', memberId: '2', startTime: '15:00', endTime: '16:00' },
    { id: '15', title: 'Project Review', date: new Date(2020, 6, 15), color: '#073392', memberId: '5', startTime: '11:00', endTime: '12:00' },
    { id: '16', title: 'Sprint Planning', date: new Date(2020, 6, 20), color: '#2F88E1', memberId: '5', startTime: '14:00', endTime: '15:30' },
  ]);

  const [currentDate, setCurrentDate] = useState(new Date(2020, 6, 1));
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(calendarMembers.map(m => m.id));
  const [selectedDayDetails, setSelectedDayDetails] = useState<{ day: number; month: number; year: number } | null>(null);
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingDuration, setNewMeetingDuration] = useState('60');
  const [newMeetingType, setNewMeetingType] = useState<'regular' | 'zoom'>('regular');
  const [currentUser, setCurrentUser] = useState('1'); // Default to John (ID: 1)
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMeetingMembers, setSelectedMeetingMembers] = useState<string[]>([]);

  // Filter members based on selected team
  const availableMembersForMeeting = useMemo(() => {
    if (!selectedTeamId) {
      return [];
    }
    
    const selectedTeam = mockTeams.find(t => t.id === selectedTeamId);
    if (!selectedTeam) {
      return [];
    }
    
    // Map team member IDs to calendar members
    return calendarMembers.filter(cm => {
      // For now, map by name since calendar members use different IDs
      // In production, you'd have a unified member ID system
      return selectedTeam.memberIds.some(memberId => {
        const teamMember = initialMembers.find(m => m.id === memberId);
        return teamMember && cm.name.toLowerCase().includes(teamMember.name.toLowerCase().split(' ')[0] || '');
      });
    });
  }, [selectedTeamId, calendarMembers]);

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startDayOfWeek, year, month };
  };

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setFocusedDay(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setFocusedDay(null);
  };

  const getMeetingsForDay = (day: number, currentMonth: number, currentYear: number) => {
    return meetings.filter(m => {
      const matchesDate = m.date.getDate() === day && 
                         m.date.getMonth() === currentMonth &&
                         m.date.getFullYear() === currentYear;
      const matchesMember = m.memberId === currentUser;
      return matchesDate && matchesMember;
    });
  };

  const handleDragStart = (e: React.DragEvent, meetingId: string) => {
    e.dataTransfer.setData('meetingId', meetingId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: number, targetMonth: number, targetYear: number) => {
    e.preventDefault();
    const meetingId = e.dataTransfer.getData('meetingId');
    if (!meetingId) return;

    setMeetings(prevMeetings => 
      prevMeetings.map(meeting => {
        if (meeting.id === meetingId) {
          const newDate = new Date(targetYear, targetMonth, day);
          // Preserve the time
          if (meeting.startTime) {
            const [hours, minutes] = meeting.startTime.split(':');
            newDate.setHours(parseInt(hours || '0'), parseInt(minutes || '0'));
          }
          return { ...meeting, date: newDate };
        }
        return meeting;
      })
    );
  };

  const isToday = (day: number) => {
    return day === 9 && month === 6 && year === 2020;
  };

  const shouldShowDay = (day: number, isPrevMonth: boolean, isNextMonth: boolean) => {
    if (focusedDay === null) return true;
    if (isPrevMonth || isNextMonth) return false;
    
    const today = new Date();
    const targetDate = new Date(year, month, day);
    
    switch (selectedFilter) {
      case 'today':
        return day === 9; // Hardcoded today as July 9, 2020
      case 'tomorrow':
        return day === 10;
      case 'week':
        return day >= 9 && day <= 15;
      case '2weeks':
        return day >= 9 && day <= 22;
      case 'month':
        return true;
      default:
        return true;
    }
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowViewDropdown(false);
    if (filter === 'today') {
      setFocusedDay(9);
    } else if (filter === 'tomorrow') {
      setFocusedDay(10);
    } else {
      setFocusedDay(null);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const createMeeting = () => {
    if (!newMeetingTitle.trim() || !newMeetingDate || !newMeetingTime) return;
    
    const meetingColors = ['#076297', '#005C30', '#009758', '#F8B712', '#073392', '#2F88E1', '#D42B1D', '#6366f1', '#059669', '#7c3aed'];
    const [hours, minutes] = newMeetingTime.split(':');
    const meetingDate = new Date(newMeetingDate);
    meetingDate.setHours(parseInt(hours || '0'), parseInt(minutes || '0'));
    
    const duration = parseInt(newMeetingDuration);
    const endTime = new Date(meetingDate.getTime() + duration * 60000);
    
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      title: newMeetingType === 'zoom' ? `🔗 ${newMeetingTitle}` : newMeetingTitle,
      date: meetingDate,
      color: newMeetingType === 'zoom' ? '#6366f1' : (meetingColors[Math.floor(Math.random() * meetingColors.length)] ?? '#076297'),
      memberId: currentUser, // Assign to current user
      startTime: newMeetingTime,
      endTime: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
    };
    
    setMeetings([...meetings, newMeeting]);
    setNewMeetingTitle('');
    setNewMeetingDate('');
    setNewMeetingTime('');
    setNewMeetingDuration('60');
    setNewMeetingType('regular');
    setShowCreateMeeting(false);
  };

  const getAvailabilityForDay = (day: number, currentMonth: number, currentYear: number) => {
    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    const currentMember = calendarMembers.find(m => m.id === currentUser);
    if (!currentMember) return [];
    
    return [{
      member: currentMember,
      slots: currentMember.availability?.[dateKey] || []
    }].filter(a => a.slots.length > 0);
  };

  const calendarDays = [];
  const prevMonthDays = new Date(year, month, 0).getDate();
  
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthDays - i, isPrevMonth: true, isNextMonth: false });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ day, isPrevMonth: false, isNextMonth: false });
  }
  
  const remainingCells = 35 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDays.push({ day, isNextMonth: true, isPrevMonth: false });
  }

  return (
    <PageLayout 
      members={initialMembers} 
      tasks={tasks} 
      title="Calendar"
      headerAction={
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowCreateMeeting(true)}
            variant="primary"
            size="md"
            showPlusIcon
          >
            Create Meeting
          </Button>
          <div className="flex items-center -space-x-2">
            {calendarMembers.slice(0, 4).map((member) => (
              <button
                key={member.id}
                onClick={() => setCurrentUser(member.id)}
                style={{ backgroundColor: member.color }}
                className={`w-8 h-8 rounded-full grid place-items-center text-white text-xs font-semibold ring-2 transition ${
                  currentUser === member.id ? 'ring-gray-400 ring-4' : 'ring-white'
                }`}
                title={member.name}
              >
                {member.initial}
              </button>
            ))}
            {calendarMembers.length > 4 && (
              <button
                onClick={() => setShowTeamModal(true)}
                style={{ backgroundColor: '#F8B712' }}
                className="w-8 h-8 rounded-full grid place-items-center text-white text-xs font-bold ring-2 ring-white transition hover:opacity-90"
                title="View all team members"
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                +{calendarMembers.length - 4}
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Month navigation and filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-gray-800">
                  {monthNames[month]} {year}
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={goToPreviousMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 transition text-gray-700 shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={goToNextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-50 transition text-gray-700 shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <button 
                    onClick={() => setShowViewDropdown(!showViewDropdown)}
                    className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-medium shadow-sm flex items-center gap-2 hover:bg-gray-50 transition"
                  >
                    <Filter className="w-4 h-4" />
                    {selectedFilter === 'all' ? 'Filter by day' : 
                     selectedFilter === 'today' ? 'Today' :
                     selectedFilter === 'tomorrow' ? 'Tomorrow' :
                     selectedFilter === 'week' ? 'This Week' :
                     selectedFilter === '2weeks' ? '2 Weeks' : 'This Month'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {showViewDropdown && (
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-xl overflow-hidden z-20 min-w-[160px] border border-gray-200">
                      <button 
                        onClick={() => handleFilterSelect('all')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        All Days
                      </button>
                      <button 
                        onClick={() => handleFilterSelect('today')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        Today
                      </button>
                      <button 
                        onClick={() => handleFilterSelect('tomorrow')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        Tomorrow
                      </button>
                      <button 
                        onClick={() => handleFilterSelect('week')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        This Week
                      </button>
                      <button 
                        onClick={() => handleFilterSelect('2weeks')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        2 Weeks
                      </button>
                      <button 
                        onClick={() => handleFilterSelect('month')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                      >
                        This Month
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4">
              <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, idx) => (
                  <div key={idx} className="p-2 text-center">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase">{day.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7">
                {calendarDays.map((dayObj, idx) => {
                  const { day, isPrevMonth, isNextMonth } = dayObj;
                  const currentMonthForDay = isPrevMonth ? month - 1 : isNextMonth ? month + 1 : month;
                  const dayMeetings = getMeetingsForDay(day, currentMonthForDay, year);
                  const availability = getAvailabilityForDay(day, currentMonthForDay, year);
                  const additionalCount = dayMeetings.length > 2 ? dayMeetings.length - 2 : 0;
                  const show = shouldShowDay(day, isPrevMonth, isNextMonth);
                  
                  if (!show) return null;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedDayDetails({ day, month: currentMonthForDay, year })}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, currentMonthForDay, year)}
                      className={`min-h-[80px] border-r border-b border-gray-100 p-2 transition cursor-pointer bg-white hover:bg-blue-50 ${
                        isToday(day) && !isPrevMonth && !isNextMonth ? 'ring-2 ring-blue-500 ring-inset' : ''
                      }`}
                    >
                      <div className="mb-1.5">
                        {isToday(day) && !isPrevMonth && !isNextMonth ? (
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {day}
                          </div>
                        ) : (
                          <div className={`text-[13px] font-semibold ${
                            isPrevMonth || isNextMonth ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {day}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayMeetings.slice(0, 2).map(meeting => (
                          <div 
                            key={meeting.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, meeting.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ backgroundColor: meeting.color }}
                            className="text-white text-[10px] px-2 py-0.5 rounded font-medium truncate flex items-center gap-1 cursor-move"
                          >
                            <Clock className="w-3 h-3" />
                            {meeting.title}
                          </div>
                        ))}
                        {additionalCount > 0 && (
                          <div className="text-[10px] text-blue-600 font-semibold pl-1">
                            +{additionalCount} more
                          </div>
                        )}
                        {availability.length > 0 && (
                          <div className="text-[9px] text-green-600 font-medium pt-1 border-t border-gray-100">
                            {availability.length} available
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          {/* Create Meeting Modal */}
          {showCreateMeeting && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Create Meeting</h3>
                  <button onClick={() => setShowCreateMeeting(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                    placeholder="Meeting title"
                    className="w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      className="flex-1 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                    />
                    <input
                      type="time"
                      value={newMeetingTime}
                      onChange={(e) => setNewMeetingTime(e.target.value)}
                      className="flex-1 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={newMeetingDuration}
                      onChange={(e) => setNewMeetingDuration(e.target.value)}
                      className="flex-1 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                    <select
                      value={newMeetingType}
                      onChange={(e) => setNewMeetingType(e.target.value as 'regular' | 'zoom')}
                      className="flex-1 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                    >
                      <option value="regular">Regular</option>
                      <option value="zoom">Zoom Meeting</option>
                    </select>
                  </div>

                  {/* Assign Team Section */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Users className="w-4 h-4" />
                      Assign Team
                    </label>
                    <select
                      value={selectedTeamId || ""}
                      onChange={(e) => {
                        setSelectedTeamId(e.target.value || null);
                        setSelectedMeetingMembers([]);
                      }}
                      className="w-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                    >
                      <option value="">Select a team...</option>
                      {mockTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team Members Section - Only show after team selection */}
                  {selectedTeamId && (
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Users className="w-4 h-4" />
                        Team Members
                      </label>
                      <div className="max-h-[200px] overflow-y-auto space-y-2 p-2" style={{ border: '1px solid #e5e7eb', borderRadius: '7px' }}>
                        {availableMembersForMeeting.length > 0 ? (
                          availableMembersForMeeting.map((member) => (
                            <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedMeetingMembers.includes(member.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMeetingMembers([...selectedMeetingMembers, member.id]);
                                  } else {
                                    setSelectedMeetingMembers(selectedMeetingMembers.filter(id => id !== member.id));
                                  }
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div 
                                style={{ backgroundColor: member.color }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                              >
                                {member.initial}
                              </div>
                              <span className="text-sm text-gray-700">{member.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">No members in this team</p>
                        )}
                      </div>
                      {selectedMeetingMembers.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {selectedMeetingMembers.length} member(s) selected
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={createMeeting}
                    variant="primary"
                    size="md"
                    className="flex-1"
                  >
                    Create Meeting
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCreateMeeting(false);
                      setSelectedTeamId(null);
                      setSelectedMeetingMembers([]);
                    }}
                    variant="outline"
                    size="md"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Day Details Modal */}
          {selectedDayDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[500px] max-h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedDayDetails && monthNames[selectedDayDetails.month]} {selectedDayDetails?.day}, {selectedDayDetails?.year}
                  </h3>
                  <button onClick={() => setSelectedDayDetails(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Meetings
                    </h4>
                    {selectedDayDetails && getMeetingsForDay(selectedDayDetails.day, selectedDayDetails.month, selectedDayDetails.year).length > 0 ? (
                      <div className="space-y-2">
                        {selectedDayDetails && getMeetingsForDay(selectedDayDetails.day, selectedDayDetails.month, selectedDayDetails.year).map(meeting => {
                          const member = calendarMembers.find(m => m.id === meeting.memberId);
                          return (
                            <div 
                              key={meeting.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, meeting.id)}
                              className="p-3 rounded-lg cursor-move transition"
                              style={{ backgroundColor: '#f0f8fc' }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f2f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f8fc')}
                            >
                              <div className="flex items-start gap-3">
                                <div 
                                  style={{ backgroundColor: meeting.color }}
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                >
                                  {member?.initial ?? 'U'}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">{meeting.title}</div>
                                  <div className="text-sm text-gray-600">{member?.name}</div>
                                  {meeting.startTime && meeting.endTime && (
                                    <div className="text-xs text-gray-500 mt-1">{meeting.startTime} - {meeting.endTime}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No meetings scheduled</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Availability
                    </h4>
                    {selectedDayDetails && getAvailabilityForDay(selectedDayDetails.day, selectedDayDetails.month, selectedDayDetails.year).length > 0 ? (
                      <div className="space-y-2">
                        {selectedDayDetails && getAvailabilityForDay(selectedDayDetails.day, selectedDayDetails.month, selectedDayDetails.year).map(({ member, slots }) => (
                          <div key={member.id} className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-start gap-3">
                              <div 
                                style={{ backgroundColor: member.color }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                              >
                                {member.initial}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">{member.name}</div>
                                {slots.map((slot, idx) => (
                                  <div key={idx} className="text-sm text-gray-600">
                                    Available: {slot.start} - {slot.end}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No availability information</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members Modal */}
          {showTeamModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Team Members</h3>
                    <p className="text-sm text-gray-500">{calendarMembers.length} members total</p>
                  </div>
                  <button
                    onClick={() => setShowTeamModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {calendarMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setCurrentUser(member.id);
                        setShowTeamModal(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 transition"
                      style={{
                        backgroundColor: currentUser === member.id ? '#f0f8fc' : '#f9fafb',
                        borderRadius: '7px'
                      }}
                      onMouseEnter={(e) => {
                        if (currentUser !== member.id) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentUser !== member.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <div 
                        style={{ backgroundColor: member.color }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      >
                        {member.initial}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">{member.name}</div>
                        <div className="text-xs text-gray-500">
                          {Object.keys(member.availability || {}).length} days available
                        </div>
                      </div>
                      {currentUser === member.id && (
                        <div style={{ color: '#076297' }} className="font-bold">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
    </PageLayout>
  );
}