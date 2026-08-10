/**
 * MOD-01 §6 item 7 — detail tabs render per role fixture: HR sees edit affordances on HR-set
 * fields, an employee viewing their own record does not.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";
const EMPLOYEE_ID = "11111111-1111-1111-1111-111111111111";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: EMPLOYEE_ID }),
  useRouter: () => ({ push: vi.fn() }),
}));

const authState: { roles: string[] } = { roles: ["hr"] };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    roles: authState.roles,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

import EmployeeDetailPage from "@/app/employees/[id]/page";

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
    http.get(`${API}/hr/processes`, () => HttpResponse.json({ processes: [] })),
    http.get(`${API}/hr/me/process`, () =>
      HttpResponse.json({ instance: null, tasks: [], progress: null, can_manage: false }),
    ),
  );
}

describe("Employee detail page", () => {
  it("HR viewing another employee sees the HR edit affordance", async () => {
    authState.roles = ["hr"];
    mockCommon("hr-own-employee-id");

    renderWithClient(<EmployeeDetailPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^edit$/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /contract/i }));
    expect(await screen.findByRole("button", { name: /add contract/i })).toBeInTheDocument();
  });

  it("an employee viewing their own record does not see the HR edit affordance", async () => {
    authState.roles = ["employee"];
    mockCommon(EMPLOYEE_ID); // /me resolves to the same id as the record being viewed

    renderWithClient(<EmployeeDetailPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.getByText(/edit them from your profile page/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /contract/i }));
    await screen.findByText("No contracts yet.");
    expect(screen.queryByRole("button", { name: /add contract/i })).not.toBeInTheDocument();
  });
});
