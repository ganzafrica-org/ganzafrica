/**
 * Application form + eligibility rule persistence (REC-01). Publishing is transactional: the new
 * version is inserted and the predecessor archived atomically so GET never sees two published forms.
 */
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { opportunity_forms, eligibility_rules } from "../../db/schema/recruitment/forms";
import { AppError } from "../../middlewares";
import type { FormDefinition, EligibilityRuleInput } from "../../types/recruitment";

export type RuleWriteInput = {
  field_key: string;
  operator: string;
  value?: unknown;
  reject_message: string;
  is_active?: boolean;
  sort_order?: number;
};

/** The published form (max version, status published) for an opportunity, or null if none. */
export async function getPublishedForm(opportunityId: number) {
  const [form] = await db
    .select()
    .from(opportunity_forms)
    .where(
      and(
        eq(opportunity_forms.opportunity_id, opportunityId),
        eq(opportunity_forms.status, "published"),
      ),
    )
    .orderBy(desc(opportunity_forms.version))
    .limit(1);
  return form ?? null;
}

/** The current draft, if any (there is at most one meaningful draft — the latest). */
export async function getDraftForm(opportunityId: number) {
  const [form] = await db
    .select()
    .from(opportunity_forms)
    .where(
      and(
        eq(opportunity_forms.opportunity_id, opportunityId),
        eq(opportunity_forms.status, "draft"),
      ),
    )
    .orderBy(desc(opportunity_forms.version))
    .limit(1);
  return form ?? null;
}

/** Active rules for an opportunity, ordered, as the engine needs them. */
export async function getActiveRules(opportunityId: number): Promise<EligibilityRuleInput[]> {
  const rows = await db
    .select()
    .from(eligibility_rules)
    .where(
      and(
        eq(eligibility_rules.opportunity_id, opportunityId),
        eq(eligibility_rules.is_active, true),
      ),
    )
    .orderBy(eligibility_rules.sort_order, eligibility_rules.id);
  return rows.map((r) => ({
    id: r.id,
    field_key: r.field_key,
    operator: r.operator,
    value: r.value,
    reject_message: r.reject_message,
  }));
}

/** All rules (HR view — includes inactive). */
export async function listRules(opportunityId: number) {
  return db
    .select()
    .from(eligibility_rules)
    .where(eq(eligibility_rules.opportunity_id, opportunityId))
    .orderBy(eligibility_rules.sort_order, eligibility_rules.id);
}

/** Upsert the single draft form definition for an opportunity. */
export async function saveDraft(opportunityId: number, definition: FormDefinition, userId: number) {
  const existing = await getDraftForm(opportunityId);
  if (existing) {
    const [updated] = await db
      .update(opportunity_forms)
      .set({ definition, updated_at: new Date() })
      .where(eq(opportunity_forms.id, existing.id))
      .returning();
    return updated;
  }

  // Draft version = one past the highest existing version (published or draft).
  const [{ maxVersion }] = await db
    .select({ maxVersion: sql<number>`coalesce(max(${opportunity_forms.version}), 0)` })
    .from(opportunity_forms)
    .where(eq(opportunity_forms.opportunity_id, opportunityId));

  const [created] = await db
    .insert(opportunity_forms)
    .values({
      opportunity_id: opportunityId,
      version: Number(maxVersion) + 1,
      status: "draft",
      definition,
      created_by: userId,
    })
    .returning();
  return created;
}

/**
 * Publish the current draft: archive any published predecessor and flip the draft to published,
 * atomically. Returns the newly published form. Throws if there is no draft to publish.
 */
export async function publishDraft(opportunityId: number) {
  return db.transaction(async (tx) => {
    const [draft] = await tx
      .select()
      .from(opportunity_forms)
      .where(
        and(
          eq(opportunity_forms.opportunity_id, opportunityId),
          eq(opportunity_forms.status, "draft"),
        ),
      )
      .orderBy(desc(opportunity_forms.version))
      .limit(1);

    if (!draft) {
      throw new AppError("No draft form to publish", 400);
    }

    await tx
      .update(opportunity_forms)
      .set({ status: "archived", updated_at: new Date() })
      .where(
        and(
          eq(opportunity_forms.opportunity_id, opportunityId),
          eq(opportunity_forms.status, "published"),
        ),
      );

    const [published] = await tx
      .update(opportunity_forms)
      .set({ status: "published", updated_at: new Date() })
      .where(eq(opportunity_forms.id, draft.id))
      .returning();

    return published;
  });
}

export async function createRule(opportunityId: number, input: RuleWriteInput) {
  const [row] = await db
    .insert(eligibility_rules)
    .values({
      opportunity_id: opportunityId,
      field_key: input.field_key,
      operator: input.operator,
      value: input.value ?? null,
      reject_message: input.reject_message,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    })
    .returning();
  return row;
}

export async function updateRule(ruleId: number, input: Partial<RuleWriteInput>) {
  const patch: Record<string, unknown> = { updated_at: new Date() };
  for (const key of [
    "field_key",
    "operator",
    "value",
    "reject_message",
    "is_active",
    "sort_order",
  ] as const) {
    if (input[key] !== undefined) patch[key] = input[key];
  }
  const [row] = await db
    .update(eligibility_rules)
    .set(patch)
    .where(eq(eligibility_rules.id, ruleId))
    .returning();
  if (!row) throw new AppError("Rule not found", 404);
  return row;
}

/**
 * Hard-delete only when the rule has never been hit (funnel data is preserved). A rule with hits
 * is deactivated instead. Returns what happened so the controller can respond accordingly.
 */
export async function deleteOrDeactivateRule(
  ruleId: number,
): Promise<{ deleted: boolean; deactivated: boolean }> {
  const [rule] = await db
    .select()
    .from(eligibility_rules)
    .where(eq(eligibility_rules.id, ruleId))
    .limit(1);
  if (!rule) throw new AppError("Rule not found", 404);

  if (rule.hit_count > 0) {
    await db
      .update(eligibility_rules)
      .set({ is_active: false, updated_at: new Date() })
      .where(eq(eligibility_rules.id, ruleId));
    return { deleted: false, deactivated: true };
  }

  await db.delete(eligibility_rules).where(eq(eligibility_rules.id, ruleId));
  return { deleted: true, deactivated: false };
}
