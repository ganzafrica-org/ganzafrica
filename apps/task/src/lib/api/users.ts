import apiClient from '../api-client';

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role_name?: string;
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  role_id?: number;
  is_active?: boolean;
}

// Users API
export const usersApi = {
  // List users with pagination and filtering
  async listUsers(params?: ListUsersParams) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  async getUserById(id: number) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};

