"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyAssets, useUpdateAsset } from "@/hooks/useAssets";
import { toast } from "sonner";

export function MyAssets() {
  const { data: assets, isLoading, error, refetch } = useMyAssets();
  const { mutateAsync: updateAsset, isPending } = useUpdateAsset();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleReportIssue = async (assetId: string) => {
    setBusyId(assetId);
    try {
      await updateAsset({
        id: assetId,
        payload: {
          hasIssue: "YES",
        },
      });
      // TODO(MOD-08): create a helpdesk ticket here once the ticket workflow is available.
      toast.success("Issue reported");
      await refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to report issue");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Failed to load your assets.
        </CardContent>
      </Card>
    );
  }

  const assetList = Array.isArray(assets) ? assets : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Assets</CardTitle>
        <CardDescription>Read-only view of assets currently assigned to you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {assetList.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No assigned assets found.</div>
        ) : (
          assetList.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Package className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <div className="font-medium">{asset.deviceName}</div>
                  <div className="text-sm text-muted-foreground">{asset.serialNumber}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{asset.status}</Badge>
                <Badge variant={asset.hasIssue === "YES" ? "destructive" : "secondary"}>
                  {asset.hasIssue}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReportIssue(asset.id)}
                  disabled={isPending && busyId === asset.id}
                >
                  {isPending && busyId === asset.id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4" />
                  )}
                  Report Issue
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
