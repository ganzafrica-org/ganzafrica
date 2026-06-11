export type LeaveType =
    | "Annual Leave"
    | "Sick Leave"
    | "Casual"
    | "Emergency"
    | "Paid"
    | "Study Leave"
    | "Maternity Leave"
    | "Personal Leave"

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Used" | "Upcoming"

export interface TeamMember {
    id: string
    name: string
    department: string
    avatar: string
}

export interface LeaveRequest {
    id: string
    employeeId: string
    leaveType: LeaveType
    startDate: Date
    endDate: Date
    notes: string
    status: LeaveStatus
    requestedAt: Date
}

export interface PublicHoliday {
    id: string
    name: string
    date: Date
    startDate: Date
    endDate: Date
    status: LeaveStatus
}

export interface LeaveContextType {
    teamMembers: TeamMember[]
    leaveRequests: LeaveRequest[]
    publicHolidays: PublicHoliday[]
    addLeaveRequest: (
        employeeId: string,
        leaveType: LeaveType,
        startDate: Date,
        endDate: Date,
        notes: string
    ) => void
    updateLeaveRequest: (request: LeaveRequest) => void
    deleteLeaveRequest: (id: string) => void
    updateLeaveStatus: (id: string, status: LeaveStatus) => void
    addPublicHoliday: (holiday: Omit<PublicHoliday, "id">) => void
    updatePublicHoliday: (holiday: PublicHoliday) => void
    deletePublicHoliday: (id: string) => void
    getFilteredLeaves: (
        selectedMemberId?: string,
        selectedLeaveType?: LeaveType,
        dateRange?: { start: Date; end: Date }
    ) => LeaveRequest[]
    getTeamMemberById: (id: string) => TeamMember | undefined
}
