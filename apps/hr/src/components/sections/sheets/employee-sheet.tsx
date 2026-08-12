"use client";

import { useState } from "react";
import { User, LayoutDashboard, CalendarDays, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEmployee, useMe } from "@/hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import { getInitials, getStatusBadge } from "@/lib/helpers/employee-util";
import {
  Overview,
  Profile,
  Leaves,
  Contracts,
} from "@/components/sections/sheets/sheet-contents/view-employee-contents";

interface EmployeeSheetProps {
  employeeId: string;
  /** Lets "Reports to X" (and any future cross-employee link) re-target this same sheet. */
  onOpenEmployee?: (employeeId: string) => void;
}

export type ActiveTab = "overview" | "profile" | "leaves" | "contracts";

const SIDEBAR_ITEMS = [
  { id: "overview", icon: LayoutDashboard, label: "Overview" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "leaves", icon: CalendarDays, label: "Leaves" },
  { id: "contracts", icon: FileText, label: "Contracts" },
] as const;

export const EmployeeSheet = ({ employeeId, onOpenEmployee }: EmployeeSheetProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const { data: employee, isLoading, isError } = useEmployee(employeeId);
  const { data: me } = useMe();
  const { roles } = useAuth();

  const isHr = roles.includes("hr") || roles.includes("admin");
  const isSelf = me?.id === employeeId;

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  }

  if (isError || !employee) {
    return <div className="p-8 text-center text-red-500">Couldn&apos;t load this employee.</div>;
  }

  const name = `${employee.first_name} ${employee.last_name}`.trim();

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return (
          <Overview
            employee={employee}
            isHr={isHr}
            isSelf={isSelf}
            onNavigateTab={setActiveTab}
            onOpenEmployee={onOpenEmployee}
          />
        );
      case "profile":
        return <Profile employee={employee} isHr={isHr} isSelf={isSelf} />;
      case "leaves":
        return <Leaves employee={employee} isHr={isHr} isSelf={isSelf} />;
      case "contracts":
        return <Contracts employee={employee} isHr={isHr} isSelf={isSelf} />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-4 border-b px-6 py-4 shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={employee.picture ?? undefined} />
          <AvatarFallback className="bg-brand-accent/10 text-brand-accent font-bold">
            {getInitials(employee.first_name, employee.last_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{name}</h2>
            {getStatusBadge(employee.status)}
          </div>
          <p className="text-sm text-muted-foreground">
            {employee.job_title ?? "—"} · {employee.department ?? "—"}
          </p>
          {employee.manager && (
            <button
              onClick={() => onOpenEmployee?.(employee.manager!.id)}
              className="text-xs text-brand-accent hover:underline"
            >
              Reports to {employee.manager.first_name} {employee.manager.last_name}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-16 border-r flex flex-col items-center py-6 gap-6 bg-slate-50/50">
          {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              title={label}
              onClick={() => setActiveTab(id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                activeTab === id
                  ? "bg-white shadow-sm text-brand-accent"
                  : "text-slate-400 hover:text-brand-accent"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">{renderSection()}</div>
      </div>
    </div>
  );
};
