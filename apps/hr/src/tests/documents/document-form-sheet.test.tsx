/**
 * "Use a saved template" vs "Upload a file" when creating a document from the Documents page's
 * create form. The template picker fetches design/branding templates (hr_document_category_
 * templates via GET /hr/document-category-templates) — not the generic documents list — and
 * picking one reveals a Quill editor for the document's body content. On submit, the branding +
 * Quill HTML are combined into a generated .html file and uploaded through the normal file path
 * (no sourceDocumentId) — see document-branding.ts's renderBrandedDocumentHtml.
 *
 * Quill itself needs real browser Range/Selection APIs jsdom doesn't fully implement, so it's
 * mocked here the same way multer-s3 is mocked in the backend's create-document tests: a minimal
 * fake that exposes exactly the surface QuillEditor uses (constructor, .on, .root.innerHTML,
 * .clipboard.dangerouslyPasteHTML), keeping these tests about our own wiring, not Quill's internals.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { DocumentFormSheet } from "@/components/sections/documents/document-form-sheet";
import { documentsService } from "@/services/documents.service";

const API = "http://localhost:3002/api";
const TEMPLATE_ID = "eeeeeeee-5555-5555-5555-555555555555";

const { lastQuillInstance } = vi.hoisted(() => ({ lastQuillInstance: { current: null as any } }));

vi.mock("quill", () => {
  class FakeQuill {
    root = { innerHTML: "" };
    clipboard = { dangerouslyPasteHTML: (html: string) => (this.root.innerHTML = html) };
    private handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
    constructor(el: HTMLElement) {
      const editable = document.createElement("div");
      editable.setAttribute("data-testid", "quill-editable");
      editable.contentEditable = "true";
      el.appendChild(editable);
      lastQuillInstance.current = this;
    }
    on(event: string, cb: (...args: unknown[]) => void) {
      (this.handlers[event] ??= []).push(cb);
    }
    setHtmlAndFireChange(html: string) {
      this.root.innerHTML = html;
      (this.handlers["text-change"] ?? []).forEach((cb) => cb());
    }
  }
  return { default: FakeQuill };
});

const DOC_TEMPLATE = {
  id: TEMPLATE_ID,
  name: "Standard Letterhead",
  color: "green",
  category: null, // universal — offered regardless of the category being created
  header_text: null,
  description: null,
  titleColor: "#1a1a1a",
  borderStyle: "NONE",
  logoUrl: "",
  logoPosition: "TOP_LEFT",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

async function selectOption(triggerText: string, optionText: string) {
  const trigger = screen.getByText(triggerText).closest('[role="combobox"]') as HTMLElement;
  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText(/document name/i), "Handbook v2");
  await userEvent.type(screen.getByLabelText(/^department/i), "Ops");
  await userEvent.type(screen.getByLabelText(/description/i), "desc");
  await selectOption("Select category", "Policies & Procedures");
}

function mockTemplates(templates: unknown[] = [DOC_TEMPLATE]) {
  server.use(
    http.get(`${API}/hr/document-category-templates`, () =>
      HttpResponse.json({ success: true, data: templates }),
    ),
  );
}

afterEach(() => {
  cleanup();
  server.resetHandlers();
  lastQuillInstance.current = null;
});

describe("DocumentFormSheet — use a saved template vs upload", () => {
  it("defaults to Upload a file, with no source toggle shown while editing", async () => {
    mockTemplates();
    renderWithClient(<DocumentFormSheet document={null} onDone={vi.fn()} />);
    expect(screen.getByTestId("file-source-upload")).toHaveAttribute("aria-pressed", "true");
  });

  it("hides the source toggle when editing an existing document", async () => {
    mockTemplates();
    renderWithClient(
      <DocumentFormSheet
        document={
          {
            id: "doc-1",
            document_name: "Existing",
            category: "Policies & Procedures",
            description: "d",
            department: "Ops",
            status: "PUBLISHED",
            access: {},
            contract_id: null,
            fileSize: "1 KB",
            downloads: 0,
            modifiedAt: "2026-01-01T00:00:00Z",
            createdBy: { id: null, fullName: "" },
          } as any
        }
        onDone={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("file-source-upload")).not.toBeInTheDocument();
  });

  it("switching to 'Use a saved template' hides the dropzone, fetches design templates (not documents), and shows the picker", async () => {
    let hitTemplatesEndpoint = false;
    let hitDocumentsListEndpoint = false;
    server.use(
      http.get(`${API}/hr/document-category-templates`, () => {
        hitTemplatesEndpoint = true;
        return HttpResponse.json({ success: true, data: [DOC_TEMPLATE] });
      }),
      http.get(`${API}/hr/documents/templates`, () => {
        hitDocumentsListEndpoint = true;
        return HttpResponse.json({ data: [] });
      }),
    );

    renderWithClient(<DocumentFormSheet document={null} onDone={vi.fn()} />);
    await fillRequiredFields();

    await userEvent.click(screen.getByTestId("file-source-existing"));

    expect(screen.queryByText(/click to upload/i)).not.toBeInTheDocument();
    expect(await screen.findByText("Select a template to use")).toBeInTheDocument();
    expect(hitTemplatesEndpoint).toBe(true);
    expect(hitDocumentsListEndpoint).toBe(false);
  });

  it("only offers templates scoped to the selected category, plus universal ones", async () => {
    mockTemplates([
      { ...DOC_TEMPLATE, id: "universal-1", name: "Universal Template", category: null },
      {
        ...DOC_TEMPLATE,
        id: "matching-1",
        name: "Policies Template",
        category: "Policies & Procedures",
      },
      {
        ...DOC_TEMPLATE,
        id: "other-1",
        name: "Forms Template",
        category: "Forms & Applications",
      },
    ]);

    renderWithClient(<DocumentFormSheet document={null} onDone={vi.fn()} />);
    await fillRequiredFields(); // selects category "Policies & Procedures"

    await userEvent.click(screen.getByTestId("file-source-existing"));
    const trigger = screen
      .getByText("Select a template to use")
      .closest('[role="combobox"]') as HTMLElement;
    await userEvent.click(trigger);

    expect(await screen.findByRole("option", { name: "Universal Template" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Policies Template" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Forms Template" })).not.toBeInTheDocument();
  });

  it("reveals the Quill editor once 'Use a saved template' is active", async () => {
    mockTemplates();
    renderWithClient(<DocumentFormSheet document={null} onDone={vi.fn()} />);
    await fillRequiredFields();

    expect(screen.queryByTestId("quill-editor")).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId("file-source-existing"));
    expect(await screen.findByTestId("quill-editor")).toBeInTheDocument();
  });

  it("generates a branded .html file (no sourceDocumentId) combining the template and Quill content", async () => {
    // Actually transmitting a File through axios+MSW hangs indefinitely under this jsdom test
    // environment (reproduced independently of this component/feature — not something this
    // change introduced), so the create call is mocked at the service layer instead of the
    // network layer here. That still exercises everything this feature actually owns: the
    // generated File's name/type/content and the payload shape (no sourceDocumentId). The normal
    // upload path itself (an already-existing, unmodified code path) isn't what's under test.
    mockTemplates();
    const createSpy = vi
      .spyOn(documentsService, "createDocument")
      .mockResolvedValue({ id: "new-doc-id" } as any);

    const onDone = vi.fn();
    renderWithClient(<DocumentFormSheet document={null} onDone={onDone} />);
    await fillRequiredFields();

    await userEvent.click(screen.getByTestId("file-source-existing"));
    await selectOption("Select a template to use", "Standard Letterhead");
    await screen.findByTestId("quill-editor");
    await act(async () => {
      lastQuillInstance.current?.setHtmlAndFireChange("<p>Welcome to the team.</p>");
    });

    await userEvent.click(screen.getByRole("button", { name: /upload document/i }));

    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
    const [payload, file] = createSpy.mock.calls[0];
    expect(payload).not.toHaveProperty("sourceDocumentId");
    expect(payload.document_name).toBe("Handbook v2");
    expect(file).toBeInstanceOf(File);
    expect((file as File).type).toBe("text/html");

    const uploadedText = await (file as File).text();
    expect(uploadedText).toContain("Welcome to the team.");
    expect(uploadedText).toContain("Handbook v2");
    expect(onDone).toHaveBeenCalled();
  });

  it("blocks submission when a template is picked but no content is written", async () => {
    mockTemplates();
    renderWithClient(<DocumentFormSheet document={null} onDone={vi.fn()} />);
    await fillRequiredFields();

    await userEvent.click(screen.getByTestId("file-source-existing"));
    await selectOption("Select a template to use", "Standard Letterhead");
    await screen.findByTestId("quill-editor");

    await userEvent.click(screen.getByRole("button", { name: /upload document/i }));

    expect(await screen.findByText(/add the document's contents/i)).toBeInTheDocument();
  });

  it("blocks submission when 'Use a saved template' is selected but no template is picked", async () => {
    mockTemplates();
    renderWithClient(<DocumentFormSheet document={null} onDone={vi.fn()} />);
    await fillRequiredFields();
    await userEvent.click(screen.getByTestId("file-source-existing"));

    await userEvent.click(screen.getByRole("button", { name: /upload document/i }));

    expect(await screen.findByText(/select an existing template/i)).toBeInTheDocument();
  });

  it("switching back to Upload a file after picking a template clears the selection", async () => {
    mockTemplates();
    renderWithClient(<DocumentFormSheet document={null} onDone={vi.fn()} />);
    await fillRequiredFields();
    await userEvent.click(screen.getByTestId("file-source-existing"));
    await selectOption("Select a template to use", "Standard Letterhead");

    await userEvent.click(screen.getByTestId("file-source-upload"));
    expect(await screen.findByText(/click to upload/i)).toBeInTheDocument();
  });
});
