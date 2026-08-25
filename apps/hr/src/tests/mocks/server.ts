import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:3002/api";

export const server = setupServer(
  http.post(`${API_URL}/hr/auth/login`, async ({ request }) => {
    const payload = (await request.json()) as { email: string; password: string };

    if (payload.email === "hr@ganzafrica.com" && payload.password === "Password123!") {
      return HttpResponse.json({
        user: {
          id: "1",
          email: payload.email,
          firstName: "HR",
          lastName: "Admin",
          role: "HR",
          requiresPasswordReset: false,
          profileSetupCompleted: true,
        },
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
    }

    return HttpResponse.json(
      { error: "Unauthorized", message: "Invalid credentials" },
      { status: 401 },
    );
  }),

  http.post(`${API_URL}/hr/auth/refresh-token`, async ({ request }) => {
    const payload = (await request.json()) as { refreshToken: string };
    if (payload.refreshToken === "refresh-token") {
      return HttpResponse.json({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
    }
    return HttpResponse.json({ error: "Unauthorized", message: "Invalid token" }, { status: 401 });
  }),

  http.get(`${API_URL}/hr/notifications`, ({ request }) => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return HttpResponse.json(
        { error: "Unauthorized", message: "Missing token" },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      data: [
        {
          id: "n-1",
          title: "Test notification",
          body: "Body",
          createdAt: new Date().toISOString(),
          read: false,
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  }),

  http.get(`${API_URL}/hr/signing/my`, () => {
    return HttpResponse.json({ data: [] });
  }),

  http.get(`${API_URL}/hr/contracts`, () => {
    return HttpResponse.json({ data: [] });
  }),
);
