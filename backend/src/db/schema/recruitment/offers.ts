import {
  serial,
  integer,
  pgTable,
  text,
  date,
  numeric,
  char,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { users } from "../users";
import { applications } from "../opportunities";

// Offer on an application (REC-05). One offer per application (unique). The acceptance click +
// secure-link audit trail is the signature for now (spec §9); a real e-sign ceremony is separate.
export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  application_id: integer("application_id")
    .notNull()
    .unique()
    .references(() => applications.id, { onDelete: "cascade" }),
  position_title: text("position_title").notNull(),
  employment_type: text("employment_type").notNull(), // fellow|analyst|staff|contractor|intern
  department: text("department"),
  start_date: date("start_date"),
  gross_salary: numeric("gross_salary", { precision: 15, scale: 2 }),
  currency: text("currency").notNull().default("RWF"),
  additional_terms: text("additional_terms"),
  letter_file_key: text("letter_file_key"), // uploaded PDF, private ACL
  status: text("status").notNull().default("draft"), // draft|sent|accepted|declined|expired|withdrawn
  expires_at: timestamp("expires_at", { withTimezone: true }),
  sent_at: timestamp("sent_at", { withTimezone: true }),
  responded_at: timestamp("responded_at", { withTimezone: true }),
  decline_reason: text("decline_reason"),
  // Set true on accept when the onboarding hook deferred (LCM-01 not wired yet) so LCM-01's
  // migration can backfill onboarding instances for already-hired offers.
  onboarding_pending: boolean("onboarding_pending").notNull().default(false),
  created_by: integer("created_by")
    .notNull()
    .references(() => users.id),
  ...timestampFields,
});

/**
 * Generalized secure single-use link tokens (REC-05). Raw token is never stored — only its sha256
 * hash. `kind` lets one audited mechanism serve offers now and other flows (invites, sign
 * requests) later. FND-01 payslip tokens keep their own table and migrate opportunistically.
 */
export const secure_link_tokens = pgTable(
  "secure_link_tokens",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(), // 'offer' | (future: 'invite', 'sign_request', ...)
    subject_id: integer("subject_id").notNull(), // offer.id for kind=offer
    token_hash: char("token_hash", { length: 64 }).notNull().unique(),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
    used_at: timestamp("used_at", { withTimezone: true }), // set on the single decision (accept/decline)
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    // Revoke-by-subject and active-token lookups hit (kind, subject_id).
    kindSubjectIdx: index("secure_link_kind_subject_idx").on(t.kind, t.subject_id),
  }),
);

export const OFFER_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
  "withdrawn",
] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
