"use client"

import { useNotifications } from "@/hooks/useNotifications"

export function NotificationList() {
    const { data, isLoading, error } = useNotifications({ page: 1, limit: 20 })

    if (isLoading) return <p className="text-sm text-slate-500">Loading notifications...</p>
    if (error) return <p className="text-sm text-red-600">Failed to load notifications.</p>

    const items = data?.data ?? []

    if (!items.length) {
        return <p className="text-sm text-slate-500">No notifications available.</p>
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                    <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
            ))}
        </div>
    )
}
