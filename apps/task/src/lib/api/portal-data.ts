import apiClient from "../api-client";

// Types
export interface PortalTeam {
  id: number;
  name: string;
  position?: string;
  photo_url?: string;
  bio?: string;
  email?: string;
  profile_link?: string;
  skills?: string[];
  team_type_id: number;
  team_type?: {
    id: number;
    name: string;
  };
  team_type_name?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface PortalProject {
  id: number;
  name: string;
  description?: string;
  status: string;
  category_id: number;
  partner_id?: number;
  goals?: any;
  outcomes?: any;
  location?: string;
  media?: any;
  other_information?: any;
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// Portal Data API
export const portalDataApi = {
  // Get teams by team type IDs (e.g., Team and Fellow)
  async getTeamsByType(teamTypeIds: number[]) {
    const ids = teamTypeIds.join(",");
    const response = await apiClient.get(`/portal-data/teams?team_type_ids=${ids}`);
    return response.data;
  },

  // Get all projects
  async getAllProjects(filters?: { page?: number; limit?: number; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.search) params.append("search", filters.search);

    const response = await apiClient.get(`/portal-data/projects?${params.toString()}`);
    return response.data;
  },
};
