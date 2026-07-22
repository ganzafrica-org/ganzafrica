"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useReviewers, useNotes, useReviewMutations } from "@/hooks/useRecruitment";

/**
 * REC-06 Review tab: assign cross-department reviewers and record interview notes / grading — the
 * documentation trail that justifies advancing a candidate.
 */
export function ReviewTab({
  applicationId,
  currentStage,
}: {
  applicationId: number;
  currentStage: string;
}) {
  const { data: reviewers } = useReviewers(applicationId);
  const { data: notes } = useNotes(applicationId);
  const m = useReviewMutations(applicationId);

  const [reviewerId, setReviewerId] = useState("");
  const [reviewerRole, setReviewerRole] = useState("");
  const [note, setNote] = useState("");
  const [rating, setRating] = useState<string>("");

  return (
    <div className="space-y-6 py-2">
      <section data-testid="reviewers">
        <h4 className="mb-2 text-xs uppercase tracking-wide text-slate-400">Reviewers</h4>
        <ul className="space-y-1">
          {(reviewers ?? []).map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded border px-2 py-1 text-sm"
            >
              <span>
                {r.name}
                {r.role && <span className="ml-2 text-xs text-slate-400">{r.role}</span>}
              </span>
              <button
                aria-label={`Remove ${r.name}`}
                onClick={() => m.removeReviewer.mutate(r.reviewer_user_id)}
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </li>
          ))}
          {(reviewers ?? []).length === 0 && (
            <li className="text-sm text-slate-500">No reviewers assigned.</li>
          )}
        </ul>
        <div className="mt-2 flex gap-2">
          <Input
            aria-label="Reviewer user id"
            placeholder="User ID"
            className="w-24"
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
          />
          <Input
            aria-label="Reviewer role"
            placeholder="Role (optional)"
            value={reviewerRole}
            onChange={(e) => setReviewerRole(e.target.value)}
          />
          <Button
            size="sm"
            disabled={!reviewerId || m.assignReviewer.isPending}
            onClick={() =>
              m.assignReviewer.mutate(
                { reviewer_user_id: Number(reviewerId), role: reviewerRole || undefined },
                {
                  onSuccess: () => {
                    setReviewerId("");
                    setReviewerRole("");
                  },
                },
              )
            }
          >
            Assign
          </Button>
        </div>
      </section>

      <section data-testid="notes">
        <h4 className="mb-2 text-xs uppercase tracking-wide text-slate-400">Interview notes</h4>
        <ul className="space-y-2">
          {(notes ?? []).map((n) => (
            <li key={n.id} className="rounded border p-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700">{n.author_name}</span>
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <Badge variant="secondary" className="capitalize">
                    {n.stage}
                  </Badge>
                  {n.rating != null && <span>★ {n.rating}/5</span>}
                </span>
              </div>
              <p className="mt-1 text-slate-600">{n.note}</p>
            </li>
          ))}
          {(notes ?? []).length === 0 && <li className="text-sm text-slate-500">No notes yet.</li>}
        </ul>
        <div className="mt-2 space-y-2">
          <Textarea
            aria-label="New note"
            placeholder="Your assessment…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <Input
              aria-label="Rating 1-5"
              type="number"
              min={1}
              max={5}
              placeholder="Rating"
              className="w-24"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <Button
              size="sm"
              disabled={!note.trim() || m.addNote.isPending}
              onClick={() =>
                m.addNote.mutate(
                  {
                    stage: currentStage,
                    note: note.trim(),
                    rating: rating ? Number(rating) : undefined,
                  },
                  {
                    onSuccess: () => {
                      setNote("");
                      setRating("");
                    },
                  },
                )
              }
            >
              Add note
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
