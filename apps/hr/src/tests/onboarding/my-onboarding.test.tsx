/**
 * LCM-01 §6.7 — the onboardee's view. The server already strips staff_only rows; these assert the
 * page renders what it is given and never invents a staff-only affordance.
 */
import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import MyOnboardingPage from "@/app/onboarding/me/page";

const API = "http://localhost:3002/api";

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

const task = (over: Record<string, unknown> = {}) => ({
  id: 1,
  instance_id: 10,
  title: "Sign your contract",
  description: null,
  sort_order: 0,
  assignee_user_id: 5,
  visibility: "all",
  is_blocking: true,
  kind: "contract_signing",
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

type Json = Parameters<typeof HttpResponse.json>[0];

function mockProcess(body: Json, myTasks: Json[] = []) {
  server.use(
    http.get(`${API}/hr/me/process`, () => HttpResponse.json(body)),
    http.get(`${API}/hr/me/tasks`, () => HttpResponse.json({ tasks: myTasks })),
  );
}

describe("My onboarding page", () => {
  it("shows the progress ring and splits my actions from everyone else's", async () => {
    const mine = task({ id: 1, title: "Sign your contract" });
    const theirs = task({ id: 2, title: "Issue laptop", assignee_user_id: 99 });

    mockProcess(
      {
        instance,
        tasks: [mine, theirs],
        progress: { done: 1, total: 4, percent: 25 },
        can_manage: false,
      },
      [mine],
    );

    renderWithClient(<MyOnboardingPage />);

    expect(await screen.findByText("Welcome to GanzAfrica")).toBeInTheDocument();
    // Two rings now render "25%" (the welcome card's and the StatsHeader's) — assert at least one.
    expect(screen.getAllByText("25%").length).toBeGreaterThan(0);
    expect(screen.getByText("Your action items")).toBeInTheDocument();
    expect(screen.getByText("Being handled for you")).toBeInTheDocument();
    expect(screen.getByText("Sign your contract")).toBeInTheDocument();
    expect(screen.getByText("Issue laptop")).toBeInTheDocument();
  });

  it("renders no staff-only chip for an onboardee (server filters those rows out)", async () => {
    const mine = task();
    mockProcess(
      { instance, tasks: [mine], progress: { done: 0, total: 1, percent: 0 }, can_manage: false },
      [mine],
    );

    renderWithClient(<MyOnboardingPage />);

    await screen.findByText("Sign your contract");
    expect(screen.queryByText("Staff only")).not.toBeInTheDocument();
  });

  it("offers no Skip control to an onboardee", async () => {
    const mine = task();
    mockProcess(
      { instance, tasks: [mine], progress: { done: 0, total: 1, percent: 0 }, can_manage: false },
      [mine],
    );

    renderWithClient(<MyOnboardingPage />);

    await screen.findByText("Sign your contract");
    expect(screen.getByRole("button", { name: /done/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /skip/i })).not.toBeInTheDocument();
  });

  it("celebrates once the process is complete", async () => {
    mockProcess({
      instance: { ...instance, status: "completed" },
      tasks: [task({ status: "done" })],
      progress: { done: 1, total: 1, percent: 100 },
      can_manage: false,
    });

    renderWithClient(<MyOnboardingPage />);

    expect(await screen.findByText("You're all set")).toBeInTheDocument();
    expect(screen.getByText(/fully active/)).toBeInTheDocument();
  });

  it("handles having no onboarding at all", async () => {
    mockProcess({ process: null, instance: null, tasks: [], progress: null, can_manage: false });

    renderWithClient(<MyOnboardingPage />);

    expect(await screen.findByText("You have no onboarding in progress")).toBeInTheDocument();
  });

  it("shows a stats header describing my own onboarding progress", async () => {
    const mine = task({ id: 1, title: "Sign your contract" });
    const overdueOfMine = task({
      id: 2,
      title: "Overdue of mine",
      due_date: "2020-01-01",
    });

    mockProcess(
      {
        instance,
        tasks: [mine, overdueOfMine],
        progress: { done: 1, total: 4, percent: 25 },
        can_manage: false,
      },
      [mine, overdueOfMine],
    );

    renderWithClient(<MyOnboardingPage />);

    expect(await screen.findByText("Completed Steps")).toBeInTheDocument();
    expect(screen.getByText("Your Action Items")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    const progressCard = screen.getByText("Overall Progress").closest("div.bg-transparent");
    expect(progressCard?.querySelector('svg[role="img"]')).toHaveAttribute(
      "aria-label",
      "25% complete",
    );

    const actionItemsCard = screen.getByText("Your Action Items").closest("div.bg-transparent");
    // Both seeded tasks are mine and still pending.
    expect(actionItemsCard?.querySelector(".text-4xl")?.textContent).toBe("2");
  });
});
