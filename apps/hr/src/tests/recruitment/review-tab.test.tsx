import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "./test-utils";
import { ReviewTab } from "@/components/recruitment/review-tab";

const API = "http://localhost:3002/api";
afterEach(cleanup);

describe("ReviewTab", () => {
  it("lists reviewers and notes, assigns a reviewer, and adds a note", async () => {
    let reviewers: Record<string, unknown>[] = [
      { id: 1, reviewer_user_id: 9, role: "Data expert", name: "Ada", email: "a@e.com" },
    ];
    let notes: Record<string, unknown>[] = [
      {
        id: 1,
        author_user_id: 2,
        author_name: "HR",
        stage: "interview",
        rating: 4,
        note: "Strong",
        created_at: "2026-06-01T00:00:00Z",
      },
    ];

    server.use(
      http.get(`${API}/hr/recruitment/applications/5/reviewers`, () =>
        HttpResponse.json({ reviewers }),
      ),
      http.get(`${API}/hr/recruitment/applications/5/notes`, () => HttpResponse.json({ notes })),
      http.post(`${API}/hr/recruitment/applications/5/reviewers`, () => {
        reviewers = [
          ...reviewers,
          { id: 2, reviewer_user_id: 10, role: null, name: "Grace", email: "g@e.com" },
        ];
        return HttpResponse.json({ reviewer: { id: 2 } }, { status: 201 });
      }),
      http.post(`${API}/hr/recruitment/applications/5/notes`, () => {
        notes = [
          ...notes,
          {
            id: 2,
            author_user_id: 2,
            author_name: "HR",
            stage: "interview",
            rating: null,
            note: "Follow up",
            created_at: "2026-06-02T00:00:00Z",
          },
        ];
        return HttpResponse.json({ note: { id: 2 } }, { status: 201 });
      }),
    );

    renderWithClient(<ReviewTab applicationId={5} currentStage="interview" />);

    expect(await screen.findByText("Ada")).toBeInTheDocument();
    expect(screen.getByText("Strong")).toBeInTheDocument();

    // assign a reviewer
    fireEvent.change(screen.getByLabelText("Reviewer user id"), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Assign" }));
    await waitFor(() => expect(screen.getByText("Grace")).toBeInTheDocument());

    // add a note
    fireEvent.change(screen.getByLabelText("New note"), { target: { value: "Follow up" } });
    fireEvent.click(screen.getByRole("button", { name: "Add note" }));
    await waitFor(() => expect(screen.getByText("Follow up")).toBeInTheDocument());
  });

  it("removes a reviewer", async () => {
    let reviewers = [{ id: 1, reviewer_user_id: 9, role: null, name: "Ada", email: "a@e.com" }];
    server.use(
      http.get(`${API}/hr/recruitment/applications/7/reviewers`, () =>
        HttpResponse.json({ reviewers }),
      ),
      http.get(`${API}/hr/recruitment/applications/7/notes`, () =>
        HttpResponse.json({ notes: [] }),
      ),
      http.delete(`${API}/hr/recruitment/applications/7/reviewers/9`, () => {
        reviewers = [];
        return HttpResponse.json({ removed: true });
      }),
    );
    renderWithClient(<ReviewTab applicationId={7} currentStage="interview" />);
    fireEvent.click(await screen.findByLabelText("Remove Ada"));
    await waitFor(() => expect(screen.getByText("No reviewers assigned.")).toBeInTheDocument());
  });

  it("empty states render", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/applications/6/reviewers`, () =>
        HttpResponse.json({ reviewers: [] }),
      ),
      http.get(`${API}/hr/recruitment/applications/6/notes`, () =>
        HttpResponse.json({ notes: [] }),
      ),
    );
    renderWithClient(<ReviewTab applicationId={6} currentStage="screening" />);
    expect(await screen.findByText("No reviewers assigned.")).toBeInTheDocument();
    expect(screen.getByText("No notes yet.")).toBeInTheDocument();
  });
});
