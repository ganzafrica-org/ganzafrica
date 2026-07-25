import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { TicketDetail } from "@/components/sections/helpdesk/ticket-detail";

const API = "http://localhost:3002/api";

const baseTicket = (over: Record<string, unknown> = {}) => ({
  id: "t-1",
  title: "VPN keeps dropping",
  description: "Every hour or so.",
  submittedById: "emp-1",
  assignedToId: null,
  category: "IT",
  status: "OPEN",
  priority: "HIGH",
  source: "manual",
  assetId: null,
  asset_id: null,
  resolvedAt: null,
  closedAt: null,
  createdAt: "2026-07-20T09:00:00Z",
  updatedAt: "2026-07-20T09:00:00Z",
  ...over,
});

const detail = (
  over: {
    ticket?: Record<string, unknown>;
    comments?: unknown[];
    can_manage?: boolean;
  } = {},
) => ({
  ticket: baseTicket(over.ticket),
  comments: over.comments ?? [],
  can_manage: over.can_manage ?? false,
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

describe("Ticket detail", () => {
  it("renders the ticket and its comment thread", async () => {
    server.use(
      http.get(`${API}/hr/helpdesk/t-1`, () =>
        HttpResponse.json(
          detail({
            comments: [
              {
                id: "c-1",
                ticket_id: "t-1",
                author_employee_id: "emp-9",
                body: "Looking into it now.",
                created_at: "2026-07-20T10:00:00Z",
              },
            ],
          }),
        ),
      ),
    );

    renderWithClient(<TicketDetail ticketId="t-1" />);

    expect(await screen.findByText("VPN keeps dropping")).toBeInTheDocument();
    expect(screen.getByText("Looking into it now.")).toBeInTheDocument();
  });

  it("posts a reply", async () => {
    let posted = false;
    server.use(
      http.get(`${API}/hr/helpdesk/t-1`, () =>
        HttpResponse.json(
          posted
            ? detail({
                comments: [
                  {
                    id: "c-2",
                    ticket_id: "t-1",
                    author_employee_id: "emp-1",
                    body: "Still broken",
                    created_at: "2026-07-20T11:00:00Z",
                  },
                ],
              })
            : detail(),
        ),
      ),
      http.post(`${API}/hr/helpdesk/t-1/comments`, async () => {
        posted = true;
        return HttpResponse.json(
          { comment: { id: "c-2", ticket_id: "t-1", body: "Still broken", created_at: "x" } },
          { status: 201 },
        );
      }),
    );

    renderWithClient(<TicketDetail ticketId="t-1" />);

    fireEvent.change(await screen.findByPlaceholderText("Add a reply…"), {
      target: { value: "Still broken" },
    });
    fireEvent.click(screen.getByRole("button", { name: /reply/i }));

    expect(await screen.findByText("Still broken")).toBeInTheDocument();
  });

  it("offers reopen inside the window for a resolved ticket", async () => {
    const recent = new Date(Date.now() - 2 * 86400_000).toISOString();
    server.use(
      http.get(`${API}/hr/helpdesk/t-1`, () =>
        HttpResponse.json(detail({ ticket: { status: "RESOLVED", resolvedAt: recent } })),
      ),
    );

    renderWithClient(<TicketDetail ticketId="t-1" />);

    expect(await screen.findByRole("button", { name: /reopen/i })).toBeInTheDocument();
  });

  it("hides reopen once the window has lapsed", async () => {
    const old = new Date(Date.now() - 30 * 86400_000).toISOString();
    server.use(
      http.get(`${API}/hr/helpdesk/t-1`, () =>
        HttpResponse.json(detail({ ticket: { status: "RESOLVED", resolvedAt: old } })),
      ),
    );

    renderWithClient(<TicketDetail ticketId="t-1" />);

    await screen.findByText("VPN keeps dropping");
    expect(screen.queryByRole("button", { name: /reopen/i })).not.toBeInTheDocument();
  });

  it("shows staff status controls only when can_manage", async () => {
    server.use(
      http.get(`${API}/hr/helpdesk/t-1`, () => HttpResponse.json(detail({ can_manage: true }))),
    );

    renderWithClient(<TicketDetail ticketId="t-1" />);

    await screen.findByText("VPN keeps dropping");
    await waitFor(() => expect(screen.getByText("Status")).toBeInTheDocument());
    expect(screen.getByText("Priority")).toBeInTheDocument();
  });
});
