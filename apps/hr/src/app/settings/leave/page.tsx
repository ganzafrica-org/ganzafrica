"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";
import {
  useGenderLeaveStatus,
  useSetGenderLeaveStatus,
  useLeaveTypeGrants,
  useGrantLeaveType,
  useRevokeLeaveType,
} from "@/hooks/useLeaveBalances";
import type { GrantOnlyType } from "@/services/leave-balances.service";
import {
  MultiEmployeePicker,
  type PickedEmployee,
} from "@/components/sections/employee/multi-employee-picker";

const GRANT_TYPE_LABEL: Record<GrantOnlyType, string> = {
  MATERNITY: "Maternity",
  PATERNITY: "Paternity",
};

function GrantDialog({
  type,
  open,
  onOpenChange,
}: {
  type: GrantOnlyType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selected, setSelected] = useState<PickedEmployee[]>([]);
  const grant = useGrantLeaveType();

  const handleGrant = async () => {
    await Promise.all(selected.map((s) => grant.mutateAsync({ type, employeeId: s.employeeId })));
    setSelected([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant {GRANT_TYPE_LABEL[type]} leave</DialogTitle>
        </DialogHeader>
        <MultiEmployeePicker selected={selected} onChange={setSelected} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGrant} disabled={selected.length === 0 || grant.isPending}>
            {grant.isPending ? "Granting…" : "Grant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LeaveTypeGrantList({ type }: { type: GrantOnlyType }) {
  const { data: grants = [], isLoading } = useLeaveTypeGrants(type);
  const revoke = useRevokeLeaveType();
  const [showGrantDialog, setShowGrantDialog] = useState(false);

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">{GRANT_TYPE_LABEL[type]}</h4>
        <Button size="sm" variant="outline" onClick={() => setShowGrantDialog(true)}>
          <Plus className="mr-1.5 size-3.5" /> Grant
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && grants.length === 0 && (
        <p className="text-sm text-muted-foreground">Not granted to anyone yet.</p>
      )}
      {grants.map((g) => (
        <div
          key={g.employeeId}
          className="flex items-center justify-between rounded bg-slate-50 px-3 py-1.5 text-sm"
        >
          <span className="text-slate-700">
            {g.firstName} {g.lastName}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {g.usedDays} of {g.entitledDays} used
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Revoke ${GRANT_TYPE_LABEL[type]} from ${g.firstName} ${g.lastName}`}
              onClick={() => revoke.mutate({ type, employeeId: g.employeeId })}
            >
              <X className="size-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}

      <GrantDialog type={type} open={showGrantDialog} onOpenChange={setShowGrantDialog} />
    </div>
  );
}

function LeaveTypeGrantsCard() {
  const { data: enabled, isLoading } = useGenderLeaveStatus();
  const setEnabled = useSetGenderLeaveStatus();

  return (
    <Card className="shadow-sm rounded-md">
      <CardHeader>
        <CardTitle className="text-base">Leave-type grants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="gender-leave-toggle">Enable Maternity/Paternity leave types</Label>
            <p className="text-xs text-muted-foreground">
              Off by default — these two types don&apos;t exist as an option for anyone until turned
              on here, and even then only appear for employees granted them below, not every
              employee automatically.
            </p>
          </div>
          <Switch
            id="gender-leave-toggle"
            checked={!!enabled}
            disabled={isLoading || setEnabled.isPending}
            onCheckedChange={(checked) => setEnabled.mutate(checked)}
          />
        </div>

        {enabled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <LeaveTypeGrantList type="MATERNITY" />
            <LeaveTypeGrantList type="PATERNITY" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LeaveSettingsPage() {
  return (
    <div className="flex w-full flex-col gap-6 mt-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Time off settings</h1>
        <p className="text-sm text-muted-foreground">
          Maternity/Paternity leave: turn the types on, then grant them to specific employees.
        </p>
      </div>

      <LeaveTypeGrantsCard />
    </div>
  );
}
