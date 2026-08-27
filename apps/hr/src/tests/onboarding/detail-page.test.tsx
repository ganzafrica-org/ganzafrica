/**
 * LCM-01 §6.7 — the HR-side detail view: staff-only rows are visible, skip is available, and a
 * server-side kind-hook rejection (e.g. contract not yet ACTIVE) surfaces on the task card.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import OnboardingDetailPage from "@/app/employees/onboarding/[id]/page";

const API = "http://localhost:3002/api";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "10" }),
}));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

const task = (over: Record<string, unknown> = {}) => ({
  id: 1,
  instance_id: 10,
  title: "Add to payroll",
  description: null,
  sort_order: 0,
  assignee_user_id: 7,
  visibility: "staff_only",
  is_blocking: true,
  kind: "checklist",
  status: "pending",
  due_date: null,
  completed_at: null,
  completed_by: null,
  notes: null,
  link_ref: null,
  ...over,
});

const instance = {
  id: 10,
  template_id: 1,
  type: "onboarding",
  employee_id: "emp-1",
  status: "in_progress",
  started_at: "2026-03-02T00:00:00Z",
  due_date: null,
  completed_at: null,
};

function mockDetail(tasks: unknown[], canManage = true) {
  server.use(
    http.get(`${API}/hr/processes/10`, () =>
      HttpResponse.json({
        instance,
        tasks,
        progress: { done: 0, total: 1, percent: 0 },
        can_manage: canManage,
      }),
    ),
    // Fetched by TaskRow's contract_signing linking control (ProcessStatus passes employeeId
    // through) — empty by default so it renders the "no draft contract yet" hint.
    http.get(`${API}/hr/employees/${instance.employee_id}/contracts`, () => HttpResponse.json([])),
    http.get(`${API}/hr/signing/requests`, () => HttpResponse.json({ requests: [] })),
  );
}

describe("Onboarding detail page", () => {
  it("shows staff-only and blocking chips to a manager", async () => {
    mockDetail([task()]);

    renderWithClient(<OnboardingDetailPage />);

    expect(await screen.findByText("Add to payroll")).toBeInTheDocument();
    expect(screen.getByText("Staff only")).toBeInTheDocument();
    expect(screen.getByText("Blocking")).toBeInTheDocument();
  });

  it("offers Skip to a manager and requires a note", async () => {
    let skipCalls = 0;
    mockDetail([task()]);
    server.use(
      http.post(`${API}/hr/process-tasks/1/skip`, () => {
        skipCalls++;
        return HttpResponse.json({ task: task({ status: "skipped" }) });
      }),
    );

    renderWithClient(<OnboardingDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: /skip/i }));

    const confirm = await screen.findByRole("button", { name: /skip task/i });
    expect(confirm).toBeDisabled(); // empty note
    expect(skipCalls).toBe(0);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Handled offline" } });
    fireEvent.click(screen.getByRole("button", { name: /skip task/i }));

    await waitFor(() => expect(skipCalls).toBe(1));
  });

  it("surfaces a kind-hook rejection on the task card", async () => {
    mockDetail([task({ title: "Sign contract", kind: "contract_signing" })]);
    server.use(
      http.post(`${API}/hr/process-tasks/1/complete`, () =>
        HttpResponse.json(
          { message: "Contract is still DRAFT — it must be signed and ACTIVE first" },
          { status: 422 },
        ),
      ),
    );

    renderWithClient(<OnboardingDetailPage />);
    fireEvent.click(await screen.findByRole("button", { name: /done/i }));

    expect(await screen.findByText(/must be signed and ACTIVE/)).toBeInTheDocument();
  });

  it("separates outstanding from completed work", async () => {
    mockDetail([
      task({ id: 1, title: "Outstanding step" }),
      task({ id: 2, title: "Finished step", status: "done", visibility: "all" }),
    ]);

    renderWithClient(<OnboardingDetailPage />);

    expect(await screen.findByText("Outstanding")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("hides the cancel action from someone who cannot manage", async () => {
    mockDetail([task({ visibility: "all" })], false);

    renderWithClient(<OnboardingDetailPage />);

    await screen.findByText("Add to payroll");
    expect(screen.queryByRole("button", { name: /cancel process/i })).not.toBeInTheDocument();
  });
});
