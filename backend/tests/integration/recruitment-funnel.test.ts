import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { db } from "../../src/db/client";
import { opportunity_funnel_events } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { grant } from "../helpers/rbac";
import { clearPermissionCache } from "../../src/middlewares";
import { makeUser, makeOpportunity, makeRule, makeFunnelEvent } from "../factories";
import { getFunnel, recordEvent } from "../../src/services/recruitment/funnel.service";

const uuid = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;

describe("REC-04 funnel events (public ingest)", () => {
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    const creator = await makeUser({ role: "admin" });
    oppId = (await makeOpportunity({ createdBy: creator.id, status: "published" })).id;
  });

  // §6.1 dedup
  it("same session posting view 3× yields one row; distinct sessions yield three", async () => {
    for (let i = 0; i < 3; i++) {
      await supertest(app)
        .post(`/api/opportunities/${oppId}/events`)
        .send({ event: "view", session_key: uuid(1) })
        .expect(204);
    }
    for (let i = 2; i <= 4; i++) {
      await supertest(app)
        .post(`/api/opportunities/${oppId}/events`)
        .send({ event: "view", session_key: uuid(i) })
        .expect(204);
    }
    const rows = await db
      .select()
      .from(opportunity_funnel_events)
      .where(eq(opportunity_funnel_events.opportunity_id, oppId));
    // one for session 1 + three distinct (2,3,4) = 4 rows
    expect(rows).toHaveLength(4);
  });

  // §6.2 invalid input → 204, no row
  it("invalid event / bad uuid / unpublished → 204 and no row", async () => {
    await supertest(app)
      .post(`/api/opportunities/${oppId}/events`)
      .send({ event: "nope", session_key: uuid(1) })
      .expect(204);
    await supertest(app)
      .post(`/api/opportunities/${oppId}/events`)
      .send({ event: "view", session_key: "bad" })
      .expect(204);

    const creator = await makeUser({ role: "admin" });
    const draft = await makeOpportunity({ createdBy: creator.id, status: "draft" });
    await supertest(app)
      .post(`/api/opportunities/${draft.id}/events`)
      .send({ event: "view", session_key: uuid(1) })
      .expect(204);

    const rows = await db.select().from(opportunity_funnel_events);
    expect(rows).toHaveLength(0);
  });

  it("service recordEvent is a safe no-op on a missing opportunity", async () => {
    await expect(recordEvent(999999, "view", uuid(1))).resolves.toBeUndefined();
    expect(await db.select().from(opportunity_funnel_events)).toHaveLength(0);
  });
});

describe("REC-04 funnel GET (math + permissions)", () => {
  let oppId: number;
  let creatorId: number;

  beforeEach(async () => {
    await resetDb();
    clearPermissionCache();
    creatorId = (await makeUser({ role: "admin" })).id;
    oppId = (await makeOpportunity({ createdBy: creatorId, status: "published" })).id;
  });

  // §6.3 funnel math
  it("computes counts, conversions, and eligibility blocks", async () => {
    // 5 views, 3 form_starts, 2 submits — distinct sessions.
    for (let i = 1; i <= 5; i++)
      await makeFunnelEvent({ opportunityId: oppId, event: "view", sessionKey: uuid(i) });
    for (let i = 1; i <= 3; i++)
      await makeFunnelEvent({ opportunityId: oppId, event: "form_start", sessionKey: uuid(i) });
    for (let i = 1; i <= 2; i++)
      await makeFunnelEvent({ opportunityId: oppId, event: "form_submit", sessionKey: uuid(i) });
    await makeRule({
      opportunityId: oppId,
      field_key: "age",
      operator: "gt",
      value: 30,
      reject_message: "Too old",
      hit_count: 4,
    });
    await makeRule({
      opportunityId: oppId,
      field_key: "x",
      operator: "eq",
      value: "y",
      hit_count: 0,
    }); // no hits → excluded

    const funnel = await getFunnel(oppId);
    expect(funnel.views).toBe(5);
    expect(funnel.form_starts).toBe(3);
    expect(funnel.submissions).toBe(2);
    expect(funnel.conversion.view_to_start).toBeCloseTo(0.6, 4);
    expect(funnel.conversion.start_to_submit).toBeCloseTo(0.6667, 3);
    expect(funnel.eligibility_blocks).toHaveLength(1);
    expect(funnel.eligibility_blocks[0]).toMatchObject({
      field_key: "age",
      reject_message: "Too old",
      hits: 4,
    });
  });

  it("empty funnel → zeros and zero conversions", async () => {
    const funnel = await getFunnel(oppId);
    expect(funnel).toMatchObject({
      views: 0,
      form_starts: 0,
      submissions: 0,
      conversion: { view_to_start: 0, start_to_submit: 0 },
    });
  });

  // §6.4 permissions
  it("staff → 403; director (recruitment:read) → 200", async () => {
    const staff = await loginAs("staff");
    expect(
      (await staff.agent.get(`/api/hr/recruitment/opportunities/${oppId}/funnel`)).status,
    ).toBe(403);

    await grant("director", "recruitment", "read");
    const director = await loginAs("director");
    const res = await director.agent.get(`/api/hr/recruitment/opportunities/${oppId}/funnel`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("views");
  });
});
