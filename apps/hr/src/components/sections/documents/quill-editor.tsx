"use client";

import { useEffect, useRef } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  /** Initial HTML content — seeded once on mount only; Quill owns the content after that
   *  (a controlled `value` prop would fight the editor's own selection/undo state). */
  initialValue?: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ color: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link"],
  ["clean"],
];

/** Minimal controlled-ish wrapper around Quill — no react-quill dependency (React 19 peer-dep
 *  friction), just Quill itself mounted on a plain div ref.
 *
 * Quill touches `document`/`window` as soon as its module is evaluated, which crashes Next.js's
 * server render of this ("use client") component ("document is not defined") — App Router still
 * renders client components on the server for the initial HTML. Loading it via a dynamic
 * `import()` inside `useEffect` keeps that evaluation entirely client-side, effects never run
 * during SSR. */
export function QuillEditor({ initialValue, onChange, placeholder }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;
    const editorEl = document.createElement("div");
    container.appendChild(editorEl);

    import("quill").then(({ default: Quill }) => {
      if (cancelled) return;
      const quill = new Quill(editorEl, {
        theme: "snow",
        placeholder,
        modules: { toolbar: TOOLBAR },
      });
      // Registered before the initial paste so a pre-filled initialValue's own text-change event
      // (fired synchronously by dangerouslyPasteHTML) reaches the caller too — not just edits made
      // after mount.
      quill.on("text-change", () => onChangeRef.current(quill.root.innerHTML));
      if (initialValue) quill.clipboard.dangerouslyPasteHTML(initialValue);
    });

    return () => {
      cancelled = true;
      container.replaceChildren();
    };
    // Mounts Quill exactly once; initialValue only matters for that first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      data-testid="quill-editor"
      className="[&_.ql-container]:min-h-[320px] [&_.ql-editor]:min-h-[320px] [&_.ql-editor]:text-sm"
    />
  );
}
