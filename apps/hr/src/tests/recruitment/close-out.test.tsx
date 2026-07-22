import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "./test-utils";
import { CloseOutButton } from "@/components/recruitment/close-out-button";

const API = "http://localhost:3002/api";
afterEach(cleanup);

describe("CloseOutButton", () => {
  it("is disabled until the target is met", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/1/close-out`, () =>
        HttpResponse.json({ target_hires: 2, accepted_offers: 1, target_met: false, remaining: 3 }),
      ),
    );
    renderWithClient(<CloseOutButton opportunityId={1} />);
    const btn = await screen.findByTestId("close-out-button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent("1/2 hired");
  });

  it("enabled when the target is met — confirming closes out remaining candidates", async () => {
    let closed = false;
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/2/close-out`, () =>
        HttpResponse.json({ target_hires: 1, accepted_offers: 1, target_met: true, remaining: 3 }),
      ),
      http.post(`${API}/hr/recruitment/opportunities/2/close-out`, () => {
        closed = true;
        return HttpResponse.json({ closed: 3 });
      }),
    );
    renderWithClient(<CloseOutButton opportunityId={2} />);
    const btn = await screen.findByTestId("close-out-button");
    expect(btn).not.toBeDisabled();

    fireEvent.click(btn);
    expect(await screen.findByText("Close this position?")).toBeInTheDocument();
    // cancel first (covers the cancel path)
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => expect(screen.queryByText("Close this position?")).not.toBeInTheDocument());
    // reopen and confirm
    fireEvent.click(screen.getByTestId("close-out-button"));
    fireEvent.click(await screen.findByRole("button", { name: "Close position & notify" }));
    await waitFor(() => expect(closed).toBe(true));
  });

  it("is disabled when target met but no candidates remain", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/3/close-out`, () =>
        HttpResponse.json({ target_hires: 1, accepted_offers: 1, target_met: true, remaining: 0 }),
      ),
    );
    renderWithClient(<CloseOutButton opportunityId={3} />);
    expect(await screen.findByTestId("close-out-button")).toBeDisabled();
  });
});
