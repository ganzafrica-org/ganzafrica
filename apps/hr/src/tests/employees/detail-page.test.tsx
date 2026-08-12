/**
 * MOD-01 §6 item 7 — the employee sheet renders per role fixture: HR sees edit affordances on
 * HR-set fields, an employee viewing their own record does not.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";
const EMPLOYEE_ID = "11111111-1111-1111-1111-111111111111";

const authState: { roles: string[] } = { roles: ["hr"] };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    roles: authState.roles,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

import { EmployeeSheet } from "@/components/sections/sheets/employee-sheet";

afterEach(() => {
  cleanup();
});

const employeeDetail = (over: Record<string, unknown> = {}) => ({
  id: EMPLOYEE_ID,
  user_id: 2,
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
  counts: { assets: 2, open_leave: 0, documents: 1 },
  contract: null,
  ...over,
});

function mockCommon(meId: string) {
  server.use(
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}`, () =>
      HttpResponse.json({ employee: employeeDetail() }),
    ),
    http.get(`${API}/hr/employees/me`, () =>
      HttpResponse.json({ me: employeeDetail({ id: meId, roles: authState.roles }) }),
    ),
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, () => HttpResponse.json([])),
    http.get(`${API}/hr/me/contracts`, () => HttpResponse.json([])),
    http.get(`${API}/hr/me/leave`, () => HttpResponse.json({ balances: [], requests: [] })),
  );
}

describe("Employee sheet", () => {
  it("HR viewing another employee sees the HR edit affordance", async () => {
    authState.roles = ["hr"];
    mockCommon("hr-own-employee-id");

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    // The Overview tab's Profile card also renders the name in a "Name" row, so scope to the
    // sheet header (the only <h2>) rather than a plain findByText, which would match both.
    expect(await screen.findByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /profile/i }));
    expect(await screen.findByRole("button", { name: /^edit$/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /contracts/i }));
    expect(await screen.findByRole("button", { name: /add contract/i })).toBeInTheDocument();
  });

  it("an employee viewing their own record does not see the HR edit affordance", async () => {
    authState.roles = ["employee"];
    mockCommon(EMPLOYEE_ID); // /me resolves to the same id as the record being viewed

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    // The Overview tab's Profile card also renders the name in a "Name" row, so scope to the
    // sheet header (the only <h2>) rather than a plain findByText, which would match both.
    expect(await screen.findByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /profile/i }));
    expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.getByText(/edit them from your profile page/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /contracts/i }));
    await screen.findByText("No contracts yet.");
    expect(screen.queryByRole("button", { name: /add contract/i })).not.toBeInTheDocument();
  });
});
