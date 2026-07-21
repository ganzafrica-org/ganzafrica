import { describe, it, expect } from "vitest";
import {
  ALLOWED_TRANSITIONS,
  LEGACY_STATUS_MAP,
  isValidStage,
} from "../../src/services/recruitment/pipeline.service";
import { PIPELINE_STAGES } from "../../src/db/schema/recruitment/pipeline";

describe("pipeline transition matrix", () => {
  const legal: [string, string][] = [
    ["submitted", "screening"],
    ["submitted", "rejected"],
    ["submitted", "withdrawn"],
    ["screening", "shortlisted"],
    ["shortlisted", "interview"],
    ["interview", "evaluation"],
    ["evaluation", "offer"],
    ["offer", "hired"],
  ];
  const illegal: [string, string][] = [
    ["submitted", "interview"],
    ["submitted", "hired"],
    ["screening", "offer"],
    ["rejected", "screening"], // terminal
    ["hired", "offer"], // terminal
    ["withdrawn", "submitted"], // terminal
  ];

  for (const [from, to] of legal) {
    it(`allows ${from} → ${to}`, () => {
      expect(ALLOWED_TRANSITIONS[from as keyof typeof ALLOWED_TRANSITIONS]).toContain(to);
    });
  }
  for (const [from, to] of illegal) {
    it(`forbids ${from} → ${to}`, () => {
      expect(ALLOWED_TRANSITIONS[from as keyof typeof ALLOWED_TRANSITIONS]).not.toContain(to);
    });
  }

  it("terminal stages have no outgoing transitions", () => {
    expect(ALLOWED_TRANSITIONS.rejected).toEqual([]);
    expect(ALLOWED_TRANSITIONS.hired).toEqual([]);
    expect(ALLOWED_TRANSITIONS.withdrawn).toEqual([]);
  });

  it("withdrawn is reachable from every non-terminal stage", () => {
    const nonTerminal = PIPELINE_STAGES.filter(
      (s) => !["rejected", "hired", "withdrawn"].includes(s),
    );
    for (const s of nonTerminal) {
      expect(ALLOWED_TRANSITIONS[s]).toContain("withdrawn");
    }
  });
});

describe("legacy status sync map", () => {
  const expected: Record<string, string> = {
    submitted: "submitted",
    screening: "under_review",
    shortlisted: "shortlisted",
    interview: "interviewed",
    evaluation: "under_review",
    offer: "shortlisted",
    hired: "accepted",
    rejected: "rejected",
    withdrawn: "withdrawn",
  };
  for (const stage of PIPELINE_STAGES) {
    it(`${stage} → ${expected[stage]}`, () => {
      expect(LEGACY_STATUS_MAP[stage]).toBe(expected[stage]);
    });
  }
});

describe("isValidStage", () => {
  it("accepts known stages and rejects unknown", () => {
    expect(isValidStage("submitted")).toBe(true);
    expect(isValidStage("nope")).toBe(false);
  });
});
