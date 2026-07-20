"use client";

/**
 * REC-01 public dynamic application form. Renders the published form definition (standard section
 * first, then custom sections by order), runs client-side eligibility live (blur/change) for
 * instant feedback, and on submit calls eligibility-check (server truth) before apply. A server 422
 * renders identically to a client-side rejection.
 *
 * The conditional `has_work_permit` field appears only when residence != work country.
 */
import { useEffect, useMemo, useState } from "react";
import { evaluate, type EligibilityRule, type FailedRule } from "@/lib/recruitment/eligibility";
import type { FormDefinition, FormField } from "@/lib/recruitment/form-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

type Answers = Record<string, unknown>;

interface PublicFormResponse {
  form: { version: number; definition: FormDefinition };
  rules: EligibilityRule[];
}

type Phase = "loading" | "deadline_passed" | "not_found" | "ready" | "submitted";

export interface DynamicApplicationFormProps {
  opportunityId: number | string;
  applicationDeadline?: string; // ISO date; if past, the form is closed
}

function isDeadlinePassed(deadline?: string): boolean {
  if (!deadline) return false;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return false;
  // Compare on UTC date only.
  const today = new Date();
  return (
    d.getTime() <
    new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).getTime()
  );
}

/** The permit field is only shown when residence and work country are both set and differ. */
function permitVisible(answers: Answers): boolean {
  const res = answers["country_of_residence"];
  const work = answers["country_of_work"];
  return Boolean(res) && Boolean(work) && res !== work;
}

export function DynamicApplicationForm({
  opportunityId,
  applicationDeadline,
}: DynamicApplicationFormProps) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [definition, setDefinition] = useState<FormDefinition | null>(null);
  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [failed, setFailed] = useState<FailedRule[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDeadlinePassed(applicationDeadline)) {
      setPhase("deadline_passed");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/opportunities/${opportunityId}/form`);
        if (res.status === 404) {
          if (!cancelled) setPhase("not_found");
          return;
        }
        const data = (await res.json()) as PublicFormResponse;
        if (cancelled) return;
        setDefinition(data.form.definition);
        setRules(data.rules ?? []);
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("not_found");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [opportunityId, applicationDeadline]);

  const orderedFields = useMemo(() => {
    if (!definition) return [];
    const all = [...definition.standard, ...definition.custom];
    return all
      .filter((f) => (f.key === "has_work_permit" ? permitVisible(answers) : true))
      .sort((a, b) => a.order - b.order);
  }, [definition, answers]);

  const sections = useMemo(() => {
    const map = new Map<string, FormField[]>();
    for (const f of orderedFields) {
      if (!map.has(f.section)) map.set(f.section, []);
      map.get(f.section)!.push(f);
    }
    return [...map.entries()];
  }, [orderedFields]);

  function setAnswer(key: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  /** Live client-side re-check (server remains authoritative at submit). */
  function recheck(next: Answers) {
    const result = evaluate(rules, next);
    setFailed(result.eligible ? [] : result.failed);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Server truth: eligibility-check, then apply. A 422 from apply renders like a client reject.
    setSubmitting(true);
    try {
      const check = await fetch(`${API_URL}/opportunities/${opportunityId}/eligibility-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const checkBody = await check.json();
      if (checkBody?.eligible === false) {
        setFailed(checkBody.failed ?? []);
        return;
      }

      const apply = await fetch(`${API_URL}/opportunities/${opportunityId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      if (apply.status === 422) {
        const body = await apply.json();
        setFailed(body.failed ?? []);
        return;
      }
      if (!apply.ok) {
        const body = await apply.json().catch(() => ({}));
        setError(body.message || "Failed to submit your application. Please try again.");
        return;
      }
      const body = await apply.json();
      setReference(body.application?.id ?? null);
      setPhase("submitted");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto max-w-2xl animate-pulse space-y-4 p-6" aria-busy="true">
        <div className="h-8 w-1/2 rounded bg-slate-200" />
        <div className="h-12 rounded bg-slate-200" />
        <div className="h-12 rounded bg-slate-200" />
        <div className="h-12 rounded bg-slate-200" />
      </div>
    );
  }

  if (phase === "deadline_passed") {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Applications are closed</h2>
        <p className="mt-2 text-slate-600">The deadline for this opportunity has passed.</p>
      </div>
    );
  }

  if (phase === "not_found") {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">No application form available</h2>
        <p className="mt-2 text-slate-600">This opportunity is not accepting applications yet.</p>
      </div>
    );
  }

  if (phase === "submitted") {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center">
        <h2 className="text-2xl font-semibold text-green-700">Application submitted</h2>
        <p className="mt-2 text-slate-600">
          Thank you for applying.
          {reference != null && (
            <>
              {" "}
              Your application reference is <strong>#{reference}</strong>.
            </>
          )}
        </p>
      </div>
    );
  }

  const blocked = failed.length > 0;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-8 p-6" noValidate>
      {sections.map(([section, fields]) => (
        <fieldset key={section} className="space-y-4">
          <legend className="text-lg font-semibold text-slate-900">{section}</legend>
          {fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={answers[f.key]}
              onChange={(v) => setAnswer(f.key, v)}
              onBlur={() => recheck({ ...answers })}
            />
          ))}
        </fieldset>
      ))}

      {blocked && (
        <div role="alert" className="rounded-md border border-red-300 bg-red-50 p-4">
          {failed.map((r, i) => (
            <p key={i} className="text-sm font-medium text-red-800">
              {r.reject_message}
            </p>
          ))}
          <p className="mt-2 text-sm text-red-700">You can still review your answers.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting || blocked}
        className="rounded-md bg-green-700 px-6 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

interface FieldProps {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
  onBlur: () => void;
}

function Field({ field, value, onChange, onBlur }: FieldProps) {
  const id = `field-${field.key}`;
  const label = (
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {field.label}
      {field.required && <span className="text-red-600"> *</span>}
    </label>
  );
  const base =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none";

  switch (field.type) {
    case "textarea":
      return (
        <div>
          {label}
          <textarea
            id={id}
            className={base}
            maxLength={field.max_length}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        </div>
      );
    case "boolean":
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
          />
          <label htmlFor={id} className="text-sm font-medium text-slate-700">
            {field.label}
          </label>
        </div>
      );
    case "select":
      return (
        <div>
          {label}
          <select
            id={id}
            className={base}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          >
            <option value="">Select…</option>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
      );
    case "number":
      return (
        <div>
          {label}
          <input
            id={id}
            type="number"
            className={base}
            value={value == null ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
            onBlur={onBlur}
          />
        </div>
      );
    case "date":
      return (
        <div>
          {label}
          <input
            id={id}
            type="date"
            className={base}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        </div>
      );
    case "file":
      return (
        <div>
          {label}
          <input
            id={id}
            type="file"
            className={base}
            onChange={(e) => onChange(e.target.files?.[0]?.name ?? null)}
            onBlur={onBlur}
          />
        </div>
      );
    default:
      return (
        <div>
          {label}
          <input
            id={id}
            type="text"
            className={base}
            maxLength={field.max_length}
            value={String(value ?? "")}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
          />
        </div>
      );
  }
}

export default DynamicApplicationForm;
