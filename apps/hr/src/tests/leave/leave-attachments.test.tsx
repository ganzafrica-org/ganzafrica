/**
 * Punch-list #5 — optional leave attachments. Renders nothing when a leave request has none
 * (unaffected by this feature), and opens the SAME shared DocumentViewer used elsewhere (Documents
 * Sheet, contract agreements) for a PDF attachment — not a second, leave-specific viewer.
 */
import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { LeaveAttachments } from "@/components/sections/leave/leave-attachments";
import type { HrDocument } from "@/types/api";

const API = "http://localhost:3002/api";
const LEAVE_ID = "11111111-1111-1111-1111-111111111111";
const DOC_ID = "22222222-2222-2222-2222-222222222222";

afterEach(cleanup);

function baseDocument(overrides: Partial<HrDocument> = {}): HrDocument {
  return {
    id: DOC_ID,
    document_name: "sick-note.pdf",
    category: "Leave Attachment",
    version: "1",
    description: "d",
    department: "Engineering",
    fileSize: "12 KB",
    downloads: 0,
    status: "PUBLISHED",
    access: {},
    contract_id: null,
    modifiedAt: new Date().toISOString(),
    createdBy: { id: "u1", fullName: "Jane Employee" },
    ...overrides,
  };
}

describe("LeaveAttachments", () => {
  it("renders nothing when the leave request has no attachments", async () => {
    server.use(
      http.get(`${API}/hr/leave/${LEAVE_ID}/attachments`, () =>
        HttpResponse.json({ attachments: [] }),
      ),
    );

    const { container } = renderWithClient(<LeaveAttachments leaveId={LEAVE_ID} />);
    await new Promise((r) => setTimeout(r, 0));
    expect(container).toBeEmptyDOMElement();
  });

  it("lists an attachment and opens it via the shared DocumentViewer (a real iframe for the pdf strategy)", async () => {
    server.use(
      http.get(`${API}/hr/leave/${LEAVE_ID}/attachments`, () =>
        HttpResponse.json({
          attachments: [
            { id: DOC_ID, document_name: "sick-note.pdf", file_size: "12 KB", created_at: "" },
          ],
        }),
      ),
      http.get(`${API}/hr/documents/${DOC_ID}`, () => HttpResponse.json({ data: baseDocument() })),
      http.get(`${API}/hr/documents/${DOC_ID}/view-url`, () =>
        HttpResponse.json({
          data: { url: "https://files.example.com/sick-note.pdf?sig=x", fileName: "sick-note.pdf" },
        }),
      ),
    );

    renderWithClient(<LeaveAttachments leaveId={LEAVE_ID} />);

    const link = await screen.findByRole("button", { name: /sick-note\.pdf/i });
    await userEvent.click(link);

    const iframe = await screen.findByTitle("sick-note.pdf");
    expect(iframe.tagName).toBe("IFRAME");
    expect(iframe).toHaveAttribute("src", "https://files.example.com/sick-note.pdf?sig=x");
  });
});
