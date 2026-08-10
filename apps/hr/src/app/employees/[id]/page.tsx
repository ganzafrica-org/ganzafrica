"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Laptop, FileText, Umbrella, Plus, Trash2 } from "lucide-react";
import { useEmployee, useMe } from "@/hooks/useEmployees";
import { useAuth } from "@/hooks/useAuth";
import { useContracts, useDeleteContract } from "@/hooks/useContracts";
import { useProcesses, useMyProcess } from "@/hooks/useProcesses";
import { getStatusBadge } from "@/app/employees/page";
import { getInitials } from "@/lib/helpers/employee-util";
import { EmployeeHrEditSheet } from "@/components/sections/employee/employee-hr-edit-sheet";
import { ContractSheet } from "@/components/sections/sheets/add-contract-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Contract, Employee } from "@/types/api";

function fieldRow(label: string, value: React.ReactNode) {
  return (
    <div className="space-y-1" key={label}>
      <div className="text-[10px] uppercase font-bold text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function ProfileTab({
  employee,
  isHr,
  isSelf,
}: {
  employee: Employee;
  isHr: boolean;
  isSelf: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">HR-managed details</h3>
          {isHr && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
          {fieldRow("First Name", employee.first_name)}
          {fieldRow("Last Name", employee.last_name)}
          {fieldRow("Employee Number", employee.employee_number)}
          {fieldRow("Work Email", employee.work_email)}
          {fieldRow("Job Title", employee.job_title)}
          {fieldRow("Department", employee.department)}
          {fieldRow("Employment Type", employee.employment_type)}
          {fieldRow(
            "Hired",
            employee.hired_at ? new Date(employee.hired_at).toLocaleDateString() : null,
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Personal details</h3>
          {isSelf ? (
            <p className="text-sm text-slate-500">
              These are self-editable.{" "}
              <Link href="/profile" className="text-brand-accent hover:underline">
                Edit them from your Profile page
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
              {fieldRow("Personal Email", employee.personal_email)}
              {fieldRow("Phone", employee.phone)}
              {fieldRow("Citizenship", employee.citizenship)}
              {fieldRow("Home City", employee.home_city)}
              {fieldRow("Home Country", employee.home_country)}
            </div>
          )}
        </div>
      </CardContent>

      {isHr && (
        <EmployeeHrEditSheet employee={employee} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </Card>
  );
}

function ContractTab({ employeeId, isHr }: { employeeId: string; isHr: boolean }) {
  const { data: contracts, isLoading, isError } = useContracts(employeeId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState<Contract | null>(null);
  const deleteContract = useDeleteContract(employeeId);

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Contracts</h3>
          {isHr && (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setSheetOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Contract
            </Button>
          )}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground py-6">Loading…</p>}
        {isError && <p className="text-sm text-red-500 py-6">Failed to load contracts.</p>}
        {!isLoading && !isError && !contracts?.length && (
          <p className="text-sm text-muted-foreground py-6">No contracts yet.</p>
        )}

        <div className="space-y-3">
          {contracts?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border p-4 hover:shadow-sm transition-shadow"
            >
              <div>
                <div className="font-medium text-slate-900">{c.jobTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {c.department ?? "—"} · {c.employmentType} · {c.compensationType}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(c.startDate).toLocaleDateString()}
                  {c.endDate ? ` – ${new Date(c.endDate).toLocaleDateString()}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={c.status === "ACTIVE" ? "default" : "outline"}
                  className="capitalize"
                >
                  {c.status.toLowerCase()}
                </Badge>
                {isHr && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(c);
                        setSheetOpen(true);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      {isHr && (
        <ContractSheet
          employeeId={employeeId}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          contract={editing}
        />
      )}

      {isHr && (
        <ConfirmDialog
          open={!!deleting}
          onOpenChange={(open) => !open && setDeleting(null)}
          title="Delete this contract?"
          description={`This permanently removes the ${deleting?.jobTitle ?? ""} contract. This can't be undone.`}
          confirmLabel="Delete"
          isConfirming={deleteContract.isPending}
          onConfirm={() => {
            if (!deleting) return;
            deleteContract.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
          }}
        />
      )}
    </Card>
  );
}

function SummaryLinkTab({
  icon: Icon,
  count,
  label,
  href,
  linkLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  label: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-brand-accent/10 text-brand-accent">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{count}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={href}>{linkLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LifecycleTab({ employeeId, isHr }: { employeeId: string; isHr: boolean }) {
  const hrQuery = useProcesses(isHr ? { employee_id: employeeId } : {});
  const selfQuery = useMyProcess("onboarding");

  const rows = isHr ? hrQuery.data : undefined;
  const isLoading = isHr ? hrQuery.isLoading : selfQuery.isLoading;
  // Treat any failure (404 when nothing has started, or 403 when the viewer lacks the
  // manage-only /hr/processes permission) as "nothing to show" rather than an error state.
  const isTolerantError = isHr ? hrQuery.isError : selfQuery.isError;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent>
      </Card>
    );
  }

  if (isHr) {
    if (isTolerantError || !rows?.length) {
      return (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No onboarding or offboarding process on record.
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium capitalize">{row.type}</div>
                <div className="text-xs text-muted-foreground">
                  Started {row.started_at.slice(0, 10)} · {row.progress.done}/{row.progress.total}{" "}
                  done
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">
                  {row.status.replace("_", " ")}
                </Badge>
                {row.type === "onboarding" && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/onboarding/${row.id}`}>View checklist</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isTolerantError || !selfQuery.data?.instance) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No onboarding process on record.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <div className="font-medium">Onboarding</div>
          <div className="text-xs text-muted-foreground">
            {selfQuery.data.progress?.done ?? 0}/{selfQuery.data.progress?.total ?? 0} done
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/onboarding/me">View checklist</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const employeeId = params.id;

  const { data: employee, isLoading, isError } = useEmployee(employeeId);
  const { data: me } = useMe();
  const { roles } = useAuth();

  const isHr = roles.includes("hr") || roles.includes("admin");
  const isSelf = me?.id === employeeId;

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading…</div>;
  }

  if (isError || !employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500">Couldn&apos;t load this employee.</p>
        <Button variant="outline" onClick={() => router.push("/employees")}>
          Back to directory
        </Button>
      </div>
    );
  }

  const name = `${employee.first_name} ${employee.last_name}`.trim();

  return (
    <div className="min-h-screen bg-[#f6f8fb] dark:bg-slate-950 p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/employees")} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to directory
      </Button>

      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={employee.picture ?? undefined} />
            <AvatarFallback className="bg-brand-accent/10 text-brand-accent text-lg font-bold">
              {getInitials(employee.first_name, employee.last_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900">{name}</h1>
              {getStatusBadge(employee.status)}
              {!employee.account && (
                <Badge variant="outline" className="text-amber-600">
                  no account
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {employee.job_title ?? "—"} · {employee.department ?? "—"}
            </p>
            {employee.manager && (
              <p className="text-sm text-muted-foreground">
                Reports to{" "}
                <Link
                  href={`/employees/${employee.manager.id}`}
                  className="text-brand-accent hover:underline"
                >
                  {employee.manager.first_name} {employee.manager.last_name}
                </Link>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="bg-white shadow-sm border">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="contract">Contract</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="leave">Leave</TabsTrigger>
          <TabsTrigger value="lifecycle">Onboarding/Offboarding</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab employee={employee} isHr={isHr} isSelf={isSelf} />
        </TabsContent>

        <TabsContent value="contract" className="mt-4">
          <ContractTab employeeId={employee.id} isHr={isHr} />
        </TabsContent>

        <TabsContent value="assets" className="mt-4">
          <SummaryLinkTab
            icon={Laptop}
            count={employee.counts?.assets ?? 0}
            label="Assigned assets"
            href="/asset"
            linkLabel="Open Assets"
          />
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <SummaryLinkTab
            icon={FileText}
            count={employee.counts?.documents ?? 0}
            label="Documents"
            href="/documents"
            linkLabel="Open Documents"
          />
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <SummaryLinkTab
            icon={Umbrella}
            count={employee.counts?.open_leave ?? 0}
            label="Pending leave requests"
            href="/leave"
            linkLabel="Open Leave"
          />
        </TabsContent>

        <TabsContent value="lifecycle" className="mt-4">
          <LifecycleTab employeeId={employee.id} isHr={isHr} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
