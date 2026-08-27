/**
 * MOD-05 §1E — "who can see this document" section of the Create Document form
 * (Things-to-work-on.md: small/inconsistent text in that section, plus "this function ... should
 * also be integrated and well working").
 *
 * These tests pin the frontend half of that ticket:
 *  1. Typography — the "Roles"/"Departments"/"Specific employees" sub-headers and the individual
 *     checkbox row labels render at the same size/weight as the rest of the form's field labels
 *     (`text-sm font-medium`), not the smaller `text-xs` they used before.
 *  2. Wiring — toggling a role/department checkbox, and adding/removing a specific employee,
 *     produces exactly the `{roles?, employee_ids?, departments?}` shape `canReadDocument`
 *     (backend/src/services/hr/document.service.ts) expects, via the real `onChange` callback the
 *     real create-document flow (document-form-sheet.tsx) is wired to. The end-to-end proof that
 *     this shape actually restricts visibility lives in
 *     backend/tests/integration/create-document-acl.test.ts and e2e/tests/create-document-acl.spec.ts;
 *     this file only pins the piece owned by this component — turning clicks into the right object.
 */
import { useState } from "react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { cleanup, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { AccessBuilder } from "@/components/sections/documents/access-builder";
import type { DocumentACL, Employee } from "@/types/api";

// jsdom has no ResizeObserver; the employee search results list uses Radix's ScrollArea, which
// requires one. Not part of shared test setup — only this suite renders a ScrollArea.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;

const API = "http://localhost:3002/api";

afterEach(() => cleanup());

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "emp-1",
    user_id: 1,
    first_name: "Ada",
    last_name: "Uwase",
    work_email: "ada@test.local",
    personal_email: null,
    employee_number: "E-001",
    job_title: "Analyst",
    department: "Programs",
    employment_type: "staff",
    status: "active",
    picture: null,
    phone: null,
    citizenship: null,
    home_country: null,
    ...overrides,
  } as Employee;
}

function mockEmployees(employees: Employee[]) {
  server.use(
    http.get(`${API}/hr/employees`, () =>
      HttpResponse.json({ data: employees, total: employees.length, page: 1, limit: 20, pages: 1 }),
    ),
  );
}

function Harness({ onChange }: { onChange: (v: DocumentACL) => void }) {
  const [value, setValue] = useState<DocumentACL>({});
  return (
    <AccessBuilder
      value={value}
      onChange={(v: DocumentACL) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}

describe("AccessBuilder — who can see this document", () => {
  it("shows the empty-ACL hint, then the any-clause-match hint once something is selected", async () => {
    mockEmployees([makeEmployee()]);
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithClient(<Harness onChange={onChange} />);

    expect(screen.getByText(/no clauses selected/i)).toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: /finance/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/visible to anyone matching any of the selected clauses/i),
      ).toBeInTheDocument(),
    );
  });

  it("toggling a role checkbox produces {roles: [role]}, unchecking clears it back to undefined", async () => {
    mockEmployees([]);
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithClient(<Harness onChange={onChange} />);

    const directorBox = screen.getByRole("checkbox", { name: /director/i });
    await user.click(directorBox);
    expect(onChange).toHaveBeenLastCalledWith({ roles: ["director"] });

    await user.click(directorBox);
    expect(onChange).toHaveBeenLastCalledWith({ roles: undefined });
  });

  it("toggling a department checkbox produces {departments: [dept]} — the ACL shape read by canReadDocument", async () => {
    mockEmployees([
      makeEmployee({ department: "Finance" }),
      makeEmployee({ id: "emp-2", department: "Programs" }),
    ]);
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithClient(<Harness onChange={onChange} />);

    // "finance" is also one of the ASSIGNABLE_ROLES, so scope the query to the Departments group
    // specifically — otherwise it ambiguously matches both the role and department checkboxes.
    await screen.findByText("Finance"); // wait for /hr/employees to resolve and departments to render
    const departmentsGroup = screen.getByText("Departments").parentElement as HTMLElement;
    const financeBox = within(departmentsGroup).getByRole("checkbox", { name: /^finance$/i });
    await user.click(financeBox);
    expect(onChange).toHaveBeenLastCalledWith({ departments: ["Finance"] });
  });

  it("selecting a specific employee from search results adds their id to employee_ids", async () => {
    mockEmployees([makeEmployee({ id: "emp-42", first_name: "Grace", last_name: "Mugisha" })]);
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithClient(<Harness onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/search employees by name/i), "Grace");
    const row = await screen.findByText(/Grace Mugisha/i);
    await user.click(row.closest("label") as HTMLElement);

    expect(onChange).toHaveBeenLastCalledWith({ employee_ids: ["emp-42"] });
    // Selected employee now renders as a removable chip.
    expect(await screen.findAllByText(/Grace Mugisha/i)).not.toHaveLength(0);
  });

  it("removing a selected employee chip clears employee_ids back to undefined", async () => {
    mockEmployees([makeEmployee({ id: "emp-42", first_name: "Grace", last_name: "Mugisha" })]);
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithClient(<Harness onChange={onChange} />);

    await user.type(screen.getByPlaceholderText(/search employees by name/i), "Grace");
    const row = await screen.findByText(/Grace Mugisha/i);
    await user.click(row.closest("label") as HTMLElement);
    expect(onChange).toHaveBeenLastCalledWith({ employee_ids: ["emp-42"] });

    const removeButtons = screen.getAllByRole("button");
    await user.click(removeButtons[removeButtons.length - 1]);
    expect(onChange).toHaveBeenLastCalledWith({ employee_ids: undefined });
  });

  it("sub-section labels and checkbox rows use the same text-sm/font-medium weight as the rest of the form", async () => {
    mockEmployees([]);
    renderWithClient(<Harness onChange={vi.fn()} />);

    const rolesLabel = screen.getByText("Roles");
    expect(rolesLabel.className).toContain("text-sm");
    expect(rolesLabel.className).toContain("font-medium");
    expect(rolesLabel.className).not.toContain("text-xs");

    const departmentsLabel = screen.getByText("Departments");
    expect(departmentsLabel.className).toContain("text-sm");
    expect(departmentsLabel.className).not.toContain("text-xs");

    const specificEmployeesLabel = screen.getByText("Specific employees");
    expect(specificEmployeesLabel.className).toContain("text-sm");
    expect(specificEmployeesLabel.className).not.toContain("text-xs");

    // The label's own text is lowercase "director" — "Director" is a CSS `capitalize` effect only.
    const directorRow = screen.getByText("director").closest("label");
    expect(directorRow?.className).toContain("text-sm");
    expect(directorRow?.className).toContain("font-medium");
  });
});
