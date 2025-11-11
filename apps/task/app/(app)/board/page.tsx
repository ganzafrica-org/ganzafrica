"use client";

import { useMemo, useState, useEffect } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskCard } from "@/components/task-card";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useSidebar } from "@/components/sidebar-provider";
import { PageLayout } from "@/components/page-layout";
import { Button } from "@/components/button";
import { TaskModal } from "@/components/task-modal";
import { Tabs } from "@/components/tabs";
import { UserAvatar } from "@/components/user-avatar";
import { Task, TeamMember, updateTaskStatusIfOverdue } from "@/lib/types";
import { taskApi, portalDataApi } from "@/lib/api-client";
import { usersApi, User } from "@/lib/api/users";
import { taskTeamsApi } from "@/lib/api/task-teams";
import { FileText, AlertCircle, CheckCircle, Clock, Users, Calendar, X, Filter, CalendarDays, Plus } from "lucide-react";
import { DateFilter } from "@/components/date-filter";
import { isCurrentUserAdminOrManager, isCurrentUserAdminOrManagerAsync, getCurrentUserRole, isCurrentUserAdmin } from "@/lib/auth-utils";

export default function BoardPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState<string>('todo');
  const [creatingTaskPriority, setCreatingTaskPriority] = useState<string>('medium');
  const [activeTab, setActiveTab] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('all'); // 'all' or member id
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'week', 'month', 'custom'
  const [customDateRange, setCustomDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [userHasAccess, setUserHasAccess] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        return 1; // fallback for SSR
      }
      
      const userStr = localStorage.getItem('task_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 1; // fallback to 1 if no id
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return 1; // fallback
  };

  // Check if current user has admin or manager role (both can access everything)
  const isCurrentUserAdminOrManagerRole = () => {
    return isCurrentUserAdminOrManager();
  };

  // Check user access on component mount
  useEffect(() => {
    const checkUserAccess = async () => {
      try {
        const hasAccess = await isCurrentUserAdminOrManagerAsync();
        setUserHasAccess(hasAccess);
      } catch (error) {
        console.error('Error checking user access:', error);
        setUserHasAccess(false);
      }
    };
    
    checkUserAccess();
  }, []);

  // Helper function to check if a task was created by a Manager role user
  const isTaskCreatedByManager = (task: Task): boolean => {
    const creatorRoleName = task.creator_role_name;
    if (!creatorRoleName) return false;
    
    const role = creatorRoleName.toLowerCase().trim();
    // Include manager, admin, and other management roles
    return role === 'manager' || role === 'admin' || role.includes('manager') || role.includes('admin');
  };

  // Load team members from API
  const loadTeamMembers = async () => {
    try {
      console.log('Loading team members from API...');
      
      // Get all users from the API
      const usersResponse = await usersApi.listUsers({ limit: 100 });
      const allUsers = usersResponse.users || [];
      
      console.log('All users from API:', allUsers);
      
      // Get current user info
      const currentUserId = getCurrentUserId();
      const currentUser = allUsers.find((user: User) => user.id === currentUserId);
      
      // Transform users to TeamMember format
      const teamMembers: TeamMember[] = allUsers.map((user: User) => {
        // Generate initials from name
        const initials = user.name 
          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : 'U' + user.id.toString().slice(0, 1);
        
        // Generate color based on user ID for consistency
        const colors = [
          '#8b5cf6', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', 
          '#f97316', '#6366f1', '#ef4444', '#06b6d4', '#84cc16'
        ];
        const color = colors[user.id % colors.length];
        
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          color: color,
          initials: initials,
        };
      });
      
      // Ensure current user is first in the list
      const sortedMembers = teamMembers.sort((a, b) => {
        if (a.id === currentUserId.toString()) return -1;
        if (b.id === currentUserId.toString()) return 1;
        return 0;
      });
      
      console.log('Transformed team members:', sortedMembers);
      setMembers(sortedMembers);
      
    } catch (error) {
      console.error('Error loading team members:', error);
      // Set empty members array if API fails
      setMembers([]);
    }
  };

  const tabs = useMemo(() => {
    const baseTabs = [];
    
    // Check if user is admin or manager
    if (isCurrentUserAdminOrManagerRole()) {
      // If user is admin, only show "Board View" (no tabs needed)
      if (isCurrentUserAdmin()) {
        baseTabs.push({ id: 'board', label: 'Board View' });
      } else {
        // If user is manager, show both tabs
        baseTabs.push({ id: 'board', label: 'General Team' });
        baseTabs.push({ id: 'management', label: 'Manager Tasks' });
      }
    }
    
    return baseTabs;
  }, []);

  // Load all tasks from database
  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all tasks directly without permission checks
      const response = await taskApi.getAllTasks();
      console.log('API Response:', response);
      const allTasks = response.tasks || [];
      console.log('All Tasks:', allTasks);
      
      // Load team/project mapping and teams to derive team info for cards
      let projectMappings: Array<{ id: number; team_id: number }> = [];
      let allTeams: Array<{ id: number; name: string; color?: string }> = [];
      try {
        const [projectsResp, teamsResp] = await Promise.all([
          taskApi.getTaskTeamProjects(),
          taskTeamsApi.listTeams(),
        ]);
        projectMappings = projectsResp.projects || [];
        allTeams = teamsResp.teams || [];
      } catch (e) {
        console.warn('Failed to load team/project mappings; team badges may be missing on cards');
      }

      // Transform tasks to match our Task interface
      const transformedTasks: Task[] = allTasks.map((task: any) => {
        const baseTask = {
          id: task.id ? task.id.toString() : Math.random().toString(36).slice(2),
          title: task.title || 'Untitled Task',
          description: task.description || '',
          deliverables: task.deliverables || '',
          status: (task.status === 'backlog' ? 'overdue' : task.status) || 'todo',
          priority: task.priority || 'medium',
          dueDate: task.due_date ? new Date(task.due_date).toISOString() : undefined,
          labels: task.labels || [],
          // Normalize assignees to string IDs
          assignees: (task.assignees || [])
            .map((a: any) => (a?.user_id ?? a)?.toString())
            .filter((v: any) => v && v !== ''),
          comments: task.comments || [],
          attachments: task.attachments || [],
          projectId: task.project_id,
          // Derive team info for card badge using project mapping
          ...( (() => {
            const mapping = projectMappings.find((p: any) => p.id === task.project_id);
            if (!mapping) return {};
            const team = allTeams.find((t: any) => t.id === mapping.team_id);
            if (!team) return { teamId: String(mapping.team_id) };
            return {
              teamId: String(team.id),
              team: { id: String(team.id), name: team.name, color: team.color || '#076297', memberIds: [] as string[] },
            };
          })() ),
          // Include creator information for permissions
          created_by: task.created_by,
          creator_role_id: task.creator_role_id,
          creator_role_name: task.creator_role_name,
        };
        
        // Apply client-side overdue check as fallback
        return updateTaskStatusIfOverdue(baseTask);
      });
      
      console.log('Transformed tasks for drag testing:', transformedTasks.slice(0, 2));
      
      console.log(`Total tasks loaded: ${transformedTasks.length}`);

      setTasks(transformedTasks);
    } catch (err: any) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load tasks and team members on component mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadAllTasks(),
        loadTeamMembers()
      ]);
    };
    loadData();
    
    // Set up periodic refresh to check for overdue tasks every 5 minutes
    const interval = setInterval(() => {
      console.log('Periodic refresh: checking for overdue tasks...');
      loadAllTasks();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Set appropriate default tab and ensure proper access control
  useEffect(() => {
    const availableTabs = tabs.map(tab => tab.id);
    
    // If no active tab is set, set the first available tab
    if (!activeTab && availableTabs.length > 0) {
      setActiveTab(availableTabs[0] || '');
    }
    
    // If current active tab is not available, switch to first available tab
    if (activeTab && !availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || '');
    }
  }, [tabs, activeTab]);

  // Filter tasks based on selected member, date, and search query
  const filteredTasks = useMemo(() => {
    let filtered = selectedMember === 'all' 
      ? tasks 
      : tasks.filter(task => (task.assignees || []).some(a => a != null && a.toString() === selectedMember));

    // Apply search filtering
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(task => {
        const titleMatch = task.title.toLowerCase().includes(q);
        const descriptionMatch = task.description?.toLowerCase().includes(q);
        const deliverablesMatch = task.deliverables?.toLowerCase().includes(q);
        // Also search in labels
        const labelsMatch = task.labels?.some(label => label.name.toLowerCase().includes(q));
        return titleMatch || descriptionMatch || deliverablesMatch || labelsMatch;
      });
    }

    // Apply date filtering based on task deadlines
    if (dateFilter === 'week') {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      oneWeekFromNow.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return true; // Include tasks without due dates
        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return taskDueDate >= now && taskDueDate <= oneWeekFromNow;
      });
    } else if (dateFilter === 'month') {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(now.getMonth() + 1);
      oneMonthFromNow.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return true; // Include tasks without due dates
        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return taskDueDate >= now && taskDueDate <= oneMonthFromNow;
      });
    } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const startDate = new Date(customDateRange.start);
      startDate.setHours(0, 0, 0, 0); // Start of day
      const endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      // Validate date range
      if (startDate <= endDate) {
        filtered = filtered.filter(task => {
          if (!task.dueDate) return true; // Include tasks without due dates
          const taskDueDate = new Date(task.dueDate);
          taskDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
          return taskDueDate >= startDate && taskDueDate <= endDate;
        });
      }
    }

    return filtered;
  }, [tasks, selectedMember, dateFilter, customDateRange, searchQuery]);

  // Group tasks by priority for management view - only show tasks created by users with management roles
  const tasksByPriority = useMemo(() => {
    // Filter tasks to only show those created by users with management roles (manager, admin, etc.)
    const managerTasks = filteredTasks.filter(task => {
      const isManagerRole = isTaskCreatedByManager(task);
      
      // Debug logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`Task "${task.title}" - Creator Role: "${task.creator_role_name}" - Is Manager: ${isManagerRole}`);
      }
      
      return isManagerRole;
    });
    
    console.log(`Manager Tasks tab: ${managerTasks.length} management-created tasks out of ${filteredTasks.length} total tasks`);
    
    // Log all unique creator roles for debugging
    const uniqueCreatorRoles = [...new Set(filteredTasks.map(task => task.creator_role_name).filter(Boolean))];
    console.log('All unique creator roles in filtered tasks:', uniqueCreatorRoles);
    
    // Validation: Ensure only management role tasks are included
    const nonManagementTasks = managerTasks.filter(task => !isTaskCreatedByManager(task));
    if (nonManagementTasks.length > 0) {
      console.error('ERROR: Found non-management tasks in Manager Tasks tab:', nonManagementTasks.map(t => ({ title: t.title, role: t.creator_role_name })));
    } else {
      console.log('✅ Validation passed: All tasks in Manager Tasks tab are created by management role users');
    }
    
    const grouped = {
      high: managerTasks.filter(task => task.priority === 'high'),
      medium: managerTasks.filter(task => task.priority === 'medium'),
      low: managerTasks.filter(task => task.priority === 'low')
    };
    return grouped;
  }, [filteredTasks]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5" style={{ color: '#dc2626' }} />;
      case 'medium':
        return <Clock className="w-5 h-5" style={{ color: '#d97706' }} />;
      case 'low':
        return <CheckCircle className="w-5 h-5" style={{ color: '#16a34a' }} />;
      default:
        return <Clock className="w-5 h-5" style={{ color: '#6b7280' }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' };
      case 'medium':
        return { bg: '#fffbeb', border: '#fed7aa', text: '#92400e' };
      case 'low':
        return { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' };
      default:
        return { bg: '#f9fafb', border: '#e5e7eb', text: '#374151' };
    }
  };

   const handlePriorityDrop = async (e: React.DragEvent, priority: 'high' | 'medium' | 'low') => {
     e.preventDefault();
     const id = e.dataTransfer.getData("text/task-id");
     if (!id) return;
     
     // Update locally first for immediate UI feedback
     const updatedTasks = tasks.map(t => (t.id === id ? { ...t, priority } : t));
     setTasks(updatedTasks);
     
     // Then update in database using appropriate endpoint based on manager status
     try {
       const task = tasks.find(t => t.id === id);
       if (task) {
         const taskData = {
           title: task.title,
           description: task.description,
           deliverables: task.deliverables,
           status: task.status,
           priority: priority,
           due_date: task.dueDate ? new Date(task.dueDate) : null,
           labels: task.labels || [],
           attachments: task.attachments || [],
           assignees: task.assignees.map(id => parseInt(id)),
         };
         
         // Use fallback method for task updates
         await taskApi.updateTaskWithFallback(parseInt(id), taskData, isCurrentUserAdminOrManagerRole());
         console.log('Task priority updated successfully:', id, priority);
       }
     } catch (err: any) {
       console.error('Error updating task priority:', err);
       // Revert to original tasks if API update fails
       setTasks(tasks);
       
       // Show user-friendly error message
       const errorMessage = err.message || 'Failed to update task priority. Please try again.';
       setError(errorMessage);
       setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
     }
   };

  const columns = useMemo(
    () => [
      { id: "todo", name: "To Do", color: "", bgColor: "#f0f8fc", textColor: "#076297", borderColor: "#d4e9f5" },
      { id: "inprogress", name: "In Progress", color: "", bgColor: "#fef3c7", textColor: "#92400e", borderColor: "#fcd34d" },
      { id: "review", name: "Review", color: "", bgColor: "#fce7f3", textColor: "#9f1239", borderColor: "#f9a8d4" },
      { id: "done", name: "Completed", color: "", bgColor: "#d1fae5", textColor: "#065f46", borderColor: "#6ee7b7" },
      { id: "overdue", name: "Overdue", color: "", bgColor: "#fef2f2", textColor: "#dc2626", borderColor: "#fecaca" },
    ] as const,
    []
  );

  // Priority columns for Management view
  const priorityColumns = useMemo(
    () => [
      { id: "high", name: "High Priority", color: "", bgColor: "#fef2f2", textColor: "#991b1b", borderColor: "#fecaca" },
      { id: "medium", name: "Medium Priority", color: "", bgColor: "#fffbeb", textColor: "#92400e", borderColor: "#fed7aa" },
      { id: "low", name: "Low Priority", color: "", bgColor: "#f0fdf4", textColor: "#166534", borderColor: "#bbf7d0" },
    ] as const,
    []
  );

  // Show loading while checking user access
  if (userHasAccess === null) {
    return (
      <PageLayout 
        members={members} 
        tasks={tasks} 
        title="Board View"
        headerAction={null}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking access permissions...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Check if user has access to any tabs
  if (tabs.length === 0 || !userHasAccess) {
    return (
      <PageLayout 
        members={members} 
        tasks={tasks} 
        title="Board View"
        headerAction={null}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">
              Board View is only accessible to users with Admin or Manager roles.
            </p>
            <p className="text-sm text-gray-500">
              You can access other pages like "My Tasks" or "Teams" from the sidebar.
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      members={members} 
      tasks={tasks} 
      title={isCurrentUserAdmin() ? "Board View" : (activeTab === 'management' ? "Manager Tasks" : "General Team")}
      onSearchChange={setSearchQuery}
      searchQuery={searchQuery}
      headerAction={
        <div className="flex items-center gap-1 sm:-space-x-2 overflow-x-auto pb-1 sm:pb-0 sm:overflow-visible">
          {/* All Tasks Button */}
          <button
            onClick={() => setSelectedMember('all')}
            style={{ 
              backgroundColor: selectedMember === 'all' ? '#076297' : '#6b7280',
            }}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center text-white text-[10px] sm:text-xs font-semibold ring-2 transition touch-manipulation flex-shrink-0 ${
              selectedMember === 'all' ? 'ring-gray-400 ring-2 sm:ring-4' : 'ring-white'
            }`}
            title="All Members"
          >
            All
          </button>
          {/* Show members - scrollable on mobile */}
          {members.slice(0, 6).map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member.id)}
              style={{ backgroundColor: member.color }}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center text-white text-xs font-semibold ring-2 transition overflow-hidden touch-manipulation flex-shrink-0 ${
                selectedMember === member.id ? 'ring-gray-400 ring-2 sm:ring-4' : 'ring-white'
              }`}
              title={member.name}
            >
              <UserAvatar 
                userId={parseInt(member.id)} 
                size="sm"
                className="w-full h-full"
                fallbackColor={member.color}
              />
            </button>
          ))}
          {/* Show +X button if more than 6 members */}
          {members.length > 6 && (
            <button
              onClick={() => setShowMemberModal(true)}
              style={{ backgroundColor: '#F8B712' }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full grid place-items-center text-white text-[10px] sm:text-xs font-bold ring-2 ring-white transition hover:opacity-90 touch-manipulation flex-shrink-0"
              title="View all team members"
            >
              +{members.length - 6}
            </button>
          )}
        </div>
      }
        >
          {/* Tabs and Date Filter */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4" style={{ borderRadius: '7px' }}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Tabs on the left */}
                {tabs.length > 1 && (
                  <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                {/* Add a task button */}
                <Button
                  onClick={() => setIsCreatingTask(true)}
                  variant="primary"
                  size="md"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Add a task</span>
                </Button>
                
                {/* Date Filter on the right */}
                <div className="w-full sm:w-auto">
                  <DateFilter
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    customDateRange={customDateRange}
                    setCustomDateRange={setCustomDateRange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadAllTasks}
                  className="px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#076297',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#065a87';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#076297';
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : activeTab === 'board' ? (
            <KanbanBoard
              columns={columns as any}
              tasks={filteredTasks}
              members={members}
               onTasksChange={async (updatedTasks) => {
                 console.log('onTasksChange called with:', updatedTasks.length, 'tasks');
                 
                 // Update tasks locally first for immediate UI feedback
                 setTasks(updatedTasks);
                 
                 // Then update in database using unrestricted endpoint
                 try {
                   // Find the task that was moved (compare with previous tasks)
                   const movedTask = updatedTasks.find(task => {
                     const originalTask = tasks.find(t => t.id === task.id);
                     return originalTask && originalTask.status !== task.status;
                   });
                   
                   if (movedTask) {
                     console.log('Found moved task:', movedTask.id, 'from', tasks.find(t => t.id === movedTask.id)?.status, 'to', movedTask.status);
                     const taskData = {
                       title: movedTask.title,
                       description: movedTask.description,
                       deliverables: movedTask.deliverables,
                       status: movedTask.status,
                       priority: movedTask.priority,
                       due_date: movedTask.dueDate ? new Date(movedTask.dueDate) : null,
                       labels: movedTask.labels || [],
                       attachments: movedTask.attachments || [],
                       assignees: movedTask.assignees.map(id => parseInt(id)),
                     };
                     
                     // Use fallback method for task updates
                     await taskApi.updateTaskWithFallback(parseInt(movedTask.id), taskData, isCurrentUserAdminOrManagerRole());
                     console.log('Task status updated successfully:', movedTask.id, movedTask.status);
                   } else {
                     console.log('No moved task found');
                   }
                 } catch (err: any) {
                   console.error('Error updating task status:', err);
                   // Revert to original tasks if API update fails
                   setTasks(tasks);
                   
                   // Show user-friendly error message
                   const errorMessage = err.message || 'Failed to update task status. Please try again.';
                   setError(errorMessage);
                   setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
                 }
               }}
              registerOpenTask={(open) => {
                if (typeof window !== "undefined") {
                  window.addEventListener("taskflow:open", (e: any) => open(e.detail));
                }
              }}
              onCreateTask={(status) => {
                setIsCreatingTask(true);
                // Store the status for when we create the task
                setCreatingTaskStatus(status);
              }}
            />
          ) : (
            /* Management View - Priority-based Kanban Board */
            <div>
              {/* Show message if no management-created tasks */}
              {filteredTasks.filter(isTaskCreatedByManager).length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">No Management Tasks Found</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        This view shows only tasks created by users with management roles (manager, admin, etc.). 
                        Tasks created by regular users will not appear here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-w-[900px]">
                {priorityColumns.map(col => (
                <div 
                  key={col.id} 
                  className="flex flex-col"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handlePriorityDrop(e, col.id as 'high' | 'medium' | 'low')}
                >
                  <div 
                    className="flex items-center justify-between p-2 rounded-xl shadow-sm mb-2"
                    style={{
                      backgroundColor: col.bgColor,
                      color: col.textColor,
                      border: `1px solid ${col.borderColor}`
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {col.id === 'high' && <AlertCircle className="w-4 h-4" />}
                      {col.id === 'medium' && <Clock className="w-4 h-4" />}
                      {col.id === 'low' && <CheckCircle className="w-4 h-4" />}
                      <div className="font-medium">{col.name}</div>
                    </div>
                    <div className="text-xs opacity-70 bg-white/50 rounded-full px-2 py-1">
                      {tasksByPriority[col.id].length}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-white/60 backdrop-blur min-h-[60vh] p-3 space-y-3 flex flex-col">
                    <div className="flex-1 space-y-3">
                      {tasksByPriority[col.id].map(t => (
                        <TaskCard key={t.id} task={t} members={members} onClick={() => setActiveTask(t)} hidePriority={true} />
                      ))}
                    </div>
                    {/* Add new task button */}
                    <button
                      onClick={() => {
                        setIsCreatingTask(true);
                        setCreatingTaskPriority(col.id as 'high' | 'medium' | 'low');
                      }}
                      className="w-full py-1 px-3 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                      style={{ 
                        borderRadius: '7px',
                        backgroundColor: '#f0f8fc',
                        borderColor: '#d4e9f5',
                        color: '#076297'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e6f2ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f8fc';
                      }}
                    >
                      <span className="text-lg">+</span>
                      <span>Add new task</span>
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          )}

          {/* Task Modal for Viewing/Editing Existing Tasks */}
          {activeTask && (
            <TaskModal
              open={!!activeTask}
              task={activeTask}
              members={members}
              mode={isCurrentUserAdminOrManagerRole() ? "management" : "individual"}
              onOpenChange={(open) => {
                if (!open) {
                  setActiveTask(null);
                }
              }}
               onChange={async (updatedTask: Task) => {
                 try {
                   // Update task via API - use appropriate endpoint based on manager status
                   const taskData = {
                     title: updatedTask.title,
                     description: updatedTask.description,
                     deliverables: updatedTask.deliverables,
                     status: updatedTask.status,
                     priority: updatedTask.priority,
                     due_date: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
                     labels: updatedTask.labels || [],
                     attachments: updatedTask.attachments || [],
                     assignees: updatedTask.assignees.map(id => parseInt(id)),
                   };
                   
                   // Use fallback method for task updates
                   const response = await taskApi.updateTaskWithFallback(parseInt(updatedTask.id), taskData, isCurrentUserAdminOrManagerRole());
                   
                   const updatedProjectTask = {
                     ...response.task,
                     assignees: response.task.assignees?.map((a: any) => a.user_id.toString()) || [],
                     projectId: updatedTask.projectId,
                   };
                   
                   setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedProjectTask : t)));
                   setActiveTask(updatedProjectTask);
                   console.log('Task updated successfully:', updatedProjectTask);
                 } catch (err: any) {
                   console.error('Error updating task:', err);
                   // Fallback to local update if API fails
                   setTasks(tasks.map(t => (t.id === updatedTask.id ? updatedTask : t)));
                   setActiveTask(updatedTask);
                   
                   // Show user-friendly error message
                   const errorMessage = err.message || 'Failed to update task. Please try again.';
                   setError(errorMessage);
                   setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
                 }
               }}
               onDelete={async (id) => {
                 try {
                   // Use fallback method for task deletion
                   await taskApi.deleteTaskWithFallback(parseInt(id), isCurrentUserAdminOrManagerRole());
                   setTasks(tasks.filter(t => t.id !== id));
                   setActiveTask(null);
                   console.log('Task deleted successfully:', id);
                 } catch (err: any) {
                   console.error('Error deleting task:', err);
                   // Fallback to local deletion if API fails
                   setTasks(tasks.filter(t => t.id !== id));
                   setActiveTask(null);
                   
                   // Show user-friendly error message
                   const errorMessage = err.message || 'Failed to delete task. Please try again.';
                   setError(errorMessage);
                   setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
                 }
               }}
              columns={columns as any}
              tasks={activeTab === 'board' ? 
                filteredTasks.reduce((acc, task) => {
                  const status = task.status;
                  if (!acc[status]) acc[status] = [];
                  acc[status]?.push(task);
                  return acc;
                }, {} as Record<string, Task[]>) : 
                tasksByPriority
              }
            />
          )}

          {/* Task Modal for Creating New Tasks */}
          <TaskModal
            open={isCreatingTask}
            task={isCreatingTask ? {
              id: '',
              title: '',
              description: '',
              deliverables: '',
              status: activeTab === 'board' ? creatingTaskStatus as any : 'todo' as const,
              priority: activeTab === 'management' ? creatingTaskPriority as any : 'medium' as const,
              dueDate: undefined,
              labels: [],
              assignees: [],
              comments: [],
              attachments: []
            } : null}
            members={members}
            mode="management"
            onOpenChange={(open) => {
              if (!open) {
                setIsCreatingTask(false);
              }
            }}
            onChange={async (updatedTask: Task) => {
               // Get task team projects for task creation (these are the correct project IDs)
               const taskTeamProjectsResponse = await taskApi.getTaskTeamProjects();
               const taskTeamProjects = taskTeamProjectsResponse.projects || [];
               
               if (taskTeamProjects.length === 0) {
                 console.error('No task team projects available for task creation');
                 setIsCreatingTask(false);
                 return;
               }
               
               // Use the selected team's project ID if available, otherwise use the first available
               let projectId = taskTeamProjects[0].id;
               if (updatedTask.teamId) {
                 const selectedTeamProject = taskTeamProjects.find((p: any) => p.team_id === parseInt(updatedTask.teamId!));
                 if (selectedTeamProject) {
                   projectId = selectedTeamProject.id;
                   console.log('Using selected team project ID for task creation:', projectId, 'for team:', updatedTask.teamId);
                 }
               } else {
                 console.log('No team selected, using first available project ID for task creation:', projectId);
               }
               
               try {
                // Get current user's role information
                const currentUserRole = getCurrentUserRole();
                
                // Validate that we have role information
                if (!currentUserRole?.role_name) {
                  console.error('No role information found for current user');
                  setError('Unable to determine user role. Please refresh and try again.');
                  setIsCreatingTask(false);
                  return;
                }
                
                console.log('Creating task with creator role:', currentUserRole.role_name);
                
                 // Create task via API
                 const taskData = {
                   project_id: projectId,
                   title: updatedTask.title,
                   description: updatedTask.description,
                   deliverables: updatedTask.deliverables,
                   status: updatedTask.status,
                   priority: updatedTask.priority,
                   due_date: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
                   labels: updatedTask.labels || [],
                   attachments: updatedTask.attachments || [],
                   assignees: updatedTask.assignees.map(id => parseInt(id)),
                   created_by: getCurrentUserId(),
                   creator_role_id: currentUserRole?.role_id,
                   creator_role_name: currentUserRole?.role_name,
                 };
                
                 const response = await taskApi.createTaskUnrestricted(taskData);
                 console.log('Task creation response:', response);
                 const newTaskId = response.task.id;
                 
                 // Save comments if there are any in the updatedTask
                 if (updatedTask.comments && updatedTask.comments.length > 0) {
                   try {
                     // Save each comment to the backend
                     for (const comment of updatedTask.comments) {
                       if (comment.message) {
                         await taskApi.addTaskComment(newTaskId, comment.message);
                       }
                     }
                     console.log('✅ Comments saved for new task');
                   } catch (commentError) {
                     console.error('Error saving comments for new task:', commentError);
                     // Continue even if comments fail to save - task is created
                   }
                 }
                 
                 // Reload the task to get full details including comments with user info
                 try {
                   const fullTaskResponse = await taskApi.getTaskByIdUnrestricted(newTaskId);
                   
                   // Extract user info from assignees and comments
                   let taskUsers: Map<string, any>;
                   if (typeof window !== 'undefined') {
                     taskUsers = (window as any).taskUsers as Map<string, any> || new Map();
                   } else {
                     taskUsers = new Map();
                   }
                   
                   // Extract user info from assignees
                   if (fullTaskResponse.task.assignees && Array.isArray(fullTaskResponse.task.assignees)) {
                     fullTaskResponse.task.assignees.forEach((a: any) => {
                       if (a.user_id && a.user) {
                         const userId = a.user_id.toString();
                         taskUsers.set(userId, {
                           id: userId,
                           name: a.user.name || 'Unknown User',
                           email: a.user.email || '',
                           avatar_url: a.user.avatar_url || '',
                         });
                       }
                     });
                   }
                   
                   // Extract user info from comments
                   if (fullTaskResponse.task.comments && Array.isArray(fullTaskResponse.task.comments)) {
                     fullTaskResponse.task.comments.forEach((c: any) => {
                       if (c.user_id && c.user) {
                         const userId = c.user_id.toString();
                         taskUsers.set(userId, {
                           id: userId,
                           name: c.user.name || 'Unknown User',
                           email: c.user.email || '',
                           avatar_url: c.user.avatar_url || '',
                         });
                       }
                     });
                   }
                   
                   if (typeof window !== 'undefined') {
                     (window as any).taskUsers = taskUsers;
                   }
                   
                   const newTask = {
                     ...fullTaskResponse.task,
                     assignees: fullTaskResponse.task.assignees?.map((a: any) => a.user_id?.toString() || a.toString()) || [],
                     originalAssignees: fullTaskResponse.task.assignees || [],
                     comments: (fullTaskResponse.task.comments || []).map((c: any) => ({
                       id: (c.id ?? c.comment_id ?? Math.random().toString(36).slice(2)).toString(),
                       userId: (c.user_id ?? c.userId ?? c.user?.id)?.toString(),
                       message: c.content ?? c.message ?? c.text ?? '',
                       text: c.content ?? c.message ?? c.text ?? '',
                       createdAt: c.created_at ?? c.createdAt ?? new Date().toISOString(),
                     })),
                     attachments: fullTaskResponse.task.attachments || [],
                     dueDate: fullTaskResponse.task.due_date ? new Date(fullTaskResponse.task.due_date).toISOString() : undefined,
                     projectId: projectId,
                     teamId: updatedTask.teamId,
                     team: updatedTask.team,
                   };
                   
                   setTasks([newTask, ...tasks]);
                   setIsCreatingTask(false);
                   setActiveTask(null); // Close modal immediately so task appears right away
                   console.log('✅ Task created successfully with comments:', newTask);
                 } catch (reloadError) {
                   console.error('Error reloading task after creation:', reloadError);
                   // Fallback to original response if reload fails
                   const fallbackTask = {
                     ...response.task,
                     assignees: response.task.assignees?.map((a: any) => a.user_id ? a.user_id.toString() : '') || [],
                     comments: updatedTask.comments || [], // Use comments from updatedTask
                     attachments: response.task.attachments || [],
                     dueDate: response.task.due_date ? new Date(response.task.due_date).toISOString() : undefined,
                     projectId: projectId,
                     teamId: updatedTask.teamId,
                     team: updatedTask.team,
                   };
                   
                   setTasks([fallbackTask, ...tasks]);
                   setIsCreatingTask(false);
                   setActiveTask(null); // Close modal immediately so task appears right away
                   console.log('✅ Task created successfully (reload failed):', fallbackTask);
                 }
               } catch (err: any) {
                 console.error('Error creating task:', err);
                 // Fallback to local creation if API fails
                 const fallbackUserRole = getCurrentUserRole();
                 const newTask = {
                   ...updatedTask,
                   id: Math.random().toString(36).slice(2),
                   projectId: projectId, // Use the project ID we fetched
                   teamId: updatedTask.teamId,
                   team: updatedTask.team,
                   creator_role_id: fallbackUserRole?.role_id,
                   creator_role_name: fallbackUserRole?.role_name,
                 };
                 setTasks([newTask, ...tasks]);
                 setIsCreatingTask(false);
                 console.log('Task created locally (API failed):', newTask);
               }
            }}
            onDelete={() => {
              // This shouldn't be called for new tasks, but just in case
              setIsCreatingTask(false);
            }}
          />

          {/* Member Selection Modal */}
          {showMemberModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto" style={{ borderRadius: '7px' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#1f2937' }}>Team Members</h3>
                    <p className="text-sm" style={{ color: '#6b7280' }}>{members.length} members total</p>
                  </div>
                  <button
                    onClick={() => setShowMemberModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {/* All Members Option */}
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
                      <div className="font-medium" style={{ color: '#1f2937' }}>All Members</div>
                      <div className="text-xs" style={{ color: '#6b7280' }}>
                        {members.length} members • View all tasks
                      </div>
                    </div>
                    {selectedMember === 'all' && (
                      <div style={{ color: '#076297' }} className="font-bold">✓</div>
                    )}
                  </button>
                  {/* Individual Members */}
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
                      <UserAvatar 
                        userId={parseInt(member.id)} 
                        size="md"
                        className="w-8 h-8"
                        fallbackColor={member.color}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-medium" style={{ color: '#1f2937' }}>{member.name}</div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>
                          {member.email} • {tasks.filter(t => t.assignees.includes(member.id)).length} tasks assigned
                        </div>
                      </div>
                      {selectedMember === member.id && (
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



