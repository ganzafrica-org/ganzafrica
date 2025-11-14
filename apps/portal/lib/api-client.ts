import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Interface for token payload
interface TokenPayload {
    exp: number;
    id?: string;
    email?: string;
}

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout for requests
});

// Helper to check if token is expired
const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwtDecode<TokenPayload>(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch {
        return true;
    }
};

// Request interceptor for adding tokens or other common headers
apiClient.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem('accessToken');
        
        // If token exists but is expired, try to refresh it first
        if (token && isTokenExpired(token)) {
            // Rest of refresh logic...
        }
        
        // Add token to headers if it exists
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling login/logout and token storage
apiClient.interceptors.response.use(
    (response) => {
        // If login successful, store tokens
        if (response.config.url?.endsWith('/login')) {
            if (response.data.token) {
                localStorage.setItem('accessToken', response.data.token);
                
                // Store refresh token if provided
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
            }
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            // Clear tokens and redirect to login if not a login request
            if (!originalRequest.url?.endsWith('/login')) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                
                // Redirect to login page if in browser environment
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

// Profile API functions
export const profileApi = {
  // Get current user's profile
  getCurrentProfile: async () => {
    const response = await apiClient.get('/users/profile/me');
    return response.data;
  },

  // Update current user's profile
  updateProfile: async (profileData: any) => {
    const response = await apiClient.put('/users/profile/me', profileData);
    return response.data;
  },
};

export default apiClient;