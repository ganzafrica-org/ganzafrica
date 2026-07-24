import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { db } from "../../src/db/client";
import { auth_handoff_codes } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const sha256 = (v: string) => crypto.createHash("sha256").update(v).digest("hex");

describe("SSO handoff", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("mints a code and exchanges it for a session cookie + user with roles", async () => {
    const { agent } = await loginAs("hr");
    const mint = await agent.post("/api/auth/handoff").send({ target_app: "hr" });
    expect(mint.status).toBe(200);
    expect(mint.body.code).toBeTruthy();

    const res = await supertest(app)
      .post("/api/auth/handoff/exchange")
      .send({ code: mint.body.code });
    expect(res.status).toBe(200);
    expect(res.body.user.roles).toContain("hr");

    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.join(";")).toContain("ganzafrica_auth");
    expect(cookies.join(";")).toContain("HttpOnly");
    expect(cookies.join(";")).toContain("SameSite=Lax");
  });

  it("rejects a second exchange of the same code (single-use)", async () => {
    const { agent } = await loginAs("staff");
    const { body } = await agent.post("/api/auth/handoff").send({ target_app: "task" });

    const first = await supertest(app).post("/api/auth/handoff/exchange").send({ code: body.code });
    expect(first.status).toBe(200);
    const second = await supertest(app)
      .post("/api/auth/handoff/exchange")
      .send({ code: body.code });
    expect(second.status).toBe(401);
  });

  it("only one of many concurrent exchanges succeeds", async () => {
    const { agent } = await loginAs("staff");
    const { body } = await agent.post("/api/auth/handoff").send({ target_app: "task" });

    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        supertest(app).post("/api/auth/handoff/exchange").send({ code: body.code }),
      ),
    );
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  });

  it("rejects an expired code", async () => {
    const { agent } = await loginAs("staff");
    const { body } = await agent.post("/api/auth/handoff").send({ target_app: "task" });
    await db
      .update(auth_handoff_codes)
      .set({ expires_at: new Date(Date.now() - 1000) })
      .where(eq(auth_handoff_codes.code_hash, sha256(body.code)));

    const res = await supertest(app).post("/api/auth/handoff/exchange").send({ code: body.code });
    expect(res.status).toBe(401);
  });

  it("rejects an unknown code", async () => {
    const res = await supertest(app).post("/api/auth/handoff/exchange").send({ code: "nope" });
    expect(res.status).toBe(401);
  });

  it("requires auth to mint a code", async () => {
    const res = await supertest(app).post("/api/auth/handoff").send({ target_app: "task" });
    expect(res.status).toBe(401);
  });
});
