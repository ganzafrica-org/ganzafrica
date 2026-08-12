/**
 * Phase 2 (notifications) — verifies two bugs found and fixed while wiring the notification UI:
 * 1. `/hr/notifications/*` was never mounted in routes/hr/index.ts (404 on every call).
 * 2. The controller resolved the caller via `resolvePlatformUserIdFromHrUser(req.user.id)`,
 *    which expects an `employees.id` — but `req.user.id` is the platform `users.id`, so every
 *    call would 400 even once mounted. Fixed to use `req.user.id` directly.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb } from "../setup";
import { db } from "../../src/db/client";
import { hr_notifications } from "../../src/db/schema";
import { loginAs } from "../helpers/auth";
import { ensureRole } from "../factories";

describe("Notifications HTTP surface", () => {
  beforeEach(async () => {
    await resetDb();
    await ensureRole("employee");
  });

  it("lists the caller's own notifications, reports an unread count, and marks one read", async () => {
    const user = await loginAs("employee");

    await db.insert(hr_notifications).values([
      {
        recipient_id: user.user.id,
        type: "MANAGER_CHANGED",
        title: "Reporting line updated",
        message: "Your manager is now someone else.",
      },
      {
        recipient_id: user.user.id,
        type: "MANAGER_CHANGED",
        title: "Another update",
        message: "Second notification.",
      },
    ]);

    const list = await user.agent.get("/api/hr/notifications");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(2);

    const unread = await user.agent.get("/api/hr/notifications/unread-count");
    expect(unread.status).toBe(200);
    expect(unread.body.count).toBe(2);

    const firstId = list.body.data[0].id;
    const markRead = await user.agent.patch(`/api/hr/notifications/${firstId}/read`);
    expect(markRead.status).toBe(200);

    const unreadAfter = await user.agent.get("/api/hr/notifications/unread-count");
    expect(unreadAfter.body.count).toBe(1);
  });

  it("does not leak another user's notifications", async () => {
    const owner = await loginAs("employee");
    const other = await loginAs("employee");

    await db.insert(hr_notifications).values({
      recipient_id: owner.user.id,
      type: "MANAGER_CHANGED",
      title: "Private to owner",
      message: "Should not be visible to other.",
    });

    const asOther = await other.agent.get("/api/hr/notifications");
    expect(asOther.status).toBe(200);
    expect(asOther.body.data).toHaveLength(0);
  });
});
