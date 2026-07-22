"use client";

import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Flag } from "lucide-react";
import { useApplicationDetail, useCriteria, usePutScores } from "@/hooks/useRecruitment";
import { OfferTab } from "@/components/recruitment/offer-tab";
import { useMe } from "@/hooks/useEmployees";
import type { ApplicationDetail } from "@/services/recruitment.service";

export interface ApplicationDetailPanelProps {
  applicationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STANDARD_LABELS: Record<string, string> = {
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone: "Phone",
  date_of_birth: "Date of birth",
  country_of_residence: "Country of residence",
  country_of_work: "Country of work",
  has_work_permit: "Has work permit",
  city: "City",
  country: "Country",
  education_level: "Education level",
  field_of_study: "Field of study",
};

export function ApplicationDetailPanel({
  applicationId,
  open,
  onOpenChange,
}: ApplicationDetailPanelProps) {
  const { data, isLoading } = useApplicationDetail(open ? applicationId : null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {isLoading || !data ? (
          <div className="space-y-4 p-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <DetailBody data={data} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailBody({ data }: { data: ApplicationDetail }) {
  const app = data.application;
  const name = `${app.first_name ?? ""} ${app.last_name ?? ""}`.trim();

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          {name || "Applicant"}
          {app.flagged && <Flag className="h-4 w-4 text-amber-500" aria-label="Flagged" />}
        </SheetTitle>
        <SheetDescription className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {app.pipeline_stage}
          </Badge>
          {app.flag_note && <span className="text-xs text-amber-600">{app.flag_note}</span>}
        </SheetDescription>
      </SheetHeader>

      <Tabs defaultValue="profile" className="mt-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="answers">Answers</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
          <TabsTrigger value="offer">Offer</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab app={app} />
        </TabsContent>
        <TabsContent value="answers">
          <AnswersTab app={app} />
        </TabsContent>
        <TabsContent value="evaluation">
          <EvaluationTab data={data} />
        </TabsContent>
        <TabsContent value="offer">
          <OfferTab applicationId={app.id} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab data={data} />
        </TabsContent>
        <TabsContent value="emails">
          <EmailsTab data={data} />
        </TabsContent>
      </Tabs>
    </>
  );
}

function Row({ label, value }: { label: string; value: unknown }) {
  const display =
    typeof value === "boolean"
      ? value
        ? "Yes"
        : "No"
      : value == null || value === ""
        ? "—"
        : String(value);
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{display}</span>
    </div>
  );
}

function ProfileTab({ app }: { app: ApplicationDetail["application"] }) {
  const cvUrl = app.cv_url as string | undefined;
  return (
    <div className="space-y-1 py-2">
      {[
        "first_name",
        "last_name",
        "email",
        "phone",
        "city",
        "country",
        "education_level",
        "field_of_study",
      ].map((k) => (
        <Row key={k} label={STANDARD_LABELS[k] ?? k} value={(app as Record<string, unknown>)[k]} />
      ))}
      {cvUrl && (
        <a
          href={cvUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-blue-600 underline"
        >
          View CV
        </a>
      )}
    </div>
  );
}

/**
 * Answers renders the applicant's submitted values. Standard fields come straight off the row;
 * custom answers are keyed by the pinned form_version's field keys. Legacy rows (null form_version)
 * fall back to the fixed columns — never showing "unknown field".
 */
function AnswersTab({ app }: { app: ApplicationDetail["application"] }) {
  const custom = (app.custom_answers ?? {}) as Record<string, unknown>;
  const customKeys = Object.keys(custom);
  return (
    <div className="space-y-1 py-2">
      <p className="py-1 text-xs uppercase tracking-wide text-slate-400">
        Form version {app.form_version ?? "legacy"}
      </p>
      {["date_of_birth", "country_of_residence", "country_of_work", "has_work_permit"].map((k) => (
        <Row key={k} label={STANDARD_LABELS[k] ?? k} value={(app as Record<string, unknown>)[k]} />
      ))}
      {customKeys.length === 0 ? (
        <p className="py-2 text-sm text-slate-500">No additional answers.</p>
      ) : (
        customKeys.map((k) => <Row key={k} label={k.replace(/_/g, " ")} value={custom[k]} />)
      )}
    </div>
  );
}

function EvaluationTab({ data }: { data: ApplicationDetail }) {
  const app = data.application;
  const { data: me } = useMe();
  const myId = me ? Number((me as { id: string | number }).id) : null;
  const { data: criteria } = useCriteria(app.opportunity_id);
  const putScores = usePutScores();

  const myScores = useMemo(() => {
    const map: Record<number, number> = {};
    for (const s of data.scores)
      if (myId != null && s.reviewer_user_id === myId) map[s.criterion_id] = s.score;
    return map;
  }, [data.scores, myId]);

  const [draft, setDraft] = useState<Record<number, number>>({});
  const [total, setTotal] = useState<number | null>(null);

  const othersScores = data.scores.filter((s) => myId == null || s.reviewer_user_id !== myId);

  async function save() {
    if (!criteria) return;
    const scores = criteria
      .filter((c) => draft[c.id] != null || myScores[c.id] != null)
      .map((c) => ({ criterion_id: c.id, score: draft[c.id] ?? myScores[c.id] }));
    const res = await putScores.mutateAsync({ applicationId: app.id, scores });
    setTotal(res.weighted_total);
  }

  if (!criteria || criteria.length === 0) {
    return <p className="py-3 text-sm text-slate-500">No evaluation criteria defined.</p>;
  }

  return (
    <div className="space-y-3 py-2">
      {criteria.map((c) => (
        <div key={c.id} className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-800">{c.name}</p>
            <p className="text-xs text-slate-400">
              weight {Number(c.weight)} · max {c.max_score}
            </p>
          </div>
          <Input
            type="number"
            min={0}
            max={c.max_score}
            aria-label={`My score for ${c.name}`}
            className="w-20"
            defaultValue={myScores[c.id] ?? ""}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                [c.id]: e.target.value === "" ? (undefined as never) : Number(e.target.value),
              }))
            }
          />
        </div>
      ))}

