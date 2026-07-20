import {
  integer,
  pgTable,
  text,
  jsonb,
  serial,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { users } from "../users";
import { opportunities } from "../opportunities";
import type { FormDefinition } from "../../../types/recruitment";

// A versioned application form per opportunity. Publishing bumps the version and archives the
// predecessor; submitted applications pin the version they were served (see applications.form_version).
export const opportunity_forms = pgTable(
  "opportunity_forms",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    version: integer("version").notNull().default(1),
    status: text("status").notNull().default("draft"), // 'draft' | 'published' | 'archived'
    definition: jsonb("definition").$type<FormDefinition>().notNull(),
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    ...timestampFields,
  },
  (t) => ({
    oppVersionIdx: uniqueIndex("opportunity_forms_opp_version").on(t.opportunity_id, t.version),
    oppStatusIdx: index("opportunity_forms_opp_status_idx").on(t.opportunity_id, t.status),
  }),
);

// Pre-submission eligibility rules. Evaluated client-side (live UX) and server-side (authoritative)
// before any application row is created. hit_count is an anonymized funnel counter.
export const eligibility_rules = pgTable(
  "eligibility_rules",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    field_key: text("field_key").notNull(), // standard field name, derived 'age', or custom field key
    operator: text("operator").notNull(),
    value: jsonb("value"), // comparison operand (null for is_true / is_false)
    reject_message: text("reject_message").notNull(), // shown verbatim to the applicant
    is_active: boolean("is_active").notNull().default(true),
    sort_order: integer("sort_order").notNull().default(0),
    hit_count: integer("hit_count").notNull().default(0),
    ...timestampFields,
  },
  (t) => ({
    oppIdx: index("eligibility_rules_opportunity_id_idx").on(t.opportunity_id),
  }),
);
