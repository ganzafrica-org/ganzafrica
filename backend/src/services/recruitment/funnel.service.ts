/**
 * Recruitment funnel analytics (REC-04). Anonymous view → form_start → form_submit counting per
 * posting, deduped per session, plus per-rule eligibility blocks (from REC-01 hit_count).
 */
import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { opportunities } from "../../db/schema/opportunities";
import { eligibility_rules } from "../../db/schema/recruitment/forms";
import {
  opportunity_funnel_events,
  FUNNEL_EVENTS,
  type FunnelEvent,
} from "../../db/schema/recruitment/funnel";
import { Logger } from "../../config";

const logger = new Logger("FunnelService");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isFunnelEvent(x: unknown): x is FunnelEvent {
  return typeof x === "string" && (FUNNEL_EVENTS as readonly string[]).includes(x);
}

export function isSessionKey(x: unknown): x is string {
  return typeof x === "string" && UUID_RE.test(x);
}

/**
 * Record an anonymous funnel event. Fire-and-forget: validates, checks the opportunity is
 * published, then insert-ignores (dedup on opportunity+event+session). Any problem is logged and
 * swallowed — this must never surface an error to the public page.
 */
export async function recordEvent(
  opportunityId: number,
  event: unknown,
  sessionKey: unknown,
): Promise<void> {
  try {
    if (!isFunnelEvent(event) || !isSessionKey(sessionKey)) {
      logger.warn(`Ignoring invalid funnel event for opportunity ${opportunityId}`);
      return;
    }
    const [opp] = await db
      .select({ status: opportunities.status })
      .from(opportunities)
      .where(eq(opportunities.id, opportunityId))
      .limit(1);
    if (!opp || opp.status !== "published") {
      logger.warn(`Ignoring funnel event for missing/unpublished opportunity ${opportunityId}`);
      return;
    }
    await db
      .insert(opportunity_funnel_events)
      .values({ opportunity_id: opportunityId, event, session_key: sessionKey })
      .onConflictDoNothing();
  } catch (err) {
    logger.error(`Funnel event insert failed for opportunity ${opportunityId} (swallowed)`, err);
  }
}

export interface FunnelResult {
  views: number;
  form_starts: number;
  submissions: number;
  eligibility_blocks: {
    rule_id: number;
    field_key: string;
    reject_message: string;
    hits: number;
  }[];
  conversion: { view_to_start: number; start_to_submit: number };
}

/** Distinct-session counts per event + eligibility blocks + conversion ratios. */
export async function getFunnel(opportunityId: number): Promise<FunnelResult> {
  const rows = await db
    .select({
      event: opportunity_funnel_events.event,
      count: sql<number>`count(distinct ${opportunity_funnel_events.session_key})`,
    })
    .from(opportunity_funnel_events)
    .where(eq(opportunity_funnel_events.opportunity_id, opportunityId))
    .groupBy(opportunity_funnel_events.event);

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.event] = Number(r.count);

  const views = counts["view"] ?? 0;
  const form_starts = counts["form_start"] ?? 0;
  const submissions = counts["form_submit"] ?? 0;

  const blocks = await db
    .select({
      rule_id: eligibility_rules.id,
      field_key: eligibility_rules.field_key,
      reject_message: eligibility_rules.reject_message,
      hits: eligibility_rules.hit_count,
    })
    .from(eligibility_rules)
    .where(
      and(
        eq(eligibility_rules.opportunity_id, opportunityId),
        eq(eligibility_rules.is_active, true),
      ),
    )
    .orderBy(eligibility_rules.sort_order, eligibility_rules.id);

  const ratio = (num: number, den: number) =>
    den === 0 ? 0 : Math.round((num / den) * 10000) / 10000;

  return {
    views,
    form_starts,
    submissions,
    eligibility_blocks: blocks.filter((b) => b.hits > 0),
    conversion: {
      view_to_start: ratio(form_starts, views),
      start_to_submit: ratio(submissions, form_starts),
    },
  };
}
