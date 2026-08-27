/**
 * Test data factories — insert rows directly via drizzle and return them. No SQL dumps.
 * Grow these as specs need more (makeEmployee, makeApplication, makeOffer, …).
 */
import { db } from "../../src/db/client";
import {
  roles,
  users,
  user_roles,
  payrolls,
  opportunities,
  opportunity_forms,
  eligibility_rules,
  applications,
  screening_rules,
  evaluation_criteria,
  opportunity_funnel_events,
  offers,
  hr_documents,
  hr_contracts,
  hr_policies,
  hr_policy_acknowledgements,
  employees,
  hr_leave_policies,
  hr_leave_balances,
  hr_org_holidays,
  hr_leaves,
  process_templates,
  process_template_tasks,
  hr_assets,
  hr_asset_categories,
  hr_asset_assignments,
  type EmployeeProfile,
} from "../../src/db/schema";
import { eq } from "drizzle-orm";
import * as authService from "../../src/services/auth.service";
import type { FormDefinition } from "../../src/types/recruitment";

let seq = 0;
const uniq = () => `${Date.now()}_${seq++}`;

/** Ensure a role row exists (by name) and return it. */
export async function ensureRole(name: string) {
  const existing = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  if (existing[0]) return existing[0];

  // Try to insert; use onConflictDoNothing to tolerate concurrent test workers.
  const inserted = await db
    .insert(roles)
    .values({ name, description: `${name} (test)` })
    .onConflictDoNothing()
    .returning();
  if (inserted && inserted.length) return inserted[0];

  // If concurrent insert happened, select the existing row now.
  const [row2] = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
  if (!row2) throw new Error(`Failed to ensure role ${name}`);
  return row2;
}

