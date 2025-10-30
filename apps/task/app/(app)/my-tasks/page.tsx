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
import { Task, TeamMember, updateTaskStatusIfOverdue } from "@/lib/types";
import { taskApi, portalDataApi } from "@/lib/api-client";
import { taskTeamsApi, TaskTeam } from "@/lib/api/task-teams";
import { usersApi, User as UserType } from "@/lib/api/users";
import { ErrorModal } from "@/components/error-modal";
import { FileText, AlertCircle, CheckCircle, Clock, Users, Calendar, X, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, UserPlus } from "lucide-react";
import { DateFilter } from "@/components/date-filter";
import { useDateFilter } from "@/hooks/use-date-filter";
import { logger } from "@/lib/logger";

export default function BoardPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState<string>('todo');
  const [creatingTaskPriority, setCreatingTaskPriority] = useState<string>('medium');
  const [viewMode, setViewMode] = useState<string>('table'); // 'table' or 'board'
  
  // Debug view mode changes
  useEffect(() => {
    logger.debug('View mode changed to:', viewMode);
  }, [viewMode]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfoVersion, setUserInfoVersion] = useState(0);
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'week', 'month', 'custom'
  const [customDateRange, setCustomDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allTeams, setAllTeams] = useState<TaskTeam[]>([]);
  const [taskTeamProjects, setTaskTeamProjects] = useState<Array<{ id: number; team_id: number; name: string; color?: string }>>([]);
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();
  const [taskMembers, setTaskMembers] = useState<any[]>([]);

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

  // Check if current user has manager role
  const isCurrentUserManager = () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        return false;
      }
      
      const userStr = localStorage.getItem('task_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const roleName = user.role_name || user.roleName;
        const roleId = user.role_id || user.roleId;
        
        // Consider admin, staff, and mentor roles as manager roles
        const isManagerRole = roleName && (
          roleName.toLowerCase().includes('admin') ||
          roleName.toLowerCase().includes('staff') ||
          roleName.toLowerCase().includes('mentor') ||
          roleName.toLowerCase().includes('manager') ||
          (roleId && roleId < 1000) // Assuming manager roles have IDs < 1000
        );
        
        return isManagerRole;
      }
    } catch (error: unknown) {
      logger.error('Error checking user role:', error);
    }
    return false; // Default to non-manager
  };

  // Get current user info from localStorage
  const getCurrentUser = () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        return { id: 1, name: 'Current User' }; // fallback for SSR
      }
      
      const userStr = localStorage.getItem('task_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user;
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return { id: 1, name: 'Current User' }; // fallback
  };
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const viewModes = useMemo(() => [
    { id: 'table', label: 'Table View' },
    { id: 'board', label: 'Board View' }
  ], []);
  
  // Ensure viewMode is always valid
  const handleViewModeChange = (newViewMode: string) => {
    if (newViewMode === 'table' || newViewMode === 'board') {
      console.log('Switching to view mode:', newViewMode);
      setViewMode(newViewMode);
      // Reset pagination when switching views
      setCurrentPage(1);
    } else {
      console.warn('Invalid view mode:', newViewMode);
    }
  };

  // Load all tasks assigned to the user (personal + project tasks)
  const loadAllUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Starting loadAllUserTasks - taskTeamProjects:', taskTeamProjects.length, 'allTeams:', allTeams.length);

      // Load personal tasks from localStorage
      const savedPersonalTasks = localStorage.getItem('personalTasks');
      const personalTasks = savedPersonalTasks ? JSON.parse(savedPersonalTasks) : [];
      
      // Load project tasks assigned to the user from API
      let projectTasks: any[] = [];
      try {
        const projectTasksResponse = await taskApi.getTasksByUser();
        // Transform the backend response to match frontend format
        projectTasks = (projectTasksResponse.tasks || []).map((task: any) => {
          console.log('Raw task data:', task);
          console.log('🔍 Processing project task with project_id:', task.project_id);
          const baseTask = {
            ...task,
            // Transform assignees from backend format to frontend format
            assignees: task.assignees?.map((assignee: any) => assignee.user_id.toString()) || [],
            // Store original assignee data for user information
            originalAssignees: task.assignees || [],
            // Ensure comments and attachments are arrays
            comments: task.comments || [],
            attachments: task.attachments || [],
            // Convert due_date to ISO string if it exists
            dueDate: task.due_date ? new Date(task.due_date).toISOString() : undefined,
        // Add team information from backend data using project mapping
        ...(() => {
          console.log('🔍 Processing task:', task.title);
          console.log('🔍 Task project_id:', task.project_id);
          console.log('🔍 Task team info (if exists):', task.team);
          console.log('🔍 Available taskTeamProjects:', taskTeamProjects.length, taskTeamProjects);
          console.log('🔍 Available teams:', allTeams.length, allTeams.map(t => ({ id: t.id, name: t.name })));
          
          // First, check if task already has team information (from task modal)
          if (task.team) {
            console.log('✅ Using existing task team info:', task.team);
            return {
              teamId: task.team.id,
              team: task.team
            };
          }
          
          // If no team in task, find team by project_id using taskTeamProjects mapping
          if (task.project_id && taskTeamProjects.length > 0) {
            const taskTeamProject = taskTeamProjects.find(p => p.id === task.project_id);
            console.log('🔍 Found taskTeamProject:', taskTeamProject);
            
            if (taskTeamProject && allTeams.length > 0) {
              const team = allTeams.find(t => t.id === taskTeamProject.team_id);
              console.log('🔍 Found team:', team);
              
              if (team) {
                console.log('✅ Using real team from backend mapping:', team.name);
                return {
                  teamId: String(team.id),
                  team: { 
                    id: String(team.id), 
                    name: team.name, 
                    color: team.color || '#076297', 
                    memberIds: [] 
                  }
                };
              }
            }
          }
          
          console.log('❌ No team information available for task - no project mapping found');
          return {};
        })(),
          };
          
          // Apply client-side overdue check as fallback
          return updateTaskStatusIfOverdue(baseTask);
        });
      } catch (apiError) {
        console.warn('Could not load project tasks:', apiError);
        // Continue with just personal tasks if API fails
      }
      
      // Combine personal and project tasks
      const allTasks = [...personalTasks, ...projectTasks];
      
      // Store all unique users from tasks (assignees) to enrich members list
      const taskUsers = new Map<string, any>();
      
      allTasks.forEach((task: any) => {
        // Collect users from assignees
        if (Array.isArray(task.assignees)) {
          task.assignees.forEach((assigneeId: string) => {
            // For personal tasks, we need to get user info from teams API
            // We'll populate this when teams are loaded
            if (!taskUsers.has(assigneeId)) {
              taskUsers.set(assigneeId, {
                id: assigneeId,
                name: `User ${assigneeId}`, // Temporary name
                email: '',
                avatar_url: '',
              });
            }
          });
        }

        // Also collect users from detailed assignee data (for project tasks)
        if (task.originalAssignees && Array.isArray(task.originalAssignees)) {
          task.originalAssignees.forEach((assignee: any) => {
            if (assignee.user) {
              taskUsers.set(assignee.user.id.toString(), {
                id: assignee.user.id.toString(),
                name: assignee.user.name,
                email: assignee.user.email || '',
                avatar_url: assignee.user.avatar_url || '',
              });
            }
          });
        }
      });
      
      // Store task users globally so they can be used by modal
      (window as any).taskUsers = taskUsers;
      
      setTasks(allTasks);

    } catch (err: any) {
      console.error('Error loading user tasks:', err);
      setError('Failed to load tasks');
      
      // Start with empty data if API fails
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load teams and task-team projects first, then tasks
    const loadData = async () => {
      console.log('🔍 Starting data loading sequence...');
      await loadAllTeamsForUserInfo();
      console.log('🔍 Teams loaded, loading projects...');
      await loadTaskTeamProjects();
      console.log('🔍 Projects loaded, loading tasks...');
      await loadAllUserTasks();
      console.log('🔍 All data loaded');
    };
    
    loadData();
    
    // Expose refresh function globally for TaskModal to use
    (window as any).refreshUserInfo = loadAllTeamsForUserInfo;
    
    // Set up periodic refresh to check for overdue tasks every 5 minutes
    const interval = setInterval(() => {
      console.log('Periodic refresh: checking for overdue tasks...');
      loadAllUserTasks();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Load task-team projects mapping
  const loadTaskTeamProjects = async () => {
    try {
      const resp = await taskApi.getTaskTeamProjects();
      setTaskTeamProjects(resp.projects || []);
      console.log('🔍 Loaded task team projects:', resp.projects);
    } catch (error) {
      console.error('Error loading task team projects:', error);
      setTaskTeamProjects([]);
    }
  };

  // Load all teams to populate user information for taskUsers
  const loadAllTeamsForUserInfo = async () => {
    try {
      const teamsResponse = await taskTeamsApi.listTeams();
      const allTeams = teamsResponse.teams || [];
      
      // If no teams from API, use empty array
      const teamsToUse = allTeams.length > 0 ? allTeams : [];
      
      setAllTeams(teamsToUse); // Store teams in state for team information mapping
      console.log('🔍 Loaded teams for user info:', teamsToUse);
      
      // Get existing taskUsers from window
      const taskUsers = (window as any).taskUsers as Map<string, any> || new Map();
      
      // Populate user information from all teams
      for (const team of allTeams) {
        if (team.members) {
          team.members.forEach((member: any) => {
            const userId = member.user_id.toString();
            // Always add/update user information (not just if they exist)
            taskUsers.set(userId, {
              id: userId,
              name: member.name || 'Unknown',
              email: member.user?.email || '',
              avatar_url: member.user?.avatar_url || '',
            });
          });
        }
      }
      
      // Add current user to taskUsers if not already present
      const currentUser = getCurrentUser();
      const currentUserId = currentUser.id.toString();
      if (!taskUsers.has(currentUserId)) {
        taskUsers.set(currentUserId, {
          id: currentUserId,
          name: currentUser.name || 'You',
          email: currentUser.email || '',
          avatar_url: currentUser.avatar_url || '',
        });
      }
      
      // Update the global taskUsers
      (window as any).taskUsers = taskUsers;
      
      // Build task members list from taskUsers
      const membersArray = Array.from(taskUsers.values()).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        color: '#076297',
        initials: user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'
      }));
      setTaskMembers(membersArray);
      
      // Increment version to trigger re-renders
      setUserInfoVersion(prev => prev + 1);
      
    } catch (error) {
      console.error('Error loading teams for user info:', error);
    }
  };




  // Apply date filtering to tasks
  const filteredTasks = useDateFilter(tasks, dateFilter, customDateRange);

  // Load all users for member selection
  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersResponse = await usersApi.listUsers({ limit: 100, is_active: true });
      setAllUsers(usersResponse.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Add members to available assignees
  const handleAddMembersToTasks = async () => {
    if (selectedMembersToAdd.length === 0) return;

    try {
      // Add selected users to taskMembers
      const newMembers = selectedMembersToAdd.map(userId => {
        const user = allUsers.find(u => u.id === userId);
        return {
          id: userId.toString(),
          name: user?.name || 'Unknown',
          email: user?.email || '',
          avatar_url: user?.avatar_url || '',
          color: '#076297',
          initials: user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'
        };
      });

      setTaskMembers(prev => [...prev, ...newMembers]);
      setSelectedMembersToAdd([]);
      setIsAddingMember(false);
    } catch (error: any) {
      console.error('Error adding members:', error);
    }
  };

  // Remove member from available assignees
  const handleRemoveMember = (memberId: string, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove "${memberName}" from available assignees?`,
      onConfirm: () => {
        setTaskMembers(prev => prev.filter(m => m.id !== memberId));
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  // Pagination logic
  const totalTasks = filteredTasks.length;
  const totalPages = Math.ceil(totalTasks / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

  // Reset to first page when view mode changes
  useMemo(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Group tasks by priority for management view
  const tasksByPriority = useMemo(() => {
    const grouped = {
      high: filteredTasks.filter(task => task.priority === 'high'),
      medium: filteredTasks.filter(task => task.priority === 'medium'),
      low: filteredTasks.filter(task => task.priority === 'low')
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

  const handlePriorityDrop = (e: React.DragEvent, priority: 'high' | 'medium' | 'low') => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;
    setTasks(
      tasks.map(t => (t.id === id ? { ...t, priority } : t))
    );
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

  return (
    <PageLayout 
      members={taskMembers} 
      tasks={tasks} 
      title="My Assigned Tasks"
      headerAction={null}
    >
      {/* View Mode Selector with Date Filter and Add Task Button */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4" style={{ borderRadius: '7px' }}>
            <div className="flex items-center justify-between">
              <Tabs
                tabs={viewModes}
                activeTab={viewMode}
                onTabChange={handleViewModeChange}
          />
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreatingTask(true)}
              variant="primary"
              size="md"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add a task</span>
            </Button>
            <DateFilter
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
            />
          </div>
        </div>
      </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center" style={{ borderRadius: '7px' }}>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading tasks...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4" style={{ borderRadius: '7px' }}>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* View Content */}
          {!loading && !error && (
            viewMode === 'table' ? (
              /* Table View */
              <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ borderRadius: '7px' }}>
              {/* Table Header */}
          <div className="border-b border-gray-200">
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-medium text-gray-700">Task</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Priority</th>
                      <th className="text-left p-4 font-medium text-gray-700">Due Date</th>
                      <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTasks.map((task) => (
                      <tr 
                        key={task.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setActiveTask(task)}
                      >
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{task.title}</div>
                        </td>
                        <td className="p-4">
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: columns.find(c => c.id === task.status)?.bgColor || '#f3f4f6',
                              color: columns.find(c => c.id === task.status)?.textColor || '#374151',
                              border: `1px solid ${columns.find(c => c.id === task.status)?.borderColor || '#e5e7eb'}`
                            }}
                          >
                            {columns.find(c => c.id === task.status)?.name || task.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(task.priority)}
                            <span className="capitalize text-sm font-medium" style={{ color: getPriorityColor(task.priority).text }}>
                              {task.priority}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">No due date</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTask(task);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit task"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskToDelete(task);
                                setShowDeleteModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {totalTasks === 0 && (
                  <div className="text-center py-12">
                <FileText className="w-12h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-500 mb-4">
                      Get started by creating your first task.
                    </p>
                    <button
                      onClick={() => setIsCreatingTask(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg transition-colors"
                      style={{ 
                        backgroundColor: '#076297',
                        borderRadius: '7px'
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Create Task
                    </button>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalTasks > 0 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderRadius: '4px' }}
                    >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      style={{ borderRadius: '4px' }}
                    >
                      First
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      style={{ borderRadius: '4px' }}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 text-sm border rounded transition-colors ${
                              currentPage === pageNum
                                ? 'text-white border-transparent'
                                : 'border-gray-300 hover:bg-gray-100'
                            }`}
                            style={{
                              backgroundColor: currentPage === pageNum ? '#076297' : 'transparent',
                              borderRadius: '4px'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      style={{ borderRadius: '4px' }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      style={{ borderRadius: '4px' }}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
              </div>
            ) : (
              /* Board View */
              <KanbanBoard
                columns={columns as any}
                tasks={tasks}
                members={taskMembers}
                onTasksChange={async (updatedTasks, movedTaskInfo) => {
                  console.log('onTasksChange called with:', updatedTasks.length, 'tasks');
                  
                  if (movedTaskInfo) {
                    console.log('Task moved:', movedTaskInfo.id, 'from', movedTaskInfo.oldStatus, 'to', movedTaskInfo.newStatus);
                    
                    // Find the moved task in the updated tasks
                    const movedTask = updatedTasks.find(t => t.id === movedTaskInfo.id);
                    if (!movedTask) {
                      console.error('Moved task not found in updated tasks');
                      return;
                    }
                    
                    try {
                      // Update task status in database
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
                      
                      console.log('🔄 Attempting to update task:', movedTask.id, 'with data:', taskData);
                      console.log('🔄 Is current user manager?', isCurrentUserManager());
                      
                      if (isCurrentUserManager()) {
                        console.log('🔄 Using unrestricted endpoint for manager');
                        await taskApi.updateTaskUnrestricted(parseInt(movedTask.id), taskData);
                      } else {
                        console.log('🔄 Using regular endpoint for user');
                        await taskApi.updateTask(parseInt(movedTask.id), taskData);
                      }
                      
                      console.log('✅ Task status updated in database');
                    } catch (error: unknown) {
                      const errorMessage = error instanceof Error 
                        ? error.message 
                        : typeof error === 'object' && error !== null && 'response' in error
                        ? (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || 'Unknown error'
                        : String(error);
                      logger.error('Error updating task status:', error);
                      setError(`Failed to update task status: ${errorMessage}`);
                      return; // Don't update local state if API call failed
                    }
                  } else {
                    console.log('No task moved detected, updating local state only');
                  }
                  
                  // Update local state
                  setTasks(updatedTasks);
                }}
                registerOpenTask={(open) => {
                  if (typeof window !== "undefined") {
                    window.addEventListener("taskflow:open", (e: any) => open(e.detail));
                  }
                }}
              />
            )
          )}

          {/* New Task Modal */}
          <TaskModal
            open={!!activeTask || isCreatingTask}
            task={activeTask || (isCreatingTask ? {
              id: '',
              title: '',
              description: '',
              deliverables: '',
              status: viewMode === 'board' ? creatingTaskStatus as any : 'todo' as const,
              priority: viewMode === 'table' ? 'medium' as const : creatingTaskPriority as any,
              dueDate: undefined,
              labels: [],
              assignees: [],
              teamId: undefined,
              comments: [],
              attachments: []
            } : null)}
            members={taskMembers}
            mode={isCurrentUserManager() ? "management" : "individual"}
            userInfoVersion={userInfoVersion}
            onOpenChange={async (open) => {
              if (!open) {
                setActiveTask(null);
                setIsCreatingTask(false);
                // Refresh tasks to get updated team information
                console.log('🔍 Modal closed, refreshing tasks to get updated team information');
                await loadAllUserTasks();
              }
            }}
            onChange={async (updatedTask: Task) => {
              try {
                if (updatedTask.id) {
                  // Update existing task
                  const existingTask = tasks.find(t => t.id === updatedTask.id);
                  if (existingTask && (existingTask as any).isPersonal) {
                    // Update personal task locally
                    const updatedTasks = tasks.map(t => (t.id === updatedTask.id ? updatedTask : t));
                    setTasks(updatedTasks);
                    setActiveTask(null); // Close modal after successful update
                    
                    // Save to localStorage
                    const personalTasks = updatedTasks.filter(task => (task as any).isPersonal);
                    localStorage.setItem('personalTasks', JSON.stringify(personalTasks));
                  } else {
                    // Update project task via API
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
                    
                    const response = isCurrentUserManager() 
                      ? await taskApi.updateTaskUnrestricted(parseInt(updatedTask.id), taskData)
                      : await taskApi.updateTask(parseInt(updatedTask.id), taskData);
                    const updatedProjectTask = {
                      ...response.task,
                      assignees: response.task.assignees?.map((a: any) => a.user_id.toString()) || [],
                      originalAssignees: response.task.assignees || [],
                      comments: response.task.comments || [],
                      attachments: response.task.attachments || [],
                      dueDate: response.task.due_date ? new Date(response.task.due_date).toISOString() : undefined,
                      // Preserve team information from the updated task
                      teamId: updatedTask.teamId,
                      team: updatedTask.team,
                    };
                    
                    const updatedTasks = tasks.map(t => (t.id === updatedTask.id ? updatedProjectTask : t));
                    setTasks(updatedTasks);
                    setActiveTask(null); // Close modal after successful update
                  }
                } else {
                  // Create new task - Always save to database
                  // Get the first available project that the user has access to
                  let projectId = updatedTask.projectId;
                  if (!projectId) {
                    try {
                      const projectsResponse = await taskApi.getTaskTeamProjects();
                      const projects = projectsResponse.projects || [];
                      if (projects.length > 0) {
                        projectId = projects[0].id;
                      } else {
                        // If no projects available, create a personal task as fallback
                        const personalTask = {
                          id: Math.random().toString(36).slice(2),
                          title: updatedTask.title,
                          description: updatedTask.description,
                          deliverables: updatedTask.deliverables,
                          status: updatedTask.status,
                          priority: updatedTask.priority,
                          dueDate: updatedTask.dueDate,
                          labels: updatedTask.labels || [],
                          assignees: updatedTask.assignees.length > 0 
                            ? updatedTask.assignees
                            : [getCurrentUserId().toString()],
                          teamId: updatedTask.teamId,
                          team: updatedTask.team,
                          comments: [],
                          attachments: updatedTask.attachments || [],
                          isPersonal: true
                        };
                        
                        const updatedTasks = [personalTask, ...tasks];
                        setTasks(updatedTasks);
                        setIsCreatingTask(false);
                        
                        // Save to localStorage as fallback
                        const personalTasks = updatedTasks.filter(task => (task as any).isPersonal);
                        localStorage.setItem('personalTasks', JSON.stringify(personalTasks));
                        console.log('✅ Personal task created (fallback):', personalTask.title);
                        return;
                      }
                    } catch (error) {
                      console.error('Error getting projects:', error);
                      setError('Failed to get available projects. Please try again.');
                      return;
                    }
                  }
                  
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
                    assignees: updatedTask.assignees.length > 0 
                      ? updatedTask.assignees.map(id => parseInt(id))
                      : [getCurrentUserId()],
                    created_by: getCurrentUserId(),
                  };
                  
                  const response = await taskApi.createTask(taskData);
                  const newTask = {
                    ...response.task,
                    assignees: response.task.assignees?.map((a: any) => a.user_id.toString()) || [],
                    originalAssignees: response.task.assignees || [],
                    comments: response.task.comments || [],
                    attachments: response.task.attachments || [],
                    dueDate: response.task.due_date ? new Date(response.task.due_date).toISOString() : undefined,
                  };
                  
                  const updatedTasks = [newTask, ...tasks];
                  setTasks(updatedTasks);
                  setIsCreatingTask(false);
                  console.log('✅ Task saved to database:', newTask.title);
                }
                
                // Refresh user information
                await loadAllTeamsForUserInfo();
              } catch (err: any) {
                console.error('Error saving task:', err);
                setError('Failed to save task');
              }
            }}
            onDelete={async (id) => {
              try {
                const existingTask = tasks.find(t => t.id === id);
                if (existingTask && (existingTask as any).isPersonal) {
                  // Delete personal task locally
                  const updatedTasks = tasks.filter(t => t.id !== id);
                  setTasks(updatedTasks);
                  setActiveTask(null);
                  
                  // Save to localStorage
                  const personalTasks = updatedTasks.filter(task => (task as any).isPersonal);
                  localStorage.setItem('personalTasks', JSON.stringify(personalTasks));
                } else {
                  // Delete project task via API
                  if (isCurrentUserManager()) {
                    await taskApi.deleteTaskUnrestricted(parseInt(id));
                  } else {
                    await taskApi.deleteTask(parseInt(id));
                  }
                  const updatedTasks = tasks.filter(t => t.id !== id);
                  setTasks(updatedTasks);
                  setActiveTask(null);
                }
              } catch (err: any) {
                console.error('Error deleting task:', err);
                setError('Failed to delete task');
              }
            }}
            columns={columns as any}
            tasks={viewMode === 'board' ? 
              filteredTasks.reduce((acc, task) => {
                const status = task.status;
                if (!acc[status]) acc[status] = [];
                acc[status]?.push(task);
                return acc;
              }, {} as Record<string, Task[]>) : 
              tasksByPriority
            }
          />

          {/* Delete Confirmation Modal */}
          {showDeleteModal && taskToDelete && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]" style={{ borderRadius: '7px' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Delete Task</h3>
                    <p className="text-sm" style={{ color: '#6b7280' }}>This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 mb-2">Are you sure you want to delete this task?</p>
                  <div className="bg-gray-50 rounded-lg p-3" style={{ borderRadius: '7px' }}>
                    <div className="font-medium text-gray-900">{taskToDelete.title}</div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setTaskToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    style={{ borderRadius: '7px' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // Check if it's a personal task
                        const existingTask = tasks.find(t => t.id === taskToDelete.id);
                        if (existingTask && (existingTask as any).isPersonal) {
                          // Delete personal task locally
                          const updatedTasks = tasks.filter(t => t.id !== taskToDelete.id);
                          setTasks(updatedTasks);
                          
                          // Save to localStorage
                          const personalTasks = updatedTasks.filter(task => (task as any).isPersonal);
                          localStorage.setItem('personalTasks', JSON.stringify(personalTasks));
                        } else {
                          // Delete project task via API
                          if (isCurrentUserManager()) {
                            await taskApi.deleteTaskUnrestricted(parseInt(taskToDelete.id));
                          } else {
                            await taskApi.deleteTask(parseInt(taskToDelete.id));
                          }
                          setTasks(tasks.filter(t => t.id !== taskToDelete.id));
                        }
                        setShowDeleteModal(false);
                        setTaskToDelete(null);
                      } catch (err: any) {
                        console.error('Error deleting task:', err);
                        setError('Failed to delete task');
                        setShowDeleteModal(false);
                        setTaskToDelete(null);
                      }
                    }}
                    className="px-4 py-2 text-white font-medium rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: '#dc2626',
                      borderRadius: '7px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#b91c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                    }}
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
      />

      {/* Confirmation Modal */}
      <ErrorModal
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        confirmText="Confirm"
        showCancel={true}
      />
    </PageLayout>
  );
}