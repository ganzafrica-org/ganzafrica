/**
 * loginAs — creates a user with the given role and returns a supertest agent that carries the
 * real session cookies from POST /api/auth/login. Tests exercise the REAL auth middleware.
 */
import supertest from "supertest";
import TestAgent from "supertest/lib/agent";
import app from "../../src/app";
import { makeUser, MadeUser } from "../factories";

export interface AuthedAgent {
  agent: TestAgent;
  user: MadeUser;
}

/**
 * @param role role name (e.g. "admin", "hr", "employee"). The role row is created if missing.
 */
export async function loginAs(role = "admin"): Promise<AuthedAgent> {
  const user = await makeUser({ role });
  const agent = supertest.agent(app);
  const res = await agent
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  if (res.status !== 200) {
    throw new Error(`loginAs(${role}) failed: ${res.status} ${JSON.stringify(res.body)}`);
  }

  const setCookies = (res.headers["set-cookie"] as unknown as string[]) ?? [];
  const csrf = setCookies.map((c) => /ganzafrica_csrf=([^;]+)/.exec(c)?.[1]).find(Boolean);
  if (csrf) agent.set("X-CSRF-Token", csrf);

  return { agent, user };
}
