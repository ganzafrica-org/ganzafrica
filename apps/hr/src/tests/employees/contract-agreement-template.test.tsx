/**
 * "Use a saved template" for the contract step's Employment Agreement — mutually exclusive with
 * uploading a file (enforced by construction: picking one clears the other via
 * onAgreementFileChange/onAgreementTemplateIdChange, not just by validation).
 *
 * The template picker fetches design/branding templates (hr_document_category_templates via
 * GET /hr/document-category-templates) — the same picker the Documents page's create form uses —
 * not a pool of previously-uploaded contract files. Picking one reveals a Quill editor, pre-filled
 * from the contract fields already typed in (see buildAgreementContentFromContract), which the
 * user can edit further. On submit, the branding + Quill HTML are combined into a generated .html
 * file and uploaded through the normal file path (no sourceDocumentId) — see
 * document-branding.ts's renderBrandedDocumentHtml.
 *
 * Quill itself needs real browser Range/Selection APIs jsdom doesn't fully implement, so it's
 * mocked here the same way document-form-sheet.test.tsx mocks it: a minimal fake exposing exactly
 * the surface QuillEditor uses (constructor, .on, .root.innerHTML, .clipboard.dangerouslyPasteHTML)
 * — including firing "text-change" from dangerouslyPasteHTML, matching quill-editor.tsx's
 * registration order (listener attached before the initial paste).
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { AddEmployeeSheet } from "@/components/sections/sheets/add-employee-sheet";
import { documentsService } from "@/services/documents.service";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...rest
    }: Record<string, unknown> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

const { lastQuillInstance } = vi.hoisted(() => ({ lastQuillInstance: { current: null as any } }));

vi.mock("quill", () => {
  class FakeQuill {
    root = { innerHTML: "" };
    private handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
    clipboard = {
      dangerouslyPasteHTML: (html: string) => {
        this.root.innerHTML = html;
        (this.handlers["text-change"] ?? []).forEach((cb) => cb());
      },
    };
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

const API = "http://localhost:3002/api";
const EMPLOYEE_ID = "aaaaaaaa-1111-1111-1111-111111111111";
const CONTRACT_ID = "bbbbbbbb-2222-2222-2222-222222222222";
const TEMPLATE_ID = "cccccccc-3333-3333-3333-333333333333";

const CATEGORY_TEMPLATE = {
  id: TEMPLATE_ID,
  name: "Standard Employment Agreement",
  color: "green",
  category: "Contract Templates",
  header_text: null,
  description: null,
  titleColor: "#1a1a1a",
  borderStyle: "NONE",
  logoUrl: "",
  logoPosition: "TOP_LEFT",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function mockCategoryTemplates(templates: unknown[] = [CATEGORY_TEMPLATE]) {
  server.use(
    http.get(`${API}/hr/document-category-templates`, () =>
      HttpResponse.json({ success: true, data: templates }),
    ),
  );
}

beforeEach(() => {
  server.use(
    http.get(`${API}/hr/employees`, () => HttpResponse.json({ data: [], total: 0, pages: 1 })),
  );
  mockCategoryTemplates();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  lastQuillInstance.current = null;
});

async function fillProfileStep() {
  const textboxes = screen.getAllByRole("textbox");
  await userEvent.type(textboxes[0], "New");
  await userEvent.type(textboxes[1], "Hire");
  await userEvent.type(screen.getByPlaceholderText("john@gmail.com"), "new.hire@example.com");
  await userEvent.click(screen.getByRole("button", { name: /^next$/i }));
}

async function selectOption(triggerText: string, optionText: string) {
  const trigger = screen.getByText(triggerText).closest('[role="combobox"]') as HTMLElement;
  await userEvent.click(trigger);
  await userEvent.click(await screen.findByRole("option", { name: optionText }));
}

async function fillMinimalContract() {
  await userEvent.type(screen.getByPlaceholderText("e.g. Software Engineer"), "Analyst");
  const startDate = document.querySelector('input[type="date"]') as HTMLInputElement;
  await userEvent.type(startDate, "2026-03-02");
  await selectOption("Indefinite or Definite", "Indefinite");
  await selectOption("Full-time or Part-time", "Full-time");
  await selectOption("Hourly or Salaried", "Salaried");
}

describe("Contract step — use a saved template instead of uploading", () => {
  it("defaults to the upload toggle selected, with no template picker shown", async () => {
    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);
    await fillProfileStep();

    expect(screen.getByTestId("agreement-source-upload")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("agreement-source-template")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.queryByText("Select a saved template")).not.toBeInTheDocument();
  });

  it("switching to 'Use a saved template' shows the template picker and pre-fills the agreement content", async () => {
    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);
    await fillProfileStep();
    await fillMinimalContract();

    await userEvent.click(screen.getByTestId("agreement-source-template"));
    expect(await screen.findByText("Select a saved template")).toBeInTheDocument();
    expect(screen.getByTestId("agreement-source-template")).toHaveAttribute("aria-pressed", "true");

    await screen.findByTestId("quill-editor");
    expect(lastQuillInstance.current?.root.innerHTML).toContain("Analyst");
    expect(lastQuillInstance.current?.root.innerHTML).toContain("New Hire");
  });

  it("only offers templates scoped to Contract Templates, plus universal ones", async () => {
    mockCategoryTemplates([
      { ...CATEGORY_TEMPLATE, id: "universal-1", name: "Universal Template", category: null },
      { ...CATEGORY_TEMPLATE, id: "matching-1", name: "Matching Template" },
      {
        ...CATEGORY_TEMPLATE,
        id: "other-1",
        name: "Policies Template",
        category: "Policies & Procedures",
      },
    ]);

    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);
    await fillProfileStep();
    await userEvent.click(screen.getByTestId("agreement-source-template"));

    const trigger = screen
      .getByText("Select a saved template")
      .closest('[role="combobox"]') as HTMLElement;
    await userEvent.click(trigger);

    expect(await screen.findByRole("option", { name: "Universal Template" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Matching Template" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Policies Template" })).not.toBeInTheDocument();
  });

  it("creates the contract with a generated branded document (no sourceDocumentId), including further edits", async () => {
    server.use(
      http.post(`${API}/hr/employees`, () =>
        HttpResponse.json(
          { employee: { id: EMPLOYEE_ID, first_name: "New", last_name: "Hire" } },
          { status: 201 },
        ),
      ),
      http.post(`${API}/hr/employees/${EMPLOYEE_ID}/contracts`, () =>
        HttpResponse.json(
          { id: CONTRACT_ID, employeeId: EMPLOYEE_ID, jobTitle: "Analyst", status: "DRAFT" },
          { status: 201 },
        ),
      ),
      http.patch(`${API}/hr/employees/${EMPLOYEE_ID}/contracts/${CONTRACT_ID}`, () =>
        HttpResponse.json({
          id: CONTRACT_ID,
          employeeId: EMPLOYEE_ID,
          jobTitle: "Analyst",
          status: "DRAFT",
        }),
      ),
      http.get(`${API}/hr/processes`, () => HttpResponse.json({ processes: [] })),
      http.get(`${API}/hr/signing/requests`, () => HttpResponse.json({ requests: [] })),
      // attachAgreement resolves the picked template's branding via GET .../:id before generating
      // the document — distinct from the list endpoint mocked in beforeEach.
      http.get(`${API}/hr/document-category-templates/${TEMPLATE_ID}`, () =>
        HttpResponse.json({ success: true, data: CATEGORY_TEMPLATE }),
      ),
    );
    // Sending a real File through axios+MSW hangs indefinitely under this jsdom environment
    // (reproduced independently of this feature — see document-form-sheet.test.tsx's identical
    // note), so the create call is asserted at the service layer instead of the network layer.
    const createSpy = vi
      .spyOn(documentsService, "createDocument")
      .mockResolvedValue({ id: "dddddddd-4444-4444-4444-444444444444" } as any);

    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);
    await fillProfileStep();
    await fillMinimalContract();

    await userEvent.click(screen.getByTestId("agreement-source-template"));
    await selectOption("Select a saved template", "Standard Employment Agreement");
    await screen.findByTestId("quill-editor");
    await act(async () => {
      lastQuillInstance.current?.setHtmlAndFireChange(
        `${lastQuillInstance.current.root.innerHTML}<p>Probation period: 3 months.</p>`,
      );
    });

    await userEvent.click(screen.getByRole("button", { name: /create employee/i }));

    await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
    const [payload, file] = createSpy.mock.calls[0];
    expect(payload).not.toHaveProperty("sourceDocumentId");
    expect(payload).toMatchObject({ contractId: CONTRACT_ID, category: "Contract Templates" });
    expect(file).toBeInstanceOf(File);
    expect((file as File).type).toBe("text/html");

    const uploadedText = await (file as File).text();
    expect(uploadedText).toContain("Analyst");
    expect(uploadedText).toContain("New Hire");
    expect(uploadedText).toContain("Probation period: 3 months.");
  }, 15000);

  it("picking a template after having chosen a file clears the file (mutually exclusive)", async () => {
    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);
    await fillProfileStep();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["pdf"], "agreement.pdf", { type: "application/pdf" });
    await userEvent.upload(fileInput, file);
    expect(await screen.findByText("agreement.pdf")).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("agreement-source-template"));

    expect(screen.queryByText("agreement.pdf")).not.toBeInTheDocument();
  });

  it("switching back to Upload a file after picking a template clears the template selection", async () => {
    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);
    await fillProfileStep();

    await userEvent.click(screen.getByTestId("agreement-source-template"));
    await selectOption("Select a saved template", "Standard Employment Agreement");
    await screen.findByTestId("quill-editor");

    await userEvent.click(screen.getByTestId("agreement-source-upload"));
    expect(screen.queryByTestId("quill-editor")).not.toBeInTheDocument();
    expect(screen.queryByText("Select a saved template")).not.toBeInTheDocument();
  });
});
