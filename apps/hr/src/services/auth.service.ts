import httpClient from "@/services/http.service";
import type { LoginRequest, LoginResponse, User } from "@/types/api";

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await httpClient.post<LoginResponse>("/auth/login", data);

        const fullResponse = response.data;
        const { accessToken, refreshToken } = fullResponse.data;

        if (typeof window !== 'undefined') {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        }

        return fullResponse;
    },

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        const response = await httpClient.post<{ accessToken: string }>("/auth/refresh", {
            refreshToken: token,
        });

        const authData = response.data; // ✅ same pattern

        if (typeof window !== 'undefined') {
            localStorage.setItem("accessToken", authData.accessToken);
        }

        return authData;
    },

    async logout(): Promise<void> {
        try {
            await httpClient.post("/auth/logout");
        } catch (error) {
            console.error("Logout request failed", error);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            }
        }
    },

    async getCurrentUser(): Promise<User> {
        const response = await httpClient.get<User>("employees/me");
        return response.data;
    },
};