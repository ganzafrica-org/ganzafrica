/**
 * MOD "1E→2C-plus" onboarding surface fix (Things-to-work-on.md, my-status.png): a contract_signing
 * task on the onboarding checklist previously showed only a status pill and Skip/Done — no way to
 * read the linked contract before signing, and no way to actually sign from this row even though
 * the signing backend is complete. These tests pin the added View/Sign affordances.
 */
import { beforeEach, afterEach, describe, it, expect } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { TaskRow } from "@/components/processes/task-row";
import type { ProcessTask } from "@/services/processes.service";
import type { Contract } from "@/types/api";

const API = "http://localhost:3002/api";

beforeEach(() => {
  server.use(
    http.get("http://localhost:3002/api/hr/signing/my", () => {
      return HttpResponse.json([]);
    }),
  );
});

afterEach(() => {
  server.resetHandlers();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

const task = (over: Partial<ProcessTask> & { id: number; title: string }): ProcessTask => ({
  instance_id: 1,
  description: null,
  sort_order: 0,
  assignee_user_id: null,
  visibility: "all",
  is_blocking: false,
  kind: "checklist",
  status: "pending",
  due_date: null,
  completed_at: null,
  completed_by: null,
  notes: null,
  link_ref: null,
  ...over,
});

const contract = (over: Partial<Contract> = {}): Contract => ({
  id: "contract-1",
  employeeId: "emp-1",
  jobTitle: "Software Engineer",
  department: "Engineering",
  workLocation: null,
  manager: null,
  reportTo: null,
  startDate: "2026-01-01T00:00:00.000Z",
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
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...over,
});

const contractSigningTask = task({
  id: 1,
  title: "Sign employment contract",
  kind: "contract_signing",
  link_ref: { contract_id: "contract-1" },
});

function mockCommon(
  opts: {
    mySignatures?: unknown[];
    contractsForEmployee?: Contract[];
    myContracts?: Contract[];
    signRequestOk?: boolean;
  } = {},
) {
  server.use(
    http.get(`${API}/hr/signing/requests`, () => HttpResponse.json({ requests: [] })),
    http.get(`${API}/hr/signing/my`, () =>
      HttpResponse.json({ requests: opts.mySignatures ?? [] }),
    ),
    http.get(`${API}/hr/employees/emp-1/contracts`, () =>
      HttpResponse.json(opts.contractsForEmployee ?? [contract()]),
    ),
    http.get(`${API}/hr/me/contracts`, () => HttpResponse.json(opts.myContracts ?? [contract()])),
    http.get(`${API}/hr/signing/my/:id/document`, () => HttpResponse.json({ url: null })),
    http.post(`${API}/hr/signing/my/:id/sign`, () =>
      opts.signRequestOk === false
        ? HttpResponse.json({ message: "nope" }, { status: 400 })
        : HttpResponse.json({ signed: true }),
    ),
  );
}

describe("TaskRow — contract_signing: view before sign + sign action", () => {
  it("HR viewing an employee's checklist: shows a View button once the contract loads, opens it read-only", async () => {
    mockCommon();
    renderWithClient(
      <TaskRow task={contractSigningTask} canManage isMine={false} employeeId="emp-1" />,
    );

    const viewButton = await screen.findByRole("button", { name: /view/i }, { timeout: 3000 });
    await userEvent.click(viewButton);

    expect(await screen.findByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("Contract details")).toBeInTheDocument();
    // Read-only: no edit affordance in this preview-before-signing context.
    expect(screen.queryByRole("button", { name: /edit contract/i })).not.toBeInTheDocument();
  });

  it("self-viewing (no employeeId): fetches via /hr/me/contracts instead of the HR-only route", async () => {
    mockCommon({ myContracts: [contract({ jobTitle: "Data Analyst" })] });
    renderWithClient(<TaskRow task={contractSigningTask} canManage={false} isMine />);

    const viewButton = await screen.findByRole("button", { name: /view/i });
    await userEvent.click(viewButton);

    expect(await screen.findByText("Data Analyst")).toBeInTheDocument();
  });

  it("shows no View button until the linked contract has actually loaded", () => {
    mockCommon({ contractsForEmployee: [] }); // linked id won't resolve to a real contract
    renderWithClient(
      <TaskRow task={contractSigningTask} canManage isMine={false} employeeId="emp-1" />,
    );
    expect(screen.queryByRole("button", { name: /view/i })).not.toBeInTheDocument();
  });

  it('shows a Sign button only when the viewer has a pending ("sent") signature request for this contract', async () => {
    mockCommon({
      mySignatures: [
        {
          id: 99,
          template_id: 1,
          subject: "Sign employment contract",
          signer_type: "internal",
          signer_name: "Eli Employee",
          signer_email: "employee@test.local",
          status: "sent",
          signed_file_key: null,
          completed_at: null,
          created_at: "2026-01-01T00:00:00.000Z",
          fields: [{ key: "signature", label: "Full name", type: "signature", required: true }],
          sequence_no: 2,
          ref_kind: "contract",
          ref_id: "contract-1",
        },
      ],
    });
    renderWithClient(<TaskRow task={contractSigningTask} canManage={false} isMine />);

    expect(await screen.findByRole("button", { name: /^sign$/i })).toBeInTheDocument();
  });

  it("no Sign button when the viewer's request for this contract isn't their turn yet (status=draft)", async () => {
    mockCommon({
      mySignatures: [
        {
          id: 99,
          template_id: 1,
          subject: "Sign employment contract",
          signer_type: "internal",
          signer_name: "Eli Employee",
          signer_email: "employee@test.local",
          status: "draft",
          signed_file_key: null,
          completed_at: null,
          created_at: "2026-01-01T00:00:00.000Z",
          fields: [],
          sequence_no: 2,
          ref_kind: "contract",
          ref_id: "contract-1",
        },
      ],
    });
    renderWithClient(<TaskRow task={contractSigningTask} canManage={false} isMine />);

    await screen.findByRole("button", { name: /view/i }); // contract did load
    expect(screen.queryByRole("button", { name: /^sign$/i })).not.toBeInTheDocument();
  });

  it("clicking Sign opens the real sign dialog and submits to the real signing endpoint", async () => {
    let signedId: string | null = null;
    let signedBody: unknown = null;
    mockCommon({
      mySignatures: [
        {
          id: 99,
          template_id: 1,
          subject: "Sign employment contract",
          signer_type: "internal",
          signer_name: "Eli Employee",
          signer_email: "employee@test.local",
          status: "sent",
          signed_file_key: null,
          completed_at: null,
          created_at: "2026-01-01T00:00:00.000Z",
          fields: [{ key: "signature", label: "Full name", type: "signature", required: true }],
          sequence_no: 2,
          ref_kind: "contract",
          ref_id: "contract-1",
        },
      ],
    });
    server.use(
      http.post(`${API}/hr/signing/my/:id/sign`, async ({ params, request }) => {
        signedId = params.id as string;
        signedBody = await request.json();
        return HttpResponse.json({ signed: true });
      }),
    );

    renderWithClient(<TaskRow task={contractSigningTask} canManage={false} isMine />);

    await userEvent.click(await screen.findByRole("button", { name: /^sign$/i }));
    // Dialog-only content (the task title text is ambiguous — it's also the row's own heading).
    expect(await screen.findByText(/complete the fields below/i)).toBeInTheDocument();
    // The document preview is wired in too (this mock template has no file, so the fallback shows).
    expect(
      await screen.findByText(/no document file is attached to this template/i),
    ).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/full name/i), "Eli Employee");
    await userEvent.click(screen.getByText(/legally binding/i));
    await userEvent.click(screen.getByRole("button", { name: /sign document/i }));

    await waitFor(() => expect(signedId).toBe("99"));
    expect(signedBody).toEqual({ field_values: { signature: "Eli Employee" } });
  });

  it("does not add View/Sign UI to non-contract_signing task kinds", async () => {
    mockCommon();
    renderWithClient(
      <TaskRow
        task={task({ id: 2, title: "Upload ID", kind: "document_upload" })}
        canManage={false}
        isMine
      />,
    );
    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /view/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /^sign$/i })).not.toBeInTheDocument();
    });
  });
});