export interface MakeUserOptions {
  email?: string;
  name?: string;
  password?: string;
  role?: string; // role name; defaults to "admin"
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface MadeUser {
  id: number;
  email: string;
  name: string;
  password: string; // plaintext, for logging in during tests
  roleName: string;
}

/** Create a user with a hashed password and a role. Returns the row + plaintext password. */
export async function makeUser(opts: MakeUserOptions = {}): Promise<MadeUser> {
  const roleName = opts.role ?? "admin";
  const role = await ensureRole(roleName);
  const password = opts.password ?? "Test1234!";
  const email = opts.email ?? `user_${uniq()}@test.local`;
  const name = opts.name ?? "Test User";

  const password_hash = await authService.hashPassword(password);
  const [row] = await db
    .insert(users)
    .values({
      email,
      name,
      role_id: role.id,
      password_hash,
      is_active: opts.isActive ?? true,
      email_verified: opts.emailVerified ?? true,
    })
    .returning();

  await db.insert(user_roles).values({ user_id: row.id, role_id: role.id });

  return { id: row.id, email: row.email, name: row.name, password, roleName };
}

export interface MakePayrollOptions {
  uploadedBy: number; // users.id (required FK)
  name?: string;
  email?: string;
  payslipFileKey?: string | null;
}

/** Insert a payroll row. Requires an uploader user id (see makeUser). */
export async function makePayroll(opts: MakePayrollOptions) {
  const [row] = await db
    .insert(payrolls)
    .values({
      payroll_period: "Test 01.26",
      date_of_payment: "2026-01-31",
      name: opts.name ?? "Jane Doe",
      email: opts.email ?? `payee_${uniq()}@test.local`,
      net_salary: "1000.00",
      payslip_file_key: opts.payslipFileKey ?? "hr/Jane_Doe/01-26/payslip.pdf",
      uploaded_by: opts.uploadedBy,
    })
    .returning();
  return row;
}

export interface MakeDocumentOptions {
  createdById: string; // employees.id (created_by_employee_id FK)
  name?: string;
  category?: string;
  status?: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  access?: { roles?: string[]; employee_ids?: string[]; departments?: string[] };
  contractId?: string | null;
  version?: string;
  versions?: { key: string; version: string; uploaded_at: string }[];
  extractedText?: string | null;
  retainUntil?: Date | null;
  archivedAt?: Date | null;
}

/** Insert an hr_documents row (MOD-05 ACL / versioning / DOC-plus search-retention tests). */
export async function makeDocument(opts: MakeDocumentOptions) {
  const [row] = await db
    .insert(hr_documents)
    .values({
      document_name: opts.name ?? `Doc ${uniq()}`,
      category: (opts.category ?? "Policies & Procedures") as never,
      version: opts.version ?? "1",
      description: "A test document",
      department: "Operations",
      file_path: `uploads/documents/${uniq()}.pdf`,
      file_size: "12 KB",
      status: opts.status ?? "PUBLISHED",
      access: opts.access ?? {},
      versions: opts.versions ?? [],
      contract_id: opts.contractId ?? null,
      extracted_text: opts.extractedText ?? null,
      indexed_at: opts.extractedText !== undefined ? new Date() : null,
      retain_until: opts.retainUntil ?? null,
      archived_at: opts.archivedAt ?? null,
      created_by_employee_id: opts.createdById,
    })
    .returning();
  return row;
}

export interface MakeContractOptions {
  employeeId: string; // employees.id (employee_ref_id FK)
  jobTitle?: string;
  currency?: string;
  status?: "ACTIVE" | "DRAFT" | "EXPIRED" | "TERMINATED";
}

/** Insert a minimal hr_contracts row (contract-owner ACL override tests). */
export async function makeContract(opts: MakeContractOptions) {
  const [row] = await db
    .insert(hr_contracts)
    .values({
      employee_ref_id: opts.employeeId,
      job_title: opts.jobTitle ?? "Software Engineer",
      start_date: new Date("2024-01-01"),
      employment_term: "indefinite",
      employment_type: "full-time",
      compensation_type: "salaried",
      currency: opts.currency ?? "RWF",
      status: opts.status ?? "ACTIVE",
    })
    .returning();
  return row;
}

export interface MakePolicyOptions {
  createdById: string; // employees.id
  title?: string;
  version?: string;
  status?: "PUBLISHED" | "DRAFT";
  isActive?: boolean;
}

/** Insert an hr_policies row. */
export async function makePolicy(opts: MakePolicyOptions) {
  const [row] = await db
    .insert(hr_policies)
    .values({
      title: opts.title ?? `Policy ${uniq()}`,
      content: "Policy body text",
      category: "General",
      policy_category: "GENERAL",
      version: opts.version ?? "1",
      file_path: `uploads/policies/${uniq()}.pdf`,
      file_size: "8 KB",
      status: opts.status ?? "PUBLISHED",
      is_active: opts.isActive ?? true,
      created_by_employee_id: opts.createdById,
    })
    .returning();
  return row;
}

/** Insert an hr_policy_acknowledgements row directly (bypassing the idempotency endpoint). */
export async function makeAcknowledgement(opts: {
  policyId: string;
  employeeId: string;
  version: number;
}) {
  const [row] = await db
    .insert(hr_policy_acknowledgements)
    .values({ policy_id: opts.policyId, employee_id: opts.employeeId, version: opts.version })
    .returning();
  return row;
}

export interface MakeEmployeeOptions {
  userId: number; // users.id (required FK, unique per employee)
  employmentType?: string; // fellow|analyst|staff|contractor|intern
  status?: string; // onboarding|active|on_leave|offboarding|exited
  managerId?: string | null; // employees.id
  firstName?: string;
  lastName?: string;
  department?: string | null;
  homeCountry?: string | null;
  picture?: string | null;
}

/** Insert an employees row (MOD-06 / LCM-01 tests). */
export async function makeEmployee(opts: MakeEmployeeOptions) {
  const [row] = await db
    .insert(employees)
    .values({
      user_id: opts.userId,
      first_name: opts.firstName ?? "Test",
      last_name: opts.lastName ?? "Employee",
      personal_email: `emp_${uniq()}@test.local`,
      employment_type: opts.employmentType ?? "staff",
      status: opts.status ?? "active",
      manager_id: opts.managerId ?? null,
      department: opts.department ?? "Programs",
      home_country: opts.homeCountry ?? null,
      picture: opts.picture ?? null,
    })
    .returning();
  return row;
}

/** Create a user + employee pair in one call — the common shape for leave tests. */
export async function makeEmployeeUser(
  opts: MakeUserOptions & Omit<MakeEmployeeOptions, "userId"> = {},
) {
  const user = await makeUser({ role: opts.role ?? "employee", ...opts });
  const employee = await makeEmployee({ ...opts, userId: user.id });
  return { user, employee };
}

export interface OrgNodeSpec {
  /** Becomes `first_name` (unique per node) — the lookup key in the returned map. */
  name: string;
  status?: string;
  employmentType?: string;
  department?: string | null;
  children?: OrgNodeSpec[];
}

/**
 * Build a `manager_id`-linked tree of employee+user pairs from a nested spec, one call covering
 * an entire fixture forest (MOD-02 §6 items 1-3 all build on this — cycle tests as a straight
 * chain via single-child nesting, tree-shape tests as multiple roots with branching children).
 * Returns a flat `{ [node.name]: { user, employee } }` map for easy lookup in assertions.
 */
export async function makeOrgForest(
  specs: OrgNodeSpec[],
): Promise<Record<string, { user: MadeUser; employee: EmployeeProfile }>> {
  const byName: Record<string, { user: MadeUser; employee: EmployeeProfile }> = {};

  async function build(spec: OrgNodeSpec, managerId: string | null) {
    const user = await makeUser({ role: "employee" });
    const employee = await makeEmployee({
      userId: user.id,
      firstName: spec.name,
      lastName: "Test",
      status: spec.status,
      employmentType: spec.employmentType,
      department: spec.department,
      managerId,
    });
    byName[spec.name] = { user, employee };
    for (const child of spec.children ?? []) {
      await build(child, employee.id);
    }
  }

  for (const root of specs) {
    await build(root, null);
  }

  return byName;
}

export async function makeLeavePolicy(opts: {
  employmentType?: string;
  type?: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
  annualDays?: string | number;
  maxCarryOver?: string | number;
}) {
  const [row] = await db
    .insert(hr_leave_policies)
    .values({
      employment_type: opts.employmentType ?? "staff",
      type: opts.type ?? "ANNUAL",
      annual_days: String(opts.annualDays ?? 20),
      max_carry_over: String(opts.maxCarryOver ?? 5),
    })
    .onConflictDoNothing()
    .returning();
  return row;
}

export async function makeLeaveBalance(opts: {
  employeeId: string;
  year?: number;
  type?: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
  entitledDays?: string | number;
  carriedOverDays?: string | number;
  usedDays?: string | number;
}) {
  const [row] = await db
    .insert(hr_leave_balances)
    .values({
      employee_id: opts.employeeId,
      year: opts.year ?? new Date().getUTCFullYear(),
      type: opts.type ?? "ANNUAL",
      entitled_days: String(opts.entitledDays ?? 20),
      carried_over_days: String(opts.carriedOverDays ?? 0),
      used_days: String(opts.usedDays ?? 0),
    })
    .returning();
  return row;
}

export async function makeHoliday(opts: { date: string; name?: string }) {
  const [row] = await db
    .insert(hr_org_holidays)
    .values({ date: opts.date, name: opts.name ?? "Test Holiday" })
    .onConflictDoNothing()
    .returning();
  return row;
}

export async function makeLeave(opts: {
  employeeId: string;
  type?: "ANNUAL" | "SICK" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
  startDate: Date;
  endDate: Date;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  days?: string | number;
  reason?: string;
}) {
  const [row] = await db
    .insert(hr_leaves)
    .values({
      employee_id: opts.employeeId,
      type: opts.type ?? "ANNUAL",
      start_date: opts.startDate,
      end_date: opts.endDate,
      status: opts.status ?? "PENDING",
      days: opts.days != null ? String(opts.days) : null,
      reason: opts.reason ?? "Test leave",
    })
    .returning();
  return row;
}

export interface MakeTemplateTaskSpec {
  title?: string;
  sort_order?: number;
  default_assignee?: "hr" | "it" | "manager" | "finance" | "employee";
  visibility?: "all" | "staff_only";
  due_offset_days?: number | null;
  is_blocking?: boolean;
  kind?: string;
}

/** Insert a process template plus its task rows (LCM-01/02 tests). */
export async function makeProcessTemplate(opts: {
  createdBy: number;
  type?: "onboarding" | "offboarding";
  name?: string;
  employmentTypes?: string[] | null;
  isActive?: boolean;
  tasks?: MakeTemplateTaskSpec[];
}) {
  const [template] = await db
    .insert(process_templates)
    .values({
      type: opts.type ?? "onboarding",
      name: opts.name ?? `Template ${uniq()}`,
      employment_types: opts.employmentTypes ?? null,
      is_active: opts.isActive ?? true,
      created_by: opts.createdBy,
    })
    .returning();

  const specs = opts.tasks ?? [
    { title: "Sign contract", default_assignee: "employee" as const, is_blocking: true },
  ];

  // `tasks: []` is a legitimate starting state for a template being built up step by step.
  const tasks = specs.length
    ? await db
        .insert(process_template_tasks)
        .values(
          specs.map((spec, index) => ({
            template_id: template.id,
            title: spec.title ?? `Task ${index + 1}`,
            sort_order: spec.sort_order ?? index,
            default_assignee: spec.default_assignee ?? "hr",
            visibility: spec.visibility ?? "all",
            due_offset_days: spec.due_offset_days ?? null,
            is_blocking: spec.is_blocking ?? false,
            kind: spec.kind ?? "checklist",
          })),
        )
        .returning()
    : [];

  return { template, tasks };
}

export interface MakeOpportunityOptions {
  createdBy: number; // users.id (required FK)
  title?: string;
  status?: string;
  type?: "fellowship" | "employment";
}

/** Insert a published opportunity (REC-01 tests). */
export async function makeOpportunity(opts: MakeOpportunityOptions) {
  const [row] = await db
    .insert(opportunities)
    .values({
      title: opts.title ?? `Opportunity ${uniq()}`,
      description: "Test opportunity",
      type: opts.type ?? "employment",
      status: (opts.status ?? "published") as any,
      application_deadline: "2099-12-31",
      created_by: opts.createdBy,
    })
    .returning();
  return row;
}

const DEFAULT_FORM_DEFINITION: FormDefinition = {
  standard: [
    {
      key: "first_name",
      label: "First name",
      type: "text",
      required: true,
      order: 1,
      section: "About you",
    },
    {
      key: "date_of_birth",
      label: "Date of birth",
      type: "date",
      required: true,
      order: 2,
      section: "About you",
    },
  ],
  custom: [],
};

export async function makeForm(opts: {
  opportunityId: number;
  createdBy: number;
  version?: number;
  status?: string;
  definition?: FormDefinition;
}) {
  const [row] = await db
    .insert(opportunity_forms)
    .values({
      opportunity_id: opts.opportunityId,
      version: opts.version ?? 1,
      status: opts.status ?? "published",
      definition: opts.definition ?? DEFAULT_FORM_DEFINITION,
      created_by: opts.createdBy,
    })
    .returning();
  return row;
}

export async function makeRule(opts: {
  opportunityId: number;
  field_key: string;
  operator: string;
  value?: unknown;
  reject_message?: string;
  is_active?: boolean;
  sort_order?: number;
  hit_count?: number;
}) {
  const [row] = await db
    .insert(eligibility_rules)
    .values({
      opportunity_id: opts.opportunityId,
      field_key: opts.field_key,
      operator: opts.operator,
      value: (opts.value ?? null) as any,
      reject_message: opts.reject_message ?? "Not eligible",
      is_active: opts.is_active ?? true,
      sort_order: opts.sort_order ?? 0,
      hit_count: opts.hit_count ?? 0,
    })
    .returning();
  return row;
}

/** Insert an application row (REC-02 pipeline tests). Fills every NOT NULL column. */
export async function makeApplication(opts: {
  opportunityId?: number | null;
  pipeline_stage?: string;
  userId?: number | null;
  overrides?: Record<string, unknown>;
}) {
  const [row] = await db
    .insert(applications)
    .values({
      opportunity_id: opts.opportunityId ?? null,
      first_name: "Jane",
      last_name: "Doe",
      email: `applicant_${uniq()}@test.local`,
      phone: "+250700000000",
      national_id: `ID${uniq()}`,
      city: "Kigali",
      country: "Rwanda",
      education_level: "bachelors_degree",
      field_of_study: "Computer Science",
      career_experience: "3 years",
      cv_url: "https://files.example.com/cv.pdf",
      motivation: "Motivated.",
      five_year_vision: "Vision.",
      desired_impact: "Impact.",
      community_role: "Mentor.",
      national_strategy: "Aligned.",
      how_ganzafrica_can_help: "Growth.",
      contribution_to_ganzafrica: "Skills.",
      data_processing_consent: true,
      pipeline_stage: opts.pipeline_stage ?? "submitted",
      user_id: opts.userId ?? null,
      ...(opts.overrides ?? {}),
    } as any)
    .returning();
  return row;
}

export async function makeScreeningRule(opts: {
  opportunityId: number;
  field_key: string;
  operator: string;
  value?: unknown;
  action: "auto_reject" | "flag";
  email_template?: string | null;
  rejection_reason?: string | null;
  is_active?: boolean;
  hit_count?: number;
}) {
  const [row] = await db
    .insert(screening_rules)
    .values({
      opportunity_id: opts.opportunityId,
      field_key: opts.field_key,
      operator: opts.operator,
      value: (opts.value ?? null) as any,
      action: opts.action,
      email_template: opts.email_template ?? null,
      rejection_reason: opts.rejection_reason ?? null,
      is_active: opts.is_active ?? true,
      hit_count: opts.hit_count ?? 0,
    })
    .returning();
  return row;
}

export async function makeCriterion(opts: {
  opportunityId: number;
  name?: string;
  weight?: string | number;
  max_score?: number;
  sort_order?: number;
}) {
  const [row] = await db
    .insert(evaluation_criteria)
    .values({
      opportunity_id: opts.opportunityId,
      name: opts.name ?? `Criterion ${uniq()}`,
      weight: opts.weight != null ? String(opts.weight) : "1",
      max_score: opts.max_score ?? 5,
      sort_order: opts.sort_order ?? 0,
    })
    .returning();
  return row;
}

export async function makeFunnelEvent(opts: {
  opportunityId: number;
  event: "view" | "form_start" | "form_submit";
  sessionKey: string;
}) {
  const [row] = await db
    .insert(opportunity_funnel_events)
    .values({
      opportunity_id: opts.opportunityId,
      event: opts.event,
      session_key: opts.sessionKey,
    })
    .onConflictDoNothing()
    .returning();
  return row;
}

/** Insert an hr_asset_categories row (MOD-04 tests). */
export async function makeAssetCategory(opts: { name?: string; slug?: string } = {}) {
  const [row] = await db
    .insert(hr_asset_categories)
    .values({
      name: opts.name ?? "Laptop",
      slug: opts.slug ?? `laptop_${uniq()}`,
      spec_schema: [],
    })
    .returning();
  return row;
}

export interface MakeAssetOptions {
  categoryId?: string; // hr_asset_categories.id — created if omitted
  deviceName?: string;
  serialNumber?: string;
  status?: "AVAILABLE" | "ASSIGNED" | "UNDER_MAINTENANCE" | "DISPOSED";
  assignedToEmployeeId?: string | null;
  hasIssue?: "YES" | "NO";
  isFlagged?: boolean;
}

/** Insert an hr_assets row (MOD-04 tests). Creates a category if none is given. */
export async function makeAsset(opts: MakeAssetOptions = {}) {
  const categoryId = opts.categoryId ?? (await makeAssetCategory()).id;
  const [row] = await db
    .insert(hr_assets)
    .values({
      device_name: opts.deviceName ?? `Test Laptop ${uniq()}`,
      serial_number: opts.serialNumber ?? `SN-${uniq()}`,
      category_id: categoryId,
      status: opts.status ?? "AVAILABLE",
      assigned_to_employee_id: opts.assignedToEmployeeId ?? null,
      assigned_at: opts.assignedToEmployeeId ? new Date() : null,
      has_issue: opts.hasIssue ?? "NO",
      is_flagged: opts.isFlagged ?? false,
    })
    .returning();
  return row;
}

/** Insert an hr_asset_assignments row directly (MOD-04 history tests). */
export async function makeAssetAssignment(opts: {
  assetId: string;
  employeeId: string;
  assignedBy?: number | null;
  assignedAt?: Date;
  returnedAt?: Date | null;
  returnCondition?: string | null;
  notes?: string | null;
}) {
  const [row] = await db
    .insert(hr_asset_assignments)
    .values({
      asset_id: opts.assetId,
      employee_id: opts.employeeId,
      assigned_by: opts.assignedBy ?? null,
      assigned_at: opts.assignedAt ?? new Date(),
      returned_at: opts.returnedAt ?? null,
      return_condition: opts.returnCondition ?? null,
      notes: opts.notes ?? null,
    })
    .returning();
  return row;
}

export async function makeOffer(opts: {
  applicationId: number;
  createdBy: number;
  status?: string;
  employment_type?: string;
  letter_file_key?: string | null;
  start_date?: string | null;
  expires_at?: Date | null;
  gross_salary?: string | null;
}) {
  const [row] = await db
    .insert(offers)
    .values({
      application_id: opts.applicationId,
      position_title: "Data Analyst",
      employment_type: opts.employment_type ?? "analyst",
      department: "Programs",
      start_date: opts.start_date ?? "2099-01-01",
      gross_salary: opts.gross_salary ?? "12000000",
      currency: "RWF",
      letter_file_key: opts.letter_file_key ?? null,
      status: (opts.status ?? "draft") as any,
      expires_at: opts.expires_at ?? null,
      created_by: opts.createdBy,
    })
    .returning();
  return row;
}
