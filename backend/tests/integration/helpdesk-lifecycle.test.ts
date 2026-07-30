/**
 * MOD-08 §6 — the ticket lifecycle: status machine with the requester's 14-day reopen window,
 * viewer-filtered visibility, threaded comments notifying the counterpart, and the MOD-04
 * asset-issue hook.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { and, eq } from "drizzle-orm";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import {
  hr_helpdesk_tickets,
  hr_helpdesk_comments,
  hr_assets,
  hr_asset_categories,
} from "../../src/db/schema";
import {
  createTicket,
  getTicketForViewer,
  listMyTickets,
  listTickets,
  transitionTicket,
  addComment,
  reopenTicket,
} from "../../src/services/hr/helpdesk.service";
import { makeEmployeeUser, ensureRole } from "../factories";

// Notifications go to real recipients; capture them without hitting the DB fan-out details.
const sentNotifications: { type: string; recipientUserIds?: number[] }[] = [];
vi.mock("../../src/modules/hr/notifications/notification.service", async (orig) => {
  const actual = await orig<Record<string, unknown>>();
  return {
    ...actual,
    sendNotification: vi.fn(async (p: { type: string; recipientUserIds?: number[] }) => {
      sentNotifications.push(p);
    }),
  };
});

describe("MOD-08 ticket lifecycle", () => {
  beforeEach(async () => {
    await resetDb();
    sentNotifications.length = 0;
    await ensureRole("employee");
    await ensureRole("hr");
    await ensureRole("admin");
  });

  it("creates an OPEN ticket owned by the submitter", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "VPN broken",
      description: "Cannot connect",
      category: "IT",
    });

    expect(ticket.status).toBe("OPEN");
    expect(ticket.category).toBe("IT");
    expect(ticket.submittedById).toBe(requester.employee.id);
    expect(ticket.source).toBe("manual");
  });

  it("walks OPEN → IN_PROGRESS → RESOLVED → CLOSED and stamps resolved_at/closed_at", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const staff = await makeEmployeeUser({ role: "admin", employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });

    const inProgress = await transitionTicket(staff.user.id, ticket.id, { status: "IN_PROGRESS" });
    expect(inProgress.status).toBe("IN_PROGRESS");

    const resolved = await transitionTicket(staff.user.id, ticket.id, { status: "RESOLVED" });
    expect(resolved.status).toBe("RESOLVED");

    const [row] = await db
      .select()
      .from(hr_helpdesk_tickets)
      .where(eq(hr_helpdesk_tickets.id, ticket.id));
    expect(row.resolved_at).not.toBeNull();

    const closed = await transitionTicket(staff.user.id, ticket.id, { status: "CLOSED" });
    expect(closed.status).toBe("CLOSED");
    const [afterClose] = await db
      .select()
      .from(hr_helpdesk_tickets)
      .where(eq(hr_helpdesk_tickets.id, ticket.id));
    expect(afterClose.closed_at).not.toBeNull();
  });

  it("notifies the requester when a ticket is resolved", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const staff = await makeEmployeeUser({ role: "admin", employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });

    sentNotifications.length = 0;
    await transitionTicket(staff.user.id, ticket.id, { status: "RESOLVED" });

    const statusNote = sentNotifications.find((n) => n.type === "TICKET_STATUS_CHANGED");
    expect(statusNote?.recipientUserIds).toContain(requester.user.id);
  });

  it("lets the requester reopen within 14 days of resolution", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const staff = await makeEmployeeUser({ role: "admin", employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });
    await transitionTicket(staff.user.id, ticket.id, { status: "RESOLVED" });

    const reopened = await reopenTicket(requester.user.id, ticket.id);
    expect(reopened.status).toBe("REOPENED");
  });

  it("blocks reopen after the 14-day window", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const staff = await makeEmployeeUser({ role: "admin", employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });
    await transitionTicket(staff.user.id, ticket.id, { status: "RESOLVED" });

    // Backdate the resolution 15 days.
    await db
      .update(hr_helpdesk_tickets)
      .set({ resolved_at: new Date(Date.now() - 15 * 86400_000) })
      .where(eq(hr_helpdesk_tickets.id, ticket.id));

    await expect(reopenTicket(requester.user.id, ticket.id)).rejects.toMatchObject({
      statusCode: 422,
      code: "REOPEN_WINDOW_CLOSED",
    });
  });

  it("only lets the requester reopen — not a random employee", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const stranger = await makeEmployeeUser({ employmentType: "staff" });
    const staff = await makeEmployeeUser({ role: "admin", employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });
    await transitionTicket(staff.user.id, ticket.id, { status: "RESOLVED" });

    await expect(reopenTicket(stranger.user.id, ticket.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("only reopens from RESOLVED", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });

    await expect(reopenTicket(requester.user.id, ticket.id)).rejects.toMatchObject({
      statusCode: 400,
    });
  });
});

describe("MOD-08 visibility", () => {
  beforeEach(async () => {
    await resetDb();
    sentNotifications.length = 0;
    await ensureRole("employee");
    await ensureRole("admin");
  });

  it("shows the requester their own ticket and staff any ticket, but a third party 403", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const stranger = await makeEmployeeUser({ employmentType: "staff" });
    const staff = await makeEmployeeUser({ role: "admin", employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });

    await expect(getTicketForViewer(requester.user.id, ticket.id)).resolves.toMatchObject({
      ticket: { id: ticket.id },
    });
    await expect(getTicketForViewer(staff.user.id, ticket.id)).resolves.toBeTruthy();
    await expect(getTicketForViewer(stranger.user.id, ticket.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("listMyTickets returns only my tickets; the triage list needs manage", async () => {
    const a = await makeEmployeeUser({ employmentType: "staff" });
    const b = await makeEmployeeUser({ employmentType: "staff" });
    await createTicket(a.user.id, { title: "A1", description: "x", category: "IT" });
    await createTicket(a.user.id, { title: "A2", description: "x", category: "HR" });
    await createTicket(b.user.id, { title: "B1", description: "x", category: "IT" });

    const mine = await listMyTickets(a.user.id);
    expect(mine).toHaveLength(2);

    const all = await listTickets({});
    expect(all).toHaveLength(3);

    const itOnly = await listTickets({ category: "IT" });
    expect(itOnly).toHaveLength(2);
  });
});

describe("MOD-08 comments", () => {
  beforeEach(async () => {
    await resetDb();
    sentNotifications.length = 0;
    await ensureRole("employee");
    await ensureRole("admin");
  });

  it("lets the requester and the assignee comment, notifying the counterpart", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const staff = await makeEmployeeUser({ role: "admin", employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });
    await transitionTicket(staff.user.id, ticket.id, {
      status: "IN_PROGRESS",
      assignee_user_id: staff.user.id,
    });

    sentNotifications.length = 0;
    await addComment(requester.user.id, ticket.id, "Any update?");
    // Requester commented → the assignee is notified.
    const toStaff = sentNotifications.find((n) => n.type === "TICKET_COMMENT");
    expect(toStaff?.recipientUserIds).toContain(staff.user.id);

    sentNotifications.length = 0;
    await addComment(staff.user.id, ticket.id, "Looking into it.");
    // Staff commented → the requester is notified.
    const toRequester = sentNotifications.find((n) => n.type === "TICKET_COMMENT");
    expect(toRequester?.recipientUserIds).toContain(requester.user.id);

    const view = await getTicketForViewer(requester.user.id, ticket.id);
    expect(view.comments).toHaveLength(2);
  });

  it("stops a third party from commenting", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });
    const stranger = await makeEmployeeUser({ employmentType: "staff" });
    const ticket = await createTicket(requester.user.id, {
      title: "X",
      description: "Y",
      category: "IT",
    });

    await expect(addComment(stranger.user.id, ticket.id, "hi")).rejects.toMatchObject({
      statusCode: 403,
    });
  });
});

describe("MOD-08 MOD-04 asset-issue hook", () => {
  beforeEach(async () => {
    await resetDb();
    sentNotifications.length = 0;
    await ensureRole("employee");
  });

  it("creates an asset_issue ticket linked to the asset", async () => {
    const requester = await makeEmployeeUser({ employmentType: "staff" });

    const unique = Date.now();
    const [category] = await db
      .insert(hr_asset_categories)
      .values({ name: `Laptops ${unique}`, slug: `laptops-${unique}` } as never)
      .returning();
    const [asset] = await db
      .insert(hr_assets)
      .values({
        device_name: "MacBook",
        serial_number: `SN-${unique}`,
        category_id: category.id,
        status: "ASSIGNED",
        assigned_to_employee_id: requester.employee.id,
      })
      .returning();

    const ticket = await createTicket(requester.user.id, {
      title: "Screen flickers",
      description: "Since yesterday",
      category: "IT",
      asset_id: asset.id,
    });

    expect(ticket.source).toBe("asset_issue");
    expect(ticket.assetId).toBe(asset.id);

    const view = await getTicketForViewer(requester.user.id, ticket.id);
    expect(view.ticket.asset_id).toBe(asset.id);
  });
});
