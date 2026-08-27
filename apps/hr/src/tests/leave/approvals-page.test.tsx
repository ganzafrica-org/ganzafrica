import { afterEach, describe, it, expect } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { LeaveApprovalsSheet } from "@/components/sections/leave/leave-approvals-sheet";

const API = "http://localhost:3002/api";

afterEach(() => server.resetHandlers());

const pending = {
  id: "leave-1",
  employee_id: "emp-1",
  type: "ANNUAL",
  start_date: "2026-03-02T00:00:00Z",
  end_date: "2026-03-04T00:00:00Z",
  reason: "Family trip",
  status: "PENDING",
  days: "3",
  approver_note: null,
  reviewed_at: null,
  created_at: "2026-02-01T00:00:00Z",
};

function renderSheet() {
  renderWithClient(<LeaveApprovalsSheet open onOpenChange={() => {}} />);
}

describe("Leave approvals sheet", () => {
  it("renders the pending queue", async () => {
    server.use(
      http.get(`${API}/hr/leave/pending-approvals`, () => HttpResponse.json({ leaves: [pending] })),
    );

    renderSheet();

    expect(await screen.findByText("3 working days")).toBeInTheDocument();
    expect(screen.getByText("Family trip")).toBeInTheDocument();
  });

  it("shows an empty state when nothing is pending", async () => {
    server.use(
      http.get(`${API}/hr/leave/pending-approvals`, () => HttpResponse.json({ leaves: [] })),
    );

    renderSheet();

    expect(await screen.findByText("Nothing waiting on you")).toBeInTheDocument();
  });

  it("approves without requiring a note", async () => {
    let approved = false;
    server.use(
      http.get(`${API}/hr/leave/pending-approvals`, () =>
        HttpResponse.json({ leaves: approved ? [] : [pending] }),
      ),
      http.post(`${API}/hr/leave/leave-1/approve`, () => {
        approved = true;
        return HttpResponse.json({ leave: { ...pending, status: "APPROVED" } });
      }),
    );

    renderSheet();
    fireEvent.click(await screen.findByRole("button", { name: /approve/i }));

    await waitFor(() => expect(approved).toBe(true));
  });

  it("requires a note before rejecting", async () => {
    let rejectCalls = 0;
    server.use(
      http.get(`${API}/hr/leave/pending-approvals`, () => HttpResponse.json({ leaves: [pending] })),
      http.post(`${API}/hr/leave/leave-1/reject`, () => {
        rejectCalls++;
        return HttpResponse.json({ leave: { ...pending, status: "REJECTED" } });
      }),
    );

    renderSheet();
    fireEvent.click(await screen.findByRole("button", { name: /reject/i }));

    // Confirm with an empty note → blocked client-side.
    fireEvent.click(await screen.findByRole("button", { name: /reject request/i }));
    expect(await screen.findByText("A note is required when rejecting.")).toBeInTheDocument();
    expect(rejectCalls).toBe(0);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Coverage gap" } });
    fireEvent.click(screen.getByRole("button", { name: /reject request/i }));

    await waitFor(() => expect(rejectCalls).toBe(1));
  });
});
