import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "../setup";
import { makeUser, makeOpportunity, makeRule } from "../factories";
import * as forms from "../../src/services/recruitment/forms.service";
import type { FormDefinition } from "../../src/types/recruitment";

const emptyDef: FormDefinition = { standard: [], custom: [] };

describe("REC-01 forms.service edge paths", () => {
  let userId: number;
  let oppId: number;

  beforeEach(async () => {
    await resetDb();
    userId = (await makeUser({ role: "hr" })).id;
    oppId = (await makeOpportunity({ createdBy: userId })).id;
  });

  it("saveDraft creates then overwrites the same draft (no new version)", async () => {
    const first = await forms.saveDraft(oppId, emptyDef, userId);
    const second = await forms.saveDraft(
      oppId,
      {
        standard: [],
        custom: [{ key: "x", label: "X", type: "text", required: false, order: 1, section: "S" }],
      },
      userId,
    );
    expect(second.id).toBe(first.id); // overwrote, not appended
    expect(second.version).toBe(first.version);
  });

  it("publishDraft with no draft throws 400", async () => {
    await expect(forms.publishDraft(oppId)).rejects.toMatchObject({ statusCode: 400 });
  });

  it("updateRule patches provided fields and 404s on unknown id", async () => {
    const rule = await makeRule({
      opportunityId: oppId,
      field_key: "age",
      operator: "gt",
      value: 30,
    });
    const updated = await forms.updateRule(rule.id, {
      operator: "gte",
      value: 25,
      is_active: false,
      reject_message: "Updated",
    });
    expect(updated.operator).toBe("gte");
    expect(updated.is_active).toBe(false);
    expect(updated.reject_message).toBe("Updated");

    await expect(forms.updateRule(999999, { operator: "lt" })).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("getActiveRules returns only active rules in sort order", async () => {
    await makeRule({
      opportunityId: oppId,
      field_key: "a",
      operator: "eq",
      value: "1",
      is_active: true,
      sort_order: 2,
    });
    await makeRule({
      opportunityId: oppId,
      field_key: "b",
      operator: "eq",
      value: "2",
      is_active: true,
      sort_order: 1,
    });
    await makeRule({
      opportunityId: oppId,
      field_key: "c",
      operator: "eq",
      value: "3",
      is_active: false,
    });
    const active = await forms.getActiveRules(oppId);
    expect(active.map((r) => r.field_key)).toEqual(["b", "a"]);
  });

  it("deleteOrDeactivateRule deactivates a hit rule and 404s on unknown", async () => {
    const hit = await makeRule({
      opportunityId: oppId,
      field_key: "a",
      operator: "eq",
      value: "1",
      hit_count: 5,
    });
    const res = await forms.deleteOrDeactivateRule(hit.id);
    expect(res).toMatchObject({ deleted: false, deactivated: true });
    await expect(forms.deleteOrDeactivateRule(999999)).rejects.toMatchObject({ statusCode: 404 });
  });
});
