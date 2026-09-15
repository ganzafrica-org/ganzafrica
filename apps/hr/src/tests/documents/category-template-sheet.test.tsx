/**
 * Document category templates (v1, additive) — "Add the option to create a document template"
 * (Things-to-work-on.md), surfaced inside the Documents page's Categories tab. Standalone
 * entity, decoupled from HrDocument.category — see category-template-sheet.tsx.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import {
  CategoryTemplateEntryPoint,
  CategoryTemplateSheet,
} from "@/components/sections/documents/category-template-sheet";

const API = "http://localhost:3002/api";
const ENDPOINT = `${API}/hr/document-category-templates`;

const authState: { roles: string[] } = { roles: ["hr"] };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ roles: authState.roles, user: { name: "Test User" }, isAuthenticated: true }),
}));

afterEach(() => {
  cleanup();
  authState.roles = ["hr"];
});

const existingTemplate = {
  id: "tmpl-1",
  name: "Onboarding Materials",
  color: "green",
  category: null,
  header_text: "Welcome to GanzAfrica",
  description: null,
  titleColor: "#1a1a1a",
  borderStyle: "NONE",
  logoUrl: "",
  logoPosition: "TOP_LEFT",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

/** Simulates a template row from before the branding fields existed — the API always returns
 * them (DB defaults backfill), but a stale cached object might still omit them. */
const legacyTemplateNoBranding = {
  id: "tmpl-legacy",
  name: "Legacy Category",
  color: "orange",
  header_text: null,
  description: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

function mockList(templates: unknown[] = []) {
  server.use(http.get(ENDPOINT, () => HttpResponse.json({ success: true, data: templates })));
}

describe("CategoryTemplateEntryPoint", () => {
  it("opens the sheet on click and shows an empty state with no templates", async () => {
    mockList([]);
    renderWithClient(<CategoryTemplateEntryPoint />);

    await userEvent.click(screen.getByTestId("design-template-entry"));
    expect(await screen.findByText("Document Category Templates")).toBeInTheDocument();
    expect(await screen.findByText("No category templates yet.")).toBeInTheDocument();
  });

  it("lists an existing template with its color badge", async () => {
    mockList([existingTemplate]);
    renderWithClient(<CategoryTemplateEntryPoint />);

    await userEvent.click(screen.getByTestId("design-template-entry"));
    const row = await screen.findByTestId("category-template-row-Onboarding Materials");
    expect(within(row).getByText("Green")).toBeInTheDocument();
  });
});

describe("CategoryTemplateSheet — create", () => {
  it("creates a template with a selected color and shows it after refetch", async () => {
    mockList([]);
    let created: Record<string, unknown> | null = null;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        mockList([{ ...existingTemplate, id: "tmpl-new", ...created }]);
        return HttpResponse.json(
          { success: true, data: { ...existingTemplate, id: "tmpl-new", ...created } },
          { status: 201 },
        );
      }),
    );

    const onOpenChange = vi.fn();
    renderWithClient(<CategoryTemplateSheet open onOpenChange={onOpenChange} />);

    await userEvent.click(await screen.findByTestId("new-category-template"));
    await userEvent.type(
      screen.getByPlaceholderText("e.g. Onboarding Materials"),
      "Compliance & Legal",
    );
    await userEvent.click(screen.getByTestId("color-swatch-blue"));
    await userEvent.click(screen.getByTestId("save-category-template"));

    await screen.findByText("Compliance & Legal");
    expect(created).toMatchObject({ name: "Compliance & Legal", color: "blue" });
  });

  it("defaults to the green swatch selected", async () => {
    mockList([]);
    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);

    await userEvent.click(await screen.findByTestId("new-category-template"));
    expect(screen.getByTestId("color-swatch-green")).toHaveAttribute("aria-checked", "true");
    expect(screen.getByTestId("color-swatch-orange")).toHaveAttribute("aria-checked", "false");
  });

  it("rejects submitting with an empty name and does not call the API", async () => {
    mockList([]);
    let posted = false;
    server.use(http.post(ENDPOINT, () => ((posted = true), HttpResponse.json({}))));

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    await userEvent.click(await screen.findByTestId("new-category-template"));
    await userEvent.click(screen.getByTestId("save-category-template"));

    expect(posted).toBe(false);
    expect(screen.getByTestId("category-template-form")).toBeInTheDocument();
  });

  it("accepts optional header text and description input", async () => {
    mockList([]);
    let created: Record<string, unknown> | null = null;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { success: true, data: { ...existingTemplate, ...created } },
          { status: 201 },
        );
      }),
    );

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    await userEvent.click(await screen.findByTestId("new-category-template"));
    await userEvent.type(
      screen.getByPlaceholderText("e.g. Onboarding Materials"),
      "Forms & Applications",
    );
    await userEvent.type(
      screen.getByPlaceholderText(/shown at the top/i),
      "Please fill in every field",
    );
    await userEvent.type(
      screen.getByPlaceholderText("Optional notes about this template"),
      "Used for intake forms",
    );
    await userEvent.click(screen.getByTestId("save-category-template"));

    await waitFor(() =>
      expect(created).toMatchObject({
        header_text: "Please fill in every field",
        description: "Used for intake forms",
      }),
    );
  });
});

