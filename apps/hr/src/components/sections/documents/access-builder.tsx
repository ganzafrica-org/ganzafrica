"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployees } from "@/hooks/useEmployees";
import type { DocumentACL } from "@/types/api";

// RBAC role names (auth-and-rbac.md §2) that a document ACL can target. hr/admin are excluded —
// they already bypass every ACL, so listing them here would be a no-op.
const ASSIGNABLE_ROLES = [
  "director",
  "finance",
  "program_manager",
  "staff",
  "fellow",
  "analyst",
  "mentor",
  "alumni",
  "employee",
] as const;

interface AccessBuilderProps {
  value: DocumentACL;
  onChange: (value: DocumentACL) => void;
}

function toggle(list: string[] | undefined, item: string): string[] {
  const set = new Set(list ?? []);
  if (set.has(item)) set.delete(item);
  else set.add(item);
  return [...set];
}

/**
 * Produces exactly the frozen ACL shape: { roles?, employee_ids?, departments? }. Any-clause-
 * match; leaving everything unchecked means "HR/admin only" (null/empty ACL).
 */
export function AccessBuilder({ value, onChange }: AccessBuilderProps) {
  const [employeeSearch, setEmployeeSearch] = useState("");
  const { data: employeesData } = useEmployees({ search: employeeSearch, limit: 20 });
  const employees = employeesData?.data ?? [];

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[],
    [employees],
  );

  const selectedEmployeeIds = value.employee_ids ?? [];
  const selectedEmployees = employees.filter((e) => selectedEmployeeIds.includes(e.id));

  const setRoles = (roles: string[]) =>
    onChange({ ...value, roles: roles.length ? roles : undefined });
  const setDepartments = (departments: string[]) =>
    onChange({ ...value, departments: departments.length ? departments : undefined });
  const setEmployeeIds = (employee_ids: string[]) =>
    onChange({ ...value, employee_ids: employee_ids.length ? employee_ids : undefined });

  const isEmpty = !value.roles?.length && !value.employee_ids?.length && !value.departments?.length;

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div>
        <h4 className="font-medium text-slate-700">Who can see this document</h4>
        <p className="text-xs text-slate-500 mt-1">
          {isEmpty
            ? "No clauses selected — visible to HR/admin only."
            : "Visible to anyone matching ANY of the selected clauses below, plus HR/admin."}
        </p>
      </div>

      {/* Roles */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Roles</Label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {ASSIGNABLE_ROLES.map((role) => (
            <label key={role} className="flex items-center gap-1.5 text-sm text-slate-700">
              <Checkbox
                checked={(value.roles ?? []).includes(role)}
                onCheckedChange={() => setRoles(toggle(value.roles, role))}
              />
              <span className="capitalize">{role.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Departments */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Departments</Label>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {departments.length === 0 ? (
            <span className="text-xs text-slate-400">No departments found.</span>
          ) : (
            departments.map((dept) => (
              <label key={dept} className="flex items-center gap-1.5 text-sm text-slate-700">
                <Checkbox
                  checked={(value.departments ?? []).includes(dept)}
                  onCheckedChange={() => setDepartments(toggle(value.departments, dept))}
                />
                {dept}
              </label>
            ))
          )}
        </div>
      </div>

      {/* Employees */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-slate-600">Specific employees</Label>
        {selectedEmployees.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedEmployees.map((e) => (
              <Badge key={e.id} variant="secondary" className="gap-1 pr-1">
                {e.firstName} {e.lastName}
                <button
                  type="button"
                  onClick={() => setEmployeeIds(selectedEmployeeIds.filter((id) => id !== e.id))}
                  className="rounded-full hover:bg-slate-300/50 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search employees by name..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="pl-8 h-8 text-sm border-slate-200"
          />
        </div>
        {employeeSearch.trim().length > 0 && (
          <ScrollArea className="h-32 rounded-md border border-slate-200 bg-white">
            <div className="p-1">
              {employees.length === 0 ? (
                <p className="text-xs text-slate-400 px-2 py-1.5">No matching employees.</p>
              ) : (
                employees.map((e) => (
                  <label
                    key={e.id}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedEmployeeIds.includes(e.id)}
                      onCheckedChange={() => setEmployeeIds(toggle(value.employee_ids, e.id))}
                    />
                    <span>
                      {e.firstName} {e.lastName}
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">{e.department}</span>
                  </label>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
