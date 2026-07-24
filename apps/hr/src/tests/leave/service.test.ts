import { afterEach, describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { leaveBalancesService, remainingDays } from "@/services/leave-balances.service";

const API = "http://localhost:3002/api";

afterEach(() => server.resetHandlers());

const balance = (over: Partial<Parameters<typeof remainingDays>[0]> = {}) => ({
  id: 1,
  employee_id: "e1",
  year: 2026,
  type: "ANNUAL" as const,
  entitled_days: "20",
  carried_over_days: "0",
  used_days: "0",
  ...over,
});

describe("remainingDays", () => {
  it("is entitled + carried over − used", () => {
    expect(remainingDays(balance({ carried_over_days: "5", used_days: "7" }))).toBe(18);
  });

  it("can reach zero", () => {
    expect(remainingDays(balance({ used_days: "20" }))).toBe(0);
  });
});

describe("leaveBalancesService", () => {
  it("getMine returns balances and requests", async () => {
    server.use(
      http.get(`${API}/hr/me/leave`, () =>
        HttpResponse.json({ balances: [balance()], requests: [] }),
      ),
    );

    const res = await leaveBalancesService.getMine();
    expect(res.balances).toHaveLength(1);
    expect(res.balances[0].type).toBe("ANNUAL");
  });

  it("validate posts the draft and returns the day preview", async () => {
    server.use(
      http.post(`${API}/hr/me/leave/validate`, async ({ request }) => {
        const body = (await request.json()) as { type: string; startDate: string };
        expect(body.type).toBe("ANNUAL");
        expect(body.startDate).toBe("2026-03-02");
        return HttpResponse.json({ days: 3, remaining: 20, sufficient: true });
      }),
    );

    const res = await leaveBalancesService.validate({
      type: "ANNUAL",
      startDate: "2026-03-02",
      endDate: "2026-03-04",
    });
    expect(res).toEqual({ days: 3, remaining: 20, sufficient: true });
  });

  it("reject sends the note", async () => {
    server.use(
      http.post(`${API}/hr/leave/abc/reject`, async ({ request }) => {
        const body = (await request.json()) as { note: string };
        expect(body.note).toBe("Coverage gap");
        return HttpResponse.json({ leave: { id: "abc", status: "REJECTED" } });
      }),
    );

    const res = await leaveBalancesService.reject("abc", "Coverage gap");
    expect(res.status).toBe("REJECTED");
  });

  it("calendar passes the range as query params", async () => {
    server.use(
      http.get(`${API}/hr/leave/calendar`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("from")).toBe("2026-03-01");
        expect(url.searchParams.get("to")).toBe("2026-03-31");
        return HttpResponse.json({ events: [] });
      }),
    );

    await leaveBalancesService.calendar("2026-03-01", "2026-03-31");
  });

  it("adjustBalance sends the required note", async () => {
    server.use(
      http.patch(`${API}/hr/leave-balances/9`, async ({ request }) => {
        const body = (await request.json()) as { note: string; used_days: number };
        expect(body.note).toBe("Carried from Deel");
        expect(body.used_days).toBe(5);
        return HttpResponse.json({ balance: balance({ used_days: "5" }) });
      }),
    );

    const res = await leaveBalancesService.adjustBalance(9, {
      used_days: 5,
      note: "Carried from Deel",
    });
    expect(Number(res.used_days)).toBe(5);
  });
});
