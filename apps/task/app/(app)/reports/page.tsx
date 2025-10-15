'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/sidebar';
import { SidebarProvider, useSidebar } from '@/components/sidebar-provider';
import { Navbar } from '@/components/navbar';
import { PageLayout } from '@/components/page-layout';
import { Tabs } from '@/components/tabs';
import { Task, TeamMember } from '@/lib/types';
import { CheckCircle, FileText, Download, Eye, Calendar, User, X } from 'lucide-react';

// Mock data for completed tasks and files
const mockCompletedTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new feature',
    status: 'completed',
    priority: 'high',
    assignee: 'john-doe',
    dueDate: '2024-01-15',
    labels: ['documentation', 'high-priority'],
    comments: [
      {
        id: '1',
        author: 'john-doe',
        content: 'Documentation completed and reviewed',
        timestamp: '2024-01-15T10:30:00Z'
      }
    ],
    attachments: [
      {
        id: '1',
        name: 'project-docs.pdf',
        url: '/files/project-docs.pdf',
        type: 'pdf',
        size: 1024000
      }
    ]
  },
  {
    id: '2',
    title: 'Update user interface design',
    description: 'Implement new UI components based on design system',
    status: 'completed',
    priority: 'medium',
    assignee: 'jane-smith',
    dueDate: '2024-01-12',
    labels: ['ui', 'design'],
    comments: [],
    attachments: []
  },
  {
    id: '3',
    title: 'Database optimization',
    description: 'Optimize database queries for better performance',
    status: 'completed',
    priority: 'high',
    assignee: 'mike-wilson',
    dueDate: '2024-01-10',
    labels: ['database', 'performance'],
    comments: [
      {
        id: '2',
        author: 'mike-wilson',
        content: 'Query optimization completed. Performance improved by 40%',
        timestamp: '2024-01-10T14:20:00Z'
      }
    ],
    attachments: [
      {
        id: '2',
        name: 'performance-report.pdf',
        url: '/files/performance-report.pdf',
        type: 'pdf',
        size: 512000
      }
    ]
  }
];

const mockFiles = [
  {
    id: '1',
    name: 'project-docs.pdf',
    type: 'pdf',
    size: 1024000,
    uploadedBy: 'john-doe',
    uploadedAt: '2024-01-15T10:30:00Z',
    taskId: '1',
    taskTitle: 'Complete project documentation'
  },
  {
    id: '2',
    name: 'performance-report.pdf',
    type: 'pdf',
    size: 512000,
    uploadedBy: 'mike-wilson',
    uploadedAt: '2024-01-10T14:20:00Z',
    taskId: '3',
    taskTitle: 'Database optimization'
  },
  {
    id: '3',
    name: 'ui-mockups.fig',
    type: 'figma',
    size: 2048000,
    uploadedBy: 'jane-smith',
    uploadedAt: '2024-01-12T09:15:00Z',
    taskId: '2',
    taskTitle: 'Update user interface design'
  },
  {
    id: '4',
    name: 'meeting-notes.docx',
    type: 'docx',
    size: 256000,
    uploadedBy: 'john-doe',
    uploadedAt: '2024-01-08T16:45:00Z',
    taskId: null,
    taskTitle: null
  }
];

const mockMembers: TeamMember[] = [
  { id: 'john-doe', name: 'John Doe', email: 'john@example.com', color: '#3B82F6', initial: 'JD' },
  { id: 'jane-smith', name: 'Jane Smith', email: 'jane@example.com', color: '#10B981', initial: 'JS' },
  { id: 'mike-wilson', name: 'Mike Wilson', email: 'mike@example.com', color: '#F59E0B', initial: 'MW' }
];

