import { afterEach, describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { recruitmentService } from "@/services/recruitment.service";

const API = "http://localhost:3002/api";

afterEach(() => server.resetHandlers());

describe("recruitmentService", () => {
  it("listOpportunities → opportunities array", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities`, () =>
        HttpResponse.json({
          opportunities: [
            { opportunity_id: 1, title: "X", status: "published", stages: {}, total: 0 },
          ],
        }),
      ),
    );
    const res = await recruitmentService.listOpportunities();
    expect(res).toHaveLength(1);
    expect(res[0].title).toBe("X");
  });

  it("listApplications passes params and returns paged data", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/applications`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("stage")).toBe("screening");
        return HttpResponse.json({ data: [], page: 1, pageSize: 20, total: 0 });
      }),
    );
    const res = await recruitmentService.listApplications({
      opportunity_id: 1,
      stage: "screening",
    });
    expect(res.page).toBe(1);
  });

  it("getApplication → detail", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/applications/5`, () =>
        HttpResponse.json({ application: { id: 5 }, stage_events: [], scores: [], emails: [] }),
      ),
    );
    const res = await recruitmentService.getApplication(5);
    expect(res.application.id).toBe(5);
  });

  it("transition posts to_stage + opts", async () => {
    server.use(
      http.post(`${API}/hr/recruitment/applications/5/transition`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toMatchObject({ to_stage: "rejected", note: "no", send_email: true });
        return HttpResponse.json({ application: { id: 5, pipeline_stage: "rejected" } });
      }),
    );
    await recruitmentService.transition(5, "rejected", { note: "no", send_email: true });
  });

  it("rescreen posts", async () => {
    server.use(
      http.post(`${API}/hr/recruitment/applications/5/rescreen`, () =>
        HttpResponse.json({ ok: true }),
      ),
    );
    await recruitmentService.rescreen(5);
  });

  it("screening rule + criteria + scores + form endpoints", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/1/screening-rules`, () =>
        HttpResponse.json({ rules: [] }),
      ),
      http.post(`${API}/hr/recruitment/opportunities/1/screening-rules`, () =>
        HttpResponse.json({ rule: { id: 1 } }, { status: 201 }),
      ),
      http.get(`${API}/hr/recruitment/opportunities/1/criteria`, () =>
        HttpResponse.json({
          criteria: [{ id: 1, name: "M", weight: "1", max_score: 5, sort_order: 0 }],
        }),
      ),
      http.put(`${API}/hr/recruitment/applications/5/scores`, () =>
        HttpResponse.json({ weighted_total: 0.5 }),
      ),
      http.get(`${API}/hr/opportunities/1/form`, () =>
        HttpResponse.json({ draft: null, published: null }),
      ),
      http.put(`${API}/hr/opportunities/1/form`, () => HttpResponse.json({ form: {} })),
      http.put(`${API}/hr/opportunities/1/form/publish`, () => HttpResponse.json({ form: {} })),
      http.get(`${API}/hr/opportunities/1/rules`, () => HttpResponse.json({ rules: [] })),
      http.post(`${API}/opportunities`, () => HttpResponse.json({ opportunity: { id: 9 } })),
      http.post(`${API}/opportunities/9/publish`, () => HttpResponse.json({ ok: true })),
    );

    expect(await recruitmentService.listScreeningRules(1)).toEqual([]);
    await recruitmentService.createScreeningRule(1, {
      field_key: "age",
      operator: "gt",
      action: "flag",
    });
    expect(await recruitmentService.listCriteria(1)).toHaveLength(1);
    expect(
      (await recruitmentService.putScores(5, [{ criterion_id: 1, score: 3 }])).weighted_total,
    ).toBe(0.5);
    await recruitmentService.getForm(1);
    await recruitmentService.saveForm(1, { standard: [], custom: [] });
    await recruitmentService.publishForm(1);
    expect(await recruitmentService.listEligibilityRules(1)).toEqual([]);
    const created = await recruitmentService.createOpportunity({
      title: "New role",
      description: "desc",
      type: "employment",
      application_deadline: "2099-12-31",
      employment_details: { employment_type: "full-time" },
    });
    expect(created.opportunity.id).toBe(9);
    await recruitmentService.publishOpportunity(9);
  });

  it("getFunnel → funnel numbers", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/1/funnel`, () =>
        HttpResponse.json({
          views: 4,
          form_starts: 2,
          submissions: 1,
          eligibility_blocks: [],
          conversion: { view_to_start: 0.5, start_to_submit: 0.5 },
        }),
      ),
    );
    const f = await recruitmentService.getFunnel(1);
    expect(f.views).toBe(4);
    expect(f.submissions).toBe(1);
  });

  it("offer methods hit the right endpoints", async () => {
    const offer = { id: 1, application_id: 3, status: "draft" };
    server.use(
      http.get(`${API}/hr/recruitment/applications/3/offer`, () => HttpResponse.json({ offer })),
      http.post(`${API}/hr/recruitment/applications/3/offer`, () =>
        HttpResponse.json({ offer }, { status: 201 }),
      ),
      http.patch(`${API}/hr/offers/1`, () => HttpResponse.json({ offer })),
      http.post(`${API}/hr/offers/1/letter`, () => HttpResponse.json({ offer })),
      http.post(`${API}/hr/offers/1/send`, () =>
        HttpResponse.json({ offer: { ...offer, status: "sent" } }),
      ),
      http.post(`${API}/hr/offers/1/withdraw`, () =>
        HttpResponse.json({ offer: { ...offer, status: "withdrawn" } }),
      ),
    );
    expect((await recruitmentService.getOfferForApplication(3))?.id).toBe(1);
    expect(
      (await recruitmentService.createOffer(3, { position_title: "A", employment_type: "analyst" }))
        .id,
    ).toBe(1);
    await recruitmentService.updateOffer(1, { department: "X" });
    await recruitmentService.setOfferLetter(1, "l.pdf");
    expect((await recruitmentService.sendOffer(1)).status).toBe("sent");
    expect((await recruitmentService.withdrawOffer(1)).status).toBe("withdrawn");
  });

  it("review methods (reviewers, notes, close-out) hit the right endpoints", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/applications/3/reviewers`, () =>
        HttpResponse.json({
          reviewers: [{ id: 1, reviewer_user_id: 9, role: null, name: "A", email: "a@e" }],
        }),
      ),
      http.post(`${API}/hr/recruitment/applications/3/reviewers`, () =>
        HttpResponse.json({ reviewer: { id: 1 } }, { status: 201 }),
      ),
      http.delete(`${API}/hr/recruitment/applications/3/reviewers/9`, () =>
        HttpResponse.json({ removed: true }),
      ),
      http.get(`${API}/hr/recruitment/applications/3/notes`, () =>
        HttpResponse.json({ notes: [] }),
      ),
      http.post(`${API}/hr/recruitment/applications/3/notes`, () =>
        HttpResponse.json({ note: { id: 1 } }, { status: 201 }),
      ),
      http.get(`${API}/hr/recruitment/opportunities/1/close-out`, () =>
        HttpResponse.json({ target_hires: 1, accepted_offers: 1, target_met: true, remaining: 2 }),
      ),
      http.post(`${API}/hr/recruitment/opportunities/1/close-out`, () =>
        HttpResponse.json({ closed: 2 }),
      ),
    );
    expect(await recruitmentService.listReviewers(3)).toHaveLength(1);
    await recruitmentService.assignReviewer(3, 9, "Expert");
    await recruitmentService.removeReviewer(3, 9);
    expect(await recruitmentService.listNotes(3)).toEqual([]);
    await recruitmentService.addNote(3, { stage: "interview", note: "x", rating: 4 });
    expect((await recruitmentService.closeOutPreview(1)).target_met).toBe(true);
    expect((await recruitmentService.closeOut(1, "Filled")).closed).toBe(2);
  });

  it("ranking methods hit the right endpoints", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/1/ranking-criteria`, () =>
        HttpResponse.json({
          criteria: [{ id: 1, keyword: "Python", weight: "2", category: null, is_active: true }],
        }),
      ),
      http.post(`${API}/hr/recruitment/opportunities/1/ranking-criteria`, () =>
        HttpResponse.json({ criterion: { id: 1 } }, { status: 201 }),
      ),
      http.delete(`${API}/hr/recruitment/opportunities/1/ranking-criteria/1`, () =>
        HttpResponse.json({ deleted: true }),
      ),
      http.post(`${API}/hr/recruitment/opportunities/1/rescore`, () =>
        HttpResponse.json({ scored: 2 }),
      ),
      http.get(`${API}/hr/recruitment/opportunities/1/ranked`, () =>
        HttpResponse.json({
          applications: [
            {
              application_id: 1,
              first_name: "A",
              last_name: "B",
              pipeline_stage: "submitted",
              cv_score: "80",
            },
          ],
        }),
      ),
    );
    expect(await recruitmentService.listRankingCriteria(1)).toHaveLength(1);
    await recruitmentService.createRankingCriterion(1, { keyword: "Python", weight: 2 });
    await recruitmentService.deleteRankingCriterion(1, 1);
    expect((await recruitmentService.rescore(1)).scored).toBe(2);
    expect((await recruitmentService.listRanked(1))[0].cv_score).toBe("80");
  });
});
