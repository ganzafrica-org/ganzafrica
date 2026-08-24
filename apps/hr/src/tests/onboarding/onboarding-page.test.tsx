/**
 * Onboarding table status column + headerStats (Things-to-work-on.md item — "status column stuck
 * on In Progress"). `process_instances.status` only has in_progress|completed|cancelled — there's
 * no "not started" value in the backend enum, so the table used to badge every in_progress row
 * identically regardless of whether any task had actually been touched. This covers the derived
 * Not Started/Onboarding/Completed mapping (instance-table.tsx's onboardingDisplayStatus) both in
 * the table itself and in the page's headerStats tiles, which read the full unfiltered roster
 * independently of whatever status the table's own dropdown is currently scoped to.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, within, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import OnboardingPage from "@/app/employees/onboarding/page";

const API = "http://localhost:3002/api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

function row(over: Record<string, unknown>) {
  return {
    id: 1,
    template_id: 1,
    type: "onboarding",
    employee_id: "emp-x",
    started_at: "2026-01-01",
    due_date: null,
    completed_at: null,
    employee: {
      id: "emp-x",
      first_name: "Grace",
      last_name: "Uwase",
      job_title: "Analyst",
      employment_type: "staff",
    },
    overdue_count: 0,
    ...over,
  };
}

// Employee names deliberately avoid the words "Not Started"/"Onboarding"/"Completed"/"Cancelled"
// so they can't collide with the status badge text in DOM queries below.
const NOT_STARTED = row({
  id: 1,
  status: "in_progress",
  progress: { done: 0, total: 5, percent: 0 },
  employee: {
    id: "emp-1",
    first_name: "Aline",
    last_name: "Freshhire",
    job_title: "Analyst",
    employment_type: "staff",
  },
});
const IN_PROGRESS = row({
  id: 2,
  status: "in_progress",
  progress: { done: 2, total: 5, percent: 40 },
  overdue_count: 1,
  employee: {
    id: "emp-2",
    first_name: "Bosco",
    last_name: "Midway",
    job_title: "Analyst",
    employment_type: "staff",
  },
});
const COMPLETED = row({
  id: 3,
  status: "completed",
  progress: { done: 5, total: 5, percent: 100 },
  employee: {
    id: "emp-3",
    first_name: "Chantal",
    last_name: "Finished",
    job_title: "Analyst",
    employment_type: "staff",
  },
});
const CANCELLED = row({
  id: 4,
  status: "cancelled",
  progress: { done: 1, total: 5, percent: 20 },
  employee: {
    id: "emp-4",
    first_name: "Didier",
    last_name: "Withdrawn",
    job_title: "Analyst",
    employment_type: "staff",
  },
});

function mockProcesses(rows: Record<string, unknown>[]) {
  server.use(
    http.get(`${API}/hr/processes`, ({ request }) => {
      const status = new URL(request.url).searchParams.get("status");
      const filtered = status ? rows.filter((r) => r.status === status) : rows;
      return HttpResponse.json({ processes: filtered });
    }),
  );
}

/** The StatsHeader tile wrapper carries `border-l` — see components/sections/header.tsx. */
function tileValue(container: HTMLElement, label: string) {
  const headerRegion = container.querySelector(".bg-brand-dark") as HTMLElement;
  const labelEl = within(headerRegion).getByText(label);
  return labelEl.closest(".border-l")!.querySelector(".text-4xl")!.textContent;
}

describe("Onboarding page — status mapping and headerStats", () => {
  it("splits the default (in_progress) table view into Not Started vs Onboarding, not one undifferentiated 'in progress'", async () => {
    mockProcesses([NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]);
    renderWithClient(<OnboardingPage />);

    const table = await screen.findByRole("table");
    expect(within(table).getByText("Not Started")).toBeInTheDocument();
    expect(within(table).getByText("Onboarding")).toBeInTheDocument();
    // Default filter is in_progress — completed/cancelled rows aren't in this view.
    expect(screen.queryByText("Chantal Finished")).not.toBeInTheDocument();
    expect(screen.queryByText("Didier Withdrawn")).not.toBeInTheDocument();
  });

  it("counts a fully-resolved instance as Completed in headerStats even though the table's default filter hides it", async () => {
    mockProcesses([COMPLETED]);
    const { container } = renderWithClient(<OnboardingPage />);

    // Table defaults to the in_progress filter, so the completed row never renders there at all
    // (InstanceTable's empty state, not a table) — this is exactly the "stuck on In Progress"
    // symptom if headerStats read the same filtered query instead of the full roster.
    await screen.findByText(/no onboarding processes yet/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(tileValue(container, "Completed")).toBe("1");
  });

  it("headerStats counts Not Started/Onboarding/Completed/overdue across the full roster, independent of the table's own status filter", async () => {
    mockProcesses([NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED]);
    const { container } = renderWithClient(<OnboardingPage />);

    await screen.findByRole("table");
    expect(tileValue(container, "Not Started")).toBe("1");
    expect(tileValue(container, "Onboarding")).toBe("1");
    expect(tileValue(container, "Completed")).toBe("1");
    // Only IN_PROGRESS carries an overdue task (overdue_count: 1); the rest are 0.
    expect(tileValue(container, "Overdue Tasks")).toBe("1");
  });
});
