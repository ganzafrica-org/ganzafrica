import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { DocumentBrandingPreview } from "@/components/sections/documents/document-branding-preview";

afterEach(cleanup);

const base = {
  headerText: "Employee Handbook",
  titleColor: "#1a1a1a",
  borderStyle: "NONE" as const,
  logoUrl: "",
  logoPosition: "TOP_LEFT" as const,
};

describe("DocumentBrandingPreview", () => {
  it("colors the title and the rule beneath it with titleColor", () => {
    render(<DocumentBrandingPreview {...base} titleColor="#ff00aa" />);
    expect(screen.getByTestId("preview-title")).toHaveStyle({ color: "#ff00aa" });
  });

  it("falls back to the default accent when titleColor is empty", () => {
    render(<DocumentBrandingPreview {...base} titleColor="" />);
    expect(screen.getByTestId("preview-title")).toHaveStyle({ color: "#1a1a1a" });
  });

  it("renders no outer border for NONE", () => {
    render(<DocumentBrandingPreview {...base} borderStyle="NONE" />);
    expect(screen.getByTestId("document-branding-preview")).toHaveStyle({ borderStyle: "none" });
  });

  it("renders an accent-colored border for ACCENT, matching titleColor", () => {
    render(<DocumentBrandingPreview {...base} borderStyle="ACCENT" titleColor="#00aabb" />);
    const el = screen.getByTestId("document-branding-preview") as HTMLElement;
    expect(el.style.border).toContain("rgb(0, 170, 187)");
  });

  it("always renders the fixed brand-green bottom rule, regardless of other settings", () => {
    render(<DocumentBrandingPreview {...base} titleColor="#ff00aa" borderStyle="DOUBLE" />);
    expect(screen.getByTestId("preview-bottom-rule")).toHaveStyle({
      backgroundColor: "#1f5c4a",
    });
  });

  it("renders the logo before the content for TOP_LEFT", () => {
    render(
      <DocumentBrandingPreview
        {...base}
        logoUrl="https://example.com/logo.png"
        logoPosition="TOP_LEFT"
      />,
    );
    const img = screen.getByAltText("Document logo");
    const title = screen.getByTestId("preview-title");
    // TOP_LEFT: logo appears earlier in the DOM than the title/content.
    expect(img.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the logo after all content for BOTTOM_LEFT", () => {
    render(
      <DocumentBrandingPreview
        {...base}
        logoUrl="https://example.com/logo.png"
        logoPosition="BOTTOM_LEFT"
      />,
    );
    const img = screen.getByAltText("Document logo");
    const title = screen.getByTestId("preview-title");
    // BOTTOM_LEFT: logo appears later in the DOM than the title/content.
    expect(title.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders no logo image when logoUrl is empty", () => {
    render(<DocumentBrandingPreview {...base} logoUrl="" />);
    expect(screen.queryByAltText("Document logo")).not.toBeInTheDocument();
  });

  it("renders without crashing when given only the required (defaulted) props of a legacy template", () => {
    render(
      <DocumentBrandingPreview
        headerText=""
        titleColor="#1a1a1a"
        borderStyle="NONE"
        logoUrl=""
        logoPosition="TOP_LEFT"
      />,
    );
    expect(screen.getByTestId("document-branding-preview")).toBeInTheDocument();
    expect(screen.getByTestId("preview-title")).toHaveTextContent("Document Title");
  });
});
