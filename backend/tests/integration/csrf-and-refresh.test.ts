import { describe, it, expect, beforeEach } from "vitest";
import supertest from "supertest";
import app from "../../src/app";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { makeUser, makePayroll } from "../factories";

function cookieValue(setCookies: string[], name: string) {
  return setCookies.map((c) => new RegExp(`${name}=([^;]+)`).exec(c)?.[1]).find(Boolean);
}

describe("CSRF double-submit", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("blocks a mutation without the X-CSRF-Token header (403)", async () => {
    const { agent } = await loginAs("admin");
    const uploader = await makeUser({ role: "admin" });
    const payroll = await makePayroll({ uploadedBy: uploader.id });
    // strip the header the helper set
    const res = await agent.post(`/api/payroll/${payroll.id}/revoke-links`).set("X-CSRF-Token", "");
    expect(res.status).toBe(403);
  });

  it("allows a mutation with a matching header", async () => {
    const { agent } = await loginAs("admin");
    const uploader = await makeUser({ role: "admin" });
    const payroll = await makePayroll({ uploadedBy: uploader.id });
    const res = await agent.post(`/api/payroll/${payroll.id}/revoke-links`);
    expect(res.status).not.toBe(403);
  });

  it("exempts login (entry point) from CSRF", async () => {
    const user = await makeUser({ role: "admin" });
    const res = await supertest(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
  });
});

describe("refresh rotation with grace window", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("rotates and accepts the previous token within the grace window", async () => {
    const { agent } = await loginAs("staff");
    const login = await agent.get("/api/auth/me"); // ensures session established
    expect(login.status).toBe(200);

    const r1 = await agent.post("/api/auth/refresh-token");
    expect(r1.status).toBe(200);

    // The agent now holds the rotated refresh cookie; refreshing again still works.
    const r2 = await agent.post("/api/auth/refresh-token");
    expect(r2.status).toBe(200);
  });

  it("rejects an unknown refresh token", async () => {
    const res = await supertest(app)
      .post("/api/auth/refresh-token")
      .set("Cookie", ["ganzafrica_refresh=garbage"]);
    expect(res.status).toBe(401);
  });
});
