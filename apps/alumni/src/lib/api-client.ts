import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  exp?: number;
  id?: string;
  email?: string;
}

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
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
    let token = localStorage.getItem("accessToken");

    if (token) {
      if (isTokenExpired(token)) {
        console.debug("Token expired, attempting to refresh...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        token = null;
      }
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("alumni_user");

      if (typeof window !== "undefined") {
        const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
        window.location.href = `${portalUrl}/login?user=alumni`;
      }
    }

    return Promise.reject(error);
  },
);

// Profile API functions
export const profileApi = {
  getCurrentProfile: async () => {
    const response = await apiClient.get("/users/profile/me");
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await apiClient.put("/users/profile/me", profileData);
    return response.data;
  },
};

export default apiClient;
