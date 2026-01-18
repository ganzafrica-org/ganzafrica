import apiClient from "../api-client";

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
  sort_order?: "asc" | "desc";
  role_id?: number;
  is_active?: boolean;
  exclude_alumni?: boolean;
}

// Users API
export const usersApi = {
  // List users with pagination and filtering
  async listUsers(params?: ListUsersParams) {
    const { exclude_alumni = true, ...apiParams } = params || {};
    const response = await apiClient.get("/users", { params: apiParams });

    // Filter out alumni users on the frontend (default: true unless explicitly set to false)
    if (exclude_alumni && response.data.users) {
      response.data.users = response.data.users.filter(
        (user: User) => user.role_name?.toLowerCase() !== "alumni",
      );
      // Update total count
      if (response.data.pagination) {
        response.data.pagination.total = response.data.users.length;
      }
    }

    return response.data;
  },

  // Get user by ID
  async getUserById(id: number) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};
