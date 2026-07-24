import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../src/app";

// Isolated file: the payslip view limiter is app-level state (10/min/IP). Kept separate so
// exhausting it here doesn't affect other tests. Unknown tokens 410 until the limit trips → 429.
describe("payslip view rate limit", () => {
  it("returns 429 after 10 requests in a minute from one IP", async () => {
    let last = 0;
    for (let i = 0; i < 11; i++) {
      const res = await supertest(app).get(`/api/payslips/view/nope-${i}`);
      last = res.status;
    }
    expect(last).toBe(429);
  });
});
