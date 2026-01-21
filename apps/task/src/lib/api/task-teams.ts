import apiClient from '../api-client';

// Types
export interface TaskTeam {
  id: number;
  name: string;
  description: string;
  avatar_url?: string;
  color?: string;
  status: 'active' | 'inactive' | 'archived';
  created_by: number;
  settings?: any;
  members?: TeamMember[];
  member_count?: number;
  projects?: TaskProject[];
  project_count?: number;
  file_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  user_id: number;
  name?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  position?: string;
  is_active: boolean;
  joined_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface TaskProject {
  id: number;
  team_id: number;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  color?: string;
  created_by: number;
  settings?: any;
  members?: ProjectMember[];
  member_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number;
  user_id: number;
  name?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  position?: string;
  is_active: boolean;
  joined_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface CreateTeamInput {
  name: string;
  description?: string;
  avatar_url?: string;
  color?: string;
  status?: 'active' | 'inactive' | 'archived';
  created_by: number;
  settings?: any;
  members?: Array<{
    user_id: number;
    name?: string;
    position?: string;
  }>;
  projects?: Array<{
    name: string;
    description?: string;
    status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    start_date?: string;
    end_date?: string;
    color?: string;
  }>;
}

export interface UpdateTeamInput {
  name?: string;
  description?: string;
  avatar_url?: string;
  color?: string;
  status?: 'active' | 'inactive' | 'archived';
  settings?: any;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  color?: string;
  created_by: number;
  settings?: any;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  color?: string;
  settings?: any;
}

// Task Teams API
export const taskTeamsApi = {
  // Teams
  async listTeams(filters?: {
    status?: string;
    created_by?: number;
    user_id?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await apiClient.get('/task-teams', { params: filters });
    return response.data;
  },

  async getTeamById(id: number) {
    const response = await apiClient.get(`/task-teams/${id}`);
    return response.data;
  },

  async createTeam(data: CreateTeamInput) {
    const response = await apiClient.post('/task-teams', data);
    return response.data;
  },

  async updateTeam(id: number, data: UpdateTeamInput) {
    const response = await apiClient.put(`/task-teams/${id}`, data);
    return response.data;
  },

  async deleteTeam(id: number) {
    const response = await apiClient.delete(`/task-teams/${id}`);
    return response.data;
  },

  // Team Members
  async addTeamMember(teamId: number, userId: number, role?: string) {
    const response = await apiClient.post(`/task-teams/${teamId}/members`, {
      user_id: userId,
      role: role || 'member',
    });
    return response.data;
  },

  async removeTeamMember(teamId: number, userId: number) {
    const response = await apiClient.delete(`/task-teams/${teamId}/members/${userId}`);
    return response.data;
  },

  async updateTeamMemberRole(teamId: number, userId: number, role: string) {
    const response = await apiClient.patch(`/task-teams/${teamId}/members/${userId}/role`, {
      role,
    });
    return response.data;
  },

  // List all projects (for team assignment)
  async listAllProjects() {
    const response = await apiClient.get('/task-teams/projects/all');
    return response.data;
  },

  // Add project to team
  async addProjectToTeam(teamId: number, projectId: number) {
    const response = await apiClient.post(`/task-teams/${teamId}/projects/${projectId}`);
    return response.data;
  },

  // Remove project from team
  async removeProjectFromTeam(teamId: number, projectId: number) {
    const response = await apiClient.delete(`/task-teams/${teamId}/projects/${projectId}`);
    return response.data;
  },

  // Projects
  async listProjects(teamId: number, filters?: {
    status?: string;
    search?: string;
  }) {
    const response = await apiClient.get(`/task-teams/${teamId}/projects`, { params: filters });
    return response.data;
  },

  async getProjectById(projectId: number) {
    const response = await apiClient.get(`/task-teams/projects/${projectId}`);
    return response.data;
  },

  async createProject(teamId: number, data: CreateProjectInput) {
    const response = await apiClient.post(`/task-teams/${teamId}/projects`, data);
    return response.data;
  },

  async updateProject(projectId: number, data: UpdateProjectInput) {
    const response = await apiClient.put(`/task-teams/projects/${projectId}`, data);
    return response.data;
  },

  async deleteProject(projectId: number) {
    const response = await apiClient.delete(`/task-teams/projects/${projectId}`);
    return response.data;
  },

  // Project Members
  async addProjectMember(projectId: number, userId: number, role?: string) {
    const response = await apiClient.post(`/task-teams/projects/${projectId}/members`, {
      user_id: userId,
      role: role || 'member',
    });
    return response.data;
  },

  async removeProjectMember(projectId: number, userId: number) {
    const response = await apiClient.delete(`/task-teams/projects/${projectId}/members/${userId}`);
    return response.data;
  },
};

