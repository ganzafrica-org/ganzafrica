import { pgTable, text, jsonb, integer } from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";

/**
 * Generic key-value settings store — the first of these toggles is signing's "require multiple
 * signers", but this is deliberately not signing-specific so a future toggle doesn't need another
 * one-off table the way every flag before this one did (see hr_settings' own migration note).
 */
export const hr_settings = pgTable("hr_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updated_by: integer("updated_by").references(() => users.id, { onDelete: "set null" }),
  ...timestampFields,
});

export type HrSetting = typeof hr_settings.$inferSelect;
