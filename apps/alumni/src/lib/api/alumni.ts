import apiClient from "../api-client";

export interface Alumni {
  id: number;
  name: string;
  avatar: string | null;
  title: string;
  company: string;
  location: string;
  country: string;
  industry: string;
  bio: string;
  graduationYear: number | null;
  fellowRole: string;
  skills: string[];
  phone: string | null;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
  activeMenteesCount: number;
}

export interface AlumniProfile {
  id: number;
  userId: number;
  name: string;
  email: string;
  avatar: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  country: string | null;
  industry: string | null;
  bio: string | null;
  graduationYear: number | null;
  fellowRole: string | null;
  skills: string[];
  phone: string | null;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  website: string | null;
}

export interface UpdateProfileData {
  title?: string;
  company?: string;
  location?: string;
  country?: string;
  industry?: string;
  bio?: string;
  graduationYear?: number | null;
  fellowRole?: string;
  skills?: string[];
  phone?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
  website?: string;
}

export interface AlumniStats {
  totalAlumni: number;
  alumniWithMentees: number;
  countriesCount: number;
  industriesCount: number;
}

export interface DashboardStats {
  myMentorshipPairs: number;
  upcomingEvents: number;
  jobPostings: number;
  achievements: number;
}

export interface AlumniFilters {
  countries: string[];
  industries: string[];
  graduationYears: number[];
}

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export interface AlumniListResponse {
  alumni: Alumni[];
  pagination: Pagination;
  filters: AlumniFilters;
}

export interface AlumniStatsResponse {
  stats: AlumniStats;
}

export interface MentorshipStats {
  availableMentees: number;
  activeRelationships: number;
  sessionsCompleted: number;
  averageRating: number | string;
}

export interface Fellow {
  id: number;
  name: string;
  avatar: string | null;
  fellowRole: string;
  isAvailable: boolean;
}

export interface FellowsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  available?: boolean;
}

export interface FellowsResponse {
  fellows: Fellow[];
  pagination: Pagination;
}

export interface Goal {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt?: string | null;
}

export interface Session {
  id: number;
  title: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "completed" | "cancelled";
  notes: string | null;
  rating: number | null;
  feedback: string | null;
}

export interface Mentorship {
  id: number;
  mentee: {
    id: number;
    name: string;
    avatar: string | null;
    fellowRole: string;
    email?: string | null;
    phone?: string | null;
  };
  startDate: string | null;
  status: "active" | "completed" | "paused";
  goals: Goal[];
  progress: number;
  sessionsCompleted: number;
  totalSessions: number;
  nextSession: {
    id: number;
    title: string | null;
    scheduledAt: string;
    durationMinutes: number;
  } | null;
}

export interface ConnectionDetail {
  id: number;
  mentee: {
    id: number;
    name: string;
    email: string | null;
    avatar: string | null;
    fellowRole: string;
    phone: string | null;
  };
  status: "active" | "completed" | "paused";
  totalSessions: number;
  sessionsCompleted: number;
  progress: number;
  startDate: string | null;
  endDate: string | null;
  goals: Goal[];
  sessions: Session[];
}

export interface AlumniQueryParams {
  page?: number;
  limit?: number;
  country?: string;
  industry?: string;
  graduationYear?: string;
  search?: string;
}

// Job opportunities types
export interface JobStats {
  totalJobs: number;
  remoteJobs: number;
  internalJobs: number;
}

export interface TrendingSkill {
  skill: string;
  count: number;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string | null;
  jobType: string | null;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  description: string | null;
  requirements: string[];
  skills: string[];
  sector: string;
  experienceLevel: string | null;
  applicationUrl: string | null;
  deadline: string | null;
  source: string;
  views: number;
  createdAt: string;
}

export interface JobFilters {
  sectors: string[];
  jobTypes: string[];
  locations: string[];
  experienceLevels: string[];
}

export interface JobsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sector?: string;
  job_type?: string;
  location?: string;
  remote?: boolean;
  source?: string;
  experience_level?: string;
  sort?: string;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: Pagination;
  filters: JobFilters;
}

// Achievements types

export interface Achievement {
  id: number;
  title: string;
  description: string | null;
  category: string;
  type: string | null;
  date: string | null;
  organization: string | null;
  location: string | null;
  link: string | null;
  imageUrl: string | null;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  createdAt: string;
  achiever: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

export interface AchievementDetail extends Omit<Achievement, "comments"> {
  hasLiked: boolean;
  achiever: {
    id: number;
    name: string;
    avatar: string | null;
    title: string | null;
    company: string | null;
  };
  comments: AchievementComment[];
}

export interface AchievementComment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

export interface AchievementStats {
  totalAchievements: number;
  myAchievements: number;
  categoriesCount: number;
}

export interface AchievementFilters {
  categories: string[];
  types: string[];
  years: number[];
}

export interface AchievementsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
  year?: string;
  sort?: string;
}

