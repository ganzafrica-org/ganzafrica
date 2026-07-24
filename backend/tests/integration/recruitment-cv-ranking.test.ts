import { describe, it, expect, beforeEach, vi } from "vitest";
import { db } from "../../src/db/client";
import { application_cv_scores, ranking_criteria } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { makeUser, makeOpportunity, makeApplication } from "../factories";

// Mock text extraction so scoring is deterministic without a real PDF/network.
const extractMock = vi.fn(async () => ({ text: "python sql leadership", chars: 20, ok: true }));
vi.mock("../../src/services/text-extraction.service", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, extractText: (...a: unknown[]) => extractMock(...a) };
});
// The CV fetch: return a dummy buffer so fetchAndExtract proceeds to extractText (mocked).
vi.stubGlobal(
  "fetch",
  vi.fn(async () => ({
    ok: true,
    arrayBuffer: async () => new ArrayBuffer(8),
    headers: { get: () => "application/pdf" },
  })) as unknown as typeof fetch,
);

import * as ranking from "../../src/services/recruitment/cv-ranking.service";

describe("REC-07 ranking criteria CRUD", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    extractMock.mockClear();
  });

  it("create, list, update, delete criteria", async () => {
    const c = await ranking.createCriterion(oppId, {
      keyword: "Python",
      weight: 2,
      category: "skills",
    });
    expect(c.keyword).toBe("Python");
    expect(Number(c.weight)).toBe(2);

    const listed = await ranking.listCriteria(oppId);
    expect(listed).toHaveLength(1);

    const updated = await ranking.updateCriterion(c.id, { weight: 3, is_active: false });
    expect(Number(updated.weight)).toBe(3);
    expect(updated.is_active).toBe(false);

    await ranking.deleteCriterion(c.id);
    expect(await ranking.listCriteria(oppId)).toHaveLength(0);

    await expect(ranking.updateCriterion(999999, { keyword: "x" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe("REC-07 CV scoring", () => {
  let hrId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: hrId })).id;
    extractMock.mockClear();
    extractMock.mockResolvedValue({ text: "python sql leadership", chars: 20, ok: true });
  });

  it("scores an application against active criteria and upserts the score", async () => {
    await ranking.createCriterion(oppId, { keyword: "python", weight: 2 });
    await ranking.createCriterion(oppId, { keyword: "sql", weight: 1 });
    await ranking.createCriterion(oppId, { keyword: "rust", weight: 1 }); // not present
    const app = await makeApplication({
      opportunityId: oppId,
      overrides: { cv_url: "cvs/jane.pdf" },
    });

    await ranking.scoreApplicationCv(app.id);

    const score = await ranking.getScore(app.id);
    expect(score).not.toBeNull();
    // python(2)+sql(1) of 4 → 75
    expect(Number(score!.score)).toBe(75);
    expect(score!.matched.map((m) => m.keyword).sort()).toEqual(["python", "sql"]);
  });

  it("is a safe no-op when there are no criteria or no cv", async () => {
    const app = await makeApplication({ opportunityId: oppId, overrides: { cv_url: "cvs/x.pdf" } });
    await ranking.scoreApplicationCv(app.id); // no criteria
    expect(await ranking.getScore(app.id)).toBeNull();

    await ranking.createCriterion(oppId, { keyword: "python", weight: 1 });
    const noCv = await makeApplication({ opportunityId: oppId, overrides: { cv_url: "" } });
    await ranking.scoreApplicationCv(noCv.id);
    expect(await ranking.getScore(noCv.id)).toBeNull();
  });

  it("rescoreOpportunity scores all applications; ranked list orders by score desc", async () => {
    await ranking.createCriterion(oppId, { keyword: "python", weight: 1 });

    extractMock.mockResolvedValueOnce({ text: "python expert", chars: 12, ok: true }); // hit → 100
    const strong = await makeApplication({
      opportunityId: oppId,
      overrides: { cv_url: "cvs/a.pdf" },
    });
    extractMock.mockResolvedValueOnce({ text: "no relevant skills", chars: 18, ok: true }); // miss → 0
    const weak = await makeApplication({
      opportunityId: oppId,
      overrides: { cv_url: "cvs/b.pdf" },
    });

    const { scored } = await ranking.rescoreOpportunity(oppId);
    expect(scored).toBe(2);

    const ranked = await ranking.rankedApplications(oppId);
    expect(ranked[0].application_id).toBe(strong.id);
    expect(Number(ranked[0].cv_score)).toBe(100);
    expect(ranked[1].application_id).toBe(weak.id);
  });

  it("re-scoring an application overwrites the previous score", async () => {
    await ranking.createCriterion(oppId, { keyword: "python", weight: 1 });
    const app = await makeApplication({ opportunityId: oppId, overrides: { cv_url: "cvs/a.pdf" } });

    extractMock.mockResolvedValueOnce({ text: "python", chars: 6, ok: true });
    await ranking.scoreApplicationCv(app.id);
    expect(Number((await ranking.getScore(app.id))!.score)).toBe(100);

    extractMock.mockResolvedValueOnce({ text: "nothing", chars: 7, ok: true });
    await ranking.scoreApplicationCv(app.id);
    expect(Number((await ranking.getScore(app.id))!.score)).toBe(0);

    const rows = await db
      .select()
      .from(application_cv_scores)
      .where(eq(application_cv_scores.application_id, app.id));
    expect(rows).toHaveLength(1); // upsert, not duplicate
  });
});
