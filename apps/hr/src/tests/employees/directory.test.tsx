/**
 * MOD-01 §6 item 6 — directory renders/filters (MSW) and status badges map correctly.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

import EmployeesPage from "@/app/employees/page";

afterEach(() => {
  cleanup();
  pushMock.mockClear();
});

const employee = (over: Record<string, unknown> = {}) => ({
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
  phone: null,
  citizenship: null,
  home_country: null,
  home_city: null,
  hired_at: "2024-01-15",
  manager: null,
  account: { email: "ada@example.com", is_active: true },
  ...over,
});

function mockDirectory(data: unknown[]) {
  server.use(
    http.get(`${API}/hr/employees`, () =>
      HttpResponse.json({ data, total: data.length, page: 1, limit: 25, pages: 1 }),
    ),
    http.get(`${API}/hr/employees/departments`, () =>
      HttpResponse.json({ departments: ["Engineering", "Programs"] }),
    ),
  );
}

describe("Employees directory", () => {
  it("renders the seeded employees with their status badges mapped", async () => {
    mockDirectory([
      employee(),
      employee({
        id: "22222222-2222-2222-2222-222222222222",
        first_name: "Grace",
        last_name: "Hopper",
        status: "on_leave",
      }),
      employee({
        id: "33333333-3333-3333-3333-333333333333",
        first_name: "Bea",
        last_name: "Onboard",
        status: "onboarding",
      }),
    ]);

    renderWithClient(<EmployeesPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("Bea Onboard")).toBeInTheDocument();

    const adaRow = screen.getByText("Ada Lovelace").closest("tr")!;
    const graceRow = screen.getByText("Grace Hopper").closest("tr")!;
    const beaRow = screen.getByText("Bea Onboard").closest("tr")!;
    expect(within(adaRow).getByText("Active")).toBeInTheDocument();
    expect(within(graceRow).getByText("On Leave")).toBeInTheDocument();
    expect(within(beaRow).getByText("Onboarding")).toBeInTheDocument();
  });

  it("re-queries the server when the search filter changes (server-side filtering, not client slice)", async () => {
    const seen: string[] = [];
    server.use(
      http.get(`${API}/hr/employees`, ({ request }) => {
        const url = new URL(request.url);
        seen.push(url.searchParams.get("search") ?? "");
        return HttpResponse.json({ data: [employee()], total: 1, page: 1, limit: 25, pages: 1 });
      }),
      http.get(`${API}/hr/employees/departments`, () => HttpResponse.json({ departments: [] })),
    );

    const { default: userEvent } = await import("@testing-library/user-event");
    renderWithClient(<EmployeesPage />);
    await screen.findByText("Ada Lovelace");

    await userEvent.type(screen.getByPlaceholderText("Search employees..."), "Ada");

    await waitFor(() => expect(seen.some((s) => s === "Ada")).toBe(true));
  });

  it("shows a 'no account' badge for an employee with no linked users row", async () => {
    mockDirectory([employee({ account: null })]);
    renderWithClient(<EmployeesPage />);
    expect(await screen.findByText("no account")).toBeInTheDocument();
  });
});
