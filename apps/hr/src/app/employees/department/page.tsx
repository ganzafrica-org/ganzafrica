"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, AlertCircle, CheckCircle, Building2, Users, UserCheck } from "lucide-react";
import { DepartmentSheet } from "@/components/sections/sheets/department-sheet";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { StatsHeader } from "@/components/sections/header";
import { useDepartmentStats } from "@/hooks/useEmployees";

type Department = {
  name: string;
  count: number;
  active: number;
  onLeave: number;
};

const initialDepartmentStats: Department[] = [
  { name: "Agriculture", count: 25, active: 23, onLeave: 2 },
  { name: "Environment", count: 18, active: 16, onLeave: 2 },
  { name: "Land Management", count: 12, active: 11, onLeave: 1 },
  { name: "Human Resources", count: 5, active: 5, onLeave: 0 },
  { name: "Administration", count: 8, active: 7, onLeave: 1 },
  { name: "Fellowship Program", count: 15, active: 15, onLeave: 0 },
  { name: "East Africa Operations", count: 8, active: 8, onLeave: 0 },
  { name: "Research & Development", count: 6, active: 6, onLeave: 0 },
];

// Generate initials-based avatar color per department
const deptColors: Record<string, string> = {
  Agriculture: "bg-green-100 text-green-700",
  Environment: "bg-emerald-100 text-emerald-700",
  "Land Management": "bg-lime-100 text-lime-700",
  "Human Resources": "bg-blue-100 text-blue-700",
  Administration: "bg-violet-100 text-violet-700",
  "Fellowship Program": "bg-orange-100 text-orange-700",
  "East Africa Operations": "bg-cyan-100 text-cyan-700",
  "Research & Development": "bg-rose-100 text-rose-700",
};

const getDeptInitials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const Page = () => {
  const [departmentStats, setDepartmentStats] = useState<Department[]>(initialDepartmentStats);
  const { data: realStats, isLoading: statsLoading } = useDepartmentStats();

  const headerStats = useMemo(() => {
    const active = realStats?.departments.reduce((sum, d) => sum + d.active, 0) ?? 0;
    const onLeave = realStats?.departments.reduce((sum, d) => sum + d.on_leave, 0) ?? 0;
    return [
      {
        icon: Building2,
        label: "Total Departments",
        value: String(realStats?.total_departments ?? 0),
      },
      { icon: Users, label: "Total Employees", value: String(realStats?.total_employees ?? 0) },
      { icon: UserCheck, label: "Active", value: String(active) },
      { icon: AlertCircle, label: "On Leave", value: String(onLeave) },
    ];
  }, [realStats]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Department | null>(null);

  const handleViewDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setEditForm({ ...dept });
    setIsEditing(false);
    setSheetOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editForm || !selectedDepartment) return;
    setDepartmentStats((prev) =>
      prev.map((d) => (d.name === selectedDepartment.name ? { ...editForm } : d)),
    );
    setSelectedDepartment(editForm);
    setIsEditing(false);
  };

  const handleDeleteDepartment = () => {
    if (!selectedDepartment) return;
    setDepartmentStats((prev) => prev.filter((d) => d.name !== selectedDepartment.name));
    setSheetOpen(false);
    setSelectedDepartment(null);
  };

  return (
    <div className="min-h-screen py-6 bg-transparent">
      <div className="max-w-full flex flex-col gap-6">
        <StatsHeader
          title="Departments"
          subtitle="Headcount by department"
          stats={headerStats}
          isLoading={statsLoading}
        />
        <div className="flex flex-col gap-4">
          {departmentStats.map((dept) => (
            <div
              key={dept.name}
              className="bg-white dark:bg-neutral-900 flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all duration-300"
            >
              {/* Left: department identity */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback
                    className={deptColors[dept.name] ?? "bg-slate-100 text-slate-600"}
                  >
                    {getDeptInitials(dept.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-laj">{dept.name}</h4>
                  <p className="text-sm text-muted-foreground">{dept.count} total employees</p>
                </div>
              </div>

              {/* Right: stats + action */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{dept.active} Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <span>{dept.onLeave} On Leave</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => handleViewDepartment(dept)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department detail / edit sheet */}
      {selectedDepartment && (
        <ReusableSheet
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) setIsEditing(false);
          }}
          footer={
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 text-slate-600 hover:bg-white"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false);
                    setEditForm({ ...selectedDepartment });
                  } else {
                    setSheetOpen(false);
                  }
                }}
              >
                {isEditing ? "Cancel" : "Close"}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                onClick={() => {
                  if (isEditing) {
                    handleSaveEdit();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? "Save Changes" : "Edit Department"}
              </Button>
            </div>
          }
        >
          <DepartmentSheet
            selectedDepartment={selectedDepartment}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            handleSaveEdit={handleSaveEdit}
            handleDeleteDepartment={handleDeleteDepartment}
          />
        </ReusableSheet>
      )}
    </div>
  );
};

export default Page;
