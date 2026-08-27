/**
 * Punch-list #8 — HR home page's leave history card: request count + total days per
 * week/month/year window, plus empty/loading/error states.
 */
import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse, delay } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { LeaveHistoryCard } from "@/components/sections/home-cards/LeaveHistoryCard";

const API = "http://localhost:3002/api";

afterEach(cleanup);

function mockSummary(byWindow: Record<string, { requestCount: number; totalDays: number }>) {
  server.use(
    http.get(`${API}/hr/leave/summary`, ({ request }) => {
      const window = new URL(request.url).searchParams.get("window") ?? "month";
      const totals = byWindow[window] ?? { requestCount: 0, totalDays: 0 };
      return HttpResponse.json({ window, from: "2026-01-01", to: "2026-01-31", ...totals });
    }),
  );
}

describe("LeaveHistoryCard", () => {
  it("shows request count and total days for the default (month) window", async () => {
    mockSummary({ month: { requestCount: 4, totalDays: 9 } });
    renderWithClient(<LeaveHistoryCard />);

    await waitFor(() => expect(screen.getByText("4")).toBeInTheDocument());
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("switching to Week refetches and shows that window's totals", async () => {
    mockSummary({
      month: { requestCount: 4, totalDays: 9 },
      week: { requestCount: 1, totalDays: 2 },
    });
    renderWithClient(<LeaveHistoryCard />);
    await waitFor(() => expect(screen.getByText("4")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Week" }));

    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows a loading placeholder before the totals arrive", async () => {
    server.use(
      http.get(`${API}/hr/leave/summary`, async () => {
        await delay(50);
        return HttpResponse.json({
          window: "month",
          from: "2026-01-01",
          to: "2026-01-31",
          requestCount: 3,
          totalDays: 7,
        });
      }),
    );
    renderWithClient(<LeaveHistoryCard />);

    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });

  it("shows an empty-state message when there is no approved leave in the window", async () => {
    mockSummary({ month: { requestCount: 0, totalDays: 0 } });
    renderWithClient(<LeaveHistoryCard />);

    await screen.findByText("No approved leave in this period.");
  });

  it("shows an error state with a retry action when the request fails", async () => {
    server.use(http.get(`${API}/hr/leave/summary`, () => HttpResponse.error()));
    renderWithClient(<LeaveHistoryCard />);

    await screen.findByText("Couldn't load leave history.");
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });
});
