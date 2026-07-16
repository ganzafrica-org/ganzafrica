import { describe, it, expect } from "vitest";
import supertest from "supertest";
import app from "../../src/app";

describe("GET /api/health", () => {
  it("returns 200 with ok status and db connectivity", async () => {
    const res = await supertest(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.database).toBe("connected");
  });
});
