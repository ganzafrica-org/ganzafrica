import { afterEach, describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { leavesService } from "@/services/leaves.service";

const API = "http://localhost:3002/api";

afterEach(() => server.resetHandlers());

describe("leavesService", () => {
  it("getLeaves unwraps { leaves } from the role-scoped /hr/leave/requests endpoint", async () => {
    server.use(
      http.get(`${API}/hr/leave/requests`, () =>
        HttpResponse.json({
          leaves: [
            {
              id: "1",
              employeeId: "e1",
              employeeName: "Eli Employee",
              type: "ANNUAL",
              startDate: "2026-03-02",
              endDate: "2026-03-03",
              status: "Pending",
              reason: "Trip",
            },
          ],
        }),
      ),
    );

    const leaves = await leavesService.getLeaves();
    expect(leaves).toHaveLength(1);
    expect(leaves[0].employeeName).toBe("Eli Employee");
  });

  it("getLeaves forwards filter params on the querystring", async () => {
    server.use(
      http.get(`${API}/hr/leave/requests`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("status")).toBe("pending");
        expect(url.searchParams.get("employeeId")).toBe("e1");
        return HttpResponse.json({ leaves: [] });
      }),
    );

    const leaves = await leavesService.getLeaves({ employeeId: "e1", status: "pending" });
    expect(leaves).toEqual([]);
  });

  it("createLeave posts to /hr/leaves and returns the created row", async () => {
    server.use(
      http.post(`${API}/hr/leaves`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toMatchObject({ type: "ANNUAL" });
        return HttpResponse.json(
          {
            id: "2",
            employeeId: "e1",
            employeeName: "Eli Employee",
            type: "ANNUAL",
            startDate: "2026-03-02",
            endDate: "2026-03-03",
            status: "Pending",
          },
          { status: 201 },
        );
      }),
    );

    const created = await leavesService.createLeave({
      employeeId: "e1",
      employeeName: "Eli Employee",
      type: "ANNUAL",
      startDate: "2026-03-02",
      endDate: "2026-03-03",
      status: "Pending",
    });
    expect(created.id).toBe("2");
  });

  it("updateLeaveStatus patches /hr/leaves/:id/status", async () => {
    server.use(
      http.patch(`${API}/hr/leaves/2/status`, async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ status: "Approved" });
        return HttpResponse.json({
          id: "2",
          employeeId: "e1",
          employeeName: "Eli Employee",
          type: "ANNUAL",
          startDate: "2026-03-02",
          endDate: "2026-03-03",
          status: "Approved",
        });
      }),
    );

    const updated = await leavesService.updateLeaveStatus("2", "Approved");
    expect(updated.status).toBe("Approved");
  });
});
