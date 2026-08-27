"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployees } from "@/hooks/useEmployees";
import { useDebounce } from "@/hooks/useDebounce";

interface ManagerPickerProps {
  /** Currently selected manager's display name, if any (before the user searches). */
  currentName?: string | null;
  /** Excluded from results — an employee can't be their own manager. The server is the real
   *  authority on the full subtree exclusion (cycle check); this is just a client hint. */
  excludeEmployeeId: string;
  onChange: (managerId: string | null, managerName: string | null) => void;
}

/** Searchable employee select for MOD-02's manager reassignment (MOD-02 §5). */
export function ManagerPicker({ currentName, excludeEmployeeId, onChange }: ManagerPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { data, isLoading } = useEmployees({ search: debouncedSearch || undefined, limit: 20 });
  const results = (data?.data ?? []).filter((e) => e.id !== excludeEmployeeId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{currentName ?? "No manager"}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            autoFocus
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          <button
            type="button"
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-100"
            onClick={() => {
              onChange(null, null);
              setOpen(false);
            }}
          >
            No manager
          </button>
          {isLoading && <p className="px-2 py-1.5 text-xs text-muted-foreground">Loading…</p>}
          {!isLoading && !results.length && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">No matches.</p>
          )}
          {results.map((e) => {
            const name = `${e.first_name} ${e.last_name}`.trim();
            return (
              <button
                key={e.id}
                type="button"
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-100"
                onClick={() => {
                  onChange(e.id, name);
                  setOpen(false);
                }}
              >
                {name}
                {e.job_title ? (
                  <span className="text-muted-foreground"> — {e.job_title}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
