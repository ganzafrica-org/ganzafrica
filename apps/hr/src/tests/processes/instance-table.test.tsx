/**
 * Things-to-work-on.md — onboarding table status column. Covers onboardingDisplayStatus directly
 * (all branches: not started / partial progress / completed / cancelled) and confirms the
 * offboarding type (LCM-02, unshipped) is deliberately left on the raw enum badge rather than
 * getting the onboarding-specific label split.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { InstanceTable, onboardingDisplayStatus } from "@/components/processes/instance-table";
import type { ProcessListRow } from "@/services/processes.service";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => cleanup());

describe("onboardingDisplayStatus", () => {
  it("maps an in_progress instance with zero progress to Not Started", () => {
    expect(onboardingDisplayStatus("in_progress", 0)).toBe("Not Started");
  });

  it("maps an in_progress instance with some progress to Onboarding", () => {
    expect(onboardingDisplayStatus("in_progress", 3)).toBe("Onboarding");
  });

  it("maps a completed instance to Completed regardless of progress", () => {
    expect(onboardingDisplayStatus("completed", 0)).toBe("Completed");
  });

  it("maps a cancelled instance to Cancelled regardless of progress", () => {
    expect(onboardingDisplayStatus("cancelled", 2)).toBe("Cancelled");
  });
});

function row(over: Partial<ProcessListRow> = {}): ProcessListRow {
  return {
    id: 1,
    template_id: 1,
    type: "onboarding",
    employee_id: "emp-1",
    status: "in_progress",
    started_at: "2026-01-01",
    due_date: null,
    completed_at: null,
    employee: {
      id: "emp-1",
      first_name: "Test",
      last_name: "Employee",
      job_title: "Analyst",
      employment_type: "staff",
    },
    progress: { done: 0, total: 5, percent: 0 },
    overdue_count: 0,
    ...over,
  };
}

describe("InstanceTable — Status column", () => {
  it("badges an onboarding row by the derived label, not the raw enum", () => {
    renderWithClient(
      <InstanceTable
        rows={[row({ status: "in_progress", progress: { done: 0, total: 5, percent: 0 } })]}
        type="onboarding"
      />,
    );
    expect(screen.getByText("Not Started")).toBeInTheDocument();
    expect(screen.queryByText("in progress")).not.toBeInTheDocument();
  });

  it("leaves offboarding (unshipped) on the raw enum badge", () => {
    renderWithClient(
      <InstanceTable
        rows={[row({ type: "offboarding", status: "in_progress" })]}
        type="offboarding"
      />,
    );
    expect(screen.getByText("in progress")).toBeInTheDocument();
    expect(screen.queryByText("Not Started")).not.toBeInTheDocument();
  });
});
