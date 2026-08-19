"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { recruitmentService } from "@/services/recruitment.service";

/**
 * REC-06 "position filled" close-out. Enabled only once accepted offers >= target hires; notifies
 * every remaining non-terminal candidate and rejects them. Until the target is met the pool stays
 * live (HR can run more rounds), so the button explains why it's disabled.
 */
export function CloseOutButton({ opportunityId }: { opportunityId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(
    "This position has now been filled. Thank you for your interest.",
  );

  const { data: preview } = useQuery({
    queryKey: ["recruitment", "close-out", opportunityId],
    queryFn: () => recruitmentService.closeOutPreview(opportunityId),
  });

  const mutation = useMutation({
    mutationFn: () => recruitmentService.closeOut(opportunityId, reason),
    onSuccess: (res) => {
      toast.success(`Closed out ${res.closed} remaining candidate(s)`);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["recruitment", "applications"] });
      qc.invalidateQueries({ queryKey: ["recruitment", "close-out", opportunityId] });
    },
    onError: () => toast.danger("Couldn't close out"),
    meta: { silentError: true },
  });

  if (!preview) return null;

  const disabled = !preview.target_met || preview.remaining === 0;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        title={
          !preview.target_met
            ? `Reach ${preview.target_hires} accepted hire(s) first (${preview.accepted_offers} so far)`
            : preview.remaining === 0
              ? "No remaining candidates"
              : undefined
        }
        onClick={() => setOpen(true)}
        data-testid="close-out-button"
      >
        Close position ({preview.accepted_offers}/{preview.target_hires} hired)
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close this position?</DialogTitle>
            <DialogDescription>
              {preview.remaining} remaining candidate(s) will be moved to Rejected and emailed the
              message below.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            aria-label="Close-out message"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
              Close position & notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
