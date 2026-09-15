"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { toast } from "@/lib/toast";

export function useSetting<T = unknown>(key: string) {
  return useQuery({
    queryKey: ["hr-settings", key],
    queryFn: () => settingsService.get<T>(key),
  });
}

export function useSetSetting<T = unknown>(key: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value: T) => settingsService.set(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr-settings", key] });
    },
    onError: () => toast.danger("Couldn't save setting"),
  });
}
