/**
 * Punch-list #2: the Contracts tab's "Add Contract" CTA should read "Add New Contract" once the
 * employee already has at least one contract (including a DRAFT-only one — still a real contract
 * row HR might forget about).
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";
const EMPLOYEE_ID = "22222222-2222-2222-2222-222222222222";
const CONTRACT_ID = "33333333-3333-3333-3333-333333333333";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    roles: ["hr"],
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

import { EmployeeSheet } from "@/components/sections/sheets/employee-sheet";

afterEach(() => {
  cleanup();
});

const employeeDetail = {
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
};

const draftContract = {
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
  employmentAgreementUrl: null,
  status: "DRAFT",
  notes: null,
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-01-15T00:00:00.000Z",
};

function mockCommon(contracts: unknown[]) {
  server.use(
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}`, () =>
      HttpResponse.json({ employee: employeeDetail }),
    ),
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, () => HttpResponse.json(contracts)),
    http.get(`${API}/hr/me/leave`, () => HttpResponse.json({ balances: [], requests: [] })),
    http.get(`${API}/hr/processes`, () => HttpResponse.json({ processes: [] })),
  );
}

async function openContractsTab() {
  renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);
  await screen.findByRole("heading", { name: "Grace Hopper" });
  await userEvent.click(screen.getByRole("button", { name: /contracts/i }));
}

describe("Add Contract button label", () => {
  it('reads "Add Contract" when the employee has none', async () => {
    mockCommon([]);
    await openContractsTab();

    expect(await screen.findByText("No contracts yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Contract" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add New Contract" })).not.toBeInTheDocument();
  });

  it('reads "Add New Contract" once a contract exists, even if it is only a DRAFT', async () => {
    mockCommon([draftContract]);
    await openContractsTab();

    expect(await screen.findByText("Analyst")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add New Contract" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Contract" })).not.toBeInTheDocument();
  });
});
