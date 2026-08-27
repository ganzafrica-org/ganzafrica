"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CalendarDays, Loader2, Upload } from "lucide-react";
import {
  useRequestLeave,
  useValidateLeave,
  useUploadLeaveAttachment,
} from "@/hooks/useLeaveBalances";
import type { LeaveTypeName, LeaveValidation } from "@/services/leave-balances.service";

const TYPES: { value: LeaveTypeName; label: string }[] = [
  { value: "ANNUAL", label: "Annual leave" },
  { value: "SICK", label: "Sick leave" },
  { value: "MATERNITY", label: "Maternity leave" },
  { value: "PATERNITY", label: "Paternity leave" },
  { value: "UNPAID", label: "Unpaid leave" },
  { value: "OTHER", label: "Other" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestLeaveDialog({ open, onOpenChange }: Props) {
  const [type, setType] = useState<LeaveTypeName>("ANNUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<LeaveValidation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = useValidateLeave();
  const submit = useRequestLeave();
  const uploadAttachment = useUploadLeaveAttachment();

  const rangeComplete = Boolean(startDate && endDate);

  // Preview the working-day count and remaining balance whenever the range settles.
  useEffect(() => {
    if (!open || !rangeComplete) {
      setPreview(null);
      return;
    }
    let cancelled = false;
    validate
      .mutateAsync({ type, startDate, endDate })
      .then((result) => {
        if (!cancelled) setPreview(result);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, type, startDate, endDate, rangeComplete]);

  useEffect(() => {
    if (open) return;
    setType("ANNUAL");
    setStartDate("");
    setEndDate("");
    setReason("");
    setAttachment(null);
    setPreview(null);
    setError(null);
  }, [open]);

  const blocked = preview != null && !preview.sufficient;
  const noWorkingDays = preview != null && preview.days === 0;

  async function onSubmit() {
    setError(null);
    try {
      const created = await submit.mutateAsync({
        type,
        startDate,
        endDate,
        reason: reason || undefined,
      });
      if (attachment) {
        // Best-effort: the request itself already succeeded, so a failed attachment upload
        // shouldn't be treated as a failed submission — the requester can add it later.
        await uploadAttachment
          .mutateAsync({ leaveId: created.id, file: attachment })
          .catch(() => {});
      }
      onOpenChange(false);
    } catch (e) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Could not submit the request.";
      setError(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request time off</DialogTitle>
          <DialogDescription>
            Weekends and public holidays are excluded from the day count.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leave-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LeaveTypeName)}>
              <SelectTrigger id="leave-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">First day</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Last day</Label>
              <Input
                id="end-date"
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {validate.isPending && rangeComplete && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Checking availability…
            </p>
          )}

          {preview && !validate.isPending && (
            <div
              className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                blocked || noWorkingDays
                  ? "border-amber-200 bg-amber-50 text-amber-900"
                  : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {blocked || noWorkingDays ? (
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              ) : (
                <CalendarDays className="mt-0.5 size-4 shrink-0" />
              )}
              <div>
                <p className="font-medium">
                  {preview.days} working day{preview.days === 1 ? "" : "s"}
                </p>
                <p>
                  {noWorkingDays
                    ? "This range covers no working days."
                    : blocked
                      ? `Only ${preview.remaining} day(s) remaining — this exceeds your balance.`
                      : `${preview.remaining} day(s) remaining before this request.`}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="leave-reason">Reason</Label>
            <Textarea
              id="leave-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional context for your approver"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave-attachment">Attachment (optional)</Label>
            <label
              htmlFor="leave-attachment"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 shrink-0" />
              {attachment ? attachment.name : "Attach a supporting document (optional)…"}
              <input
                id="leave-attachment"
                type="file"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!rangeComplete || blocked || noWorkingDays || submit.isPending}
          >
            {submit.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
