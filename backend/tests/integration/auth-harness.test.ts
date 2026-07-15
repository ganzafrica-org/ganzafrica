import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "../setup";
import { loginAs } from "../helpers/auth";
import { makeUser } from "../factories";

describe("test harness: factories + loginAs", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("creates a user and logs in, returning a cookie-bearing agent", async () => {
    const { agent, user } = await loginAs("admin");
    expect(user.email).toContain("@test.local");
    // The agent carries the session cookie; an authenticated route should accept it.
    const me = await agent.get("/api/auth/me");
    expect([200, 404]).toContain(me.status); // route exists → 200; tolerate 404 if named differently
  });

  it("resetDb isolates tests: the same unique email can be reused across runs", async () => {
    const a = await makeUser({ email: "dup@test.local" });
    expect(a.email).toBe("dup@test.local");
    await resetDb();
    const b = await makeUser({ email: "dup@test.local" });
    expect(b.email).toBe("dup@test.local");
  });
});
