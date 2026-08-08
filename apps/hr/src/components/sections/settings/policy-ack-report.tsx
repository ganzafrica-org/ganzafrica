"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePolicyAcknowledgements } from "@/hooks/usePolicies";
import type { Policy } from "@/types/api";

interface PolicyAckReportProps {
  policy: Policy;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function PolicyAckReport({ policy }: PolicyAckReportProps) {
  const { data: report, isLoading } = usePolicyAcknowledgements(policy.id);

  const handleExportMissing = () => {
    if (!report) return;
    const missing = report.details.filter((d) => !d.acknowledged);
    downloadCsv(
      `${(policy.title ?? "policy").replace(/\s+/g, "-").toLowerCase()}-missing-acks.csv`,
      [["employee_id", "employee_name"], ...missing.map((d) => [d.employee_id, d.employee_name])],
    );
  };

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading…</div>;
  if (!report) return null;

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-2xl font-bold text-slate-900">{report.total_active_employees}</p>
          <p className="text-xs text-slate-500">Active employees</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
          <p className="text-2xl font-bold text-green-700">{report.acknowledged_count}</p>
          <p className="text-xs text-green-700">Acknowledged</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-2xl font-bold text-amber-700">{report.missing_count}</p>
          <p className="text-xs text-amber-700">Missing (v{report.version})</p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportMissing}
        disabled={report.missing_count === 0}
        className="gap-2"
      >
        <Download className="h-3.5 w-3.5" />
        Export missing list (CSV)
      </Button>

      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {report.details.map((d) => (
          <div
            key={d.employee_id}
            className="flex items-center justify-between text-sm border border-slate-200 rounded-md px-3 py-2"
          >
            <span>{d.employee_name}</span>
            {d.acknowledged ? (
              <Badge className="bg-green-100 text-green-800">Acknowledged</Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800">Required</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