export interface AchievementsResponse {
  achievements: Achievement[];
  pagination: Pagination;
  filters: AchievementFilters;
}

export interface CreateAchievementData {
  title: string;
  description?: string;
  category: string;
  type?: string;
  date?: string;
  organization?: string;
  location?: string;
  link?: string;
  tags?: string[];
}

export const alumniApi = {
  getStats: async (): Promise<AlumniStatsResponse> => {
    const response = await apiClient.get("/alumni/stats");
    return response.data;
  },

  getDashboardStats: async (): Promise<{ stats: DashboardStats }> => {
    const response = await apiClient.get("/alumni/dashboard/stats");
    return response.data;
  },

  getAll: async (params: AlumniQueryParams = {}): Promise<AlumniListResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.country && params.country !== "all") queryParams.set("country", params.country);
    if (params.industry && params.industry !== "all") queryParams.set("industry", params.industry);
    if (params.graduationYear && params.graduationYear !== "all")
      queryParams.set("graduationYear", params.graduationYear);
    if (params.search) queryParams.set("search", params.search);

    const queryString = queryParams.toString();
    const url = queryString ? `/alumni?${queryString}` : "/alumni";

    const response = await apiClient.get(url);
    return response.data;
  },

  getProfile: async (): Promise<{ profile: AlumniProfile }> => {
    const response = await apiClient.get("/alumni/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ profile: AlumniProfile }> => {
    const response = await apiClient.put("/alumni/profile", data);
    return response.data;
  },
};

// Mentorship API
export const mentorshipApi = {
  getStats: async (): Promise<{ stats: MentorshipStats }> => {
    const response = await apiClient.get("/mentorship/stats");
    return response.data;
  },

  getFellows: async (params: FellowsQueryParams = {}): Promise<FellowsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.available) queryParams.set("available", "true");

    const queryString = queryParams.toString();
    const url = queryString ? `/mentorship/fellows?${queryString}` : "/mentorship/fellows";

    const response = await apiClient.get(url);
    return response.data;
  },

  addMentee: async (fellowId: number): Promise<{ message: string; mentorship: any }> => {
    const response = await apiClient.post("/mentorship/add-mentee", {
      fellowId,
    });
    return response.data;
  },

  getConnections: async (): Promise<{ mentorships: Mentorship[] }> => {
    const response = await apiClient.get("/mentorship/connections");
    return response.data;
  },

  getConnection: async (id: number): Promise<{ connection: ConnectionDetail }> => {
    const response = await apiClient.get(`/mentorship/connections/${id}`);
    return response.data;
  },

  updateConnection: async (
    id: number,
    data: { totalSessions?: number; status?: string },
  ): Promise<{ message: string; mentorship: any }> => {
    const response = await apiClient.put(`/mentorship/connections/${id}`, data);
    return response.data;
  },

  // Goals
  addGoal: async (
    connectionId: number,
    data: { title: string; description?: string },
  ): Promise<{ message: string; goal: Goal }> => {
    const response = await apiClient.post(`/mentorship/connections/${connectionId}/goals`, data);
    return response.data;
  },

  updateGoal: async (
    connectionId: number,
    goalId: number,
    data: { title?: string; description?: string; isCompleted?: boolean },
  ): Promise<{ message: string; goal: Goal }> => {
    const response = await apiClient.put(
      `/mentorship/connections/${connectionId}/goals/${goalId}`,
      data,
    );
    return response.data;
  },

  deleteGoal: async (connectionId: number, goalId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/mentorship/connections/${connectionId}/goals/${goalId}`,
    );
    return response.data;
  },

  // Sessions
  scheduleSession: async (
    connectionId: number,
    data: {
      title?: string;
      scheduledAt: string;
      durationMinutes?: number;
      notes?: string;
    },
  ): Promise<{ message: string; session: Session }> => {
    const response = await apiClient.post(`/mentorship/connections/${connectionId}/sessions`, data);
    return response.data;
  },

  updateSession: async (
    connectionId: number,
    sessionId: number,
    data: {
      title?: string;
      scheduledAt?: string;
      durationMinutes?: number;
      status?: string;
      notes?: string;
      rating?: number;
      feedback?: string;
    },
  ): Promise<{ message: string; session: Session }> => {
    const response = await apiClient.put(
      `/mentorship/connections/${connectionId}/sessions/${sessionId}`,
      data,
    );
    return response.data;
  },

  deleteSession: async (connectionId: number, sessionId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(
      `/mentorship/connections/${connectionId}/sessions/${sessionId}`,
    );
    return response.data;
  },
};

// Achievements API
export const achievementsApi = {
  getStats: async (): Promise<{ stats: AchievementStats }> => {
    const response = await apiClient.get("/achievements/stats");
    return response.data;
  },

  getAll: async (params: AchievementsQueryParams = {}): Promise<AchievementsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.category && params.category !== "all") queryParams.set("category", params.category);
    if (params.type && params.type !== "all") queryParams.set("type", params.type);
    if (params.year && params.year !== "all") queryParams.set("year", params.year);
    if (params.sort) queryParams.set("sort", params.sort);

    const queryString = queryParams.toString();
    const url = queryString ? `/achievements?${queryString}` : "/achievements";

    const response = await apiClient.get(url);
    return response.data;
  },

  getOne: async (id: number): Promise<{ achievement: AchievementDetail }> => {
    const response = await apiClient.get(`/achievements/${id}`);
    return response.data;
  },

  create: async (
    data: CreateAchievementData,
  ): Promise<{ message: string; achievement: Achievement }> => {
    const response = await apiClient.post("/achievements", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateAchievementData>,
  ): Promise<{ message: string; achievement: Achievement }> => {
    const response = await apiClient.put(`/achievements/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/achievements/${id}`);
    return response.data;
  },

  toggleLike: async (id: number): Promise<{ liked: boolean; likes: number }> => {
    const response = await apiClient.post(`/achievements/${id}/like`);
    return response.data;
  },

  addComment: async (
    id: number,
    content: string,
  ): Promise<{ message: string; comment: AchievementComment }> => {
    const response = await apiClient.post(`/achievements/${id}/comments`, {
      content,
    });
    return response.data;
  },

  deleteComment: async (achievementId: number, commentId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/achievements/${achievementId}/comments/${commentId}`);
    return response.data;
  },
};

