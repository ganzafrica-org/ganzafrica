import { describe, it, expect } from "vitest";
import {
  DEFAULT_TITLE_COLOR,
  BRAND_BOTTOM_RULE_COLOR,
  isValidTitleColor,
  isValidLogoUrl,
  effectiveTitleColor,
  borderStyleToCss,
  escapeHtml,
  renderBrandedDocumentHtml,
  type BrandedDocumentTemplate,
} from "@/lib/helpers/document-branding";

describe("isValidTitleColor", () => {
  it("accepts a 6-digit hex color", () => {
    expect(isValidTitleColor("#1a1a1a")).toBe(true);
    expect(isValidTitleColor("#FF00AA")).toBe(true);
  });

  it("rejects anything that isn't a 6-digit hex color", () => {
    expect(isValidTitleColor("red")).toBe(false);
    expect(isValidTitleColor("#fff")).toBe(false);
    expect(isValidTitleColor("1a1a1a")).toBe(false);
    expect(isValidTitleColor("")).toBe(false);
  });
});

describe("isValidLogoUrl", () => {
  it("accepts an empty string (no logo)", () => {
    expect(isValidLogoUrl("")).toBe(true);
  });

  it("accepts an absolute https:// URL", () => {
    expect(isValidLogoUrl("https://example.com/logo.png")).toBe(true);
  });

  it("accepts a data: URI", () => {
    expect(isValidLogoUrl("data:image/png;base64,abc123")).toBe(true);
  });

  it("rejects a relative path (won't resolve at server-side render time)", () => {
    expect(isValidLogoUrl("/uploads/logo.png")).toBe(false);
  });

  it("rejects a plain http:// URL", () => {
    expect(isValidLogoUrl("http://example.com/logo.png")).toBe(false);
  });
});

describe("effectiveTitleColor", () => {
  it("passes through a valid titleColor", () => {
    expect(effectiveTitleColor("#00aabb")).toBe("#00aabb");
  });

  it("falls back to the default accent when missing or invalid", () => {
    expect(effectiveTitleColor(null)).toBe(DEFAULT_TITLE_COLOR);
    expect(effectiveTitleColor(undefined)).toBe(DEFAULT_TITLE_COLOR);
    expect(effectiveTitleColor("")).toBe(DEFAULT_TITLE_COLOR);
    expect(effectiveTitleColor("not-a-color")).toBe(DEFAULT_TITLE_COLOR);
  });
});

describe("borderStyleToCss", () => {
  it("NONE has no border", () => {
    expect(borderStyleToCss("NONE", "#1a1a1a")).toBe("none");
  });

  it("SIMPLE is a 1.5pt solid line", () => {
    expect(borderStyleToCss("SIMPLE", "#1a1a1a")).toContain("1.5pt solid");
  });

  it("DOUBLE is a 4pt double line", () => {
    expect(borderStyleToCss("DOUBLE", "#1a1a1a")).toContain("4pt double");
  });

  it("ACCENT is a 2.5pt solid line in the effective title color", () => {
    expect(borderStyleToCss("ACCENT", "#ff00aa")).toBe("2.5pt solid #ff00aa");
  });

  it("ACCENT falls back to the default accent when titleColor is unset", () => {
    expect(borderStyleToCss("ACCENT", null)).toBe(`2.5pt solid ${DEFAULT_TITLE_COLOR}`);
  });
});

describe("BRAND_BOTTOM_RULE_COLOR", () => {
  it("is the fixed brand green, not user-configurable", () => {
    expect(BRAND_BOTTOM_RULE_COLOR).toBe("#1f5c4a");
  });
});

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<script>alert("hi")</script> & 'quote'`)).toBe(
      `&lt;script&gt;alert(&quot;hi&quot;)&lt;/script&gt; &amp; 'quote'`,
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Employment Agreement 2026")).toBe("Employment Agreement 2026");
  });
});

describe("renderBrandedDocumentHtml", () => {
  const baseTemplate: BrandedDocumentTemplate = {
    titleColor: "#1a1a1a",
    borderStyle: "NONE",
    logoUrl: "",
    logoPosition: "TOP_LEFT",
  };

  it("embeds the title and body content", () => {
    const html = renderBrandedDocumentHtml(baseTemplate, "Handbook", "<p>Welcome aboard.</p>");
    expect(html).toContain("Handbook");
    expect(html).toContain("<p>Welcome aboard.</p>");
  });

  it("colors the title and its rule with the template's titleColor", () => {
    const html = renderBrandedDocumentHtml(
      { ...baseTemplate, titleColor: "#ff00aa" },
      "Title",
      "<p>Body</p>",
    );
    expect(html).toContain("color: #ff00aa");
    expect(html).toContain("background: #ff00aa");
  });

  it("always includes the fixed brand-green bottom rule, independent of titleColor", () => {
    const html = renderBrandedDocumentHtml(
      { ...baseTemplate, titleColor: "#ff00aa" },
      "Title",
      "<p>Body</p>",
    );
    expect(html).toContain(`background: ${BRAND_BOTTOM_RULE_COLOR}`);
  });

  it("renders a logo image before the content for TOP_LEFT", () => {
    const html = renderBrandedDocumentHtml(
      { ...baseTemplate, logoUrl: "https://example.com/logo.png", logoPosition: "TOP_LEFT" },
      "Title",
      "<p>Body</p>",
    );
    const logoIndex = html.indexOf("<img");
    const titleIndex = html.indexOf('class="doc-title"');
    expect(logoIndex).toBeGreaterThan(-1);
    expect(logoIndex).toBeLessThan(titleIndex);
  });

  it("renders a logo image after the content, in a signature area, for BOTTOM_LEFT", () => {
    const html = renderBrandedDocumentHtml(
      { ...baseTemplate, logoUrl: "https://example.com/logo.png", logoPosition: "BOTTOM_LEFT" },
      "Title",
      "<p>Body</p>",
    );
    const bodyIndex = html.indexOf('class="body"');
    const logoIndex = html.indexOf("<img");
    expect(logoIndex).toBeGreaterThan(bodyIndex);
    expect(html).toContain("signature-area");
  });

  it("renders no <img> tag when logoUrl is empty", () => {
    const html = renderBrandedDocumentHtml(baseTemplate, "Title", "<p>Body</p>");
    expect(html).not.toContain("<img");
  });

  it("escapes the title (defense in depth, even though DocumentViewer sandboxes scripts)", () => {
    const html = renderBrandedDocumentHtml(
      baseTemplate,
      `<script>alert(1)</script>`,
      "<p>Body</p>",
    );
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("does not escape the Quill-authored body HTML (it's meant to render as markup)", () => {
    const html = renderBrandedDocumentHtml(baseTemplate, "Title", "<strong>bold</strong>");
    expect(html).toContain("<strong>bold</strong>");
  });
});
