"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/page-layout";
import { Tabs } from "@/components/tabs";
import { Task as TaskType } from "@/lib/types";
import { taskTeamsApi, TaskTeam, TaskProject } from "@/lib/api/task-teams";
import { usersApi, User as UserType } from "@/lib/api/users";
import { tasksApi, Task as BackendTask } from "@/lib/api/tasks";
import { ErrorModal } from "@/components/error-modal";
import { ArrowLeft, Calendar, CheckCircle, Clock, User, Users, Loader2, X, UserPlus } from "lucide-react";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskModal } from "@/components/task-modal";

export default function ProjectDetailPage({ params }: { params: Promise<{ teamId: string; projectId: string }> }): React.JSX.Element {
  const resolvedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('board');
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [creatingTaskStatus, setCreatingTaskStatus] = useState<string>('backlog');
  
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
      console.error('Error loading project data:', error);
      setError(error.response?.data?.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await tasksApi.listTasksByProject(parseInt(resolvedParams.projectId));
      
      // Store all unique users from tasks (assignees and commenters) to enrich members list
      const taskUsers = new Map<string, any>();
      
      response.tasks.forEach((backendTask: any) => {
        // Collect users from assignees
        if (Array.isArray(backendTask.assignees)) {
          backendTask.assignees.forEach((a: any) => {
            if (a.user && a.user_id) {
              taskUsers.set(a.user_id.toString(), {
                id: a.user_id.toString(),
                name: a.user.name || 'Unknown',
                email: a.user.email || '',
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
                name: c.user.name || 'Unknown',
                email: c.user.email || '',
                avatar_url: c.user.avatar_url,
              });
            }
          });
        }
      });
      
      const convertedTasks: TaskType[] = response.tasks.map((backendTask: BackendTask) => ({
        id: backendTask.id.toString(),
        title: backendTask.title,
        description: backendTask.description || '',
        deliverables: backendTask.deliverables || '',
        status: backendTask.status as any,
        priority: backendTask.priority as any,
        dueDate: backendTask.due_date,
        labels: backendTask.labels || [],
        assignees: Array.isArray(backendTask.assignees) 
          ? (typeof backendTask.assignees[0] === 'number' 
              ? backendTask.assignees.map(String)
              : backendTask.assignees.map((a: any) => a.user_id.toString()))
          : [],
        comments: backendTask.comments?.map(c => ({
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
      }));
      
      setTasks(convertedTasks);
      
      // Store task users globally so they can be used by modal
      (window as any).taskUsers = taskUsers;
    } catch (error: any) {
      console.error('Error loading tasks:', error);
      if (error.response?.status !== 403) {
        setErrorModal({
          isOpen: true,
          title: 'Error Loading Tasks',
          message: error.response?.data?.message || 'Failed to load tasks.',
        });
      }
    } finally {
      setLoadingTasks(false);
    }
  };

  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersResponse = await usersApi.listUsers({ limit: 100, is_active: true });
      setAllUsers(usersResponse.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Loading Users',
        message: error.response?.data?.message || 'Failed to load users.',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddMembersToProject = async () => {
    if (selectedMembersToAdd.length === 0) return;

    try {
      for (const userId of selectedMembersToAdd) {
        await taskTeamsApi.addProjectMember(parseInt(resolvedParams.projectId), userId, 'member');
      }
      
      setSelectedMembersToAdd([]);
      setIsAddingMember(false);
      setIsAddingExternalMember(false);
      loadProjectData();
      
      setErrorModal({
        isOpen: true,
        title: 'Success',
        message: `Successfully added ${selectedMembersToAdd.length} member(s) to the project.`,
      });
    } catch (error: any) {
      console.error('Error adding project members:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Adding Members',
        message: error.response?.data?.message || 'Failed to add members to project. Please try again.',
      });
    }
  };

  const handleRemoveProjectMember = async (userId: number, memberName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Member',
      message: `Are you sure you want to remove "${memberName}" from this project?`,
      onConfirm: async () => {
        try {
          await taskTeamsApi.removeProjectMember(parseInt(resolvedParams.projectId), userId);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          loadProjectData();
          
          setErrorModal({
            isOpen: true,
            title: 'Success',
            message: 'Member removed from project successfully.',
          });
        } catch (error: any) {
          console.error('Error removing project member:', error);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setErrorModal({
            isOpen: true,
            title: 'Error Removing Member',
            message: error.response?.data?.message || 'Failed to remove member from project.',
          });
        }
      },
    });
  };

  const handleCreateTask = async (task: TaskType) => {
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;
      
      if (!user || !user.id) {
        setErrorModal({
          isOpen: true,
          title: 'Authentication Error',
          message: 'User not found. Please log in again.',
        });
        return;
      }

      // Create task WITHOUT attachments first (attachments need task ID to upload)
      const response = await tasksApi.createTask({
        project_id: parseInt(resolvedParams.projectId),
        title: task.title,
        description: task.description,
        deliverables: task.deliverables,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        labels: task.labels,
        attachments: [], // Don't send attachments - they'll be uploaded separately
        assignees: task.assignees.map(id => parseInt(id)),
        created_by: parseInt(user.id),
      });

      // Note: Attachments should be uploaded AFTER task creation using the Upload button
      // The file upload in task modal only works for existing tasks
      
      loadTasks(); // Reload tasks
      setIsCreatingTask(false);
      
      // Show message if user tried to add attachments to new task
      if (task.attachments.length > 0) {
        setErrorModal({
          isOpen: true,
          title: 'Task Created',
          message: `Task created successfully! Please note: Attachments can only be uploaded to existing tasks. Click on the task card and use the Upload button to add files.`,
        });
      }
    } catch (error: any) {
      console.error('Error creating task:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Creating Task',
        message: error.response?.data?.message || 'Failed to create task. Please try again.',
      });
    }
  };

  const handleUpdateTask = async (task: TaskType) => {
    try {
      await tasksApi.updateTask(parseInt(task.id), {
        title: task.title,
        description: task.description,
        deliverables: task.deliverables,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        labels: task.labels,
        attachments: task.attachments.map(a => ({
          id: a.id,
          filename: a.filename,
          url: '',
        })),
        assignees: task.assignees.map(id => parseInt(id)),
      });

      loadTasks(); // Reload tasks
    } catch (error: any) {
      console.error('Error updating task:', error);
      setErrorModal({
        isOpen: true,
        title: 'Error Updating Task',
        message: error.response?.data?.message || 'Failed to update task. Please try again.',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await tasksApi.deleteTask(parseInt(taskId));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          loadTasks(); // Reload tasks
          
          setErrorModal({
            isOpen: true,
            title: 'Success',
            message: 'Task deleted successfully.',
          });
        } catch (error: any) {
          console.error('Error deleting task:', error);
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          setErrorModal({
            isOpen: true,
            title: 'Error Deleting Task',
            message: error.response?.data?.message || 'Failed to delete task.',
          });
        }
      },
    });
  };

  const columns = [
    { id: 'backlog' as const, name: 'Backlog', color: '', bgColor: '#f3f4f6', textColor: '#374151', borderColor: '#e5e7eb' },
    { id: 'todo' as const, name: 'To Do', color: '', bgColor: '#dbeafe', textColor: '#1e40af', borderColor: '#93c5fd' },
    { id: 'inprogress' as const, name: 'In Progress', color: '', bgColor: '#fef3c7', textColor: '#92400e', borderColor: '#fcd34d' },
    { id: 'review' as const, name: 'Review', color: '', bgColor: '#fce7f3', textColor: '#9f1239', borderColor: '#f9a8d4' },
    { id: 'done' as const, name: 'Done', color: '', bgColor: '#d1fae5', textColor: '#065f46', borderColor: '#6ee7b7' }
  ];

  if (loading) {
    return (
      <PageLayout 
        members={[]} 
        tasks={[]} 
        title="Loading..."
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#076297' }} />
        </div>
      </PageLayout>
    );
  }

  if (error || !team || !project) {
    return (
      <PageLayout 
        members={[]} 
        tasks={[]} 
        title="Project Not Found"
      >
        <div className="text-center py-8">
          <p style={{ color: '#6b7280' }}>{error || 'Project not found.'}</p>
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
    { id: 'board', label: 'Board' },
    { id: 'members', label: 'Members' },
    { id: 'workload', label: 'Workload' },
    { id: 'progress', label: 'Progress' }
  ];

  // Calculate member workload from project members
  const projectMembers = project.members || [];
  const members = projectMembers.map(pm => ({
    id: pm.user_id.toString(),
    name: pm.name || 'Unknown',
    email: pm.user?.email || '',
    color: '#076297',
    initials: pm.name ? pm.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'
  }));

  const memberWorkload = projectMembers.map(projectMember => {
    const memberId = projectMember.user_id?.toString() || '';
    const assignedTasks = tasks.filter(task => task.assignees.includes(memberId));
    const completedTasks = assignedTasks.filter(task => task.status === 'done');
    const memberName = projectMember.name || 'Unknown';
    return {
      member: {
        id: memberId,
        name: memberName,
        email: '',
        color: '#076297',
        initials: memberName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      },
      totalTasks: assignedTasks.length,
      completedTasks: completedTasks.length,
      progress: assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0
    };
  });

  // Calculate overall progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <PageLayout 
      members={members} 
      tasks={tasks} 
      title={project.name}
      headerAction={
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/teams/${resolvedParams.teamId}`)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
            style={{ borderRadius: '7px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {team.name}
          </button>
        </div>
      }
    >
      {/* Project Overview */}
      <div 
        className="p-4 mb-6"
        style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '7px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
        }}
      >
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: project.color || team.color || '#073392', borderRadius: '7px' }}
          >
            <Calendar className="w-8 h-8" style={{ color: '#ffffff' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#1f2937' }}>{project.name}</h2>
            <p className="text-lg mb-4" style={{ color: '#6b7280' }}>{project.description || 'No description'}</p>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: project.color || team.color || '#073392' }} />
                <span style={{ color: '#4b5563' }}>{project.member_count || 0} members</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded text-xs font-medium" style={{ 
                  backgroundColor: project.status === 'active' ? '#D1FAE5' : 
                                   project.status === 'completed' ? '#DBEAFE' : 
                                   project.status === 'planning' ? '#FEF3C7' : '#F3F4F6',
                  color: project.status === 'active' ? '#065F46' : 
                         project.status === 'completed' ? '#1E40AF' : 
                         project.status === 'planning' ? '#92400E' : '#374151'
                }}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs Container */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        {activeTab === 'board' && (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>Project Board</h3>
            {loadingTasks ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#076297' }} />
              </div>
            ) : (
            <KanbanBoard 
              columns={columns}
              tasks={tasks} 
              members={members}
              projectId={parseInt(resolvedParams.projectId)}
              onTasksChange={(updatedTasks) => {
                // Find the changed task and update it
                const changedTask = updatedTasks.find((ut, i) => {
                  const oldTask = tasks[i];
                  return oldTask && (ut.status !== oldTask.status || JSON.stringify(ut) !== JSON.stringify(oldTask));
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
                  const response = await tasksApi.getTaskById(parseInt(taskId));
                  const backendTask = response.task;
                  
                  // Convert to frontend format with ALL fields
                  const fullTask: TaskType = {
                    id: backendTask.id.toString(),
                    title: backendTask.title,
                    description: backendTask.description || '',
                    deliverables: backendTask.deliverables || '',
                    status: backendTask.status as any,
                    priority: backendTask.priority as any,
                    dueDate: backendTask.due_date,
                    labels: backendTask.labels || [],
                    assignees: Array.isArray(backendTask.assignees) 
                      ? backendTask.assignees.map((a: any) => a.user_id.toString())
                      : [],
                    comments: backendTask.comments?.map((c: any) => ({
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
                  };
                  
                  return fullTask;
                } catch (error) {
                  console.error('Error loading full task:', error);
                  return null;
                }
              }}
              onCreateTask={(status) => {
                setIsCreatingTask(true);
                setCreatingTaskStatus(status);
              }}
            />
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Project Members ({projectMembers.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingMember(true)}
                  className="px-3 py-1.5 text-sm rounded-md text-white transition-colors flex items-center gap-1"
                  style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                >
                  <Users className="w-4 h-4" />
                  Add from Team
                </button>
                <button
                  onClick={() => {
                    setIsAddingExternalMember(true);
                    loadAllUsers();
                  }}
                  className="px-3 py-1.5 text-sm rounded-md border transition-colors flex items-center gap-1"
                  style={{ borderColor: '#076297', color: '#076297', borderRadius: '7px' }}
                >
                  <UserPlus className="w-4 h-4" />
                  Add External
                </button>
              </div>
            </div>

            {/* Add Members from Team Section */}
            {isAddingMember && team && team.members && (
              <div className="p-4 rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>
                  Select Team Members to Add to Project
                </h4>
                <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                  {team.members
                    .filter(teamMember => !projectMembers.some(pm => pm.user_id === teamMember.user_id))
                    .map((teamMember) => (
                      <label key={teamMember.user_id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer" style={{ borderRadius: '7px' }}>
                        <input
                          type="checkbox"
                          checked={selectedMembersToAdd.includes(teamMember.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembersToAdd([...selectedMembersToAdd, teamMember.user_id]);
                            } else {
                              setSelectedMembersToAdd(selectedMembersToAdd.filter(id => id !== teamMember.user_id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: project.color || team.color || '#073392' }}
                          >
                            {teamMember.name ? teamMember.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: '#374151' }}>{teamMember.name || 'Unknown'}</p>
                            {teamMember.position && (
                              <p className="text-xs" style={{ color: '#6b7280' }}>{teamMember.position}</p>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  {team.members.filter(teamMember => !projectMembers.some(pm => pm.user_id === teamMember.user_id)).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">All team members are already in this project</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setIsAddingMember(false);
                      setSelectedMembersToAdd([]);
                    }}
                    className="px-3 py-1.5 text-sm rounded-md border transition-colors"
                    style={{ borderColor: '#d1d5db', borderRadius: '7px', color: '#374151' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddMembersToProject}
                    disabled={selectedMembersToAdd.length === 0}
                    className="px-3 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                  >
                    Add Selected ({selectedMembersToAdd.length})
                  </button>
                </div>
              </div>
            )}

            {/* Add External Members Section */}
            {isAddingExternalMember && (
              <div className="p-4 rounded-lg border" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: '#374151' }}>
                  Add Users to Project
                </h4>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#076297' }} />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
                      {allUsers
                        .filter(user => !projectMembers.some(pm => pm.user_id === user.id))
                        .map((user) => (
                          <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer" style={{ borderRadius: '7px' }}>
                            <input
                              type="checkbox"
                              checked={selectedMembersToAdd.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembersToAdd([...selectedMembersToAdd, user.id]);
                                } else {
                                  setSelectedMembersToAdd(selectedMembersToAdd.filter(id => id !== user.id));
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
                                  style={{ backgroundColor: project.color || team?.color || '#073392' }}
                                >
                                  {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium" style={{ color: '#374151' }}>{user.name}</p>
                                <p className="text-xs" style={{ color: '#6b7280' }}>{user.email}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      {allUsers.filter(user => !projectMembers.some(pm => pm.user_id === user.id)).length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">All users are already in this project</p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setIsAddingExternalMember(false);
                          setSelectedMembersToAdd([]);
                        }}
                        className="px-3 py-1.5 text-sm rounded-md border transition-colors"
                        style={{ borderColor: '#d1d5db', borderRadius: '7px', color: '#374151' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddMembersToProject}
                        disabled={selectedMembersToAdd.length === 0}
                        className="px-3 py-1.5 text-sm rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                      >
                        Add Selected ({selectedMembersToAdd.length})
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Project Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projectMembers.map((projectMember) => {
                const memberId = projectMember.user_id?.toString() || '';
                const memberTasks = tasks.filter(task => task.assignees.includes(memberId));
                const completedCount = memberTasks.filter(task => task.status === 'done').length;
                const initials = projectMember.name ? projectMember.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA';
                
                return (
                  <div
                    key={projectMember.id}
                    className="p-4 relative"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderRadius: '7px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}
                  >
                    <button
                      onClick={() => handleRemoveProjectMember(projectMember.user_id, projectMember.name || 'this member')}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                      title="Remove from project"
                    >
                      <X className="w-4 h-4" style={{ color: '#dc2626' }} />
                    </button>
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                        style={{ backgroundColor: project.color || team.color || '#073392', color: '#ffffff' }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 pr-6">
                        <h4 className="font-semibold" style={{ color: '#1f2937' }}>{projectMember.name || 'Unknown'}</h4>
                        {projectMember.position && (
                          <p className="text-xs" style={{ color: '#6b7280' }}>{projectMember.position}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm" style={{ color: '#4b5563' }}>
                      <span>{memberTasks.length} tasks</span>
                      <span className="font-medium" style={{ color: '#16a34a' }}>{completedCount} completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {projectMembers.length === 0 && !isAddingMember && !isAddingExternalMember && (
              <p className="text-sm text-gray-500 text-center py-8">No members assigned to this project yet</p>
            )}
          </div>
        )}

        {activeTab === 'workload' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>Team Workload</h3>
            <div className="space-y-3">
              {memberWorkload.map(({ member, totalTasks, completedTasks, progress }) => (
                <div
                  key={member.id}
                  className="p-4"
                  style={{ 
                    backgroundColor: '#ffffff',
                    borderRadius: '7px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                        style={{ backgroundColor: member.color, color: '#ffffff' }}
                      >
                        {member.initials}
                      </div>
                      <div>
                        <h4 className="font-semibold" style={{ color: '#1f2937' }}>{member.name}</h4>
                        <p className="text-sm" style={{ color: '#6b7280' }}>{totalTasks} tasks assigned</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: '#4b5563' }}>{completedTasks}/{totalTasks} completed</p>
                      <p className="text-xs font-bold" style={{ color: member.color }}>{progress}%</p>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#e5e7eb' }}>
                    <div 
                      className="h-full transition-all duration-300"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: member.color
                      }}
                    />
                  </div>
                </div>
              ))}
              {memberWorkload.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No members assigned to this project yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#1f2937' }}>Overall Progress</h3>
              <div 
                className="p-6"
                style={{ 
                  backgroundColor: '#f0f8fc',
                  borderRadius: '7px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium" style={{ color: '#374151' }}>Project Completion</span>
                  <span className="text-2xl font-bold" style={{ color: project.color || team.color || '#073392' }}>{overallProgress}%</span>
                </div>
                <div className="w-full h-4 rounded-full overflow-hidden mb-4" style={{ backgroundColor: '#e5e7eb' }}>
                  <div 
                    className="h-full transition-all duration-300"
                    style={{ 
                      width: `${overallProgress}%`,
                      backgroundColor: project.color || team.color || '#073392'
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#1f2937' }}>{totalTasks}</p>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Total Tasks</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#16a34a' }}>{completedTasks}</p>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#ea580c' }}>{totalTasks - completedTasks}</p>
                    <p className="text-sm" style={{ color: '#6b7280' }}>Remaining</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3" style={{ color: '#1f2937' }}>Status Breakdown</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { label: 'Backlog', status: 'backlog', color: '#6b7280', icon: Clock },
                  { label: 'To Do', status: 'todo', color: '#3b82f6', icon: Clock },
                  { label: 'In Progress', status: 'inprogress', color: '#f59e0b', icon: Clock },
                  { label: 'In Review', status: 'review', color: '#ec4899', icon: User },
                  { label: 'Done', status: 'done', color: '#10b981', icon: CheckCircle }
                ].map(({ label, status, color, icon: Icon }) => {
                  const count = tasks.filter(task => task.status === status).length;
                  return (
                    <div
                      key={status}
                      className="p-4"
                      style={{ 
                        backgroundColor: '#ffffff',
                        borderRadius: '7px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" style={{ color }} />
                        <span className="text-sm font-medium" style={{ color: '#4b5563' }}>{label}</span>
                      </div>
                      <p className="text-3xl font-bold" style={{ color }}>{count}</p>
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
        task={isCreatingTask ? {
          id: '',
          title: '',
          description: '',
          deliverables: '',
          status: creatingTaskStatus as any,
          priority: 'medium' as const,
          dueDate: undefined,
          labels: [],
          assignees: [],
          comments: [],
          attachments: []
        } : null}
        members={members}
        mode="management"
        projectId={parseInt(resolvedParams.projectId)}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreatingTask(false);
          }
        }}
        onChange={(updatedTask: TaskType) => {
          if (updatedTask.id) {
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
    </PageLayout>
  );
}