// Jobs API
export const jobsApi = {
  getStats: async (): Promise<{ stats: JobStats }> => {
    const response = await apiClient.get("/jobs/stats");
    return response.data;
  },

  getTrendingSkills: async (): Promise<{ skills: TrendingSkill[] }> => {
    const response = await apiClient.get("/jobs/trending-skills");
    return response.data;
  },

  getAll: async (params: JobsQueryParams = {}): Promise<JobsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.sector && params.sector !== "all") queryParams.set("sector", params.sector);
    if (params.job_type && params.job_type !== "all") queryParams.set("job_type", params.job_type);
    if (params.location && params.location !== "all") queryParams.set("location", params.location);
    if (params.remote) queryParams.set("remote", "true");
    if (params.source && params.source !== "all") queryParams.set("source", params.source);
    if (params.experience_level && params.experience_level !== "all")
      queryParams.set("experience_level", params.experience_level);
    if (params.sort) queryParams.set("sort", params.sort);

    const queryString = queryParams.toString();
    const url = queryString ? `/jobs?${queryString}` : "/jobs";

    const response = await apiClient.get(url);
    return response.data;
  },

  getOne: async (id: number): Promise<{ job: Job }> => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    company: string;
    sector: string;
    location?: string;
    jobType?: string;
    isRemote?: boolean;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    description?: string;
    requirements?: string[];
    skills?: string[];
    experienceLevel?: string;
    applicationUrl?: string;
    deadline?: string;
  }): Promise<{ message: string; job: Job }> => {
    const response = await apiClient.post("/jobs", data);
    return response.data;
  },
};

// Resources Types
export interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string;
  fileUrl: string;
  fileType: string | null;
  fileSize: string | null;
  thumbnailUrl: string | null;
  author: {
    id: number;
    name: string;
    title: string | null;
  };
  tags: string[];
  estimatedTime: string | null;
  pages: number | null;
  duration: string | null;
  views: number;
  downloads: number;
  likes: number;
  rating: string;
  ratingCount: number;
  isFeatured: boolean;
  externalUrl: string | null;
  createdAt: string;
}

export interface ResourceDetail extends Resource {
  hasLiked: boolean;
  userRating: number | null;
}

export interface ResourceStats {
  totalResources: number;
  featuredResources: number;
  totalDownloads: number;
  categoriesCount: number;
}

