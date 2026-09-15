"use client";

import type {
  DocumentCategoryTemplateBorderStyle,
  DocumentCategoryTemplateLogoPosition,
} from "@/types/api";
import {
  BRAND_BOTTOM_RULE_COLOR,
  borderStyleToCss,
  effectiveTitleColor,
  logoRendersBeforeContent,
} from "@/lib/helpers/document-branding";

interface DocumentBrandingPreviewProps {
  headerText: string;
  titleColor: string;
  borderStyle: DocumentCategoryTemplateBorderStyle;
  logoUrl: string;
  logoPosition: DocumentCategoryTemplateLogoPosition;
}

/** Live mockup of what a document in this category will look like with the current branding
 * settings — shown inline in the design template sheet as the user edits the four fields.
 * Rendering logic (border/title-color/logo placement) lives in document-branding.ts so a future
 * PDF-generation pass can reuse the same rules instead of re-deriving them. */
export function DocumentBrandingPreview({
  headerText,
  titleColor,
  borderStyle,
  logoUrl,
  logoPosition,
}: DocumentBrandingPreviewProps) {
  const accent = effectiveTitleColor(titleColor);
  const hasLogo = logoUrl.trim().length > 0;
  const logoBeforeContent = logoRendersBeforeContent(logoPosition);

  const logo = hasLogo ? (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary external/data: URL, not a Next static asset
    <img
      src={logoUrl}
      alt="Document logo"
      className="h-8 max-w-[120px] object-contain"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ) : null;

  return (
    <div
      data-testid="document-branding-preview"
      className="overflow-hidden rounded-md bg-white"
      style={{ border: borderStyleToCss(borderStyle, titleColor) }}
    >
      <div className="space-y-4 p-5">
        {logoBeforeContent && logo}

        <div>
          <h3 className="text-base font-bold" style={{ color: accent }} data-testid="preview-title">
            {headerText.trim() || "Document Title"}
          </h3>
          <div className="mt-1.5 h-[2px] w-full" style={{ backgroundColor: accent }} />
        </div>

        <div className="space-y-1.5">
          <div className="h-2 w-full rounded bg-slate-100" />
          <div className="h-2 w-full rounded bg-slate-100" />
          <div className="h-2 w-3/4 rounded bg-slate-100" />
        </div>

        {!logoBeforeContent && (
          <div className="space-y-2 border-t border-dashed border-slate-200 pt-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Signature / sign-off area
            </p>
            {logo}
          </div>
        )}
      </div>

      {/* Always present, independent of borderStyle/titleColor — not user-configurable. */}
      <div
        className="h-[3px] w-full"
        style={{ backgroundColor: BRAND_BOTTOM_RULE_COLOR }}
        data-testid="preview-bottom-rule"
      />
    </div>
  );
}
