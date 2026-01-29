import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Interface for token payload
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

// Helper function to refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api"}/auth/refresh-token`,
      { refresh_token: refreshToken },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data?.token) {
      const newAccessToken = response.data.token;
      localStorage.setItem("accessToken", newAccessToken);

      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
      }

      return newAccessToken;
    }

    return null;
  } catch (error: any) {
    console.error("Failed to refresh token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("internal_user");
    return null;
  }
};

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Request interceptor for adding tokens
apiClient.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");

    if (token) {
      if (isTokenExpired(token)) {
        if (isRefreshing && refreshPromise) {
          token = await refreshPromise;
        } else {
          isRefreshing = true;
          refreshPromise = refreshAccessToken();
          token = await refreshPromise;
          isRefreshing = false;
          refreshPromise = null;
        }
      }
    } else {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
        token = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;
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

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("internal_user");

        if (typeof window !== "undefined") {
          const portalUrl =
            process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3001";
          window.location.href = `${portalUrl}/login`;
        }
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
