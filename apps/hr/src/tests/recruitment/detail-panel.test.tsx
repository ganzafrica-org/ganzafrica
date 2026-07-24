import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "./test-utils";
import { ApplicationDetailPanel } from "@/components/recruitment/application-detail-panel";

const API = "http://localhost:3002/api";

// The Evaluation tab reads the current user via useMe → /hr/employees/me.
vi.mock("@/hooks/useEmployees", () => ({ useMe: () => ({ data: { id: 7 } }) }));

afterEach(cleanup);

function stubDetail(detail: Record<string, unknown>) {
  server.use(
    http.get(`${API}/hr/recruitment/applications/42`, () => HttpResponse.json(detail)),
    http.get(`${API}/hr/recruitment/opportunities/1/criteria`, () =>
      HttpResponse.json({
        criteria: [
          { id: 100, name: "Motivation", weight: "2", max_score: 5, sort_order: 1 },
          { id: 101, name: "Experience", weight: "1", max_score: 5, sort_order: 2 },
        ],
      }),
    ),
  );
}

const baseApp = {
  id: 42,
  opportunity_id: 1,
  pipeline_stage: "evaluation",
  flagged: false,
  flag_note: null,
  rejection_reason: null,
  first_name: "Ada",
  last_name: "Lovelace",
  email: "ada@example.com",
};

describe("ApplicationDetailPanel", () => {
  it("Answers tab renders the pinned form_version's custom answers (never 'unknown field')", async () => {
    stubDetail({
      application: {
        ...baseApp,
        form_version: 2,
        custom_answers: { degree: "msc", portfolio_url: "http://x" },
      },
      stage_events: [],
      scores: [],
      emails: [],
    });

    renderWithClient(<ApplicationDetailPanel applicationId={42} open onOpenChange={() => {}} />);
    await userEvent.click(await screen.findByRole("tab", { name: "Answers" }));

    expect(await screen.findByText("Form version 2")).toBeInTheDocument();
    expect(screen.getByText("degree")).toBeInTheDocument();
    expect(screen.getByText("msc")).toBeInTheDocument();
  });

  it("legacy application (null form_version) falls back without error", async () => {
    stubDetail({
      application: { ...baseApp, form_version: null, custom_answers: null },
      stage_events: [],
      scores: [],
      emails: [],
    });

    renderWithClient(<ApplicationDetailPanel applicationId={42} open onOpenChange={() => {}} />);
    await userEvent.click(await screen.findByRole("tab", { name: "Answers" }));
    expect(await screen.findByText("Form version legacy")).toBeInTheDocument();
    expect(screen.getByText("No additional answers.")).toBeInTheDocument();
  });

  it("Evaluation tab: my scores are editable, other reviewers' are read-only", async () => {
    stubDetail({
      application: { ...baseApp, form_version: 1, custom_answers: {} },
      stage_events: [],
      scores: [
        { id: 1, criterion_id: 100, reviewer_user_id: 7, score: 4, comment: null }, // mine
        { id: 2, criterion_id: 100, reviewer_user_id: 9, score: 2, comment: null }, // another reviewer
      ],
      emails: [],
    });

    renderWithClient(<ApplicationDetailPanel applicationId={42} open onOpenChange={() => {}} />);
    await userEvent.click(await screen.findByRole("tab", { name: "Evaluation" }));

    // My editable input exists and reflects my score.
    const myInput = (await screen.findByLabelText("My score for Motivation")) as HTMLInputElement;
    expect(myInput.value).toBe("4");

    // Other reviewer's score shown read-only (no input for it).
    expect(screen.getByText("Other reviewers")).toBeInTheDocument();
    expect(screen.getByText("Reviewer #9")).toBeInTheDocument();
  });

  it("Evaluation save posts scores and shows the weighted total", async () => {
    stubDetail({
      application: { ...baseApp, form_version: 1, custom_answers: {} },
      stage_events: [],
      scores: [],
      emails: [],
    });
    server.use(
      http.put(`${API}/hr/recruitment/applications/42/scores`, () =>
        HttpResponse.json({ weighted_total: 0.8 }),
      ),
    );

    renderWithClient(<ApplicationDetailPanel applicationId={42} open onOpenChange={() => {}} />);
    await userEvent.click(await screen.findByRole("tab", { name: "Evaluation" }));

    fireEvent.change(await screen.findByLabelText("My score for Motivation"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save my scores" }));

    await waitFor(() => expect(screen.getByTestId("weighted-total")).toHaveTextContent("0.8"));
  });

  it("Profile tab shows fields + CV link; History and Emails tabs render their data", async () => {
    stubDetail({
      application: {
        ...baseApp,
        form_version: 1,
        custom_answers: {},
        cv_url: "https://files.example.com/cv.pdf",
        city: "Kigali",
      },
      stage_events: [
        {
          id: 1,
          from_stage: null,
          to_stage: "submitted",
          actor_user_id: null,
          note: "seed",
          created_at: "2026-06-01T00:00:00Z",
        },
        {
          id: 2,
          from_stage: "submitted",
          to_stage: "screening",
          actor_user_id: 7,
          note: null,
          created_at: "2026-06-02T00:00:00Z",
        },
      ],
      scores: [],
      emails: [{ id: 1, email_type: "received", sent_at: "2026-06-01T00:00:00Z" }],
    });

    renderWithClient(<ApplicationDetailPanel applicationId={42} open onOpenChange={() => {}} />);

    // Profile (default tab) — CV link + a standard field.
    expect(await screen.findByRole("link", { name: "View CV" })).toHaveAttribute(
      "href",
      "https://files.example.com/cv.pdf",
    );
    expect(screen.getByText("Kigali")).toBeInTheDocument();

    // History — automation event marked "System".
    await userEvent.click(screen.getByRole("tab", { name: "History" }));
    expect(await screen.findByText(/submitted → screening/)).toBeInTheDocument();
    expect(screen.getByText(/System/)).toBeInTheDocument();

    // Emails.
    await userEvent.click(screen.getByRole("tab", { name: "Emails" }));
    expect(await screen.findByText("received")).toBeInTheDocument();
  });

  it("renders the flag note and boolean answers (Yes/No)", async () => {
    stubDetail({
      application: {
        ...baseApp,
        form_version: 1,
        custom_answers: {},
        flagged: true,
        flag_note: "Local applicant",
        has_work_permit: true,
        country_of_residence: "",
      },
      stage_events: [],
      scores: [],
      emails: [],
    });
    renderWithClient(<ApplicationDetailPanel applicationId={42} open onOpenChange={() => {}} />);
    expect(await screen.findByText("Local applicant")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Answers" }));
    expect(await screen.findByText("Yes")).toBeInTheDocument(); // has_work_permit boolean
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(1); // empty field fallback
  });

  it("empty History and Emails tabs show fallbacks", async () => {
    stubDetail({
      application: { ...baseApp, form_version: 1, custom_answers: {} },
      stage_events: [],
      scores: [],
      emails: [],
    });
    renderWithClient(<ApplicationDetailPanel applicationId={42} open onOpenChange={() => {}} />);
    await userEvent.click(await screen.findByRole("tab", { name: "History" }));
    expect(await screen.findByText("No history yet.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Emails" }));
    expect(await screen.findByText("No emails sent.")).toBeInTheDocument();
  });
});
