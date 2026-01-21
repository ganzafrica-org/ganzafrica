"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
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
import { googleCalendarApi, GoogleCalendarEvent } from "@/lib/api/google-calendar";
import { toast } from "sonner";

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

  // Initialize calendar to current month (first day of current month)
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [focusedDay, setFocusedDay] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedDayDetails, setSelectedDayDetails] = useState<{ day: number; month: number; year: number } | null>(null);
  const [currentUser, setCurrentUser] = useState('1'); // Default to John (ID: 1)
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'individual' | 'team'>('individual');
  const [selectedMember, setSelectedMember] = useState<string>('1'); // 'all' or member id - default to user 1
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null); // Store logged-in user ID
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [outlookMeetings, setOutlookMeetings] = useState<Meeting[]>([]);
  const [isSyncingOutlook, setIsSyncingOutlook] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [tabs, setTabs] = useState<Array<{ id: string; label: string; icon: any }>>([
    { id: 'individual', label: 'Individual View', icon: UserIcon }
  ]);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<Array<GoogleCalendarEvent & { userId?: string }>>([]);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isLoadingGoogleCalendar, setIsLoadingGoogleCalendar] = useState(false);
  // Show Google Calendar by default when connected
  const [showGoogleCalendar, setShowGoogleCalendar] = useState(true);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize logged-in user ID on mount
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    if (currentUserId > 0 && !loggedInUserId) {
      const userIdStr = currentUserId.toString();
      setLoggedInUserId(userIdStr);
    }
  }, []);

  // Sync Outlook meetings from backend
  const syncOutlookMeetings = async () => {
    setIsSyncingOutlook(true);
    try {
      // TODO: Implement real Outlook integration with Microsoft Graph API
      // For now, this is a placeholder for future implementation
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      // Error syncing Outlook meetings
    } finally {
      setIsSyncingOutlook(false);
    }
  };

  // Get current user ID from localStorage
  const getCurrentUserId = (): number => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        return 0; // fallback for SSR
      }
      
      // Try task_user first (most common)
      const userStr = localStorage.getItem('task_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 0;
      }
      
      // Fallback to task_user_id or user_id
      const userIdStr = localStorage.getItem('task_user_id') || localStorage.getItem('user_id');
      if (userIdStr) {
        return parseInt(userIdStr, 10);
      }
    } catch (error) {
      // Error getting current user ID
    }
    return 0;
  };

  // Check Google Calendar connection status
  const checkGoogleCalendarStatus = async () => {
    try {
      const currentUserId = getCurrentUserId();
      const userIdStr = currentUserId > 0 ? currentUserId.toString() : null;
      
      // Check connection status for the logged-in user
      const response = userIdStr 
        ? await googleCalendarApi.getConnectionStatus([userIdStr])
        : await googleCalendarApi.getConnectionStatus();
      
      // Handle both single and multi-user response formats
      const isConnected = !!(response.connected || 
        (response.connectedUserIds && response.connectedUserIds.length > 0));
      
      setIsGoogleCalendarConnected(isConnected);
    } catch (error) {
      setIsGoogleCalendarConnected(false);
    }
  };

  // Get user IDs to fetch Google Calendar events for based on current selection
  const getUserIdsForCalendarSync = useMemo(() => {
    const userIds: string[] = [];
    const isManagerOrAdmin = isCurrentUserAdminOrManager();
    
    // Get logged-in user ID as default
    const currentUserId = getCurrentUserId();
    const loggedInUserId = currentUserId > 0 ? currentUserId.toString() : null;
    
    if (viewMode === 'individual') {
      if (selectedMember === 'all') {
        // When "All Members" is selected, show logged-in user's calendar by default
        if (loggedInUserId) {
          userIds.push(loggedInUserId);
        }
      } else {
        // Show events for selected member
        userIds.push(selectedMember);
      }
    } else {
      // Team view
      if (selectedTeam) {
        // Get all team member IDs
        const teamMemberIds = selectedTeam.members?.map((member: any) => member.user_id.toString()) || [];
        userIds.push(...teamMemberIds);
      } else if (selectedMember === 'all') {
        // When "All Members" is selected, show logged-in user's calendar by default
        if (loggedInUserId) {
          userIds.push(loggedInUserId);
        }
      } else {
        // Show events for selected member
        userIds.push(selectedMember);
      }
    }
    
    // Remove duplicates
    return [...new Set(userIds)];
  }, [viewMode, selectedMember, selectedTeam, members, allUsers]);

  // Sync Google Calendar events
  const syncGoogleCalendarEvents = useCallback(async () => {
    // Allow all users to sync their Google Calendar (not just managers/admins)
    if (!isGoogleCalendarConnected) {
      return;
    }

    setIsLoadingGoogleCalendar(true);
    try {
      // Calculate date range for current month view
      const { year, month } = getDaysInMonth(currentDate);
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      // Get user IDs to fetch events for
      const userIdsToSync = getUserIdsForCalendarSync;

      // Check which users have Google Calendar connected
      const statusResponse = await googleCalendarApi.getConnectionStatus(userIdsToSync);
      
      // Handle both single user (connected: boolean) and multi-user (connectedUserIds: string[]) responses
      let connectedIds: string[] = [];
      if (statusResponse.connectedUserIds && statusResponse.connectedUserIds.length > 0) {
        // Multi-user response
        connectedIds = statusResponse.connectedUserIds;
      } else if (statusResponse.connected && userIdsToSync.length === 1) {
        // Single user response - if connected is true and we only requested one user, use that user
        connectedIds = userIdsToSync;
      }
      
      if (connectedIds.length === 0) {
        setGoogleCalendarEvents([]);
        setIsLoadingGoogleCalendar(false);
        return;
      }

      // Fetch events for all connected users
      const response = await googleCalendarApi.getEvents(
        startDate.toISOString(),
        endDate.toISOString(),
        connectedIds
      );
      
      setGoogleCalendarEvents(response.events || []);
    } catch (error) {
      setGoogleCalendarEvents([]);
    } finally {
      setIsLoadingGoogleCalendar(false);
    }
  }, [isCurrentUserAdminOrManager, isGoogleCalendarConnected, currentDate, getUserIdsForCalendarSync, viewMode, selectedMember, selectedTeam]);

  // Connect Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      const response = await googleCalendarApi.getAuthUrl();
      if (response.authUrl) {
        window.location.href = response.authUrl;
      }
    } catch (error) {
      toast.error('Failed to connect Google Calendar. Please try again.');
    }
  };

  // Disconnect Google Calendar
  const disconnectGoogleCalendar = async () => {
    try {
      await googleCalendarApi.disconnect();
      setIsGoogleCalendarConnected(false);
      setGoogleCalendarEvents([]);
      setShowGoogleCalendar(false);
      toast.success('Google Calendar disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect Google Calendar. Please try again.');
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
        // Transform tasks from API format (snake_case) to frontend format (camelCase)
        const transformedTasks: Task[] = (tasksResponse.tasks || []).map((task: any) => {
          // Preserve the original date string to avoid timezone conversion issues
          // If due_date exists, keep it as-is (it's already in ISO format from backend)
          // This ensures November dates stay November, October dates stay October
          let dueDateStr: string | undefined = undefined;
          if (task.due_date) {
            // If it's already a string, use it directly
            if (typeof task.due_date === 'string') {
              dueDateStr = task.due_date;
            } else {
              // If it's a Date object or other format, convert to ISO string
              dueDateStr = new Date(task.due_date).toISOString();
            }
          }
          
          let createdAtStr: string | undefined = undefined;
          if (task.created_at) {
            if (typeof task.created_at === 'string') {
              createdAtStr = task.created_at;
            } else {
              createdAtStr = new Date(task.created_at).toISOString();
            }
          }
          
          let updatedAtStr: string | undefined = undefined;
          if (task.updated_at) {
            if (typeof task.updated_at === 'string') {
              updatedAtStr = task.updated_at;
            } else {
              updatedAtStr = new Date(task.updated_at).toISOString();
            }
          }
          
          return {
            id: task.id ? task.id.toString() : Math.random().toString(36).slice(2),
            title: task.title || 'Untitled Task',
            description: task.description || '',
            deliverables: task.deliverables || '',
            status: (task.status === 'backlog' ? 'overdue' : task.status) || 'todo',
            priority: task.priority || 'medium',
            dueDate: dueDateStr,
            createdAt: createdAtStr,
            updatedAt: updatedAtStr,
            labels: task.labels || [],
            // Normalize assignees to string IDs
            assignees: (task.assignees || [])
              .map((a: any) => (a?.user_id ?? a)?.toString())
              .filter((v: any) => v && v !== ''),
            comments: task.comments || [],
            attachments: task.attachments || [],
            projectId: task.project_id,
            created_by: task.created_by,
            creator_role_id: task.creator_role_id,
            creator_role_name: task.creator_role_name,
          };
        });
        setTasks(transformedTasks);
        
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
          const userIdStr = currentUserId.toString();
          setCurrentUser(userIdStr);
          setLoggedInUserId(userIdStr);
          // Always default to logged-in user's calendar (for both managers/admins and regular users)
          // Managers/admins can still switch to other users via the member selection modal
          setSelectedMember(userIdStr);
        }

        // Check Google Calendar connection status and sync events for all users
        try {
          const currentUserId = getCurrentUserId();
          const userIdStr = currentUserId > 0 ? currentUserId.toString() : null;
          
          // Check connection status for the logged-in user
          const statusResponse = userIdStr 
            ? await googleCalendarApi.getConnectionStatus([userIdStr])
            : await googleCalendarApi.getConnectionStatus();
          
          // Handle both single and multi-user response formats
          const isConnected = !!(statusResponse.connected || 
            (statusResponse.connectedUserIds && statusResponse.connectedUserIds.length > 0));

          setIsGoogleCalendarConnected(isConnected);
          
          if (isConnected) {
            setShowGoogleCalendar(true);
            // Sync events for current month automatically
            const { year, month } = getDaysInMonth(currentDate);
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0, 23, 59, 59);
            
            try {
              // Fetch events for the selected member (logged-in user by default)
              const userIdsToFetch = userIdStr ? [userIdStr] : [];
              const eventsResponse = await googleCalendarApi.getEvents(
                startDate.toISOString(),
                endDate.toISOString(),
                userIdsToFetch.length > 0 ? userIdsToFetch : undefined
              );
              setGoogleCalendarEvents(eventsResponse.events || []);
            } catch (syncError) {
              setGoogleCalendarEvents([]);
            }
          }
          // If not connected, user can manually connect using the button
        } catch (statusError) {
          setIsGoogleCalendarConnected(false);
        }
        
      } catch (error) {
        setError('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Sync Google Calendar events when calendar month changes, connection status changes, or selection changes
  useEffect(() => {
    if (isGoogleCalendarConnected) {
      syncGoogleCalendarEvents();
    }
  }, [currentDate, isGoogleCalendarConnected, viewMode, selectedMember, selectedTeam, getUserIdsForCalendarSync, syncGoogleCalendarEvents, isCurrentUserAdminOrManager]);

  // Auto-sync Google Calendar events when connected (on mount and when connection status changes)
  useEffect(() => {
    if (isGoogleCalendarConnected) {
      // Auto-enable Google Calendar view and sync events
      setShowGoogleCalendar(true);
      syncGoogleCalendarEvents();
    }
  }, [isGoogleCalendarConnected, syncGoogleCalendarEvents]);

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle Google Calendar OAuth callback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const googleConnected = urlParams.get('google_calendar_connected');
    const googleError = urlParams.get('error');
    const errorMessage = urlParams.get('message');

    if (googleConnected === 'true') {
      setIsGoogleCalendarConnected(true);
      setShowGoogleCalendar(true);
      // Sync events immediately after connection
      if (isCurrentUserAdminOrManager()) {
        syncGoogleCalendarEvents();
      }
      // Remove query parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (googleError === 'google_auth_failed') {
      const message = errorMessage 
        ? `Failed to connect Google Calendar: ${decodeURIComponent(errorMessage)}`
        : 'Failed to connect Google Calendar. Please try again.';
      alert(message);
      // Google Calendar connection error
      // Remove query parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);


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

  // Define tabs based on user role - compute on client side only to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let computedTabs: Array<{ id: string; label: string; icon: any }>;
    if (isCurrentUserAdmin()) {
      // Admin sees only individual view
      computedTabs = [
        { id: 'individual', label: 'Individual View', icon: UserIcon }
      ];
    } else if (isCurrentUserAdminOrManager()) {
      // Manager sees both individual and team view
      computedTabs = [
        { id: 'individual', label: 'Individual View', icon: UserIcon },
        { id: 'team', label: 'Team View', icon: Users }
      ];
    } else {
      // Other users see only individual view
      computedTabs = [
        { id: 'individual', label: 'Individual View', icon: UserIcon }
      ];
    }
    setTabs(computedTabs);
  }, []);

  // Helper function to get task date, normalized to start of day
  // Parses date strings carefully to avoid timezone issues
  const getTaskDate = (task: Task): Date => {
    let taskDate: Date;
    if (task.dueDate) {
      // Parse the ISO string date and extract just the date part to avoid timezone issues
      const dateStr = task.dueDate;
      // If it's an ISO string, extract the date part (YYYY-MM-DD)
      if (dateStr.includes('T')) {
        const dateOnly = dateStr.split('T')[0];
        if (!dateOnly) return new Date(dateStr);
        const parts = dateOnly.split('-');
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10); // 1-12
          const day = parseInt(parts[2], 10);
          // Validate the parsed values
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            taskDate = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
          } else {
            // Fallback to parsing the full string
            taskDate = new Date(dateStr);
          }
        } else {
          taskDate = new Date(dateStr);
        }
      } else if (dateStr.includes('-')) {
        // Handle date-only strings like "2024-01-27"
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10); // 1-12
          const day = parseInt(parts[2], 10);
          // Validate the parsed values
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            taskDate = new Date(year, month - 1, day);
          } else {
            taskDate = new Date(dateStr);
          }
        } else {
          taskDate = new Date(dateStr);
        }
      } else {
        taskDate = new Date(dateStr);
      }
    } else if (task.createdAt) {
      // Parse creation date similarly
      const dateStr = task.createdAt;
      if (dateStr.includes('T')) {
        const dateOnly = dateStr.split('T')[0];
        if (!dateOnly) return new Date(dateStr);
        const parts = dateOnly.split('-');
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10); // 1-12
          const day = parseInt(parts[2], 10);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            taskDate = new Date(year, month - 1, day);
          } else {
            taskDate = new Date(dateStr);
          }
        } else {
          taskDate = new Date(dateStr);
        }
      } else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10); // 1-12
          const day = parseInt(parts[2], 10);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            taskDate = new Date(year, month - 1, day);
          } else {
            taskDate = new Date(dateStr);
          }
        } else {
          taskDate = new Date(dateStr);
        }
      } else {
        taskDate = new Date(dateStr);
      }
    } else {
      // If no due date or creation date, show on today's date
      taskDate = new Date();
    }
    
    // Normalize to start of day to avoid timezone issues
    taskDate.setHours(0, 0, 0, 0);
    
    // Final validation: ensure the date is valid
    if (isNaN(taskDate.getTime())) {
      // Invalid date parsed for task
      // Fallback to today's date
      taskDate = new Date();
      taskDate.setHours(0, 0, 0, 0);
    }
    
    return taskDate;
  };

  /**
   * Get meetings and tasks for a specific day in the calendar
   * @param day - Day of the month (1-31)
   * @param currentMonth - Month index (0-indexed: 0 = January, 11 = December)
   * @param currentYear - Year (e.g., 2025)
   * @returns Array of meetings and tasks for the specified day
   * 
   * This function ensures:
   * 1. Tasks are displayed only on their actual due date
   * 2. Tasks appear in the correct month (October tasks in October, November tasks in November)
   * 3. Tasks display with their actual time from the database
   * 4. Month boundaries are respected (no cross-month date rollover)
   */
  const getMeetingsForDay = (day: number, currentMonth: number, currentYear: number) => {
    // Normalize the target date to start of day for comparison
    // currentMonth is 0-indexed (0 = January, 11 = December)
    const targetDate = new Date(currentYear, currentMonth, day);
    targetDate.setHours(0, 0, 0, 0);
    
    // Validate that the created date matches the intended month/year
    // (JavaScript Date constructor can roll over to next month if day is invalid)
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const targetDay = targetDate.getDate();
    
    // CRITICAL: If the month doesn't match, the date rolled over - don't show tasks for this day
    // This ensures we only show tasks for the actual calendar month being viewed
    // For example: if viewing November (month 10), don't show October (month 9) tasks
    if (targetMonth !== currentMonth || targetYear !== currentYear) {
      return [];
    }
    
    // Debug logging for month verification (enable if needed)
    // console.log(`Calendar showing month ${currentMonth + 1}/${currentYear}, checking day ${day} -> ${targetYear}-${targetMonth + 1}-${targetDay}`);
    
    const dayMeetings = meetings.filter(m => {
      // Normalize meeting date to start of day
      const meetingDate = new Date(m.date);
      meetingDate.setHours(0, 0, 0, 0);
      
      const matchesDate = meetingDate.getTime() === targetDate.getTime();
      
      if (viewMode === 'individual') {
        return matchesDate && m.memberId === currentUser;
      } else {
        // Team view - show meetings for all team members
        return matchesDate && (selectedMember === 'all' || m.memberId === selectedMember);
      }
    });

    // Add tasks as calendar events - filter by exact date match
    const dayTasks = tasks.filter(task => {
      // CRITICAL: Extract month directly from the dueDate string FIRST to avoid timezone issues
      // This ensures November tasks (month 11) only show in November, October tasks (month 10) only in October
      let taskMonthFromString: number | null = null;
      let taskYearFromString: number | null = null;
      let taskDayFromString: number | null = null;
      
      if (task.dueDate) {
        const dateStr = task.dueDate;
        const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
        if (dateOnly) {
          const parts = dateOnly.split('-');
          if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
            taskYearFromString = parseInt(parts[0], 10);
            taskMonthFromString = parseInt(parts[1], 10); // 1-12 from database
            taskDayFromString = parseInt(parts[2], 10);
          }
        }
      }
      
      // Use string-based comparison first (most reliable)
      if (taskMonthFromString !== null && taskYearFromString !== null && taskDayFromString !== null) {
        // Convert database month (1-12) to 0-indexed (0-11) for comparison with targetMonth
        const taskMonth0Indexed = taskMonthFromString - 1;
        
        // CRITICAL CHECK: Month and year must match exactly
        // November tasks (month 11 = index 10) should only show when viewing November (targetMonth = 10)
        // October tasks (month 10 = index 9) should only show when viewing October (targetMonth = 9)
        // This prevents October tasks from appearing in November view
        if (taskMonth0Indexed !== targetMonth || taskYearFromString !== targetYear) {
          // Debug: Log when tasks are filtered out due to month mismatch
          // console.log(`Filtering out task "${task.title}": Task month=${taskMonthFromString} (index ${taskMonth0Indexed}), Calendar month=${targetMonth + 1} (index ${targetMonth})`);
          return false; // Task is in a different month/year - don't show it
        }
        
        // Day must also match
        if (taskDayFromString !== targetDay) {
          return false; // Day doesn't match
        }
      } else {
        // Fallback: use parsed date if string parsing failed
        const taskDate = getTaskDate(task);
        const taskYear = taskDate.getFullYear();
        const taskMonth = taskDate.getMonth(); // 0-indexed (0 = January, 11 = December)
        const taskDay = taskDate.getDate();
        
        // Verify month and year match
        if (taskMonth !== targetMonth || taskYear !== targetYear) {
          return false; // Task is in a different month/year - don't show it
        }
        
        // Verify day matches
        if (taskDay !== targetDay) {
          return false; // Day doesn't match
        }
      }
      
      // If we get here, the date matches (month, year, and day all match)
      // No need for additional checks - we've already verified everything above
      
      // Apply view mode and member filtering
      if (viewMode === 'individual') {
        // Individual view - show tasks based on selected member
        if (selectedMember === 'all') {
          // When "All Members" is selected, show tasks for logged-in user
          const loggedInUserId = getCurrentUserId();
          const memberToShow = loggedInUserId > 0 ? loggedInUserId.toString() : currentUser;
          const isAssignedToMember = task.assignees && task.assignees.some(assigneeId => 
            assigneeId.toString() === memberToShow
          );
          return isAssignedToMember;
        } else {
          // Show tasks for selected member
          const isAssignedToMember = task.assignees && task.assignees.some(assigneeId => 
            assigneeId.toString() === selectedMember
          );
          return isAssignedToMember;
        }
      } else {
        // Team view - show tasks for selected member or all
        if (selectedMember === 'all') {
          // When "All Members" is selected, show tasks for logged-in user
          const loggedInUserId = getCurrentUserId();
          const memberToShow = loggedInUserId > 0 ? loggedInUserId.toString() : currentUser;
          const isAssignedToMember = task.assignees && task.assignees.some(assigneeId => 
            assigneeId.toString() === memberToShow
          );
          return isAssignedToMember;
        } else {
          const isAssignedToMember = task.assignees && task.assignees.some(assigneeId => 
            assigneeId.toString() === selectedMember
          );
          return isAssignedToMember;
        }
      }
    });

    // Add Google Calendar events (filtered by selected users/teams)
    const googleCalendarDayEvents: Meeting[] = [];
    const shouldShowGoogleCalendar = isGoogleCalendarConnected;
    
    if (shouldShowGoogleCalendar && googleCalendarEvents.length > 0) {
      // Determine which user IDs to show events for
      const userIdsToShow: string[] = [];
      const loggedInUserId = getCurrentUserId();
      const loggedInUserIdStr = loggedInUserId > 0 ? loggedInUserId.toString() : null;
      
      if (viewMode === 'individual') {
        if (selectedMember === 'all') {
          // When "All Members" is selected, show logged-in user's calendar
          if (loggedInUserIdStr) {
            userIdsToShow.push(loggedInUserIdStr);
          }
        } else {
          userIdsToShow.push(selectedMember);
        }
      } else {
        // Team view
        if (selectedTeam) {
          const teamMemberIds = selectedTeam.members?.map((member: any) => member.user_id.toString()) || [];
          userIdsToShow.push(...teamMemberIds);
        } else if (selectedMember === 'all') {
          // When "All Members" is selected, show logged-in user's calendar
          if (loggedInUserIdStr) {
            userIdsToShow.push(loggedInUserIdStr);
          }
        } else {
          userIdsToShow.push(selectedMember);
        }
      }
      
      googleCalendarEvents.forEach((event) => {
        // Filter events by userId if available
        const eventUserId = (event as any).userId;
        if (eventUserId && !userIdsToShow.includes(eventUserId)) {
          return; // Skip events from users not in the selection
        }
        
        // If no userId on event but we have a selection, only show if selectedMember is 'all'
        if (!eventUserId && selectedMember !== 'all') {
          return;
        }
        
        let eventDate: Date;
        
        // Handle both dateTime and date formats
        if (event.start.dateTime) {
          eventDate = new Date(event.start.dateTime);
        } else if (event.start.date) {
          eventDate = new Date(event.start.date);
        } else {
          return; // Skip if no valid date
        }

        eventDate.setHours(0, 0, 0, 0);
        
        // Check if event is on the target day
        if (
          eventDate.getFullYear() === targetYear &&
          eventDate.getMonth() === targetMonth &&
          eventDate.getDate() === targetDay
        ) {
          // Extract time from event
          let startTime: string | undefined;
          let endTime: string | undefined;
          
          if (event.start.dateTime) {
            const start = new Date(event.start.dateTime);
            startTime = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
          }
          
          if (event.end.dateTime) {
            const end = new Date(event.end.dateTime);
            endTime = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
          }

          // Use event userId if available, otherwise fall back to currentUser
          const memberIdForEvent = eventUserId || currentUser;

          googleCalendarDayEvents.push({
            id: `google-${event.id}-${memberIdForEvent}`,
            title: event.summary || 'Untitled Event',
            date: eventDate,
            color: '#dc2626', // Red color for Google Calendar events
            memberId: memberIdForEvent,
            startTime,
            endTime,
            type: 'meeting',
          });
        }
      });
    }

    // Convert tasks to meeting-like objects for display
    const taskEvents = dayTasks.map(task => {
      const taskDate = getTaskDate(task);
      
      // Extract time from dueDate if it exists and contains time information
      let startTime: string | undefined;
      let endTime: string | undefined;
      
      if (task.dueDate) {
        // Check if the date string contains time information (has 'T' or space followed by time)
        const hasTime = task.dueDate.includes('T') || /\s\d{2}:\d{2}/.test(task.dueDate);
        if (hasTime) {
          // Parse the full dueDate to get the time component
          const fullDueDate = new Date(task.dueDate);
          const hours = fullDueDate.getHours().toString().padStart(2, '0');
          const minutes = fullDueDate.getMinutes().toString().padStart(2, '0');
          startTime = `${hours}:${minutes}`;
          // Set end time to 1 hour after start time
          const endDate = new Date(fullDueDate);
          endDate.setHours(fullDueDate.getHours() + 1);
          const endHours = endDate.getHours().toString().padStart(2, '0');
          const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
          endTime = `${endHours}:${endMinutes}`;
        }
      } else if (task.createdAt) {
        // Fallback to creation time if no due date and creation date has time
        const hasTime = task.createdAt.includes('T') || /\s\d{2}:\d{2}/.test(task.createdAt);
        if (hasTime) {
          const createdDate = new Date(task.createdAt);
          const hours = createdDate.getHours().toString().padStart(2, '0');
          const minutes = createdDate.getMinutes().toString().padStart(2, '0');
          startTime = `${hours}:${minutes}`;
          const endDate = new Date(createdDate);
          endDate.setHours(createdDate.getHours() + 1);
          const endHours = endDate.getHours().toString().padStart(2, '0');
          const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
          endTime = `${endHours}:${endMinutes}`;
        }
      }
      
      return {
        id: `task-${task.id}`,
        title: task.title,
        date: taskDate,
        color: task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#f59e0b' : '#10b981',
        memberId: task.assignees?.[0]?.toString() || '0',
        startTime,
        endTime,
        type: 'task' as const,
        priority: task.priority,
        status: task.status
      };
    });

    return [...dayMeetings, ...taskEvents, ...googleCalendarDayEvents];
  };


  const isToday = (day: number, checkMonth?: number, checkYear?: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkMonthValue = checkMonth !== undefined ? checkMonth : month;
    const checkYearValue = checkYear !== undefined ? checkYear : year;
    const checkDate = new Date(checkYearValue, checkMonthValue, day);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const shouldShowDay = (day: number, isPrevMonth: boolean, isNextMonth: boolean, checkMonth?: number, checkYear?: number) => {
    if (focusedDay === null) return true;
    if (isPrevMonth || isNextMonth) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkMonthValue = checkMonth !== undefined ? checkMonth : month;
    const checkYearValue = checkYear !== undefined ? checkYear : year;
    const targetDate = new Date(checkYearValue, checkMonthValue, day);
    targetDate.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    switch (selectedFilter) {
      case 'today':
        return targetDate.getTime() === today.getTime();
      case 'tomorrow':
        return targetDate.getTime() === tomorrow.getTime();
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return targetDate >= weekStart && targetDate <= weekEnd;
      case '2weeks':
        const twoWeekStart = new Date(today);
        twoWeekStart.setDate(today.getDate() - today.getDay());
        twoWeekStart.setHours(0, 0, 0, 0);
        const twoWeekEnd = new Date(twoWeekStart);
        twoWeekEnd.setDate(twoWeekStart.getDate() + 13);
        twoWeekEnd.setHours(23, 59, 59, 999);
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
          
          {/* Profile Selector - Pushed to the right */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Google Calendar integration */}
            {!isGoogleCalendarConnected ? (
              <Button
                onClick={connectGoogleCalendar}
                variant="outline"
                size="sm"
                disabled={isLoadingGoogleCalendar}
                className="flex items-center gap-2"
              >
                {isLoadingGoogleCalendar ? 'Connecting...' : 'Connect Google Calendar'}
              </Button>
            ) : (
              <Button
                onClick={disconnectGoogleCalendar}
                variant="outline"
                size="sm"
                disabled={isLoadingGoogleCalendar}
                className="flex items-center gap-2"
              >
                Disconnect Google Calendar
              </Button>
            )}
            
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
                  
                  // Calculate correct month and year for previous/next month days
                  let currentMonthForDay = month;
                  let currentYearForDay = year;
                  
                  if (isPrevMonth) {
                    if (month === 0) {
                      currentMonthForDay = 11;
                      currentYearForDay = year - 1;
                    } else {
                      currentMonthForDay = month - 1;
                    }
                  } else if (isNextMonth) {
                    if (month === 11) {
                      currentMonthForDay = 0;
                      currentYearForDay = year + 1;
                    } else {
                      currentMonthForDay = month + 1;
                    }
                  }
                  
                  const dayMeetings = getMeetingsForDay(day, currentMonthForDay, currentYearForDay);
                  const additionalCount = dayMeetings.length > 2 ? dayMeetings.length - 2 : 0;
                  const show = shouldShowDay(day, isPrevMonth, isNextMonth, currentMonthForDay, currentYearForDay);
                  
                  if (!show) return null;
                  
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedDayDetails({ day, month: currentMonthForDay, year: currentYearForDay })}
                      className={`min-h-[80px] border-r border-b border-gray-100 p-2 transition cursor-pointer bg-white hover:bg-blue-50 ${
                        isToday(day, currentMonthForDay, currentYearForDay) ? 'ring-2 ring-blue-500 ring-inset' : ''
                      }`}
                    >
                      <div className="mb-1.5">
                        {isToday(day, currentMonthForDay, currentYearForDay) ? (
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
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

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
                      {/* All Members Button - Selects logged-in user's calendar */}
                      <button
                        onClick={() => {
                          const currentUserId = getCurrentUserId();
                          const userIdToSelect = loggedInUserId || (currentUserId > 0 ? currentUserId.toString() : null);
                          
                          if (userIdToSelect) {
                            setSelectedMember(userIdToSelect);
                            // Also update loggedInUserId if it wasn't set
                            if (!loggedInUserId && currentUserId > 0) {
                              setLoggedInUserId(userIdToSelect);
                            }
                          }
                          setShowMemberModal(false);
                        }}
                        className="w-full p-3 flex items-center gap-3 transition"
                        style={{
                          backgroundColor: '#f9fafb',
                          borderRadius: '7px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
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
                          <div className="text-xs text-gray-500">View your calendar events</div>
                        </div>
                      </button>
                      
                      {/* All Members List */}
                      {members.map((member) => {
                        const isLoggedInUser = loggedInUserId && member.id === loggedInUserId;
                        // Only show selected if it's the actual selected member (not 'all')
                        const isSelected = selectedMember === member.id;
                        
                        return (
                          <button
                            key={member.id}
                            onClick={() => {
                              setSelectedMember(member.id);
                              setShowMemberModal(false);
                            }}
                            className="w-full p-3 flex items-center gap-3 transition"
                            style={{
                              backgroundColor: isSelected ? '#f0f8fc' : '#f9fafb',
                              borderRadius: '7px'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                              }
                            }}
                          >
                            <UserAvatar userId={parseInt(member.id)} size="md" />
                            <div className="flex-1 text-left">
                              <div className="font-medium text-gray-800">
                                {member.name}
                                {isLoggedInUser && <span className="text-xs text-gray-500 ml-2">(You)</span>}
                              </div>
                              <div className="text-xs text-gray-500">{member.email || 'Member'}</div>
                            </div>
                            {isSelected && (
                              <div style={{ color: '#076297' }} className="font-bold">✓</div>
                            )}
                          </button>
                        );
                      })}
                    </>
                  )}
                  
                  {/* Team View - Show team members only when team is selected */}
                  {viewMode === 'team' && selectedTeam && (
                    <button
                      onClick={() => {
                        if (loggedInUserId) {
                          setSelectedMember(loggedInUserId);
                        } else {
                          const currentUserId = getCurrentUserId();
                          if (currentUserId > 0) {
                            setSelectedMember(currentUserId.toString());
                          } else {
                            setSelectedMember('all');
                          }
                        }
                        setShowMemberModal(false);
                      }}
                      className="w-full p-3 flex items-center gap-3 transition"
                      style={{
                        backgroundColor: (selectedMember === 'all' || selectedMember === loggedInUserId) ? '#f0f8fc' : '#f9fafb',
                        borderRadius: '7px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedMember !== 'all' && selectedMember !== loggedInUserId) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedMember !== 'all' && selectedMember !== loggedInUserId) {
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
                        <div className="text-xs text-gray-500">View your calendar events</div>
                      </div>
                      {(selectedMember === 'all' || selectedMember === loggedInUserId) && (
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