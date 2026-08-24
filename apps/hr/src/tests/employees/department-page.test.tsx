/**
 * Things-to-work-on.md — employees/department didn't have a headerStats row; the per-department
 * card list below it is still local/hardcoded (a pre-existing, separate issue, untouched here).
 * This covers the new headerStats tiles reading real counts from GET
 * /hr/employees/departments/stats rather than being hardcoded or borrowed from another page.
 */
import { afterEach, describe, it, expect } from "vitest";
import { screen, within, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import DepartmentPage from "@/app/employees/department/page";

const API = "http://localhost:3002/api";

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

function mockDepartmentStats() {
  server.use(
    http.get(`${API}/hr/employees/departments/stats`, () =>
      HttpResponse.json({
        total_departments: 2,
        total_employees: 7,
        departments: [
          { department: "Engineering", total: 4, active: 3, on_leave: 1 },
          { department: "Programs", total: 3, active: 3, on_leave: 0 },
        ],
      }),
    ),
  );
}

/** The StatsHeader tile wrapper carries `border-l` — see components/sections/header.tsx. */
function tileValue(container: HTMLElement, label: string) {
  const headerRegion = container.querySelector(".bg-brand-dark") as HTMLElement;
  const labelEl = within(headerRegion).getByText(label);
  return labelEl.closest(".border-l")!.querySelector(".text-4xl")!.textContent;
}

describe("Department page headerStats", () => {
  it("shows real per-department counts from the backend, not hardcoded numbers", async () => {
    mockDepartmentStats();
    const { container } = renderWithClient(<DepartmentPage />);

    await screen.findByText("Total Departments");
    expect(tileValue(container, "Total Departments")).toBe("2");
    expect(tileValue(container, "Total Employees")).toBe("7");
    expect(tileValue(container, "Active")).toBe("6"); // 3 + 3, summed across departments
    expect(tileValue(container, "On Leave")).toBe("1");
  });

  it("shows a loading skeleton rather than a stale/zeroed tile while the stats request is in flight", () => {
    mockDepartmentStats();
    const { container } = renderWithClient(<DepartmentPage />);

    // isLoading=true renders StatsHeader's skeleton placeholders — the real tile labels (and any
    // hardcoded 0 in their place) shouldn't be in the DOM yet.
    const headerRegion = container.querySelector(".bg-brand-dark") as HTMLElement;
    expect(within(headerRegion).queryByText("Total Departments")).not.toBeInTheDocument();
    expect(headerRegion.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