      <Button size="sm" disabled={putScores.isPending} onClick={save}>
        Save my scores
      </Button>
      {total != null && (
        <p className="text-sm font-medium text-slate-700" data-testid="weighted-total">
          Weighted total: {total}
        </p>
      )}

      {othersScores.length > 0 && (
        <div className="mt-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Other reviewers</p>
          {othersScores.map((s) => (
            <div key={s.id} className="flex justify-between border-b py-1 text-sm text-slate-600">
              <span>Reviewer #{s.reviewer_user_id}</span>
              <span className="font-medium">{s.score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryTab({ data }: { data: ApplicationDetail }) {
  if (data.stage_events.length === 0)
    return <p className="py-3 text-sm text-slate-500">No history yet.</p>;
  return (
    <ol className="space-y-3 py-2">
      {data.stage_events.map((e) => (
        <li key={e.id} className="border-l-2 border-slate-200 pl-3 text-sm">
          <p className="font-medium capitalize text-slate-800">
            {e.from_stage ? `${e.from_stage} → ` : ""}
            {e.to_stage}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(e.created_at).toLocaleString()} ·{" "}
            {e.actor_user_id ? `by #${e.actor_user_id}` : "System"}
          </p>
          {e.note && <p className="text-xs text-slate-500">{e.note}</p>}
        </li>
      ))}
    </ol>
  );
}

function EmailsTab({ data }: { data: ApplicationDetail }) {
  if (data.emails.length === 0)
    return <p className="py-3 text-sm text-slate-500">No emails sent.</p>;
  return (
    <ul className="space-y-2 py-2">
      {data.emails.map((e) => (
        <li key={e.id} className="flex justify-between border-b py-1 text-sm">
          <span className="capitalize text-slate-700">{e.email_type}</span>
          <span className="text-xs text-slate-400">{new Date(e.sent_at).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  );
}
