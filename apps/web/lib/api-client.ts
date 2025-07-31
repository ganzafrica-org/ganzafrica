import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Simple response interceptor for handling errors
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        console.error("API request failed (details):", { status: error.response?.status, data: error.response?.data, message: error.message });
        return Promise.reject(error);
    }
);

// Insert a request interceptor (for example, after the axios.create block) as follows:
apiClient.interceptors.request.use((config) => {
  console.log("Outgoing request (details):", { url: config.url, payload: config.data, headers: config.headers });
  return config;
}, (error) => { return Promise.reject(error); });

export default apiClient;