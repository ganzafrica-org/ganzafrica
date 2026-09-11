import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { useState } from "react";
import {
  MultiEmployeePicker,
  type PickedEmployee,
} from "@/components/sections/employee/multi-employee-picker";
import type { Employee } from "@/types/api";

const API = "http://localhost:3002/api";
afterEach(cleanup);

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: "emp-1",
    user_id: 101,
    first_name: "Ada",
    last_name: "Lovelace",
    work_email: "ada@x.com",
    personal_email: null,
    employee_number: null,
    job_title: "Engineer",
    department: "Programs",
    employment_type: "staff",
    status: "ACTIVE",
    picture: null,
    phone: null,
    citizenship: null,
    home_country: null,
    home_city: null,
    hired_at: null,
    manager: null,
    account: null,
    contract_currency: null,
    is_active: true,
    ...overrides,
  } as Employee;
}

function mockDirectory(employees: Employee[]) {
  server.use(
    http.get(`${API}/hr/employees`, () =>
      HttpResponse.json({ data: employees, total: employees.length, page: 1, limit: 20, pages: 1 }),
    ),
  );
}

function Harness({ excludeEmployeeId }: { excludeEmployeeId?: string }) {
  const [selected, setSelected] = useState<PickedEmployee[]>([]);
  return (
    <>
      <MultiEmployeePicker
        selected={selected}
        onChange={setSelected}
        excludeEmployeeId={excludeEmployeeId}
      />
      <p data-testid="selected-count">{selected.length}</p>
    </>
  );
}

describe("MultiEmployeePicker", () => {
  it("selects and deselects employees via checkboxes, tracking selection by user id", async () => {
    mockDirectory([
      makeEmployee({ id: "emp-1", user_id: 101, first_name: "Ada", last_name: "Lovelace" }),
      makeEmployee({ id: "emp-2", user_id: 102, first_name: "Grace", last_name: "Hopper" }),
    ]);
    renderWithClient(<Harness />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Ada Lovelace"));
    await waitFor(() => expect(screen.getByTestId("selected-count")).toHaveTextContent("1"));

    fireEvent.click(screen.getByText("Grace Hopper"));
    await waitFor(() => expect(screen.getByTestId("selected-count")).toHaveTextContent("2"));

    // deselect via the badge's remove button
    fireEvent.click(screen.getByRole("button", { name: /remove ada lovelace/i }));
    await waitFor(() => expect(screen.getByTestId("selected-count")).toHaveTextContent("1"));
  });

  it("excludes the given employee id from results", async () => {
    mockDirectory([makeEmployee({ id: "emp-1", first_name: "Ada", last_name: "Lovelace" })]);
    renderWithClient(<Harness excludeEmployeeId="emp-1" />);

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    expect(screen.getByText(/no matches/i)).toBeInTheDocument();
  });

  it("filters out employees with no linked user account (can't be a signer)", async () => {
    mockDirectory([
      makeEmployee({
        id: "emp-1",
        user_id: null as unknown as number,
        first_name: "No",
        last_name: "Account",
      }),
    ]);
    renderWithClient(<Harness />);

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());
    expect(screen.queryByText("No Account")).not.toBeInTheDocument();
  });
});
