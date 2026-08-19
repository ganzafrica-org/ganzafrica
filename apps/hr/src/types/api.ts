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

// --- EMPLOYEE (matches backend/src/types/employees.types.ts) ---
export type EmploymentType = "fellow" | "analyst" | "staff" | "contractor" | "intern";
export type EmployeeLifecycleStatus =
  | "pending"
  | "onboarding"
  | "active"
  | "on_leave"
  | "offboarding"
  | "exited";

export interface EmployeeManagerRef {
  id: string;
  first_name: string;
  last_name: string;
}

export interface EmployeeAccountRef {
  email: string;
  is_active: boolean;
}

export interface EmployeeContractSummary {
  id: string;
  job_title: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

/** The shape GET /hr/employees, GET /hr/employees/:id, and GET /hr/employees/me all return. */
export interface Employee {
  id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  work_email: string | null;
  personal_email: string | null;
  employee_number: string | null;
  job_title: string | null;
  department: string | null;
  employment_type: EmploymentType;
  status: EmployeeLifecycleStatus;
  picture: string | null;
  phone: string | null;
  citizenship: string | null;
  home_country: string | null;
  home_city: string | null;
  hired_at: string | null;
  manager: EmployeeManagerRef | null;
  /** Null when the employees row has no linked users account (a data gap HR can repair). */
  account: EmployeeAccountRef | null;
  /** Currency of the employee's ACTIVE contract, if any — the directory's country-flag proxy. */
  contract_currency: string | null;
  /** Reversible deactivation (replaces the old delete action) — independent of `status`. */
  is_active: boolean;
  /** Present on detail/me responses only (GET /hr/employees, the directory list, omits these). */
  counts?: { assets: number; open_leave: number; documents: number };
  contract?: EmployeeContractSummary | null;
  /** Present on GET /hr/employees/me only. */
  roles?: string[];
}

/** POST /hr/employees body — legacy staff manual add. */
export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  personal_email: string;
  work_email?: string | null;
  employee_number?: string | null;
  job_title?: string | null;
  department?: string | null;
  employment_type?: EmploymentType;
  hired_at?: string | null;
  phone?: string | null;
}

/** PATCH /hr/employees/:id body — HR-editable fields only (employees-core.service.ts HR_EDITABLE_FIELDS). */
export type UpdateEmployeeRequest = Partial<{
  first_name: string;
  last_name: string;
  employee_number: string | null;
  work_email: string | null;
  job_title: string | null;
  department: string | null;
  employment_type: EmploymentType;
  status: "active" | "on_leave";
  hired_at: string | null;
}>;

/** PATCH /hr/employees/me/profile body — self-editable fields only (SELF_EDITABLE_FIELDS). */
export type UpdateMyProfileRequest = Partial<{
  phone: string | null;
  picture: string | null;
  personal_email: string;
  home_city: string | null;
  home_country: string | null;
  citizenship: string | null;
}>;

/** GET /hr/org-chart node shape (MOD-02) — recursive, roots have no implicit parent. */
export interface OrgTreeNode {
  id: string;
  name: string;
  job_title: string | null;
  department: string | null;
  picture: string | null;
  children: OrgTreeNode[];
}

/** PATCH /hr/employees/:id/manager body. */
export interface SetManagerRequest {
  manager_id: string | null;
}

/** 422 body on a cycle rejection: `{"error":"cycle","path":[names]}`. */
export interface CycleErrorResponse {
  error: "cycle";
  path: string[];
}

/** GET /hr/org-chart/unresolved row (MOD-02 backfill worklist). */
export interface UnresolvedManagerRow {
  id: string;
  employee_id: string;
  raw_text: string;
  employee_name: string;
}

/** Computed client-side from the directory response — there is no backend /hr/employees/stats route. */
export interface EmployeeStats {
  total: number;
  active: number;
  onLeave: number;
  newThisMonth: number;
}

/**
 * GET /hr/employees response shape. Deliberately not PaginatedResponse<T> above — this endpoint
 * returns `pages`, not `totalPages`.
 */
