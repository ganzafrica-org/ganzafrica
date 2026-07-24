import { Calendar, ChevronDown, MoreHorizontal, Plus, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";
import { Button } from "@/components/ui/button";
import { LeaveRequests } from "@/components/sections/calendar/LeaveRequests";
import { PublicHolidays } from "@/components/sections/calendar/PublicHolidays";

interface ProfileProps {
  selectedEmployee: any;
  isEditing: boolean;
  editForm: any;
  setEditForm: (val: any) => void;
}

export const Overview = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEEDFE] text-[15px] text-[#534AB7]">
                <i className="ti ti-user" aria-hidden="true" />
              </div>
              <p className="text-laj font-medium text-[color:var(--color-text-primary)]">Profile</p>
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Name</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Christian Sangwa
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">ID</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                #54
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Role</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Agribusiness Expert
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Country</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Rwanda
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Status</p>
              <p className="flex-1 text-right">
                <p className="inline-flex items-center gap-1 rounded-full bg-[#EAF3DE] px-2 py-[2px] text-[11px] font-medium text-[#3B6D11]">
                  <p className="h-1.5 w-1.5 rounded-full bg-[#639922]" />
                  Active
                </p>
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F1FB] text-[15px] text-[#185FA5]">
                <i className="ti ti-briefcase" aria-hidden="true" />
              </div>
              <p className="text-laj font-medium text-[color:var(--color-text-primary)]">
                Role details
              </p>
            </div>
            <button className="rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-3 py-1 text-[12px] text-[color:var(--color-text-secondary)]">
              View
            </button>
          </div>

          <div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Job title</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Agribusiness Expert
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Employment type</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Part-time (50%)
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Base compensation · Part-time</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Fr 100,000.00{" "}
                <p className="block text-[11px] font-normal text-[color:var(--color-text-secondary)]">
                  Monthly
                </p>
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Contract</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Permanent
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Leaves</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                21 days / year
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Department</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Engineering
              </p>
            </div>
          </div>

          <div className="flex gap-2 px-4 py-3">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-2 py-2 text-[12px] text-[color:var(--color-text-primary)]">
              <i className="ti ti-edit text-sm" aria-hidden="true" />
              Edit worker details
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#F09595] bg-[#FCEBEB] px-2 py-2 text-[12px] text-[#A32D2D]">
              <i className="ti ti-file-x text-sm" aria-hidden="true" />
              End a contract
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[15px] text-[#0F6E56]">
                <i className="ti ti-user-circle" aria-hidden="true" />
              </div>
              <p className="text-laj font-medium text-[color:var(--color-text-primary)]">
                Personal
              </p>
            </div>
            <button className="rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-3 py-1 text-[12px] text-[color:var(--color-text-secondary)]">
              View
            </button>
          </div>

          <div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">First name</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Christian
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Last name</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Sangwa
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Home address</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Kicukiro, Kigali 00000, Rwanda
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Personal email</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                christian@gmail.com
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Personal phone</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                +250 788 000 000
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Country</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Rwanda
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAEEDA] text-[15px] text-[#854F0B]">
                <i className="ti ti-settings" aria-hidden="true" />
              </div>
              <p className="text-laj font-medium text-[color:var(--color-text-primary)]">General</p>
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Manager</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                —
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Report</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                —
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Position</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Agribusiness Expert
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Start date</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                1 Jan 2023
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Work email</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                christian@company.com
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Work location</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                Kigali, Rwanda
              </p>
            </div>
            <div className="flex items-start justify-between px-4 py-[9px]">
              <p className="flex-1 text-slate-400 text-sm">Last day of work</p>
              <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
                —
              </p>
            </div>
          </div>

          <div className="flex gap-2 px-4 py-3">
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-2 py-2 text-[12px] text-[color:var(--color-text-secondary)]">
              <i className="ti ti-file-plus text-sm" aria-hidden="true" />
              Add contract
            </button>
            <button className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#F09595] bg-[#FCEBEB] px-2 py-2 text-[12px] text-[#A32D2D]">
              <i className="ti ti-file-x text-sm" aria-hidden="true" />
              End a contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Profile = ({ selectedEmployee, isEditing, editForm, setEditForm }: ProfileProps) => {
  return (
    <>
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <p>Employee ID</p>
            <p className="font-mono font-bold text-slate-900">#{selectedEmployee.employeeId}</p>
            <p className="mx-1">•</p>
            <p className="flex items-center gap-1">
              <User className="h-3 w-3" />
              STAFF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-md">
            <AvatarImage src={selectedEmployee.avatar} />
            <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-bold">
              {selectedEmployee.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-500">Change Status</p>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 gap-1.5 py-1 px-3">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                <MoreHorizontal className="h-3 w-3 ml-1" />
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Position</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {selectedEmployee.position}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Join Date</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {new Date(selectedEmployee.joinDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Department</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {selectedEmployee.department}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">General info</h4>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="edit-name"
                  className="text-[10px] uppercase font-bold text-slate-400"
                >
                  Full Name
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
                  htmlFor="edit-phone"
                  className="text-[10px] uppercase font-bold text-slate-400"
                >
                  Phone Number
                </Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-position"
                  className="text-[10px] uppercase font-bold text-slate-400"
                >
                  Position
                </Label>
                <Input
                  id="edit-position"
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-email"
                  className="text-[10px] uppercase font-bold text-slate-400"
                >
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit-location"
                  className="text-[10px] uppercase font-bold text-slate-400"
                >
                  Location
                </Label>
                <Input
                  id="edit-location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Full Name</div>
                <div className="text-sm font-medium text-slate-900">{selectedEmployee.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Phone Number</div>
                <div className="text-sm font-medium text-slate-900">{selectedEmployee.phone}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Age</div>
                <div className="text-sm font-medium text-slate-900">28</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Email</div>
                <div className="text-sm font-medium text-slate-900">{selectedEmployee.email}</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Gender</div>
                <div className="text-sm font-medium text-slate-900">Female</div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Address</div>
                <div className="text-sm font-medium text-slate-900">
                  {selectedEmployee.location}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold flex items-center gap-2">Work Details</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Manager</div>
              <div className="text-sm font-medium text-slate-900">{selectedEmployee.manager}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400">Salary</div>
              <div className="text-sm font-medium text-slate-900">{selectedEmployee.salary}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {selectedEmployee?.skills?.map((skill: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-slate-100 text-slate-600 border-none font-normal text-xs px-3 py-1"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export const Leaves = () => {
  const balances = [
    {
      id: 1,
      name: "Annual Leave",
      available: 8,
    },
  ];

  return (
    <div className="w-full bg-white pt-5 overflow-y-auto shrink-0 flex flex-col">
      <div className="p-6 space-y-8 flex-1">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Time Off Requests
            </h2>
            <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
              View All
            </button>
          </div>
          {/*<LeaveRequests />*/}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Public Holidays
            </h2>
          </div>
          {/*<PublicHolidays />*/}
        </section>

        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Annual Leaves</h2>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {balances.map((balance) => (
            <div key={balance.id}>
              <p className="text-sm font-medium text-gray-700">{balance.name}</p>
              <p className="text-lg font-semibold text-gray-900">
                {balance.available} days available
              </p>
            </div>
          ))}
          <button className="text-sm font-medium text-brand-accent hover:text-brand-dark flex items-center gap-1">
            View details
            <ChevronDown size={14} />
          </button>
        </div>
        <button className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors">
          View all
        </button>
      </div>
    </div>
  );
};

export const Contracts = () => {
  return <p>Contracts contents</p>;
};
