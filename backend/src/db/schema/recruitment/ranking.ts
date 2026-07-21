import {
  serial,
  integer,
  pgTable,
  text,
  jsonb,
  numeric,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { opportunities, applications } from "../opportunities";

/**
 * CV ranking criteria (REC-07) — ATS-style keyword matching HR defines per opportunity. A criterion
 * is a keyword/phrase with a weight; a match contributes weight to the candidate's score. Simple by
 * design (keyword presence); richer matching can grow later.
 */
export const ranking_criteria = pgTable(
  "ranking_criteria",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(), // matched case-insensitively against the CV text
    weight: numeric("weight", { precision: 6, scale: 2 }).notNull().default("1"),
    category: text("category"), // optional grouping (e.g. 'skills', 'education')
    is_active: boolean("is_active").notNull().default(true),
    ...timestampFields,
  },
  (t) => ({ oppIdx: index("ranking_criteria_opportunity_id_idx").on(t.opportunity_id) }),
);

/**
 * Computed CV score per application (REC-07). Populated asynchronously after submission from the
 * extracted CV text × the opportunity's active criteria. score is normalized 0..100; matched holds
 * the keywords that hit (for reviewer transparency).
 */
export const application_cv_scores = pgTable(
  "application_cv_scores",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .unique()
      .references(() => applications.id, { onDelete: "cascade" }),
    score: numeric("score", { precision: 6, scale: 2 }).notNull().default("0"),
    matched: jsonb("matched").$type<{ keyword: string; weight: number }[]>().notNull().default([]),
    extracted_chars: integer("extracted_chars").notNull().default(0),
    computed_at: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ uniq: uniqueIndex("application_cv_score_once").on(t.application_id) }),
);

export type RankingCriterion = typeof ranking_criteria.$inferSelect;
export type ApplicationCvScore = typeof application_cv_scores.$inferSelect;
