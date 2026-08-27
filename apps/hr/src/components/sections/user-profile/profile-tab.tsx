"use client";

import { Briefcase, Calendar, Edit2, FileText, Package, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials, getStatusBadge } from "@/lib/helpers/employee-util";
import type { Employee } from "@/types/api";

interface ProfileTabProps {
  employee: Employee;
  onEditClick: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase font-semibold text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value || "—"}</div>
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-lg font-semibold text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

export default function ProfileTab({ employee, onEditClick }: ProfileTabProps) {
  const homeAddress = [employee.home_city, employee.home_country].filter(Boolean).join(", ");

  return (
    <div className="space-y-6 pb-6">
      {/* Identity card */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={employee.picture ?? undefined} />
                <AvatarFallback className="bg-brand-accent/10 text-brand-accent font-bold text-lg">
                  {getInitials(employee.first_name, employee.last_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {`${employee.first_name} ${employee.last_name}`.trim()}
                  </h2>
                  {getStatusBadge(employee.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {employee.job_title ?? "—"} · {employee.department ?? "—"}
                </p>
                {employee.manager && (
                  <p className="text-xs text-muted-foreground">
                    Reports to{" "}
                    <span className="font-medium text-foreground">
                      {employee.manager.first_name} {employee.manager.last_name}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEditClick}>
              <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <p>Employee ID</p>
            <p className="font-mono font-semibold text-foreground">
              {employee.employee_number ?? employee.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* At a glance */}
      {employee.counts && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatTile icon={Package} label="Assigned assets" value={employee.counts.assets} />
          <StatTile
            icon={Calendar}
            label="Open leave requests"
            value={employee.counts.open_leave}
          />
          <StatTile icon={FileText} label="Documents" value={employee.counts.documents} />
        </div>
      )}

      {/* HR-managed details */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Briefcase className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Employment details</h3>
            <p className="text-xs text-muted-foreground">Managed by HR — contact HR to change.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3">
          <Field label="Job Title" value={employee.job_title} />
          <Field label="Department" value={employee.department} />
          <Field
            label="Employment Type"
            value={<span className="capitalize">{employee.employment_type}</span>}
          />
          <Field label="Employee Number" value={employee.employee_number} />
          <Field label="Work Email" value={employee.work_email} />
          <Field
            label="Hire Date"
            value={employee.hired_at ? new Date(employee.hired_at).toLocaleDateString() : null}
          />
        </div>
      </div>

      {/* Personal & contact details */}
      <div className="bg-card rounded-lg border border-border p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Personal &amp; contact details
            </h3>
            <p className="text-xs text-muted-foreground">
              Self-editable — use the Edit button above to update these.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-3">
          <Field label="Phone" value={employee.phone} />
          <Field label="Personal Email" value={employee.personal_email} />
          <Field label="Citizenship" value={employee.citizenship} />
          <Field label="Home Address" value={homeAddress} />
        </div>
      </div>
    </div>
  );
}
