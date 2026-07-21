import { describe, it, expect } from "vitest";
import { scoreText } from "../../src/services/recruitment/cv-ranking.service";
import { normalizeText } from "../../src/services/text-extraction.service";

describe("scoreText (pure ATS scorer)", () => {
  const criteria = [
    { keyword: "Python", weight: 2 },
    { keyword: "SQL", weight: 1 },
    { keyword: "leadership", weight: 1 },
  ];

  it("scores keyword hits weighted and normalized to 0..100", () => {
    // Python (2) + SQL (1) hit of 4 total → 75
    const r = scoreText("Experienced in python and sql, building data pipelines.", criteria);
    expect(r.score).toBe(75);
    expect(r.matched.map((m) => m.keyword).sort()).toEqual(["Python", "SQL"]);
  });

  it("case-insensitive, full-match all → 100, none → 0", () => {
    expect(scoreText("PYTHON sql LEADERSHIP", criteria).score).toBe(100);
    expect(scoreText("nothing relevant here", criteria).score).toBe(0);
  });

  it("no criteria → 0 (no divide-by-zero)", () => {
    expect(scoreText("anything", []).score).toBe(0);
  });

  it("ignores empty/whitespace keywords and zero weights", () => {
    const r = scoreText("python", [
      { keyword: "  ", weight: 5 },
      { keyword: "python", weight: 0 },
    ]);
    expect(r.score).toBe(0); // matched weight 0 of total 0 → 0
  });
});

describe("normalizeText", () => {
  it("collapses whitespace and lowercases", () => {
    expect(normalizeText("  Hello   WORLD\n\tFoo ")).toBe("hello world foo");
  });
});
