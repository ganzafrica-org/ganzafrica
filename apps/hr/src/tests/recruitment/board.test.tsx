import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "./test-utils";

const API = "http://localhost:3002/api";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "1" }),
  useRouter: () => ({ push: vi.fn() }),
}));

// Sonner renders toasts into a portal; assert via the mocked toast fn instead.
const toastMock = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: toastMock }) }));

import PipelineBoardPage from "@/app/recruitment/[id]/page";

const APPLICATIONS = [
  {
    id: 10,
    opportunity_id: 1,
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    pipeline_stage: "submitted",
    flagged: false,
    submission_date: "2026-06-01T00:00:00Z",
  },
  {
    id: 11,
    opportunity_id: 1,
    first_name: "Grace",
    last_name: "Hopper",
    email: "grace@example.com",
    pipeline_stage: "screening",
    flagged: true,
    submission_date: "2026-06-02T00:00:00Z",
  },
];

afterEach(() => {
  cleanup();
  toastMock.mockClear();
});

function stubList() {
  server.use(
    http.get(`${API}/hr/recruitment/applications`, () =>
      HttpResponse.json({ data: APPLICATIONS, page: 1, pageSize: 20, total: 2 }),
    ),
  );
}

describe("PipelineBoard", () => {
  it("renders seeded applications in their stage columns", async () => {
    stubList();
    renderWithClient(<PipelineBoardPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    // flagged indicator present for Grace
    expect(screen.getAllByLabelText("Flagged").length).toBeGreaterThanOrEqual(1);
  });

  it("an illegal transition (409) surfaces a toast with the allowed moves", async () => {
    stubList();
    server.use(
      http.post(`${API}/hr/recruitment/applications/10/transition`, () =>
        HttpResponse.json(
          { error: "Illegal transition", allowed: ["screening", "rejected", "withdrawn"] },
          { status: 409 },
        ),
      ),
    );

    renderWithClient(<PipelineBoardPage />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(screen.getByLabelText("Move Ada"));
    await userEvent.click(await screen.findByText("Move to screening"));

    await waitFor(() => expect(toastMock).toHaveBeenCalled());
    const arg = toastMock.mock.calls.at(-1)![0];
    expect(arg.variant).toBe("destructive");
    expect(String(arg.description)).toContain("screening");
  });
});
