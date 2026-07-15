import { describe, expect, it } from "vitest";

process.env.NEXT_PUBLIC_BACKEND_URL = "http://localhost:3002/api";

describe("auth.service", () => {
  it("logs in successfully with valid credentials", async () => {
    const { authService } = await import("@/services/auth.service");
    const response = await authService.login({
      email: "hr@ganzafrica.com",
      password: "Password123!",
    });

    expect(response.accessToken).toBe("access-token");
    expect(response.user.role).toBe("HR");
  });

  it("fails login with invalid credentials", async () => {
    const { authService } = await import("@/services/auth.service");
    await expect(
      authService.login({
        email: "hr@ganzafrica.com",
        password: "wrong-password",
      }),
    ).rejects.toBeTruthy();
  });
});
