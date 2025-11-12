'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { SidebarProvider, useSidebar } from '@/components/sidebar-provider';
import { Navbar } from '@/components/navbar';
import { PageLayout } from '@/components/page-layout';
import { DateFilter } from '@/components/date-filter';
import { Task, TeamMember } from '@/lib/types';
import { CheckCircle, FileText, Download, Eye, Calendar, User as UserIcon, X, Upload, FolderOpen, Users, Folder, ChevronRight, Filter, Plus, FileIcon, Archive, Loader2, Briefcase, ArrowLeft } from 'lucide-react';
import { taskTeamsApi, TaskTeam } from '@/lib/api/task-teams';
import { usersApi, User } from '@/lib/api/users';
import apiClient from '@/lib/api-client';

// Members will be loaded from database - no mock data

// Utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getFileIcon = (fileType: string): string => {
  const iconMap: { [key: string]: string } = {
    'pdf': '📄',
    'doc': '📝',
    'docx': '📝',
    'xls': '📊',
    'xlsx': '📊',
    'ppt': '📋',
    'pptx': '📋',
    'txt': '📄',
    'zip': '📦',
    'rar': '📦',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'png': '🖼️',
    'gif': '🖼️'
  };
  return iconMap[fileType.toLowerCase()] || '📄';
};

