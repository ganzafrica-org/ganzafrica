"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/toast";
import { useApplicationOffer, useOfferMutations } from "@/hooks/useRecruitment";
import type { CreateOfferPayload } from "@/services/recruitment.service";

const EMPLOYMENT_TYPES = ["fellow", "analyst", "staff", "contractor", "intern"] as const;

export function OfferTab({ applicationId }: { applicationId: number }) {
  const { data: offer, isLoading } = useApplicationOffer(applicationId);
  const m = useOfferMutations(applicationId);

  const [draft, setDraft] = useState<CreateOfferPayload>({
    position_title: "",
    employment_type: "analyst",
    start_date: "",
  });
  const [letterKey, setLetterKey] = useState("");

  if (isLoading) return <p className="py-3 text-sm text-slate-500">Loading offer…</p>;

  // No offer yet — creation form.
  if (!offer) {
    return (
      <div className="space-y-3 py-2" data-testid="offer-create">
        <p className="text-sm text-slate-500">No offer yet. Create one to start.</p>
        <div>
          <Label htmlFor="pos">Position title</Label>
          <Input
            id="pos"
            value={draft.position_title}
            onChange={(e) => setDraft({ ...draft, position_title: e.target.value })}
          />
        </div>
        <div>
          <Label>Employment type</Label>
          <Select
            value={draft.employment_type}
            onValueChange={(v) =>
              setDraft({ ...draft, employment_type: v as CreateOfferPayload["employment_type"] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="start">Start date</Label>
          <Input
            id="start"
            type="date"
            value={draft.start_date ?? ""}
            onChange={(e) => setDraft({ ...draft, start_date: e.target.value })}
          />
        </div>
        <Button
          disabled={m.create.isPending || !draft.position_title}
          onClick={() =>
            m.create.mutate(draft, {
              onError: () => toast.danger("Couldn't create offer"),
            })
          }
        >
          Create draft offer
        </Button>
      </div>
    );
  }

  // Offer exists — status + actions.
  const isDraft = offer.status === "draft";
  const isSent = offer.status === "sent";

  return (
    <div className="space-y-4 py-2" data-testid="offer-detail">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-slate-800">{offer.position_title}</p>
          <p className="text-xs text-slate-500 capitalize">{offer.employment_type}</p>
        </div>
        <Badge
          variant={offer.status === "accepted" ? "default" : "secondary"}
          className="capitalize"
        >
          {offer.status}
        </Badge>
      </div>

      {offer.decline_reason && (
        <p className="text-sm text-red-600">Declined: {offer.decline_reason}</p>
      )}

      {isDraft && (
        <div className="space-y-3 rounded-md border p-3">
          <div>
            <Label htmlFor="letter">Offer letter file key</Label>
            <Input
              id="letter"
              placeholder="offers/letter.pdf"
              value={letterKey || offer.letter_file_key || ""}
              onChange={(e) => setLetterKey(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={m.setLetter.isPending || !letterKey}
              onClick={() => m.setLetter.mutate({ offerId: offer.id, key: letterKey })}
            >
              Attach letter
            </Button>
            <Button
              size="sm"
              disabled={m.send.isPending || !offer.letter_file_key || !offer.start_date}
              onClick={() =>
                m.send.mutate(offer.id, {
                  onSuccess: () => toast.success("Offer sent to the candidate"),
                  onError: () => toast.danger("Attach a letter and start date first"),
                })
              }
            >
              Send offer
            </Button>
          </div>
        </div>
      )}

      {isSent && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">
            Sent {offer.sent_at ? new Date(offer.sent_at).toLocaleDateString() : ""}
            {offer.expires_at
              ? ` · expires ${new Date(offer.expires_at).toLocaleDateString()}`
              : ""}
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={m.withdraw.isPending}
            onClick={() => m.withdraw.mutate(offer.id)}
          >
            Withdraw offer
          </Button>
        </div>
      )}
    </div>
  );
}
