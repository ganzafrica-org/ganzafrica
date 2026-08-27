"use client";

import { useNotifications, useMarkNotificationRead } from "@/hooks/useNotifications";

export function NotificationList() {
  const { data, isLoading, error } = useNotifications({ limit: 20 });
  const markRead = useMarkNotificationRead();

  if (isLoading) return <p className="text-sm text-slate-500 p-4">Loading notifications...</p>;
  if (error) return <p className="text-sm text-red-600 p-4">Failed to load notifications.</p>;

  const items = data?.data ?? [];

  if (!items.length) {
    return <p className="text-sm text-slate-500 p-4">No notifications available.</p>;
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-white/5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => item.status === "UNREAD" && markRead.mutate(item.id)}
          className="w-full text-left p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
        >
          <div className="flex items-start gap-2">
            {item.status === "UNREAD" && (
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-accent shrink-0" />
            )}
            <div className="min-w-0">
              <p
                className={`text-sm ${item.status === "UNREAD" ? "font-semibold" : "font-medium text-slate-600 dark:text-slate-300"}`}
              >
                {item.title}
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.message}</p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(item.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
