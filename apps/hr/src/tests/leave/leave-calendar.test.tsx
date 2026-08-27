/**
 * Punch-list #6 — each leave entry on the Leave Calendar tab renders the owning employee's
 * avatar (falling back to initials), and a green background once approved; pending/rejected keep
 * the existing status-badge color convention. Tests the extracted LeaveEventChip directly rather
 * than mounting FullCalendar, which doesn't render its event content in jsdom.
 */
import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { LeaveEventChip } from "@/components/sections/calendar/LeaveCalendar";
import type { LeaveRequest } from "@/types/leave";

afterEach(cleanup);

function makeLeave(overrides: Partial<LeaveRequest> = {}): LeaveRequest {
  return {
    id: "leave-1",
    employeeId: "emp-1",
    leaveType: "Annual Leave",
    startDate: new Date("2026-03-02"),
    endDate: new Date("2026-03-03"),
    notes: "",
    status: "Approved",
    requestedAt: new Date("2026-03-01"),
    ...overrides,
  };
}

describe("LeaveEventChip", () => {
  it("renders initials when the employee has no avatar, and a green background for Approved", () => {
    render(
      <LeaveEventChip
        leave={makeLeave({ status: "Approved" })}
        employee={{ name: "Grace Hopper", avatar: "" }}
      />,
    );

    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("GH")).toBeInTheDocument();
    const chip = screen.getByText("Grace Hopper").closest("div[class*='rounded-lg']");
    expect(chip?.className).toContain("bg-green-100");
  });

  it("falls back to initials while the avatar image hasn't loaded (Radix Avatar never fires a load event in jsdom — real image rendering is covered by the e2e spec)", () => {
    render(
      <LeaveEventChip
        leave={makeLeave({ status: "Approved" })}
        employee={{ name: "Grace Hopper", avatar: "https://cdn.example.com/grace.jpg" }}
      />,
    );

    // No crash, no broken layout — the fallback is exactly what a real browser also shows for
    // the brief window before the image resource loads, or if it 404s.
    expect(screen.getByText("GH")).toBeInTheDocument();
  });

  it("keeps Pending off the green background, using the existing amber status token", () => {
    render(
      <LeaveEventChip
        leave={makeLeave({ status: "Pending" })}
        employee={{ name: "Grace Hopper", avatar: "" }}
      />,
    );

    const chip = screen.getByText("Grace Hopper").closest("div[class*='rounded-lg']");
    expect(chip?.className).not.toContain("bg-green-100");
    expect(chip?.className).toContain("bg-amber-100");
  });

  it("keeps Rejected off the green background, using the existing red status token", () => {
    render(
      <LeaveEventChip
        leave={makeLeave({ status: "Rejected" })}
        employee={{ name: "Grace Hopper", avatar: "" }}
      />,
    );

    const chip = screen.getByText("Grace Hopper").closest("div[class*='rounded-lg']");
    expect(chip?.className).not.toContain("bg-green-100");
    expect(chip?.className).toContain("bg-red-100");
  });
});
