"use client";

import { Download, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { documentsService } from "@/services/documents.service";
import { DocumentViewer } from "@/components/sections/documents/document-viewer";
import type { HrDocument } from "@/types/api";

interface DocumentDetailSheetProps {
  document: HrDocument;
}

function accessSummary(access: HrDocument["access"]): string[] {
  const chips: string[] = [];
  (access.roles ?? []).forEach((r) => chips.push(`role: ${r}`));
  (access.departments ?? []).forEach((d) => chips.push(`dept: ${d}`));
  (access.employee_ids ?? []).forEach((id) => chips.push(`employee: ${id.slice(0, 8)}…`));
  return chips.length ? chips : ["HR/admin only"];
}

export function DocumentDetailSheet({ document }: DocumentDetailSheetProps) {
  return (
    <div className="p-6 space-y-6">
      <DocumentViewer document={document} />

      <div className="grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <p className="text-xs text-slate-500">Category</p>
          <p className="font-medium">{document.category}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Department</p>
          <p className="font-medium">{document.department}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Version</p>
          <p className="font-medium">v{document.version}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Size</p>
          <p className="font-medium">{document.fileSize}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Downloads</p>
          <p className="font-medium">{document.downloads}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Created by</p>
          <p className="font-medium">{document.createdBy.fullName || "—"}</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-1">Description</p>
        <p className="text-sm text-slate-700">{document.description}</p>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">Access</p>
        <div className="flex flex-wrap gap-1.5">
          {accessSummary(document.access).map((chip) => (
            <Badge key={chip} variant="outline" className="capitalize">
              {chip}
            </Badge>
          ))}
        </div>
      </div>

      <Button asChild className="w-full bg-brand-accent text-white hover:bg-brand-accent/90">
        <a
          href={documentsService.downloadUrl(document.id)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="mr-2 h-4 w-4" />
          Download current version
        </a>
      </Button>

      {document.versions && document.versions.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" />
            Previous versions
          </p>
          <div className="space-y-1.5">
            {[...document.versions].reverse().map((v, i) => (
              <div
                key={`${v.key}-${i}`}
                className="flex items-center justify-between text-sm border border-slate-200 rounded-md px-3 py-2"
              >
                <span className="text-slate-700">v{v.version}</span>
                <span className="text-xs text-slate-400">
                  {new Date(v.uploaded_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
