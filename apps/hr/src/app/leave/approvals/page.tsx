"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Check, Inbox, X } from "lucide-react";
import { usePendingApprovals, useDecideLeave } from "@/hooks/useLeaveBalances";
import type { LeaveRequest } from "@/services/leave-balances.service";

const TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
  UNPAID: "Unpaid",
  OTHER: "Other",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function ApprovalsPage() {
  const { data: leaves = [], isLoading, isError } = usePendingApprovals();
  const decide = useDecideLeave();

  const [rejecting, setRejecting] = useState<LeaveRequest | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  async function approve(leave: LeaveRequest) {
    await decide.mutateAsync({ id: leave.id, decision: "approve" });
  }

  async function confirmReject() {
    if (!note.trim()) {
      setNoteError("A note is required when rejecting.");
      return;
    }
    await decide.mutateAsync({ id: rejecting!.id, decision: "reject", note });
    setRejecting(null);
    setNote("");
    setNoteError(null);
  }

  return (
    <div className="flex w-full flex-col gap-6 p-0">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Leave approvals</h1>
        <p className="text-sm text-muted-foreground">
          Requests from people who report to you. HR sees every pending request.
        </p>
      </div>

      {isLoading && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center text-muted-foreground">Loading…</CardContent>
        </Card>
      )}

      {isError && (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center text-red-500">
            Failed to load approvals. Please try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && leaves.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
            <Inbox className="size-8 text-slate-300" />
            <p className="font-medium text-slate-900">Nothing waiting on you</p>
            <p className="text-sm text-muted-foreground">
              Approved and rejected requests stay on the employee&apos;s history.
            </p>
          </CardContent>
        </Card>
      )}

      {leaves.map((leave) => (
        <Card key={leave.id} className="shadow-sm">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{TYPE_LABELS[leave.type] ?? leave.type}</Badge>
                <span className="text-sm font-medium text-slate-900">
                  {leave.days ?? "—"} working day{Number(leave.days) === 1 ? "" : "s"}
                </span>
              </div>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" />
                {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
              </p>
              {leave.reason && <p className="text-sm text-slate-600">{leave.reason}</p>}
            </div>

            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejecting(leave);
                  setNote("");
                  setNoteError(null);
                }}
                disabled={decide.isPending}
              >
                <X className="mr-1.5 size-4" /> Reject
              </Button>
              <Button onClick={() => approve(leave)} disabled={decide.isPending}>
                <Check className="mr-1.5 size-4" /> Approve
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={rejecting != null} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject this request</DialogTitle>
            <DialogDescription>
              The note is shared with the requester, so explain the decision.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setNoteError(null);
            }}
            placeholder="e.g. We need coverage that week — could you shift to the following one?"
            rows={4}
          />
          {noteError && <p className="text-sm text-red-600">{noteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReject} disabled={decide.isPending}>
              Reject request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
