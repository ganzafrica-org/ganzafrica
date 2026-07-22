"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Flag, MoreVertical, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRecruitmentApplications, useTransition } from "@/hooks/useRecruitment";
import type { ApplicationListItem, PipelineStage } from "@/services/recruitment.service";
import { ALLOWED_TRANSITIONS, BOARD_STAGES } from "@/lib/recruitment/stages";
import { RejectDialog } from "@/components/recruitment/reject-dialog";
import { ApplicationDetailPanel } from "@/components/recruitment/application-detail-panel";
import { FunnelWidget } from "@/components/recruitment/funnel-widget";

export default function PipelineBoardPage() {
  const params = useParams<{ id: string }>();
  const opportunityId = Number(params.id);
  const { toast } = useToast();
  const transition = useTransition();

  const [search, setSearch] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [openAppId, setOpenAppId] = useState<number | null>(null);
  const [rejectFor, setRejectFor] = useState<ApplicationListItem | null>(null);

  const { data, isLoading, isError, refetch } = useRecruitmentApplications({
    opportunity_id: opportunityId,
    search: search || undefined,
    flagged: flaggedOnly || undefined,
    page: 1,
  });

  const byStage = useMemo(() => {
    const map: Record<string, ApplicationListItem[]> = {};
    for (const s of BOARD_STAGES) map[s] = [];
    for (const a of data?.data ?? []) {
      (map[a.pipeline_stage] ??= []).push(a);
    }
    return map;
  }, [data]);

  async function move(app: ApplicationListItem, to: PipelineStage) {
    if (to === "rejected") {
      setRejectFor(app);
      return;
    }
    try {
      await transition.mutateAsync({ id: app.id, to_stage: to });
    } catch (err: unknown) {
      const allowed = (err as { response?: { data?: { allowed?: string[] } } })?.response?.data
        ?.allowed;
      toast({
        title: "Move not allowed",
        description: allowed
          ? `Allowed: ${allowed.join(", ")}`
          : "That transition isn't permitted.",
        variant: "destructive",
      });
      refetch(); // rollback optimistic UI to server truth
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="rounded-lg border bg-white p-4">
        <FunnelWidget opportunityId={opportunityId} variant="full" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            className="pl-8"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search applications"
          />
        </div>
        <Button
          variant={flaggedOnly ? "default" : "outline"}
          onClick={() => setFlaggedOnly((f) => !f)}
          aria-pressed={flaggedOnly}
        >
          <Flag className="mr-1 h-4 w-4" /> Flagged
        </Button>
      </div>

      {isLoading && (
        <div className="flex gap-4 overflow-x-auto">
          {BOARD_STAGES.map((s) => (
            <Skeleton key={s} className="h-64 w-64 shrink-0 rounded-lg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-slate-600">Couldn&apos;t load applications.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex gap-4 overflow-x-auto pb-4" data-testid="pipeline-board">
          {BOARD_STAGES.map((stage) => (
            <div key={stage} className="w-72 shrink-0 rounded-lg bg-slate-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold capitalize text-slate-700">{stage}</h3>
                <span className="rounded-full bg-white px-2 text-xs text-slate-500">
                  {byStage[stage]?.length ?? 0}
                </span>
              </div>
              <div className="space-y-2">
                {(byStage[stage] ?? []).map((app) => (
                  <BoardCard
                    key={app.id}
                    app={app}
                    onOpen={() => setOpenAppId(app.id)}
                    onMove={(to) => move(app, to)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {openAppId != null && (
        <ApplicationDetailPanel
          applicationId={openAppId}
          open={openAppId != null}
          onOpenChange={(o) => !o && setOpenAppId(null)}
        />
      )}

      {rejectFor && (
        <RejectDialog
          open={!!rejectFor}
          onOpenChange={(o) => !o && setRejectFor(null)}
          applicationName={`${rejectFor.first_name} ${rejectFor.last_name}`}
          onConfirm={async ({ reason, sendEmail }) => {
            try {
              await transition.mutateAsync({
                id: rejectFor.id,
                to_stage: "rejected",
                note: reason,
                send_email: sendEmail,
              });
              setRejectFor(null);
            } catch {
              toast({ title: "Reject failed", variant: "destructive" });
              refetch();
            }
          }}
        />
      )}
    </div>
  );
}

function BoardCard({
  app,
  onOpen,
  onMove,
}: {
  app: ApplicationListItem;
  onOpen: () => void;
  onMove: (to: PipelineStage) => void;
}) {
  const targets = ALLOWED_TRANSITIONS[app.pipeline_stage] ?? [];
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button className="text-left" onClick={onOpen}>
          <p className="text-sm font-medium text-slate-800">
            {app.first_name} {app.last_name}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(app.submission_date).toLocaleDateString()}
          </p>
        </button>
        <div className="flex items-center gap-1">
          {app.flagged && <Flag className="h-4 w-4 text-amber-500" aria-label="Flagged" />}
          {targets.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={`Move ${app.first_name}`}
                  className="rounded p-1 hover:bg-slate-100"
                >
                  <MoreVertical className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {targets.map((to) => (
                  <DropdownMenuItem key={to} onClick={() => onMove(to)} className="capitalize">
                    Move to {to}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <Badge variant="secondary" className="mt-2 capitalize">
        {app.pipeline_stage}
      </Badge>
    </div>
  );
}
