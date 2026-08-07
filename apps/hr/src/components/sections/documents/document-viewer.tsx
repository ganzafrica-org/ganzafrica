"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { AlertTriangle, Download, FileWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { documentsService } from "@/services/documents.service";
import type { HrDocument } from "@/types/api";

/**
 * Extension -> rendering strategy. Extensions come from the real stored filename (the S3 key's
 * basename via /view-url), not the user-typed document_name, which may have no extension at all.
 *
 * Covers every mimetype `middlewares/upload.ts` accepts for documents:
 * - pdf: native <iframe>.
 * - image: native <img>. TIFF is deliberately excluded — no mainstream browser renders it via
 *   <img> despite being an "image/*" mimetype, so it falls through to "unsupported" below.
 * - video: native <video> for the three containers browsers actually decode reliably. mov/avi/mkv
 *   are accepted uploads but codec support is too inconsistent to promise inline playback.
 * - office: Word/Excel/PowerPoint (both legacy binary and OOXML) via Microsoft's Office Online
 *   Viewer — see the comment on OFFICE_VIEWER_BASE for why this over Google Docs Viewer.
 * - csv: parsed client-side (papaparse) into a table.
 * - text: fetched and shown as preformatted text — plain text, JSON (pretty-printed when it
 *   parses), XML, CSS, JS all render fine this way.
 * - html: sandboxed <iframe> with scripts disabled — previews the markup without executing any
 *   embedded script from a user-uploaded file.
 * - unsupported: rtf, zip/rar/7z archives, ODF formats (odt/ods/odp), tiff, mov/avi/mkv, and
 *   generic octet-stream — no native browser support and no reliable embeddable viewer for these
 *   without adding a new heavy dependency, so they get the explicit fallback message.
 */
type RenderStrategy =
  | "pdf"
  | "image"
  | "video"
  | "office"
  | "csv"
  | "text"
  | "html"
  | "unsupported";

const EXTENSION_STRATEGY: Record<string, RenderStrategy> = {
  pdf: "pdf",
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  webp: "image",
  svg: "image",
  bmp: "image",
  ico: "image",
  mp4: "video",
  webm: "video",
  ogg: "video",
  ogv: "video",
  doc: "office",
  docx: "office",
  xls: "office",
  xlsx: "office",
  ppt: "office",
  pptx: "office",
  csv: "csv",
  txt: "text",
  json: "text",
  xml: "text",
  css: "text",
  js: "text",
  html: "html",
  htm: "html",
};

// Microsoft's free embeddable Office Online Viewer, chosen over Google Docs Viewer:
// - Purpose-built for exactly these three formats (Word/Excel/PowerPoint, legacy + OOXML),
//   whereas Google's viewer is a general-purpose fallback with patchier, less predictable
//   rendering for older .doc/.xls/.ppt.
// - Actively maintained by Microsoft for this exact embedding use case (it's what SharePoint/
//   OneDrive "public link preview" uses); Google's `docs.google.com/viewer?embedded=true` has
//   been reported increasingly unreliable for arbitrary third-party embedding in recent years.
// - Same integration shape either way (?src=<url>-only, no auth, no SDK) — no cost to switching
//   later if needed, so the choice isn't a lock-in risk.
// It requires `src` to be a URL Microsoft's servers can fetch with no further auth, which is
// exactly what a presigned S3/Spaces URL is.
const OFFICE_VIEWER_BASE = "https://view.officeapps.live.com/op/embed.aspx?src=";

function strategyFor(fileName: string): RenderStrategy {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_STRATEGY[ext] ?? "unsupported";
}

type ViewerState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      strategy: RenderStrategy;
      url: string;
      fileName: string;
      text?: string;
      truncated?: boolean;
    };