function ReportsContent() {
  const { sidebarCollapsed, toggleCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedFile, setSelectedFile] = useState<typeof mockFiles[0] | null>(null);

  const tabs = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'files', label: 'Files' }
  ];

  const completedTasks = useMemo(() => mockCompletedTasks, []);
  const files = useMemo(() => mockFiles, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'figma':
        return '🎨';
      default:
        return '📎';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMemberById = (id: string) => {
    return mockMembers.find(member => member.id === id);
  };

  return (
    <PageLayout 
      members={mockMembers} 
      tasks={[]} 
      title="Reports"
    >
      {/* Tabs Container */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Tabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
      </div>

      {/* Content Container */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        {/* Tab Content */}
        {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Completed Tasks ({completedTasks.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {completedTasks.map((task) => {
                      const assignee = getMemberById(task.assignee);
                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="p-4 cursor-pointer transition-all"
                          style={{ 
                            backgroundColor: '#ffffff',
                            borderRadius: '7px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <h4 className="font-medium text-gray-800">{task.title}</h4>
                                <span 
                                  className="px-2 py-1 text-xs font-medium rounded-full"
                                  style={{
                                    backgroundColor: task.priority === 'high' ? '#fee2e2' : 
                                                    task.priority === 'medium' ? '#fef3c7' : '#dcfce7',
                                    color: task.priority === 'high' ? '#991b1b' : 
                                          task.priority === 'medium' ? '#92400e' : '#166534'
                                  }}
                                >
                                  {task.priority}
                                </span>
                              </div>
                              
                              <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{assignee?.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Completed {formatDate(task.dueDate)}</span>
                                </div>
                                {task.attachments.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    <span>{task.attachments.length} file(s)</span>
                                  </div>
                                )}
                              </div>
                              
                              {task.labels.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {task.labels.map((label) => (
                                    <span
                                      key={label}
                                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full"
                                    >
                                      {label}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Shared Files ({files.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {files.map((file) => {
                      const uploader = getMemberById(file.uploadedBy);
                      return (
                        <div
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className="p-4 cursor-pointer transition-all"
                          style={{ 
                            backgroundColor: '#ffffff',
                            borderRadius: '7px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-2xl">{getFileIcon(file.type)}</div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{file.name}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span>{formatFileSize(file.size)}</span>
                                  <span>•</span>
                                  <span>Uploaded by {uploader?.name}</span>
                                  <span>•</span>
                                  <span>{formatDate(file.uploadedAt)}</span>
                                  {file.taskTitle && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-600">From: {file.taskTitle}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
        </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <div 
            className="bg-white shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto"
            style={{ borderRadius: '7px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between" style={{ borderColor: '#e5e7eb', borderRadius: '7px 7px 0 0' }}>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Title and Priority */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedTask.title}</h3>
                  <span 
                    className="px-3 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: selectedTask.priority === 'high' ? '#fee2e2' : 
                                      selectedTask.priority === 'medium' ? '#fef3c7' : '#dcfce7',
                      color: selectedTask.priority === 'high' ? '#991b1b' : 
                            selectedTask.priority === 'medium' ? '#92400e' : '#166534'
                    }}
                  >
                    {selectedTask.priority?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                <p className="text-gray-600">{selectedTask.description}</p>
              </div>

              {/* Task Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Assignee</h4>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: getMemberById(selectedTask.assignee)?.color }}
                    >
                      {getMemberById(selectedTask.assignee)?.initial}
                    </div>
                    <span className="text-gray-800">{getMemberById(selectedTask.assignee)?.name}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Completed Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-800">{formatDate(selectedTask.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Labels */}
              {selectedTask.labels && selectedTask.labels.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.labels.map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-full font-medium"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedTask.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3"
                        style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '7px' }}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-800">{attachment.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments */}
              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Comments</h4>
                  <div className="space-y-3">
                    {selectedTask.comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-4"
                        style={{ backgroundColor: '#f0f8fc', borderRadius: '7px' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{ backgroundColor: getMemberById(comment.author)?.color }}
                          >
                            {getMemberById(comment.author)?.initial}
                          </div>
                          <span className="font-semibold text-gray-800">{getMemberById(comment.author)?.name}</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                <FileText className="w-6 h-6" style={{ color: '#076297' }} />
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
              {/* File Icon and Name */}
              <div className="flex items-center gap-4">
                <div className="text-6xl">{getFileIcon(selectedFile.type)}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedFile.name}</h3>
                  <p className="text-gray-500">{selectedFile.type.toUpperCase()} File</p>
                </div>
              </div>

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">File Size</h4>
                  <p className="text-gray-800">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded Date</h4>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-800">{formatDate(selectedFile.uploadedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Uploader */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Uploaded By</h4>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    style={{ backgroundColor: getMemberById(selectedFile.uploadedBy)?.color }}
                  >
                    {getMemberById(selectedFile.uploadedBy)?.initial}
                  </div>
                  <span className="text-gray-800">{getMemberById(selectedFile.uploadedBy)?.name}</span>
                  <span className="text-gray-500">({getMemberById(selectedFile.uploadedBy)?.email})</span>
                </div>
              </div>

              {/* Related Task */}
              {selectedFile.taskTitle && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Related Task</h4>
                  <div className="p-3" style={{ backgroundColor: '#f0f8fc', borderRadius: '7px' }}>
                    <p className="text-gray-800 font-medium">{selectedFile.taskTitle}</p>
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
    </PageLayout>
  );
}

export default function ReportsPage() {
  return (
    <SidebarProvider>
      <ReportsContent />
    </SidebarProvider>
  );
}
