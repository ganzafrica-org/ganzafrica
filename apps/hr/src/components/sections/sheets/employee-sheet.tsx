import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Building,
    LayoutDashboard,
    Contact,
    CreditCard,
    Edit,
    Trash2,
    Calendar,
    Users,
    MoreHorizontal
} from "lucide-react"

interface EmployeeSheetProps {
    selectedEmployee: any;
    isEditing: boolean;
    setIsEditing: (val: boolean) => void;
    editForm: any;
    setEditForm: (val: any) => void;
    handleSaveEdit: () => void;
    handleDeleteEmployee: (id: string) => void;
}

export const EmployeeSheet = ({
    selectedEmployee,
    isEditing,
    setIsEditing,
    editForm,
    setEditForm,
    handleSaveEdit,
    handleDeleteEmployee
}: EmployeeSheetProps) => {
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
                <div className="p-6 border-b space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Employee ID</span>
                            <span className="font-mono font-bold text-slate-900">#{selectedEmployee.employeeId}</span>
                            <span className="mx-1">•</span>
                            <span className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                STAFF
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full border"
                                onClick={() => {
                                    if (isEditing) {
                                        handleSaveEdit()
                                    } else {
                                        setIsEditing(true)
                                        setEditForm({ ...selectedEmployee })
                                    }
                                }}
                            >
                                <Edit className="h-4 w-4 text-slate-600" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full border text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
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
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 py-1 px-3">
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
                                <Building className="h-3.5 w-3.5 text-slate-400" />
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
            </div>
        </div>
    )
}
