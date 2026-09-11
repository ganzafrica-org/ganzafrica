"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import { useSetting, useSetSetting } from "@/hooks/useSettings";
import { useSignerPool, useAddToSignerPool, useRemoveFromSignerPool } from "@/hooks/useSigning";
import {
  MultiEmployeePicker,
  type PickedEmployee,
} from "@/components/sections/employee/multi-employee-picker";

const REQUIRE_MULTIPLE_SIGNERS_KEY = "require_multiple_signers";

function AddSignerDialog({
  open,
  onOpenChange,
  excludeEmployeeIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excludeEmployeeIds: Set<string>;
}) {
  const [selected, setSelected] = useState<PickedEmployee[]>([]);
  const add = useAddToSignerPool();

  const handleAdd = async () => {
    await Promise.all(selected.map((s) => add.mutateAsync(s.employeeId)));
    setSelected([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to signer pool</DialogTitle>
        </DialogHeader>
        <MultiEmployeePicker
          selected={selected}
          onChange={setSelected}
          excludeEmployeeIds={excludeEmployeeIds}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={selected.length === 0 || add.isPending}>
            {add.isPending ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SignerPoolCard() {
  const { data: pool = [], isLoading } = useSignerPool();
  const remove = useRemoveFromSignerPool();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const poolIds = new Set(pool.map((p) => p.employeeId));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Designated co-signers</CardTitle>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-1.5 size-3.5" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Employees eligible to be picked as a required signer. The multi-signer picker on a
          contract or document only offers people from this pool, not the whole directory.
        </p>

        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && pool.length === 0 && (
          <p className="text-sm text-muted-foreground">No designated signers yet.</p>
        )}
        {pool.map((p) => (
          <div
            key={p.employeeId}
            className="flex items-center justify-between rounded bg-slate-50 px-3 py-1.5 text-sm"
          >
            <span className="text-slate-700">
              {p.firstName} {p.lastName}
              {p.jobTitle ? <span className="text-muted-foreground"> — {p.jobTitle}</span> : null}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${p.firstName} ${p.lastName} from signer pool`}
              onClick={() => remove.mutate(p.employeeId)}
            >
              <X className="size-4 text-red-500" />
            </Button>
          </div>
        ))}

        <AddSignerDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          excludeEmployeeIds={poolIds}
        />
      </CardContent>
    </Card>
  );
}

export default function SigningSettingsPage() {
  const { data: requireMultipleSigners, isLoading } = useSetting<boolean>(
    REQUIRE_MULTIPLE_SIGNERS_KEY,
  );
  const setSetting = useSetSetting<boolean>(REQUIRE_MULTIPLE_SIGNERS_KEY);

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Document signing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-1">
              <Label htmlFor="require-multiple-signers">Require multiple signers</Label>
              <p className="text-xs text-muted-foreground">
                When enabled, HR can choose several employees who must sign a contract or document —
                sequentially (in order) or in parallel (any order) — before it&apos;s marked
                complete. When off, sending a document for signature stays single-signer, as it is
                today.
              </p>
            </div>
            <Switch
              id="require-multiple-signers"
              checked={!!requireMultipleSigners}
              disabled={isLoading || setSetting.isPending}
              onCheckedChange={(checked) => setSetting.mutate(checked)}
            />
          </div>
        </CardContent>
      </Card>

      <SignerPoolCard />
    </div>
  );
}
