/**
 * Feature 1 (multi-signatory signing): the Contract tab's "Send for signature" action.
 * With the toggle off, it's a single-recipient send to the contract's own employee (no
 * regression of the simple case). With the toggle on, HR can pick additional signers and a
 * sequential/parallel mode via the same createSignerSequence backend path.
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
const OTHER_EMPLOYEE_ID = "55555555-5555-5555-5555-555555555555";

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
  server.resetHandlers();
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

const otherEmployee = {
  ...employeeDetail,
  id: OTHER_EMPLOYEE_ID,
  user_id: 9,
  first_name: "Ada",
  last_name: "Lovelace",
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

const template = {
  id: 7,
  name: "Employment Contract",
  description: null,
  file_key: "k",
  is_active: true,
};

function mockCommon(opts: { requireMultipleSigners: boolean; sequence?: unknown[] }) {
  server.use(
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}`, () =>
      HttpResponse.json({ employee: employeeDetail }),
    ),
    http.get(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, () =>
      HttpResponse.json([draftContract]),
    ),
    http.get(`${API}/hr/me/leave`, () => HttpResponse.json({ balances: [], requests: [] })),
    http.get(`${API}/hr/processes`, () => HttpResponse.json({ processes: [] })),
    http.get(`${API}/hr/signing/requests`, () =>
      HttpResponse.json({ requests: opts.sequence ?? [] }),
    ),
    http.get(`${API}/hr/settings/require_multiple_signers`, () =>
      HttpResponse.json({ key: "require_multiple_signers", value: opts.requireMultipleSigners }),
    ),
    http.get(`${API}/hr/signing/templates`, () => HttpResponse.json({ templates: [template] })),
    http.get(`${API}/hr/employees`, () =>
      HttpResponse.json({ data: [otherEmployee], total: 1, page: 1, limit: 20, pages: 1 }),
    ),
    // The multi-signer picker only offers designated co-signers — Ada must be in the pool to be
    // pickable at all.
    http.get(`${API}/hr/signing/signer-pool`, () =>
      HttpResponse.json({
        pool: [
          {
            employeeId: OTHER_EMPLOYEE_ID,
            userId: otherEmployee.user_id,
            firstName: otherEmployee.first_name,
            lastName: otherEmployee.last_name,
            jobTitle: null,
            addedAt: "2024-01-15T00:00:00.000Z",
          },
        ],
      }),
    ),
  );
}

/** The contract row itself also has role="button" and includes this text in its accessible
 *  name, so scope to the actual <button> element. */
async function findSendForSignatureButton() {
  const matches = await screen.findAllByRole("button", { name: /send for signature/i });
  const button = matches.find((el) => el.tagName === "BUTTON");
  if (!button) throw new Error("Send for signature button not found");
  return button;
}

async function openContractsTab() {
  renderWithClient(<EmployeeSheet employeeId={EMPLOYEE_ID} />);
  await screen.findByRole("heading", { name: "Grace Hopper" });
  await userEvent.click(screen.getByRole("button", { name: /contracts/i }));
}

describe("Send for signature", () => {
  it("is hidden once a signature sequence already exists for the contract", async () => {
    mockCommon({
      requireMultipleSigners: false,
      sequence: [
        {
          id: 1,
          sequence_no: 1,
          signer_user_id: 2,
          signer_name: "Grace Hopper",
          status: "sent",
          completed_at: null,
        },
      ],
    });
    await openContractsTab();

    await screen.findByText("Analyst");
    const matches = screen.queryAllByRole("button", { name: /send for signature/i });
    expect(matches.filter((el) => el.tagName === "BUTTON")).toHaveLength(0);
  });

  it("toggle off: sends a single-signer request to the contract's own employee", async () => {
    let posted: Record<string, unknown> | null = null;
    mockCommon({ requireMultipleSigners: false });
    server.use(
      http.post(`${API}/hr/signing/requests/sequence`, async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ requests: [] }, { status: 201 });
      }),
    );
    await openContractsTab();

    await userEvent.click(await findSendForSignatureButton());
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(
        (_, el) => el?.tagName === "P" && /will be sent to/i.test(el.textContent ?? ""),
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("Grace Hopper")).toBeInTheDocument();
    expect(within(dialog).queryByText(/search employees/i)).not.toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole("button", { name: "Send" }));

    await vi.waitFor(() => expect(posted).not.toBeNull());
    expect(posted).toMatchObject({
      ref_kind: "contract",
      ref_id: CONTRACT_ID,
      signerUserIds: [2],
      mode: "sequential",
    });
  });

  it("toggle on: HR can add extra signers and choose parallel mode", async () => {
    let posted: Record<string, unknown> | null = null;
    mockCommon({ requireMultipleSigners: true });
    server.use(
      http.post(`${API}/hr/signing/requests/sequence`, async ({ request }) => {
        posted = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ requests: [] }, { status: 201 });
      }),
    );
    await openContractsTab();

    await userEvent.click(await findSendForSignatureButton());
    const dialog = await screen.findByRole("dialog");

    // multi-employee picker is shown; add the second employee
    await userEvent.type(within(dialog).getByPlaceholderText(/search employees/i), "Ada");
    await userEvent.click(await within(dialog).findByText("Ada Lovelace"));

    // switch to parallel mode
    await userEvent.click(within(dialog).getByRole("combobox"));
    await userEvent.click(await screen.findByText(/parallel/i));

    await userEvent.click(within(dialog).getByRole("button", { name: "Send" }));

    await vi.waitFor(() => expect(posted).not.toBeNull());
    expect(posted).toMatchObject({ mode: "parallel" });
    expect(posted!.signerUserIds as number[]).toEqual(expect.arrayContaining([2, 9]));
  });

  it("toggle on, empty signer pool: warns instead of offering the whole directory", async () => {
    mockCommon({ requireMultipleSigners: true });
    server.use(http.get(`${API}/hr/signing/signer-pool`, () => HttpResponse.json({ pool: [] })));
    await openContractsTab();

    await userEvent.click(await findSendForSignatureButton());
    const dialog = await screen.findByRole("dialog");

    expect(within(dialog).getByText(/no designated co-signers yet/i)).toBeInTheDocument();
    await userEvent.type(within(dialog).getByPlaceholderText(/search employees/i), "Ada");
    expect(within(dialog).queryByText("Ada Lovelace")).not.toBeInTheDocument();
  });
});
