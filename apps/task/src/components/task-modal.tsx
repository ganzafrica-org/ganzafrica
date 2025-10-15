"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { X, Users, Edit2, Paperclip, Upload, Trash2, MessageSquare } from "lucide-react";
import { Task, TeamMember, Status, Priority } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { InputDialog } from "@/components/input-dialog";
import { Button } from "@/components/button";
import { MemberDropdown } from "@/components/member-dropdown";
import { taskTeamsApi, TaskTeam } from "@/lib/api/task-teams";

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
  const [teams, setTeams] = useState<TaskTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    setDraft(task);
    if (mode === "management" && open) {
      loadTeams();
      // Also refresh user info when modal opens
      if (typeof window !== 'undefined' && (window as any).refreshUserInfo) {
        (window as any).refreshUserInfo();
      }
    }
  }, [task, open, mode]);

  useEffect(() => {
    if (selectedTeamId) {
      loadTeamMembers(selectedTeamId);
    } else {
      setTeamMembers([]);
    }
  }, [selectedTeamId]);

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await taskTeamsApi.listTeams();
      setTeams(response.teams || []);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const loadTeamMembers = async (teamId: number) => {
    try {
      const response = await taskTeamsApi.getTeamById(teamId);
      const teamData = response.team;
      
      // Convert team members to TeamMember format
      const convertedMembers: TeamMember[] = (teamData.members || []).map((m: any) => ({
        id: m.user_id.toString(),
        name: m.name || 'Unknown',
        email: m.user?.email || '',
        color: '#076297',
        initials: m.name ? m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA'
      }));
      
      setTeamMembers(convertedMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    }
  };

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
              initials: 'U' + assigneeId.slice(0, 1),
            };
          }
        }
      });
      
      // Add commenters from task if they're not already in members
      draft.comments.forEach(comment => {
        if (!map[comment.userId]) {
          const taskUser = taskUsers?.get(comment.userId);
          if (taskUser) {
            map[comment.userId] = {
              id: taskUser.id,
              name: taskUser.name,
              email: taskUser.email || '',
              color: '#6366f1',
              initials: taskUser.name ? taskUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'NA',
            };
          } else {
            map[comment.userId] = {
              id: comment.userId,
              name: `User ${comment.userId}`,
              email: '',
              color: '#6366f1',
              initials: 'U' + comment.userId.slice(0, 1),
            };
          }
        }
      });
    }
    
    return map;
  }, [members, draft, userInfoVersion]);
  
  // Filter members based on selected team (only in management mode)
  const availableMembers = useMemo(() => {
    if (mode === "individual") {
      return members;
    }
    
    if (!selectedTeamId) {
      return [];
    }
    
    return teamMembers;
  }, [mode, selectedTeamId, teamMembers, members]);
  
  if (!open || !draft) return <></>;

  const update = (partial: Partial<Task>) => {
    const next = { ...draft, ...partial } as Task;
    setDraft(next);
  };

  const handleTeamChange = (teamId: string) => {
    const numericTeamId = teamId ? parseInt(teamId) : null;
    setSelectedTeamId(numericTeamId);
    // Clear assignees when team changes
    update({ teamId, assignees: [] });
  };

  const handleSave = async () => {
    if (draft && draft.title.trim()) {
      console.log('🔍 handleSave - draft.attachments:', draft.attachments);
      console.log('🔍 handleSave - draft.id:', draft.id);
      
      // If this is a new task (no ID), we need to upload any pending files first
      if (!draft.id && draft.attachments.length > 0) {
        // Check if there are any attachments without URLs (pending uploads)
        const pendingUploads = draft.attachments.filter(a => !a.url || a.url.trim() === '');
        
        if (pendingUploads.length > 0) {
          alert('Please wait for file uploads to complete before saving the task.');
          return;
        }
      }
      
      onChange(draft);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setDraft(task);
    onOpenChange(false);
  };

  const currentColumn = columns?.find(c => tasks && tasks[c.id]?.some((t: any) => t.id === draft.id));

  const handleRemoveAssignee = (assigneeId: string) => {
    update({ assignees: draft.assignees.filter(id => id !== assigneeId) });
  };

  const handleAddAssignee = (memberId: string) => {
    if (!draft.assignees.includes(memberId)) {
      update({ assignees: [...draft.assignees, memberId] });
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !draft.id) return;
    
    try {
      // Import tasksApi at the top of file
      const { tasksApi } = await import('@/lib/api/tasks');
      
      // Save comment to backend
      await tasksApi.addComment(parseInt(draft.id), commentText.trim());
      
      // Reload task to get updated comments
      const response = await tasksApi.getTaskById(parseInt(draft.id));
      const task = response.task;
      
      // Convert backend comments to frontend format
      const updatedComments = task.comments?.map((c: any) => ({
        id: c.id.toString(),
        userId: c.user_id.toString(),
        text: c.content,
        message: c.content,
        createdAt: c.created_at,
      })) || [];
      
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
    
    update({ comments: [...draft.comments, newComment] });
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
        
        await tasksApi.updateTask(parseInt(draft.id), {
          attachments: attachmentsToSave,
        });
        console.log('✅ Attachments saved to database');
        
        // After saving to database, reload the task to get the updated data
        try {
          const response = await tasksApi.getTaskById(parseInt(draft.id));
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
      onMouseDown={handleCancel}
    >
      <div 
        className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" 
        onMouseDown={e => e.stopPropagation()}
      >
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
              value={draft.title}
              onChange={e => update({ title: e.target.value })}
              className="text-2xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none w-full"
              placeholder="Task title..."
            />
            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
              <span>
                in <span className="font-medium">{currentColumn?.title || currentColumn?.name || draft.status.charAt(0).toUpperCase() + draft.status.slice(1)}</span>
              </span>
              {selectedTeamId && teams.length > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-medium" style={{ color: teams.find((t: TaskTeam) => t.id === selectedTeamId)?.color }}>
                      {teams.find((t: TaskTeam) => t.id === selectedTeamId)?.name}
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
              
              {/* Team Selection - Only for Management Mode */}
              {mode === "management" && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Users className="w-4 h-4" />
                    Assign Team
                  </label>
                  <select
                    value={selectedTeamId || ""}
                    onChange={(e) => handleTeamChange(e.target.value)}
                    className="w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                    disabled={loadingTeams}
                  >
                    <option value="">Select a team...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.member_count || 0} members)
                      </option>
                    ))}
                  </select>
                  {loadingTeams && (
                    <p className="text-xs text-gray-500 mt-1">Loading teams...</p>
                  )}
                </div>
              )}

              {/* Team Members Section - Always show for existing tasks, or when team is selected for new tasks */}
              {(mode === "individual" || (mode === "management" && (selectedTeamId || draft.id))) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Users className="w-4 h-4" />
                      {mode === "management" ? "Team Members" : "Assignees"}
                      {draft.assignees.length > 0 && (
                        <span className="text-xs font-normal text-gray-500">
                          ({draft.assignees.length} selected)
                        </span>
                      )}
                    </label>
                    {selectedTeamId && (
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
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.initials}
                            </div>
                            <span className="text-sm text-gray-700">{member.name}</span>
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
                  className="w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                  rows={4}
                  placeholder="List the activities to be done for this task..."
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
                  className="w-full p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition"
                  style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                  rows={4}
                  placeholder="Describe the expected deliverables for this task..."
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
                  {draft.attachments.length === 0 ? (
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
                    draft.attachments.map((attachment, index) => {
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
                                const fullUrl = fileUrl.startsWith('http') 
                                  ? fileUrl 
                                  : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}${fileUrl}`;
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
                              update({ attachments: draft.attachments.filter(a => a.id !== attachment.id) });
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
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <MessageSquare className="w-4 h-4" />
                  Comments ({draft.comments.length})
                </label>
                <div className="space-y-3">
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
                  
                  {/* Existing Comments */}
                  {draft.comments.length > 0 && (
                    <div className="space-y-3 pt-3" style={{ borderTop: '1px solid #e5e7eb' }}>
                      {draft.comments.map(comment => {
                        const commenter = memberById[comment.userId];
                        if (!commenter) return null;
                        
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full ${commenter.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                              {commenter.initials}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900">{commenter.name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 p-3" style={{ backgroundColor: '#f0f8fc', borderRadius: '7px' }}>{comment.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Completed</option>
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

              {/* Due Date */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Due Date</label>
                <input 
                  type="date" 
                  value={draft.dueDate ? new Date(draft.dueDate).toISOString().slice(0, 10) : ""}
                  onChange={e => update({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="w-full p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  style={{ borderRadius: '7px', border: '1px solid #e5e7eb' }}
                />
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
              {draft.id && (
                <div className="pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
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
              disabled={!draft.title.trim()}
              className="px-4 py-2 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: draft.title.trim() ? '#076297' : '#9ca3af',
                borderRadius: '7px'
              }}
              onMouseEnter={(e) => {
                if (draft.title.trim()) {
                  e.currentTarget.style.backgroundColor = '#054a73';
                }
              }}
              onMouseLeave={(e) => {
                if (draft.title.trim()) {
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

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={() => {
          onDelete(draft.id);
          onOpenChange(false);
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${draft.title}"? All associated data will be permanently removed.`}
        confirmText="Yes, Delete"
        variant="danger"
        icon={<Trash2 className="w-6 h-6" style={{ color: '#dc2626' }} />}
      />
    </div>
  );
}