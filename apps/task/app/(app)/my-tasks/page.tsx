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
import { Task, TeamMember } from "@/lib/types";
import { initialMembers, initialTasks } from "@/lib/sample-data";
import { taskApi, portalDataApi } from "@/lib/api-client";
import { taskTeamsApi, TaskTeam } from "@/lib/api/task-teams";
import { FileText, AlertCircle, CheckCircle, Clock, Users, Calendar, X, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function BoardPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState<string>('backlog');
  const [creatingTaskPriority, setCreatingTaskPriority] = useState<string>('medium');
  const [viewMode, setViewMode] = useState<string>('table'); // 'table' or 'board'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfoVersion, setUserInfoVersion] = useState(0);
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();

  const viewModes = useMemo(() => [
    { id: 'table', label: 'Table View' },
    { id: 'board', label: 'Board View' }
  ], []);

  // Load all tasks assigned to the user (personal + project tasks)
  const loadAllUserTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load personal tasks from localStorage
      const savedPersonalTasks = localStorage.getItem('personalTasks');
      const personalTasks = savedPersonalTasks ? JSON.parse(savedPersonalTasks) : [];
      
      // Load project tasks assigned to the user from API
      let projectTasks: any[] = [];
      try {
        const projectTasksResponse = await taskApi.getTasksByUser();
        projectTasks = projectTasksResponse.tasks || [];
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
    loadAllUserTasks();
    loadAllTeamsForUserInfo();
    
    // Expose refresh function globally for TaskModal to use
    (window as any).refreshUserInfo = loadAllTeamsForUserInfo;
  }, []);

  // Load all teams to populate user information for taskUsers
  const loadAllTeamsForUserInfo = async () => {
    try {
      const teamsResponse = await taskTeamsApi.listTeams();
      const allTeams = teamsResponse.teams || [];
      
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
      
      // Update the global taskUsers
      (window as any).taskUsers = taskUsers;
      
      
      // Increment version to trigger re-renders
      setUserInfoVersion(prev => prev + 1);
      
      
    } catch (error) {
      console.error('Error loading teams for user info:', error);
    }
  };


  // Show all tasks (no filtering needed since team selection is in TaskModal)
  const filteredTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

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
      { id: "backlog", name: "Backlog", color: "", bgColor: "#f3f4f6", textColor: "#374151", borderColor: "#e5e7eb" },
      { id: "todo", name: "To Do", color: "", bgColor: "#f0f8fc", textColor: "#076297", borderColor: "#d4e9f5" },
      { id: "inprogress", name: "In Progress", color: "", bgColor: "#fef3c7", textColor: "#92400e", borderColor: "#fcd34d" },
      { id: "review", name: "Review", color: "", bgColor: "#fce7f3", textColor: "#9f1239", borderColor: "#f9a8d4" },
      { id: "done", name: "Completed", color: "", bgColor: "#d1fae5", textColor: "#065f46", borderColor: "#6ee7b7" },
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
      members={[]} 
      tasks={tasks} 
      title="My Assigned Tasks"
      headerAction={null}
        >

          {/* View Mode Selector with Profile Selector */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4" style={{ borderRadius: '7px' }}>
            <div className="flex items-center justify-between">
              <Tabs
                tabs={viewModes}
                activeTab={viewMode}
                onTabChange={setViewMode}
              />
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
          {!loading && !error && viewMode === 'table' ? (
            /* Table View */
            <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ borderRadius: '7px' }}>
              {/* Table Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>
                    Assigned Tasks ({totalTasks})
                  </h3>
                  {totalTasks > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>Showing {startIndex + 1}-{Math.min(endIndex, totalTasks)} of {totalTasks}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsCreatingTask(true)}
                  className="flex items-center gap-2 px-4 py-2 text-white font-medium rounded-lg transition-colors"
                  style={{ 
                    backgroundColor: '#076297',
                    borderRadius: '7px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#065a87';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#076297';
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-4 font-medium text-gray-700">Task</th>
                      <th className="text-left p-4 font-medium text-gray-700">Status</th>
                      <th className="text-left p-4 font-medium text-gray-700">Priority</th>
                      <th className="text-left p-4 font-medium text-gray-700">Assign Team</th>
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
                          <div className="flex items-center gap-2">
                            {task.teamId ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                  <Users className="w-4 h-4" />
                                </div>
                                <span className="text-sm text-gray-700">
                                  {(task as any).isPersonal 
                                    ? (task.teamId ? `Team ${task.teamId}` : 'Personal')
                                    : (task.projectId ? `Project ${task.projectId}` : 'Project')
                                  }
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">No team assigned</span>
                            )}
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
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
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
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderRadius: '4px' }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">per page</span>
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
              tasks={filteredTasks}
              members={[]}
              onTasksChange={setTasks}
              registerOpenTask={(open) => {
                if (typeof window !== "undefined") {
                  window.addEventListener("taskflow:open", (e: any) => open(e.detail));
                }
              }}
              onCreateTask={(status) => {
                setIsCreatingTask(true);
                setCreatingTaskStatus(status);
              }}
            />
          )}

          {/* Task Modal for Viewing/Editing Existing Tasks */}
          {activeTask && (
            <TaskModal
              open={!!activeTask}
              task={activeTask}
              members={[]}
              mode="management"
              userInfoVersion={userInfoVersion}
              onOpenChange={(open) => {
                if (!open) {
                  setActiveTask(null);
                }
              }}
              onChange={async (updatedTask: Task) => {
                try {
                  // Check if it's a personal task
                  const existingTask = tasks.find(t => t.id === updatedTask.id);
                  if (existingTask && (existingTask as any).isPersonal) {
                    // Update personal task locally
                    const updatedTasks = tasks.map(t => (t.id === updatedTask.id ? updatedTask : t));
                    setTasks(updatedTasks);
                    setActiveTask(updatedTask);
                    
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
                    
                    const response = await taskApi.updateTask(parseInt(updatedTask.id), taskData);
                    const updatedProjectTask = {
                      ...response.task,
                      assignees: response.task.assignees?.map((a: any) => a.user_id.toString()) || [],
                    };
                    
                    const updatedTasks = tasks.map(t => (t.id === updatedTask.id ? updatedProjectTask : t));
                    setTasks(updatedTasks);
                    setActiveTask(updatedProjectTask);
                  }
                  
                  // Refresh user information to ensure updated assignees have real names
                  await loadAllTeamsForUserInfo();
                } catch (err: any) {
                  console.error('Error updating task:', err);
                  setError('Failed to update task');
                }
              }}
              onDelete={async (id) => {
                try {
                  // Check if it's a personal task
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
                    await taskApi.deleteTask(parseInt(id));
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
          )}

          {/* Task Modal for Creating New Tasks */}
          <TaskModal
            open={isCreatingTask}
            task={isCreatingTask ? {
              id: '',
              title: '',
              description: '',
              deliverables: '',
              status: viewMode === 'board' ? creatingTaskStatus as any : 'backlog' as const,
              priority: viewMode === 'table' ? 'medium' as const : creatingTaskPriority as any,
              dueDate: undefined,
              labels: [],
              assignees: [], // Will be assigned in TaskModal
              teamId: undefined, // Will be assigned in TaskModal
              comments: [],
              attachments: []
            } : null}
            members={[]}
            mode="management"
            userInfoVersion={userInfoVersion}
            onOpenChange={(open) => {
              if (!open) {
                setIsCreatingTask(false);
              }
            }}
            onChange={async (updatedTask: Task) => {
              try {
                // Check if task has a project_id (from team selection)
                if (updatedTask.projectId) {
                  // Create project task via API
                  const taskData = {
                    project_id: updatedTask.projectId,
                    title: updatedTask.title,
                    description: updatedTask.description,
                    deliverables: updatedTask.deliverables,
                    status: updatedTask.status,
                    priority: updatedTask.priority,
                    due_date: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
                    labels: updatedTask.labels || [],
                    attachments: updatedTask.attachments || [],
                    assignees: updatedTask.assignees.map(id => parseInt(id)),
                    created_by: 1, // TODO: Get from user context
                  };
                  
                  const response = await taskApi.createTask(taskData);
                  const newTask = {
                    ...response.task,
                    assignees: response.task.assignees?.map((a: any) => a.user_id.toString()) || [],
                  };
                  
                  // Add to current tasks
                  const updatedTasks = [newTask, ...tasks];
                  setTasks(updatedTasks);
                } else {
                  // Create personal task
                  const newTask = {
                    ...updatedTask,
                    id: Math.random().toString(36).slice(2),
                    isPersonal: true,
                    createdBy: 1, // TODO: Get from user context
                    createdAt: new Date().toISOString(),
                  };
                  
                  // Add to current tasks
                  const updatedTasks = [newTask, ...tasks];
                  setTasks(updatedTasks);
                  
                  // Save to localStorage for persistence
                  const personalTasks = updatedTasks.filter(task => (task as any).isPersonal);
                  localStorage.setItem('personalTasks', JSON.stringify(personalTasks));
                }
                
                // Refresh user information to ensure new assignees have real names
                await loadAllTeamsForUserInfo();
                
              setIsCreatingTask(false);
                
              } catch (err: any) {
                console.error('Error creating task:', err);
                setError('Failed to create task');
              }
            }}
            onDelete={() => {
              // This shouldn't be called for new tasks, but just in case
              setIsCreatingTask(false);
            }}
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
                          await taskApi.deleteTask(parseInt(taskToDelete.id));
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
    </PageLayout>
  );
}



