import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";

const authState: { role: string } = { role: "EMPLOYEE" };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "1", role: authState.role },
    roles: [],
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

import HelpdeskPage from "@/app/helpdesk/page";

const ticket = (over: Record<string, unknown> = {}) => ({
  id: "t-1",
  title: "VPN keeps dropping",
  description: "Every hour or so.",
  submittedById: "emp-1",
  assignedToId: null,
  category: "IT",
  status: "OPEN",
  priority: "HIGH",
  source: "manual",
  assetId: null,
  resolvedAt: null,
  closedAt: null,
  createdAt: "2026-07-20T09:00:00Z",
  updatedAt: "2026-07-20T09:00:00Z",
  ...over,
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  authState.role = "EMPLOYEE";
});

describe("Helpdesk page", () => {
  it("shows an employee only their own tickets (no triage tab)", async () => {
    authState.role = "EMPLOYEE";
    server.use(http.get(`${API}/hr/me/helpdesk`, () => HttpResponse.json({ tickets: [ticket()] })));

    renderWithClient(<HelpdeskPage />);

    expect(await screen.findByText("VPN keeps dropping")).toBeInTheDocument();
    expect(screen.queryByText("Triage queue")).not.toBeInTheDocument();
  });

  it("gives triage staff the triage queue", async () => {
    authState.role = "HR";
    server.use(
      http.get(`${API}/hr/helpdesk`, () =>
        HttpResponse.json({ tickets: [ticket({ title: "Broken chair", category: "FACILITIES" })] }),
      ),
      http.get(`${API}/hr/me/helpdesk`, () => HttpResponse.json({ tickets: [] })),
    );

    renderWithClient(<HelpdeskPage />);

    expect(await screen.findByText("Broken chair")).toBeInTheDocument();
    expect(screen.getByText("Triage queue")).toBeInTheDocument();
  });

  it("shows an empty state when there are no tickets", async () => {
    authState.role = "EMPLOYEE";
    server.use(http.get(`${API}/hr/me/helpdesk`, () => HttpResponse.json({ tickets: [] })));

    renderWithClient(<HelpdeskPage />);

    expect(await screen.findByText("No tickets here.")).toBeInTheDocument();
  });

  it("opens the raise-ticket dialog", async () => {
    authState.role = "EMPLOYEE";
    server.use(http.get(`${API}/hr/me/helpdesk`, () => HttpResponse.json({ tickets: [] })));

    renderWithClient(<HelpdeskPage />);

    fireEvent.click(await screen.findByRole("button", { name: /raise ticket/i }));
    expect(await screen.findByText("Raise a ticket")).toBeInTheDocument();
  });
});
