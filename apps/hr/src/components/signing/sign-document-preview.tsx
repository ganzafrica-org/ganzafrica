"use client";

import { FileWarning, Loader2 } from "lucide-react";
import { useSignatureDocument } from "@/hooks/useSigning";

interface Props {
  requestId: number;
  title: string;
}

/**
 * The base document a signer should read before filling in fields — shared by both sign dialogs
 * (TaskSignDialog and the standalone /signing page's SignDialog), since it's the same fetch +
 * render either way, unlike the field-rendering form those two intentionally keep as separate
 * copies.
 */
export function SignDocumentPreview({ requestId, title }: Props) {
  const { data: url, isLoading, isError } = useSignatureDocument(requestId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading document…
      </div>
    );
  }

  if (isError || !url) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
        <FileWarning className="h-5 w-5 text-slate-400" />
        <p className="text-xs text-slate-500">
          {isError
            ? "Couldn't load the document."
            : "No document file is attached to this template — only the fields below."}
        </p>
      </div>
    );
  }

  return (
    <iframe
      src={url}
      title={title}
      className="h-72 w-full rounded-lg border border-slate-200 bg-white"
    />
  );
}
