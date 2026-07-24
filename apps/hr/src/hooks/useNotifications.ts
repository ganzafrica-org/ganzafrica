"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";

export function useNotifications(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationsService.getNotifications(params),
  });
}
