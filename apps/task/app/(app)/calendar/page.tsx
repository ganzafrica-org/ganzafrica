"use client";
import { useState, useMemo, useEffect } from "react";
import { Plus, Filter, MoreHorizontal, ChevronDown, ChevronLeft, ChevronRight, X, Clock, Users, User as UserIcon, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/components/sidebar-provider";
import PageLayout from "@/components/page-layout";
import { Button } from "@/components/button";
import { Task, TeamMember } from "@/lib/types";
import { taskApi, portalDataApi } from "@/lib/api-client";
import { usersApi, User } from "@/lib/api/users";
import { taskTeamsApi } from "@/lib/api/task-teams";
import { UserAvatar } from "@/components/user-avatar";
import { Tabs } from "@/components/tabs";
import { isCurrentUserAdminOrManager, isCurrentUserAdminOrManagerAsync, getCurrentUserRole, isCurrentUserAdmin } from "@/lib/auth-utils";

interface Meeting {
  id: string;
  title: string;
  date: Date;
  color: string;
  memberId: string;
  startTime?: string;
  endTime?: string;
  type?: 'task' | 'meeting';
  priority?: string;
  status?: string;
}


export default function CalendarPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userHasAccess, setUserHasAccess] = useState<boolean | null>(null);
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
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
  const [viewMode, setViewMode] = useState<'individual' | 'team'>('individual');
  const [selectedMember, setSelectedMember] = useState<string>('1'); // 'all' or member id - default to user 1
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [outlookMeetings, setOutlookMeetings] = useState<Meeting[]>([]);
  const [isSyncingOutlook, setIsSyncingOutlook] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);

  // Sync Outlook meetings from backend
  const syncOutlookMeetings = async () => {
    setIsSyncingOutlook(true);
    try {
      // TODO: Implement real Outlook integration with Microsoft Graph API
      // For now, this is a placeholder for future implementation
      console.log('Outlook sync not yet implemented');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Error syncing Outlook meetings:', error);
    } finally {
      setIsSyncingOutlook(false);
    }
  };

  // Get current user ID from localStorage
  const getCurrentUserId = (): number => {
    try {
      return parseInt(localStorage.getItem('task_user_id') || localStorage.getItem('user_id') || '0');
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return 0;
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check user access
        const hasAccess = await isCurrentUserAdminOrManagerAsync();
        setUserHasAccess(hasAccess);
        
        // Load users
        const usersResponse = await usersApi.listUsers();
        setAllUsers(usersResponse.users || []);
        
        // Load tasks
        const tasksResponse = await taskApi.getAllTasks();
        setTasks(tasksResponse.tasks || []);
        
      // Load teams
      const teamsResponse = await taskTeamsApi.listTeams();
      setTeams(teamsResponse.teams || []);
        
        // Load members (convert users to team members format)
        const users = usersResponse.users || [];
        const teamMembers: TeamMember[] = users.map((user: User) => ({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role_name || 'member',
          avatar_url: user.avatar_url
        }));
        setMembers(teamMembers);
        
        // Set current user to logged-in user
        const currentUserId = getCurrentUserId();
        if (currentUserId > 0) {
          setCurrentUser(currentUserId.toString());
          // Set selected member to current user by default
          setSelectedMember(currentUserId.toString());
        }
        
      } catch (error) {
        console.error('Error loading calendar data:', error);
        setError('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Filter members based on selected team
  const availableMembersForMeeting = useMemo(() => {
    if (!selectedTeamId) {
      return [];
    }
    
    const selectedTeam = teams.find(t => t.id.toString() === selectedTeamId);
    if (!selectedTeam) {
      return [];
    }
    
    if (!selectedTeam.members) {
      return [];
    }
    
    // Map team member IDs to members
    const filteredMembers = members.filter(member => {
      const isTeamMember = selectedTeam.members.some((teamMember: any) => {
        return teamMember.user_id.toString() === member.id;
      });
      return isTeamMember;
    });
    
    return filteredMembers;
  }, [selectedTeamId, members, teams, selectedTeam]);

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

  // Define tabs based on user role
  const tabs = useMemo(() => {
    if (isCurrentUserAdmin()) {
      // Admin sees only individual view
      return [
        { id: 'individual', label: 'Individual View', icon: UserIcon }
      ];
    } else if (isCurrentUserAdminOrManager()) {
      // Manager sees both individual and team view
      return [
        { id: 'individual', label: 'Individual View', icon: UserIcon },
        { id: 'team', label: 'Team View', icon: Users }
      ];
    } else {
      // Other users see only individual view
      return [
        { id: 'individual', label: 'Individual View', icon: UserIcon }
      ];
    }
  }, []);

  const getMeetingsForDay = (day: number, currentMonth: number, currentYear: number) => {
    const dayMeetings = meetings.filter(m => {
      const matchesDate = m.date.getDate() === day && 
                         m.date.getMonth() === currentMonth &&
                         m.date.getFullYear() === currentYear;
      
      if (viewMode === 'individual') {
        return matchesDate && m.memberId === currentUser;
      } else {
        // Team view - show meetings for all team members
        return matchesDate && (selectedMember === 'all' || m.memberId === selectedMember);
      }
    });

    // Add tasks as calendar events
    const dayTasks = tasks.filter(task => {
      // If task has no due date, show it on the current date or creation date
      let taskDate;
      if (task.dueDate) {
        taskDate = new Date(task.dueDate);
      } else if (task.createdAt) {
        taskDate = new Date(task.createdAt);
      } else {
        // If no due date or creation date, show on today's date
        taskDate = new Date();
      }
      
      // TEMPORARY FIX: If all tasks have the same date (Oct 22, 2025), 
      // show them on today's date for testing
      const today = new Date();
      if (taskDate.getFullYear() === 2025 && taskDate.getMonth() === 9 && taskDate.getDate() === 22) {
        taskDate = today;
      }
      
      const matchesDate = taskDate.getDate() === day && 
                         taskDate.getMonth() === currentMonth &&
                         taskDate.getFullYear() === currentYear;
      
      if (viewMode === 'individual') {
        // Individual view - show tasks based on selected member
        if (selectedMember === 'all') {
          // Show all tasks
          return matchesDate;
        } else {
          // Show tasks for selected member (default to current user if no member selected)
          const memberToShow = selectedMember || currentUser;
          const isAssignedToMember = task.assignees && task.assignees.some(assigneeId => 
            assigneeId.toString() === memberToShow
          );
          return matchesDate && isAssignedToMember;
        }
      } else {
        // Team view - show tasks for selected member or all
        if (selectedMember === 'all') {
          // If a team is selected, only show tasks for team members
          if (selectedTeam) {
            const teamMemberIds = selectedTeam.members?.map((member: any) => {
              return member.user_id.toString();
            }) || [];
            
            const isAssignedToTeamMember = task.assignees && task.assignees.some(assigneeId => 
              teamMemberIds.includes(assigneeId.toString())
            );
            
            return matchesDate && isAssignedToTeamMember;
          }
          return matchesDate;
        } else {
          const isAssignedToMember = task.assignees && task.assignees.some(assigneeId => 
            assigneeId.toString() === selectedMember
          );
          return matchesDate && isAssignedToMember;
        }
      }
    });

    // Convert tasks to meeting-like objects for display
    const taskEvents = dayTasks.map(task => {
      // Use due date, creation date, or current date
      let taskDate;
      if (task.dueDate) {
        taskDate = new Date(task.dueDate);
      } else if (task.createdAt) {
        taskDate = new Date(task.createdAt);
      } else {
        taskDate = new Date();
      }
      
      return {
        id: `task-${task.id}`,
        title: task.title,
        date: taskDate,
        color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#f59e0b' : '#10b981',
        memberId: task.assignees?.[0]?.toString() || '0',
        startTime: '09:00', // Default time for tasks
        endTime: '10:00',
        type: 'task' as const,
        priority: task.priority,
        status: task.status
      };
    });

    return [...dayMeetings, ...taskEvents];
  };


  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const shouldShowDay = (day: number, isPrevMonth: boolean, isNextMonth: boolean) => {
    if (focusedDay === null) return true;
    if (isPrevMonth || isNextMonth) return false;
    
    const today = new Date();
    const targetDate = new Date(year, month, day);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    switch (selectedFilter) {
      case 'today':
        return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      case 'tomorrow':
        return day === tomorrow.getDate() && month === tomorrow.getMonth() && year === tomorrow.getFullYear();
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return targetDate >= weekStart && targetDate <= weekEnd;
      case '2weeks':
        const twoWeekStart = new Date(today);
        twoWeekStart.setDate(today.getDate() - today.getDay());
        const twoWeekEnd = new Date(twoWeekStart);
        twoWeekEnd.setDate(twoWeekStart.getDate() + 13);
        return targetDate >= twoWeekStart && targetDate <= twoWeekEnd;
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
      setFocusedDay(new Date().getDate());
    } else if (filter === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFocusedDay(tomorrow.getDate());
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
    // For now, return empty array since we don't have availability data
    // In a real implementation, this would fetch availability from the backend
    return [];
  };

  // Check if a team has tasks (is occupied)
  const isTeamOccupied = (team: any) => {
    if (!team || !team.members) return false;
    
    const teamMemberIds = team.members.map((member: any) => member.user_id.toString());
    return tasks.some(task => 
      task.assignees && task.assignees.some((assigneeId: string) => 
        teamMemberIds.includes(assigneeId.toString())
      )
    );
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
      members={members} 
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
        </div>
      }
    >
      {/* Tabs Section */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {/* Tabs */}
          {tabs.length > 1 && (
            <Tabs
              tabs={tabs}
              activeTab={viewMode}
              onTabChange={(tabId) => {
                setViewMode(tabId as 'individual' | 'team');
                if (tabId === 'individual') {
                  // Set to current user by default in individual view
                  setSelectedMember(currentUser);
                } else {
                  // Set to 'all' by default in team view
                  setSelectedMember('all');
                }
              }}
            />
          )}
          
          {/* Profile Selector */}
          <div className="flex items-center gap-3">
            {/* Individual View - Show member selector button */}
            {viewMode === 'individual' && (
              <button
                onClick={() => setShowMemberModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#d1d5db', color: '#374151' }}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Select Member</span>
              </button>
            )}
            
            {/* Team View - Show only team selector */}
            {viewMode === 'team' && (
              <>
                {/* Team Selector Button */}
                {!selectedTeam && (
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#d1d5db', color: '#374151' }}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-medium">Select Team</span>
                  </button>
                )}
                
                {/* Team Profile Display - Only show when team is selected */}
                {selectedTeam && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: selectedTeam.color || '#076297' }}
                    >
                      <Users className="w-3 h-3" style={{ color: '#ffffff' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: '#374151' }}>{selectedTeam.name}</span>
                      {isTeamOccupied(selectedTeam) && (
                        <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                          Has Tasks
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTeam(null);
                        setSelectedTeamId(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

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
                            onClick={(e) => e.stopPropagation()}
                            style={{ backgroundColor: meeting.color }}
                            className="text-white text-[10px] px-2 py-0.5 rounded font-medium truncate flex items-center gap-1 cursor-default"
                          >
                            {meeting.type === 'task' ? (
                              <CalendarDays className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
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
                      {teams.map((team) => (
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
                              <UserAvatar 
                                userId={parseInt(member.id)} 
                                size="sm"
                                fallbackColor={member.color}
                              />
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
                          const member = members.find((m: TeamMember) => m.id === meeting.memberId);
                          return (
                            <div 
                              key={meeting.id} 
                              className="p-3 rounded-lg cursor-default transition"
                              style={{ backgroundColor: '#f0f8fc' }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f2f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f8fc')}
                            >
                              <div className="flex items-start gap-3">
                                <UserAvatar 
                                  userId={parseInt(member?.id || '0')} 
                                  size="sm"
                                  fallbackColor={meeting.color}
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-800">{meeting.title}</div>
                                  <div className="text-sm text-gray-600">{member?.name || 'Unknown'}</div>
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
                    <p className="text-sm text-gray-500">No availability information</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Selection Modal */}
          {showTeamModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Select Team</h3>
                    <p className="text-sm text-gray-500">Choose a team to view their calendar</p>
                  </div>
                  <button
                    onClick={() => setShowTeamModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {teams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => {
                        setSelectedTeam(team);
                        setSelectedTeamId(team.id.toString());
                        setShowTeamModal(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 transition"
                      style={{
                        backgroundColor: selectedTeam?.id === team.id ? '#f0f8fc' : '#f9fafb',
                        borderRadius: '7px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTeam?.id !== team.id) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTeam?.id !== team.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded flex items-center justify-center"
                        style={{ backgroundColor: team.color || '#076297' }}
                      >
                        <Users className="w-5 h-5" style={{ color: '#ffffff' }} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">{team.name}</div>
                        <div className="text-xs text-gray-500">
                          {team.member_count || 0} members
                          {isTeamOccupied(team) && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                              Has Tasks
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedTeam?.id === team.id && (
                        <div style={{ color: '#076297' }} className="font-bold">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Team Members Modal */}
          {showMemberModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {viewMode === 'individual' ? 'All Members' : 'Team Members'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {viewMode === 'individual' 
                        ? `${members.length} members total - Select any member to view their tasks`
                        : selectedTeam ? 
                          `${members.filter(member => 
                            selectedTeam.members?.some((teamMember: any) => teamMember.user_id.toString() === member.id)
                          ).length} members in ${selectedTeam.name}`
                          : 'Select a team to view members'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {/* Individual View - Show all members */}
                  {viewMode === 'individual' && (
                    <>
                      {/* All Members Button */}
                      <button
                        onClick={() => {
                          setSelectedMember('all');
                          setShowMemberModal(false);
                        }}
                        className="w-full p-3 flex items-center gap-3 transition"
                        style={{
                          backgroundColor: selectedMember === 'all' ? '#f0f8fc' : '#f9fafb',
                          borderRadius: '7px'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedMember !== 'all') {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedMember !== 'all') {
                            e.currentTarget.style.backgroundColor = '#f9fafb';
                          }
                        }}
                      >
                        <div 
                          style={{ backgroundColor: '#076297' }}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                        >
                          All
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-800">All Members</div>
                          <div className="text-xs text-gray-500">View tasks for all members</div>
                        </div>
                        {selectedMember === 'all' && (
                          <div style={{ color: '#076297' }} className="font-bold">✓</div>
                        )}
                      </button>
                      
                      {/* All Members List */}
                      {members.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => {
                            setSelectedMember(member.id);
                            setShowMemberModal(false);
                          }}
                          className="w-full p-3 flex items-center gap-3 transition"
                          style={{
                            backgroundColor: selectedMember === member.id ? '#f0f8fc' : '#f9fafb',
                            borderRadius: '7px'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedMember !== member.id) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedMember !== member.id) {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                          }}
                        >
                          <UserAvatar userId={parseInt(member.id)} size="md" />
                          <div className="flex-1 text-left">
                            <div className="font-medium text-gray-800">{member.name}</div>
                            <div className="text-xs text-gray-500">{member.email || 'Member'}</div>
                          </div>
                          {selectedMember === member.id && (
                            <div style={{ color: '#076297' }} className="font-bold">✓</div>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                  
                  {/* Team View - Show team members only when team is selected */}
                  {viewMode === 'team' && selectedTeam && (
                    <button
                      onClick={() => {
                        setSelectedMember('all');
                        setShowMemberModal(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 transition"
                      style={{
                        backgroundColor: selectedMember === 'all' ? '#f0f8fc' : '#f9fafb',
                        borderRadius: '7px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMember !== 'all') {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMember !== 'all') {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <div 
                        style={{ backgroundColor: '#076297' }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      >
                        All
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">All Team Members</div>
                        <div className="text-xs text-gray-500">View all members in {selectedTeam.name}</div>
                      </div>
                      {selectedMember === 'all' && (
                        <div style={{ color: '#076297' }} className="font-bold">✓</div>
                      )}
                    </button>
                  )}
                  {/* Team View - Show team members list or no team message */}
                  {viewMode === 'team' && selectedTeam && (() => {
                    const teamMembers = selectedTeam ? 
                      members.filter(member => 
                        selectedTeam.members?.some((teamMember: any) => teamMember.user_id.toString() === member.id)
                      ) : [];
                    
                    return teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedMember(member.id);
                        setShowMemberModal(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 transition"
                      style={{
                        backgroundColor: selectedMember === member.id ? '#f0f8fc' : '#f9fafb',
                        borderRadius: '7px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMember !== member.id) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMember !== member.id) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                    >
                      <UserAvatar userId={parseInt(member.id)} size="md" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">{member.name}</div>
                        <div className="text-xs text-gray-500">Member</div>
                      </div>
                      {selectedMember === member.id && (
                        <div style={{ color: '#076297' }} className="font-bold">✓</div>
                      )}
                    </button>
                    ));
                  })()}
                  
                  {/* Show message when no team is selected in team view */}
                  {viewMode === 'team' && !selectedTeam && (
                    <div className="p-4 text-center text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">Select a team to view its members</p>
                      <p className="text-xs text-gray-400 mt-1">Click "Select Team" button above to choose a team</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
    </PageLayout>
  );
}