"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useReturnAsset } from "@/hooks/useAssets";
import type { Asset } from "@/types/api";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";

interface ReturnAssetDialogProps {
  asset: Asset | null;
  onOpenChange: (open: boolean) => void;
}

export function ReturnAssetDialog({ asset, onOpenChange }: ReturnAssetDialogProps) {
  const [condition, setCondition] = useState("");
  const [notes, setNotes] = useState("");
  const [hasIssue, setHasIssue] = useState(false);

  const returnAsset = useReturnAsset();

  useEffect(() => {
    if (asset) {
      setCondition("");
      setNotes("");
      setHasIssue(false);
    }
  }, [asset]);

  const handleSubmit = async () => {
    if (!asset || !condition.trim()) {
      toast.danger("Describe the condition of the returned asset");
      return;
    }
    try {
      await returnAsset.mutateAsync({
        id: asset.id,
        payload: { condition: condition.trim(), notes: notes || undefined, hasIssue },
      });
      toast.success("Asset returned");
      onOpenChange(false);
    } catch {
      // Global mutation error handler shows the toast.
    }
  };

  return (
    <Dialog open={!!asset} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
          <DialogDescription>
            {asset ? `Record the return of "${asset.deviceName}".` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Condition *</Label>
            <Input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g. Good, minor scratches"
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="returnHasIssue"
              checked={hasIssue}
              onCheckedChange={(v) => setHasIssue(v === true)}
            />
            <Label htmlFor="returnHasIssue" className="text-sm">
              This asset has an issue (sends it to maintenance)
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={returnAsset.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={returnAsset.isPending || !condition.trim()}>
            {returnAsset.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
