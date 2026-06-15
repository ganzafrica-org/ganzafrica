export type Role = "EMPLOYEE" | "IT" | "HR"

export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED"

export type LeaveType = "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER"

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"

export interface ApiValidationDetail {
    path: string
    message: string
}

export interface ApiErrorResponse {
    error: string
    message: string
    details?: ApiValidationDetail[]
}

export interface PaginatedResponse<T> {
    data: T[]
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface User {
    id: string
    name: string
    email: string
    role: string
    avatarUrl?: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: User
}

export interface RefreshTokenResponse {
    accessToken: string
    refreshToken: string
}

// --- EMPLOYEE ---
export type EmployeeType = "STAFF" | "FELLOW" | "CONSULTANT"

export interface Employee {
    name: string
    role: string
    id: string
    employeeId: string           // e.g. "GZ001"
    firstName: string
    lastName: string
    email: string
    phone: string
    position: string
    department: string
    location: string
    country: string
    status: "Active" | "On Leave" | "Inactive" | "Terminated"
    joinDate: string             // ISO date string
    age?: number
    gender?: string
    address?: string
    managerId?: string
    managerName?: string
    salary?: number
    skills?: string[]
    avatarUrl?: string
    contractId?: string
    type: EmployeeType
}

export interface CreateEmployeeRequest {
    firstName: string
    lastName: string
    email: string
    phone: string
    position: string
    department: string
    location: string
    country: string
    status: "Active" | "On Leave" | "Inactive" | "Terminated"
    joinDate: string
    type: EmployeeType
    age?: number
    gender?: string
    address?: string
    managerId?: string
    salary?: number
    skills?: string[]
    avatarUrl?: string
    contractId?: string
}

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>

export interface EmployeeStats {
    total: number
    active: number
    onLeave: number
    newThisMonth: number
    [key: string]: number // any other stats the backend returns
}

// --- LEAVE ---
export interface Leave {
    id: string
    employeeId: string
    employeeName: string
    type: string
    startDate: string
    endDate: string
    status: "Pending" | "Approved" | "Rejected"
    reason?: string
}

// --- ASSET ---
export interface Asset {
    id: string
    serialNumber: string
    device: string
    generation: string
    core: string
    ram: string
    hardDisk: string
    purchasePrice: number
    assignedTo?: string
    assignedToId?: string
    assignedDate?: string
    hasIssues: boolean
    issueDescription?: string
}

export interface CreateAssetRequest {
    serialNumber: string
    device: string
    generation: string
    core: string
    ram: string
    hardDisk: string
    purchasePrice: number
    assignedTo?: string
    assignedToId?: string
    assignedDate?: string
    hasIssues: boolean
    issueDescription?: string
}

export type UpdateAssetRequest = Partial<CreateAssetRequest>

export interface AssetStats {
    total: number
    assigned: number
    unassigned: number
    totalValue: number
    // percentage changes if returned by backend
}

// --- SHARED ---
export interface StatsChange {
    value: number
    direction: "up" | "down"
    comparedTo: string
}

export interface LeaveRequestPayload {
    leaveType: LeaveType
    startDate: string
    endDate: string
    reason?: string
}

export interface LeaveApprovalPayload {
    approved: boolean
    comment?: string
}

export interface HelpdeskTicketPayload {
    title: string
    description: string
}

export interface HelpdeskAnswerPayload {
    answer: string
    status?: TicketStatus
}

export interface NotificationItem {
    id: string
    title: string
    body: string
    createdAt: string
    read: boolean
}

// --- POLICY ---
export interface Policy {
    id: string
    name?: string
    policy_name?: string
    description?: string
    feature?: string
    status?: string
    lastEdited?: string
    last_edited?: string
    type?: string
    assigned?: number
    workers_assigned?: number
    country?: string
    allowance?: string
    carryover?: string
}
