/**
 * "Update the HR landing page to display valid data from backend" (Things-to-work-on.md).
 * Covers the HR view of `app/page.tsx`: headerStats, Leave summary, Employee status circles,
 * Ongoing onboarding, Applicants summary, and the Schedule "away" calendar all render real
 * backend-fetched numbers, not the old hardcoded mock data. System Alerts is explicitly
 * untouched/out of scope — not asserted here beyond "still renders".
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import Dashboard from "@/app/page";

const API = "http://localhost:3002/api";

afterEach(() => cleanup());

// chart.js's real canvas/ResizeObserver lifecycle doesn't survive jsdom + RTL's cleanup() between
// tests (a well-known chart.js/jsdom incompatibility, unrelated to ApplicantsCard's own logic) —
// stub the chart, not the surrounding card, since these tests only assert the real numbers around
// it, not canvas pixels.
vi.mock("react-chartjs-2", () => ({ Doughnut: () => null }));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Hana HR" },
    roles: ["hr"],
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

function mockCommon() {
  server.use(
    http.get(`${API}/hr/me/assets`, () => HttpResponse.json({ success: true, data: [] })),
    http.get(`${API}/hr/me/leave`, () => HttpResponse.json({ balances: [], requests: [] })),
    http.get(`${API}/hr/me/process`, () =>
      HttpResponse.json({ instance: null, tasks: [], progress: null, can_manage: false }),
    ),
    http.get(`${API}/hr/employees/stats`, () =>
      HttpResponse.json({
        pending: 1,
        onboarding: 2,
        active: 10,
        on_leave: 1,
        offboarding: 0,
        exited: 0,
        total: 14,
      }),
    ),
    http.get(`${API}/hr/recruitment/opportunities`, () =>
      HttpResponse.json({
        opportunities: [
          {
            opportunity_id: 1,
            title: "Backend Engineer",
            status: "published",
            stages: { submitted: 5, interview: 2, hired: 1, rejected: 2 },
            total: 10,
          },
          {
            opportunity_id: 2,
            title: "Program Officer",
            status: "closed",
            stages: { submitted: 3, hired: 1 },
            total: 4,
          },
        ],
      }),
    ),
    http.get(`${API}/hr/processes`, () =>
      HttpResponse.json({
        processes: [
          {
            id: 42,
            template_id: 1,
            type: "onboarding",
            employee_id: "emp-1",
            status: "in_progress",
            started_at: "2026-01-01",
            due_date: null,
            completed_at: null,
            employee: {
              id: "emp-1",
              first_name: "Grace",
              last_name: "Uwase",
              job_title: "Analyst",
              employment_type: "staff",
            },
            progress: { done: 2, total: 5, percent: 40 },
            overdue_count: 0,
          },
        ],
      }),
    ),
  );
}

function leaveRow(over: Record<string, unknown> = {}) {
  const today = new Date();
  return {
    id: "leave-1",
    employeeId: "emp-2",
    employeeName: "Kesi Employee",
    type: "ANNUAL",
    startDate: today.toISOString(),
    endDate: today.toISOString(),
    status: "Approved",
    reason: "",
    ...over,
  };
}

describe("HR landing page — real backend data", () => {
  it("headerStats show real employee counts, plus an inert Alerts tile", async () => {
    mockCommon();
    server.use(http.get(`${API}/hr/leave/requests`, () => HttpResponse.json({ leaves: [] })));

    renderWithClient(<Dashboard />);

    expect(await screen.findByText("14")).toBeInTheDocument(); // Total Employees
    expect(screen.getByText("10")).toBeInTheDocument(); // Active
    expect(screen.getByText("2")).toBeInTheDocument(); // Onboarding
    expect(screen.getByText("Alerts")).toBeInTheDocument();
  });

  it("Employee Status card shows real Pending/Onboarding/Active counts, same bubble UI", async () => {
    mockCommon();
    server.use(http.get(`${API}/hr/leave/requests`, () => HttpResponse.json({ leaves: [] })));

    renderWithClient(<Dashboard />);

    // "Active" and "Onboarding" also label headerStats tiles showing the same real numbers —
    // that duplication is correct (both are the same true count), so assert presence, not
    // uniqueness, and confirm the legend's own labels are all there.
    expect(await screen.findAllByText("Active")).not.toHaveLength(0);
    expect(await screen.findAllByText("Onboarding")).not.toHaveLength(0);
    expect(await screen.findByText("Pending")).toBeInTheDocument(); // legend-only, no headerStats dup
    // statusCounts.active is 10 — shows once in headerStats and once in the bubble.
    expect((await screen.findAllByText("10")).length).toBeGreaterThanOrEqual(2);
  });

  it("Leave summary shows real pending-request and on-leave-today counts", async () => {
    mockCommon();
    server.use(
      http.get(`${API}/hr/leave/requests`, () =>
        HttpResponse.json({
          leaves: [
            leaveRow({ id: "l1", status: "Pending" }),
            leaveRow({ id: "l2", status: "Approved" }), // away today
            leaveRow({
              id: "l3",
              status: "Approved",
              startDate: "2020-01-01T00:00:00Z",
              endDate: "2020-01-02T00:00:00Z",
            }), // not today
          ],
        }),
      ),
    );

    renderWithClient(<Dashboard />);

    const pendingLabel = await screen.findByText("Pending requests");
    expect(pendingLabel).toBeInTheDocument();
    expect(await screen.findByText("On leave today")).toBeInTheDocument();
    // One pending (l1), one away today (l2) — l3 is a past leave, doesn't count as "today". Both
    // tiles show "1", so assert the count of matches rather than a single unique node.
    expect((await screen.findAllByText("1")).length).toBeGreaterThanOrEqual(2);
  });

  it("Applicants summary shows a real hire rate computed from opportunity stage counts", async () => {
    mockCommon();
    server.use(http.get(`${API}/hr/leave/requests`, () => HttpResponse.json({ leaves: [] })));

    renderWithClient(<Dashboard />);

    // 2 hired / 14 total applications across both opportunities = 14.3%
    expect(await screen.findByText("14.3%")).toBeInTheDocument();
    expect(screen.getByText(/applications across/i)).toBeInTheDocument();
  });

  it("Ongoing onboarding lists real in-progress employees with real progress", async () => {
    mockCommon();
    server.use(http.get(`${API}/hr/leave/requests`, () => HttpResponse.json({ leaves: [] })));

    renderWithClient(<Dashboard />);

    expect(await screen.findByText("Ongoing onboarding")).toBeInTheDocument();
    expect(await screen.findByText("Grace Uwase")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();
  });

  it("Schedule shows real avatars of employees away today, not mock meetings", async () => {
    mockCommon();
    server.use(
      http.get(`${API}/hr/leave/requests`, () =>
        HttpResponse.json({ leaves: [leaveRow({ id: "l1", status: "Approved" })] }),
      ),
    );

    renderWithClient(<Dashboard />);

    // "Away today" labels both ScheduleCard's section heading and LeaveSummaryCard's badge.
    expect((await screen.findAllByText(/away today/i)).length).toBeGreaterThanOrEqual(2);
    expect(await screen.findByText("Kesi Employee")).toBeInTheDocument();
    // The old mock meeting data must be gone.
    expect(screen.queryByText("Meeting with Clients")).not.toBeInTheDocument();
    expect(screen.queryByText("Book Discussion")).not.toBeInTheDocument();
  });

  it("shows 'Everyone's in today' when nobody is away, instead of stale mock meetings", async () => {
    mockCommon();
    server.use(http.get(`${API}/hr/leave/requests`, () => HttpResponse.json({ leaves: [] })));

    renderWithClient(<Dashboard />);

    expect(await screen.findByText(/everyone's in today/i)).toBeInTheDocument();
  });
});