function ReportsContent() {
  const { collapsed, toggleCollapsed } = useSidebar();
  const [selectedTeam, setSelectedTeam] = useState<TaskTeam | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState<{start: string, end: string}>({start: '', end: ''});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // API data states
  const [teams, setTeams] = useState<TaskTeam[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState({
    teams: false,
    projects: false,
    files: false,
    upload: false,
    members: false
  });
  const [error, setError] = useState<string | null>(null);

  // API functions
  const fetchTeams = async () => {
    try {
      setLoading(prev => ({ ...prev, teams: true }));
      setError(null);
      const response = await taskTeamsApi.listTeams();
      setTeams(response.teams || []);
    } catch (err) {
      setError('Failed to fetch teams');
      console.error('Error fetching teams:', err);
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  };

  const fetchProjects = async (teamId: number) => {
    try {
      setLoading(prev => ({ ...prev, projects: true }));
      setError(null);
      const response = await taskTeamsApi.getTeamById(teamId);
      const projects = response.team?.projects || [];
      
      // Calculate file counts for each project by fetching tasks
      const projectsWithFileCounts = await Promise.all(
        projects.map(async (project: any) => {
          try {
            const tasksResponse = await apiClient.get(`/tasks/project/${project.id}`);
            const tasks = tasksResponse.data.tasks || [];
            
            // Count attachments from all tasks
            let fileCount = 0;
            for (const task of tasks) {
              if (task.attachments && Array.isArray(task.attachments)) {
                fileCount += task.attachments.length;
              }
            }
            
            return {
              ...project,
              file_count: fileCount
            };
          } catch (err) {
            console.error(`Error fetching tasks for project ${project.id}:`, err);
            return {
              ...project,
              file_count: 0
            };
          }
        })
      );
      
      setProjects(projectsWithFileCounts);
    } catch (err) {
      setError('Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const fetchFiles = async (projectId: number) => {
    try {
      setLoading(prev => ({ ...prev, files: true }));
      setError(null);
      // For now, we'll use mock files since we need to implement file fetching
      // This should be replaced with actual file fetching API
      setFiles([]);
    } catch (err) {
      setError('Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  // Load members from database
  const fetchMembers = async () => {
    try {
      setLoading(prev => ({ ...prev, members: true }));
      const usersResponse = await usersApi.listUsers({ limit: 100, is_active: true });
      const users = usersResponse.users || [];
      
      // Transform users to TeamMember format
      const teamMembers: TeamMember[] = users.map((user: User) => {
        const initials = user.name 
          ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : 'U' + user.id.toString().slice(0, 1);
        
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
      
      setMembers(teamMembers);
    } catch (err) {
      console.error('Error fetching members:', err);
      setMembers([]);
    } finally {
      setLoading(prev => ({ ...prev, members: false }));
    }
  };

  // Load initial data
  useEffect(() => {
    fetchTeams();
    fetchMembers();
  }, []);

  // Load projects when team is selected
  useEffect(() => {
    if (selectedTeam) {
      fetchProjects(selectedTeam.id);
    } else {
      setProjects([]);
    }
  }, [selectedTeam]);

  // Load files when project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchFiles(selectedProject.id);
    } else {
      setFiles([]);
    }
  }, [selectedProject]);

  // Filter data based on current selections and filters
  const filteredTeams = useMemo(() => {
    return teams;
  }, [teams]);

  const filteredProjects = useMemo(() => {
    return projects;
  }, [projects]);

  const filteredFiles = useMemo(() => {
    return files;
  }, [files]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (uploadFile && selectedProject) {
      try {
        setLoading(prev => ({ ...prev, upload: true }));
        setError(null);
        
        // For now, we'll show a message since we need to select a specific task to upload to
        // In a real implementation, you might want to create a task first or select an existing one
        console.log('File upload would require selecting a specific task:', uploadFile.name);
        
        setShowUploadModal(false);
        setUploadFile(null);
        
        // Show a message to the user
        setError('Please select a specific task to upload files to. Files are uploaded to tasks, not directly to projects.');
      } catch (err) {
        setError('Failed to upload file');
        console.error('Error uploading file:', err);
      } finally {
        setLoading(prev => ({ ...prev, upload: false }));
      }
    }
  };

  const handleFileDownload = async (file: any) => {
    try {
      // For task attachments, we can directly use the URL
      if (file.file_url) {
        const a = document.createElement('a');
        a.href = file.file_url;
        a.download = file.original_filename || file.filename;
        a.target = '_blank'; // Open in new tab for S3 URLs
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        console.error('No file URL available for download');
        setError('File URL not available');
      }
    } catch (err) {
      setError('Failed to download file');
      console.error('Error downloading file:', err);
    }
  };

  const handleViewFiles = async (project: any) => {
    try {
      setSelectedProject(project);
      setLoading(prev => ({ ...prev, files: true }));
      setError(null);
      
      // Use the new role-filtered files API
      const response = await apiClient.get(`/tasks/project/${project.id}/files`);
      const files = response.data.files || [];
      
      setFiles(files);
      setShowFilesModal(true);
    } catch (err) {
      setError('Failed to fetch files');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(prev => ({ ...prev, files: false }));
    }
  };

  return (
    <PageLayout 
      members={members} 
      tasks={[]} 
      title="Reports"
    >
      {/* Header with Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DateFilter
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                customDateRange={customDateRange}
                setCustomDateRange={setCustomDateRange}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            
            {selectedProject && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <button
            onClick={() => {
              setSelectedTeam(null);
              setSelectedProject(null);
            }}
            className="hover:text-blue-600 transition-colors"
          >
            All Teams
          </button>
          
          {selectedTeam && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button
                onClick={() => setSelectedProject(null)}
                className="hover:text-blue-600 transition-colors"
              >
                {selectedTeam.name}
              </button>
            </>
          )}
          
          {selectedProject && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-800 font-medium">{selectedProject.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-red-800 font-medium">Error</span>
      </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Dismiss
          </button>
          </div>
        )}

      {/* Content Container */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        {/* Teams View - Default */}
        {!selectedTeam && !selectedProject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Teams ({filteredTeams.length})
              </h3>
            </div>
            
            {loading.teams ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading teams...</span>
              </div>
            ) : filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                    className="p-4 cursor-pointer transition-all relative"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderRadius: '7px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                      minHeight: '140px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                    }}
                  >
                    {/* Team Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: team.color || '#073392', borderRadius: '7px' }}
                      >
                        <Users className="w-6 h-6" style={{ color: '#ffffff' }} />
                    </div>
                      <div className="flex-1">
                        <h3 className="font-bold mb-1" style={{ color: '#1f2937' }}>{team.name}</h3>
                        <div className="text-sm" style={{ color: '#6b7280' }}>
                          {team.description || 'No description'}
                        </div>
                    </div>
                  </div>
                  
                    {/* Team Stats */}
                    <div className="flex items-center gap-4 text-sm mt-4" style={{ color: '#4b5563' }}>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{team.project_count || 0} projects</span>
                    </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>0 files</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                No teams found
              </div>
            )}
            </div>
        )}

        {/* Projects View - When team is selected */}
        {selectedTeam && !selectedProject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Teams
                </button>
              <h3 className="text-lg font-semibold text-gray-800">
                  {selectedTeam.name} Projects ({filteredProjects.length})
              </h3>
              </div>
                </div>
            
            {loading.projects ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading projects...</span>
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Project Name</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Files</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: project.color || selectedTeam.color || '#073392', borderRadius: '7px' }}
                            >
                              <Briefcase className="w-4 h-4" style={{ color: '#ffffff' }} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{project.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {project.description || 'No description'}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {project.file_count || 0} files
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            {formatDate(project.created_at)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewFiles(project);
                              }}
                              className="px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
                              style={{ 
                                backgroundColor: '#ffffff',
                                color: '#073392',
                                borderRadius: '7px'
                              }}
                            >
                              <Eye className="w-4 h-4 inline mr-1" />
                              View Files
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                No projects found for this team
              </div>
            )}
          </div>
        )}

        {/* Files View - When project is selected */}
        {selectedProject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Projects
                </button>
              <h3 className="text-lg font-semibold text-gray-800">
                  {selectedProject.name} Files ({filteredFiles.length})
              </h3>
              </div>
            </div>
            
            {loading.files ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading files...</span>
              </div>
            ) : filteredFiles.length > 0 ? (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="p-4 cursor-pointer transition-all border border-gray-200 rounded-lg hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{file.original_filename}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{formatFileSize(file.file_size)}</span>
                        <span>•</span>
                          <span>Uploaded by {file.uploader?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{formatDate(file.created_at)}</span>
                        {file.metadata?.tags && (
                          <>
                            <span>•</span>
                            <div className="flex gap-1">
                              {file.metadata.tags.slice(0, 3).map((tag: string, index: number) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                            setSelectedFile(file);
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                            handleFileDownload(file);
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                No files found for this project
          </div>
        )}
          </div>
        )}
      </div>

      {/* File Details Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedFile(null)}>
          <div 
            className="bg-white shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto"
            style={{ borderRadius: '7px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between" style={{ borderColor: '#e5e7eb', borderRadius: '7px 7px 0 0' }}>
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getFileIcon(selectedFile.file_type)}</div>
                <h2 className="text-xl font-bold text-gray-800">File Details</h2>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* File Info */}
              <div className="flex items-center gap-4">
                <div className="text-6xl">{getFileIcon(selectedFile.file_type)}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedFile.original_filename}</h3>
                  <p className="text-gray-500">{selectedFile.file_type.toUpperCase()} File</p>
                </div>
              </div>

              {/* File Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">File Size</h4>
                  <p className="text-gray-800">{formatFileSize(selectedFile.file_size)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-800">{formatDate(selectedFile.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Uploader */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded By</h4>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: '#3B82F6' }}
                  >
                    {selectedFile.uploader?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-gray-800">{selectedFile.uploader?.name || 'Unknown User'}</span>
                  <span className="text-gray-500">({selectedFile.uploader?.email || 'No email'})</span>
                </div>
              </div>

              {/* Description and Tags */}
              {selectedFile.metadata?.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-800">{selectedFile.metadata.description}</p>
                </div>
              )}

              {selectedFile.metadata?.tags && selectedFile.metadata.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.metadata.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                <button
                  className="flex-1 px-4 py-2 font-medium text-white transition-colors"
                  style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#054a73')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#076297')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </div>
                </button>
                <button
                  className="flex-1 px-4 py-2 font-medium transition-colors"
                  style={{ backgroundColor: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '7px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUploadModal(false)}>
          <div 
            className="bg-white shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto"
            style={{ borderRadius: '7px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between" style={{ borderColor: '#e5e7eb', borderRadius: '7px 7px 0 0' }}>
              <div className="flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">Upload File to {selectedProject.name}</h2>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select File</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {uploadFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  id="upload-description"
                  placeholder="Describe the file content..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (Optional)</label>
                <input
                  id="upload-tags"
                  type="text"
                  placeholder="Enter tags separated by commas..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile || loading.upload}
                  className="flex-1 px-4 py-2 font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#076297', borderRadius: '7px' }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#054a73';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.backgroundColor = '#076297';
                    }
                  }}
                >
                  {loading.upload ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload File'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files Modal */}
      {showFilesModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFilesModal(false)}>
          <div 
            className="bg-white shadow-2xl w-[800px] max-h-[80vh] overflow-y-auto"
            style={{ borderRadius: '7px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between" style={{ borderColor: '#e5e7eb', borderRadius: '7px 7px 0 0' }}>
              <h3 className="text-lg font-semibold" style={{ color: '#1f2937' }}>
                {selectedProject.name} - All Files
              </h3>
              <button
                onClick={() => setShowFilesModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                style={{ borderRadius: '7px' }}
              >
                <X className="w-5 h-5" style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loading.files ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#076297' }} />
                  <span className="ml-2 text-gray-600">Loading files...</span>
                </div>
              ) : files.length > 0 ? (
                <div className="space-y-3">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
                      style={{ borderRadius: '7px' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">{file.original_filename}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>•</span>
                            <span>Uploaded by {file.uploader?.name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{formatDate(file.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle file view
                              console.log('View file:', file.original_filename);
                            }}
                            className="px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-90"
                            style={{ 
                              backgroundColor: '#ffffff',
                              color: '#073392',
                              borderRadius: '7px'
                            }}
                          >
                            <Eye className="w-4 h-4 inline mr-1" />
                            View
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileDownload(file);
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-white transition-colors hover:opacity-90"
                            style={{ 
                              backgroundColor: '#073392',
                              borderRadius: '7px'
                            }}
                          >
                            <Download className="w-4 h-4 inline mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                  <p className="text-lg font-medium mb-2" style={{ color: '#6b7280' }}>No files found</p>
                  <p className="text-sm" style={{ color: '#9ca3af' }}>No files have been uploaded to this project yet</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end" style={{ borderColor: '#e5e7eb', borderRadius: '0 0 7px 7px' }}>
              <button
                onClick={() => setShowFilesModal(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                style={{ borderRadius: '7px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function ReportsPage(): React.JSX.Element {
  return (
    <SidebarProvider>
      <ReportsContent />
    </SidebarProvider>
  );
}

