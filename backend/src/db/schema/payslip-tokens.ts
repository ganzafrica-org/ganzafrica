import { pgTable, serial, integer, char, timestamp, index } from "drizzle-orm/pg-core";
import { payrolls } from "./payroll";

/**
 * Long-lived, revocable access tokens for payslip download links sent by email. The raw token
 * lives only in the emailed URL; we store its sha256 hash. Redeeming a valid token 302-redirects
 * to a fresh short-lived presigned Spaces URL (see payslip-token.service.ts).
 */
export const payslip_access_tokens = pgTable(
  "payslip_access_tokens",
  {
    id: serial("id").primaryKey(),
    payroll_id: integer("payroll_id")
      .notNull()
      .references(() => payrolls.id, { onDelete: "cascade" }),
    token_hash: char("token_hash", { length: 64 }).notNull().unique(), // sha256 hex
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    last_accessed_at: timestamp("last_accessed_at", { withTimezone: true }),
    access_count: integer("access_count").notNull().default(0),
  },
  (t) => ({ payrollIdx: index("payslip_tokens_payroll_idx").on(t.payroll_id) }),
);

export type PayslipAccessToken = typeof payslip_access_tokens.$inferSelect;
