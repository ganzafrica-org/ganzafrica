import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "./test-utils";
import { FunnelWidget } from "@/components/recruitment/funnel-widget";

const API = "http://localhost:3002/api";

afterEach(cleanup);

function stubFunnel(body: Record<string, unknown>) {
  server.use(
    http.get(`${API}/hr/recruitment/opportunities/1/funnel`, () => HttpResponse.json(body)),
  );
}

describe("FunnelWidget", () => {
  it("full variant shows counts, conversions, and eligibility blocks", async () => {
    stubFunnel({
      views: 10,
      form_starts: 6,
      submissions: 3,
      eligibility_blocks: [{ rule_id: 1, field_key: "age", reject_message: "Too old", hits: 4 }],
      conversion: { view_to_start: 0.6, start_to_submit: 0.5 },
    });

    renderWithClient(<FunnelWidget opportunityId={1} variant="full" />);

    expect(await screen.findByTestId("funnel-full")).toBeInTheDocument();
    expect(screen.getByText("Views")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument(); // view→start
    expect(screen.getByText("50%")).toBeInTheDocument(); // start→submit
    expect(screen.getByText("Too old")).toBeInTheDocument();
  });

  it("compact variant shows the one-line summary", async () => {
    stubFunnel({
      views: 5,
      form_starts: 2,
      submissions: 1,
      eligibility_blocks: [],
      conversion: { view_to_start: 0.4, start_to_submit: 0.5 },
    });
    renderWithClient(<FunnelWidget opportunityId={1} variant="compact" />);
    const el = await screen.findByTestId("funnel-compact");
    expect(el).toHaveTextContent("5 views");
    expect(el).toHaveTextContent("1 applied");
  });

  it("shows an empty state when there's no traffic", async () => {
    stubFunnel({
      views: 0,
      form_starts: 0,
      submissions: 0,
      eligibility_blocks: [],
      conversion: { view_to_start: 0, start_to_submit: 0 },
    });
    renderWithClient(<FunnelWidget opportunityId={1} variant="full" />);
    expect(await screen.findByText("No traffic yet.")).toBeInTheDocument();
  });
});
