import axios, { AxiosHeaders } from "axios";
import { NEXT_PUBLIC_BACKEND_URL } from "@/utils/helpers/env";
import { RefreshTokenResponse } from "@/types/api";

const httpClient = axios.create({
    baseURL: NEXT_PUBLIC_BACKEND_URL,
});

let refreshPromise: Promise<string | null> | null = null;

// Request interceptor: attach Authorization header
httpClient.interceptors.request.use((config) => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    if (accessToken) {
        if (config.headers instanceof AxiosHeaders) {
            config.headers.set("Authorization", `Bearer ${accessToken}`);
        } else {
            config.headers = Object.assign({}, config.headers, {
                Authorization: `Bearer ${accessToken}`,
            });
        }
    }
    return config;
});

// Response interceptor: handle 401 and refresh token
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!refreshPromise) {
                const refreshToken = localStorage.getItem("refreshToken");
                if (!refreshToken) {
                    handleAuthFailure();
                    return Promise.reject(error);
                }

                refreshPromise = axios
                    .post<RefreshTokenResponse>(`${NEXT_PUBLIC_BACKEND_URL}/auth/refresh`, {
                        refreshToken,
                    })
                    .then((res) => {
                        const { accessToken } = res.data;
                        localStorage.setItem("accessToken", accessToken);
                        return accessToken;
                    })
                    .catch((err) => {
                        handleAuthFailure();
                        return null;
                    })
                    .finally(() => {
                        refreshPromise = null;
                    });
            }

            const token = await refreshPromise;
            if (token) {
                originalRequest.headers["Authorization"] = `Bearer ${token}`;
                return httpClient(originalRequest);
            }
        }

        return Promise.reject(error);
    }
);

function handleAuthFailure() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (typeof window !== 'undefined') {
        window.location.href = "/auth/login";
    }
}

export default httpClient;

// Keep this for backward compatibility if needed by other services during transition
export { httpClient };
