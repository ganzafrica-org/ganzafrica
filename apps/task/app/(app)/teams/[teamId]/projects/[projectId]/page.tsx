"use client";

import { useState, useEffect, use } from "react";
import { getCurrentUserRole } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Tabs } from "@/components/tabs";
import { Button } from "@/components/button";
import { Task as TaskType } from "@/lib/types";
import { taskTeamsApi, TaskTeam, TaskProject } from "@/lib/api/task-teams";
import { usersApi, User as UserType } from "@/lib/api/users";
import { taskApi } from "@/lib/api-client";
import { ErrorModal } from "@/components/error-modal";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Users,
  Loader2,
  X,
  UserPlus,
  Plus,
} from "lucide-react";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskModal } from "@/components/task-modal";
import { DateFilter } from "@/components/date-filter";
import { useDateFilter } from "@/hooks/use-date-filter";
import { TruncatedText } from "@/components/truncated-text";
import { WorkloadAnalyticsModal } from "@/components/workload-analytics-modal";
import { UserAvatar } from "@/components/user-avatar";
import { isCurrentUserAdminOrManager } from "@/lib/auth-utils";
import { useToast, ToastContainer } from "@/components/toast";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ teamId: string; projectId: string }>;
}): React.JSX.Element {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState("board");
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingTaskInProgress, setIsCreatingTaskInProgress] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState<string>("todo");
  const [dateFilter, setDateFilter] = useState<string>("all"); // 'all', 'week', 'month', 'custom'
  const [showWorkloadModal, setShowWorkloadModal] = useState(false);
  const [selectedMemberForAnalytics, setSelectedMemberForAnalytics] = useState<any>(null);
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  const [team, setTeam] = useState<TaskTeam | null>(null);
  const [project, setProject] = useState<TaskProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isAddingExternalMember, setIsAddingExternalMember] = useState(false);
  const [selectedMembersToAdd, setSelectedMembersToAdd] = useState<number[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
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

  // Get current user ID from the cookie-session cache
  const getCurrentUserId = () => {
    const user = getCurrentUserRole();
    return user?.id != null ? Number(user.id) : 1;
  };

  // Check if current user has manager role
  const isCurrentUserManager = () => {
    const user = getCurrentUserRole();
    const roleName = user?.role_name || user?.roleName;
    const roleId = user?.role_id || user?.roleId;
    return !!(
      roleName &&
      (roleName.toLowerCase().includes("admin") ||
        roleName.toLowerCase().includes("staff") ||
        roleName.toLowerCase().includes("mentor") ||
        roleName.toLowerCase().includes("manager") ||
        (roleId && roleId < 1000))
    );
  };

  // Check if current user is assigned to the team
  const isCurrentUserAssignedToTeam = () => {
    const currentUserId = getCurrentUserId();

    // Admin/Manager users can always create tasks
    if (isCurrentUserAdminOrManager()) {
      return true;
    }

    // Check if current user is a member of the team
    if (team && team.members && team.members.length > 0) {
      return team.members.some((member) => member.user_id === currentUserId);
    }

    return false;
  };

  useEffect(() => {
    loadProjectData();
    loadTasks();
  }, [resolvedParams.teamId, resolvedParams.projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load team details
      const teamResponse = await taskTeamsApi.getTeamById(parseInt(resolvedParams.teamId));
      setTeam(teamResponse.team);

      // Load project details
      const projectResponse = await taskTeamsApi.getProjectById(parseInt(resolvedParams.projectId));
      setProject(projectResponse.project);
    } catch (error: any) {
      console.error("Error loading project data:", error);
      setError(error.response?.data?.message || "Failed to load project data");
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await taskApi.getTasksByProject(parseInt(resolvedParams.projectId));

      // Store all unique users from tasks (assignees and commenters) to enrich members list
      const taskUsers = new Map<string, any>();

      response.tasks.forEach((backendTask: any) => {
        // Collect users from assignees
        if (Array.isArray(backendTask.assignees)) {
          backendTask.assignees.forEach((a: any) => {
            if (a.user && a.user_id) {
              taskUsers.set(a.user_id.toString(), {
                id: a.user_id.toString(),
                name: a.user.name || "Unknown",
                email: a.user.email || "",
                avatar_url: a.user.avatar_url,
              });
            }
          });
        }

        // Collect users from comments
        if (Array.isArray(backendTask.comments)) {
          backendTask.comments.forEach((c: any) => {
            if (c.user && c.user_id) {
              taskUsers.set(c.user_id.toString(), {
                id: c.user_id.toString(),
                name: c.user.name || "Unknown",
                email: c.user.email || "",
                avatar_url: c.user.avatar_url,
              });
            }
          });
        }
      });

      const convertedTasks: TaskType[] = response.tasks.map((backendTask: any) => ({
        id: backendTask.id.toString(),
        title: backendTask.title,
        description: backendTask.description || "",
        deliverables: backendTask.deliverables || "",
        status: (backendTask.status === "backlog" ? "overdue" : backendTask.status) as any,
        priority: backendTask.priority as any,
        dueDate: backendTask.due_date,
        labels: backendTask.labels || [],
        assignees: Array.isArray(backendTask.assignees)
          ? typeof backendTask.assignees[0] === "number"
            ? backendTask.assignees.map(String)
            : backendTask.assignees.map((a: any) => a.user_id.toString())
          : [],
        comments:
          backendTask.comments?.map((c: any) => ({
            id: c.id.toString(),
            userId: c.user_id.toString(),
            message: c.content,
            createdAt: c.created_at,
          })) || [],
        attachments: (backendTask.attachments || []).map((a: any) => ({
          id: a.id,
          filename: a.filename,
          url: a.url,
          sizeKB: 0,
          uploadedAt: new Date().toISOString(),
        })),
        created_by: backendTask.created_by,
        creator_role_id: backendTask.creator_role_id,
        creator_role_name: backendTask.creator_role_name,
      }));

      // Merge with existing tasks to preserve any optimistic updates
      setTasks((prevTasks) => {
        // Create a map of existing tasks by ID for quick lookup (normalize IDs to strings)
        const existingTasksMap = new Map<string, TaskType>();

        // Add existing tasks to map (normalize IDs to strings)
        prevTasks.forEach((t) => {
          const normalizedId = String(t.id);
          if (!existingTasksMap.has(normalizedId)) {
            existingTasksMap.set(normalizedId, t);
          }
        });

        // Update or add tasks from the API response (normalize IDs to strings)
        convertedTasks.forEach((task) => {
          const normalizedId = String(task.id);
          // Always use the latest version from API to ensure consistency
          existingTasksMap.set(normalizedId, task);
        });

        // Return all tasks, deduplicated by ID, preserving the order (newest first if possible)
        return Array.from(existingTasksMap.values()).sort((a, b) => {
          // Sort by creation date if available, otherwise maintain order
          if (a.dueDate && b.dueDate) {
            return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
          }
          return 0;
        });
      });

      // Store task users globally so they can be used by modal
      (window as any).taskUsers = taskUsers;
    } catch (error: any) {
      console.error("Error loading tasks:", error);
      if (error.response?.status !== 403) {
        setErrorModal({
          isOpen: true,
          title: "Error Loading Tasks",
          message: error.response?.data?.message || "Failed to load tasks.",
        });
      }
    } finally {
      setLoadingTasks(false);
    }
  };

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
      console.error("Error loading users:", error);
      setErrorModal({
        isOpen: true,
        title: "Error Loading Users",
        message: error.response?.data?.message || "Failed to load users.",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMembersToProject = async () => {
    if (selectedMembersToAdd.length === 0) return;

    try {
      for (const userId of selectedMembersToAdd) {
        await taskTeamsApi.addProjectMember(parseInt(resolvedParams.projectId), userId, "member");
      }

      setSelectedMembersToAdd([]);
      setIsAddingMember(false);
      setIsAddingExternalMember(false);
      loadProjectData();

      setErrorModal({
        isOpen: true,
        title: "Success",
        message: `Successfully added ${selectedMembersToAdd.length} member(s) to the project.`,
      });
    } catch (error: any) {
      console.error("Error adding project members:", error);
      setErrorModal({
        isOpen: true,
        title: "Error Adding Members",
        message:
          error.response?.data?.message || "Failed to add members to project. Please try again.",
      });
    }
  };

  const handleRemoveProjectMember = async (userId: number, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Remove Member",
      message: `Are you sure you want to remove "${memberName}" from this project?`,
      onConfirm: async () => {
        try {
          await taskTeamsApi.removeProjectMember(parseInt(resolvedParams.projectId), userId);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          loadProjectData();

          setErrorModal({
            isOpen: true,
            title: "Success",
            message: "Member removed from project successfully.",
          });
        } catch (error: any) {
          console.error("Error removing project member:", error);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setErrorModal({
            isOpen: true,
            title: "Error Removing Member",
            message: error.response?.data?.message || "Failed to remove member from project.",
          });
        }
      },
    });
  };

  const handleCreateTask = async (task: TaskType) => {
    // Prevent duplicate task creation
    if (isCreatingTaskInProgress) {
      return;
    }

    try {
      setIsCreatingTaskInProgress(true);

      // Check if user is assigned to the team
      if (!isCurrentUserAssignedToTeam()) {
        setErrorModal({
          isOpen: true,
          title: "Access Denied",
          message: "You are not assigned to this team. Only team members can create tasks.",
        });
        return;
      }

      const user = getCurrentUserRole();

      if (!user || !user.id) {
        setErrorModal({
          isOpen: true,
          title: "Authentication Error",
          message: "User not found. Please log in again.",
        });
        return;
      }

      // Create task WITHOUT attachments first (attachments need task ID to upload)
      const response = await taskApi.createTask({
        project_id: parseInt(resolvedParams.projectId),
        title: task.title,
        description: task.description,
        deliverables: task.deliverables,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        labels: task.labels,
        attachments: [], // Don't send attachments - they'll be uploaded separately
        assignees: task.assignees.map((id) => parseInt(id)),
        created_by: parseInt(String(user.id)),
      });

      // Note: Attachments should be uploaded AFTER task creation using the Upload button
      // The file upload in task modal only works for existing tasks

      // Transform the response task to match frontend format
      const newTask: TaskType = {
        ...response.task,
        id: response.task.id.toString(), // Ensure ID is always a string
        assignees:
          response.task.assignees?.map((a: any) => a.user_id?.toString() || a.toString()) || [],
        comments: response.task.comments || [],
        attachments: response.task.attachments || [],
        dueDate: response.task.due_date
          ? new Date(response.task.due_date).toISOString()
          : undefined,
      };

      // Add task to the list immediately (optimistic update)
      setTasks((prevTasks) => {
        // Check if task already exists by ID (handle both string and number comparisons)
        const existingIndex = prevTasks.findIndex((t) => {
          const taskId = String(t.id);
          const newTaskId = String(newTask.id);
          return taskId === newTaskId;
        });
        if (existingIndex >= 0) {
          // Task already exists, update it instead of adding duplicate
          const updated = [...prevTasks];
          updated[existingIndex] = newTask;
          return updated;
        }
        // Task doesn't exist, add it at the beginning
        return [newTask, ...prevTasks];
      });
      setIsCreatingTask(false);

      // Show message if user tried to add attachments to new task
      if (task.attachments.length > 0) {
        setErrorModal({
          isOpen: true,
          title: "Task Created",
          message: `Task created successfully! Please note: Attachments can only be uploaded to existing tasks. Click on the task card and use the Upload button to add files.`,
        });
      }

      // Reload tasks in the background to ensure data consistency and get full details (non-blocking)
      // This will merge any updates but won't remove the task we just added
      setTimeout(() => {
        loadTasks().catch(() => {
          // Error reloading tasks - non-critical
        });
      }, 500); // Small delay to ensure the optimistic update is rendered first
    } catch (error: any) {
      console.error("Error creating task:", error);
      setErrorModal({
        isOpen: true,
        title: "Error Creating Task",
        message: error.response?.data?.message || "Failed to create task. Please try again.",
      });
    } finally {
      setIsCreatingTaskInProgress(false);
    }
  };

  const handleUpdateTask = async (task: TaskType) => {
    try {
      // Check if user is assigned to the team
      if (!isCurrentUserAssignedToTeam()) {
        setErrorModal({
          isOpen: true,
          title: "Access Denied",
          message: "You are not assigned to this team. Only team members can update tasks.",
        });
        return;
      }

      const updateFunction = isCurrentUserManager()
        ? taskApi.updateTaskUnrestricted
        : taskApi.updateTask;

      await updateFunction(parseInt(task.id), {
        title: task.title,
        description: task.description,
        deliverables: task.deliverables,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        labels: task.labels,
        attachments: task.attachments.map((a) => ({
          id: a.id,
          filename: a.filename,
          url: "",
        })),
        assignees: task.assignees.map((id) => parseInt(id)),
      });

      loadTasks(); // Reload tasks
    } catch (error: any) {
      console.error("Error updating task:", error);

      let errorMessage = "Failed to update task. Please try again.";
      let errorTitle = "Error Updating Task";

      if (error.response?.status === 403) {
        const backendMessage = error.response?.data?.message;
        if (backendMessage?.includes("due date")) {
          errorMessage = "You cannot update the date of your task. Only managers can do that.";
          errorTitle = "Permission Denied";
        } else if (backendMessage?.includes("title")) {
          errorMessage =
            "You cannot update the title of this task. Only managers and the task creator can do that.";
          errorTitle = "Permission Denied";
        } else {
          errorMessage = backendMessage || "You do not have permission to update this task.";
          errorTitle = "Permission Denied";
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setErrorModal({
        isOpen: true,
        title: errorTitle,
        message: errorMessage,
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Check if user is assigned to the team
    if (!isCurrentUserAssignedToTeam()) {
      showError(
        "Access Denied",
        "You are not assigned to this team. Only team members can delete tasks.",
      );
      return;
    }

    // Find the task before deletion for optimistic update and error recovery
    const taskToDelete = tasks.find((t) => String(t.id) === String(taskId));

    setConfirmDialog({
      isOpen: true,
      title: "Delete Task",
      message: "Are you sure you want to delete this task? This action cannot be undone.",
      onConfirm: async () => {
        try {
          // Optimistically remove task from state immediately
          setTasks((prevTasks) => prevTasks.filter((t) => String(t.id) !== String(taskId)));
          setConfirmDialog({ ...confirmDialog, isOpen: false });

          let deletionSuccessful = false;

          // Delete task via API
          try {
            if (isCurrentUserManager()) {
              await taskApi.deleteTaskUnrestricted(parseInt(taskId));
            } else {
              await taskApi.deleteTask(parseInt(taskId));
            }
            deletionSuccessful = true;
          } catch (deleteError: any) {
            // Check if error is 404 (task not found) - this might mean task was already deleted
            // or doesn't exist, but since we optimistically removed it, treat as success
            if (deleteError.response?.status === 404) {
              const errorMsg = deleteError.response?.data?.message || deleteError.message || "";
              // If it's a "not found" error, the task is already gone, so treat as success
              if (
                errorMsg.toLowerCase().includes("not found") ||
                errorMsg.toLowerCase().includes("task not found")
              ) {
                deletionSuccessful = true;
              } else {
                throw deleteError; // Re-throw if it's a different 404 error
              }
            } else {
              throw deleteError; // Re-throw other errors
            }
          }

          if (deletionSuccessful) {
            // Show success toast
            showSuccess(
              "Task Deleted",
              taskToDelete
                ? `"${taskToDelete.title}" has been deleted successfully.`
                : "Task has been deleted successfully.",
            );

            // Reload tasks in the background to ensure data consistency
            // Silently handle any errors from reload - task is already deleted successfully
            setTimeout(() => {
              loadTasks().catch((error) => {
                // Silently log error - don't show to user as task was already deleted successfully
                console.error("Error reloading tasks after deletion (non-critical):", error);
              });
            }, 500);
          }
        } catch (error: any) {
          console.error("Error deleting task:", error);

          // Restore task to state if deletion failed
          if (taskToDelete) {
            setTasks((prevTasks) => {
              // Check if task already exists
              const exists = prevTasks.some((t) => String(t.id) === String(taskId));
              if (!exists) {
                return [...prevTasks, taskToDelete];
              }
              return prevTasks;
            });
          }

          // Show error toast only for actual failures
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to delete task. Please try again.";
          showError("Delete Failed", errorMessage);
        }
      },
    });
  };

  // Apply date filtering to tasks
  const filteredTasks = useDateFilter(tasks, dateFilter, customDateRange);

  const columns = [
    {
      id: "todo" as const,
      name: "To Do",
      color: "",
      bgColor: "#dbeafe",
      textColor: "#1e40af",
      borderColor: "#93c5fd",
    },
    {
      id: "inprogress" as const,
      name: "In Progress",
      color: "",
      bgColor: "#fef3c7",
      textColor: "#92400e",
      borderColor: "#fcd34d",
    },
    {
      id: "review" as const,
      name: "Review",
      color: "",
      bgColor: "#fce7f3",
      textColor: "#9f1239",
      borderColor: "#f9a8d4",
    },
    {
      id: "done" as const,
      name: "Completed",
      color: "",
      bgColor: "#d1fae5",
      textColor: "#065f46",
      borderColor: "#6ee7b7",
    },
    {
      id: "overdue" as const,
      name: "Overdue",
      color: "",
      bgColor: "#fef2f2",
      textColor: "#dc2626",
      borderColor: "#fecaca",
    },
  ];

  if (loading) {
    return (
      <PageLayout members={[]} tasks={[]} title="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#076297" }} />
        </div>
      </PageLayout>
    );
  }

  if (error || !team || !project) {
    return (
      <PageLayout members={[]} tasks={[]} title="Project Not Found">
        <div className="text-center py-8">
          <p style={{ color: "#6b7280" }}>{error || "Project not found."}</p>
          <button
            onClick={() => router.push(`/teams/${resolvedParams.teamId}`)}
            className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Team
          </button>
        </div>
      </PageLayout>
    );
  }

  const tabs = [
    { id: "board", label: "Board" },
    { id: "members", label: "Members" },
    { id: "workload", label: "Workload" },
    { id: "progress", label: "Progress" },
  ];

  // Calculate member workload from project members
  const projectMembers = project.members || [];
  const members = projectMembers.map((pm) => ({
    id: pm.user_id.toString(),
    name: pm.name || "Unknown",
    email: pm.user?.email || "",
    color: "#076297",
    initials: pm.name
      ? pm.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "NA",
  }));

  const memberWorkload = projectMembers.map((projectMember) => {
    const memberId = projectMember.user_id?.toString() || "";
    const assignedTasks = filteredTasks.filter((task) => task.assignees.includes(memberId));
    const completedTasks = assignedTasks.filter((task) => task.status === "done");
    const memberName = projectMember.name || "Unknown";

    // Calculate weekly occupancy percentage
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of current week

    // Count days with tasks in the current week
    // Use created_at date from backend to determine when tasks were assigned
    const weekTasks = assignedTasks.filter((task) => {
      // Use created_at if available, otherwise use dueDate as fallback
      const taskDate = task.createdAt
        ? new Date(task.createdAt)
        : task.dueDate
          ? new Date(task.dueDate)
          : new Date();
      return taskDate >= weekStart && taskDate <= weekEnd;
    });

    // Get unique days with tasks based on actual task dates from backend
    const occupiedDays = new Set();
    assignedTasks.forEach((task) => {
      // Use created_at date from backend to determine the actual day the task was assigned
      const taskDate = task.createdAt
        ? new Date(task.createdAt)
        : task.dueDate
          ? new Date(task.dueDate)
          : new Date();

      // Only count tasks that fall within the current week
      if (taskDate >= weekStart && taskDate <= weekEnd) {
        // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = taskDate.getDay();

        // Only count weekdays (Monday = 1 to Friday = 5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          occupiedDays.add(taskDate.toDateString());
        }
      }
    });

    // Calculate occupancy percentage (5 working days per week)
    const weeklyOccupancyPercentage = Math.round((occupiedDays.size / 5) * 100);

    return {
      member: {
        id: memberId,
        name: memberName,
        email: "",
        color: "#076297",
        initials: memberName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      },
      totalTasks: assignedTasks.length,
      completedTasks: completedTasks.length,
      progress:
        assignedTasks.length > 0
          ? Math.round((completedTasks.length / assignedTasks.length) * 100)
          : 0,
      weeklyOccupancy: weeklyOccupancyPercentage,
      occupiedDays: occupiedDays.size,
      totalWeekDays: 5,
    };
  });

  // Calculate overall progress
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((task) => task.status === "done").length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <PageLayout
      members={members}
      tasks={tasks}
      title={project.name}
      headerAction={
        <div className="flex items-center justify-center sm:justify-start gap-3 w-full sm:w-auto">
          <button
            onClick={() => router.push(`/teams/${resolvedParams.teamId}`)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 transition-colors font-medium w-full sm:w-auto touch-manipulation"
            style={{ borderRadius: "7px" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to {team.name}</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
      }
    >
      {/* Project Overview */}
      <div
        className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "7px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0"
            style={{
              backgroundColor: project.color || team.color || "#073392",
              borderRadius: "7px",
            }}
          >
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: "#ffffff" }} />
          </div>
          <div className="flex-1 w-full text-center sm:text-left">
            <h2
              className="text-xl sm:text-2xl md:text-3xl font-bold mb-2"
              style={{ color: "#1f2937" }}
            >
              {project.name}
            </h2>
            <div
              className="text-sm sm:text-base md:text-lg mb-3 sm:mb-4"
              style={{ color: "#6b7280" }}
            >
              <TruncatedText
                text={project.description || "No description"}
                maxLength={170}
                className=""
              />
            </div>
            <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-3 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users
                  className="w-4 h-4"
                  style={{ color: project.color || team.color || "#073392" }}
                />
                <span style={{ color: "#4b5563" }}>{project.member_count || 0} members</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor:
                      project.status === "active"
                        ? "#D1FAE5"
                        : project.status === "completed"
                          ? "#DBEAFE"
                          : project.status === "planning"
                            ? "#FEF3C7"
                            : "#F3F4F6",
                    color:
                      project.status === "active"
                        ? "#065F46"
                        : project.status === "completed"
                          ? "#1E40AF"
                          : project.status === "planning"
                            ? "#92400E"
                            : "#374151",
                  }}
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs Container with Date Filter */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="w-full sm:w-auto overflow-x-auto">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          {activeTab === "board" && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {/* Add a task button - Only show for assigned users */}
              {isCurrentUserAssignedToTeam() && (
                <Button
                  onClick={() => setIsCreatingTask(true)}
                  variant="primary"
                  size="md"
                  className="flex items-center justify-center gap-2 w-full sm:w-auto touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Add a task</span>
                </Button>
              )}

              <div className="w-full sm:w-auto">
                <DateFilter
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  customDateRange={customDateRange}
                  setCustomDateRange={setCustomDateRange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 md:p-6">
        {activeTab === "board" && (
          <div>
            <h3
              className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4"
              style={{ color: "#1f2937" }}
            >
              Project Board
            </h3>
            {loadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#076297" }} />
              </div>
            ) : (
              <KanbanBoard
                columns={columns}
                tasks={filteredTasks}
                members={members}
                projectId={parseInt(resolvedParams.projectId)}
                onTasksChange={(updatedTasks) => {
                  // Find the changed task and update it
                  const changedTask = updatedTasks.find((ut, i) => {
                    const oldTask = tasks[i];
                    return (
                      oldTask &&
                      (ut.status !== oldTask.status ||
                        JSON.stringify(ut) !== JSON.stringify(oldTask))
                    );
                  });

                  if (changedTask) {
                    handleUpdateTask(changedTask);
                  }
                  setTasks(updatedTasks);
                }}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onTaskClick={async (taskId) => {
                  try {
                    // Fetch full task details from backend
                    const response = await taskApi.getTaskById(parseInt(taskId));
                    const backendTask = response.task;

                    // Convert to frontend format with ALL fields
                    const fullTask: TaskType = {
                      id: backendTask.id.toString(),
                      title: backendTask.title,
                      description: backendTask.description || "",
                      deliverables: backendTask.deliverables || "",
                      status: (backendTask.status === "backlog"
                        ? "overdue"
                        : backendTask.status) as any,
                      priority: backendTask.priority as any,
                      dueDate: backendTask.due_date,
                      labels: backendTask.labels || [],
                      assignees: Array.isArray(backendTask.assignees)
                        ? backendTask.assignees.map((a: any) => a.user_id.toString())
                        : [],
                      comments:
                        backendTask.comments?.map((c: any) => ({
                          id: c.id.toString(),
                          userId: c.user_id.toString(),
                          message: c.content,
                          createdAt: c.created_at,
                        })) || [],
                      attachments: (backendTask.attachments || []).map((a: any) => ({
                        id: a.id,
                        filename: a.filename,
                        url: a.url,
                        sizeKB: 0,
                        uploadedAt: new Date().toISOString(),
                      })),
                      created_by: backendTask.created_by,
                      creator_role_id: backendTask.creator_role_id,
                      creator_role_name: backendTask.creator_role_name,
                    };

                    return fullTask;
                  } catch (error) {
                    console.error("Error loading full task:", error);
                    return null;
                  }
                }}
              />
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <h3
                className="text-base sm:text-lg md:text-xl font-semibold text-center sm:text-left"
                style={{ color: "#1f2937" }}
              >
                Project Members ({projectMembers.length})
              </h3>
              {isCurrentUserAssignedToTeam() && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setIsAddingMember(true)}
                    className="px-3 py-2 text-sm rounded-md text-white transition-colors flex items-center justify-center gap-2 w-full sm:w-auto touch-manipulation"
                    style={{ backgroundColor: "#076297", borderRadius: "7px" }}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add from Team</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingExternalMember(true);
                      loadAllUsers();
                    }}
                    className="px-3 py-2 text-sm rounded-md border transition-colors flex items-center justify-center gap-2 w-full sm:w-auto touch-manipulation"
                    style={{ borderColor: "#076297", color: "#076297", borderRadius: "7px" }}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Add External</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add Members from Team Section */}
            {isAddingMember && team && team.members && (
              <div
                className="p-4 rounded-lg border"
                style={{ borderColor: "#e5e7eb", backgroundColor: "#f9fafb" }}
              >
                <h4 className="text-sm font-semibold mb-3" style={{ color: "#374151" }}>
                  Select Team Members to Add to Project
                </h4>
                <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                  {team.members
                    .filter(
                      (teamMember) =>
                        !projectMembers.some((pm) => pm.user_id === teamMember.user_id),
                    )
                    .map((teamMember) => (
                      <label
                        key={teamMember.user_id}
                        className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer"
                        style={{ borderRadius: "7px" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembersToAdd.includes(teamMember.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembersToAdd([
                                ...selectedMembersToAdd,
                                teamMember.user_id,
                              ]);
                            } else {
                              setSelectedMembersToAdd(
                                selectedMembersToAdd.filter((id) => id !== teamMember.user_id),
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: project.color || team.color || "#073392" }}
                          >
                            {teamMember.name
                              ? teamMember.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : "NA"}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: "#374151" }}>
                              {teamMember.name || "Unknown"}
                            </p>
                            {teamMember.position && (
                              <p className="text-xs" style={{ color: "#6b7280" }}>
                                {teamMember.position}
                              </p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  {team.members.filter(
                    (teamMember) => !projectMembers.some((pm) => pm.user_id === teamMember.user_id),
                  ).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      All team members are already in this project
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAddingMember(false);
                      setSelectedMembersToAdd([]);
                    }}
                    className="px-3 py-1.5 text-sm rounded-md border transition-colors"
                    style={{ borderColor: "#d1d5db", borderRadius: "7px", color: "#374151" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMembersToProject}
                    disabled={selectedMembersToAdd.length === 0}
                    className="px-3 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#076297", borderRadius: "7px" }}
                  >
                    Add Selected ({selectedMembersToAdd.length})
                  </button>
                </div>
              </div>
            )}

            {/* Add External Members Section */}
            {isAddingExternalMember && (
              <div
                className="p-4 rounded-lg border"
                style={{ borderColor: "#e5e7eb", backgroundColor: "#f9fafb" }}
              >
                <h4 className="text-sm font-semibold mb-3" style={{ color: "#374151" }}>
                  Add Users to Project
                </h4>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#076297" }} />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                      {allUsers
                        .filter((user) => !projectMembers.some((pm) => pm.user_id === user.id))
                        .map((user) => (
                          <label
                            key={user.id}
                            className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer"
                            style={{ borderRadius: "7px" }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedMembersToAdd.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembersToAdd([...selectedMembersToAdd, user.id]);
                                } else {
                                  setSelectedMembersToAdd(
                                    selectedMembersToAdd.filter((id) => id !== user.id),
                                  );
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              {user.avatar_url ? (
                                <img
                                  src={user.avatar_url}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                  style={{
                                    backgroundColor: project.color || team?.color || "#073392",
                                  }}
                                >
                                  {user.name
                                    ? user.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)
                                    : "NA"}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: "#374151" }}>
                                  {user.name}
                                </p>
                                <p className="text-xs" style={{ color: "#6b7280" }}>
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </label>
                        ))}
                      {allUsers.filter(
                        (user) => !projectMembers.some((pm) => pm.user_id === user.id),
                      ).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          All users are already in this project
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsAddingExternalMember(false);
                          setSelectedMembersToAdd([]);
                        }}
                        className="px-3 py-1.5 text-sm rounded-md border transition-colors"
                        style={{ borderColor: "#d1d5db", borderRadius: "7px", color: "#374151" }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMembersToProject}
                        disabled={selectedMembersToAdd.length === 0}
                        className="px-3 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#076297", borderRadius: "7px" }}
                      >
                        Add Selected ({selectedMembersToAdd.length})
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Project Members Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {projectMembers.map((projectMember) => {
                const memberId = projectMember.user_id?.toString() || "";
                const memberTasks = filteredTasks.filter((task) =>
                  task.assignees.includes(memberId),
                );
                const completedCount = memberTasks.filter((task) => task.status === "done").length;

                return (
                  <div
                    key={projectMember.id}
                    className="p-4 relative"
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "7px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleRemoveProjectMember(
                          projectMember.user_id,
                          projectMember.name || "this member",
                        )
                      }
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Remove from project"
                    >
                      <X className="w-4 h-4" style={{ color: "#dc2626" }} />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <UserAvatar
                        userId={
                          projectMember.user_id ? parseInt(projectMember.user_id.toString()) : 0
                        }
                        size="md"
                        fallbackColor={project.color || team.color || "#073392"}
                      />
                      <div className="flex-1 pr-6">
                        <h4 className="font-semibold" style={{ color: "#1f2937" }}>
                          {projectMember.name || "Unknown"}
                        </h4>
                        {projectMember.position && (
                          <p className="text-xs" style={{ color: "#6b7280" }}>
                            {projectMember.position}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between text-sm"
                      style={{ color: "#4b5563" }}
                    >
                      <span>{memberTasks.length} tasks</span>
                      <span className="font-medium" style={{ color: "#16a34a" }}>
                        {completedCount} completed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {projectMembers.length === 0 && !isAddingMember && !isAddingExternalMember && (
              <p className="text-sm text-gray-500 text-center py-8">
                No members assigned to this project yet
              </p>
            )}
          </div>
        )}

        {activeTab === "workload" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <h3
                className="text-base sm:text-lg md:text-xl font-semibold text-center sm:text-left"
                style={{ color: "#1f2937" }}
              >
                Team Workload
              </h3>
              <div className="w-full sm:w-auto">
                <DateFilter
                  dateFilter={dateFilter}
                  setDateFilter={setDateFilter}
                  customDateRange={customDateRange}
                  setCustomDateRange={setCustomDateRange}
                />
              </div>
            </div>
            <div className="space-y-3">
              {memberWorkload.map(
                ({
                  member,
                  totalTasks,
                  completedTasks,
                  progress,
                  weeklyOccupancy,
                  occupiedDays,
                  totalWeekDays,
                }) => (
                  <div
                    key={member.id}
                    className="p-4"
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "7px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    }}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <UserAvatar
                          userId={parseInt(member.id)}
                          size="md"
                          fallbackColor={member.color}
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            className="font-semibold text-sm sm:text-base"
                            style={{ color: "#1f2937" }}
                          >
                            {member.name}
                          </h4>
                          <p className="text-xs sm:text-sm" style={{ color: "#6b7280" }}>
                            {totalTasks} tasks assigned
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p
                          className="text-xs sm:text-sm font-bold"
                          style={{
                            color: weeklyOccupancy === 100 ? "#ef4444" : "#005c30",
                          }}
                        >
                          {weeklyOccupancy}% ({occupiedDays}/{totalWeekDays} days)
                        </p>
                        <button
                          onClick={() => {
                            setSelectedMemberForAnalytics(member);
                            setShowWorkloadModal(true);
                          }}
                          className="text-xs transition-colors duration-200 flex items-center gap-1 mt-1"
                          style={{ color: "#076297" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#0a7bb8")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#076297")}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>

                    {/* Weekly Occupancy Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium" style={{ color: "#6b7280" }}>
                          Weekly Occupancy
                        </span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: "#e5e7eb" }}
                      >
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${weeklyOccupancy}%`,
                            backgroundColor: weeklyOccupancy === 100 ? "#ef4444" : "#005c30",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
              {memberWorkload.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No members assigned to this project yet
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "#1f2937" }}>
                Overall Progress
              </h3>
              <div
                className="p-6"
                style={{
                  backgroundColor: "#f0f8fc",
                  borderRadius: "7px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: "#374151" }}>
                    Project Completion
                  </span>
                  <span
                    className="text-2xl font-bold"
                    style={{ color: project.color || team.color || "#073392" }}
                  >
                    {overallProgress}%
                  </span>
                </div>
                <div
                  className="w-full h-4 rounded-full overflow-hidden mb-4"
                  style={{ backgroundColor: "#e5e7eb" }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${overallProgress}%`,
                      backgroundColor: project.color || team.color || "#073392",
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#1f2937" }}>
                      {totalTasks}
                    </p>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                      Total Tasks
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>
                      {completedTasks}
                    </p>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                      Completed
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#ea580c" }}>
                      {totalTasks - completedTasks}
                    </p>
                    <p className="text-sm" style={{ color: "#6b7280" }}>
                      Remaining
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#1f2937" }}>
                Status Breakdown
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { label: "To Do", status: "todo", color: "#3b82f6", icon: Clock },
                  { label: "In Progress", status: "inprogress", color: "#f59e0b", icon: Clock },
                  { label: "In Review", status: "review", color: "#ec4899", icon: User },
                  { label: "Completed", status: "done", color: "#10b981", icon: CheckCircle },
                  { label: "Overdue", status: "overdue", color: "#dc2626", icon: Clock },
                ].map(({ label, status, color, icon: Icon }) => {
                  const count = filteredTasks.filter((task) => task.status === status).length;
                  return (
                    <div
                      key={status}
                      className="p-4"
                      style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "7px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-sm font-medium" style={{ color: "#4b5563" }}>
                          {label}
                        </span>
                      </div>
                      <p className="text-3xl font-bold" style={{ color }}>
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal for Creating/Editing Tasks */}
      <TaskModal
        open={isCreatingTask}
        task={
          isCreatingTask
            ? {
                id: "",
                title: "",
                description: "",
                deliverables: "",
                status: creatingTaskStatus as any,
                priority: "medium" as const,
                dueDate: undefined,
                labels: [],
                assignees: [],
                comments: [],
                attachments: [],
              }
            : null
        }
        members={members}
        mode={isCurrentUserManager() ? "management" : "individual"}
        projectId={parseInt(resolvedParams.projectId)}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingTask(false);
          }
        }}
        onChange={(updatedTask: TaskType) => {
          if (updatedTask.id && updatedTask.id !== "" && updatedTask.id !== "0") {
            // Editing existing task
            handleUpdateTask(updatedTask);
          } else {
            // Creating new task
            handleCreateTask(updatedTask);
          }
        }}
        onDelete={handleDeleteTask}
      />

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

      {/* Workload Analytics Modal */}
      {selectedMemberForAnalytics && (
        <WorkloadAnalyticsModal
          isOpen={showWorkloadModal}
          onClose={() => {
            setShowWorkloadModal(false);
            setSelectedMemberForAnalytics(null);
          }}
          member={selectedMemberForAnalytics}
          tasks={filteredTasks}
          dateFilter={dateFilter}
          customDateRange={customDateRange}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </PageLayout>
  );
}
