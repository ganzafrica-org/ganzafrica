"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationName: string;
  onConfirm: (args: { reason: string; sendEmail: boolean }) => void | Promise<void>;
}

export function RejectDialog({
  open,
  onOpenChange,
  applicationName,
  onConfirm,
}: RejectDialogProps) {
  const [reason, setReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!reason.trim()) {
      setError("A rejection reason is required.");
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm({ reason: reason.trim(), sendEmail });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject {applicationName}</DialogTitle>
          <DialogDescription>
            This moves the application to Rejected. The reason is stored and, if you choose, emailed
            to the applicant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Shared with the applicant if the email is sent."
            />
            {error && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch id="reject-send-email" checked={sendEmail} onCheckedChange={setSendEmail} />
            <Label htmlFor="reject-send-email">Email the applicant</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={submitting} onClick={submit}>
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
