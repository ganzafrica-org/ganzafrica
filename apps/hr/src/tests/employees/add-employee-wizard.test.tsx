/**
 * Unify employee creation, contract, signing, onboarding — the wizard's "Add now" contract step
 * actually attaches a contract (asserted via the real service calls, not just UI state), and the
 * inline signing entry point only appears once a contract exists to route.
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { AddEmployeeSheet } from "@/components/sections/sheets/add-employee-sheet";

// AnimatePresence's exit/enter animations never resolve under jsdom (no real rAF timing), so
// mode="wait" leaves the previous step's content mounted forever — replace with a plain
// pass-through so step transitions happen synchronously, like they do in a real browser.
// vi.mock calls are hoisted above imports, so this still applies to the import above.
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...rest
    }: Record<string, unknown> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

const API = "http://localhost:3002/api";
const EMPLOYEE_ID = "aaaaaaaa-1111-1111-1111-111111111111";
const CONTRACT_ID = "bbbbbbbb-2222-2222-2222-222222222222";
const INSTANCE_ID = 55;
const TASK_ID = 900;

beforeEach(() => {
  // ContractFormFields' manager picker fetches this regardless of which test needs it.
  server.use(
    http.get(`${API}/hr/employees`, () => HttpResponse.json({ data: [], total: 0, pages: 1 })),
  );
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

async function fillProfileStep() {
  // First/Last Name have no placeholder or htmlFor-linked label — the profile step's field
  // order is fixed (First Name, Last Name, then the placeholder-bearing Personal Email), so
  // textboxes[0]/[1] are reliable.
  const textboxes = screen.getAllByRole("textbox");
  await userEvent.type(textboxes[0], "New");
  await userEvent.type(textboxes[1], "Hire");
  await userEvent.type(screen.getByPlaceholderText("john@gmail.com"), "new.hire@example.com");
  await userEvent.click(screen.getByRole("button", { name: /^next$/i }));
}

async function selectOption(triggerText: string, optionText: string) {
  // The placeholder text node itself has pointer-events:none (Radix's SelectValue) — click the
  // combobox button it lives in instead.
  const trigger = screen.getByText(triggerText).closest('[role="combobox"]') as HTMLElement;
  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

async function fillMinimalContract() {
  await userEvent.click(screen.getByRole("switch"));
  await userEvent.type(screen.getByPlaceholderText("e.g. Software Engineer"), "Analyst");
  const startDate = document.querySelector('input[type="date"]') as HTMLInputElement;
  await userEvent.type(startDate, "2026-03-02");
  await selectOption("Indefinite or Definite", "Indefinite");
  await selectOption("Full-time or Part-time", "Full-time");
  await selectOption("Hourly or Salaried", "Salaried");
}

describe("AddEmployeeSheet — contract + signing entry point", () => {
  it("'Add now' attaches a DRAFT contract via the real contract service call", async () => {
    let contractBody: Record<string, unknown> | null = null;
    server.use(
      http.post(`${API}/hr/employees`, () =>
        HttpResponse.json(
          { employee: { id: EMPLOYEE_ID, first_name: "New", last_name: "Hire" } },
          { status: 201 },
        ),
      ),
      http.post(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, async ({ request }) => {
        contractBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { id: CONTRACT_ID, employeeId: EMPLOYEE_ID, jobTitle: "Analyst", status: "DRAFT" },
          { status: 201 },
        );
      }),
      http.get(`${API}/hr/processes`, () => HttpResponse.json({ processes: [] })),
      http.get(`${API}/hr/signing/requests`, () => HttpResponse.json({ requests: [] })),
    );

    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);

    await fillProfileStep();
    await fillMinimalContract();
    await userEvent.click(screen.getByRole("button", { name: /create employee/i }));

    await waitFor(() => expect(contractBody).not.toBeNull());
    expect(contractBody).toMatchObject({
      jobTitle: "Analyst",
      employmentTerm: "indefinite",
      employmentType: "full-time",
      compensationType: "salaried",
      status: "DRAFT",
    });
  }, 15000);

  it("shows the signing entry point only once a contract exists, and links it to the onboarding task", async () => {
    let patchedLinkRef: unknown = null;
    server.use(
      http.post(`${API}/hr/employees`, () =>
        HttpResponse.json(
          { employee: { id: EMPLOYEE_ID, first_name: "New", last_name: "Hire" } },
          { status: 201 },
        ),
      ),
      http.post(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, () =>
        HttpResponse.json(
          { id: CONTRACT_ID, employeeId: EMPLOYEE_ID, jobTitle: "Analyst", status: "DRAFT" },
          { status: 201 },
        ),
      ),
      http.get(`${API}/hr/processes`, () =>
        HttpResponse.json({
          processes: [
            {
              id: INSTANCE_ID,
              type: "onboarding",
              employee_id: EMPLOYEE_ID,
              status: "in_progress",
              progress: { done: 0, total: 1, percent: 0 },
            },
          ],
        }),
      ),
      http.get(`${API}/hr/processes/${INSTANCE_ID}`, () =>
        HttpResponse.json({
          instance: { id: INSTANCE_ID, employee_id: EMPLOYEE_ID, status: "in_progress" },
          tasks: [
            {
              id: TASK_ID,
              title: "Sign employment contract",
              kind: "contract_signing",
              status: "pending",
              link_ref: null,
            },
          ],
          progress: { done: 0, total: 1, percent: 0 },
          can_manage: true,
        }),
      ),
      http.get(`${API}/hr/signing/requests`, () => HttpResponse.json({ requests: [] })),
      http.patch(`${API}/hr/process-tasks/${TASK_ID}`, async ({ request }) => {
        const body = (await request.json()) as { link_ref: unknown };
        patchedLinkRef = body.link_ref;
        return HttpResponse.json({ task: { id: TASK_ID, status: "pending" } });
      }),
    );

    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);

    // Before any contract exists, nothing about signing is on screen.
    expect(screen.queryByRole("button", { name: /send for signature/i })).not.toBeInTheDocument();

    await fillProfileStep();
    await fillMinimalContract();
    await userEvent.click(screen.getByRole("button", { name: /create employee/i }));

    const sendButton = await screen.findByRole("button", { name: /send for signature/i });
    await userEvent.click(sendButton);

    await waitFor(() => expect(patchedLinkRef).toEqual({ contract_id: CONTRACT_ID }));
    expect(await screen.findByRole("button", { name: /sent to hr for signature/i })).toBeDisabled();
  }, 15000);

  it("closes immediately with no signing entry point when the contract step is skipped", async () => {
    const onOpenChange = vi.fn();
    server.use(
      http.post(`${API}/hr/employees`, () =>
        HttpResponse.json(
          { employee: { id: EMPLOYEE_ID, first_name: "New", last_name: "Hire" } },
          { status: 201 },
        ),
      ),
    );

    renderWithClient(<AddEmployeeSheet open onOpenChange={onOpenChange} />);

    await fillProfileStep();
    await userEvent.click(screen.getByRole("button", { name: /create employee/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(screen.queryByText(/route for signature/i)).not.toBeInTheDocument();
  });
});
