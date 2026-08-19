import { afterEach, describe, it, expect } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { DocumentViewer } from "@/components/sections/documents/document-viewer";
import type { HrDocument } from "@/types/api";

/**
 * Coverage for the "Under Documents page, modify the way the document is view(I want you to use
 * PDFx)" task (Things-to-work-on.md). Verdict after investigation (see the e2e spec in
 * e2e/tests/pdf-viewer.spec.ts and the task report for the full write-up): the "pdf" branch
 * already renders a bare `<iframe src={presignedUrl}>`, which is exactly what makes a real
 * browser's native PDF viewer (page nav, zoom, rotate, download, print — the toolbar in
 * img_2.png) engage automatically, so it was left unchanged rather than swapped for a
 * fetch()-based library like react-pdf — the storage bucket doesn't answer CORS preflights,
 * which a fetch()-based reader needs but a plain iframe src does not.
 *
 * These tests pin that "pdf" branch's contract: given a document whose stored file is a .pdf,
 * DocumentViewer renders a same-tab iframe pointed at the presigned view URL, titled with the
 * document's display name, with no extra chrome of our own layered on top (no custom page-nav/
 * zoom controls — those come from the browser, not this component).
 */

const API = "http://localhost:3002/api";

afterEach(cleanup);

function baseDocument(overrides: Partial<HrDocument> = {}): HrDocument {
  return {
    id: "doc-1",
    document_name: "Employee Handbook 2026.pdf",
    category: "Onboarding Materials",
    version: "1",
    description: "d",
    department: "Engineering",
    fileSize: "120 KB",
    downloads: 0,
    status: "PUBLISHED",
    access: {},
    contract_id: null,
    modifiedAt: new Date().toISOString(),
    createdBy: { id: "u1", fullName: "Hana HR" },
    ...overrides,
  };
}

function stubViewUrl(id: string, fileName: string, url: string) {
  server.use(
    http.get(`${API}/hr/documents/${id}/view-url`, () =>
      HttpResponse.json({ success: true, message: "ok", data: { url, fileName } }),
    ),
  );
}

describe("DocumentViewer — pdf strategy", () => {
  it("renders a same-tab iframe pointed at the presigned view URL for a .pdf file", async () => {
    const doc = baseDocument({ id: "doc-pdf", document_name: "Employee Handbook 2026.pdf" });
    const presignedUrl =
      "https://files.example.com/uploads/document/1700000000-handbook.pdf?sig=abc";
    stubViewUrl(doc.id, "1700000000-handbook.pdf", presignedUrl);

    render(<DocumentViewer document={doc} />);

    const iframe = await screen.findByTitle(doc.document_name);
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute("src", presignedUrl);
    // No target/rel attributes that would send it to a new tab or window — it's embedded inline.
    expect(iframe).not.toHaveAttribute("target");
  });

  it("picks the pdf strategy from the stored file's real extension, not the display name", async () => {
    // document_name has no extension at all; the stored S3 key (returned as fileName) does —
    // strategyFor() must key off fileName, matching the comment at the top of document-viewer.tsx.
    const doc = baseDocument({ id: "doc-pdf-2", document_name: "Signed Offer Letter" });
    const presignedUrl = "https://files.example.com/uploads/document/1700000001-offer.pdf?sig=def";
    stubViewUrl(doc.id, "1700000001-offer.pdf", presignedUrl);

    render(<DocumentViewer document={doc} />);

    const iframe = await screen.findByTitle(doc.document_name);
    expect(iframe).toHaveAttribute("src", presignedUrl);
  });

  it("does not render any custom page-nav or zoom controls of its own", async () => {
    // The toolbar in img_2.png (page counter, zoom, rotate, download, print) is Chrome's native
    // PDF viewer UI, not something this component builds — confirm no such controls are added.
    const doc = baseDocument({ id: "doc-pdf-3" });
    stubViewUrl(doc.id, "file.pdf", "https://files.example.com/file.pdf");

    render(<DocumentViewer document={doc} />);
    await screen.findByTitle(doc.document_name);

    expect(screen.queryByRole("button", { name: /zoom/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /next page|previous page/i }),
    ).not.toBeInTheDocument();
  });

  it("shows a loading state before the view URL resolves", async () => {
    const doc = baseDocument({ id: "doc-pdf-4" });
    server.use(
      http.get(`${API}/hr/documents/${doc.id}/view-url`, async () => {
        await new Promise((r) => setTimeout(r, 50));
        return HttpResponse.json({
          success: true,
          message: "ok",
          data: { url: "https://files.example.com/file.pdf", fileName: "file.pdf" },
        });
      }),
    );

    render(<DocumentViewer document={doc} />);
    expect(screen.getByText(/loading preview/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTitle(doc.document_name)).toBeInTheDocument());
  });

  it("shows a permission-specific error message on a 403", async () => {
    const doc = baseDocument({ id: "doc-pdf-403" });
    server.use(
      http.get(`${API}/hr/documents/${doc.id}/view-url`, () =>
        HttpResponse.json({ message: "forbidden" }, { status: 403 }),
      ),
    );

    render(<DocumentViewer document={doc} />);
    expect(await screen.findByText(/don't have permission to view this file/i)).toBeInTheDocument();
    // Falls back to an explicit download link rather than leaving a dead viewer.
    expect(screen.getByRole("link", { name: /download instead/i })).toBeInTheDocument();
  });

  it("shows a generic error message when the view URL request fails for any other reason", async () => {
    const doc = baseDocument({ id: "doc-pdf-500" });
    server.use(
      http.get(`${API}/hr/documents/${doc.id}/view-url`, () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );

    render(<DocumentViewer document={doc} />);
    expect(await screen.findByText(/could not be reached/i)).toBeInTheDocument();
  });
});
