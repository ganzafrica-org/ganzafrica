/**
 * The Recruitment list page had no StatsHeader at all, unlike every other list page in the app.
 * Added one whose numbers are computed from the same opportunities data the page already fetches
 * (GET /hr/recruitment/opportunities) — not decorative/hardcoded figures.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import RecruitmentPage from "@/app/recruitment/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const API = "http://localhost:3002/api";

afterEach(() => cleanup());

function mockOpportunities() {
  server.use(
    http.get(`${API}/hr/recruitment/opportunities`, () =>
      HttpResponse.json({
        opportunities: [
          {
            opportunity_id: 1,
            title: "Backend Engineer",
            status: "published",
            total: 10,
            stages: { submitted: 4, interview: 2, offer: 1, hired: 1, rejected: 2 },
          },
          {
            opportunity_id: 2,
            title: "Old Draft",
            status: "draft",
            total: 3,
            stages: { submitted: 3 },
          },
        ],
      }),
    ),
  );
}

/** The stat's value sits in the same labeled card as its label — scope the lookup to that card
 *  rather than a bare getByText(value), since a small integer easily collides with other numbers
 *  on the page (badge counts, pagination, etc). */
function statValue(label: string): string | null {
  const card = screen.getByText(label).closest("div.bg-transparent");
  return card?.querySelector(".text-4xl")?.textContent ?? null;
}

describe("Recruitment page — StatsHeader", () => {
  it("shows recruitment-specific stats computed from the fetched opportunities", async () => {
    mockOpportunities();
    renderWithClient(<RecruitmentPage />);

    expect(await screen.findByText("Open Positions")).toBeInTheDocument();
    // Open Positions: 1 of 2 opportunities is "published".
    expect(statValue("Open Positions")).toBe("1");
    // Total Applicants: 10 + 3.
    expect(statValue("Total Applicants")).toBe("13");
    // In Pipeline: active-stage counts across both (4+2+1) + 3 = 10.
    expect(statValue("In Pipeline")).toBe("10");
    // Hired: 1.
    expect(statValue("Hired")).toBe("1");
  });

  it("shows zeroed stats rather than an error when there are no postings yet", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities`, () =>
        HttpResponse.json({ opportunities: [] }),
      ),
    );
    renderWithClient(<RecruitmentPage />);

    expect(await screen.findByText("Open Positions")).toBeInTheDocument();
    expect(statValue("Open Positions")).toBe("0");
    expect(statValue("Total Applicants")).toBe("0");
    expect(statValue("In Pipeline")).toBe("0");
    expect(statValue("Hired")).toBe("0");
  });
});
