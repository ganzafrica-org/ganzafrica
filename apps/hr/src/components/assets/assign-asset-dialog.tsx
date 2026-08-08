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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignAsset } from "@/hooks/useAssets";
import { useEmployees } from "@/hooks/useEmployees";
import type { Asset } from "@/types/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AssignAssetDialogProps {
  asset: Asset | null;
  onOpenChange: (open: boolean) => void;
}

export function AssignAssetDialog({ asset, onOpenChange }: AssignAssetDialogProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [notes, setNotes] = useState("");

  const { data: employeesData } = useEmployees({ limit: 200 });
  const employees = employeesData?.data ?? [];
  const assignAsset = useAssignAsset();

  useEffect(() => {
    if (asset) {
      setEmployeeId("");
      setNotes("");
    }
  }, [asset]);

  const handleSubmit = async () => {
    if (!asset || !employeeId) {
      toast.error("Select an employee to assign this asset to");
      return;
    }
    try {
      await assignAsset.mutateAsync({
        id: asset.id,
        payload: { employeeId, notes: notes || undefined },
      });
      toast.success("Asset assigned");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to assign asset");
    }
  };

  return (
    <Dialog open={!!asset} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Asset</DialogTitle>
          <DialogDescription>
            {asset ? `Assign "${asset.deviceName}" to an employee.` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                    <span className="ml-2 text-xs text-slate-400">{emp.position}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assignAsset.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={assignAsset.isPending || !employeeId}>
            {assignAsset.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
