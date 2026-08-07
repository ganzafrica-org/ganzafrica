import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match && match[1] ? decodeURIComponent(match[1]) : null;
}

apiClient.interceptors.request.use((config) => {
  const method = (config.method || "get").toUpperCase();
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = readCookie("ganzafrica_csrf");
    if (csrf) config.headers["X-CSRF-Token"] = csrf;
  }
  return config;
});

let refreshPromise: Promise<boolean> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEntry =
      originalRequest?.url?.endsWith("/login") || originalRequest?.url?.endsWith("/refresh-token");
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEntry) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true })
          .then(() => true)
          .catch(() => false)
          .finally(() => {
            refreshPromise = null;
          });
      }
      if (await refreshPromise) return apiClient(originalRequest);
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Profile API functions
export const profileApi = {
  // Get current user's profile
  getCurrentProfile: async () => {
    const response = await apiClient.get("/users/profile/me");
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (profileData: any) => {
    const response = await apiClient.put("/users/profile/me", profileData);
    return response.data;
  },
};

export default apiClient;
