/**
 * ProcessStatus is the shared "what's done, what's missing" breakdown used by both the nested
 * Employees→Onboarding detail page and the employee detail Overview tab's onboarding card — one
 * implementation, two variants (full / summary).
 */
import { beforeEach, afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { ProcessStatus } from "@/components/processes/process-status";
import type { ProcessTask } from "@/services/processes.service";

const API = "http://localhost:3002/api";

beforeEach(() => {
  // Intercept the unhandled request and return a safe mock response
  server.use(
    http.get("http://localhost:3002/api/hr/signing/my", () => {
      return HttpResponse.json([]);
    }),
  );
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

describe("ProcessStatus — summary variant", () => {
  it("says nothing is missing when every task is resolved", () => {
    renderWithClient(
      <ProcessStatus
        tasks={[task({ id: 1, title: "Welcome", status: "done" })]}
        progress={{ done: 1, total: 1, percent: 100 }}
        canManage={false}
        variant="summary"
      />,
    );

    expect(screen.getByText(/nothing missing/i)).toBeInTheDocument();
  });

  it("lists what's still missing when some tasks are pending", () => {
    renderWithClient(
      <ProcessStatus
        tasks={[
          task({ id: 1, title: "Sign contract", status: "pending" }),
          task({ id: 2, title: "Upload ID", status: "pending" }),
          task({ id: 3, title: "Welcome", status: "done" }),
        ]}
        progress={{ done: 1, total: 3, percent: 33 }}
        canManage={false}
        variant="summary"
      />,
    );

    expect(screen.getByText("Sign contract")).toBeInTheDocument();
    expect(screen.getByText("Upload ID")).toBeInTheDocument();
    expect(screen.queryByText("Welcome")).not.toBeInTheDocument(); // resolved, not "missing"
    expect(screen.queryByText(/nothing missing/i)).not.toBeInTheDocument();
  });
});

describe("ProcessStatus — full variant", () => {
  it("splits tasks into Outstanding and Completed sections", async () => {
    server.use(
      http.get(`${API}/hr/employees/emp-1/contracts`, () => HttpResponse.json([])),
      http.get(`${API}/hr/signing/requests`, () => HttpResponse.json({ requests: [] })),
    );

    renderWithClient(
      <ProcessStatus
        tasks={[
          task({ id: 1, title: "Outstanding step", status: "pending" }),
          task({ id: 2, title: "Finished step", status: "done" }),
        ]}
        progress={{ done: 1, total: 2, percent: 50 }}
        canManage
        variant="full"
        employeeId="emp-1"
      />,
    );

    expect(await screen.findByText("Outstanding")).toBeInTheDocument();
    expect(screen.getByText("Outstanding step")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Finished step")).toBeInTheDocument();
  });
});
