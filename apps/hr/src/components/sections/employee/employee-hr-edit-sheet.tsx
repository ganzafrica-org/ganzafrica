"use client";

import { useEffect, useState } from "react";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateEmployee } from "@/hooks/useEmployees";
import type { Employee, EmploymentType, UpdateEmployeeRequest } from "@/types/api";

const EMPLOYMENT_TYPES: EmploymentType[] = ["staff", "fellow", "analyst", "contractor", "intern"];

interface EmployeeHrEditSheetProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * HR-only edit sheet for the employee detail page's Profile tab — HR_EDITABLE_FIELDS exactly.
 * `manager_id` is deliberately absent: the backend supports it, but MOD-01 keeps manager editing
 * out of the UI until MOD-02 ships manager validation.
 */
export function EmployeeHrEditSheet({ employee, open, onOpenChange }: EmployeeHrEditSheetProps) {
  const updateEmployee = useUpdateEmployee();
  const [form, setForm] = useState<UpdateEmployeeRequest>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      first_name: employee.first_name,
      last_name: employee.last_name,
      employee_number: employee.employee_number,
      work_email: employee.work_email,
      job_title: employee.job_title,
      department: employee.department,
      employment_type: employee.employment_type,
      status: employee.status === "on_leave" ? "on_leave" : "active",
      hired_at: employee.hired_at,
    });
    setError(null);
  }, [employee, open]);

  const handleSave = async () => {
    setError(null);
    try {
      await updateEmployee.mutateAsync({ id: employee.id, payload: form });
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save.");
    }
  };

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Employee"
      description="HR-managed fields. Status changes to onboarding/offboarding/exited happen through the lifecycle process, not here."
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-white"
            onClick={handleSave}
            disabled={updateEmployee.isPending}
          >
            {updateEmployee.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      }
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>First Name</Label>
            <Input
              value={form.first_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name</Label>
            <Input
              value={form.last_name ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Work Email</Label>
          <Input
            type="email"
            value={form.work_email ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, work_email: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Job Title</Label>
            <Input
              value={form.job_title ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, job_title: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Department</Label>
            <Input
              value={form.department ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Employee Number</Label>
            <Input
              value={form.employee_number ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, employee_number: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Employment Type</Label>
            <Select
              value={form.employment_type ?? ""}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, employment_type: v as EmploymentType }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={form.status ?? "active"}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v as "active" | "on_leave" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Hired Date</Label>
            <Input
              type="date"
              value={form.hired_at ? form.hired_at.slice(0, 10) : ""}
              onChange={(e) => setForm((f) => ({ ...f, hired_at: e.target.value }))}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </ReusableSheet>
  );
}
