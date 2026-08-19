"use client";

import { CheckCircle2, CircleDashed, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSignatureSequence } from "@/hooks/useSigning";
import type { SequenceSigner } from "@/services/signing.service";

const STATUS_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; className: string }
> = {
  signed: { icon: CheckCircle2, label: "Signed", className: "text-emerald-600" },
  sent: { icon: Clock, label: "Awaiting signature", className: "text-amber-600" },
  draft: { icon: CircleDashed, label: "Waiting for turn", className: "text-slate-400" },
  declined: { icon: XCircle, label: "Declined", className: "text-red-600" },
  voided: { icon: XCircle, label: "Voided", className: "text-slate-400" },
  expired: { icon: XCircle, label: "Expired", className: "text-slate-400" },
};

interface Props {
  /** e.g. "contract" */
  refKind: string;
  /** The contract id (or other ref). Nothing renders until this exists. */
  refId: string | null;
  /** compact: one badge ("Waiting on X" / "Fully executed") for a task card or contract row.
   *  full: per-signer breakdown, for the contract tab and the Sign page's list. */
  variant?: "compact" | "full";
}

/**
 * Reusable across the onboarding task card, the contract tab, and the Sign page — all three
 * render the same signer sequence, just at different levels of detail. Ownership is enforced
 * server-side (HR/admin see any sequence; anyone else only one they're a signer on), so this
 * renders correctly for both an HR viewer and the employee looking at their own contract.
 */
export function ContractSigningStatus({ refKind, refId, variant = "full" }: Props) {
  const { data: signers, isLoading } = useSignatureSequence(refKind, refId);

  if (!refId) {
    return <p className="text-xs text-muted-foreground">No contract linked yet.</p>;
  }
  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading signature status…</p>;
  }
  if (!signers || signers.length === 0) {
    return <p className="text-xs text-muted-foreground">Not yet sent for signature.</p>;
  }

  const ordered = [...signers].sort((a, b) => a.sequence_no - b.sequence_no);
  const fullyExecuted = ordered.every((s) => s.status === "signed");

  if (variant === "compact") {
    if (fullyExecuted) {
      return <Badge className="bg-emerald-100 text-emerald-800">Fully executed</Badge>;
    }
    const current = ordered.find((s) => s.status !== "signed");
    return (
      <Badge variant="outline">
        {current
          ? `Waiting on ${current.signer_name ?? `signer ${current.sequence_no}`}`
          : "In progress"}
      </Badge>
    );
  }

  return (
    <div className="space-y-1.5">
      {fullyExecuted && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="size-3.5" /> Fully executed
        </p>
      )}
      {ordered.map((signer) => (
        <SignerRow key={signer.id} signer={signer} />
      ))}
    </div>
  );
}

function SignerRow({ signer }: { signer: SequenceSigner }) {
  const meta = STATUS_META[signer.status] ?? STATUS_META.draft;
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className={`size-3.5 shrink-0 ${meta.className}`} />
      <span className="font-medium text-slate-700">
        {signer.signer_name ?? `Signer ${signer.sequence_no}`}
      </span>
      <span className={meta.className}>{meta.label}</span>
    </div>
  );
}
