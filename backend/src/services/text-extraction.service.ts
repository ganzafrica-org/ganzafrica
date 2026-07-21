/**
 * Text extraction from uploaded files (REC-07 CV parsing + shared with document OCR/search).
 * Extracts machine-readable text from PDFs today; scanned-image OCR is a clearly-marked seam.
 *
 * Extraction is deliberately best-effort and side-effect free — callers run it out-of-band so a
 * slow or malformed file never blocks an upload or a submission.
 */
import { Logger } from "../config";

const logger = new Logger("TextExtraction");

// Lazy import keeps pdf-parse (which reads a test asset on import in some builds) out of the hot path.
async function pdfToText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default as (b: Buffer) => Promise<{ text: string }>;
  const result = await pdfParse(buffer);
  return result.text ?? "";
}

/** Normalize extracted text: collapse whitespace, lower-case (matching is case-insensitive). */
export function normalizeText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().toLowerCase();
}

export interface ExtractionResult {
  text: string; // normalized
  chars: number;
  ok: boolean;
}

/**
 * Extract normalized text from a file buffer. `contentType` selects the extractor. Unsupported or
 * failed extraction returns ok:false with empty text (never throws).
 */
export async function extractText(buffer: Buffer, contentType?: string): Promise<ExtractionResult> {
  try {
    let raw = "";
    if (contentType?.includes("pdf") || looksLikePdf(buffer)) {
      raw = await pdfToText(buffer);
    } else if (contentType?.startsWith("text/")) {
      raw = buffer.toString("utf8");
    } else if (contentType?.startsWith("image/")) {
      // OCR SEAM: scanned CVs / image documents. Wire an OCR provider (e.g. Tesseract worker or a
      // cloud OCR call) here; kept out of scope until image CVs are actually common. Returns empty
      // so callers degrade gracefully to "no keywords matched".
      logger.info("Image document received — OCR not wired; returning empty text");
      return { text: "", chars: 0, ok: false };
    } else {
      return { text: "", chars: 0, ok: false };
    }
    const text = normalizeText(raw);
    return { text, chars: text.length, ok: text.length > 0 };
  } catch (err) {
    logger.warn("Text extraction failed (non-fatal)", err as Error);
    return { text: "", chars: 0, ok: false };
  }
}

function looksLikePdf(buffer: Buffer): boolean {
  return buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-";
}
