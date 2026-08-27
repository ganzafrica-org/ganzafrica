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
  useSearchParams: () => new URLSearchParams(),
}));

const authState: { roles: string[] } = { roles: ["hr"] };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ roles: authState.roles, user: { name: "Test User" }, isAuthenticated: true }),
}));

import EmployeesPage from "@/app/employees/page";

afterEach(() => {
  cleanup();
  pushMock.mockClear();
  authState.roles = ["hr"];
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
  is_active: true,
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
      employee({
        id: "66666666-6666-6666-6666-666666666666",
        first_name: "Penny",
        last_name: "Pending",
        status: "pending",
      }),
    ]);

    renderWithClient(<EmployeesPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("Bea Onboard")).toBeInTheDocument();
    expect(screen.getByText("Penny Pending")).toBeInTheDocument();

    const adaRow = screen.getByText("Ada Lovelace").closest("tr")!;
    const graceRow = screen.getByText("Grace Hopper").closest("tr")!;
    const beaRow = screen.getByText("Bea Onboard").closest("tr")!;
    const pennyRow = screen.getByText("Penny Pending").closest("tr")!;
    expect(within(adaRow).getByText("Active")).toBeInTheDocument();
    expect(within(graceRow).getByText("On Leave")).toBeInTheDocument();
    expect(within(pennyRow).getByText("Pending")).toBeInTheDocument();
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

  it("deactivates an employee after confirmation", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    let deactivateCalls = 0;
    mockDirectory([employee()]);
    server.use(
      http.patch(`${API}/hr/employees/11111111-1111-1111-1111-111111111111/deactivate`, () => {
        deactivateCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderWithClient(<EmployeesPage />);
    const row = (await screen.findByText("Ada Lovelace")).closest("tr")!;
    await userEvent.click(within(row).getByRole("button"));
    await userEvent.click(await screen.findByRole("menuitem", { name: /deactivate/i }));

    expect(await screen.findByText(/deactivate employee\?/i)).toBeInTheDocument();
    expect(screen.getByText(/ada lovelace will be hidden/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /deactivate employee/i }));

    await waitFor(() => expect(deactivateCalls).toBe(1));
    await waitFor(() =>
      expect(screen.queryByText(/deactivate employee\?/i)).not.toBeInTheDocument(),
    );
  });

  it("reactivates a deactivated employee directly, no confirmation needed", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    let reactivateCalls = 0;
    mockDirectory([employee({ is_active: false })]);
    server.use(
      http.patch(`${API}/hr/employees/11111111-1111-1111-1111-111111111111/reactivate`, () => {
        reactivateCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderWithClient(<EmployeesPage />);
    expect(await screen.findByText("inactive")).toBeInTheDocument();

    const row = screen.getByText("Ada Lovelace").closest("tr")!;
    await userEvent.click(within(row).getByRole("button"));
    await userEvent.click(await screen.findByRole("menuitem", { name: /reactivate/i }));

    await waitFor(() => expect(reactivateCalls).toBe(1));
  });

  it("resends the invite for a pending employee, but not for one who's already active", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    let resendCalls = 0;
    mockDirectory([
      employee({ status: "pending" }),
      employee({
        id: "22222222-2222-2222-2222-222222222222",
        first_name: "Grace",
        last_name: "Hopper",
        status: "active",
      }),
    ]);
    server.use(
      http.post(`${API}/hr/employees/11111111-1111-1111-1111-111111111111/resend-invite`, () => {
        resendCalls += 1;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderWithClient(<EmployeesPage />);
    const pendingRow = (await screen.findByText("Ada Lovelace")).closest("tr")!;
    await userEvent.click(within(pendingRow).getByRole("button"));
    await userEvent.click(await screen.findByRole("menuitem", { name: /resend invite/i }));
    await waitFor(() => expect(resendCalls).toBe(1));

    const activeRow = screen.getByText("Grace Hopper").closest("tr")!;
    await userEvent.click(within(activeRow).getByRole("button"));
    expect(screen.queryByRole("menuitem", { name: /resend invite/i })).not.toBeInTheDocument();
  });

  it("hides the deactivate/reactivate actions for a viewer with employees:read but not employees:manage", async () => {
    authState.roles = ["director"];
    const { default: userEvent } = await import("@testing-library/user-event");
    mockDirectory([employee()]);
    renderWithClient(<EmployeesPage />);

    const row = (await screen.findByText("Ada Lovelace")).closest("tr")!;
    await userEvent.click(within(row).getByRole("button"));

    expect(await screen.findByRole("menuitem", { name: /view details/i })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /deactivate/i })).not.toBeInTheDocument();
  });

  it("shows a country flag derived from the employee's home country, and a dash when there is none", async () => {
    mockDirectory([
      employee({ home_country: "Kenya" }),
      employee({
        id: "44444444-4444-4444-4444-444444444444",
        first_name: "No",
        last_name: "Country",
        home_country: null,
      }),
      employee({
        id: "55555555-5555-5555-5555-555555555555",
        first_name: "Unlisted",
        last_name: "Place",
        home_country: "Atlantis",
      }),
    ]);

    renderWithClient(<EmployeesPage />);

    const adaRow = (await screen.findByText("Ada Lovelace")).closest("tr")!;
    expect(within(adaRow).getByTitle("Kenya")).toHaveTextContent("🇰🇪");

    const noCountryRow = screen.getByText("No Country").closest("tr")!;
    expect(within(noCountryRow).getByTitle("No home country set")).toBeInTheDocument();

    // Unrecognized country names still get a neutral globe rather than disappearing.
    const unlistedRow = screen.getByText("Unlisted Place").closest("tr")!;
    expect(within(unlistedRow).getByTitle("Atlantis")).toHaveTextContent("🌍");
  });
});
