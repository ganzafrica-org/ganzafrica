/**
 * Offers + hire conversion (REC-05). HR drafts/sends an offer; the candidate accepts/declines via
 * a secure token link. Acceptance is a single atomic transaction: hired + user + roles + employee
 * + draft contract + onboarding hook — all-or-nothing. Applicant emails fire post-commit.
 */
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/client";
import { AppError } from "../../middlewares";
import { Logger, env } from "../../config";
import { applications, opportunities } from "../../db/schema/opportunities";
import { offers, type Offer } from "../../db/schema/recruitment/offers";
import { users, roles, user_roles } from "../../db/schema";
import { employees } from "../../db/schema/hr/employees";
import { hr_contracts } from "../../db/schema/hr/contract";
import { application_stage_events } from "../../db/schema/recruitment/pipeline";
import { transition } from "./pipeline.service";
import { getOnboardingHooks } from "./onboarding.hooks";
import { mintLink, consumeLink, revokeLinks, peekLink } from "../secure-links.service";
import { hashPassword } from "../auth.service";

const logger = new Logger("OffersService");

const DEFAULT_OFFER_TTL_DAYS = 14;

// Offer employment_type → the employment-type role granted on hire (auth-and-rbac.md).
const EMPLOYMENT_TYPE_ROLE: Record<string, string> = {
  fellow: "fellow",
  analyst: "analyst",
  staff: "employee",
  contractor: "contractor",
  intern: "intern",
};

export type CreateOfferInput = {
  position_title: string;
  employment_type: string;
  department?: string | null;
  start_date?: string | null;
  gross_salary?: string | number | null;
  currency?: string;
  additional_terms?: string | null;
};

/** Create a draft offer for an application in evaluation/offer stage. Moves evaluation→offer. */
export async function createOffer(
  applicationId: number,
  input: CreateOfferInput,
  actorUserId: number,
): Promise<Offer> {
  const [app] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, applicationId))
    .limit(1);
  if (!app) throw new AppError("Application not found", 404);
  if (!["evaluation", "offer"].includes(app.pipeline_stage)) {
    throw new AppError(`Cannot offer from stage "${app.pipeline_stage}"`, 409);
  }
  const [existing] = await db
    .select({ id: offers.id })
    .from(offers)
    .where(eq(offers.application_id, applicationId))
    .limit(1);
  if (existing) throw new AppError("An offer already exists for this application", 409);

  if (app.pipeline_stage === "evaluation") {
    await transition(applicationId, "offer", actorUserId, { note: "Offer drafted" });
  }

  const [offer] = await db
    .insert(offers)
    .values({
      application_id: applicationId,
      position_title: input.position_title,
      employment_type: input.employment_type,
      department: input.department ?? null,
      start_date: input.start_date ?? null,
      gross_salary: input.gross_salary != null ? String(input.gross_salary) : null,
      currency: input.currency ?? "RWF",
      additional_terms: input.additional_terms ?? null,
      created_by: actorUserId,
    })
    .returning();
  return offer;
}

export async function getOffer(offerId: number): Promise<Offer> {
  const [offer] = await db.select().from(offers).where(eq(offers.id, offerId)).limit(1);
  if (!offer) throw new AppError("Offer not found", 404);
  return offer;
}

export async function getOfferByApplication(applicationId: number): Promise<Offer | null> {
  const [offer] = await db
    .select()
    .from(offers)
    .where(eq(offers.application_id, applicationId))
    .limit(1);
  return offer ?? null;
}

/** Edit a draft offer only. */
export async function updateOffer(
  offerId: number,
  input: Partial<CreateOfferInput>,
): Promise<Offer> {
  const offer = await getOffer(offerId);
  if (offer.status !== "draft") throw new AppError("Only draft offers can be edited", 409);
  const patch: Record<string, unknown> = { updated_at: new Date() };
  for (const k of [
    "position_title",
    "employment_type",
    "department",
    "start_date",
    "currency",
    "additional_terms",
  ] as const) {
    if (input[k] !== undefined) patch[k] = input[k];
  }
  if (input.gross_salary !== undefined)
    patch.gross_salary = input.gross_salary == null ? null : String(input.gross_salary);
  const [updated] = await db.update(offers).set(patch).where(eq(offers.id, offerId)).returning();
  return updated;
}

export async function setLetterKey(offerId: number, fileKey: string): Promise<Offer> {
  const offer = await getOffer(offerId);
  if (offer.status !== "draft")
    throw new AppError("Can only attach a letter to a draft offer", 409);
  const [updated] = await db
    .update(offers)
    .set({ letter_file_key: fileKey, updated_at: new Date() })
    .where(eq(offers.id, offerId))
    .returning();
  return updated;
}

