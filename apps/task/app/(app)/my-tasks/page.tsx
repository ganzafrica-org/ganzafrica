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
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  X,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserPlus,
} from "lucide-react";
import { DateFilter } from "@/components/date-filter";
import { useDateFilter } from "@/hooks/use-date-filter";
import { useToast, ToastContainer } from "@/components/toast";

export default function BoardPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState<string>("todo");
  const [creatingTaskPriority, setCreatingTaskPriority] = useState<string>("medium");
  const [viewMode, setViewMode] = useState<string>("table");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfoVersion, setUserInfoVersion] = useState(0);
  const [dateFilter, setDateFilter] = useState<string>("all"); // 'all', 'week', 'month', 'custom'
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allTeams, setAllTeams] = useState<TaskTeam[]>([]);
  const [taskTeamProjects, setTaskTeamProjects] = useState<
    Array<{ id: number; team_id: number; name: string; color?: string }>
  >([]);
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();
  const [taskMembers, setTaskMembers] = useState<any[]>([]);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === "undefined") {
        return 1; // fallback for SSR
      }

      const userStr = localStorage.getItem("task_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || 1; // fallback to 1 if no id
      }
    } catch (error) {
      // Error getting current user
    }
    return 1; // fallback
  };

  // Check if current user has manager role
  const isCurrentUserManager = () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === "undefined") {
        return false;
      }

      const userStr = localStorage.getItem("task_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const roleName = user.role_name || user.roleName;
        const roleId = user.role_id || user.roleId;

        // Consider admin, staff, and mentor roles as manager roles
        const isManagerRole =
          roleName &&
          (roleName.toLowerCase().includes("admin") ||
            roleName.toLowerCase().includes("staff") ||
            roleName.toLowerCase().includes("mentor") ||
            roleName.toLowerCase().includes("manager") ||
            (roleId && roleId < 1000)); // Assuming manager roles have IDs < 1000

        return isManagerRole;
      }
    } catch (error: unknown) {
      // Error checking user role
    }
    return false; // Default to non-manager
  };

  // Get current user info from localStorage
  const getCurrentUser = () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === "undefined") {
        return { id: 1, name: "Current User" }; // fallback for SSR
      }

      const userStr = localStorage.getItem("task_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user;
      }
    } catch (error) {
      // Error getting current user
    }
    return { id: 1, name: "Current User" }; // fallback
  };
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const viewModes = useMemo(
    () => [
      { id: "table", label: "Table View" },
      { id: "board", label: "Board View" },
    ],
    [],
  );

  // Ensure viewMode is always valid
  const handleViewModeChange = (newViewMode: string) => {
    if (newViewMode === "table" || newViewMode === "board") {
      setViewMode(newViewMode);
      // Reset pagination when switching views
      setCurrentPage(1);
    }
  };

  // Load all tasks assigned to the user (personal + project tasks)
  const loadAllUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load personal tasks from localStorage
      const savedPersonalTasks = localStorage.getItem("personalTasks");
      const personalTasks = savedPersonalTasks ? JSON.parse(savedPersonalTasks) : [];

      // Load project tasks assigned to the user from API
      let projectTasks: any[] = [];
      try {
        const currentUserId = getCurrentUserId();
        const projectTasksResponse = await taskApi.getTasksByUser();

        // Transform the backend response to match frontend format
        projectTasks = (projectTasksResponse.tasks || []).map((task: any) => {
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
              // ALWAYS get team from database via project_id mapping - don't trust stored task.team
              // This ensures we always have the correct team from the database, not stale/cached data
              if (task.project_id && taskTeamProjects.length > 0) {
                const taskTeamProject = taskTeamProjects.find((p) => p.id === task.project_id);

                if (taskTeamProject && allTeams.length > 0) {
                  const team = allTeams.find((t) => t.id === taskTeamProject.team_id);

                  if (team) {
                    return {
                      teamId: String(team.id),
                      team: {
                        id: String(team.id),
                        name: team.name,
                        color: team.color || "#076297",
                        memberIds: [],
                      },
                    };
                  }
                }
              }

              return {};
            })(),
          };

          // Apply client-side overdue check as fallback
          return updateTaskStatusIfOverdue(baseTask);
        });
      } catch (apiError) {
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
                email: "",
                avatar_url: "",
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
                email: assignee.user.email || "",
                avatar_url: assignee.user.avatar_url || "",
              });
            }
          });
        }
      });

      // Store task users globally so they can be used by modal
      (window as any).taskUsers = taskUsers;

      setTasks(allTasks);
    } catch (err: any) {
      setError("Failed to load tasks");

      // Start with empty data if API fails
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load teams and task-team projects first, then tasks
    const loadData = async () => {
      await loadAllTeamsForUserInfo();
      await loadTaskTeamProjects();
      await loadAllUserTasks();
    };

    loadData();

    // Expose refresh function globally for TaskModal to use
    (window as any).refreshUserInfo = loadAllTeamsForUserInfo;

    // Set up periodic refresh to check for overdue tasks every 5 minutes
    const interval = setInterval(
      () => {
        loadAllUserTasks();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Load task-team projects mapping
  const loadTaskTeamProjects = async () => {
    try {
      const resp = await taskApi.getTaskTeamProjects();
      setTaskTeamProjects(resp.projects || []);
    } catch (error) {
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

      // Get existing taskUsers from window (preserve any existing data)
      let taskUsers: Map<string, any>;
      if (typeof window !== "undefined") {
        taskUsers = (window as any).taskUsers as Map<string, any>;
        if (!taskUsers || !(taskUsers instanceof Map)) {
          taskUsers = new Map();
        }
      } else {
        taskUsers = new Map();
      }

      // Populate user information from all teams
      for (const team of allTeams) {
        if (team.members) {
          team.members.forEach((member: any) => {
            const userId = member.user_id.toString();
            // Always add/update user information (not just if they exist)
            // This ensures we have user names from teams even if API doesn't return them
            taskUsers.set(userId, {
              id: userId,
              name: member.name || "Unknown",
              email: member.user?.email || member.email || "",
              avatar_url: member.user?.avatar_url || member.avatar_url || "",
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
          name: currentUser.name || "You",
          email: currentUser.email || "",
          avatar_url: currentUser.avatar_url || "",
        });
      }

      // Update the global taskUsers (preserving any data added from task API responses)
      if (typeof window !== "undefined") {
        (window as any).taskUsers = taskUsers;
      }

      // Build task members list from taskUsers
      const membersArray = Array.from(taskUsers.values()).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        color: "#076297",
        initials: user.name
          ? user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : "NA",
      }));
      setTaskMembers(membersArray);

      // Increment version to trigger re-renders
      setUserInfoVersion((prev) => prev + 1);
    } catch (error) {
      // Error loading teams for user info
    }
  };

  // Apply date filtering to tasks
  const dateFilteredTasks = useDateFilter(tasks, dateFilter, customDateRange);

  // Apply search filtering to tasks
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return dateFilteredTasks;
    }

    const q = searchQuery.trim().toLowerCase();
    return dateFilteredTasks.filter((task) => {
      const titleMatch = task.title.toLowerCase().includes(q);
      const descriptionMatch = task.description?.toLowerCase().includes(q);
      const deliverablesMatch = task.deliverables?.toLowerCase().includes(q);
      // Also search in labels
      const labelsMatch = task.labels?.some((label) => label.name.toLowerCase().includes(q));
      return titleMatch || descriptionMatch || deliverablesMatch || labelsMatch;
    });
  }, [dateFilteredTasks, searchQuery]);

  // Load all users for member selection
  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersResponse = await usersApi.listUsers({
        limit: 100,
        is_active: true,
        exclude_alumni: false,
      });
      setAllUsers(usersResponse.users || []);
    } catch (error: any) {
      // Error loading users
    } finally {
      setLoadingUsers(false);
    }
  };

  // Add members to available assignees
  const handleAddMembersToTasks = async () => {
    if (selectedMembersToAdd.length === 0) return;

    try {
      // Add selected users to taskMembers
      const newMembers = selectedMembersToAdd.map((userId) => {
        const user = allUsers.find((u) => u.id === userId);
        return {
          id: userId.toString(),
          name: user?.name || "Unknown",
          email: user?.email || "",
          avatar_url: user?.avatar_url || "",
          color: "#076297",
          initials: user?.name
            ? user.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "NA",
        };
      });

      setTaskMembers((prev) => [...prev, ...newMembers]);
      setSelectedMembersToAdd([]);
      setIsAddingMember(false);
    } catch (error: any) {
      // Error adding members
    }
  };

  // Remove member from available assignees
  const handleRemoveMember = (memberId: string, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Member",
      message: `Are you sure you want to remove "${memberName}" from available assignees?`,
      onConfirm: () => {
        setTaskMembers((prev) => prev.filter((m) => m.id !== memberId));
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
      high: filteredTasks.filter((task) => task.priority === "high"),
      medium: filteredTasks.filter((task) => task.priority === "medium"),
      low: filteredTasks.filter((task) => task.priority === "low"),
    };
    return grouped;
  }, [filteredTasks]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-5 h-5" style={{ color: "#dc2626" }} />;
      case "medium":
        return <Clock className="w-5 h-5" style={{ color: "#d97706" }} />;
      case "low":
        return <CheckCircle className="w-5 h-5" style={{ color: "#16a34a" }} />;
      default:
        return <Clock className="w-5 h-5" style={{ color: "#6b7280" }} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" };
      case "medium":
        return { bg: "#fffbeb", border: "#fed7aa", text: "#92400e" };
      case "low":
        return { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534" };
      default:
        return { bg: "#f9fafb", border: "#e5e7eb", text: "#374151" };
    }
  };

  const handlePriorityDrop = (e: React.DragEvent, priority: "high" | "medium" | "low") => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;
    setTasks(tasks.map((t) => (t.id === id ? { ...t, priority } : t)));
  };

  const columns = useMemo(
    () =>
      [
        {
          id: "todo",
          name: "To Do",
          color: "",
          bgColor: "#f0f8fc",
          textColor: "#076297",
          borderColor: "#d4e9f5",
        },
        {
          id: "inprogress",
          name: "In Progress",
          color: "",
          bgColor: "#fef3c7",
          textColor: "#92400e",
          borderColor: "#fcd34d",
        },
        {
          id: "review",
          name: "Review",
          color: "",
          bgColor: "#fce7f3",
          textColor: "#9f1239",
          borderColor: "#f9a8d4",
        },
        {
          id: "done",
          name: "Completed",
          color: "",
          bgColor: "#d1fae5",
          textColor: "#065f46",
          borderColor: "#6ee7b7",
        },
        {
          id: "overdue",
          name: "Overdue",
          color: "",
          bgColor: "#fef2f2",
          textColor: "#dc2626",
          borderColor: "#fecaca",
        },
      ] as const,
    [],
  );

  // Priority columns for Management view
  const priorityColumns = useMemo(
    () =>
      [
        {
          id: "high",
          name: "High Priority",
          color: "",
          bgColor: "#fef2f2",
          textColor: "#991b1b",
          borderColor: "#fecaca",
        },
        {
          id: "medium",
          name: "Medium Priority",
          color: "",
          bgColor: "#fffbeb",
          textColor: "#92400e",
          borderColor: "#fed7aa",
        },
        {
          id: "low",
          name: "Low Priority",
          color: "",
          bgColor: "#f0fdf4",
          textColor: "#166534",
          borderColor: "#bbf7d0",
        },
      ] as const,
    [],
  );

  return (
    <PageLayout
      members={taskMembers}
      tasks={tasks}
      title="My Assigned Tasks"
      headerAction={null}
      onSearchChange={setSearchQuery}
      searchQuery={searchQuery}
    >
      {/* View Mode Selector with Date Filter and Add Task Button */}
      <div
        className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4"
        style={{ borderRadius: "7px" }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <Tabs tabs={viewModes} activeTab={viewMode} onTabChange={handleViewModeChange} />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setIsCreatingTask(true)}
              variant="primary"
              size="md"
              className="flex items-center justify-center gap-2 w-full sm:w-auto touch-manipulation"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm sm:text-base">Add a task</span>
            </Button>
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

      {/* Loading State */}
      {loading && (
        <div
          className="bg-white rounded-xl shadow-sm p-8 text-center"
          style={{ borderRadius: "7px" }}
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div
          className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
          style={{ borderRadius: "7px" }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* View Content */}
      {!loading &&
        !error &&
        (viewMode === "table" ? (
          /* Table View */
          <div
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            style={{ borderRadius: "7px" }}
          >
            {/* Table Header */}
            <div className="border-b border-gray-200"></div>

            {/* Table */}
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full align-middle sm:px-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Task
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">
                        Status
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                        Priority
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">
                        Due Date
                      </th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedTasks.map((task) => (
                      <tr
                        key={task.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setActiveTask(task)}
                      >
                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap">
                          <div className="font-medium text-sm sm:text-base text-gray-900">
                            {task.title}
                          </div>
                          <div className="sm:hidden mt-1 flex flex-wrap gap-2">
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor:
                                  columns.find((c) => c.id === task.status)?.bgColor || "#f3f4f6",
                                color:
                                  columns.find((c) => c.id === task.status)?.textColor || "#374151",
                                border: `1px solid ${columns.find((c) => c.id === task.status)?.borderColor || "#e5e7eb"}`,
                              }}
                            >
                              {columns.find((c) => c.id === task.status)?.name || task.status}
                            </span>
                            {task.dueDate && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                          <span
                            className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor:
                                columns.find((c) => c.id === task.status)?.bgColor || "#f3f4f6",
                              color:
                                columns.find((c) => c.id === task.status)?.textColor || "#374151",
                              border: `1px solid ${columns.find((c) => c.id === task.status)?.borderColor || "#e5e7eb"}`,
                            }}
                          >
                            {columns.find((c) => c.id === task.status)?.name || task.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            {getPriorityIcon(task.priority)}
                            <span
                              className="capitalize text-xs sm:text-sm font-medium"
                              style={{ color: getPriorityColor(task.priority).text }}
                            >
                              {task.priority}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                          {task.dueDate ? (
                            <div className="flex items-center gap-1 text-xs sm:text-sm">
                              <Calendar className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400" />
                              <span className="text-gray-600">
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs sm:text-sm">No due date</span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTask(task);
                              }}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 transition-colors touch-manipulation"
                              title="Edit task"
                            >
                              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskToDelete(task);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors touch-manipulation"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalTasks === 0 && (
                <div className="text-center py-8 sm:py-12 px-4">
                  <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    No tasks found
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">
                    Get started by creating your first task.
                  </p>
                  <button
                    onClick={() => setIsCreatingTask(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm sm:text-base text-white font-medium rounded-lg transition-colors touch-manipulation"
                    style={{
                      backgroundColor: "#076297",
                      borderRadius: "7px",
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                    style={{ borderRadius: "4px" }}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, totalTasks)} of {totalTasks}
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors touch-manipulation hidden sm:block"
                    style={{ borderRadius: "4px" }}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors touch-manipulation"
                    style={{ borderRadius: "4px" }}
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
                          className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm border rounded transition-colors touch-manipulation ${
                            currentPage === pageNum
                              ? "text-white border-transparent"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                          style={{
                            backgroundColor: currentPage === pageNum ? "#076297" : "transparent",
                            borderRadius: "4px",
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
                    className="p-1.5 sm:p-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors touch-manipulation"
                    style={{ borderRadius: "4px" }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors touch-manipulation hidden sm:block"
                    style={{ borderRadius: "4px" }}
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
            isManager={isCurrentUserManager()}
            onTasksChange={async (updatedTasks, movedTaskInfo) => {
              if (movedTaskInfo) {
                // Find the moved task in the updated tasks - handle both string and number IDs
                const movedTask = updatedTasks.find((t) => {
                  const taskId = String(t.id);
                  const searchId = String(movedTaskInfo.id);
                  return taskId === searchId;
                });

                if (!movedTask) {
                  showError(
                    "Task Not Found",
                    "Could not find the task to update. Please refresh the page and try again.",
                  );
                  return;
                }

                // Find the original task to get project_id if it's missing from movedTask
                const originalTask = tasks.find((t) => {
                  const taskId = String(t.id);
                  const searchId = String(movedTaskInfo.id);
                  return taskId === searchId;
                });

                // Check if task is overdue and user is not a manager
                if (originalTask && originalTask.status === "overdue" && !isCurrentUserManager()) {
                  showError(
                    "Permission Denied",
                    "Only managers can update tasks that are in Overdue status. Please contact a manager to update this task.",
                  );
                  // Revert the local state change
                  loadAllUserTasks().catch(() => {});
                  return;
                }

                try {
                  // Update task status in database
                  // Include project_id to maintain team association
                  const taskData: any = {
                    title: movedTask.title,
                    description: movedTask.description,
                    deliverables: movedTask.deliverables,
                    status: movedTask.status,
                    priority: movedTask.priority,
                    labels: movedTask.labels || [],
                    attachments: movedTask.attachments || [],
                    assignees: movedTask.assignees.map((id) => parseInt(id)),
                  };

                  // Only include due_date if it exists and is valid
                  if (movedTask.dueDate) {
                    const dueDate = new Date(movedTask.dueDate);
                    // Only set due_date if it's not in the past (backend validation)
                    const now = new Date();
                    now.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
                    if (dueDate >= now) {
                      taskData.due_date = dueDate;
                    }
                  } else {
                    taskData.due_date = null;
                  }

                  // Include project_id if available (from movedTask or originalTask)
                  const projectId = movedTask.projectId || (originalTask as any)?.projectId;
                  if (projectId) {
                    taskData.project_id = projectId;
                  }

                  if (isCurrentUserManager()) {
                    await taskApi.updateTaskUnrestricted(parseInt(movedTask.id), taskData);
                  } else {
                    await taskApi.updateTask(parseInt(movedTask.id), taskData);
                  }
                } catch (error: unknown) {
                  let errorMessage = "Failed to update task status";
                  let errorTitle = "Update Failed";

                  if (error instanceof Error) {
                    errorMessage = error.message;
                  } else if (typeof error === "object" && error !== null && "response" in error) {
                    const axiosError = error as {
                      response?: { data?: { message?: string }; status?: number };
                      message?: string;
                    };
                    const status = axiosError.response?.status;
                    const message =
                      axiosError.response?.data?.message || axiosError.message || "Unknown error";

                    if (status === 400) {
                      errorTitle = "Invalid Request";
                      errorMessage = message.includes("past due date")
                        ? "Cannot update task with a past due date. Please select today or a future date."
                        : message ||
                          "The request was invalid. Please check the task details and try again.";
                    } else if (status === 403) {
                      errorTitle = "Permission Denied";
                      if (message?.includes("due date")) {
                        errorMessage =
                          "You cannot update the date of your task. Only managers can do that.";
                      } else if (message?.includes("title")) {
                        errorMessage =
                          "You cannot update the title of this task. Only managers and the task creator can do that.";
                      } else {
                        errorMessage = "You do not have permission to update this task.";
                      }
                    } else if (status === 404) {
                      errorTitle = "Task Not Found";
                      errorMessage = "The task could not be found. It may have been deleted.";
                    } else {
                      errorMessage = message || "An error occurred while updating the task.";
                    }
                  }

                  showError(errorTitle, errorMessage);

                  // Revert the local state change since the API call failed
                  // Reload tasks to get the correct state from the server
                  loadAllUserTasks().catch(() => {});
                  return; // Don't update local state if API call failed
                }
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
        ))}

      {/* New Task Modal */}
      <TaskModal
        open={!!activeTask || isCreatingTask}
        task={
          activeTask ||
          (isCreatingTask
            ? {
                id: "",
                title: "",
                description: "",
                deliverables: "",
                status: viewMode === "board" ? (creatingTaskStatus as any) : ("todo" as const),
                priority:
                  viewMode === "table" ? ("medium" as const) : (creatingTaskPriority as any),
                dueDate: undefined,
                labels: [],
                assignees: [],
                teamId: undefined,
                comments: [],
                attachments: [],
              }
            : null)
        }
        members={taskMembers}
        mode={isCurrentUserManager() ? "management" : "individual"}
        userInfoVersion={userInfoVersion}
        onOpenChange={async (open) => {
          if (!open) {
            setActiveTask(null);
            setIsCreatingTask(false);
            // Don't reload tasks here - tasks are already updated immediately after creation/update
            // Only refresh user info in the background if needed
            loadAllTeamsForUserInfo().catch(() => {});
          }
        }}
        onChange={async (updatedTask: Task) => {
          try {
            if (updatedTask.id) {
              // Update existing task
              const existingTask = tasks.find((t) => t.id === updatedTask.id);

              // Check if task is overdue and user is not a manager
              if (existingTask && existingTask.status === "overdue" && !isCurrentUserManager()) {
                showError(
                  "Permission Denied",
                  "Only managers can update tasks that are in Overdue status. Please contact a manager to update this task.",
                );
                return;
              }

              if (existingTask && (existingTask as any).isPersonal) {
                // Update personal task locally
                const updatedTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
                setTasks(updatedTasks);
                setActiveTask(null); // Close modal after successful update

                // Save to localStorage
                const personalTasks = updatedTasks.filter((task) => (task as any).isPersonal);
                localStorage.setItem("personalTasks", JSON.stringify(personalTasks));
              } else {
                // Update project task via API
                // Preserve project_id from updatedTask to maintain team association
                const taskData = {
                  title: updatedTask.title,
                  description: updatedTask.description,
                  deliverables: updatedTask.deliverables,
                  status: updatedTask.status,
                  priority: updatedTask.priority,
                  due_date: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
                  labels: updatedTask.labels || [],
                  attachments: updatedTask.attachments || [],
                  assignees: updatedTask.assignees.map((id) => parseInt(id)),
                  project_id: updatedTask.projectId, // Preserve project_id to maintain team association
                };

                const response = isCurrentUserManager()
                  ? await taskApi.updateTaskUnrestricted(parseInt(updatedTask.id), taskData)
                  : await taskApi.updateTask(parseInt(updatedTask.id), taskData);
                // Get team information - prioritize updatedTask.team (preserves manager's selection)
                // For managers: use the selected team from updatedTask
                // For regular users: get from project mapping
                let teamInfo = updatedTask.team;
                const isManager = isCurrentUserManager();

                if (!teamInfo) {
                  // If no team in updatedTask, try to get from project mapping
                  if (response.task.project_id) {
                    const mapped = taskTeamProjects.find((p) => p.id === response.task.project_id);
                    if (mapped) {
                      const team = allTeams.find((t) => t.id === mapped.team_id);
                      if (team) {
                        teamInfo = {
                          id: String(team.id),
                          name: team.name,
                          color: team.color || "#076297",
                          memberIds: [],
                        };
                      }
                    }
                  }
                }

                // For managers: always preserve the selected team from updatedTask
                // For regular users: use team from project mapping
                const finalTeamInfo =
                  isManager && updatedTask.team ? updatedTask.team : teamInfo || updatedTask.team;
                const finalTeamId =
                  isManager && updatedTask.teamId
                    ? updatedTask.teamId
                    : finalTeamInfo
                      ? finalTeamInfo.id
                      : undefined;

                const updatedProjectTask = {
                  ...response.task,
                  assignees: response.task.assignees?.map((a: any) => a.user_id.toString()) || [],
                  originalAssignees: response.task.assignees || [],
                  comments: response.task.comments || [],
                  attachments: response.task.attachments || [],
                  dueDate: response.task.due_date
                    ? new Date(response.task.due_date).toISOString()
                    : undefined,
                  // Preserve team information - for managers, use selected team; for others, use from project mapping
                  teamId: finalTeamId,
                  team: finalTeamInfo,
                };

                const updatedTasks = tasks.map((t) =>
                  t.id === updatedTask.id ? updatedProjectTask : t,
                );
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

                  // For managers: allow selecting any project, not restricted by team
                  // For regular users: require team-project matching
                  const isManager = isCurrentUserManager();

                  if (isManager) {
                    // Managers can use any project - use projectId from task if available
                    if (updatedTask.projectId) {
                      projectId = updatedTask.projectId;
                    } else if (projects.length > 0) {
                      // If no project selected, use first available
                      projectId = projects[0].id;
                    }
                  } else {
                    // Regular users: require team-project matching
                    if (updatedTask.teamId && projects.length > 0) {
                      const teamIdNum = parseInt(updatedTask.teamId);
                      const teamProject = projects.find((p: any) => p.team_id === teamIdNum);
                      if (teamProject) {
                        projectId = teamProject.id;
                      } else {
                        // Team selected but no project for that team
                        setError(
                          "The selected team does not have a project. Please select a different team or create a project for this team.",
                        );
                        return;
                      }
                    } else if (projects.length > 0) {
                      // No team selected, use first available project
                      projectId = projects[0].id;
                    }
                  }

                  if (!projectId) {
                    // No projects available - show error instead of creating personal task
                    showError(
                      "No Project Available",
                      "No projects are available. Please create a project first or select a team with an existing project.",
                    );
                    return;
                  }
                } catch (error) {
                  // If error getting projects, show error instead of creating personal task
                  showError(
                    "Failed to Load Projects",
                    "Could not load available projects. Please refresh the page and try again.",
                  );
                  return;
                }
              }

              // Validate that we have a project_id before creating
              // Backend requires project_id (even though schema allows null, migration 18 made it nullable but we still need it)
              if (!projectId) {
                showError(
                  "Project Required",
                  "Please select a team and project before creating a task. Tasks must be associated with a project to be saved.",
                );
                setIsCreatingTask(false);
                return;
              }

              // Validate due_date is not in the past
              let dueDate = null;
              if (updatedTask.dueDate) {
                const dueDateObj = new Date(updatedTask.dueDate);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                if (dueDateObj >= now) {
                  dueDate = dueDateObj;
                } else {
                  showError(
                    "Invalid Due Date",
                    "Cannot create task with a past due date. Please select today or a future date.",
                  );
                  setIsCreatingTask(false);
                  return;
                }
              }

              // Ensure current user is assigned if no assignees are selected
              // This ensures tasks created by the user will appear in "My Assigned Tasks"
              const currentUserId = getCurrentUserId();
              let assigneesList =
                updatedTask.assignees.length > 0
                  ? updatedTask.assignees.map((id) => parseInt(id))
                  : [];

              // If no assignees selected, default to current user
              // This way the task will appear in "My Assigned Tasks" for the creator
              if (assigneesList.length === 0) {
                assigneesList = [currentUserId];
              }

              const taskData = {
                project_id: projectId,
                title: updatedTask.title,
                description: updatedTask.description || "",
                deliverables: updatedTask.deliverables || "",
                status: updatedTask.status || "todo",
                priority: updatedTask.priority || "medium",
                due_date: dueDate,
                labels: updatedTask.labels || [],
                attachments: updatedTask.attachments || [],
                assignees: assigneesList,
                created_by: currentUserId,
              };

              let response;
              try {
                // Use unrestricted endpoint for managers, regular for others
                if (isCurrentUserManager()) {
                  response = await taskApi.createTaskUnrestricted(taskData);
                } else {
                  response = await taskApi.createTask(taskData);
                }
              } catch (createError: any) {
                const errorMessage =
                  createError?.response?.data?.message ||
                  createError?.message ||
                  "Failed to create task";
                showError("Task Creation Failed", errorMessage);
                setIsCreatingTask(false);
                return; // Don't continue if creation failed
              }
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
                } catch (commentError) {
                  // Continue even if comments fail to save - task is created
                }
              }

              // Reload the task to get full details including comments with user info
              try {
                const fullTaskResponse = isCurrentUserManager()
                  ? await taskApi.getTaskByIdUnrestricted(newTaskId)
                  : await taskApi.getTaskById(newTaskId);

                // Extract user info from assignees and comments
                let taskUsers: Map<string, any>;
                if (typeof window !== "undefined") {
                  taskUsers = ((window as any).taskUsers as Map<string, any>) || new Map();
                } else {
                  taskUsers = new Map();
                }

                // Extract user info from assignees
                if (
                  fullTaskResponse.task.assignees &&
                  Array.isArray(fullTaskResponse.task.assignees)
                ) {
                  fullTaskResponse.task.assignees.forEach((a: any) => {
                    if (a.user_id && a.user) {
                      const userId = a.user_id.toString();
                      taskUsers.set(userId, {
                        id: userId,
                        name: a.user.name || "Unknown User",
                        email: a.user.email || "",
                        avatar_url: a.user.avatar_url || "",
                      });
                    }
                  });
                }

                // Extract user info from comments
                if (
                  fullTaskResponse.task.comments &&
                  Array.isArray(fullTaskResponse.task.comments)
                ) {
                  fullTaskResponse.task.comments.forEach((c: any) => {
                    if (c.user_id && c.user) {
                      const userId = c.user_id.toString();
                      taskUsers.set(userId, {
                        id: userId,
                        name: c.user.name || "Unknown User",
                        email: c.user.email || "",
                        avatar_url: c.user.avatar_url || "",
                      });
                    }
                  });
                }

                if (typeof window !== "undefined") {
                  (window as any).taskUsers = taskUsers;
                }

                // Get team information - prioritize updatedTask.team (preserves manager's selection)
                // For managers: use the selected team from updatedTask
                // For regular users: get from project mapping
                let teamInfo = updatedTask.team;
                const isManager = isCurrentUserManager();

                if (!teamInfo) {
                  // If no team in updatedTask, try to get from project mapping
                  if (fullTaskResponse.task.project_id) {
                    const mapped = taskTeamProjects.find(
                      (p) => p.id === fullTaskResponse.task.project_id,
                    );
                    if (mapped) {
                      const team = allTeams.find((t) => t.id === mapped.team_id);
                      if (team) {
                        teamInfo = {
                          id: String(team.id),
                          name: team.name,
                          color: team.color || "#076297",
                          memberIds: [],
                        };
                      }
                    }
                  }
                }

                // For managers: always preserve the selected team from updatedTask
                // For regular users: use team from project mapping
                const finalTeamInfo =
                  isManager && updatedTask.team ? updatedTask.team : teamInfo || updatedTask.team;
                const finalTeamId =
                  isManager && updatedTask.teamId
                    ? updatedTask.teamId
                    : finalTeamInfo
                      ? finalTeamInfo.id
                      : undefined;

                const newTask = {
                  ...fullTaskResponse.task,
                  assignees:
                    fullTaskResponse.task.assignees?.map(
                      (a: any) => a.user_id?.toString() || a.toString(),
                    ) || [],
                  originalAssignees: fullTaskResponse.task.assignees || [],
                  comments: (fullTaskResponse.task.comments || []).map((c: any) => ({
                    id: (c.id ?? c.comment_id ?? Math.random().toString(36).slice(2)).toString(),
                    userId: (c.user_id ?? c.userId ?? c.user?.id)?.toString(),
                    message: c.content ?? c.message ?? c.text ?? "",
                    text: c.content ?? c.message ?? c.text ?? "",
                    createdAt: c.created_at ?? c.createdAt ?? new Date().toISOString(),
                  })),
                  attachments: fullTaskResponse.task.attachments || [],
                  dueDate: fullTaskResponse.task.due_date
                    ? new Date(fullTaskResponse.task.due_date).toISOString()
                    : undefined,
                  // Preserve team information - for managers, use selected team; for others, use from project mapping
                  teamId: finalTeamId,
                  team: finalTeamInfo,
                };

                // Add the new task to the tasks list
                const updatedTasks = [newTask, ...tasks];
                setTasks(updatedTasks);
                setIsCreatingTask(false);
                setActiveTask(null); // Close modal immediately so task appears right away

                // Show success message
                showSuccess(
                  "Task Created",
                  `Task "${newTask.title}" has been created and saved to the database successfully.`,
                );

                // Wait a brief moment to ensure database transaction is committed
                // Then reload tasks from database to ensure we have the latest data
                // This ensures the task is properly saved and will appear on refresh
                setTimeout(async () => {
                  try {
                    await loadAllUserTasks();
                  } catch (err) {
                    showError(
                      "Reload Failed",
                      "Task was created but could not reload. Please refresh the page to see your new task.",
                    );
                  }
                }, 500); // 500ms delay to ensure database commit

                // Refresh user information in the background (non-blocking)
                loadAllTeamsForUserInfo().catch(() => {});
              } catch (reloadError) {
                // Fallback to original response if reload fails
                const fallbackTask = {
                  ...response.task,
                  assignees:
                    response.task.assignees?.map(
                      (a: any) => a.user_id?.toString() || a.toString(),
                    ) || [],
                  originalAssignees: response.task.assignees || [],
                  comments: updatedTask.comments || [], // Use comments from updatedTask
                  attachments: response.task.attachments || [],
                  dueDate: response.task.due_date
                    ? new Date(response.task.due_date).toISOString()
                    : undefined,
                };

                const updatedTasks = [fallbackTask, ...tasks];
                setTasks(updatedTasks);
                setIsCreatingTask(false);
                setActiveTask(null); // Close modal immediately so task appears right away

                // Refresh user information in the background (non-blocking)
                loadAllTeamsForUserInfo().catch(() => {});
              }
            }
          } catch (err: any) {
            const errorMessage =
              err?.response?.data?.message || err?.message || "Failed to save task";
            showError("Task Save Failed", errorMessage);
            setIsCreatingTask(false);
          }
        }}
        onDelete={async (id) => {
          try {
            const existingTask = tasks.find((t) => t.id === id);
            if (existingTask && (existingTask as any).isPersonal) {
              // Delete personal task locally
              const updatedTasks = tasks.filter((t) => t.id !== id);
              setTasks(updatedTasks);
              setActiveTask(null);

              // Save to localStorage
              const personalTasks = updatedTasks.filter((task) => (task as any).isPersonal);
              localStorage.setItem("personalTasks", JSON.stringify(personalTasks));
            } else {
              // Delete project task via API
              if (isCurrentUserManager()) {
                await taskApi.deleteTaskUnrestricted(parseInt(id));
              } else {
                await taskApi.deleteTask(parseInt(id));
              }
              const updatedTasks = tasks.filter((t) => t.id !== id);
              setTasks(updatedTasks);
              setActiveTask(null);
            }
          } catch (err: any) {
            setError("Failed to delete task");
          }
        }}
        columns={columns as any}
        tasks={
          viewMode === "board"
            ? filteredTasks.reduce(
                (acc, task) => {
                  const status = task.status;
                  if (!acc[status]) acc[status] = [];
                  acc[status]?.push(task);
                  return acc;
                },
                {} as Record<string, Task[]>,
              )
            : tasksByPriority
        }
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && taskToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-[90vw]"
            style={{ borderRadius: "7px" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: "#1f2937" }}>
                  Delete Task
                </h3>
                <p className="text-sm" style={{ color: "#6b7280" }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-2">Are you sure you want to delete this task?</p>
              <div className="bg-gray-50 rounded-lg p-3" style={{ borderRadius: "7px" }}>
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
                style={{ borderRadius: "7px" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    // Check if it's a personal task
                    const existingTask = tasks.find((t) => t.id === taskToDelete.id);
                    if (existingTask && (existingTask as any).isPersonal) {
                      // Delete personal task locally
                      const updatedTasks = tasks.filter((t) => t.id !== taskToDelete.id);
                      setTasks(updatedTasks);

                      // Save to localStorage
                      const personalTasks = updatedTasks.filter((task) => (task as any).isPersonal);
                      localStorage.setItem("personalTasks", JSON.stringify(personalTasks));
                    } else {
                      // Delete project task via API
                      if (isCurrentUserManager()) {
                        await taskApi.deleteTaskUnrestricted(parseInt(taskToDelete.id));
                      } else {
                        await taskApi.deleteTask(parseInt(taskToDelete.id));
                      }
                      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
                    }
                    setShowDeleteModal(false);
                    setTaskToDelete(null);
                  } catch (err: any) {
                    setError("Failed to delete task");
                    setShowDeleteModal(false);
                    setTaskToDelete(null);
                  }
                }}
                className="px-4 py-2 text-white font-medium rounded-lg transition-colors"
                style={{
                  backgroundColor: "#dc2626",
                  borderRadius: "7px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
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

      {/* Toast Container for notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </PageLayout>
  );
}
