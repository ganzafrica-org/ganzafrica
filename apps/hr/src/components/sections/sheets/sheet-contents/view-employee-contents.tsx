"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Edit,
  FileSignature,
  FileText,
  Package,
  Plus,
  Settings,
  Trash2,
  User,
  UserCircle,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContracts, useMyContracts, useDeleteContract } from "@/hooks/useContracts";
import { useMyLeave } from "@/hooks/useLeaveBalances";
import { useProcesses, useMyProcess, useProcess } from "@/hooks/useProcesses";
import { ProcessStatus } from "@/components/processes/process-status";
import { ContractSigningStatus } from "@/components/processes/contract-signing-status";
import { remainingDays } from "@/services/leave-balances.service";
import { getInitials, getStatusBadge, countryToFlag } from "@/lib/helpers/employee-util";
import { EmployeeHrEditSheet } from "@/components/sections/employee/employee-hr-edit-sheet";
import { ContractSheet } from "@/components/sections/sheets/add-contract-sheet";
import { ContractViewSheet } from "@/components/sections/contracts/contract-view-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Contract, Employee } from "@/types/api";
import type { ActiveTab } from "@/components/sections/sheets/employee-sheet";

interface TabProps {
  employee: Employee;
  isHr: boolean;
  isSelf: boolean;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-4 py-[9px]">
      <p className="flex-1 text-slate-400 text-sm">{label}</p>
      <p className="flex-1 text-right text-xs font-medium text-[color:var(--color-text-primary)]">
        {value || value === 0 ? value : "—"}
      </p>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase font-bold text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-900">{value || "—"}</div>
    </div>
  );
}

function CardHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-sm font-medium text-[color:var(--color-text-primary)]">{title}</p>
      </div>
    </div>
  );
}

