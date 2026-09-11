/**
 * The Profile page's Leave tab used to call GET /hr/employees/:id/leaves, a route that was never
 * implemented on the backend (the only similarly-named route is POST /hr/employees/:id/leave,
 * HR-only, for filing leave on someone else's behalf) — so the tab always 404'd and showed
 * "Failed to load data." The real self-service endpoint is GET /hr/me/leave (already used by the
 * Time Off page's BalanceCards), which this now reuses instead.
 */
import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import ProfileDashboard from "@/app/profile/page";
import type { Employee } from "@/types/api";

const API = "http://localhost:3002/api";

afterEach(() => cleanup());

const ME: Employee = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: 1,
  first_name: "Ada",
  last_name: "Lovelace",
  work_email: "ada@example.com",
  personal_email: "ada@personal.example.com",
  employee_number: "GZ001",
  job_title: "Engineer",
  department: "Engineering",
  employment_type: "staff",
  status: "active",
  picture: null,
  phone: "0788000111",
  citizenship: "Rwandan",
  home_country: "Rwanda",
  home_city: "Kigali",
  hired_at: "2024-01-15",
  manager: null,
  account: { email: "ada@example.com", is_active: true },
  contract_currency: null,
  is_active: true,
};

function mockMe() {
  server.use(http.get(`${API}/hr/employees/me`, () => HttpResponse.json({ me: ME })));
}

describe("Profile page — Leave tab", () => {
  it("fetches leave data from GET /hr/me/leave, not the old broken /hr/employees/:id/leaves route", async () => {
    mockMe();
    let hitOldRoute = false;
    server.use(
      http.get(`${API}/hr/employees/${ME.id}/leaves`, () => {
        hitOldRoute = true;
        return HttpResponse.json([], { status: 404 });
      }),
      http.get(`${API}/hr/me/leave`, () =>
        HttpResponse.json({
          balances: [
            {
              id: 1,
              employee_id: ME.id,
              year: 2026,
              type: "ANNUAL",
              entitled_days: "18",
              carried_over_days: "0",
              used_days: "3",
            },
          ],
          requests: [
            {
              id: "req-1",
              employee_id: ME.id,
              type: "ANNUAL",
              start_date: "2026-03-02",
              end_date: "2026-03-04",
              reason: "Trip",
              status: "PENDING",
              days: "3",
              approver_note: null,
              reviewed_at: null,
              created_at: "2026-02-20T00:00:00.000Z",
            },
          ],
        }),
      ),
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    renderWithClient(<ProfileDashboard />);
    await userEvent.click(screen.getByRole("button", { name: "Leave" }));

    // Real balance number (15 = 18 entitled - 3 used), not a "—" placeholder.
    expect(await screen.findByText("15")).toBeInTheDocument();
    expect(screen.getByText("Annual Leave")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(hitOldRoute).toBe(false);
  });

  it("shows an empty state instead of an error when there's no leave data yet", async () => {
    mockMe();
    server.use(
      http.get(`${API}/hr/me/leave`, () => HttpResponse.json({ balances: [], requests: [] })),
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    renderWithClient(<ProfileDashboard />);
    await userEvent.click(screen.getByRole("button", { name: "Leave" }));

    expect(await screen.findByText("No leave requests yet.")).toBeInTheDocument();
    expect(screen.queryByText("Failed to load data. Please try again.")).not.toBeInTheDocument();
  });
});
