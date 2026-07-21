"use client";

/**
 * Public offer acceptance page (REC-05). Views the offer via a secure token, lets the candidate
 * accept or decline. Decline asks an optional reason; both confirm. Decided/expired render honest
 * states. The acceptance click is the signature for now (audit trail is server-side).
 */
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

type State =
  | "loading"
  | "valid"
  | "decided"
  | "expired"
  | "not_found"
  | "accepted"
  | "declined"
  | "error";

interface OfferSummary {
  position_title: string;
  employment_type: string;
  department?: string | null;
  start_date?: string | null;
  gross_salary?: string | null;
  currency?: string;
  additional_terms?: string | null;
  opportunity_title?: string;
}

export function OfferResponder({ token }: { token: string }) {
  const [state, setState] = useState<State>("loading");
  const [offer, setOffer] = useState<OfferSummary | null>(null);
  const [letterUrl, setLetterUrl] = useState<string | null>(null);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/offers/view/${token}`);
        if (res.status === 410) {
          const body = await res.json();
          setState(body.state === "decided" ? "decided" : "expired");
          return;
        }
        if (!res.ok) {
          setState("not_found");
          return;
        }
        const body = await res.json();
        setOffer(body.offer);
        setLetterUrl(body.letter_url ?? null);
        setState("valid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  async function respond(decision: "accept" | "decline") {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/offers/respond/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision,
          decline_reason: decision === "decline" ? reason : undefined,
        }),
      });
      if (res.status === 410) {
        const body = await res.json();
        setState(body.state === "decided" ? "decided" : "expired");
        return;
      }
      if (!res.ok) {
        setState("error");
        return;
      }
      setState(decision === "accept" ? "accepted" : "declined");
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
          {state === "loading" && <Skeleton />}
          {state === "error" && (
            <Message title="Something went wrong" body="Please try again later." />
          )}
          {state === "not_found" && (
            <Message title="Offer not found" body="This link isn't valid." />
          )}
          {state === "expired" && (
            <Message
              title="This offer link has expired"
              body="Please contact the recruitment team if you believe this is a mistake."
            />
          )}
          {state === "decided" && (
            <Message
              title="This offer has already been responded to"
              body="No further action is needed."
            />
          )}
          {state === "accepted" && (
            <Message
              title="Welcome to GanzAfrica! 🎉"
              body="Thank you for accepting. Check your email to set up your account and begin onboarding."
            />
          )}
          {state === "declined" && (
            <Message
              title="Your response has been recorded"
              body="Thank you for letting us know."
            />
          )}

          {state === "valid" && offer && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-slate-900">Your offer</h2>
                <p className="text-slate-500">{offer.opportunity_title ?? offer.position_title}</p>
              </div>

              <dl className="divide-y rounded-lg border">
                <Field label="Position" value={offer.position_title} />
                <Field label="Type" value={offer.employment_type} />
                {offer.department && <Field label="Department" value={offer.department} />}
                {offer.start_date && <Field label="Start date" value={offer.start_date} />}
                {offer.gross_salary && (
                  <Field
                    label="Compensation"
                    value={`${offer.gross_salary} ${offer.currency ?? ""}`.trim()}
                  />
                )}
                {offer.additional_terms && (
                  <Field label="Additional terms" value={offer.additional_terms} />
                )}
              </dl>

              {letterUrl && (
                <a
                  href={letterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-sm font-medium text-[#045F3C] underline"
                >
                  View offer letter (PDF)
                </a>
              )}

              {!declining ? (
                <div className="flex gap-3">
                  <button
                    disabled={submitting}
                    onClick={() => respond("accept")}
                    className="flex-1 rounded-md bg-[#045F3C] px-4 py-2 font-medium text-white disabled:opacity-50"
                  >
                    Accept offer
                  </button>
                  <button
                    disabled={submitting}
                    onClick={() => setDeclining(true)}
                    className="flex-1 rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">
                    Reason (optional)
                    <textarea
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      disabled={submitting}
                      onClick={() => respond("decline")}
                      className="flex-1 rounded-md bg-red-600 px-4 py-2 font-medium text-white disabled:opacity-50"
                    >
                      Confirm decline
                    </button>
                    <button
                      disabled={submitting}
                      onClick={() => setDeclining(false)}
                      className="flex-1 rounded-md border border-slate-300 px-4 py-2 font-medium text-slate-700"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium capitalize text-slate-800">{value}</dd>
    </div>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-6 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-slate-600">{body}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="mx-auto h-6 w-40 rounded bg-slate-200" />
      <div className="h-32 rounded bg-slate-200" />
      <div className="h-10 rounded bg-slate-200" />
    </div>
  );
}