export interface ResourceFilters {
  categories: string[];
  types: string[];
}

export interface ResourcesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
  sort?: string;
}

export interface ResourcesResponse {
  resources: Resource[];
  pagination: Pagination;
  filters: ResourceFilters;
}

export interface CreateResourceData {
  title: string;
  description: string;
  type: string;
  category: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: string;
  thumbnailUrl?: string;
  tags?: string[];
  estimatedTime?: string;
  pages?: number;
  duration?: string;
  externalUrl?: string;
}

// Resources API
export const resourcesApi = {
  getStats: async (): Promise<{ stats: ResourceStats }> => {
    const response = await apiClient.get("/resources/stats");
    return response.data;
  },

  getAll: async (params: ResourcesQueryParams = {}): Promise<ResourcesResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.category && params.category !== "all") queryParams.set("category", params.category);
    if (params.type && params.type !== "all") queryParams.set("type", params.type);
    if (params.sort) queryParams.set("sort", params.sort);

    const queryString = queryParams.toString();
    const url = queryString ? `/resources?${queryString}` : "/resources";

    const response = await apiClient.get(url);
    return response.data;
  },

  getOne: async (id: number): Promise<{ resource: ResourceDetail }> => {
    const response = await apiClient.get(`/resources/${id}`);
    return response.data;
  },

  create: async (data: CreateResourceData): Promise<{ message: string; resource: Resource }> => {
    const response = await apiClient.post("/resources", data);
    return response.data;
  },

  update: async (
    id: number,
    data: Partial<CreateResourceData>,
  ): Promise<{ message: string; resource: Resource }> => {
    const response = await apiClient.put(`/resources/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/resources/${id}`);
    return response.data;
  },

  toggleLike: async (id: number): Promise<{ liked: boolean; likes: number }> => {
    const response = await apiClient.post(`/resources/${id}/like`);
    return response.data;
  },

  trackDownload: async (id: number): Promise<{ message: string; downloads: number }> => {
    const response = await apiClient.post(`/resources/${id}/download`);
    return response.data;
  },

  rate: async (
    id: number,
    rating: number,
    review?: string,
  ): Promise<{ message: string; rating: string; ratingCount: number }> => {
    const response = await apiClient.post(`/resources/${id}/rate`, {
      rating,
      review,
    });
    return response.data;
  },

  toggleFeatured: async (id: number): Promise<{ message: string; isFeatured: boolean }> => {
    const response = await apiClient.put(`/resources/${id}/feature`);
    return response.data;
  },
};

// Events Types
export interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  location: string | null;
  isVirtual: boolean;
  meetingUrl: string | null;
  type: string;
  category: string;
  organizer: string;
  organizerId: number | null;
  maxAttendees: number | null;
  isPaid: boolean;
  price: string | null;
  currency: string;
  status: string;
  imageUrl: string | null;
  speakers: { name: string; title: string; company: string }[];
  agenda: { time: string; activity: string }[];
  tags: string[];
  views: number;
  attendees: number;
  isRegistered: boolean;
  createdAt: string;
}

export interface EventDetail extends Event {
  updatedAt: string;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  myEvents: number;
}

export interface EventFilters {
  types: string[];
  categories: string[];
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  category?: string;
  status?: string;
  myEvents?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface EventsResponse {
  events: Event[];
  pagination: Pagination;
  filters: EventFilters;
}

// Events API
export const eventsApi = {
  getStats: async (): Promise<{ stats: EventStats }> => {
    const response = await apiClient.get("/events/stats");
    return response.data;
  },

  getAll: async (params: EventsQueryParams = {}): Promise<EventsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page.toString());
    if (params.limit) queryParams.set("limit", params.limit.toString());
    if (params.search) queryParams.set("search", params.search);
    if (params.type && params.type !== "all") queryParams.set("type", params.type);
    if (params.category && params.category !== "all") queryParams.set("category", params.category);
    if (params.status && params.status !== "all") queryParams.set("status", params.status);
    if (params.myEvents) queryParams.set("myEvents", "true");
    if (params.startDate) queryParams.set("startDate", params.startDate);
    if (params.endDate) queryParams.set("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = queryString ? `/events?${queryString}` : "/events";

    const response = await apiClient.get(url);
    return response.data;
  },

  getOne: async (id: number): Promise<{ event: EventDetail }> => {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  },

  toggleRegistration: async (
    id: number,
  ): Promise<{ registered: boolean; attendees: number; message: string }> => {
    const response = await apiClient.post(`/events/${id}/register`);
    return response.data;
  },
};