describe("CategoryTemplateSheet — edit and delete", () => {
  it("pre-fills the form when editing and updates via PATCH", async () => {
    mockList([existingTemplate]);
    let patched: Record<string, unknown> | null = null;
    server.use(
      http.patch(`${ENDPOINT}/tmpl-1`, async ({ request }) => {
        patched = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: { ...existingTemplate, ...patched },
        });
      }),
    );

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    const row = await screen.findByTestId("category-template-row-Onboarding Materials");

    // First icon button in the row is edit (Pencil), second is delete (Trash2).
    const buttons = within(row).getAllByRole("button");
    await userEvent.click(buttons[0]);

    expect(screen.getByDisplayValue("Onboarding Materials")).toBeInTheDocument();
    expect(screen.getByTestId("color-swatch-green")).toHaveAttribute("aria-checked", "true");

    await userEvent.click(screen.getByTestId("color-swatch-orange"));
    await userEvent.click(screen.getByTestId("save-category-template"));

    await waitFor(() => expect(patched).toMatchObject({ color: "orange" }));
  });

  it("deletes a template after confirmation", async () => {
    mockList([existingTemplate]);
    let deleted = false;
    server.use(
      http.delete(`${ENDPOINT}/tmpl-1`, () => {
        deleted = true;
        return HttpResponse.json({ success: true });
      }),
    );
    vi.spyOn(window, "confirm").mockReturnValue(true);

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    const row = await screen.findByTestId("category-template-row-Onboarding Materials");
    const buttons = within(row).getAllByRole("button");
    await userEvent.click(buttons[1]); // Trash icon button

    expect(deleted).toBe(true);
  });

  it("skips deletion when the confirmation is declined", async () => {
    mockList([existingTemplate]);
    let deleted = false;
    server.use(
      http.delete(`${ENDPOINT}/tmpl-1`, () => {
        deleted = true;
        return HttpResponse.json({ success: true });
      }),
    );
    vi.spyOn(window, "confirm").mockReturnValue(false);

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    const row = await screen.findByTestId("category-template-row-Onboarding Materials");
    const buttons = within(row).getAllByRole("button");
    await userEvent.click(buttons[1]);

    expect(deleted).toBe(false);
  });
});

