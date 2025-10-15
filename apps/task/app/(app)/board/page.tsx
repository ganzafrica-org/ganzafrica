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
import { FileText, AlertCircle, CheckCircle, Clock, Users, Calendar, X, Filter, CalendarDays } from "lucide-react";

export default function BoardPage(): React.JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members] = useState<TeamMember[]>(initialMembers);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState<string>('backlog');
  const [creatingTaskPriority, setCreatingTaskPriority] = useState<string>('medium');
  const [activeTab, setActiveTab] = useState<string>('board');
  const [selectedMember, setSelectedMember] = useState<string>('all'); // 'all' or member id
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'week', 'month', 'custom'
  const [customDateRange, setCustomDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [showDateFilter, setShowDateFilter] = useState(false);
  const { collapsed: sidebarCollapsed, toggleCollapsed } = useSidebar();

  // Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
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

  const tabs = useMemo(() => [
    { id: 'board', label: 'General Team' },
    { id: 'management', label: 'Management' }
  ], []);

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
      
      // Transform tasks to match our Task interface
      const transformedTasks: Task[] = allTasks.map((task: any) => ({
        id: task.id ? task.id.toString() : Math.random().toString(36).slice(2),
        title: task.title || 'Untitled Task',
        description: task.description || '',
        deliverables: task.deliverables || '',
        status: task.status || 'backlog',
        priority: task.priority || 'medium',
        dueDate: task.due_date ? new Date(task.due_date).toISOString() : undefined,
        labels: task.labels || [],
        assignees: task.assignees?.map((a: any) => a.user_id ? a.user_id.toString() : '') || [],
        comments: [],
        attachments: task.attachments || [],
        projectId: task.project_id,
        teamId: undefined,
      }));
      
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

  // Load tasks on component mount
  useEffect(() => {
    loadAllTasks();
  }, []);

  // Filter tasks based on selected member and date
  const filteredTasks = useMemo(() => {
    let filtered = selectedMember === 'all' 
      ? tasks 
      : tasks.filter(task => task.assignees.includes(selectedMember));

    // Apply date filtering based on task deadlines
    if (dateFilter === 'week') {
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return true; // Include tasks without due dates
        const taskDueDate = new Date(task.dueDate);
        return taskDueDate >= now && taskDueDate <= oneWeekFromNow;
      });
    } else if (dateFilter === 'month') {
      const now = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(now.getMonth() + 1);
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return true; // Include tasks without due dates
        const taskDueDate = new Date(task.dueDate);
        return taskDueDate >= now && taskDueDate <= oneMonthFromNow;
      });
    } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const startDate = new Date(customDateRange.start);
      const endDate = new Date(customDateRange.end);
      // Set end date to end of day
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return true; // Include tasks without due dates
        const taskDueDate = new Date(task.dueDate);
        return taskDueDate >= startDate && taskDueDate <= endDate;
      });
    }

    return filtered;
  }, [tasks, selectedMember, dateFilter, customDateRange]);

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

   const handlePriorityDrop = async (e: React.DragEvent, priority: 'high' | 'medium' | 'low') => {
     e.preventDefault();
     const id = e.dataTransfer.getData("text/task-id");
     if (!id) return;
     
     // Update locally first for immediate UI feedback
     const updatedTasks = tasks.map(t => (t.id === id ? { ...t, priority } : t));
     setTasks(updatedTasks);
     
     // Then update in database
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
         
         await taskApi.updateTask(parseInt(id), taskData);
         console.log('Task priority updated successfully:', id, priority);
       }
     } catch (err: any) {
       console.error('Error updating task priority:', err);
       // Revert to original tasks if API update fails
       setTasks(tasks);
     }
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
      members={members} 
      tasks={tasks} 
      title="Board View"
      headerAction={null}
        >
          {/* Tabs with Profile Selector and Date Filter */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4" style={{ borderRadius: '7px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Tabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                
                {/* Date Filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    <span>
                      {dateFilter === 'all' && 'All Time'}
                      {dateFilter === 'week' && 'This Week'}
                      {dateFilter === 'month' && 'This Month'}
                      {dateFilter === 'custom' && 'Custom Range'}
                    </span>
                    <Filter className="w-3 h-3" />
                  </button>
                  
                  {/* Date Filter Dropdown */}
                  {showDateFilter && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setDateFilter('all');
                            setShowDateFilter(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                            dateFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          All Time
                        </button>
                        <button
                          onClick={() => {
                            setDateFilter('week');
                            setShowDateFilter(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                            dateFilter === 'week' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          This Week
                        </button>
                        <button
                          onClick={() => {
                            setDateFilter('month');
                            setShowDateFilter(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                            dateFilter === 'month' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          This Month
                        </button>
                        <button
                          onClick={() => {
                            setDateFilter('custom');
                            setShowDateFilter(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                            dateFilter === 'custom' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          Custom Range
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Selector - Show for both tabs */}
              <div className="flex items-center -space-x-2">
                {/* All Tasks Button */}
                <button
                  onClick={() => setSelectedMember('all')}
                  style={{ 
                    backgroundColor: selectedMember === 'all' ? '#076297' : '#6b7280',
                  }}
                  className={`w-8 h-8 rounded-full grid place-items-center text-white text-xs font-semibold ring-2 transition ${
                    selectedMember === 'all' ? 'ring-gray-400 ring-4' : 'ring-white'
                  }`}
                  title="All Members"
                >
                  All
                </button>
                {/* Show first 4 members */}
                {members.slice(0, 4).map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member.id)}
                    style={{ backgroundColor: member.color }}
                    className={`w-8 h-8 rounded-full grid place-items-center text-white text-xs font-semibold ring-2 transition ${
                      selectedMember === member.id ? 'ring-gray-400 ring-4' : 'ring-white'
                    }`}
                    title={member.name}
                  >
                    {member.initials}
                  </button>
                ))}
                {/* Show +X button if more than 4 members */}
                {members.length > 5 && (
                  <button
                    onClick={() => setShowMemberModal(true)}
                    style={{ backgroundColor: '#F8B712' }}
                    className="w-8 h-8 rounded-full grid place-items-center text-white text-xs font-bold ring-2 ring-white transition hover:opacity-90"
                    title="View all team members"
                  >
                    +{members.length - 5}
                  </button>
                )}
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
                 // Update tasks locally first for immediate UI feedback
                 setTasks(updatedTasks);
                 
                 // Then update in database
                 try {
                   // Find the task that was moved (compare with previous tasks)
                   const movedTask = updatedTasks.find(task => {
                     const originalTask = tasks.find(t => t.id === task.id);
                     return originalTask && originalTask.status !== task.status;
                   });
                   
                   if (movedTask) {
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
                     
                     await taskApi.updateTask(parseInt(movedTask.id), taskData);
                     console.log('Task status updated successfully:', movedTask.id, movedTask.status);
                   }
                 } catch (err: any) {
                   console.error('Error updating task status:', err);
                   // Revert to original tasks if API update fails
                   setTasks(tasks);
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
          )}

          {/* Task Modal for Viewing/Editing Existing Tasks */}
          {activeTask && (
            <TaskModal
              open={!!activeTask}
              task={activeTask}
              members={members}
              mode="management"
              onOpenChange={(open) => {
                if (!open) {
                  setActiveTask(null);
                }
              }}
               onChange={async (updatedTask: Task) => {
                 try {
                   // Update task via API - allow updates for all tasks in board view
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
                 }
               }}
               onDelete={async (id) => {
                 try {
                   // Delete task via API - allow deletion for all tasks in board view
                   await taskApi.deleteTask(parseInt(id));
                   setTasks(tasks.filter(t => t.id !== id));
                   setActiveTask(null);
                   console.log('Task deleted successfully:', id);
                 } catch (err: any) {
                   console.error('Error deleting task:', err);
                   // Fallback to local deletion if API fails
                   setTasks(tasks.filter(t => t.id !== id));
                   setActiveTask(null);
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
              status: activeTab === 'board' ? creatingTaskStatus as any : 'backlog' as const,
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
               
               // Use the first available task team project
               const projectId = taskTeamProjects[0].id;
               console.log('Using task team project ID for task creation:', projectId);
               
               try {
                
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
                 };
                
                 const response = await taskApi.createTaskUnrestricted(taskData);
                 console.log('Task creation response:', response);
                 const newTask = {
                   ...response.task,
                   assignees: response.task.assignees?.map((a: any) => a.user_id ? a.user_id.toString() : '') || [],
                   projectId: projectId,
                 };
                 
                 setTasks([newTask, ...tasks]);
                 setIsCreatingTask(false);
                 console.log('Task created successfully:', newTask);
               } catch (err: any) {
                 console.error('Error creating task:', err);
                 // Fallback to local creation if API fails
                 const newTask = {
                   ...updatedTask,
                   id: Math.random().toString(36).slice(2),
                   projectId: projectId, // Use the project ID we fetched
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
                        View all tasks
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
                      <div 
                        style={{ backgroundColor: member.color }}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                      >
                        {member.initials}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium" style={{ color: '#1f2937' }}>{member.name}</div>
                        <div className="text-xs" style={{ color: '#6b7280' }}>
                          {tasks.filter(t => t.assignees.includes(member.id)).length} tasks assigned
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

          {/* Custom Date Range Modal */}
          {dateFilter === 'custom' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96" style={{ borderRadius: '7px' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#1f2937' }}>Custom Date Range</h3>
                  <button
                    onClick={() => setDateFilter('all')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setDateFilter('all')}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (customDateRange.start && customDateRange.end) {
                          setDateFilter('custom');
                        }
                      }}
                      disabled={!customDateRange.start || !customDateRange.end}
                      className="flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: '#076297',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#065a87';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!e.currentTarget.disabled) {
                          e.currentTarget.style.backgroundColor = '#076297';
                        }
                      }}
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    </PageLayout>
  );
}



