import apiClient from "../api-client";

export interface ReportFile {
  id: number;
  team_id?: number;
  project_id?: number;
  task_id?: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  file_url: string;
  mime_type: string;
  uploaded_by: number;
  created_at: string;
  metadata?: {
    description?: string;
    tags?: string[];
    version?: string;
    checksum?: string;
    [key: string]: any;
  };
  team?: {
    id: number;
    name: string;
    color: string;
  };
  project?: {
    id: number;
    name: string;
    status: string;
  };
  uploader?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface Team {
  id: number;
  name: string;
  description: string;
  color: string;
  status: string;
  created_at: string;
  project_count: number;
  file_count: number;
  total_file_size: number;
}

export interface Project {
  id: number;
  team_id: number;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  color: string;
  created_at: string;
  file_count: number;
  total_file_size: number;
  deliverable_count: number;
}

export interface Deliverable {
  id: number;
  project_id: number;
  title: string;
  description: string;
  file_type: string;
  file_size: number;
  file_url: string;
  version: string;
  is_final: boolean;
  created_at: string;
  uploader: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ReportFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  teamId?: number;
  projectId?: number;
  fileType?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReportAnalytics {
  total_files: number;
  total_size: number;
  file_types: string[];
  uploads_by_month: string;
  uploads_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Get reports with filtering
export const getReports = async (
  filters: ReportFilters = {},
): Promise<PaginatedResponse<ReportFile>> => {
  const params = new URLSearchParams();

  if (filters.dateRange) {
    params.append("dateRange", JSON.stringify(filters.dateRange));
  }
  if (filters.teamId) {
    params.append("teamId", filters.teamId.toString());
  }
  if (filters.projectId) {
    params.append("projectId", filters.projectId.toString());
  }
  if (filters.fileType) {
    params.append("fileType", filters.fileType);
  }
  if (filters.page) {
    params.append("page", filters.page.toString());
  }
  if (filters.limit) {
    params.append("limit", filters.limit.toString());
  }
  if (filters.sortBy) {
    params.append("sortBy", filters.sortBy);
  }
  if (filters.sortOrder) {
    params.append("sortOrder", filters.sortOrder);
  }

  const response = await apiClient.get(`/reports?${params.toString()}`);
  return response.data;
};

// Get teams with their projects and file counts
export const getTeamsWithProjects = async (filters: ReportFilters = {}): Promise<Team[]> => {
  const params = new URLSearchParams();

  if (filters.dateRange) {
    params.append("dateRange", JSON.stringify(filters.dateRange));
  }

  const response = await apiClient.get(`/reports/teams?${params.toString()}`);
  return response.data;
};

// Get projects for a specific team
export const getTeamProjects = async (
  teamId: number,
  filters: ReportFilters = {},
): Promise<Project[]> => {
  const params = new URLSearchParams();

  if (filters.dateRange) {
    params.append("dateRange", JSON.stringify(filters.dateRange));
  }

  const response = await apiClient.get(`/reports/teams/${teamId}/projects?${params.toString()}`);
  return response.data;
};

// Get files for a specific project
export const getProjectFiles = async (
  projectId: number,
  filters: ReportFilters = {},
): Promise<PaginatedResponse<ReportFile>> => {
  const params = new URLSearchParams();

  if (filters.dateRange) {
    params.append("dateRange", JSON.stringify(filters.dateRange));
  }
  if (filters.fileType) {
    params.append("fileType", filters.fileType);
  }
  if (filters.page) {
    params.append("page", filters.page.toString());
  }
  if (filters.limit) {
    params.append("limit", filters.limit.toString());
  }

  const response = await apiClient.get(`/reports/projects/${projectId}/files?${params.toString()}`);
  return response.data;
};

// Get project deliverables
export const getProjectDeliverables = async (projectId: number): Promise<Deliverable[]> => {
  const response = await apiClient.get(`/reports/projects/${projectId}/deliverables`);
  return response.data;
};

// Upload file to a project
export const uploadProjectFile = async (
  projectId: number,
  file: File,
  metadata: {
    teamId?: number;
    taskId?: number;
    categoryId?: number;
    description?: string;
    tags?: string;
  } = {},
): Promise<ReportFile> => {
  const formData = new FormData();
  formData.append("file", file);

  if (metadata.teamId) {
    formData.append("teamId", metadata.teamId.toString());
  }
  if (metadata.taskId) {
    formData.append("taskId", metadata.taskId.toString());
  }
  if (metadata.categoryId) {
    formData.append("categoryId", metadata.categoryId.toString());
  }
  if (metadata.description) {
    formData.append("description", metadata.description);
  }
  if (metadata.tags) {
    formData.append("tags", metadata.tags);
  }

  const response = await apiClient.post(`/reports/projects/${projectId}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Mark file as final deliverable
export const markAsDeliverable = async (
  fileId: number,
  projectId: number,
  title: string,
  description?: string,
  version: string = "1.0",
): Promise<Deliverable> => {
  const response = await apiClient.post(`/reports/files/${fileId}/deliverable`, {
    projectId,
    title,
    description,
    version,
  });
  return response.data;
};

// Download file
export const downloadFile = async (fileId: number): Promise<Blob> => {
  const response = await apiClient.get(`/reports/files/${fileId}/download`, {
    responseType: "blob",
  });
  return response.data;
};

// Get report analytics
export const getReportAnalytics = async (
  filters: ReportFilters = {},
): Promise<ReportAnalytics[]> => {
  const params = new URLSearchParams();

  if (filters.dateRange) {
    params.append("dateRange", JSON.stringify(filters.dateRange));
  }
  if (filters.teamId) {
    params.append("teamId", filters.teamId.toString());
  }
  if (filters.projectId) {
    params.append("projectId", filters.projectId.toString());
  }

  const response = await apiClient.get(`/reports/analytics?${params.toString()}`);
  return response.data;
};

// Utility functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileIcon = (type: string): string => {
  switch (type.toLowerCase()) {
    case "pdf":
      return "📄";
    case "docx":
    case "doc":
      return "📝";
    case "xlsx":
    case "xls":
      return "📊";
    case "zip":
    case "rar":
    case "7z":
      return "📦";
    case "sql":
      return "🗄️";
    case "apk":
      return "📱";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
      return "🖼️";
    case "mp4":
    case "avi":
    case "mov":
      return "🎥";
    case "mp3":
    case "wav":
    case "flac":
      return "🎵";
    default:
      return "📎";
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
