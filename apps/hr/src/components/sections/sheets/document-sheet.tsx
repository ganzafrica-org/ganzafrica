import React from "react";
import { RevisionEntry } from "@/types/revision";
import { RevisionHistoryTable } from "@/components/sections/sheets/revision-history-table";

interface DocumentSheetProps {
  documentName?: string;
  revisions: RevisionEntry[];
}

export const DocumentSheet = ({ documentName, revisions }: DocumentSheetProps) => {
  return (
    <div className="p-6 space-y-4">
      {documentName && (
        <p className="text-xs text-slate-500">
          Document: <span className="font-medium text-slate-700">{documentName}</span>
        </p>
      )}
      <RevisionHistoryTable revisions={revisions} />
    </div>
  );
};
