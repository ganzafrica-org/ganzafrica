/**
 * PublicHolidays now sources real data from Nager.Date (via GET /hr/holidays?scope=relevant),
 * grouped by country with a live count and a square avatar strip (date + month) per holiday.
 */
import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { PublicHolidays } from "@/components/sections/calendar/PublicHolidays";

const API = "http://localhost:3002/api";

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

function mockHolidays(holidays: { date: string; name: string; country: string }[]) {
  server.use(http.get(`${API}/hr/holidays`, () => HttpResponse.json({ holidays })));
}

describe("PublicHolidays", () => {
  it("shows an empty state when there are no relevant holidays", async () => {
    mockHolidays([]);
    renderWithClient(<PublicHolidays />);

    expect(await screen.findByText(/no public holidays configured yet/i)).toBeInTheDocument();
  });

  it("groups holidays by country with a live count", async () => {
    mockHolidays([
      { date: "2026-01-01", name: "New Year's Day", country: "Rwanda" },
      { date: "2026-07-01", name: "Independence Day", country: "Rwanda" },
      { date: "2026-12-12", name: "Jamhuri Day", country: "Kenya" },
    ]);
    renderWithClient(<PublicHolidays />);

    expect(await screen.findByText("Rwanda public holidays")).toBeInTheDocument();
    expect(screen.getByText("2 holidays")).toBeInTheDocument();
    expect(screen.getByText("Kenya public holidays")).toBeInTheDocument();
    expect(screen.getByText("1 holidays")).toBeInTheDocument();
  });

  it("renders one square avatar per holiday showing its day and month", async () => {
    mockHolidays([{ date: "2026-01-01", name: "New Year's Day", country: "Rwanda" }]);
    renderWithClient(<PublicHolidays />);

    await screen.findByText("Rwanda public holidays");
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Jan")).toBeInTheDocument();
  });

  it("shows a +N overflow avatar beyond the visible cap", async () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, "0")}`,
      name: `Holiday ${i + 1}`,
      country: "Rwanda",
    }));
    mockHolidays(many);
    renderWithClient(<PublicHolidays />);

    await screen.findByText("Rwanda public holidays");
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});
