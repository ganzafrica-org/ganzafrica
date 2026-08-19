"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileSignature, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useMySignatures, useSignDocument } from "@/hooks/useSigning";
import { ContractSigningStatus } from "@/components/processes/contract-signing-status";
import type { MySignatureRequest, SignatureRequestStatus } from "@/services/signing.service";

const STATUS_STYLES: Record<SignatureRequestStatus, { label: string; className: string }> = {
  sent: { label: "Awaiting your signature", className: "bg-amber-100 text-amber-800" },
  signed: { label: "Signed", className: "bg-emerald-100 text-emerald-800" },
  declined: { label: "Declined", className: "bg-red-100 text-red-800" },
  voided: { label: "Voided", className: "bg-slate-100 text-slate-700" },
  expired: { label: "Expired", className: "bg-slate-100 text-slate-700" },
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700" },
};

export default function MySigningPage() {
  const { data: requests, isLoading, isError, refetch } = useMySignatures();
  const [active, setActive] = useState<MySignatureRequest | null>(null);

  const pending = useMemo(() => (requests ?? []).filter((r) => r.status === "sent"), [requests]);
  const history = useMemo(() => (requests ?? []).filter((r) => r.status !== "sent"), [requests]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <FileSignature className="h-6 w-6 text-[#045F3C]" />
          Documents to Sign
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and sign documents sent to you. Signing is legally binding and recorded with an
          audit trail.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <p className="text-slate-600">Couldn&apos;t load your documents.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Pending ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="text-slate-600">You&apos;re all caught up — nothing to sign.</p>
                </CardContent>
              </Card>
            ) : (
              pending.map((req) => (
                <RequestRow key={req.id} req={req} onSign={() => setActive(req)} />
              ))
            )}
          </section>

          {history.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                History
              </h2>
              {history.map((req) => (
                <RequestRow key={req.id} req={req} />
              ))}
            </section>
          )}
        </>
      )}

      <SignDialog request={active} onClose={() => setActive(null)} />
    </div>
  );
}

function RequestRow({ req, onSign }: { req: MySignatureRequest; onSign?: () => void }) {
  const status = STATUS_STYLES[req.status];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 py-4">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{req.subject}</CardTitle>
          <CardDescription className="mt-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {new Date(req.created_at).toLocaleDateString()}
          </CardDescription>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {req.ref_kind === "contract" && req.ref_id && (
            <ContractSigningStatus refKind={req.ref_kind} refId={req.ref_id} variant="compact" />
          )}
          <Badge className={status.className} variant="secondary">
            {status.label}
          </Badge>
          {onSign && (
            <Button size="sm" className="bg-[#045F3C] hover:bg-[#034d31]" onClick={onSign}>
              Review &amp; sign
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

function SignDialog({
  request,
  onClose,
}: {
  request: MySignatureRequest | null;
  onClose: () => void;
}) {
  const sign = useSignDocument();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset local state whenever a new request is opened.
  const openedId = request?.id ?? null;
  const [lastId, setLastId] = useState<number | null>(null);
  if (openedId !== lastId) {
    setLastId(openedId);
    setValues({});
    setAgreed(false);
    setError(null);
    sign.reset();
  }

  if (!request) return null;

  const missingRequired = request.fields.some((f) => f.required && !values[f.key]);

  async function submit() {
    if (!request) return;
    if (!agreed) return setError("Please confirm your intent to sign.");
    if (missingRequired) return setError("Please complete all required fields.");
    setError(null);
    try {
      await sign.mutateAsync({ id: request.id, fieldValues: values });
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={!!request} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{request.subject}</DialogTitle>
          <DialogDescription>
            Complete the fields below, then confirm to sign. Your signature is recorded with a
            timestamped audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {request.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`f-${f.key}`}>
                {f.label}
                {f.required && <span className="text-red-600"> *</span>}
              </Label>
              {f.type === "checkbox" ? (
                <Checkbox
                  id={`f-${f.key}`}
                  checked={Boolean(values[f.key])}
                  onCheckedChange={(v) => setValues((s) => ({ ...s, [f.key]: Boolean(v) }))}
                />
              ) : (
                <Input
                  id={`f-${f.key}`}
                  type={f.type === "date" ? "date" : "text"}
                  placeholder={f.type === "signature" ? "Type your full name to sign" : undefined}
                  value={String(values[f.key] ?? "")}
                  onChange={(e) => setValues((s) => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <label className="flex items-start gap-2 text-sm text-slate-600">
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
            <span>I agree that signing this document electronically is legally binding.</span>
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={sign.isPending}>
            Cancel
          </Button>
          <Button
            className="bg-[#045F3C] hover:bg-[#034d31]"
            onClick={submit}
            disabled={sign.isPending}
          >
            {sign.isPending ? "Signing…" : "Sign document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
