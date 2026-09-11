import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { LeaveRequestsCard } from "@/components/sections/home-cards/LeaveRequestsCard";

const API = "http://localhost:3002/api";

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

function mockPending(leaves: unknown[]) {
  server.use(http.get(`${API}/hr/leave/pending-approvals`, () => HttpResponse.json({ leaves })));
}

describe("LeaveRequestsCard", () => {
  it("scope=org: always renders, showing an empty state when nothing is pending", async () => {
    mockPending([]);
    renderWithClient(<LeaveRequestsCard scope="org" />);

    expect(await screen.findByText("Leave Requests")).toBeInTheDocument();
    expect(await screen.findByText("Nothing pending right now.")).toBeInTheDocument();
  });

  it("scope=approvals: renders nothing for a non-manager (nothing awaiting their decision)", async () => {
    mockPending([]);
    const { container } = renderWithClient(<LeaveRequestsCard scope="approvals" />);

    await waitFor(() => expect(container).toBeEmptyDOMElement());
  });

  it("scope=approvals: lists the reports' requests, with type and date range, once loaded", async () => {
    mockPending([
      {
        id: "p1",
        employee_id: "emp-3",
        employeeName: "Report One",
        type: "ANNUAL",
        start_date: "2026-06-01",
        end_date: "2026-06-05",
        reason: "",
        status: "PENDING",
        days: "5",
        approver_note: null,
        reviewed_at: null,
        created_at: "2026-05-20T00:00:00Z",
      },
    ]);
    renderWithClient(<LeaveRequestsCard scope="approvals" />);

    expect(await screen.findByText("Report One")).toBeInTheDocument();
    expect(screen.getByText("Annual")).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, el) => el?.textContent === "Requests from your reports awaiting your decision.",
      ),
    ).toBeInTheDocument();
  });
});
