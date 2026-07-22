import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "../recruitment/test-utils";
import DocumentSearchRetentionPage from "@/app/documents/search/page";

const API = "http://localhost:3002/api";
afterEach(cleanup);

function searchResult(overrides = {}) {
  return {
    id: "doc-1",
    document_name: "Leave Policy",
    category: "Policies & Procedures",
    version: "1.0",
    description: "How leave works",
    department: "Ops",
    fileSize: "10 KB",
    status: "PUBLISHED",
    contract_id: null,
    modifiedAt: "2026-06-01T00:00:00Z",
    snippet: "…accrue twenty one days of annual leave per…",
    ...overrides,
  };
}

describe("DocumentSearchRetentionPage", () => {
  it("searches and shows the in-file snippet on a match", async () => {
    server.use(
      http.get(`${API}/hr/documents/retention/preview`, () =>
        HttpResponse.json({ data: [], meta: { total: 0 } }),
      ),
      http.get(`${API}/hr/documents/search`, ({ request }) => {
        const q = new URL(request.url).searchParams.get("q");
        expect(q).toBe("annual leave");
        return HttpResponse.json({ data: [searchResult()], meta: { total: 1 } });
      }),
    );

    renderWithClient(<DocumentSearchRetentionPage />);

    fireEvent.change(screen.getByLabelText(/search documents/i), {
      target: { value: "annual leave" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Search$/ }));

    expect(await screen.findByText("Leave Policy")).toBeInTheDocument();
    expect(screen.getByText(/matched in file/i)).toBeInTheDocument();
  });

  it("lists retention-due documents and clears retention", async () => {
    let cleared = false;
    server.use(
      http.get(`${API}/hr/documents/retention/preview`, () =>
        HttpResponse.json(
          cleared
            ? { data: [], meta: { total: 0 } }
            : {
                data: [
                  {
                    id: "doc-9",
                    document_name: "Old Training Deck",
                    category: "Training Materials",
                    retain_until: "2020-01-01T00:00:00Z",
                  },
                ],
                meta: { total: 1 },
              },
        ),
      ),
      http.patch(`${API}/hr/documents/doc-9/retention`, async ({ request }) => {
        const body = (await request.json()) as { retain_until: string | null };
        expect(body.retain_until).toBeNull();
        cleared = true;
        return HttpResponse.json({ data: { id: "doc-9", retain_until: null } });
      }),
    );

    renderWithClient(<DocumentSearchRetentionPage />);

    expect(await screen.findByText("Old Training Deck")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /keep indefinitely/i }));

    await waitFor(() =>
      expect(screen.getByText(/nothing is due for archiving/i)).toBeInTheDocument(),
    );
  });
});
