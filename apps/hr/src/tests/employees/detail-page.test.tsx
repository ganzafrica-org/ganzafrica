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

function mockCommon(
  meId: string,
  options: {
    processes?: unknown[];
    myProcess?: unknown;
    processDetail?: unknown;
    contracts?: unknown[];
    signingRequests?: unknown[];
  } = {},
) {
  server.use(
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}`, () =>
      HttpResponse.json({ employee: employeeDetail() }),
    ),
    http.get(`${API}/hr/employees/me`, () =>
      HttpResponse.json({ me: employeeDetail({ id: meId, roles: authState.roles }) }),
    ),
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, () =>
      HttpResponse.json(options.contracts ?? []),
    ),
    http.get(`${API}/hr/me/contracts`, () => HttpResponse.json(options.contracts ?? [])),
    http.get(`${API}/hr/me/leave`, () => HttpResponse.json({ balances: [], requests: [] })),
    http.get(`${API}/hr/processes`, () =>
      HttpResponse.json({ processes: options.processes ?? [] }),
    ),
    http.get(`${API}/hr/me/process`, () =>
      HttpResponse.json(
        options.myProcess ?? { instance: null, tasks: [], progress: null, can_manage: false },
      ),
    ),
    // ProcessStatus (summary variant) fetches the instance detail once the HR-viewing-other
    // Overview card knows the id, for the per-task missing breakdown.
    http.get(`${API}/hr/processes/:id`, () =>
      HttpResponse.json(
        options.processDetail ?? {
          instance: null,
          tasks: [],
          progress: null,
          can_manage: false,
        },
      ),
    ),
    // ContractSigningStatus, shown on the Overview tab for a DRAFT contract.
    http.get(`${API}/hr/signing/requests`, () =>
      HttpResponse.json({ requests: options.signingRequests ?? [] }),
    ),
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
    // No active onboarding instance in the fixture — the card must not render (tolerant of "none").
    expect(screen.queryByText(/onboarding in progress/i)).not.toBeInTheDocument();

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

describe("Employee sheet — onboarding embed (MOD-01 §5, 404/empty-tolerant)", () => {
  it("shows an onboarding progress card, linked to the instance, when HR views someone mid-onboarding", async () => {
    authState.roles = ["hr"];
    mockCommon("hr-own-employee-id", {
      processes: [
        {
          id: 42,
          template_id: 1,
          type: "onboarding",
          employee_id: EMPLOYEE_ID,
          status: "in_progress",
          started_at: "2026-01-01",
          due_date: null,
          completed_at: null,
          progress: { done: 2, total: 5, percent: 40 },
        },
      ],
      processDetail: {
        instance: { id: 42, employee_id: EMPLOYEE_ID, status: "in_progress" },
        tasks: [
          { id: 1, title: "Sign contract", status: "pending", kind: "contract_signing" },
          { id: 2, title: "Upload ID", status: "pending", kind: "document_upload" },
        ],
        progress: { done: 2, total: 5, percent: 40 },
        can_manage: true,
      },
    });

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    expect(await screen.findByText(/onboarding in progress/i)).toBeInTheDocument();
    expect(screen.getByText("2 of 5 tasks complete (40%)")).toBeInTheDocument();
    // The per-task breakdown resolves in a second, nested query (once the instance id is known).
    expect(await screen.findByText("Sign contract")).toBeInTheDocument();
    expect(screen.getByText("Upload ID")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view onboarding checklist/i })).toHaveAttribute(
      "href",
      "/employees/onboarding/42",
    );
  });

  it("shows an onboarding progress card linking to /employees/onboarding/me when a self-viewer is mid-onboarding", async () => {
    authState.roles = ["employee"];
    mockCommon(EMPLOYEE_ID, {
      myProcess: {
        instance: {
          id: 7,
          template_id: 1,
          type: "onboarding",
          employee_id: EMPLOYEE_ID,
          status: "in_progress",
          started_at: "2026-01-01",
          due_date: null,
          completed_at: null,
        },
        tasks: [],
        progress: { done: 1, total: 4, percent: 25 },
        can_manage: false,
      },
    });

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    expect(await screen.findByText(/onboarding in progress/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view onboarding checklist/i })).toHaveAttribute(
      "href",
      "/employees/onboarding/me",
    );
  });
});

const draftContract = {
  id: "cccccccc-3333-3333-3333-333333333333",
  employeeId: EMPLOYEE_ID,
  jobTitle: "Engineer",
  department: "Engineering",
  workLocation: null,
  manager: null,
  reportTo: null,
  startDate: "2026-01-15T00:00:00.000Z",
  employmentTerm: "indefinite",
  endDate: null,
  employmentType: "full-time",
  daysPerWeek: null,
  compensationType: "salaried",
  salaryScale: "monthly",
  currency: "RWF",
  baseMonthlyRate: null,
  grossAnnualRate: null,
  employmentAgreementUrl: null,
  status: "DRAFT",
  notes: null,
  createdAt: "2026-01-15T00:00:00.000Z",
  updatedAt: "2026-01-15T00:00:00.000Z",
};

describe("Employee sheet — contract-signing embed on Overview (unify-flow follow-up)", () => {
  it("shows a contract-signing badge when a DRAFT contract with a signature request exists", async () => {
    authState.roles = ["hr"];
    mockCommon("hr-own-employee-id", {
      contracts: [draftContract],
      signingRequests: [
        {
          id: 1,
          sequence_no: 1,
          signer_user_id: 7,
          signer_name: "Hana HR",
          status: "sent",
          completed_at: null,
        },
        {
          id: 2,
          sequence_no: 2,
          signer_user_id: 9,
          signer_name: "Ada Lovelace",
          status: "draft",
          completed_at: null,
        },
      ],
    });

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    expect(await screen.findByText(/contract signing/i)).toBeInTheDocument();
    expect(await screen.findByText(/waiting on hana hr/i)).toBeInTheDocument();
  });

  it("renders nothing extra when there's no DRAFT contract", async () => {
    authState.roles = ["hr"];
    mockCommon("hr-own-employee-id", { contracts: [{ ...draftContract, status: "ACTIVE" }] });

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    await screen.findByRole("heading", { name: "Ada Lovelace" });
    expect(screen.queryByText(/contract signing/i)).not.toBeInTheDocument();
  });

  it("renders nothing extra when there's a DRAFT contract but no signature request yet", async () => {
    authState.roles = ["hr"];
    mockCommon("hr-own-employee-id", { contracts: [draftContract], signingRequests: [] });

    renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);

    // The card itself renders (a DRAFT contract exists) but the badge underneath reads
    // "not yet sent" rather than any signer status.
    expect(await screen.findByText(/contract signing/i)).toBeInTheDocument();
    expect(await screen.findByText(/not yet sent for signature/i)).toBeInTheDocument();
  });
});