describe("CategoryTemplateSheet — branding", () => {
  it("defaults the branding controls and preview when creating a new template", async () => {
    mockList([]);
    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);

    await userEvent.click(await screen.findByTestId("new-category-template"));

    expect(screen.getByTestId("title-color-text")).toHaveValue("#1a1a1a");
    expect(screen.getByTestId("border-style-select")).toHaveTextContent("No border");
    expect(screen.getByTestId("logo-file-dropzone")).toHaveTextContent("Upload a logo image");
    expect(screen.getByTestId("logo-position-select")).toHaveTextContent("Top left");
    expect(screen.getByTestId("template-category-select")).toHaveTextContent(
      "Any category (universal)",
    );

    const preview = screen.getByTestId("document-branding-preview");
    expect(within(preview).getByTestId("preview-title")).toHaveStyle({ color: "#1a1a1a" });
    // The fixed brand-green bottom rule is always present, independent of any user setting.
    expect(within(preview).getByTestId("preview-bottom-rule")).toBeInTheDocument();
  });

  it("submits the category and title/border/logo-position branding fields on create", async () => {
    mockList([]);
    let created: Record<string, unknown> | null = null;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { success: true, data: { ...existingTemplate, id: "tmpl-new", ...created } },
          { status: 201 },
        );
      }),
    );

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    await userEvent.click(await screen.findByTestId("new-category-template"));
    await userEvent.type(screen.getByPlaceholderText("e.g. Onboarding Materials"), "Branded Cat");

    await userEvent.click(screen.getByTestId("template-category-select"));
    await userEvent.click(await screen.findByRole("option", { name: "Training Materials" }));

    const titleColorText = screen.getByTestId("title-color-text");
    await userEvent.clear(titleColorText);
    await userEvent.type(titleColorText, "#ff00aa");

    await userEvent.click(screen.getByTestId("border-style-select"));
    await userEvent.click(await screen.findByRole("option", { name: "Accent border" }));

    await userEvent.click(screen.getByTestId("logo-position-select"));
    await userEvent.click(await screen.findByRole("option", { name: "Bottom left" }));

    await userEvent.click(screen.getByTestId("save-category-template"));

    await waitFor(() =>
      expect(created).toMatchObject({
        category: "Training Materials",
        titleColor: "#ff00aa",
        borderStyle: "ACCENT",
        logoPosition: "BOTTOM_LEFT",
      }),
    );
  });

  it("uploads a logo file and submits it as a data: URI", async () => {
    mockList([]);
    let created: Record<string, unknown> | null = null;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { success: true, data: { ...existingTemplate, id: "tmpl-new", ...created } },
          { status: 201 },
        );
      }),
    );

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    await userEvent.click(await screen.findByTestId("new-category-template"));
    await userEvent.type(screen.getByPlaceholderText("e.g. Onboarding Materials"), "Logo Test");

    const file = new File(["fake-png-bytes"], "logo.png", { type: "image/png" });
    await userEvent.upload(screen.getByTestId("logo-file-input"), file);

    expect(await screen.findByText(/logo selected/i)).toBeInTheDocument();

    await userEvent.click(screen.getByTestId("save-category-template"));

    await waitFor(() => expect(created).not.toBeNull());
    expect(created!.logoUrl).toMatch(/^data:/);
  });

  it("rejects a logo file over the size cap without calling the API", async () => {
    mockList([]);
    let posted = false;
    server.use(http.post(ENDPOINT, () => ((posted = true), HttpResponse.json({}))));

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    await userEvent.click(await screen.findByTestId("new-category-template"));

    const tooBig = new File([new Uint8Array(250 * 1024)], "big.png", { type: "image/png" });
    await userEvent.upload(screen.getByTestId("logo-file-input"), tooBig);

    // Rejected before it ever reaches form state — the dropzone stays in its empty state.
    await waitFor(() =>
      expect(screen.getByTestId("logo-file-dropzone")).toHaveTextContent("Upload a logo image"),
    );
    await userEvent.click(screen.getByTestId("save-category-template"));
    expect(posted).toBe(false);
  });

  it("rejects an invalid hex title color without calling the API", async () => {
    mockList([]);
    let posted = false;
    server.use(http.post(ENDPOINT, () => ((posted = true), HttpResponse.json({}))));

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    await userEvent.click(await screen.findByTestId("new-category-template"));
    await userEvent.type(screen.getByPlaceholderText("e.g. Onboarding Materials"), "Bad Color");

    const titleColorText = screen.getByTestId("title-color-text");
    await userEvent.clear(titleColorText);
    await userEvent.type(titleColorText, "not-a-color");

    await userEvent.click(screen.getByTestId("save-category-template"));

    expect(posted).toBe(false);
  });

  it("pre-fills branding controls, including a logo preview thumbnail, when editing an existing branded template", async () => {
    mockList([
      {
        ...existingTemplate,
        category: "Onboarding Materials",
        titleColor: "#00aabb",
        borderStyle: "DOUBLE",
        logoUrl: "https://example.com/l.png",
        logoPosition: "BOTTOM_LEFT",
      },
    ]);
    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);

    const row = await screen.findByTestId("category-template-row-Onboarding Materials");
    const buttons = within(row).getAllByRole("button");
    await userEvent.click(buttons[0]); // edit

    expect(screen.getByTestId("template-category-select")).toHaveTextContent(
      "Onboarding Materials",
    );
    expect(screen.getByTestId("title-color-text")).toHaveValue("#00aabb");
    expect(screen.getByTestId("border-style-select")).toHaveTextContent("Double line");
    expect(screen.getByTestId("logo-file-dropzone")).toHaveTextContent(/logo selected/i);
    expect(screen.getByAltText("Logo preview")).toHaveAttribute("src", "https://example.com/l.png");
    expect(screen.getByTestId("logo-position-select")).toHaveTextContent("Bottom left");
  });

  it("falls back to branding defaults when editing a template that predates the branding fields", async () => {
    mockList([legacyTemplateNoBranding]);
    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);

    const row = await screen.findByTestId("category-template-row-Legacy Category");
    const buttons = within(row).getAllByRole("button");
    await userEvent.click(buttons[0]); // edit

    expect(screen.getByTestId("template-category-select")).toHaveTextContent(
      "Any category (universal)",
    );
    expect(screen.getByTestId("title-color-text")).toHaveValue("#1a1a1a");
    expect(screen.getByTestId("border-style-select")).toHaveTextContent("No border");
    expect(screen.getByTestId("logo-file-dropzone")).toHaveTextContent("Upload a logo image");
    expect(screen.getByTestId("logo-position-select")).toHaveTextContent("Top left");
    // Renders without crashing and without a logo image, since logoUrl is absent.
    expect(screen.getByTestId("document-branding-preview")).toBeInTheDocument();
  });
});

