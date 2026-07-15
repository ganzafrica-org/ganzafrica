import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building,
  LayoutDashboard,
  Contact,
  CreditCard,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

type Department = {
  name: string;
  count: number;
  active: number;
  onLeave: number;
};

interface DepartmentSheetProps {
  selectedDepartment: Department;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editForm: Department | null;
  setEditForm: (val: Department) => void;
  handleSaveEdit: () => void;
  handleDeleteDepartment: () => void;
}

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

export const DepartmentSheet = ({
  selectedDepartment,
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  handleSaveEdit,
  handleDeleteDepartment,
}: DepartmentSheetProps) => {
  const inactive =
    selectedDepartment.count - selectedDepartment.active - selectedDepartment.onLeave;

  return (
    <div className="flex h-full">
      {/* Side Tabs */}
      <div className="w-16 border-r flex flex-col items-center py-6 gap-6 bg-slate-50/50">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Building className="h-5 w-5" />
        </div>
        <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
          <Contact className="h-5 w-5" />
        </div>
        <div className="p-2 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Department</span>
              <span className="mx-1">•</span>
              <span className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                DEPT
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border"
                onClick={() => {
                  if (isEditing) {
                    handleSaveEdit();
                  } else {
                    setIsEditing(true);
                    setEditForm({ ...selectedDepartment });
                  }
                }}
              >
                <Edit className="h-4 w-4 text-slate-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full border text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={handleDeleteDepartment}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white shadow-md">
              <AvatarFallback
                className={`text-xl font-bold ${deptColors[selectedDepartment.name] ?? "bg-slate-100 text-slate-600"}`}
              >
                {getDeptInitials(selectedDepartment.name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{selectedDepartment.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Status</span>
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-3"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active
                  <MoreHorizontal className="h-3 w-3 ml-1" />
                </Badge>
              </div>
            </div>
          </div>

          {/* Top stats strip */}
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Total Staff</div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                {selectedDepartment.count}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Active</div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                {selectedDepartment.active}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400">On Leave</div>
              <div className="text-sm font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                {selectedDepartment.onLeave}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* General info */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold">General Info</h4>
            {isEditing && editForm ? (
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className="text-[10px] uppercase font-bold text-slate-400"
                  >
                    Department Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-count"
                    className="text-[10px] uppercase font-bold text-slate-400"
                  >
                    Total Employees
                  </Label>
                  <Input
                    id="edit-count"
                    type="number"
                    value={editForm.count}
                    onChange={(e) => setEditForm({ ...editForm, count: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-active"
                    className="text-[10px] uppercase font-bold text-slate-400"
                  >
                    Active
                  </Label>
                  <Input
                    id="edit-active"
                    type="number"
                    value={editForm.active}
                    onChange={(e) => setEditForm({ ...editForm, active: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-onleave"
                    className="text-[10px] uppercase font-bold text-slate-400"
                  >
                    On Leave
                  </Label>
                  <Input
                    id="edit-onleave"
                    type="number"
                    value={editForm.onLeave}
                    onChange={(e) => setEditForm({ ...editForm, onLeave: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Department Name
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {selectedDepartment.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    Total Employees
                  </div>
                  <div className="text-sm font-medium text-slate-900">
                    {selectedDepartment.count}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Active</div>
                  <div className="text-sm font-medium text-slate-900">
                    {selectedDepartment.active}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">On Leave</div>
                  <div className="text-sm font-medium text-slate-900">
                    {selectedDepartment.onLeave}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Inactive</div>
                  <div className="text-sm font-medium text-slate-900">{inactive}</div>
                </div>
              </div>
            )}
          </div>

          {/* Headcount breakdown */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold">Headcount Breakdown</h4>
            <div className="space-y-3">
              {/* Active bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Active</span>
                  <span>
                    {selectedDepartment.count > 0
                      ? Math.round((selectedDepartment.active / selectedDepartment.count) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${
                        selectedDepartment.count > 0
                          ? (selectedDepartment.active / selectedDepartment.count) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              {/* On Leave bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>On Leave</span>
                  <span>
                    {selectedDepartment.count > 0
                      ? Math.round((selectedDepartment.onLeave / selectedDepartment.count) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{
                      width: `${
                        selectedDepartment.count > 0
                          ? (selectedDepartment.onLeave / selectedDepartment.count) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              {/* Inactive bar */}
              {inactive > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Inactive</span>
                    <span>{Math.round((inactive / selectedDepartment.count) * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-400 transition-all"
                      style={{ width: `${(inactive / selectedDepartment.count) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold">Status Tags</h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700 border-none font-normal text-xs px-3 py-1"
              >
                {selectedDepartment.active} Active
              </Badge>
              <Badge
                variant="secondary"
                className="bg-amber-100 text-amber-700 border-none font-normal text-xs px-3 py-1"
              >
                {selectedDepartment.onLeave} On Leave
              </Badge>
              {inactive > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-700 border-none font-normal text-xs px-3 py-1"
                >
                  {inactive} Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
