/**
 * Direct unit coverage for the document-category-templates service + single-item hook — the
 * category-template-sheet.tsx UI only exercises list/create/update/delete (it edits from the
 * already-fetched list, not a per-id fetch), so getById/useDocumentCategoryTemplate need their
 * own coverage here.
 */
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { documentCategoryTemplatesService } from "@/services/document-category-templates.service";
import { useDocumentCategoryTemplate } from "@/hooks/useDocumentCategoryTemplates";
import type { ReactNode } from "react";

const API = "http://localhost:3002/api";
const ENDPOINT = `${API}/hr/document-category-templates`;

const template = {
  id: "tmpl-1",
  name: "Onboarding Materials",
  color: "green",
  header_text: null,
  description: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("documentCategoryTemplatesService.getById", () => {
  it("fetches a single template by id", async () => {
    server.use(
      http.get(`${ENDPOINT}/tmpl-1`, () => HttpResponse.json({ success: true, data: template })),
    );
    const result = await documentCategoryTemplatesService.getById("tmpl-1");
    expect(result).toEqual(template);
  });
});

describe("useDocumentCategoryTemplate", () => {
  it("stays disabled with a null id, then fetches once an id is provided", async () => {
    server.use(
      http.get(`${ENDPOINT}/tmpl-1`, () => HttpResponse.json({ success: true, data: template })),
    );

    const { result, rerender } = renderHook(({ id }) => useDocumentCategoryTemplate(id), {
      wrapper,
      initialProps: { id: null as string | null },
    });
    expect(result.current.fetchStatus).toBe("idle");

    rerender({ id: "tmpl-1" });
    await waitFor(() => expect(result.current.data).toEqual(template));
  });
});
