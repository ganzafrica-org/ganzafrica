"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Plus, Users, ChevronRight } from "lucide-react";
import { useRecruitmentOpportunities } from "@/hooks/useRecruitment";
import type { OpportunityStageCounts } from "@/services/recruitment.service";
import { FunnelWidget } from "@/components/recruitment/funnel-widget";

const ACTIVE_STAGES = [
  "submitted",
  "screening",
  "shortlisted",
  "interview",
  "evaluation",
  "offer",
] as const;

export default function RecruitmentPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useRecruitmentOpportunities();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <Briefcase className="h-6 w-6 text-blue-600" /> Recruitment
        </h1>
        <Button onClick={() => router.push("/recruitment/new")}>
          <Plus className="mr-1 h-4 w-4" /> New posting
        </Button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-slate-600">Couldn&apos;t load postings.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Briefcase className="h-10 w-10 text-slate-300" />
            <p className="font-medium text-slate-700">No open positions</p>
            <p className="text-sm text-slate-500">Create one to start receiving applications.</p>
            <Button onClick={() => router.push("/recruitment/new")}>
              <Plus className="mr-1 h-4 w-4" /> Create posting
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((opp) => (
            <PostingCard
              key={opp.opportunity_id}
              opp={opp}
              onOpen={() => router.push(`/recruitment/${opp.opportunity_id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PostingCard({ opp, onOpen }: { opp: OpportunityStageCounts; onOpen: () => void }) {
  const active = ACTIVE_STAGES.reduce((sum, s) => sum + (opp.stages[s] ?? 0), 0);
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onOpen}>
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">{opp.title}</h3>
          <Badge variant={opp.status === "published" ? "default" : "secondary"}>{opp.status}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-slate-400" />
          <span>
            <strong>{opp.total}</strong> applications · <strong>{active}</strong> in pipeline
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ACTIVE_STAGES.filter((s) => opp.stages[s]).map((s) => (
            <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {s}: {opp.stages[s]}
            </span>
          ))}
        </div>
        <FunnelWidget opportunityId={opp.opportunity_id} variant="compact" />
        <div className="flex items-center justify-end text-sm font-medium text-blue-600">
          View pipeline <ChevronRight className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}
