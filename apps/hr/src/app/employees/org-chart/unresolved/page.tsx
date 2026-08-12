"use client";

import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUnresolvedManagers, useSetManager } from "@/hooks/useOrg";
import { ManagerPicker } from "@/components/sections/employee/manager-picker";
import type { CycleErrorResponse } from "@/types/api";

/** MOD-02 §5 — backfill leftovers HR works down to zero; a row clears itself on assignment. */
export default function UnresolvedManagersPage() {
  const { roles } = useAuth();
  const canManage = roles.includes("hr") || roles.includes("admin");
  const { data: rows, isLoading, isError } = useUnresolvedManagers();
  const setManager = useSetManager();

  const assign = async (employeeId: string, managerId: string | null) => {
    if (!managerId) return;
    try {
      await setManager.mutateAsync({ employeeId, payload: { manager_id: managerId } });
      toast.success("Manager assigned");
    } catch (err: any) {
      const data = err?.response?.data as CycleErrorResponse | undefined;
      if (data?.error === "cycle") {
        toast.error("That assignment would create a reporting cycle", {
          description: data.path.join(" → "),
        });
      } else {
        toast.error(err?.response?.data?.message ?? "Failed to assign manager.");
      }
    }
  };

  if (!canManage) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center text-muted-foreground">
        You don&apos;t have access to this page.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-big font-bold text-slate-900 dark:text-white">Unresolved Managers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            The manager backfill couldn&apos;t match these employees&apos; legacy reporting text to
            exactly one person. Assign a manager for each to clear it from this list.
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground py-6">Loading…</p>}
        {isError && <p className="text-sm text-red-500 py-6">Failed to load the worklist.</p>}
        {!isLoading && !isError && !rows?.length && (
          <p className="text-sm text-muted-foreground py-6">
            Nothing unresolved — every employee has a manager assigned.
          </p>
        )}

        <div className="space-y-3">
          {rows?.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-4 rounded-lg border bg-white dark:bg-slate-900 p-4"
            >
              <div className="min-w-0">
                <div className="font-medium text-slate-900 dark:text-white">
                  {row.employee_name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Legacy text: &ldquo;{row.raw_text}&rdquo;
                </div>
              </div>
              <div className="w-64 shrink-0">
                <ManagerPicker
                  currentName={null}
                  excludeEmployeeId={row.employee_id}
                  onChange={(id) => assign(row.employee_id, id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
