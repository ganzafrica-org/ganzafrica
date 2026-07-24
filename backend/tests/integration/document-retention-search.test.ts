import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../../src/db/client";
import { hr_documents } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { makeEmployeeUser, makeDocument, ensureRole } from "../factories";

import * as docs from "../../src/services/hr/document.service";
import * as retention from "../../src/services/hr/document-retention.service";

const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000);
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400_000);

describe("DOC-plus search-in-file", () => {
  let hrId: string;
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    hrId = (await makeEmployeeUser()).employee.id;
  });

  it("matches on extracted file text and returns a snippet", async () => {
    await makeDocument({
      createdById: hrId,
      name: "Leave Policy",
      extractedText: "employees accrue twenty one days of annual leave per calendar year",
    });
    await makeDocument({
      createdById: hrId,
      name: "Unrelated",
      extractedText: "office parking rules",
    });

    const { data, total } = await docs.searchDocuments({ q: "annual leave", page: 1, limit: 10 });
    expect(total).toBe(1);
    expect(data[0].document_name).toBe("Leave Policy");
    expect(data[0].snippet).toContain("annual leave");
  });

  it("also matches on name and description, case-insensitively", async () => {
    await makeDocument({ createdById: hrId, name: "Onboarding Handbook" });
    const { total } = await docs.searchDocuments({ q: "HANDBOOK", page: 1, limit: 10 });
    expect(total).toBe(1);
  });

  it("excludes archived documents from results", async () => {
    await makeDocument({
      createdById: hrId,
      name: "Old Policy",
      extractedText: "confidential retention rules",
      archivedAt: new Date(),
    });
    const { total } = await docs.searchDocuments({ q: "retention rules", page: 1, limit: 10 });
    expect(total).toBe(0);
  });

  it("returns nothing for an empty query", async () => {
    await makeDocument({ createdById: hrId, extractedText: "anything" });
    const { total } = await docs.searchDocuments({ q: "   ", page: 1, limit: 10 });
    expect(total).toBe(0);
  });
});

describe("DOC-plus retention", () => {
  let hrId: string;
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
    hrId = (await makeEmployeeUser()).employee.id;
  });

  it("sets an explicit retention date", async () => {
    const doc = await makeDocument({ createdById: hrId, category: "Training Materials" });
    const until = daysFromNow(30);
    const res = await retention.setRetention(doc.id, until);
    expect(res.retain_until?.getTime()).toBe(until.getTime());
  });

  it("derives retention from the category default when no date is given", async () => {
    const doc = await makeDocument({ createdById: hrId, category: "Training Materials" });
    const res = await retention.setRetention(doc.id, undefined);
    expect(res.retain_until).toBeInstanceOf(Date);
    // Training Materials default is 3 years out — comfortably in the future.
    expect(res.retain_until!.getTime()).toBeGreaterThan(daysFromNow(365).getTime());
  });

  it("clears retention when passed null", async () => {
    const doc = await makeDocument({ createdById: hrId, retainUntil: daysFromNow(10) });
    const res = await retention.setRetention(doc.id, null);
    expect(res.retain_until).toBeNull();
  });

  it("refuses to schedule auto-archiving for legal-hold categories", async () => {
    const doc = await makeDocument({ createdById: hrId, category: "Compliance & Legal" });
    await expect(retention.setRetention(doc.id, daysFromNow(30))).rejects.toThrow(/legal hold/i);
  });

  it("previews only documents past retention, excluding legal-hold", async () => {
    await makeDocument({ createdById: hrId, name: "Due", retainUntil: daysAgo(1) });
    await makeDocument({ createdById: hrId, name: "NotYet", retainUntil: daysFromNow(30) });
    await makeDocument({
      createdById: hrId,
      name: "Legal",
      category: "Compliance & Legal",
      retainUntil: daysAgo(1),
    });

    const { due, count } = await retention.previewRetention();
    expect(count).toBe(1);
    expect(due[0].document_name).toBe("Due");
  });

  it("sweep soft-archives past-retention docs (never legal-hold) and is idempotent", async () => {
    const due = await makeDocument({ createdById: hrId, name: "Due", retainUntil: daysAgo(1) });
    const legal = await makeDocument({
      createdById: hrId,
      name: "Legal",
      category: "Compliance & Legal",
      retainUntil: daysAgo(1),
    });
    const future = await makeDocument({
      createdById: hrId,
      name: "Future",
      retainUntil: daysFromNow(5),
    });

    const first = await retention.runRetentionSweep();
    expect(first.archived).toBe(1);

    const [dueRow] = await db.select().from(hr_documents).where(eq(hr_documents.id, due.id));
    const [legalRow] = await db.select().from(hr_documents).where(eq(hr_documents.id, legal.id));
    const [futureRow] = await db.select().from(hr_documents).where(eq(hr_documents.id, future.id));
    expect(dueRow.archived_at).not.toBeNull();
    expect(legalRow.archived_at).toBeNull(); // legal hold untouched
    expect(futureRow.archived_at).toBeNull(); // not yet due

    // Re-running archives nothing new.
    const second = await retention.runRetentionSweep();
    expect(second.archived).toBe(0);
  });

  it("archived documents drop out of the normal list", async () => {
    await makeDocument({ createdById: hrId, name: "Visible" });
    await makeDocument({ createdById: hrId, name: "Hidden", archivedAt: new Date() });
    const { data, total } = await docs.listDocuments({ page: 1, limit: 50 });
    expect(total).toBe(1);
    expect(data.every((d) => d.document_name !== "Hidden")).toBe(true);
  });
});
