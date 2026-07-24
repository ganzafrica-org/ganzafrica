import { httpClient } from "@/services/http.service";
import type { NotificationItem, PaginatedResponse } from "@/types/api";

export const notificationsService = {
  async getNotifications(params?: Record<string, string | number | undefined>) {
    const response = await httpClient.get<PaginatedResponse<NotificationItem>>(
      "/hr/notifications",
      {
        params,
      },
    );
    return response.data;
  },
};
