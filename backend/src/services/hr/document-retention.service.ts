/**
 * Document retention (DOC-plus). Documents past their `retain_until` are soft-archived (hidden
 * from normal lists/search, never hard-deleted) by a scheduled sweep. Legally-sensitive categories
 * are never auto-archived — they require an explicit human decision.
 *
 * Design choices (security/safety):
 * - Soft-archive only. The automated job sets `archived_at`; it never deletes bytes. Irreversible
 *   purge stays a deliberate, separately-authorized HR action.
 * - Legal hold. "Compliance & Legal" and "Contract Templates" are excluded from auto-archiving.
 * - `retain_until` is the source of truth. It is set explicitly by HR, or derived from a
 *   category default when a document is put under retention without an explicit date.
 */
import { and, eq, isNull, lte, notInArray } from "drizzle-orm";
import { db } from "@/db/client";
import { hr_documents } from "@/db/schema/hr/document";
import { AppError } from "@/middlewares";
import { Logger } from "@/config";
import type { DocumentCategory } from "./document.service";

const logger = new Logger("DocumentRetention");

// Categories that must never be auto-archived — legal/compliance hold.
export const LEGAL_HOLD_CATEGORIES: DocumentCategory[] = [
  "Compliance & Legal",
  "Contract Templates",
];

// Default retention window (days) per category when HR asks to retain without an explicit date.
// Legal-hold categories are intentionally absent (they are never auto-archived).
const DEFAULT_RETENTION_DAYS: Partial<Record<DocumentCategory, number>> = {
  "Training Materials": 365 * 3,
  "Onboarding Materials": 365 * 2,
  "Forms & Applications": 365 * 5,
  "Policies & Procedures": 365 * 7,
};

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Set (or clear) a document's retention deadline. Pass an explicit `retainUntil`, or omit it to use
 * the category default. Passing null clears retention (keep indefinitely). Legal-hold categories
 * reject an auto-archiving deadline — they can only be kept indefinitely.
 */
export async function setRetention(
  documentId: string,
  retainUntil: Date | null | undefined,
): Promise<{ id: string; retain_until: Date | null }> {
  const [doc] = await db
    .select()
    .from(hr_documents)
    .where(eq(hr_documents.id, documentId))
    .limit(1);
  if (!doc) throw new AppError("Document not found", 404);

  const category = doc.category as DocumentCategory;
  let value: Date | null;

  if (retainUntil === null) {
    value = null; // explicit clear
  } else if (retainUntil instanceof Date) {
    value = retainUntil;
  } else {
    // Derive from the category default.
    const days = DEFAULT_RETENTION_DAYS[category];
    if (!days) {
      throw new AppError(
        `No default retention period for "${category}". Provide an explicit retain_until.`,
        400,
      );
    }
    value = addDays(new Date(), days);
  }

  if (value && LEGAL_HOLD_CATEGORIES.includes(category)) {
    throw new AppError(
      `"${category}" documents are under legal hold and cannot be scheduled for auto-archiving.`,
      400,
    );
  }

  const [updated] = await db
    .update(hr_documents)
    .set({ retain_until: value, updated_at: new Date() })
    .where(eq(hr_documents.id, documentId))
    .returning({ id: hr_documents.id, retain_until: hr_documents.retain_until });

  return updated;
}

/** Documents currently due for archiving (retain_until in the past, not yet archived, not legal-hold). */
export async function previewRetention() {
  const due = await db
    .select({
      id: hr_documents.id,
      document_name: hr_documents.document_name,
      category: hr_documents.category,
      retain_until: hr_documents.retain_until,
    })
    .from(hr_documents)
    .where(
      and(
        isNull(hr_documents.archived_at),
        lte(hr_documents.retain_until, new Date()),
        notInArray(hr_documents.category, LEGAL_HOLD_CATEGORIES),
      ),
    );
  return { due, count: due.length };
}

/**
 * The scheduled sweep: soft-archive every document past retention (excluding legal-hold categories).
 * Returns the number archived. Idempotent — re-running archives nothing new.
 */
export async function runRetentionSweep(): Promise<{ archived: number }> {
  const now = new Date();
  const archived = await db
    .update(hr_documents)
    .set({ archived_at: now, updated_at: now })
    .where(
      and(
        isNull(hr_documents.archived_at),
        lte(hr_documents.retain_until, now),
        notInArray(hr_documents.category, LEGAL_HOLD_CATEGORIES),
      ),
    )
    .returning({ id: hr_documents.id });

  if (archived.length) {
    logger.info(
      `Retention sweep archived ${archived.length} document(s) past their retention date`,
    );
  }
  return { archived: archived.length };
}
