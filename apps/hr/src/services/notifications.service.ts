import { httpClient } from "@/services/http.service";
import type { NotificationListResponse } from "@/types/api";

export const notificationsService = {
  async getNotifications(params?: Record<string, string | number | undefined>) {
    const response = await httpClient.get<NotificationListResponse>("/hr/notifications", {
      params,
    });
    return response.data;
  },
  async getUnreadCount() {
    const response = await httpClient.get<{ count: number }>("/hr/notifications/unread-count");
    return response.data.count;
  },
  async markRead(id: string) {
    await httpClient.patch(`/hr/notifications/${id}/read`);
  },
  async markAllRead() {
    await httpClient.patch("/hr/notifications/read-all");
  },
};
