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

// Helper to log token payload for debugging
const logTokenPayload = (token: string, label = 'Token payload'): void => {
    try {
        const decoded = jwtDecode(token);
        console.log(label, decoded);
    } catch (error) {
        console.error('Failed to decode token for logging:', error);
    }
};

// Request interceptor for adding tokens or other common headers
apiClient.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem('accessToken');
        console.log('Token exists:', !!token);
        
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp) {
                    console.log('Token expires at:', new Date(decoded.exp * 1000).toLocaleString());
                } else {
                    console.warn('Token does not have an expiration time.');
                }
                console.log('Current time:', new Date().toLocaleString());
                console.log('Token is expired:', isTokenExpired(token));
            } catch (error) {
                console.error('Failed to decode token:', error);
            }
        }
        
        // If token exists but is expired, try to refresh it first
        if (token && isTokenExpired(token)) {
            console.log('Attempting to refresh token...');
            // Rest of refresh logic...
        }
        
        // Add token to headers if it exists
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('Authorization header set to:', config.headers['Authorization']);
        } else {
            console.log('No token available to set Authorization header');
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
                logTokenPayload(response.data.token, 'Login token payload:');
                
                // Store refresh token if provided
                if (response.data.refreshToken) {
                    localStorage.setItem('refreshToken', response.data.refreshToken);
                }
            } else {
                console.warn('Login response missing token:', response.data);
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

export default apiClient;