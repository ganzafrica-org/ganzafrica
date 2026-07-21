import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "./test-utils";
import { RankingCriteriaEditor } from "@/components/recruitment/ranking-criteria-editor";

const API = "http://localhost:3002/api";
afterEach(cleanup);

describe("RankingCriteriaEditor", () => {
  it("lists, adds, removes keywords and re-scores", async () => {
    let criteria = [{ id: 1, keyword: "Python", weight: "2", category: null, is_active: true }];
    let scored = false;
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/1/ranking-criteria`, () =>
        HttpResponse.json({ criteria }),
      ),
      http.post(`${API}/hr/recruitment/opportunities/1/ranking-criteria`, () => {
        criteria = [
          ...criteria,
          { id: 2, keyword: "SQL", weight: "1", category: null, is_active: true },
        ];
        return HttpResponse.json({ criterion: { id: 2 } }, { status: 201 });
      }),
      http.delete(`${API}/hr/recruitment/opportunities/1/ranking-criteria/1`, () => {
        criteria = criteria.filter((c) => c.id !== 1);
        return HttpResponse.json({ deleted: true });
      }),
      http.post(`${API}/hr/recruitment/opportunities/1/rescore`, () => {
        scored = true;
        return HttpResponse.json({ scored: 3 });
      }),
    );

    renderWithClient(<RankingCriteriaEditor opportunityId={1} />);
    await userEvent.click(screen.getByTestId("ranking-editor-trigger"));

    expect(await screen.findByText("Python")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Keyword"), { target: { value: "SQL" } });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));
    await waitFor(() => expect(screen.getByText("SQL")).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText("Remove Python"));
    await waitFor(() => expect(screen.queryByText("Python")).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Re-score applications" }));
    await waitFor(() => expect(scored).toBe(true));
  });

  it("empty state", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/opportunities/2/ranking-criteria`, () =>
        HttpResponse.json({ criteria: [] }),
      ),
    );
    renderWithClient(<RankingCriteriaEditor opportunityId={2} />);
    await userEvent.click(screen.getByTestId("ranking-editor-trigger"));
    expect(await screen.findByText("No keywords yet.")).toBeInTheDocument();
  });
});
