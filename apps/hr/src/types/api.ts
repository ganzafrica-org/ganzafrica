export type Role = "EMPLOYEE" | "IT" | "HR";

export type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED";

export type LeaveType = "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface ApiValidationDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: ApiValidationDetail[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// --- EMPLOYEE ---
export type EmployeeType = "STAFF" | "FELLOW" | "CONSULTANT";

export interface Employee {
  name: string;
  role: string;
  id: string;
  employeeId: string; // e.g. "GZ001"
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  location: string;
  country: string;
  status: "Active" | "On Leave" | "Inactive" | "Terminated";
  joinDate: string; // ISO date string
  age?: number;
  gender?: string;
  address?: string;
  managerId?: string;
  managerName?: string;
  salary?: number;
  skills?: string[];
  avatarUrl?: string;
  contractId?: string;
  type: EmployeeType;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  personalEmail: string;
  workEmail?: string | null;
  phone?: string | null;
  picture?: string | null;
  citizenship?: string | null;
  homeCountry?: string | null;
  homeCity?: string | null;
  role?: "EMPLOYEE" | "IT" | "HR";
  platformUserId?: number;
}

export type UpdateEmployeeRequest = Partial<CreateEmployeeRequest>;

export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  newThisMonth: number;
  [key: string]: number; // any other stats the backend returns
}

// --- LEAVE ---
export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason?: string;
}

// ─── Asset Category ───────────────────────────────────────────────────────────

export type SpecFieldType = "text" | "number" | "enum" | "boolean";

export interface SpecFieldDefinition {
  key: string;
  label: string;
  type: SpecFieldType;
  options?: string[]; // only when type === "enum"
  required: boolean;
  unit?: string; // display hint e.g. "GB", "inches"
}

export interface AssetCategory {
  id: string;
  name: string;
  parent_name: string | null;
  slug: string;
  is_active: boolean;
  sort_order: number;
  spec_schema: {
    key: string;
    label: string;
    type: string;
    unit?: string;
    options?: string[];
    required: boolean;
  }[];
  created_at: string;
  updated_at: string;
}

// NOTE: unlike the rest of this API, the category endpoints' validation schema on the
// backend was never converted to camelCase (createCategorySchema/updateCategorySchema
// require parent_name/spec_schema/sort_order verbatim) — these request types match that,
// intentionally inconsistent with CreateAssetRequest etc. above.
export interface CreateCategoryRequest {
  name: string;
  parent_name?: string;
  slug: string;
  spec_schema: SpecFieldDefinition[];
  sort_order?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// ─── Asset Spec & Image ───────────────────────────────────────────────────────

export interface AssetSpec {
  specKey: string;
  specValue: string;
}

export interface AssetImage {
  id: string;
  url: string;
  storageKey: string;
  isPrimary: boolean;
  sortOrder: number;
}

// ─── Asset ────────────────────────────────────────────────────────────────────

export type AssetStatus = "AVAILABLE" | "ASSIGNED" | "UNDER_MAINTENANCE" | "DISPOSED";
export type AssetIssue = "YES" | "NO";

export interface Asset {
  id: string;
  deviceName: string;
  serialNumber: string;
  categoryId: string;
  purchasePrice: string | null;
  status: AssetStatus;
  assignedToId: string | null;
  assignedAt: string | null;
  returnedAt: string | null;
  notes: string | null;
  hasIssue: AssetIssue;
  isFlagged: boolean;
  createdAt: string;
  updatedAt: string;
  // Nested
  category?: AssetCategory;
  specs?: AssetSpec[];
  images?: AssetImage[];
}

export interface CreateAssetRequest {
  deviceName: string;
  serialNumber: string;
  categoryId: string;
  purchasePrice?: string | null;
  assignedToId?: string | null;
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
  status?: AssetStatus;
  notes?: string;
  specs?: { key: string; value: string }[];
  // images are sent as FormData files, not JSON — handled separately
}

// PATCH /hr/assets/:id no longer accepts status or assignedToId directly — those go
// exclusively through assign/return/flag/unflag below, enforced server-side by the
// asset status machine.
export interface UpdateAssetRequest {
  deviceName?: string;
  serialNumber?: string;
  categoryId?: string;
  purchasePrice?: string | null;
  hasIssue?: AssetIssue;
  isFlagged?: boolean;
  notes?: string;
  specs?: { key: string; value: string }[];
}

export interface AssignAssetRequest {
  employeeId: string;
  notes?: string;
}

export interface ReturnAssetRequest {
  condition: string;
  notes?: string;
  hasIssue?: boolean;
}

export interface FlagAssetRequest {
  note?: string;
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  employeeId: string;
  assignedBy: number | null;
  assignedAt: string;
  returnedAt: string | null;
  returnCondition: string | null;
  notes: string | null;
}

export interface AssetHistory {
  assignments: AssetAssignment[];
  maintenance: AssetMaintenance[];
}

// One row per assignment (not per asset) — GET /hr/employees/:id/assets?open=true, the
// LCM-02 offboarding gate. Shape is frozen once LCM-02 consumes it.
export interface EmployeeAssetRow {
  assetId: string;
  deviceName: string;
  serialNumber: string;
  assignedAt: string;
  returnedAt: string | null;
  notes: string | null;
}

export interface AssetStats {
  total: number;
  available: number;
  assigned: number;
  underMaintenance: number;
  disposed: number;
}

// --- SHARED ---
export interface StatsChange {
  value: number;
  direction: "up" | "down";
  comparedTo: string;
}

export interface LeaveRequestPayload {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface LeaveApprovalPayload {
  approved: boolean;
  comment?: string;
}

export interface HelpdeskTicketPayload {
  title: string;
  description: string;
}

export interface HelpdeskAnswerPayload {
  answer: string;
  status?: TicketStatus;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface AssetMaintenance {
  id: string;
  assetId: string;
  requesterId: string;
  title: string;
  description: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  price: string | null;
  maintenanceDate: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  asset?: Asset;
}

export interface CreateMaintenanceRequest {
  assetId: string;
  requesterId: string;
  title: string;
  description?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  price?: string;
  maintenanceDate?: string;
}

export interface UpdateMaintenanceRequest {
  assetId?: string;
  requesterId?: string;
  title?: string;
  description?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  price?: string;
  maintenanceDate?: string;
  completedAt?: string;
}

// --- POLICY ---
export interface Policy {
  id: string;
  name?: string;
  policy_name?: string;
  description?: string;
  feature?: string;
  status?: string;
  lastEdited?: string;
  last_edited?: string;
  type?: string;
  assigned?: number;
  workers_assigned?: number;
  country?: string;
  allowance?: string;
  carryover?: string;
}
