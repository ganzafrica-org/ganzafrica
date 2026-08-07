"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMyAssets, useReportAssetIssue } from "@/hooks/useAssets";
import { helpdeskService } from "@/services/helpdesk.service";
import { getCategoryIcon } from "@/lib/helpers/assets-util";
import type { Asset } from "@/types/api";
import { AlertTriangle, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200",
  ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-800 border-amber-200",
  DISPOSED: "bg-gray-100 text-gray-800 border-gray-200",
};

export function MyAssets() {
  const { data: assets, isLoading, isError, refetch } = useMyAssets();
  const reportIssue = useReportAssetIssue();

  const [reportTarget, setReportTarget] = useState<Asset | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReportIssue = async () => {
    if (!reportTarget || !description.trim()) {
      toast.error("Describe the issue before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all([
        reportIssue.mutateAsync({ id: reportTarget.id, note: description.trim() }),
        helpdeskService.createTicket({
          title: `Asset issue: ${reportTarget.deviceName}`,
          description: description.trim(),
        }),
      ]);
      toast.success("Issue reported — a helpdesk ticket has been created");
      setReportTarget(null);
      setDescription("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to report issue");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
        <AlertTriangle className="h-8 w-8" />
        <p>Failed to load your assets.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const myAssets = assets ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">My Assets</h1>
        <p className="text-sm text-muted-foreground">Assets currently assigned to you.</p>
      </div>

      {myAssets.length === 0 ? (
        <Card className="rounded-lg">
          <CardContent className="p-12 text-center">
            <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-900 dark:text-white">No assets assigned to you</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Anything assigned to you will show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myAssets.map((asset) => (
            <Card key={asset.id} className="rounded-lg">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shrink-0">
                    {getCategoryIcon(asset.category?.slug || "")}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{asset.deviceName}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {asset.serialNumber}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline" className={statusStyles[asset.status] ?? ""}>
                    {asset.status.replace("_", " ")}
                  </Badge>
                  {asset.hasIssue === "YES" && <Badge variant="destructive">Has Issue</Badge>}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setReportTarget(asset)}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  Report Issue
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!reportTarget} onOpenChange={(open) => !open && setReportTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              {reportTarget ? `Describe the problem with "${reportTarget.deviceName}".` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's wrong with this asset?"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportTarget(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleReportIssue} disabled={submitting || !description.trim()}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
