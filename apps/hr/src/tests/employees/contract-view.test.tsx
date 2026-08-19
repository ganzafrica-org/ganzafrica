/**
 * MOD-01 follow-up (post-testing feedback):
 *  - self-viewers can list their own contracts (contracts:read/manage are HR-only, so the
 *    Contracts tab must go through /hr/me/contracts, not /hr/employees/:id/contracts).
 *  - clicking a contract row opens a read-only single-contract view with the linked employment
 *    agreement document embedded via the existing MOD-05 DocumentViewer.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";
const EMPLOYEE_ID = "22222222-2222-2222-2222-222222222222";
const CONTRACT_ID = "33333333-3333-3333-3333-333333333333";
const DOCUMENT_ID = "44444444-4444-4444-4444-444444444444";

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
  first_name: "Grace",
  last_name: "Hopper",
  work_email: "grace@example.com",
  personal_email: "grace@personal.example.com",
  employee_number: "GZ002",
  job_title: "Analyst",
  department: "Data",
  employment_type: "staff",
  status: "active",
  picture: null,
  phone: null,
  citizenship: null,
  home_country: null,
  home_city: null,
  hired_at: "2024-01-15",
  manager: null,
  account: { email: "grace@example.com", is_active: true },
  counts: { assets: 0, open_leave: 0, documents: 0 },
  contract: null,
  ...over,
});

const contractFixture = {
  id: CONTRACT_ID,
  employeeId: EMPLOYEE_ID,
  jobTitle: "Analyst",
  department: "Data",
  workLocation: "Kigali HQ",
  manager: null,
  reportTo: null,
  startDate: "2024-01-15T00:00:00.000Z",
  employmentTerm: "indefinite",
  endDate: null,
  employmentType: "full-time",
  daysPerWeek: null,
  compensationType: "salaried",
  salaryScale: "monthly",
  currency: "RWF",
  baseMonthlyRate: "500000",
  grossAnnualRate: "6000000",
  employmentAgreementUrl: DOCUMENT_ID,
  status: "ACTIVE",
  notes: null,
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-01-15T00:00:00.000Z",
};

const documentFixture = {
  id: DOCUMENT_ID,
  document_name: "grace-agreement.pdf",
  category: "Contract Templates",
  version: "1",
  description: "Signed employment agreement — Analyst",
  department: "Data",
  fileSize: "120.0 KB",
  downloads: 0,
  status: "PUBLISHED",
  access: {},
  contract_id: CONTRACT_ID,
  modifiedAt: "2024-01-15T00:00:00.000Z",
  createdBy: { id: null, fullName: "" },
};

function mockCommon(meId: string) {
  server.use(
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}`, () =>
      HttpResponse.json({ employee: employeeDetail() }),
    ),
    http.get(`${API}/hr/employees/me`, () =>
      HttpResponse.json({ me: employeeDetail({ id: meId, roles: authState.roles }) }),
    ),
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, () =>
      HttpResponse.json([contractFixture]),
    ),
    http.get(`${API}/hr/me/contracts`, () => HttpResponse.json([contractFixture])),
    http.get(`${API}/hr/me/leave`, () => HttpResponse.json({ balances: [], requests: [] })),
    http.get(`${API}/hr/processes`, () => HttpResponse.json({ processes: [] })),
    http.get(`${API}/hr/me/process`, () =>
      HttpResponse.json({ instance: null, tasks: [], progress: null, can_manage: false }),
    ),
    http.get(`${API}/hr/documents/${DOCUMENT_ID}`, () =>
      HttpResponse.json({ data: documentFixture }),
    ),
    http.get(`${API}/hr/documents/${DOCUMENT_ID}/view-url`, () =>
      HttpResponse.json({
        data: { url: "https://cdn.example.com/agreement.pdf", fileName: "grace-agreement.pdf" },
      }),
    ),
  );
}

describe("Contract view", () => {
  it("HR clicking a contract row opens the read-only view with the agreement previewed", async () => {
    authState.roles = ["hr"];
    mockCommon("hr-own-employee-id");

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    await screen.findByRole("heading", { name: "Grace Hopper" });
    await userEvent.click(screen.getByRole("button", { name: /contracts/i }));
    const row = await screen.findByText("Analyst");
    await userEvent.click(row);

    const dialog = screen.getByText("Contract details").closest("div")!.parentElement!;
    expect(within(dialog).getByText(/kigali hq/i)).toBeInTheDocument();
    expect(await within(dialog).findByTitle("grace-agreement.pdf")).toHaveAttribute(
      "src",
      "https://cdn.example.com/agreement.pdf",
    );
  });

  it("a self-viewer sees their own contracts via /hr/me/contracts (contracts:read is HR-only)", async () => {
    authState.roles = ["employee"];
    mockCommon(EMPLOYEE_ID);

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    await screen.findByRole("heading", { name: "Grace Hopper" });
    await userEvent.click(screen.getByRole("button", { name: /contracts/i }));
    expect(await screen.findByText("Analyst")).toBeInTheDocument();
  });
});
