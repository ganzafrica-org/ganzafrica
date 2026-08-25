"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSignDocument } from "@/hooks/useSigning";
import { SignDocumentPreview } from "@/components/signing/sign-document-preview";
import type { MySignatureRequest } from "@/services/signing.service";

interface Props {
  request: MySignatureRequest | null;
  onClose: () => void;
}

/**
 * Same signing flow as the standalone "Documents to Sign" page (app/signing/page.tsx's
 * SignDialog) — dynamic template fields, required-field + agree-checkbox validation, same
 * useSignDocument mutation — kept as its own copy here rather than importing that page's
 * internals so this onboarding-task surface doesn't reach into an unrelated route's file.
 */
export function TaskSignDialog({ request, onClose }: Props) {
  const sign = useSignDocument();
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <SignDocumentPreview requestId={request.id} title={request.subject} />

          {request.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`task-sign-${f.key}`}>
                {f.label}
                {f.required && <span className="text-red-600"> *</span>}
              </Label>
              {f.type === "checkbox" ? (
                <Checkbox
                  id={`task-sign-${f.key}`}
                  checked={Boolean(values[f.key])}
                  onCheckedChange={(v) => setValues((s) => ({ ...s, [f.key]: Boolean(v) }))}
                />
              ) : (
                <Input
                  id={`task-sign-${f.key}`}
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
          <Button onClick={submit} disabled={sign.isPending}>
            {sign.isPending ? "Signing…" : "Sign document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
