import {
  serial,
  integer,
  pgTable,
  text,
  jsonb,
  boolean,
  char,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";

/**
 * Document signing subsystem (DOC-signing) — a DocuSign-like flow for BOTH internal signers
 * (employees, via their login/session) and external signers (candidates, partners, vendors — via
 * an emailed secure token). Not certificate-based PKI: the signature is a click plus a
 * cryptographic audit trail (document hash + signer identity + timestamp + IP), which is the
 * legally-defensible standard we already use for offer acceptance.
 */

// A reusable signable template: a base document (stored file) with fillable fields.
export const signature_templates = pgTable(
  "signature_templates",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    file_key: text("file_key"), // base document (PDF) in private storage; null = fields-only template
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    is_active: boolean("is_active").notNull().default(true),
    ...timestampFields,
  },
  (t) => ({ createdByIdx: index("signature_templates_created_by_idx").on(t.created_by) }),
);

// Fields placed on a template. `type` drives the input; `page`/`x`/`y` locate it on the rendered
// document (optional — a simple form layout is used when unset).
export const signature_template_fields = pgTable(
  "signature_template_fields",
  {
    id: serial("id").primaryKey(),
    template_id: integer("template_id")
      .notNull()
      .references(() => signature_templates.id, { onDelete: "cascade" }),
    key: text("key").notNull(), // unique within the template
    label: text("label").notNull(),
    type: text("type").notNull(), // 'signature' | 'text' | 'date' | 'checkbox'
    required: boolean("required").notNull().default(true),
    signer_index: integer("signer_index").notNull().default(0), // which signer fills it (multi-party)
    sort_order: integer("sort_order").notNull().default(0),
    ...timestampFields,
  },
  (t) => ({ templateIdx: index("signature_template_fields_template_idx").on(t.template_id) }),
);

// A signing request: a template sent to a specific signer. Internal signers resolve to a user id
// (sign in-app); external signers resolve to an email + a secure_link_tokens(kind='sign_request').
export const signature_requests = pgTable(
  "signature_requests",
  {
    id: serial("id").primaryKey(),
    template_id: integer("template_id")
      .notNull()
      .references(() => signature_templates.id, { onDelete: "restrict" }),
    subject: text("subject").notNull(), // e.g. "Employment contract — Jane Doe"
    signer_type: text("signer_type").notNull(), // 'internal' | 'external'
    signer_user_id: integer("signer_user_id").references(() => users.id), // internal
    signer_email: text("signer_email"), // external (and used for internal notifications)
    signer_name: text("signer_name"),
    // Optional link back to what this signs (a contract, a document, an onboarding task).
    ref_kind: text("ref_kind"), // 'contract' | 'document' | ...
    ref_id: integer("ref_id"),
    status: text("status").notNull().default("draft"), // draft|sent|signed|declined|voided|expired
    signed_file_key: text("signed_file_key"), // the completed/signed copy (private)
    expires_at: timestamp("expires_at", { withTimezone: true }),
    sent_at: timestamp("sent_at", { withTimezone: true }),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    ...timestampFields,
  },
  (t) => ({
    signerUserIdx: index("signature_requests_signer_user_idx").on(t.signer_user_id),
    statusIdx: index("signature_requests_status_idx").on(t.status),
  }),
);

// The audit trail — the actual signature record. Immutable once written.
export const signature_events = pgTable(
  "signature_events",
  {
    id: serial("id").primaryKey(),
    request_id: integer("request_id")
      .notNull()
      .references(() => signature_requests.id, { onDelete: "cascade" }),
    event: text("event").notNull(), // 'viewed' | 'signed' | 'declined'
    field_values: jsonb("field_values").$type<Record<string, unknown>>(), // filled fields at signing
    document_hash: char("document_hash", { length: 64 }), // sha256 of (base doc key + field values)
    signer_identity: text("signer_identity"), // "user:12" or "email:jane@x.com"
    ip_address: text("ip_address"),
    user_agent: text("user_agent"),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ reqIdx: index("signature_events_request_idx").on(t.request_id) }),
);

export const SIGNER_TYPES = ["internal", "external"] as const;
export const SIGNATURE_FIELD_TYPES = ["signature", "text", "date", "checkbox"] as const;
export type SignatureRequest = typeof signature_requests.$inferSelect;
export type SignatureTemplate = typeof signature_templates.$inferSelect;
