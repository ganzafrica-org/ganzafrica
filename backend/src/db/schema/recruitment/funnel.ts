import {
  bigserial,
  integer,
  pgTable,
  text,
  char,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { opportunities } from "../opportunities";

// Anonymous per-posting funnel events (REC-04). No PII — no ip, user agent, or user id. Dedup is
// enforced by the unique (opportunity, event, session_key) index; inserts use ON CONFLICT DO
// NOTHING so one view/start/submit is counted per anonymous session per posting.
//
// Counts are computed with GROUP BY at read time. If event volume ever demands it, a nightly
// rollup table (opportunity_funnel_daily) would go here — not needed at current scale.
export const opportunity_funnel_events = pgTable(
  "opportunity_funnel_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    event: text("event").notNull(), // 'view' | 'form_start' | 'form_submit'
    session_key: char("session_key", { length: 36 }).notNull(), // client-generated uuid, anonymous
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    oppEventIdx: index("funnel_opp_event_idx").on(t.opportunity_id, t.event, t.created_at),
    dedupIdx: uniqueIndex("funnel_dedup_idx").on(t.opportunity_id, t.event, t.session_key),
  }),
);

export const FUNNEL_EVENTS = ["view", "form_start", "form_submit"] as const;
export type FunnelEvent = (typeof FUNNEL_EVENTS)[number];
