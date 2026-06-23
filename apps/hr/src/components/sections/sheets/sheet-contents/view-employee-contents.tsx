import {Calendar, MoreHorizontal, User, Users} from "lucide-react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Badge} from "@/components/ui/badge";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import React from "react";

interface ProfileProps {
    selectedEmployee: any;
    isEditing: boolean;
    editForm: any;
    setEditForm: (val: any) => void;
}


export const Overview =()=>{
    return(
        <div className="p-6 border-b space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-lg border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)]">
                    <div className="flex items-center justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEEDFE] text-[15px] text-[#534AB7]">
                                <i className="ti ti-user" aria-hidden="true" />
                            </div>
                            <span className="text-[13px] font-medium text-[color:var(--color-text-primary)]">
              Profile
            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Name
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Christian Sangwa
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              ID
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              #54
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Role
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Agribusiness Expert
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Country
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Rwanda
            </span>
                        </div>
                        <div className="flex items-start justify-between px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Status
            </span>
                            <span className="flex-1 text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF3DE] px-2 py-[2px] text-[11px] font-medium text-[#3B6D11]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#639922]" />
                Active
              </span>
            </span>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)]">
                    <div className="flex items-center justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F1FB] text-[15px] text-[#185FA5]">
                                <i className="ti ti-briefcase" aria-hidden="true" />
                            </div>
                            <span className="text-[13px] font-medium text-[color:var(--color-text-primary)]">
              Role details
            </span>
                        </div>
                        <button className="rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-3 py-1 text-[12px] text-[color:var(--color-text-secondary)]">
                            View
                        </button>
                    </div>

                    <div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Job title
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Agribusiness Expert
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Employment type
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Part-time (50%)
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Base compensation · Part-time
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Fr 100,000.00{" "}
                                <span className="block text-[11px] font-normal text-[color:var(--color-text-secondary)]">
                Monthly
              </span>
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Contract
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Permanent
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Leaves
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              21 days / year
            </span>
                        </div>
                        <div className="flex items-start justify-between px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Department
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Engineering
            </span>
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

                <div className="overflow-hidden rounded-lg border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)]">
                    <div className="flex items-center justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[15px] text-[#0F6E56]">
                                <i className="ti ti-user-circle" aria-hidden="true" />
                            </div>
                            <span className="text-[13px] font-medium text-[color:var(--color-text-primary)]">
              Personal
            </span>
                        </div>
                        <button className="rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-3 py-1 text-[12px] text-[color:var(--color-text-secondary)]">
                            View
                        </button>
                    </div>

                    <div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              First name
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Christian
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Last name
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Sangwa
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Home address
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Kicukiro, Kigali 00000, Rwanda
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Personal email
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              christian@gmail.com
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Personal phone
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              +250 788 000 000
            </span>
                        </div>
                        <div className="flex items-start justify-between px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Country
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Rwanda
            </span>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-primary)]">
                    <div className="flex items-center justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAEEDA] text-[15px] text-[#854F0B]">
                                <i className="ti ti-settings" aria-hidden="true" />
                            </div>
                            <span className="text-[13px] font-medium text-[color:var(--color-text-primary)]">
              General
            </span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Manager
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              —
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Report
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              —
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Position
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Agribusiness Expert
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Start date
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              1 Jan 2023
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Work email
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              christian@company.com
            </span>
                        </div>
                        <div className="flex items-start justify-between border-b border-[color:var(--color-border-tertiary)] px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Work location
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              Kigali, Rwanda
            </span>
                        </div>
                        <div className="flex items-start justify-between px-4 py-[9px]">
            <span className="flex-1 text-[12px] text-[color:var(--color-text-secondary)]">
              Last day of work
            </span>
                            <span className="flex-1 text-right text-[12px] font-medium text-[color:var(--color-text-primary)]">
              —
            </span>
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
    )
}

export const Profile=({ selectedEmployee, isEditing, editForm, setEditForm }: ProfileProps)=>{
    return(
        <>
            <div className="p-6 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Employee ID</span>
                        <span className="font-mono font-bold text-slate-900">#{selectedEmployee.employeeId}</span>
                        <span className="mx-1">•</span>
                        <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                STAFF
                            </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                        <AvatarImage src={selectedEmployee.avatar} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-xl font-bold">
                            {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="text-xl font-bold">{selectedEmployee.name}</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Change Status</span>
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
                            {new Date(selectedEmployee.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
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
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        General info
                    </h4>
                    {isEditing ? (
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-[10px] uppercase font-bold text-slate-400">Full Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone" className="text-[10px] uppercase font-bold text-slate-400">Phone Number</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-position" className="text-[10px] uppercase font-bold text-slate-400">Position</Label>
                                <Input
                                    id="edit-position"
                                    value={editForm.position}
                                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email" className="text-[10px] uppercase font-bold text-slate-400">Email</Label>
                                <Input
                                    id="edit-email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-location" className="text-[10px] uppercase font-bold text-slate-400">Location</Label>
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
                                <div className="text-sm font-medium text-slate-900">{selectedEmployee.location}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                        Work Details
                    </h4>
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
                            <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-600 border-none font-normal text-xs px-3 py-1">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export const Leaves=()=>{
    return(
        <p>Leaves contents</p>
    )
}

export const Contracts=()=>{
    return(
        <p>Contracts contents</p>
    )
}