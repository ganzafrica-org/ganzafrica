/**
 * Generic hr_settings key-value store. First consumer is signing's "require multiple signers"
 * toggle; deliberately not signing-specific so a later toggle can reuse this instead of another
 * one-off column.
 */
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_settings } from "@/db/schema";

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const [row] = await db.select().from(hr_settings).where(eq(hr_settings.key, key)).limit(1);
  return row ? (row.value as T) : null;
}

export async function setSetting(key: string, value: unknown, updatedBy: number): Promise<void> {
  await db
    .insert(hr_settings)
    .values({ key, value, updated_by: updatedBy })
    .onConflictDoUpdate({
      target: hr_settings.key,
      set: { value, updated_by: updatedBy, updated_at: new Date() },
    });
}
