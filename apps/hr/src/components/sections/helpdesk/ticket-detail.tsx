"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Laptop, MessageSquare, RotateCcw, Send } from "lucide-react";
import { StatusBadge, PriorityBadge } from "./ticket-badges";
import {
  useTicket,
  useAddComment,
  useTransitionTicket,
  useReopenTicket,
} from "@/hooks/useHelpdesk";
import type { TicketPriority, TicketStatus } from "@/services/helpdesk.service";

const STATUSES: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const REOPEN_WINDOW_DAYS = 14;

function withinReopenWindow(resolvedAt: string | null): boolean {
  if (!resolvedAt) return false;
  const days = (Date.now() - new Date(resolvedAt).getTime()) / 86400_000;
  return days <= REOPEN_WINDOW_DAYS;
}

export function TicketDetail({ ticketId }: { ticketId: string }) {
  const { data, isLoading, isError } = useTicket(ticketId);
  const addComment = useAddComment();
  const transition = useTransitionTicket();
  const reopen = useReopenTicket();

  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  if (isError || !data) {
    return <p className="py-12 text-center text-red-500">Could not load this ticket.</p>;
  }

  const { ticket, comments, can_manage } = data;
  const canReopen = ticket.status === "RESOLVED" && withinReopenWindow(ticket.resolvedAt);

  async function onReply() {
    setError(null);
    try {
      await addComment.mutateAsync({ id: ticketId, body: reply });
      setReply("");
    } catch (e) {
      setError(msg(e, "Could not post the comment."));
    }
  }

  async function onStatus(status: TicketStatus) {
    setError(null);
    try {
      await transition.mutateAsync({ id: ticketId, status });
    } catch (e) {
      setError(msg(e, "Could not update the status."));
    }
  }

  async function onPriority(priority: TicketPriority) {
    await transition.mutateAsync({ id: ticketId, priority });
  }

  async function onReopen() {
    setError(null);
    try {
      await reopen.mutateAsync(ticketId);
    } catch (e) {
      setError(msg(e, "Could not reopen the ticket."));
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Card className="shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-slate-900">{ticket.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                  {ticket.category}
                </span>
                {ticket.source === "asset_issue" && (
                  <span className="flex items-center gap-1 rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                    <Laptop className="size-3" /> Asset issue
                  </span>
                )}
              </div>
            </div>

            {canReopen && (
              <Button variant="outline" onClick={onReopen} disabled={reopen.isPending}>
                <RotateCcw className="mr-1.5 size-4" /> Reopen
              </Button>
            )}
          </div>

          <p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>

          {can_manage && (
            <div className="flex flex-wrap gap-3 border-t pt-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Status</p>
                <Select value={ticket.status} onValueChange={(v) => onStatus(v as TicketStatus)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Priority</p>
                <Select
                  value={ticket.priority}
                  onValueChange={(v) => onPriority(v as TicketPriority)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">
                        {p.toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          <MessageSquare className="size-4" /> Conversation
        </h2>

        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
        {comments.map((c) => (
          <Card key={c.id} className="shadow-sm">
            <CardContent className="p-4">
              <p className="mb-1 text-xs text-muted-foreground">
                {new Date(c.created_at).toLocaleString()}
              </p>
              <p className="whitespace-pre-wrap text-sm text-slate-700">{c.body}</p>
            </CardContent>
          </Card>
        ))}

        {ticket.status !== "CLOSED" && (
          <div className="space-y-2">
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Add a reply…"
              rows={3}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end">
              <Button onClick={onReply} disabled={!reply.trim() || addComment.isPending}>
                <Send className="mr-1.5 size-4" /> Reply
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function msg(e: unknown, fallback: string): string {
  return (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}
