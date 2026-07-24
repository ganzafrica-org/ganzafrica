"use client";

/**
 * Public document signing page (DOC-signing, external signer). Loads a signing request via a
 * secure token, renders its fillable fields, and captures the signature (a typed name + click).
 * The server records the audit trail (document hash + identity + timestamp + IP) — that is the
 * legally-defensible signature.
 */
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

type State = "loading" | "valid" | "signed" | "expired" | "not_found" | "done" | "error";
interface Field {
  key: string;
  label: string;
  type: "signature" | "text" | "date" | "checkbox";
  required: boolean;
}

export function SignDocument({ token }: { token: string }) {
  const [state, setState] = useState<State>("loading");
  const [subject, setSubject] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/sign/view/${token}`);
        if (res.status === 410) {
          const b = await res.json();
          setState(b.state === "signed" ? "signed" : "expired");
          return;
        }
        if (!res.ok) return setState("not_found");
        const b = await res.json();
        setSubject(b.request.subject);
        setFields(b.fields ?? []);
        setState("valid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  function missingRequired(): boolean {
    return fields.some((f) => f.required && !values[f.key]);
  }

  async function submit() {
    if (!agreed) {
      setError("Please confirm your intent to sign.");
      return;
    }
    if (missingRequired()) {
      setError("Please complete all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/sign/submit/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_values: values }),
      });
      if (res.status === 410) {
        const b = await res.json();
        setState(b.state === "signed" ? "signed" : "expired");
        return;
      }
      if (!res.ok) return setState("error");
      setState("done");
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-4 py-10">
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="rounded-t-xl bg-[#045F3C] px-6 py-5 text-center">
          <h1 className="text-xl font-bold text-white">GanzAfrica</h1>
        </div>
        <div className="p-6">
          {state === "loading" && <p className="text-slate-500">Loading…</p>}
          {state === "error" && <Msg t="Something went wrong" b="Please try again later." />}
          {state === "not_found" && <Msg t="Document not found" b="This link isn't valid." />}
          {state === "expired" && (
            <Msg t="This signing link has expired" b="Contact the sender to request a new one." />
          )}
          {state === "signed" && (
            <Msg t="Already signed" b="This document has already been signed." />
          )}
          {state === "done" && (
            <Msg t="Signed — thank you! ✓" b="A copy of the signed document has been recorded." />
          )}

          {state === "valid" && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">{subject}</h2>

              <div className="space-y-3">
                {fields.map((f) => (
                  <div key={f.key}>
                    <label
                      className="block text-sm font-medium text-slate-700"
                      htmlFor={`f-${f.key}`}
                    >
                      {f.label}
                      {f.required && <span className="text-red-600"> *</span>}
                    </label>
                    {f.type === "checkbox" ? (
                      <input
                        id={`f-${f.key}`}
                        type="checkbox"
                        checked={Boolean(values[f.key])}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.checked })}
                      />
                    ) : (
                      <input
                        id={`f-${f.key}`}
                        type={f.type === "date" ? "date" : "text"}
                        placeholder={
                          f.type === "signature" ? "Type your full name to sign" : undefined
                        }
                        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={String(values[f.key] ?? "")}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>

              <label className="flex items-start gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>I agree that signing this document electronically is legally binding.</span>
              </label>

              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                disabled={submitting}
                onClick={submit}
                className="w-full rounded-md bg-[#045F3C] px-4 py-2 font-medium text-white disabled:opacity-50"
              >
                {submitting ? "Signing…" : "Sign document"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Msg({ t, b }: { t: string; b: string }) {
  return (
    <div className="py-6 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{t}</h2>
      <p className="mt-2 text-slate-600">{b}</p>
    </div>
  );
}
