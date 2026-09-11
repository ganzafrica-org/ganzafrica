import type {
  DocumentCategoryTemplateBorderStyle,
  DocumentCategoryTemplateLogoPosition,
} from "@/types/api";

/** Column default in the DB — used as the fallback when a titleColor value is missing/falsy. */
export const DEFAULT_TITLE_COLOR = "#1a1a1a";

/** Fixed brand green for the bottom rule every branded document gets — never user-configurable. */
export const BRAND_BOTTOM_RULE_COLOR = "#1f5c4a";

export const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/;

export function isValidTitleColor(value: string): boolean {
  return HEX_COLOR_RE.test(value);
}

export function isValidLogoUrl(value: string): boolean {
  return value === "" || value.startsWith("https://") || value.startsWith("data:");
}

/** Client-side cap on a picked logo file, before base64 encoding — keeps the stored data: URI
 *  (roughly 4/3 the raw size) comfortably under the backend's logoUrl length limit. */
export const MAX_LOGO_FILE_BYTES = 200 * 1024;

/** Reads a picked file into a data: URI — what a template's logoUrl actually stores once "upload
 *  a logo" replaces pasting a hosted URL. Rejects anything over MAX_LOGO_FILE_BYTES up front. */
export function readFileAsDataUrl(file: File): Promise<string> {
  if (file.size > MAX_LOGO_FILE_BYTES) {
    return Promise.reject(
      new Error(`Logo must be smaller than ${Math.round(MAX_LOGO_FILE_BYTES / 1024)}KB`),
    );
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read the logo file"));
    reader.readAsDataURL(file);
  });
}

/** titleColor falls back to the default accent whenever it's missing/invalid (e.g. a template
 * row from before this feature existed, or an in-flight form value that hasn't been fixed yet). */
export function effectiveTitleColor(titleColor: string | null | undefined): string {
  return titleColor && isValidTitleColor(titleColor) ? titleColor : DEFAULT_TITLE_COLOR;
}

/** CSS `border` shorthand for the outer page container, per the branding spec:
 * NONE = none, SIMPLE = 1.5pt solid, DOUBLE = 4pt double, ACCENT = 2.5pt solid in titleColor. */
export function borderStyleToCss(
  borderStyle: DocumentCategoryTemplateBorderStyle,
  titleColor: string | null | undefined,
): string {
  const accent = effectiveTitleColor(titleColor);
  switch (borderStyle) {
    case "SIMPLE":
      return "1.5pt solid #94a3b8";
    case "DOUBLE":
      return "4pt double #94a3b8";
    case "ACCENT":
      return `2.5pt solid ${accent}`;
    case "NONE":
    default:
      return "none";
  }
}

export function logoRendersBeforeContent(logoPosition: DocumentCategoryTemplateLogoPosition) {
  return logoPosition === "TOP_LEFT";
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface BrandedDocumentTemplate {
  titleColor: string;
  borderStyle: DocumentCategoryTemplateBorderStyle;
  logoUrl: string;
  logoPosition: DocumentCategoryTemplateLogoPosition;
}

/**
 * A standalone, self-styled HTML document combining a design template's branding with
 * Quill-authored body content — this is the file that actually gets uploaded when someone
 * creates a document by picking a template instead of uploading one. Self-contained (inline
 * styles, no external stylesheet) since it's later viewed through a sandboxed <iframe> with no
 * network access of its own (see DocumentViewer's "html" case).
 */
export function renderBrandedDocumentHtml(
  template: BrandedDocumentTemplate,
  title: string,
  bodyHtml: string,
): string {
  const accent = effectiveTitleColor(template.titleColor);
  const border = borderStyleToCss(template.borderStyle, template.titleColor);
  const logoBeforeContent = logoRendersBeforeContent(template.logoPosition);
  const logo = template.logoUrl.trim()
    ? `<img src="${escapeHtml(template.logoUrl.trim())}" alt="Logo" style="height:32px;max-width:160px;object-fit:contain;display:block;margin-bottom:16px;" />`
    : "";

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #1e293b; background: #f8fafc; }
  .page { border: ${border}; border-radius: 6px; overflow: hidden; background: #fff; max-width: 800px; margin: 0 auto; }
  .content { padding: 32px; }
  h1.doc-title { font-size: 20px; font-weight: 700; color: ${accent}; margin: 0 0 6px; }
  .rule { height: 2px; background: ${accent}; margin-bottom: 20px; }
  .signature-area { border-top: 1px dashed #cbd5e1; padding-top: 16px; margin-top: 24px; }
  .bottom-rule { height: 3px; background: ${BRAND_BOTTOM_RULE_COLOR}; }
</style>
</head>
<body>
  <div class="page">
    <div class="content">
      ${logoBeforeContent ? logo : ""}
      <h1 class="doc-title">${escapeHtml(title)}</h1>
      <div class="rule"></div>
      <div class="body">${bodyHtml}</div>
      ${!logoBeforeContent && logo ? `<div class="signature-area">${logo}</div>` : ""}
    </div>
    <div class="bottom-rule"></div>
  </div>
</body>
</html>`;
}
