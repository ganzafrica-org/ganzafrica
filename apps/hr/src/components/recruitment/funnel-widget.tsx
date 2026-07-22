"use client";

import { useFunnel } from "@/hooks/useRecruitment";
import type { Funnel } from "@/services/recruitment.service";

export interface FunnelWidgetProps {
  opportunityId: number;
  variant?: "compact" | "full";
}

function pct(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export function FunnelWidget({ opportunityId, variant = "full" }: FunnelWidgetProps) {
  const { data, isLoading } = useFunnel(opportunityId);

  if (isLoading || !data) {
    return <div className="h-4 w-full animate-pulse rounded bg-slate-100" aria-hidden />;
  }

  const hasTraffic = data.views > 0 || data.form_starts > 0 || data.submissions > 0;
  if (!hasTraffic) {
    return <p className="text-xs text-slate-400">No traffic yet.</p>;
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500" data-testid="funnel-compact">
        <span>{data.views} views</span>
        <span aria-hidden>→</span>
        <span>{data.form_starts} starts</span>
        <span aria-hidden>→</span>
        <span className="font-medium text-slate-700">{data.submissions} applied</span>
      </div>
    );
  }

  return <FullFunnel data={data} />;
}

function FullFunnel({ data }: { data: Funnel }) {
  const max = Math.max(data.views, 1);
  const steps = [
    { label: "Views", value: data.views },
    { label: "Form starts", value: data.form_starts },
    { label: "Submissions", value: data.submissions },
  ];

  return (
    <div className="space-y-3" data-testid="funnel-full">
      <div className="space-y-2">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-slate-500">{s.label}</span>
            <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
              <div
                className="h-full rounded bg-blue-500"
                style={{ width: `${(s.value / max) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-medium text-slate-700">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-6 text-xs text-slate-500">
        <span>
          View → start:{" "}
          <strong className="text-slate-700">{pct(data.conversion.view_to_start)}</strong>
        </span>
        <span>
          Start → submit:{" "}
          <strong className="text-slate-700">{pct(data.conversion.start_to_submit)}</strong>
        </span>
      </div>

      {data.eligibility_blocks.length > 0 && (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">Eligibility blocks</p>
          <ul className="space-y-1">
            {data.eligibility_blocks.map((b) => (
              <li key={b.rule_id} className="flex justify-between text-xs text-slate-600">
                <span className="truncate pr-2">{b.reject_message}</span>
                <span className="shrink-0 font-medium">{b.hits}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