export interface SentOffer {
  offer: Offer;
  token: string; // raw — caller builds the link and does NOT persist it
  link: string;
}

/** Send a draft offer: requires letter + start_date. Mints a token and flips to sent. */
export async function sendOffer(offerId: number): Promise<SentOffer> {
  const offer = await getOffer(offerId);
  if (offer.status !== "draft") throw new AppError("Only draft offers can be sent", 409);
  if (!offer.letter_file_key) throw new AppError("Attach an offer letter before sending", 422);
  if (!offer.start_date) throw new AppError("Set a start date before sending", 422);

  const expiresAt = offer.expires_at ?? new Date(Date.now() + DEFAULT_OFFER_TTL_DAYS * 86400_000);
  const token = await mintLink("offer", offer.id, expiresAt);

  const [updated] = await db
    .update(offers)
    .set({ status: "sent", sent_at: new Date(), expires_at: expiresAt, updated_at: new Date() })
    .where(eq(offers.id, offerId))
    .returning();

  const link = `${env.WEBSITE_URL.replace(/\/$/, "")}/offer/${token}`;
  return { offer: updated, token, link };
}

/** Withdraw a sent offer and revoke its tokens. */
export async function withdrawOffer(offerId: number): Promise<Offer> {
  const offer = await getOffer(offerId);
  if (!["sent", "draft"].includes(offer.status)) {
    throw new AppError(`Cannot withdraw an offer in status "${offer.status}"`, 409);
  }
  await revokeLinks("offer", offer.id);
  const [updated] = await db
    .update(offers)
    .set({ status: "withdrawn", updated_at: new Date() })
    .where(eq(offers.id, offerId))
    .returning();
  return updated;
}

export type OfferViewState = "valid" | "decided" | "expired" | "not_found";

export interface OfferView {
  state: OfferViewState;
  offer?: Pick<
    Offer,
    | "position_title"
    | "employment_type"
    | "department"
    | "start_date"
    | "gross_salary"
    | "currency"
    | "additional_terms"
    | "status"
    | "letter_file_key"
    | "expires_at"
  > & { opportunity_title?: string };
}

/** Token read path — does NOT consume. Returns a candidate-safe offer summary. */
export async function viewOfferByToken(rawToken: string): Promise<OfferView> {
  const peek = await peekLink("offer", rawToken);
  if (peek.state === "not_found") return { state: "not_found" };
  if (peek.state === "used") return { state: "decided" };
  if (peek.state === "expired" || peek.state === "revoked") return { state: "expired" };

  const offer = await getOffer(peek.subjectId!);
  const [app] = await db
    .select({ opportunity_id: applications.opportunity_id })
    .from(applications)
    .where(eq(applications.id, offer.application_id))
    .limit(1);
  let opportunity_title: string | undefined;
  if (app?.opportunity_id) {
    const [opp] = await db
      .select({ title: opportunities.title })
      .from(opportunities)
      .where(eq(opportunities.id, app.opportunity_id))
      .limit(1);
    opportunity_title = opp?.title;
  }

  return {
    state: "valid",
    offer: {
      position_title: offer.position_title,
      employment_type: offer.employment_type,
      department: offer.department,
      start_date: offer.start_date,
      gross_salary: offer.gross_salary,
      currency: offer.currency,
      additional_terms: offer.additional_terms,
      status: offer.status,
      letter_file_key: offer.letter_file_key,
      expires_at: offer.expires_at,
      opportunity_title,
    },
  };
}

export type RespondResult =
  | { ok: true; decision: "accept"; employeeId: string; userId: number; invited: boolean }
  | { ok: true; decision: "decline" }
  | { ok: false; state: OfferViewState };

/**
 * Consume the token and record the single decision. Accept runs the atomic hire transaction;
 * decline records the reason and leaves the application in the offer stage (HR decides next).
 * Emails fire post-commit (returned flags let the caller send them).
 */
