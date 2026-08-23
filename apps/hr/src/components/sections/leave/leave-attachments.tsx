"use client";

import { useEffect, useState } from "react";
import { Paperclip } from "lucide-react";
import { DocumentViewer } from "@/components/sections/documents/document-viewer";
import { useLeaveAttachments } from "@/hooks/useLeaveBalances";
import { documentsService } from "@/services/documents.service";
import type { HrDocument } from "@/types/api";

interface Props {
  leaveId: string;
}

/**
 * Renders nothing when a leave request has no attachments — they're optional, so an
 * attachment-free request must look exactly like it did before this feature existed. Each
 * attachment opens inline via the same DocumentViewer used everywhere else documents are
 * previewed (the Documents Sheet, contract agreements) rather than a second, leave-specific
 * viewer.
 */
export function LeaveAttachments({ leaveId }: Props) {
  const { data: attachments } = useLeaveAttachments(leaveId);
  const [openId, setOpenId] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<HrDocument | null>(null);

  useEffect(() => {
    if (!openId) {
      setOpenDoc(null);
      return;
    }
    documentsService
      .getDocument(openId)
      .then(setOpenDoc)
      .catch(() => setOpenDoc(null));
  }, [openId]);

  if (!attachments?.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Attachments</p>
      <ul className="space-y-1">
        {attachments.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => setOpenId((current) => (current === a.id ? null : a.id))}
              className="flex items-center gap-1.5 text-sm text-brand-accent hover:underline"
            >
              <Paperclip className="h-3.5 w-3.5 shrink-0" />
              {a.document_name}
            </button>
          </li>
        ))}
      </ul>
      {openDoc && (
        <div className="mt-2 h-72 overflow-hidden rounded-lg border">
          <DocumentViewer document={openDoc} />
        </div>
      )}
    </div>
  );
}
