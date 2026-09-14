/**
 * "New posting" used to navigate to the standalone /recruitment/new page; it now opens the same
 * 3-step wizard content in a ReusableSheet instead, matching every other "create" flow in the app
 * (add-employee-sheet, document-form-sheet, etc.) — no page navigation.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import RecruitmentPage from "@/app/recruitment/page";

// AnimatePresence's exit animation never resolves under jsdom (no real rAF timing), so the sheet's
// "New posting" heading can stay mounted well past this test's waitFor — replace with a plain
// pass-through so open/close happens synchronously, like the other sheet tests do.
vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      variants: _variants,
      transition: _transition,
      ...rest
    }: Record<string, unknown> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

const API = "http://localhost:3002/api";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

afterEach(() => {
  cleanup();
  pushMock.mockClear();
});

function mockEmptyOpportunities() {
  server.use(
    http.get(`${API}/hr/recruitment/opportunities`, () => HttpResponse.json({ opportunities: [] })),
  );
}

describe("Recruitment page — create posting", () => {
  it("opens the create-posting sheet in place, without navigating to /recruitment/new", async () => {
    mockEmptyOpportunities();
    renderWithClient(<RecruitmentPage />);

    await userEvent.click(await screen.findByRole("button", { name: /new posting/i }));

    expect(await screen.findByRole("heading", { name: /new posting/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalledWith("/recruitment/new");
  });

  it("publishing closes the sheet and refreshes the postings list", async () => {
    mockEmptyOpportunities();
    let listHits = 0;
    server.use(
      http.get(`${API}/hr/recruitment/opportunities`, () => {
        listHits++;
        return HttpResponse.json({ opportunities: [] });
      }),
      http.post(`${API}/opportunities`, () =>
        HttpResponse.json({ opportunity: { id: 42 } }, { status: 201 }),
      ),
      http.put(`${API}/hr/opportunities/42/form`, () => HttpResponse.json({})),
      http.put(`${API}/hr/opportunities/42/form/publish`, () => HttpResponse.json({})),
      http.post(`${API}/opportunities/42/publish`, () => HttpResponse.json({})),
    );

    renderWithClient(<RecruitmentPage />);
    await userEvent.click(await screen.findByRole("button", { name: /new posting/i }));

    await userEvent.type(screen.getByLabelText(/title/i), "Backend Engineer Fellowship");
    await userEvent.type(
      screen.getByLabelText(/description/i),
      "A great role building the platform.",
    );
    const deadline = screen.getByLabelText(/application deadline/i);
    await userEvent.type(deadline, "2026-12-31");

    await userEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    // Step 2 -> 3: the wizard's own Continue button, not FormBuilder's internal publish action.
    const step2Continue = await screen.findByRole("button", { name: /^continue$/i });
    await userEvent.click(step2Continue);

    await userEvent.click(await screen.findByRole("button", { name: /^publish$/i }));
    // Confirmation dialog's own Publish button.
    const dialogPublish = await screen.findAllByRole("button", { name: /^publish$/i });
    await userEvent.click(dialogPublish[dialogPublish.length - 1]);

    await waitFor(() =>
      expect(screen.queryByRole("heading", { name: /new posting/i })).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(listHits).toBeGreaterThan(1));
  });
});
