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
  const [row] = await db
    .insert(roles)
    .values({ name, description: `${name} (test)` })
    .returning();
  return row;
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