function FallbackNotice({ documentId, reason }: { documentId: string; reason: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
      <FileWarning className="h-8 w-8 text-slate-400" />
      <div>
        <p className="text-sm font-medium text-slate-700">Preview not available</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{reason}</p>
      </div>
      <Button asChild size="sm" variant="outline">
        <a
          href={documentsService.downloadUrl(documentId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Download instead
        </a>
      </Button>
    </div>
  );
}

function ErrorNotice({ documentId, message }: { documentId: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-400" />
      <div>
        <p className="text-sm font-medium text-red-700">Couldn&apos;t load preview</p>
        <p className="text-xs text-red-600 mt-1 max-w-sm">{message}</p>
      </div>
      <Button asChild size="sm" variant="outline">
        <a
          href={documentsService.downloadUrl(documentId)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="mr-2 h-3.5 w-3.5" />
          Download instead
        </a>
      </Button>
    </div>
  );
}

function CsvTable({ text, truncated }: { text: string; truncated?: boolean }) {
  const parsed = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
  const rows = parsed.data;
  const MAX_ROWS = 500;
  const [header, ...body] = rows;
  const shown = body.slice(0, MAX_ROWS);

  if (!header) {
    return <p className="text-sm text-slate-500 py-8 text-center">This file is empty.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="overflow-auto max-h-96 rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 sticky top-0">
            <tr>
              {header.map((cell, i) => (
                <th
                  key={i}
                  className="px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-200 whitespace-nowrap"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-100 last:border-0 even:bg-slate-50/50">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-1.5 whitespace-nowrap text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(body.length > MAX_ROWS || truncated) && (
        <p className="text-xs text-slate-500">
          {body.length > MAX_ROWS && `Showing the first ${MAX_ROWS} of ${body.length} rows. `}
          {truncated &&
            "The file is larger than the inline preview limit — download for the full file."}
        </p>
      )}
    </div>
  );
}

function TextView({
  fileName,
  text,
  truncated,
}: {
  fileName: string;
  text: string;
  truncated?: boolean;
}) {
  const isJson = fileName.toLowerCase().endsWith(".json");
  let display = text;
  if (isJson) {
    try {
      display = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      // not valid JSON (or truncated mid-object) — show the raw text instead
    }
  }
  return (
    <div className="space-y-2">
      <pre className="max-h-96 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-800 whitespace-pre-wrap break-words">
        {display}
      </pre>
      {truncated && (
        <p className="text-xs text-slate-500">
          Showing the first 2 MB of a larger file — download for the full file.
        </p>
      )}
    </div>
  );
}

interface DocumentViewerProps {
  document: HrDocument;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [state, setState] = useState<ViewerState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    (async () => {
      try {
        const { url, fileName } = await documentsService.getViewUrl(document.id);
        const strategy = strategyFor(fileName);

        if (strategy === "csv" || strategy === "text") {
          const content = await documentsService.getContent(document.id);
          if (cancelled) return;
          setState({
            status: "ready",
            strategy,
            url,
            fileName,
            text: content.text,
            truncated: content.truncated,
          });
          return;
        }

        if (cancelled) return;
        setState({ status: "ready", strategy, url, fileName });
      } catch (err: any) {
        if (cancelled) return;
        setState({
          status: "error",
          message:
            err?.response?.status === 403
              ? "You don't have permission to view this file."
              : "The file could not be reached. It may have been moved or removed.",
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [document.id]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <p className="text-xs text-slate-500">Loading preview…</p>
      </div>
    );
  }

  if (state.status === "error") {
    return <ErrorNotice documentId={document.id} message={state.message} />;
  }

  const { strategy, url } = state;

  switch (strategy) {
    case "pdf":
      return (
        <iframe
          src={url}
          title={document.document_name}
          className="w-full h-[520px] rounded-lg border border-slate-200 bg-white"
        />
      );

    case "image":
      return (
        <div className="flex justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote presigned URL, not a local asset */}
          <img
            src={url}
            alt={document.document_name}
            className="max-h-[520px] w-auto max-w-full rounded object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              e.currentTarget.parentElement?.insertAdjacentHTML(
                "beforeend",
                `<p class="text-sm text-red-600 py-8">Image failed to load.</p>`,
              );
            }}
          />
        </div>
      );

    case "video":
      return (
        <video
          src={url}
          controls
          className="w-full max-h-[520px] rounded-lg border border-slate-200 bg-black"
        >
          Your browser doesn&apos;t support inline video playback.
        </video>
      );

    case "office":
      return (
        <div className="space-y-1.5">
          <iframe
            src={`${OFFICE_VIEWER_BASE}${encodeURIComponent(url)}`}
            title={document.document_name}
            className="w-full h-[520px] rounded-lg border border-slate-200 bg-white"
          />
          <p className="text-xs text-slate-400">
            Previewed via Microsoft Office Online. Having trouble?{" "}
            <a
              href={documentsService.downloadUrl(document.id)}
              className="underline hover:text-slate-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download instead
            </a>
            .
          </p>
        </div>
      );

    case "html":
      return (
        <div className="space-y-1.5">
          {/* No allow-scripts: renders the markup but never executes an uploaded file's script. */}
          <iframe
            src={url}
            title={document.document_name}
            sandbox="allow-same-origin"
            className="w-full h-[520px] rounded-lg border border-slate-200 bg-white"
          />
          <p className="text-xs text-slate-400">Scripts are disabled in this preview for safety.</p>
        </div>
      );

    case "csv":
      return <CsvTable text={state.text ?? ""} truncated={state.truncated} />;

    case "text":
      return (
        <TextView fileName={state.fileName} text={state.text ?? ""} truncated={state.truncated} />
      );

    case "unsupported":
    default:
      return (
        <FallbackNotice
          documentId={document.id}
          reason="This file type can't be rendered in the browser and no reliable embeddable viewer covers it. Download it to view the original."
        />
      );
  }
}
