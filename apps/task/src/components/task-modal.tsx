"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { X, Users, Edit2, Paperclip, Upload, Trash2, MessageSquare } from "lucide-react";
import { Task, TeamMember, Status, Priority } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InputDialog } from "@/components/input-dialog";
import { Button } from "@/components/button";
import { MemberDropdown } from "@/components/member-dropdown";
import { UserAvatar } from "@/components/user-avatar";
import { taskTeamsApi, TaskTeam } from "@/lib/api/task-teams";
import { taskApi } from "@/lib/api-client";
import { canEditTask } from "@/lib/auth-utils";

export function TaskModal({
  open,
  task,
  members,
  onOpenChange,
  onChange,
  onDelete,
  columns,
  tasks,
  mode = "individual",
  projectId,
  userInfoVersion,
}: {
  open: boolean;
  task: Task | null;
  members: TeamMember[];
  onOpenChange: (open: boolean) => void;
  onChange: (task: Task) => void;
  onDelete: (id: string) => void;
  columns?: any[];
  tasks?: any;
  mode?: "management" | "individual";
  projectId?: number;
  userInfoVersion?: number;
}): React.JSX.Element {
  const [draft, setDraft] = useState<Task | null>(task);
  const [commentText, setCommentText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [teams, setTeams] = useState<TaskTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [taskTeamProjects, setTaskTeamProjects] = useState<Array<{ id: number; team_id: number; name: string; color?: string }>>([]);
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  // Comment UX state
  const [showEditCommentDialog, setShowEditCommentDialog] = useState(false);
  const [editCommentInitial, setEditCommentInitial] = useState("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadFullTaskDetails = async (taskId: string) => {
    try {
      // Validate taskId is a valid number
      const numericId = parseInt(taskId);
      if (isNaN(numericId) || numericId <= 0) {
        console.error('Invalid task ID:', taskId);
        return;
      }
      
      // Use unrestricted endpoint for management mode, regular endpoint for individual mode
      const response = mode === "management" 
        ? await taskApi.getTaskByIdUnrestricted(numericId)
        : await taskApi.getTaskById(numericId);
        
      if (response.task) {
        // Normalize backend comments to frontend format
        const normalizedComments = (response.task.comments || []).map((c: any) => ({
          id: (c.id ?? c.comment_id ?? Math.random().toString(36).slice(2)).toString(),
          userId: (c.user_id ?? c.userId ?? c.user?.id)?.toString(),
          message: c.content ?? c.message ?? c.text ?? '',
          text: c.content ?? c.message ?? c.text ?? '',
          createdAt: c.created_at ?? c.createdAt ?? new Date().toISOString(),
        }));

        // Convert the API response to the expected format
        const fullTask: Task = {
          id: response.task.id.toString(),
          title: response.task.title,
          description: response.task.description || '',
          deliverables: response.task.deliverables || '',
          status: response.task.status as Status,
          priority: response.task.priority as Priority,
          dueDate: response.task.due_date ? new Date(response.task.due_date).toISOString() : undefined,
          labels: response.task.labels || [],
          assignees: response.task.assignees?.map((a: any) => a.user_id?.toString() || a.toString()) || [],
          teamId: undefined, // Will be determined from project if needed
          projectId: response.task.project_id,
          comments: normalizedComments,
          attachments: response.task.attachments || [],
          created_by: response.task.created_by,
          creator_role_id: response.task.creator_role_id,
          creator_role_name: response.task.creator_role_name
        };
        setDraft(fullTask);

        // If we already have team-project mapping, set selected team for header
        try {
          const mapped = taskTeamProjects.find(p => p.id === response.task.project_id);
          if (mapped) {
            setSelectedTeamId(mapped.team_id);
          }
        } catch {}
      }
    } catch (error) {
      console.error('Error loading full task details:', error);
      // Fallback to the original task if fetching fails
      setDraft(task);
    }
  };

  useEffect(() => {
    if (task && task.id && open) {
      // Validate that task.id is a valid number string before fetching
      const numericId = parseInt(task.id);
      if (!isNaN(numericId) && numericId > 0) {
        // If task has a valid ID, fetch full details to get comments and other data
        loadFullTaskDetails(task.id);
      } else {
        // For new tasks or invalid IDs, use the task as-is
        setDraft(task);
      }
    } else {
      // For new tasks or when modal is closed, use the task as-is
      setDraft(task);
    }
    
    if (open && !teamsLoaded) {
      loadTeams();
      // Load task-team projects for team->project mapping
      (async () => {
        try {
          const resp = await taskApi.getTaskTeamProjects();
          setTaskTeamProjects(resp.projects || []);
          // If task already has project_id, set selected team for header
          if (task?.projectId && resp.projects?.length) {
            const mapped = resp.projects.find((p: any) => p.id === task.projectId);
            if (mapped) setSelectedTeamId(mapped.team_id);
          }
        } catch (e) {
          console.error('Error loading task team projects:', e);
          setTaskTeamProjects([]);
        }
      })();
      // Also refresh user info when modal opens
      if (typeof window !== 'undefined' && (window as any).refreshUserInfo) {
        (window as any).refreshUserInfo();
      }
    } else if (!open) {
      // Reset teams loaded flag when modal closes
      setTeamsLoaded(false);
    }
  }, [task, open, teamsLoaded]);

  useEffect(() => {
    console.log('🔍 useEffect triggered - selectedTeamId:', selectedTeamId, 'selectedTeamIds:', selectedTeamIds);
    if (selectedTeamIds.length > 0) {
      // Load members from multiple teams
      console.log('🔍 Loading members from multiple teams:', selectedTeamIds);
      loadMembersFromMultipleTeams(selectedTeamIds);
    } else if (selectedTeamId) {
      // Load members from single team
      console.log('🔍 Loading members from single team:', selectedTeamId);
      loadTeamMembers(selectedTeamId);
    } else {
      console.log('🔍 No team selected, clearing members');
      setTeamMembers([]);
    }
  }, [selectedTeamId, selectedTeamIds]);

  const loadTeams = async () => {
    // Prevent multiple simultaneous calls
    if (loadingTeams) {
      return;
    }
    
    try {
      setLoadingTeams(true);
      
      // Get current user ID from localStorage
      const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('task_user') || '{}') : {};
      const currentUserId = currentUser?.id;
      
      // Try to load teams that the current user has access to
      let response;
      try {
        response = await taskTeamsApi.listTeams({
          user_id: currentUserId,
          status: 'active' // Only load active teams
        });
      } catch (userFilterError) {
        try {
          // Fallback: load all teams if user-specific filtering fails
          response = await taskTeamsApi.listTeams({
            status: 'active'
          });
        } catch (statusFilterError) {
          // Final fallback: load all teams without any filters
          response = await taskTeamsApi.listTeams();
        }
      }
      
      const loadedTeams = response.teams || [];
      
      // If no teams from API, use empty array
      const teamsToUse = loadedTeams.length > 0 ? loadedTeams : [];
      
      setTeams(teamsToUse);
      
      // Auto-select if only one team
      if (teamsToUse.length === 1) {
        const singleTeam = teamsToUse[0];
        setSelectedTeamId(singleTeam.id);
        setSelectedTeamIds([singleTeam.id]);
      } else if (teamsToUse.length > 1) {
        // If multiple teams, don't auto-select
        setSelectedTeamId(null);
        setSelectedTeamIds([]);
      }
      
      setTeamsLoaded(true);
    } catch (error) {
      console.error('Error loading teams:', error);
      setTeams([]);
      setTeamsLoaded(true); // Set to true even on error to prevent infinite retries
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadTeamMembers = async (teamId: number) => {
    try {
      console.log('🔍 loadTeamMembers called with teamId:', teamId, 'type:', typeof teamId);
      const response = await taskTeamsApi.getTeamById(teamId);
      const teamData = response.team;
      
      console.log('🔍 Team data received for teamId', teamId, ':', teamData);
      
      // Convert team members to TeamMember format
      const convertedMembers: TeamMember[] = (teamData.members || []).map((m: any) => {
        const member = {
          id: m.user_id.toString(),
          name: m.name || 'Unknown',
          email: m.user?.email || '',
          color: teamData.color || '#076297',
          initials: m.name ? m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA',
          teamId: teamId,
          teamName: teamData.name
        };
        console.log('🔍 Converting member:', m, 'to:', member);
        return member;
      });
      
      console.log('🔍 Processed team members:', convertedMembers);
      console.log('🔍 Setting teamMembers to:', convertedMembers);
      setTeamMembers(convertedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    }
  };

  const loadMembersFromMultipleTeams = async (teamIds: number[]) => {
    try {
      console.log('Loading members from multiple teams:', teamIds);
      const allMembers: TeamMember[] = [];
      
      // Load members from each selected team
      for (const teamId of teamIds) {
        try {
          const response = await taskTeamsApi.getTeamById(teamId);
          const teamData = response.team;
          
          // Convert team members to TeamMember format
          const convertedMembers: TeamMember[] = (teamData.members || []).map((m: any) => ({
            id: m.user_id.toString(),
            name: m.name || 'Unknown',
            email: m.user?.email || '',
            color: teamData.color || '#076297',
            initials: m.name ? m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA',
            teamId: teamId, // Add team ID to identify which team the member belongs to
            teamName: teamData.name // Add team name for display
          }));
          
          allMembers.push(...convertedMembers);
        } catch (error) {
          console.error(`Error loading members for team ${teamId}:`, error);
        }
      }
      
      console.log('All members loaded:', allMembers);
      console.log('🔍 Setting teamMembers to (multiple teams):', allMembers);
      setTeamMembers(allMembers);
    } catch (error) {
      console.error('Error loading members from multiple teams:', error);
      setTeamMembers([]);
    }
  };

  // Derive current selected team name/color for header display
  const currentTeamInfo = useMemo(() => {
    const byId = selectedTeamId ? teams.find((t) => t.id === selectedTeamId) : undefined;
    const name = byId?.name || draft?.team?.name || undefined;
    const color = byId?.color || draft?.team?.color || '#076297';
    return { name, color } as { name?: string; color: string };
  }, [selectedTeamId, teams, draft?.team]);

  const memberById = useMemo(() => {
    const map = Object.fromEntries(members.map(m => [m.id, m]));
    
    // Get task users from window if available (populated by loadTasks)
    const taskUsers = typeof window !== 'undefined' ? (window as any).taskUsers as Map<string, any> : new Map();
    
    
    
    // Add assignees from task if they're not already in members
    if (draft) {
      draft.assignees.forEach(assigneeId => {
        if (!map[assigneeId]) {
          // Try to get from taskUsers first
          const taskUser = taskUsers?.get(assigneeId);
          if (taskUser) {
            map[assigneeId] = {
              id: taskUser.id,
              name: taskUser.name,
              email: taskUser.email || '',
              color: '#076297',
              initials: taskUser.name ? taskUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA',
            };
          } else {
            // Create a placeholder member
            map[assigneeId] = {
              id: assigneeId,
              name: `User ${assigneeId}`,
              email: '',
              color: '#076297',
              initials: 'U' + assigneeId.toString().slice(0, 1),
            };
          }
        }
      });
      
      // Add commenters from task if they're not already in members
      if (draft.comments && Array.isArray(draft.comments)) {
        draft.comments.forEach(comment => {
          if (comment.userId && !map[comment.userId]) {
            const taskUser = taskUsers?.get(comment.userId);
            if (taskUser) {
              map[comment.userId] = {
                id: taskUser.id,
                name: taskUser.name,
                email: taskUser.email || '',
                color: '#6366f1',
                initials: taskUser.name ? taskUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA',
              };
            } else if (comment.userId) {
              map[comment.userId] = {
                id: comment.userId,
                name: `User ${comment.userId}`,
                email: '',
                color: '#6366f1',
                initials: 'U' + comment.userId.toString().slice(0, 1),
              };
            }
          }
        });
      }
    }
    
    return map;
  }, [members, draft, userInfoVersion]);
  
  // Filter members based on selected team
  const availableMembers = useMemo(() => {
    console.log('🔍 availableMembers calculation:', {
      mode,
      selectedTeamId,
      selectedTeamIds,
      teamMembersLength: teamMembers.length,
      membersLength: members.length
    });
    
    // If a team is selected, always show team members regardless of mode
    if (selectedTeamId || selectedTeamIds.length > 0) {
      console.log('🔍 Team selected, returning teamMembers:', teamMembers);
      console.log('🔍 Team members details:', teamMembers.map(m => ({ id: m.id, name: m.name, email: m.email })));
      return teamMembers;
    }
    
    // If no team selected, use general members (for individual mode)
    if (mode === "individual") {
      console.log('🔍 No team selected, returning general members:', members);
      return members;
    }
    
    // No team selected and not individual mode
    console.log('🔍 No team selected and not individual mode, returning empty array');
    return [];
  }, [mode, selectedTeamId, selectedTeamIds, teamMembers, members]);
  
  if (!open || !draft) return <></>;

  const update = (partial: Partial<Task>) => {
    if (!draft) return;
    const next = { ...draft, ...partial } as Task;
    setDraft(next);
  };

  const handleTeamChange = (teamId: string) => {
    console.log('🔍 handleTeamChange called with teamId:', teamId);
    const numericTeamId = teamId ? parseInt(teamId) : null;
    console.log('🔍 Converted to numericTeamId:', numericTeamId);
    console.log('🔍 Available teams:', teams.map(t => ({ id: t.id, name: t.name })));
    
    setSelectedTeamId(numericTeamId);
    // Clear assignees when team changes
    const teamObj = teams.find(t => t.id === numericTeamId);
    console.log('🔍 Found team object:', teamObj);
    
    // Map selected team to a project_id if available
    const mappedProject = numericTeamId
      ? taskTeamProjects.find(p => p.team_id === numericTeamId)
      : undefined;
    console.log('🔍 Mapped project:', mappedProject);
    
    update({ 
      teamId: teamId || undefined, 
      team: teamObj ? { id: String(teamObj.id), name: teamObj.name, color: teamObj.color || '#076297', memberIds: [] } : undefined,
      assignees: [],
      projectId: mappedProject ? mappedProject.id : draft?.projectId
    });
  };

  const handleMultipleTeamChange = (teamIds: number[]) => {
    setSelectedTeamIds(teamIds);
    // Set the first team as primary for project mapping
    const primaryTeamId = teamIds.length > 0 ? teamIds[0] : null;
    setSelectedTeamId(primaryTeamId || null);
    
    // Get all selected teams
    const selectedTeams = teamIds.map(id => teams.find(t => t.id === id)).filter(Boolean);
    
    // Clear assignees when teams change
    const primaryTeamObj = primaryTeamId ? teams.find(t => t.id === primaryTeamId) : null;
    // Map primary team to a project_id if available
    const mappedProject = primaryTeamId
      ? taskTeamProjects.find(p => p.team_id === primaryTeamId)
      : undefined;
    
    // Create team information for all selected teams
    const allTeamsInfo = selectedTeams.map(team => team ? ({
      id: String(team.id),
      name: team.name,
      color: team.color || '#076297',
      memberIds: []
    }) : null).filter(Boolean);
    
    update({ 
      teamId: primaryTeamId ? String(primaryTeamId) : undefined, 
      team: primaryTeamObj ? { id: String(primaryTeamObj.id), name: primaryTeamObj.name, color: primaryTeamObj.color || '#076297', memberIds: [] } : undefined,
      assignees: [],
      projectId: mappedProject ? mappedProject.id : draft?.projectId
    });
  };

  const handleSave = async () => {
    if (draft && draft.title.trim()) {
      console.log('🔍 handleSave - draft.attachments:', draft.attachments);
      console.log('🔍 handleSave - draft.id:', draft.id);
      
      // Require due date for task creation
      if (!draft.dueDate) {
        setToast({ type: 'error', message: 'Due date is required. Please select a due date for the task.' });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      // Validate due date is not in the past
      if (draft.dueDate) {
        const dueDate = new Date(draft.dueDate);
        const now = new Date();
        
        if (dueDate < now) {
          setToast({ type: 'error', message: 'Cannot create task with past due date. Please select today or a future date.' });
          setTimeout(() => setToast(null), 3000);
          return;
        }
      }
      
      // If this is a new task (no ID), we need to upload any pending files first
      if (!draft.id && (draft.attachments?.length || 0) > 0) {
        // Check if there are any attachments without URLs (pending uploads)
        const pendingUploads = (draft.attachments || []).filter(a => !a.url || a.url.trim() === '');
        
        if (pendingUploads.length > 0) {
          alert('Please wait for file uploads to complete before saving the task.');
          return;
        }
      }

      // If this is an existing task, save changes to the database
      if (draft.id) {
        try {
          const updateData = {
            title: draft.title,
            description: draft.description,
            deliverables: draft.deliverables,
            status: draft.status,
            priority: draft.priority,
            due_date: draft.dueDate ? new Date(draft.dueDate) : null,
            labels: draft.labels,
            attachments: draft.attachments,
            assignees: draft.assignees.map(id => parseInt(id)).filter(id => !isNaN(id)),
            project_id: draft.projectId
          };

          // Validate task ID before updating
          const numericId = parseInt(draft.id);
          if (isNaN(numericId) || numericId <= 0) {
            console.error('Cannot update task: Invalid task ID:', draft.id);
            setToast({ type: 'error', message: 'Invalid task ID' });
            return;
          }

          // Use the appropriate update function based on mode
          if (mode === "management") {
            await taskApi.updateTaskUnrestricted(numericId, updateData);
          } else {
            await taskApi.updateTask(numericId, updateData);
          }

          setToast({ type: 'success', message: 'Task updated successfully' });
          onChange(draft);
          onOpenChange(false);
        } catch (error) {
          console.error('Error updating task:', error);
          setToast({ type: 'error', message: 'Failed to update task' });
          setTimeout(() => setToast(null), 2500);
          return; // Don't close modal if save failed
        }
      } else {
        // For new tasks
        onChange(draft);
        onOpenChange(false);
      }
    }
  };

  const handleCancel = () => {
    setDraft(task);
    onOpenChange(false);
  };

  const currentColumn = columns?.find(c => tasks && tasks[c.id]?.some((t: any) => t.id === draft.id));

  const handleRemoveAssignee = (assigneeId: string) => {
    const newAssignees = draft.assignees.filter(id => id !== assigneeId);
    update({ 
      assignees: newAssignees,
      team: draft.team ? { ...draft.team, memberIds: newAssignees } : draft.team,
    });
  };

  const handleAddAssignee = (memberId: string) => {
    if (!draft.assignees.includes(memberId)) {
      const newAssignees = [...draft.assignees, memberId];
      update({ 
        assignees: newAssignees,
        team: draft.team ? { ...draft.team, memberIds: newAssignees } : draft.team,
      });
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !draft.id) return;
    
    // Validate task ID is a valid number
    const numericId = parseInt(draft.id);
    if (isNaN(numericId) || numericId <= 0) {
      console.error('Cannot post comment: Invalid task ID:', draft.id);
      return;
    }
    
    try {
      // Save comment to backend
      await taskApi.addTaskComment(numericId, commentText.trim());
      
      // Reload task to get updated comments
      const response = mode === "management" 
        ? await taskApi.getTaskByIdUnrestricted(numericId)
        : await taskApi.getTaskById(numericId);
      const task = response.task;
      
      // Normalize backend comments to frontend format
      const updatedComments = (task.comments || []).map((c: any) => ({
        id: (c.id ?? c.comment_id ?? Math.random().toString(36).slice(2)).toString(),
        userId: (c.user_id ?? c.userId ?? c.user?.id)?.toString(),
        message: c.content ?? c.message ?? c.text ?? '',
        text: c.content ?? c.message ?? c.text ?? '',
        createdAt: c.created_at ?? c.createdAt ?? new Date().toISOString(),
      }));
      
      update({ comments: updatedComments });
      setCommentText("");
    } catch (error) {
      console.error('Error posting comment:', error);
      // Fallback to local update if API fails
    const newComment = {
      id: Math.random().toString(36).slice(2),
      userId: draft.assignees[0] || members[0]?.id || "me",
      message: commentText.trim(),
        text: commentText.trim(),
      createdAt: new Date().toISOString()
    };
    
    update({ comments: [...(draft.comments || []), newComment] });
    setCommentText("");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Upload files to backend FIRST (same as portal does)
      const apiClient = (await import('@/lib/api-client')).default;
      const uploadedFiles = [];

      for (const file of Array.from(files)) {
        console.log('Uploading file:', file.name);
        
        const formData = new FormData();
        formData.append('file', file);

        // Upload to backend (same endpoint as portal uses)
        const response = await apiClient.post('/uploads/file', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Upload response:', response.data);

        if (response.data && response.data.success && response.data.file?.url) {
          console.log('File uploaded successfully with URL:', response.data.file.url);
          uploadedFiles.push({
      id: Math.random().toString(36).slice(2),
      filename: file.name,
            url: response.data.file.url, // Real URL from backend!
      sizeKB: Math.round(file.size / 1024),
            uploadedAt: new Date().toISOString(),
          });
        } else {
          console.error('Upload failed or no URL in response:', response.data);
          alert(`Failed to upload ${file.name}. Response: ${JSON.stringify(response.data)}`);
        }
      }

      console.log('All uploaded files:', uploadedFiles);
      console.log('Current draft.attachments:', draft.attachments);

      // Add uploaded files to attachments
      const newAttachments = [...draft.attachments, ...uploadedFiles];
      console.log('New attachments array (combined):', newAttachments);
      
      // Only keep attachments that have URLs (filter out old attachments without URLs)
      const attachmentsWithUrls = newAttachments.filter(a => a.url && a.url.trim() !== '');
      console.log('Attachments with URLs (filtered):', attachmentsWithUrls);
      
      // Update local state with only attachments that have URLs
      console.log('🔍 Updating local state with attachments:', attachmentsWithUrls);
      update({ attachments: attachmentsWithUrls });

      // If task exists, also save to database immediately
      if (draft.id) {
        const { tasksApi } = await import('@/lib/api/tasks');
        
        const attachmentsToSave = attachmentsWithUrls.map(a => ({
          id: a.id,
          filename: a.filename,
          url: a.url,
        }));
        
        console.log('Attachments to save (filtered for URLs):', attachmentsToSave);
        console.log('Each attachment URL:', attachmentsToSave.map(a => ({ filename: a.filename, url: a.url })));
        
        // Validate task ID before updating
        const numericId = parseInt(draft.id);
        if (isNaN(numericId) || numericId <= 0) {
          console.error('Cannot save attachments: Invalid task ID:', draft.id);
          return;
        }

        // Use appropriate update method based on mode
        if (mode === "management") {
          await taskApi.updateTaskUnrestricted(numericId, {
            attachments: attachmentsToSave,
          });
        } else {
          await taskApi.updateTask(numericId, {
            attachments: attachmentsToSave,
          });
        }
        console.log('✅ Attachments saved to database');
        
        // After saving to database, reload the task to get the updated data
        try {
          const response = mode === "management" 
            ? await taskApi.getTaskByIdUnrestricted(numericId)
            : await taskApi.getTaskById(numericId);
          const updatedTask = response.task;
          
          // Update the draft with the fresh data from the database
          update({
            attachments: (updatedTask.attachments || []).map((a: any) => ({
              id: a.id,
              filename: a.filename,
              url: a.url,
              sizeKB: 0,
              uploadedAt: new Date().toISOString(),
            }))
          });
          console.log('✅ Task data reloaded from database');
        } catch (error) {
          console.error('Error reloading task data:', error);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again. Check console for details.');
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
      onClick={handleCancel}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        {/* Inline toast */}
        {toast && (
          <div className="absolute top-4 right-4 px-3 py-2 text-sm rounded-md shadow" style={{ backgroundColor: toast.type === 'success' ? '#DCFCE7' : '#FEE2E2', color: toast.type === 'success' ? '#065F46' : '#991B1B' }}>
            {toast.message}
          </div>
        )}
        {/* Modal Header */}
        <div 
          className="p-6 flex items-center justify-between"
          style={{ 
            backgroundColor: '#f0f8fc'
          }}
        >
          <div className="flex-1">
            <input 
              type="text" 
              value={draft?.title || ''}
              onChange={e => update({ title: e.target.value })}
              className="text-2xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none w-full"
              placeholder="Task title..."
            />
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              <span>
                in <span className="font-medium">{currentColumn?.title || currentColumn?.name || (draft?.status ? draft.status.charAt(0).toUpperCase() + draft.status.slice(1) : 'To Do')}</span>
              </span>
              {currentTeamInfo.name && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium" style={{ color: currentTeamInfo.color }}>
                      {currentTeamInfo.name}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
          <button 
            onClick={handleCancel} 
            className="p-2 hover:bg-white rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content - Left Side */}
            <div className="col-span-2 space-y-6">
              
              {/* Team Selection - Available for all users */}
              {!loadingTeams && teams.length > 0 && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Users className="w-4 h-4" />
                    Select Team
                  </label>
                  
                  <select
                    value={selectedTeamId || ""}
                    onChange={(e) => handleTeamChange(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    onFocus={(e) => e.stopPropagation()}
                  >
                    <option value="">Choose a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.member_count || 0} members)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Team Members Section - Show when team is selected or for existing tasks */}
              {(selectedTeamId || draft.id) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Users className="w-4 h-4" />
                    {selectedTeamId ? (
                      `Team Members - ${teams.find(t => t.id === selectedTeamId)?.name}`
                    ) : (
                      "Assignees"
                    )}
                    {draft.assignees.length > 0 && (
                      <span className="text-xs font-normal text-gray-500">
                        ({draft.assignees.length} selected)
                      </span>
                    )}
                  </label>
                    {(selectedTeamId || selectedTeamIds.length > 0) && availableMembers.length > 0 && (
                    <>
                      {console.log('🔍 Rendering MemberDropdown with:', {
                        selectedTeamId,
                        selectedTeamIds,
                        availableMembersLength: availableMembers.length,
                        filteredMembers: availableMembers.filter(m => !draft.assignees.includes(m.id)),
                        draftAssignees: draft.assignees
                      })}
                      <MemberDropdown
                        members={availableMembers.filter(m => !draft.assignees.includes(m.id))}
                        onSelect={handleAddAssignee}
                        selectedMembers={draft.assignees}
                        align="right"
                      />
                    </>
                    )}
                    {!selectedTeamId && selectedTeamIds.length === 0 && mode === "individual" && (
                    <MemberDropdown
                      members={availableMembers.filter(m => !draft.assignees.includes(m.id))}
                      onSelect={handleAddAssignee}
                      selectedMembers={draft.assignees}
                      align="right"
                    />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1">
                    {draft.assignees.length === 0 ? (
                      <p className="text-sm text-gray-500">No assignees yet</p>
                    ) : (
                      draft.assignees.map(assigneeId => {
                        const member = memberById[assigneeId];
                        if (!member) return null;
                        return (
                          <div 
                            key={assigneeId} 
                            className="flex items-center gap-2 px-3 py-2 group transition"
                            style={{ backgroundColor: '#f0f8fc', borderRadius: '7px' }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f2f9')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f8fc')}
                          >
                            <UserAvatar 
                              userId={parseInt(assigneeId)} 
                              size="md"
                              className="w-8 h-8"
                            />
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-700">{member.name}</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveAssignee(assigneeId)}
                              className="opacity-0 group-hover:opacity-100 ml-1 hover:bg-gray-200 rounded p-0.5 transition"
                            >
                              <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Activities Section */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Edit2 className="w-4 h-4" />
                  Activities
                </label>
                <textarea 
                  value={draft.description || ""}
                  onChange={e => update({ description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  rows={4}
                  placeholder="List the activities to be done for this task..."
                  onFocus={(e) => e.stopPropagation()}
                />
              </div>

              {/* Deliverables Section */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Edit2 className="w-4 h-4" />
                  Deliverables
                </label>
                <textarea 
                  value={draft.deliverables || ""}
                  onChange={e => update({ deliverables: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  rows={4}
                  placeholder="Describe the expected deliverables for this task..."
                  onFocus={(e) => e.stopPropagation()}
                />
              </div>

              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Paperclip className="w-4 h-4" />
                    Attachments
                  </label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 transition"
                    style={{ backgroundColor: '#f0f8fc', borderRadius: '7px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f2f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f8fc')}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="*/*"
                  />
                </div>
                <div className="space-y-2">
                  {(draft.attachments?.length || 0) === 0 ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-center py-4 cursor-pointer transition"
                      style={{ 
                        border: '2px dashed #e5e7eb', 
                        borderRadius: '7px' 
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Paperclip className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                      <p className="text-sm text-gray-500">No attachments yet</p>
                      <p className="text-xs text-gray-400 mt-1">Click to upload or drag files here</p>
                    </div>
                  ) : (
                    (draft.attachments || []).map((attachment, index) => {
                      const colors = [
                        { bg: '#dbeafe', icon: '#2563eb' },
                        { bg: '#dcfce7', icon: '#16a34a' },
                        { bg: '#f3e8ff', icon: '#9333ea' },
                        { bg: '#fed7aa', icon: '#ea580c' },
                      ];
                      const color = colors[index % colors.length];
                      
                      return (
                        <div 
                          key={attachment.id} 
                          className="flex items-center justify-between p-3 transition group"
                          style={{ backgroundColor: '#f0f8fc', borderRadius: '7px' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f2f9')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f8fc')}
                        >
                          <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer"
                            onClick={() => {
                              // Get the file URL - could be relative or absolute
                              const fileUrl = (attachment as any).url;
                              console.log('🔍 Attachment clicked:', attachment);
                              console.log('🔍 Attachment URL:', fileUrl);
                              console.log('🔍 Attachment type:', typeof fileUrl);
                              if (fileUrl) {
                                // If it's a relative URL, prepend the API base URL
                                const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';
                                const fullUrl = fileUrl.startsWith('http') 
                                  ? fileUrl 
                                  : `${apiBaseUrl}${fileUrl}`;
                                if (typeof window !== 'undefined') {
                                  window.open(fullUrl, '_blank');
                                }
                              } else {
                                alert('File URL not available. This file may not have been uploaded yet.');
                              }
                            }}
                          >
                            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ backgroundColor: color?.bg || '#dbeafe' }}>
                              <Paperclip className="w-5 h-5" style={{ color: color?.icon || '#2563eb' }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 hover:underline">{attachment.filename}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.sizeKB / 1000).toFixed(1)} MB • Added {new Date(attachment.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              update({ attachments: (draft.attachments || []).filter(a => a.id !== attachment.id) });
                            }}
                            className="p-2 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition"
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700"
                  >
                  <MessageSquare className="w-4 h-4" />
                    {showComments ? 'Hide comments' : 'View comments'} ({draft.comments?.length || 0})
                  </button>
                </div>

                {/* Existing Comments (collapsible) */}
                {(draft.comments?.length || 0) > 0 && showComments && (
                  <div className="space-y-3 mb-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                    {(draft.comments || []).map(comment => {
                      const commenter = memberById[comment.userId];
                      if (!commenter) return null;
                      
                      return (
                        <div key={comment.id} className="flex gap-3 pt-3 group">
                          <UserAvatar 
                            userId={parseInt(comment.userId)} 
                            size="md"
                            className="w-8 h-8 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-900">{commenter.name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {/* Inline actions for own comments - optimistic UI, permission enforced server-side */}
                              {(() => {
                                const currentUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('task_user') || '{}') : {};
                                const isOwner = currentUser?.id && currentUser.id.toString() === comment.userId?.toString();
                                if (!isOwner) return null;
                                return (
                                  <span className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                    <button
                                      className="text-xs text-blue-600 hover:underline"
                                      onClick={() => {
                                        setEditCommentId(comment.id as string);
                                        setEditCommentInitial(comment.message || "");
                                        setShowEditCommentDialog(true);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="text-xs text-red-600 hover:underline"
                                      onClick={() => setDeleteCommentId(comment.id as string)}
                                    >
                                      Delete
                                    </button>
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-sm text-gray-700 p-3" style={{ backgroundColor: '#f0f8fc', borderRadius: '7px' }}>{comment.message}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                  {/* Add Comment */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      ME
                    </div>
                    <div className="flex-1">
                      <textarea 
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        className="w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                        style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                        rows={2}
                        placeholder="Write a comment..."
                      />
                      <div className="mt-2">
                        <Button
                          onClick={handlePostComment}
                          disabled={!commentText.trim()}
                          variant="primary"
                          size="md"
                        >
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="space-y-4">
              
              {/* Status Dropdown */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
                <select 
                  value={draft.status}
                  onChange={e => update({ status: e.target.value as Status })}
                  className="w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Priority Dropdown */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Priority</label>
                <select 
                  value={draft.priority}
                  onChange={e => update({ priority: e.target.value as Priority })}
                  className="w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                  style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>

              {/* Due Date and Time */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Due Date & Time</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    value={draft.dueDate ? new Date(draft.dueDate).toISOString().slice(0, 10) : ""}
                    onChange={e => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        const currentTime = draft.dueDate ? new Date(draft.dueDate) : new Date();
                        const newDateTime = new Date(dateValue + 'T' + currentTime.toTimeString().slice(0, 5));
                        update({ dueDate: newDateTime.toISOString() });
                      } else {
                        update({ dueDate: undefined });
                      }
                    }}
                    className="flex-1 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                  />
                  <input 
                    type="time" 
                    value={draft.dueDate ? new Date(draft.dueDate).toTimeString().slice(0, 5) : "17:00"}
                    onChange={e => {
                      const timeValue = e.target.value;
                      if (timeValue && draft.dueDate) {
                        const currentDate = new Date(draft.dueDate);
                        const newDateTime = new Date(currentDate.toISOString().slice(0, 10) + 'T' + timeValue);
                        update({ dueDate: newDateTime.toISOString() });
                      } else if (timeValue) {
                        // If no date is set, set today's date with the selected time
                        const today = new Date().toISOString().slice(0, 10);
                        const newDateTime = new Date(today + 'T' + timeValue);
                        update({ dueDate: newDateTime.toISOString() });
                      }
                    }}
                    className="flex-1 p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {draft.dueDate ? `Due: ${new Date(draft.dueDate).toLocaleString()}` : 'No due date set'}
                </p>
                {draft.dueDate && new Date(draft.dueDate) < new Date() && (
                  <p className="text-xs text-red-500 mt-1">
                    ⚠️ You cannot assign a past date. Please select today or a future date.
                  </p>
                )}
              </div>

              {/* Labels */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Labels</label>
                <div className="flex flex-wrap gap-2">
                   {draft.labels && draft.labels.length > 0 ? (
                     draft.labels.map((label, idx) => (
                       <span 
                         key={label.id || idx} 
                         className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium flex items-center gap-1 hover:bg-indigo-200 transition"
                       >
                         {label.name}
                         <button
                           onClick={() => {
                             const newLabels = draft.labels?.filter((_, i) => i !== idx) || [];
                             update({ labels: newLabels });
                           }}
                         >
                           <X className="w-3 h-3 cursor-pointer hover:text-indigo-900" />
                         </button>
                       </span>
                     ))
                   ) : (
                     <p className="text-xs text-gray-500">No labels yet</p>
                   )}
                  <button 
                    onClick={() => setShowAddLabel(true)}
                    className="px-3 py-1 text-xs font-medium transition"
                    style={{ backgroundColor: '#f0f8fc', color: '#076297', borderRadius: '9999px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e6f2f9';
                      e.currentTarget.style.color = '#054a73';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f8fc';
                      e.currentTarget.style.color = '#076297';
                    }}
                  >
                    + Add Label
                  </button>
                </div>
              </div>

              {/* Delete Button - Only show when editing existing task */}
              {draft?.id && draft?.created_by && canEditTask(draft.created_by) && (
                <div>
                  <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-2 font-medium text-sm flex items-center justify-center gap-2 transition"
                    style={{ backgroundColor: '#fef2f2', borderRadius: '7px', color: '#dc2626' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                      e.currentTarget.style.color = '#dc2626';
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer with Save/Cancel */}
          <div 
            className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3"
            style={{ borderRadius: '0 0 7px 7px' }}
          >
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
              style={{ borderRadius: '7px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!draft.title.trim() || !draft.dueDate}
              className="px-4 py-2 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: (draft.title.trim() && draft.dueDate) ? '#076297' : '#9ca3af',
                borderRadius: '7px'
              }}
              onMouseEnter={(e) => {
                if (draft.title.trim() && draft.dueDate) {
                  e.currentTarget.style.backgroundColor = '#054a73';
                }
              }}
              onMouseLeave={(e) => {
                if (draft.title.trim() && draft.dueDate) {
                  e.currentTarget.style.backgroundColor = '#076297';
                }
              }}
            >
              Save Task
            </button>
          </div>
        </div>
      </div>

      <InputDialog
        open={showAddLabel}
        onOpenChange={setShowAddLabel}
        onSubmit={(labelName) => {
          const currentLabels = draft.labels || [];
          const newLabel = {
            id: Math.random().toString(36).slice(2),
            name: labelName,
            color: "bg-indigo-100 text-indigo-700"
          };
          update({ labels: [...currentLabels, newLabel] });
        }}
        title="Add Label"
        label="Label Name"
        placeholder="e.g., Bug, Feature, Documentation"
        submitText="Add Label"
      />

      {/* Edit Comment Dialog */}
      <InputDialog
        open={showEditCommentDialog}
        onOpenChange={(o) => {
          setShowEditCommentDialog(o);
          if (!o) {
            setEditCommentId(null);
            setEditCommentInitial("");
          }
        }}
        onSubmit={async (value) => {
          if (!editCommentId || !draft?.id) return;
          
          // Validate task and comment IDs
          const taskNumericId = parseInt(draft.id as string);
          const commentNumericId = parseInt(editCommentId as string);
          if (isNaN(taskNumericId) || taskNumericId <= 0 || isNaN(commentNumericId) || commentNumericId <= 0) {
            console.error('Cannot update comment: Invalid IDs', { taskId: draft.id, commentId: editCommentId });
            setToast({ type: 'error', message: 'Invalid task or comment ID' });
            return;
          }
          
          try {
            await taskApi.updateTaskComment(taskNumericId, commentNumericId, value);
            const resp = mode === 'management' ? await taskApi.getTaskByIdUnrestricted(taskNumericId) : await taskApi.getTaskById(taskNumericId);
            const updated = (resp.task.comments || []).map((c: any) => ({
              id: (c.id ?? c.comment_id).toString(),
              userId: (c.user_id ?? c.user?.id).toString(),
              message: c.content,
              text: c.content,
              createdAt: c.created_at,
            }));
            update({ comments: updated });
            setToast({ type: 'success', message: 'Comment updated' });
          } catch (e) {
            setToast({ type: 'error', message: 'Failed to update comment' });
          } finally {
            setShowEditCommentDialog(false);
            setEditCommentId(null);
            setEditCommentInitial("");
            setTimeout(() => setToast(null), 2500);
          }
        }}
        title="Edit Comment"
        label="Comment"
        placeholder="Update your comment"
        submitText="Save"
        defaultValue={editCommentInitial}
      />

      {/* Delete Comment Confirm */}
      <ConfirmDialog
        open={!!deleteCommentId}
        onOpenChange={(o) => !o && setDeleteCommentId(null)}
        onConfirm={async () => {
          if (!deleteCommentId || !draft?.id) return;
          
          // Validate task and comment IDs
          const taskNumericId = parseInt(draft.id as string);
          const commentNumericId = parseInt(deleteCommentId as string);
          if (isNaN(taskNumericId) || taskNumericId <= 0 || isNaN(commentNumericId) || commentNumericId <= 0) {
            console.error('Cannot delete comment: Invalid IDs', { taskId: draft.id, commentId: deleteCommentId });
            setToast({ type: 'error', message: 'Invalid task or comment ID' });
            return;
          }
          
          try {
            await taskApi.deleteTaskComment(taskNumericId, commentNumericId);
            update({ comments: (draft.comments || []).filter(c => c.id !== deleteCommentId) });
            setToast({ type: 'success', message: 'Comment deleted' });
          } catch (e) {
            setToast({ type: 'error', message: 'Failed to delete comment' });
          } finally {
            setDeleteCommentId(null);
            setTimeout(() => setToast(null), 2500);
          }
        }}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Yes, Delete"
        variant="danger"
      />

      {/* Delete Task Confirm */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={async () => {
          if (!draft?.id) return;
          
          // Validate task ID
          const numericId = parseInt(draft.id);
          if (isNaN(numericId) || numericId <= 0) {
            console.error('Cannot delete task: Invalid task ID:', draft.id);
            setToast({ type: 'error', message: 'Invalid task ID' });
            return;
          }
          
          try {
            await taskApi.deleteTask(numericId);
            onDelete(draft.id);
            onOpenChange(false);
            setToast({ type: 'success', message: 'Task deleted successfully' });
          } catch (error) {
            console.error('Error deleting task:', error);
            setToast({ type: 'error', message: 'Failed to delete task' });
          } finally {
            setShowDeleteConfirm(false);
            setTimeout(() => setToast(null), 2500);
          }
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${draft?.title}"? All associated data will be permanently removed.`}
        confirmText="Yes, Delete"
        variant="danger"
        icon={<Trash2 className="w-6 h-6" style={{ color: '#dc2626' }} />}
      />

    </div>
  );
}