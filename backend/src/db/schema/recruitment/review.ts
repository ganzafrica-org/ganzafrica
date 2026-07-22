import { serial, integer, pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { users } from "../users";
import { applications } from "../opportunities";

/**
 * Reviewer assignment (REC-06). HR delegates review of a specific application to a colleague —
 * often a subject-matter expert in another department. An assignment grants that user the right to
 * score and add interview notes on THAT application (row-scoped), without full recruitment:manage.
 */
export const application_reviewers = pgTable(
  "application_reviewers",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    reviewer_user_id: integer("reviewer_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role"), // free-text: why they were asked (e.g. "Data science expert")
    assigned_by: integer("assigned_by")
      .notNull()
      .references(() => users.id),
    ...timestampFields,
  },
  (t) => ({
    uniq: uniqueIndex("application_reviewer_once").on(t.application_id, t.reviewer_user_id),
    appIdx: index("application_reviewers_app_idx").on(t.application_id),
    reviewerIdx: index("application_reviewers_reviewer_idx").on(t.reviewer_user_id),
  }),
);

/**
 * Interview notes / structured feedback (REC-06). Per application, per stage, per author — the
 * documentation trail that justifies advancing (or not) a candidate. rating is an optional 1..5
 * summary; note is the free-text justification.
 */
export const interview_notes = pgTable(
  "interview_notes",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    author_user_id: integer("author_user_id")
      .notNull()
      .references(() => users.id),
    stage: text("stage").notNull(), // the pipeline stage the note was made at
    rating: integer("rating"), // optional 1..5
    note: text("note").notNull(),
    ...timestampFields,
  },
  (t) => ({
    appIdx: index("interview_notes_app_idx").on(t.application_id),
  }),
);