export interface EmployeeDirectoryResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// --- CONTRACTS (matches backend/src/types/contract.types.ts — camelCase, unlike Employee above) ---
export type ContractEmploymentTerm = "indefinite" | "definite";
export type ContractEmploymentType = "full-time" | "part-time";
export type ContractCompensationType = "hourly" | "salaried";
export type ContractSalaryScale = "annual" | "monthly" | "weekly" | "daily";
export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface Contract {
  id: string;
  employeeId: string;
  jobTitle: string;
  department: string | null;
  workLocation: string | null;
  manager: string | null;
  reportTo: string | null;
  startDate: string;
  employmentTerm: ContractEmploymentTerm;
  endDate: string | null;
  employmentType: ContractEmploymentType;
  daysPerWeek: number | null;
  compensationType: ContractCompensationType;
  salaryScale: ContractSalaryScale | null;
  currency: string;
  baseMonthlyRate: string | null;
  grossAnnualRate: string | null;
  employmentAgreementUrl: string | null;
  status: ContractStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateContractRequest = Omit<Contract, "id" | "employeeId" | "createdAt" | "updatedAt">;

export type UpdateContractRequest = Partial<CreateContractRequest>;

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

/**
 * The actual GET /hr/notifications row shape (raw hr_notifications columns) — not the
 * `{title, body, createdAt, read}` shape this type previously declared, which never matched
 * what the backend returns (found while mounting the notification UI, MOD-02 Phase 2).
 */
export interface NotificationItem {
  id: string;
  type: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  status: "UNREAD" | "READ" | "ARCHIVED";
  title: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

/** GET /hr/notifications response — not PaginatedResponse<T>, it has no page/limit/totalPages. */
export interface NotificationListResponse {
  data: NotificationItem[];
  total: number;
  unreadCount: number;
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
  // Real hr_policies fields (MOD-05) — coexist with the mock-shaped fields above until the
  // settings/policies UI is fully migrated off them.
  title?: string;
  content?: string | null;
  category?: string;
  policyCategory?: string;
  version?: string;
  fileSize?: string;
  downloads?: number;
  isActive?: boolean;
  createdById?: string | null;
  modifiedAt?: string;
  createdAt?: string;
  myAcknowledged?: boolean;
}

export interface PolicyAcknowledgementDetail {
  employee_id: string;
  employee_name: string;
  acknowledged: boolean;
}

export interface PolicyAcknowledgementReport {
  policy_id: string;
  policy_title: string;
  version: string;
  total_active_employees: number;
  acknowledged_count: number;
  missing_count: number;
  details: PolicyAcknowledgementDetail[];
}

// --- DOCUMENTS (MOD-05) ---
export interface DocumentACL {
  roles?: string[];
  employee_ids?: string[];
  departments?: string[];
}

export interface DocumentVersionEntry {
  key: string;
  version: string;
  uploaded_at: string;
}

export const DOCUMENT_CATEGORIES = [
  "Contract Templates",
  "Policies & Procedures",
  "Forms & Applications",
  "Training Materials",
  "Compliance & Legal",
  "Onboarding Materials",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export type DocumentStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

export interface HrDocument {
  id: string;
  document_name: string;
  category: DocumentCategory;
  version: string;
  description: string;
  department: string;
  fileSize: string;
  downloads: number;
  status: DocumentStatus;
  access: DocumentACL;
  versions?: DocumentVersionEntry[];
  contract_id: string | null;
  modifiedAt: string;
  createdAt?: string;
  createdBy: { id: string | null; fullName: string };
}

export interface CreateDocumentRequest {
  document_name: string;
  category: DocumentCategory;
  description: string;
  department: string;
  status?: "PUBLISHED" | "DRAFT";
  access: DocumentACL;
  contractId?: string;
}

export interface UpdateDocumentRequest {
  document_name?: string;
  category?: DocumentCategory;
  description?: string;
  department?: string;
  status?: DocumentStatus;
  access?: DocumentACL;
  contractId?: string;
}

// --- DOCUMENT CATEGORY TEMPLATES (v1, additive) ---
// A standalone entity ("Add the option to create a document template", Things-to-work-on.md),
// deliberately decoupled from DOCUMENT_CATEGORIES/HrDocument.category above — lets HR design how
// documents in a category should look (a name + one of four brand colors + simple branding
// fields). Auto-generating an hr_documents row from one of these templates is deferred follow-up
// work, not built here.
export const DOCUMENT_CATEGORY_TEMPLATE_COLORS = ["green", "yellow", "blue", "orange"] as const;
export type DocumentCategoryTemplateColor = (typeof DOCUMENT_CATEGORY_TEMPLATE_COLORS)[number];

export interface DocumentCategoryTemplate {
  id: string;
  name: string;
  color: DocumentCategoryTemplateColor;
  header_text: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentCategoryTemplateRequest {
  name: string;
  color: DocumentCategoryTemplateColor;
  header_text?: string;
  description?: string;
}

export interface UpdateDocumentCategoryTemplateRequest extends Partial<CreateDocumentCategoryTemplateRequest> {}