export const Overview = ({
  employee,
  isHr,
  isSelf,
  onNavigateTab,
  onOpenEmployee,
}: TabProps & {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenEmployee?: (id: string) => void;
}) => {
  // contracts:read/manage are HR-only — a self-viewer reads their own contract(s) via
  // /hr/me/contracts instead (see the Contracts tab below for the same split).
  const otherContracts = useContracts(isSelf ? "" : employee.id);
  const selfContracts = useMyContracts(isSelf);
  const { data: contracts } = isSelf ? selfContracts : otherContracts;
  const activeContract = contracts?.find((c) => c.status === "ACTIVE") ?? null;
  const flag = countryToFlag(employee.home_country);
  // DRAFT is the only status a signature sequence is ever relevant for — ACTIVE is already
  // signed (or activated manually), EXPIRED/TERMINATED don't route through signing at all.
  const pendingContract = contracts?.find((c) => c.status === "DRAFT") ?? null;

  // LCM-01 process instances — processes:manage is HR-only, so a self-viewer reads their own via
  // /hr/me/process instead. Naturally 404/empty-tolerant: no active instance just means no card.
  const otherOnboarding = useProcesses(
    { employee_id: employee.id, type: "onboarding", status: "in_progress" },
    !isSelf,
  );
  const selfOnboarding = useMyProcess("onboarding", isSelf);
  const otherOnboardingId = !isSelf ? (otherOnboarding.data?.[0]?.id ?? null) : null;
  // HR's list query above has progress but not the per-task breakdown — fetch the instance detail
  // once we know its id, same data ProcessStatus renders on the onboarding detail page.
  const otherOnboardingDetail = useProcess(otherOnboardingId);
  const onboarding = isSelf
    ? selfOnboarding.data?.instance
      ? {
          id: selfOnboarding.data.instance.id,
          progress: selfOnboarding.data.progress,
          tasks: selfOnboarding.data.tasks,
        }
      : null
    : otherOnboardingId
      ? {
          id: otherOnboardingId,
          progress: otherOnboarding.data![0].progress,
          tasks: otherOnboardingDetail.data?.tasks ?? [],
        }
      : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <CardHeader
            icon={User}
            iconBg="bg-[#EEEDFE]"
            iconColor="text-[#534AB7]"
            title="Profile"
          />
          <div>
            <Row label="Name" value={`${employee.first_name} ${employee.last_name}`.trim()} />
            <Row label="ID" value={employee.employee_number} />
            <Row label="Role" value={employee.job_title} />
            <Row
              label="Country"
              value={
                employee.home_country ? (
                  <span className="inline-flex items-center gap-1.5">
                    {flag && <span title={flag.label}>{flag.flag}</span>}
                    {employee.home_country}
                  </span>
                ) : null
              }
            />
            <Row label="Status" value={getStatusBadge(employee.status)} />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <CardHeader
            icon={Briefcase}
            iconBg="bg-[#E6F1FB]"
            iconColor="text-[#185FA5]"
            title="Role details"
          />
          <div>
            <Row label="Job title" value={employee.job_title} />
            <Row
              label="Employment type"
              value={<span className="capitalize">{employee.employment_type}</span>}
            />
            <Row
              label="Compensation"
              value={
                activeContract?.baseMonthlyRate
                  ? `${activeContract.currency} ${Number(activeContract.baseMonthlyRate).toLocaleString()} / mo`
                  : "—"
              }
            />
            <Row
              label="Contract"
              value={
                activeContract
                  ? activeContract.employmentTerm === "indefinite"
                    ? "Indefinite"
                    : "Definite"
                  : "No active contract"
              }
            />
            <Row label="Open leave requests" value={employee.counts?.open_leave ?? 0} />
            <Row label="Department" value={employee.department} />
          </div>
          {isHr && (
            <div className="flex gap-2 px-4 py-3">
              <button
                onClick={() => onNavigateTab("profile")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-2 py-2 text-[12px] text-[color:var(--color-text-primary)]"
              >
                <Edit className="h-3.5 w-3.5" /> Edit worker details
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <CardHeader
            icon={UserCircle}
            iconBg="bg-[#E1F5EE]"
            iconColor="text-[#0F6E56]"
            title="Personal"
          />
          <div>
            <Row label="First name" value={employee.first_name} />
            <Row label="Last name" value={employee.last_name} />
            <Row label="Home city" value={employee.home_city} />
            <Row label="Home country" value={employee.home_country} />
            <Row label="Personal email" value={employee.personal_email} />
            <Row label="Personal phone" value={employee.phone} />
            <Row label="Citizenship" value={employee.citizenship} />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <CardHeader
            icon={Settings}
            iconBg="bg-[#FAEEDA]"
            iconColor="text-[#854F0B]"
            title="General"
          />
          <div>
            <Row
              label="Manager"
              value={
                employee.manager ? (
                  <button
                    onClick={() => onOpenEmployee?.(employee.manager!.id)}
                    className="text-brand-accent hover:underline"
                  >
                    {employee.manager.first_name} {employee.manager.last_name}
                  </button>
                ) : null
              }
            />
            <Row label="Position" value={employee.job_title} />
            <Row
              label="Start date"
              value={employee.hired_at ? new Date(employee.hired_at).toLocaleDateString() : null}
            />
            <Row label="Work email" value={employee.work_email} />
            <Row label="Work location" value={activeContract?.workLocation} />
          </div>
          {isHr && (
            <div className="flex gap-2 px-4 py-3">
              <button
                onClick={() => onNavigateTab("contracts")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-2 py-2 text-[12px] text-[color:var(--color-text-primary)]"
              >
                <Plus className="h-3.5 w-3.5" />{" "}
                {contracts?.length ? "Add new contract" : "Add contract"}
              </button>
            </div>
          )}
        </div>

        {/* MOD-04/MOD-05 read summaries — counts from the detail response, linking to the owning module rather than duplicating its UI here. */}
        <div className="col-span-2 overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
          <CardHeader
            icon={Package}
            iconBg="bg-[#FDEBEA]"
            iconColor="text-[#B3261E]"
            title="Assets & documents"
          />
          <div>
            <Row
              label="Assigned assets"
              value={
                <Link href="/asset" className="text-brand-accent hover:underline">
                  {employee.counts?.assets ?? 0}
                </Link>
              }
            />
            <Row
              label="Documents"
              value={
                <Link href="/documents" className="text-brand-accent hover:underline">
                  {employee.counts?.documents ?? 0}
                </Link>
              }
            />
          </div>
        </div>

        {onboarding && (
          <div className="col-span-2 overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
            <CardHeader
              icon={FileText}
              iconBg="bg-[#E6F1FB]"
              iconColor="text-[#185FA5]"
              title="Onboarding in progress"
            />
            <div className="px-4 pb-3">
              <p className="mb-2 text-xs text-slate-500">
                {onboarding.progress?.done ?? 0} of {onboarding.progress?.total ?? 0} tasks complete
                ({onboarding.progress?.percent ?? 0}%)
              </p>
              <ProcessStatus
                tasks={onboarding.tasks}
                progress={onboarding.progress ?? null}
                canManage={false}
                variant="summary"
              />
            </div>
            <div className="flex gap-2 px-4 py-3">
              <Link
                href={
                  isSelf ? "/employees/onboarding/me" : `/employees/onboarding/${onboarding.id}`
                }
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-2 py-2 text-[12px] text-[color:var(--color-text-primary)]"
              >
                View onboarding checklist
              </Link>
            </div>
          </div>
        )}

        {pendingContract && (
          <div className="col-span-2 overflow-hidden rounded-lg shadow-lg bg-[color:var(--color-background-primary)]">
            <CardHeader
              icon={FileSignature}
              iconBg="bg-[#FDEBEA]"
              iconColor="text-[#B3261E]"
              title="Contract signing"
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-xs text-slate-500">{pendingContract.jobTitle}</span>
              <ContractSigningStatus
                refKind="contract"
                refId={pendingContract.id}
                variant="compact"
              />
            </div>
            <div className="flex gap-2 px-4 py-3">
              <button
                onClick={() => onNavigateTab("contracts")}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[color:var(--color-border-tertiary)] bg-[color:var(--color-background-secondary)] px-2 py-2 text-[12px] text-[color:var(--color-text-primary)]"
              >
                View contract
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Profile = ({ employee, isHr, isSelf }: TabProps) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <p>Employee ID</p>
            <p className="font-mono font-bold text-slate-900">
              {employee.employee_number ?? employee.id.slice(0, 8)}
            </p>
          </div>
          {isHr && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Position</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-400" />
              {employee.job_title ?? "—"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Join Date</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {employee.hired_at
                ? new Date(employee.hired_at).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Department</div>
            <div className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {employee.department ?? "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700">HR-managed details</h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <Field label="First Name" value={employee.first_name} />
            <Field label="Last Name" value={employee.last_name} />
            <Field label="Employee Number" value={employee.employee_number} />
            <Field label="Work Email" value={employee.work_email} />
            <Field
              label="Employment Type"
              value={<span className="capitalize">{employee.employment_type}</span>}
            />
            <Field label="Status" value={getStatusBadge(employee.status)} />
          </div>
        </div>

        <div className="space-y-4 border-t pt-6">
          <h4 className="text-sm font-bold text-slate-700">Personal details</h4>
          {isSelf ? (
            <p className="text-sm text-slate-500">
              These are self-editable.{" "}
              <Link href="/profile" className="text-brand-accent hover:underline">
                Edit them from your Profile page
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <Field label="Personal Email" value={employee.personal_email} />
              <Field label="Phone" value={employee.phone} />
              <Field label="Citizenship" value={employee.citizenship} />
              <Field label="Home City" value={employee.home_city} />
              <Field label="Home Country" value={employee.home_country} />
            </div>
          )}
        </div>
      </div>

      {isHr && (
        <EmployeeHrEditSheet employee={employee} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </>
  );
};

export const Leaves = ({ employee, isSelf }: TabProps) => {
  const { data, isLoading } = useMyLeave();
  const balances = isSelf ? data?.balances : undefined;
  const requests = isSelf ? data?.requests : undefined;

  return (
    <div className="w-full pt-5 overflow-y-auto shrink-0 flex flex-col">
      <div className="p-6 space-y-8 flex-1">
        {isSelf ? (
          <>
            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Leave balances
              </h2>
              {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!isLoading && !balances?.length && (
                <p className="text-sm text-muted-foreground">
                  No balances set up yet for this year.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                {balances?.map((b) => (
                  <div key={b.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 capitalize">
                      {b.type.toLowerCase()}
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {remainingDays(b)} / {Number(b.entitled_days) + Number(b.carried_over_days)}{" "}
                      days
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Recent requests
              </h2>
              {!requests?.length && (
                <p className="text-sm text-muted-foreground">No requests yet.</p>
              )}
              <div className="space-y-3">
                {requests?.slice(0, 5).map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{r.type.toLowerCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.start_date).toLocaleDateString()} –{" "}
                        {new Date(r.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {r.status.toLowerCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 space-y-1">
            <p className="text-sm font-medium text-gray-700">Pending leave requests</p>
            <p className="text-lg font-semibold text-gray-900">
              {employee.counts?.open_leave ?? 0}
            </p>
          </div>
        )}
        <Link
          href="/employees/time-off"
          className="w-full inline-flex justify-center py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
        >
          Open Leave
        </Link>
      </div>
    </div>
  );
};

export const Contracts = ({ employee, isHr, isSelf }: TabProps) => {
  const employeeId = employee.id;
  // contracts:read/manage are HR-only (seed-rbac.ts) — a self-viewer reads their own contracts
  // through /hr/me/contracts instead, so exactly one of these two queries actually runs.
  const otherQuery = useContracts(isSelf ? "" : employeeId);
  const selfQuery = useMyContracts(isSelf);
  const { data: contracts, isLoading, isError } = isSelf ? selfQuery : otherQuery;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);
  const [viewing, setViewing] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState<Contract | null>(null);
  const deleteContract = useDeleteContract(employeeId);

  return (
    <div className="p-6 space-y-4">
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
            <Plus className="h-3.5 w-3.5 mr-1.5" />{" "}
            {contracts?.length ? "Add New Contract" : "Add Contract"}
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
            role="button"
            tabIndex={0}
            onClick={() => setViewing(c)}
            onKeyDown={(e) => e.key === "Enter" && setViewing(c)}
            className="flex items-center justify-between rounded-lg border p-4 hover:shadow-sm hover:border-brand-accent/40 transition-shadow cursor-pointer"
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
              {c.status === "DRAFT" && (
                <ContractSigningStatus refKind="contract" refId={c.id} variant="compact" />
              )}
              <Badge variant={c.status === "ACTIVE" ? "default" : "outline"} className="capitalize">
                {c.status.toLowerCase()}
              </Badge>
              {isHr && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleting(c);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <ContractViewSheet
        contract={viewing}
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        isHr={isHr}
        onEdit={
          isHr
            ? () => {
                setEditing(viewing);
                setViewing(null);
                setSheetOpen(true);
              }
            : undefined
        }
      />

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
    </div>
  );
};