export async function respondToOffer(
  rawToken: string,
  decision: "accept" | "decline",
  declineReason?: string,
): Promise<RespondResult> {
  const consumed = await consumeLink("offer", rawToken);
  if (consumed.state !== "valid") {
    if (consumed.state === "used") return { ok: false, state: "decided" };
    if (consumed.state === "expired" || consumed.state === "revoked")
      return { ok: false, state: "expired" };
    return { ok: false, state: "not_found" };
  }

  const offerId = consumed.subjectId!;

  if (decision === "decline") {
    await db.transaction(async (tx) => {
      const [offer] = await tx.select().from(offers).where(eq(offers.id, offerId)).limit(1);
      if (!offer) throw new AppError("Offer not found", 404);
      await tx
        .update(offers)
        .set({
          status: "declined",
          decline_reason: declineReason ?? null,
          responded_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(offers.id, offerId));
      // Application stays in the offer stage; note the decline so HR decides the next move.
      await tx.insert(application_stage_events).values({
        application_id: offer.application_id,
        from_stage: "offer",
        to_stage: "offer",
        actor_user_id: null,
        note: `Offer declined${declineReason ? `: ${declineReason}` : ""}`,
      });
    });
    return { ok: true, decision: "decline" };
  }

  // --- Accept: atomic hire ---
  return db.transaction(async (tx) => {
    const [offer] = await tx.select().from(offers).where(eq(offers.id, offerId)).limit(1);
    if (!offer) throw new AppError("Offer not found", 404);

    const [app] = await tx
      .select()
      .from(applications)
      .where(eq(applications.id, offer.application_id))
      .limit(1);
    if (!app) throw new AppError("Application not found", 404);

    // 1) offer → accepted
    await tx
      .update(offers)
      .set({ status: "accepted", responded_at: new Date(), updated_at: new Date() })
      .where(eq(offers.id, offerId));

    // 2) application → hired (in-txn: matrix + status sync + event; email suppressed here)
    await tx
      .update(applications)
      .set({ pipeline_stage: "hired", status: "accepted", updated_at: new Date() })
      .where(eq(applications.id, offer.application_id));
    await tx.insert(application_stage_events).values({
      application_id: offer.application_id,
      from_stage: "offer",
      to_stage: "hired",
      actor_user_id: null,
      note: "Offer accepted",
    });

    // 3) find-or-create the user by application email
    const email = app.email.toLowerCase();
    let invited = false;
    const [existingUser] = await tx.select().from(users).where(eq(users.email, email)).limit(1);

    const employeeRole = await ensureRoleTx(tx, "employee");
    const typeRoleName = EMPLOYMENT_TYPE_ROLE[offer.employment_type] ?? "employee";
    const typeRole = await ensureRoleTx(tx, typeRoleName);

    let userId: number;
    if (existingUser) {
      userId = existingUser.id;
      // Existing account (former applicant): grant roles, never touch the password.
    } else {
      const placeholder = await hashPassword(crypto.randomBytes(24).toString("hex"));
      const [created] = await tx
        .insert(users)
        .values({
          email,
          name: `${app.first_name} ${app.last_name}`.trim(),
          role_id: employeeRole.id,
          password_hash: placeholder,
          email_verified: false,
          is_active: true,
        })
        .returning();
      userId = created.id;
      invited = true; // caller sends the set-password invite
    }

    for (const role of [employeeRole, typeRole]) {
      await tx
        .insert(user_roles)
        .values({ user_id: userId, role_id: role.id })
        .onConflictDoNothing();
    }

    // 4) employees row (status onboarding)
    const [employee] = await tx
      .insert(employees)
      .values({
        user_id: userId,
        first_name: app.first_name,
        last_name: app.last_name,
        personal_email: app.email,
        department: offer.department,
        job_title: offer.position_title,
        employment_type: offer.employment_type,
        status: "onboarding",
        hired_at: offer.start_date,
      })
      .returning();

    // 5) draft contract from offer terms (new-model link only)
    await tx.insert(hr_contracts).values({
      employee_ref_id: employee.id,
      job_title: offer.position_title,
      department: offer.department,
      start_date: offer.start_date ? new Date(offer.start_date) : new Date(),
      employment_term: "indefinite",
      employment_type: "full-time",
      compensation_type: "salaried",
      currency: offer.currency,
      gross_annual_rate: offer.gross_salary,
      status: "DRAFT",
    });

    // 6) onboarding hook (in-txn seam; no-op default records pending)
    const instantiated = await getOnboardingHooks().onHired({
      employeeId: employee.id,
      offerId: offer.id,
      applicationId: offer.application_id,
      employmentType: offer.employment_type,
      startDate: offer.start_date,
      tx,
    });
    if (!instantiated) {
      await tx.update(offers).set({ onboarding_pending: true }).where(eq(offers.id, offerId));
    }

    logger.info(`Offer ${offerId} accepted → employee ${employee.id} (user ${userId})`);
    return { ok: true, decision: "accept", employeeId: employee.id, userId, invited };
  });
}

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

async function ensureRoleTx(tx: Tx, name: string) {
  const [existing] = await tx.select().from(roles).where(eq(roles.name, name)).limit(1);
  if (existing) return existing;
  const [created] = await tx
    .insert(roles)
    .values({ name, description: `${name} role` })
    .returning();
  return created;
}