describe("CategoryTemplateSheet — category", () => {
  it("submits with no category (universal) by default", async () => {
    mockList([]);
    let created: Record<string, unknown> | null = null;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          { success: true, data: { ...existingTemplate, id: "tmpl-new", ...created } },
          { status: 201 },
        );
      }),
    );

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    await userEvent.click(await screen.findByTestId("new-category-template"));
    await userEvent.type(
      screen.getByPlaceholderText("e.g. Onboarding Materials"),
      "Universal Tmpl",
    );
    await userEvent.click(screen.getByTestId("save-category-template"));

    await waitFor(() => expect(created).not.toBeNull());
    expect(created!.category).toBeNull();
  });

  it("shows a template's category (or Universal) in the list", async () => {
    mockList([{ ...existingTemplate, category: "Compliance & Legal" }]);
    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);

    const row = await screen.findByTestId("category-template-row-Onboarding Materials");
    expect(within(row).getByText("Compliance & Legal")).toBeInTheDocument();
  });

  it("shows Universal for a template with no category", async () => {
    mockList([existingTemplate]);
    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);

    const row = await screen.findByTestId("category-template-row-Onboarding Materials");
    expect(within(row).getByText("Universal")).toBeInTheDocument();
  });
});

describe("CategoryTemplateSheet — permissions", () => {
  it("hides the New Template button and row actions for a non-manager (employee)", async () => {
    authState.roles = ["employee"];
    mockList([existingTemplate]);

    renderWithClient(<CategoryTemplateSheet open onOpenChange={vi.fn()} />);
    const row = await screen.findByTestId("category-template-row-Onboarding Materials");
    expect(within(row).queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryByTestId("new-category-template")).not.toBeInTheDocument();
  });
});
