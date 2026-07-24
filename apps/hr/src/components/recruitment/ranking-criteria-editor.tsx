"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRankingCriteria, useRankingMutations } from "@/hooks/useRecruitment";

/**
 * REC-07 CV ranking criteria editor. HR defines weighted keywords; applications' CVs are scored
 * against them (ATS-style) so reviewers can filter/sort. "Re-score" recomputes existing applications
 * after criteria change.
 */
export function RankingCriteriaEditor({ opportunityId }: { opportunityId: number }) {
  const { data: criteria } = useRankingCriteria(opportunityId);
  const m = useRankingMutations(opportunityId);
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [weight, setWeight] = useState("1");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid="ranking-editor-trigger">
          CV ranking
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>CV ranking keywords</DialogTitle>
        </DialogHeader>

        <ul className="space-y-1">
          {(criteria ?? []).map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded border px-2 py-1 text-sm"
            >
              <span>
                {c.keyword} <Badge variant="secondary">×{Number(c.weight)}</Badge>
              </span>
              <button aria-label={`Remove ${c.keyword}`} onClick={() => m.remove.mutate(c.id)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </li>
          ))}
          {(criteria ?? []).length === 0 && (
            <li className="text-sm text-slate-500">No keywords yet.</li>
          )}
        </ul>

        <div className="flex gap-2">
          <Input
            aria-label="Keyword"
            placeholder="e.g. Python"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Input
            aria-label="Weight"
            type="number"
            min={1}
            className="w-20"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <Button
            size="sm"
            disabled={!keyword.trim() || m.create.isPending}
            onClick={() =>
              m.create.mutate(
                { keyword: keyword.trim(), weight: Number(weight) || 1 },
                { onSuccess: () => setKeyword("") },
              )
            }
          >
            Add
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={m.rescore.isPending}
          onClick={() =>
            m.rescore.mutate(undefined, {
              onSuccess: (r) => toast({ title: `Re-scored ${r.scored} application(s)` }),
            })
          }
        >
          Re-score applications
        </Button>
      </DialogContent>
    </Dialog>
  );
}
