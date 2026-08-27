/**
 * MOD-02 §6 item 7 — the unresolved-managers worklist assigns a manager (MSW) and the row
 * clears itself on success.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";

const authState: { roles: string[] } = { roles: ["hr"] };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    roles: authState.roles,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

import UnresolvedManagersPage from "@/app/employees/org-chart/unresolved/page";

afterEach(() => {
  cleanup();
});

const EMPLOYEE_ID = "33333333-3333-3333-3333-333333333333";
const MANAGER_ID = "44444444-4444-4444-4444-444444444444";

function mockUnresolved(rows: unknown[]) {
  server.use(
    http.get(`${API}/hr/org-chart/unresolved`, () => HttpResponse.json({ unresolved: rows })),
    http.get(`${API}/hr/employees`, () =>
      HttpResponse.json({
        data: [
          {
            id: MANAGER_ID,
            first_name: "Grace",
            last_name: "Hopper",
            job_title: "Director",
            status: "active",
            manager: null,
            account: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        pages: 1,
      }),
    ),
  );
}

describe("Unresolved managers worklist", () => {
  it("assigns a manager and the row clears on success", async () => {
    authState.roles = ["hr"];
    const row = {
      id: "row-1",
      employee_id: EMPLOYEE_ID,
      raw_text: "grace hoper", // slightly misspelled -> why it was unresolved
      employee_name: "Ada Lovelace",
    };
    mockUnresolved([row]);

    let assigned = false;
    server.use(
      http.patch(`${API}/hr/employees/${EMPLOYEE_ID}/manager`, async ({ request }) => {
        const body = (await request.json()) as { manager_id: string | null };
        expect(body.manager_id).toBe(MANAGER_ID);
        assigned = true;
        return HttpResponse.json({ employee: { id: EMPLOYEE_ID } });
      }),
      http.get(`${API}/hr/org-chart/unresolved`, () =>
        HttpResponse.json({ unresolved: assigned ? [] : [row] }),
      ),
    );

    renderWithClient(<UnresolvedManagersPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText(/grace hoper/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.type(screen.getByPlaceholderText("Search employees…"), "Grace");
    const option = await screen.findByText("Grace Hopper", { exact: false });
    await userEvent.click(option);

    await waitFor(() => expect(assigned).toBe(true));
    await waitFor(() => expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument());
  });

  it("a non-HR viewer sees no access instead of the worklist", async () => {
    authState.roles = ["employee"];
    mockUnresolved([]);
    renderWithClient(<UnresolvedManagersPage />);
    expect(await screen.findByText(/don.t have access/i)).toBeInTheDocument();
  });
});
