import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { logger } from './logger';

// Interface for token payload
interface TokenPayload {
  exp?: number;
  id?: string;
  email?: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch {
    return true;
  }
};

// Request interceptor for adding tokens
apiClient.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('accessToken');
    
    if (token) {
      // If token exists but is expired, try to refresh it first
      if (isTokenExpired(token)) {
        logger.debug('Token expired, attempting to refresh...');
        // For now, we'll just clear the token and let the user re-login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        token = null;
      }
    }
    
    // Add token to headers if it exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear tokens and redirect to portal login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('task_user');
      
      // Redirect to portal login page if in browser environment
      if (typeof window !== 'undefined') {
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || 'http://localhost:3001';
        window.location.href = `${portalUrl}/login`;
      }
    }
    
    return Promise.reject(error);
  }
);

// Task API functions
export const taskApi = {
  // Get tasks for a specific project
  getTasksByProject: async (projectId: number) => {
    const response = await apiClient.get(`/tasks/project/${projectId}`);
    return response.data;
  },

  // Get all tasks assigned to the current user
  getTasksByUser: async () => {
    const response = await apiClient.get('/tasks/user/assigned');
    return response.data;
  },

  // Get all tasks (no permission checks)
  getAllTasks: async () => {
    const response = await apiClient.get('/tasks/all');
    return response.data;
  },

  // Get task team projects (for task creation)
  // If userId is provided, only returns projects the user is a member of
  getTaskTeamProjects: async (userId?: number) => {
    const params = userId ? { user_id: userId } : {};
    const response = await apiClient.get('/tasks/projects', { params });
    return response.data;
  },

  // Get a single task by ID
  getTaskById: async (taskId: number) => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    return response.data;
  },

  // Get a single task by ID without permission checks (for board view)
  getTaskByIdUnrestricted: async (taskId: number) => {
    const response = await apiClient.get(`/tasks/${taskId}/unrestricted`);
    return response.data;
  },

  // Create a new task
  createTask: async (taskData: any) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  // Create a new task without permission checks (for board view)
  createTaskUnrestricted: async (taskData: any) => {
    const response = await apiClient.post('/tasks/unrestricted', taskData);
    return response.data;
  },

  // Comments
  addTaskComment: async (taskId: number, content: string) => {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },
  updateTaskComment: async (taskId: number, commentId: number, content: string) => {
    const response = await apiClient.put(`/tasks/${taskId}/comments/${commentId}`, { content });
    return response.data;
  },
  deleteTaskComment: async (taskId: number, commentId: number) => {
    const response = await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
    return response.data;
  },

  // Update a task
  updateTask: async (taskId: number, taskData: any) => {
    const response = await apiClient.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Update a task without permission checks (for board view)
  updateTaskUnrestricted: async (taskId: number, taskData: any) => {
    const response = await apiClient.put(`/tasks/${taskId}/unrestricted`, taskData);
    return response.data;
  },

  // Update task with fallback (tries unrestricted first, falls back to regular)
  updateTaskWithFallback: async (taskId: number, taskData: any, isAdminOrManager: boolean = false) => {
    if (isAdminOrManager) {
      try {
        const response = await apiClient.put(`/tasks/${taskId}/unrestricted`, taskData);
        return response.data;
      } catch (unrestrictedError: unknown) {
        logger.error('Unrestricted endpoint failed for admin/manager user:', unrestrictedError);
        
        // Check if it's a 500 error (server issue) vs 403/401 (permission issue)
        const status = (unrestrictedError as { response?: { status?: number } })?.response?.status;
        if (status === 500) {
          // Server error - try regular endpoint as fallback
          logger.warn('Server error on unrestricted endpoint, trying regular endpoint as fallback');
          try {
            const response = await apiClient.put(`/tasks/${taskId}`, taskData);
            return response.data;
          } catch (regularError: unknown) {
            logger.error('Both unrestricted and regular endpoints failed:', regularError);
            const errorMessage = logger.getErrorMessage(regularError);
            throw new Error(`Task update failed: ${errorMessage}`);
          }
        } else {
          // Permission or other client error - don't fallback
          const errorMessage = logger.getErrorMessage(unrestrictedError);
          throw new Error(`Admin/Manager task update failed: ${errorMessage}`);
        }
      }
    } else {
      const response = await apiClient.put(`/tasks/${taskId}`, taskData);
      return response.data;
    }
  },

  // Delete a task
  deleteTask: async (taskId: number) => {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Delete a task without permission checks (for board view)
  deleteTaskUnrestricted: async (taskId: number) => {
    const response = await apiClient.delete(`/tasks/${taskId}/unrestricted`);
    return response.data;
  },

  // Delete task with fallback (tries unrestricted first, falls back to regular)
  deleteTaskWithFallback: async (taskId: number, isAdminOrManager: boolean = false) => {
    if (isAdminOrManager) {
      try {
        const response = await apiClient.delete(`/tasks/${taskId}/unrestricted`);
        return response.data;
      } catch (unrestrictedError: unknown) {
        logger.error('Unrestricted delete endpoint failed for admin/manager user:', unrestrictedError);
        
        // Check if it's a 500 error (server issue) vs 403/401 (permission issue)
        const status = (unrestrictedError as { response?: { status?: number } })?.response?.status;
        if (status === 500) {
          // Server error - try regular endpoint as fallback
          logger.warn('Server error on unrestricted delete endpoint, trying regular endpoint as fallback');
          try {
            const response = await apiClient.delete(`/tasks/${taskId}`);
            return response.data;
          } catch (regularError: unknown) {
            logger.error('Both unrestricted and regular delete endpoints failed:', regularError);
            const errorMessage = logger.getErrorMessage(regularError);
            throw new Error(`Task deletion failed: ${errorMessage}`);
          }
        } else {
          // Permission or other client error - don't fallback
          const errorMessage = logger.getErrorMessage(unrestrictedError);
          throw new Error(`Admin/Manager task deletion failed: ${errorMessage}`);
        }
      }
    } else {
      const response = await apiClient.delete(`/tasks/${taskId}`);
      return response.data;
    }
  },

  // Check if backend is accessible and unrestricted endpoints are working
  checkBackendHealth: async () => {
    try {
      // Try to get all tasks as a health check
      const response = await apiClient.get('/tasks/all');
      return { 
        status: 'healthy', 
        message: 'Backend is accessible',
        hasUnrestrictedEndpoints: true // Assume true if we can reach the backend
      };
    } catch (error: unknown) {
      logger.error('Backend health check failed:', error);
      const errorMessage = logger.getErrorMessage(error);
      return { 
        status: 'unhealthy', 
        message: errorMessage,
        hasUnrestrictedEndpoints: false
      };
    }
  },

  // Upload attachments to a task
  uploadTaskAttachments: async (taskId: number, files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await apiClient.post(`/tasks/${taskId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Portal data API functions
export const portalDataApi = {
  // Get teams by type
  getTeamsByType: async (teamTypeIds: number[]) => {
    const ids = teamTypeIds.join(',');
    const response = await apiClient.get(`/portal-data/teams?team_type_ids=${ids}`);
    return response.data;
  },

  // Get all projects
  getAllProjects: async (page = 1, limit = 100, search = '') => {
    const response = await apiClient.get(`/portal-data/projects?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },
};

// Profile API functions
export const profileApi = {
  // Get current user's profile
  getCurrentProfile: async () => {
    const response = await apiClient.get('/users/profile/me');
    return response.data;
  },

  // Get user profile by ID
  getUserProfile: async (userId: number) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (profileData: any) => {
    const response = await apiClient.put('/users/profile/me', profileData);
    return response.data;
  },
};

export default apiClient;