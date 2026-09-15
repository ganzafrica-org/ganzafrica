"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";

export interface PickedEmployee {
  employeeId: string;
  userId: number;
  name: string;
}

interface MultiEmployeePickerProps {
  selected: PickedEmployee[];
  onChange: (selected: PickedEmployee[]) => void;
  /** Excluded from results — e.g. the employee whose own document this is. */
  excludeEmployeeId?: string;
  /** Also excluded from results — e.g. everyone already in a pool this picker adds to, so they
   *  can't be picked a second time. */
  excludeEmployeeIds?: Set<string>;
  /** When given, only these employee ids are offered — e.g. a designated signer pool, rather
   *  than the whole directory. Undefined means no restriction (the default). */
  allowedEmployeeIds?: Set<string>;
}

/** Multi-select variant of ManagerPicker — same search/data layer, checkbox-style selection. */
export function MultiEmployeePicker({
  selected,
  onChange,
  excludeEmployeeId,
  excludeEmployeeIds,
  allowedEmployeeIds,
}: MultiEmployeePickerProps) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useEmployees({ search: debouncedSearch || undefined, limit: 20 });
  const results = (data?.data ?? []).filter(
    (e) =>
      e.id !== excludeEmployeeId &&
      !excludeEmployeeIds?.has(e.id) &&
      e.user_id != null &&
      (!allowedEmployeeIds || allowedEmployeeIds.has(e.id)),
  );

  const isSelected = (employeeId: string) => selected.some((s) => s.employeeId === employeeId);

  const toggle = (employeeId: string, userId: number, name: string) => {
    if (isSelected(employeeId)) {
      onChange(selected.filter((s) => s.employeeId !== employeeId));
    } else {
      onChange([...selected, { employeeId, userId, name }]);
    }
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge key={s.employeeId} variant="secondary" className="gap-1 pr-1">
              {s.name}
              <button
                type="button"
                aria-label={`Remove ${s.name}`}
                className="rounded-sm hover:bg-slate-300/50"
                onClick={() => onChange(selected.filter((sel) => sel.employeeId !== s.employeeId))}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        placeholder="Search employees…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-56 overflow-y-auto rounded-md border">
        {isLoading && <p className="px-3 py-2 text-xs text-muted-foreground">Loading…</p>}
        {!isLoading && !results.length && (
          <p className="px-3 py-2 text-xs text-muted-foreground">No matches.</p>
        )}
        {results.map((e) => {
          const name = `${e.first_name} ${e.last_name}`.trim();
          const checked = isSelected(e.id);
          return (
            <label
              key={e.id}
              className="flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              <Checkbox checked={checked} onCheckedChange={() => toggle(e.id, e.user_id, name)} />
              <span className="flex-1 truncate">
                {name}
                {e.job_title ? (
                  <span className="text-muted-foreground"> — {e.job_title}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
