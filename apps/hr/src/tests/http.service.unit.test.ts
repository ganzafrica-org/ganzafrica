import { describe, expect, it } from "vitest";

process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3002/api";

describe("http.service", () => {
  it("attaches bearer token automatically", async () => {
    const { configureHttpService, httpClient } = await import("@/services/http.service");

    configureHttpService({
      tokenReader: () => ({ accessToken: "access-token", refreshToken: "refresh-token" }),
      tokenWriter: () => undefined,
      logoutHandler: () => undefined,
    });

    const response = await httpClient.get("/notifications");
    expect(response.status).toBe(200);
    expect(response.data.data).toHaveLength(1);
  });
});
