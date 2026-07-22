import {
  integer,
  pgTable,
  text,
  jsonb,
  serial,
  boolean,
  numeric,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { users } from "../users";
import { opportunities, applications } from "../opportunities";

// Ordered pipeline stages (REC-02). pipeline_stage on applications is the pipeline's truth; the
// legacy applicationStatusEnum is kept coherent by a service-level sync map (see pipeline.service).
export const PIPELINE_STAGES = [
  "submitted",
  "screening",
  "shortlisted",
  "interview",
  "evaluation",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

// Append-only audit trail of every stage change (actor NULL = automation, e.g. auto-reject).
export const application_stage_events = pgTable(
  "application_stage_events",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    from_stage: text("from_stage"),
    to_stage: text("to_stage").notNull(),
    actor_user_id: integer("actor_user_id").references(() => users.id),
    note: text("note"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ appIdx: index("stage_events_app_idx").on(t.application_id) }),
);

// Post-submission screening rules (REC-02). Same operator vocabulary as REC-01 eligibility rules,
// but the action auto-rejects or flags an already-created application. Runs AFTER insert; a
// screening error must never fail the submission.
export const screening_rules = pgTable(
  "screening_rules",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    field_key: text("field_key").notNull(),
    operator: text("operator").notNull(),
    value: jsonb("value"),
    action: text("action").notNull(), // 'auto_reject' | 'flag'
    email_template: text("email_template"), // template key for auto_reject (null = silent reject)
    rejection_reason: text("rejection_reason"),
    is_active: boolean("is_active").notNull().default(true),
    hit_count: integer("hit_count").notNull().default(0),
    ...timestampFields,
  },
  (t) => ({ oppIdx: index("screening_rules_opportunity_id_idx").on(t.opportunity_id) }),
);

// Weighted evaluation criteria per opportunity.
export const evaluation_criteria = pgTable(
  "evaluation_criteria",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    weight: numeric("weight", { precision: 5, scale: 2 }).notNull().default("1"),
    max_score: integer("max_score").notNull().default(5),
    sort_order: integer("sort_order").notNull().default(0),
    ...timestampFields,
  },
  (t) => ({ oppIdx: index("evaluation_criteria_opportunity_id_idx").on(t.opportunity_id) }),
);

// Per-reviewer, per-criterion scores. One row per (application, criterion, reviewer).
export const application_scores = pgTable(
  "application_scores",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    criterion_id: integer("criterion_id")
      .notNull()
      .references(() => evaluation_criteria.id, { onDelete: "cascade" }),
    reviewer_user_id: integer("reviewer_user_id")
      .notNull()
      .references(() => users.id),
    score: integer("score").notNull(), // 0..criterion.max_score, service-validated
    comment: text("comment"),
    ...timestampFields,
  },
  (t) => ({
    uniq: uniqueIndex("app_score_uniq").on(t.application_id, t.criterion_id, t.reviewer_user_id),
  }),
);

// Idempotent record of applicant emails: one row per (application, email_type). The unique index
// is the idempotency guard — insert-first, unique-violation => already sent, skip.
export const recruitment_emails = pgTable(
  "recruitment_emails",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    email_type: text("email_type").notNull(), // 'received'|'rejected'|'shortlisted'|'interview'|'offer'|'hired'
    sent_at: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ uniq: uniqueIndex("recruitment_email_once").on(t.application_id, t.email_type) }),
);
