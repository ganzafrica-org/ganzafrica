"use client";

import { FileText, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";

import { useDocumentCategoryTemplates } from "@/hooks/useDocumentCategoryTemplates";
import { QuillEditor } from "@/components/sections/documents/quill-editor";
import { escapeHtml } from "@/lib/helpers/document-branding";
import { cn } from "@/lib/utils";

import type { CreateContractRequest, HrDocument } from "@/types/api";

export type ContractFormState = Partial<CreateContractRequest>;

const CURRENCIES: [string, string][] = [
  ["RWF", "RWF - Rwandan Franc"],
  ["USD", "USD - US Dollar"],
  ["EUR", "EUR - Euro"],
  ["GBP", "GBP - British Pound"],
  ["KES", "KES - Kenyan Shilling"],
  ["UGX", "UGX - Ugandan Shilling"],
  ["TZS", "TZS - Tanzanian Shilling"],
];

interface ContractFormFieldsProps {
  value: ContractFormState;
  onChange: (patch: ContractFormState) => void;
  /** Newly-picked agreement file, not yet uploaded (upload happens on save — see

   *  lib/helpers/contract-agreement.ts). Kept out of `value` because it isn't JSON-serializable.
   *  Mutually exclusive with `agreementTemplateId` — picking one clears the other. */
  agreementFile: File | null;
  onAgreementFileChange: (file: File | null) => void;
  /** Id of a saved (branding) Category Template to generate the agreement from, instead of
   *  uploading a file. Mutually exclusive with `agreementFile`. */
  agreementTemplateId: string | null;
  onAgreementTemplateIdChange: (id: string | null) => void;
  /** Rich-text body used together with the picked Category Template's branding to generate the
   *  actual agreement document at save time. Pre-filled from the contract's own fields the moment
   *  a template is selected (see buildAgreementContentFromContract), then freely editable. */
  agreementTemplateContent: string;
  onAgreementTemplateContentChange: (html: string) => void;
  /** Employee's full name — used only to pre-fill the generated agreement's "Employee" line. */
  employeeName?: string;

  /** The document currently on file when editing an existing contract, if any. */
  existingAgreementDocument?: HrDocument | null;
  onViewExistingAgreement?: () => void;
}

function contentRow(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}

/** Pre-fills the generated agreement's body from what's already been typed into the contract
 *  form — HR shouldn't have to retype the job title, dates, and pay they just entered above.
 *  Freely editable afterward in the Quill editor; this only seeds the first draft. */
export function buildAgreementContentFromContract(
  value: ContractFormState,
  employeeName?: string,
): string {
  const term =
    value.employmentTerm === "definite"
      ? `Definite${value.endDate ? ` (through ${value.endDate.slice(0, 10)})` : ""}`
      : value.employmentTerm === "indefinite"
        ? "Indefinite"
        : "";

  const type =
    value.employmentType === "part-time"
      ? `Part-time${value.daysPerWeek ? ` (${value.daysPerWeek} days/week)` : ""}`
      : value.employmentType === "full-time"
        ? "Full-time"
        : "";

  const currency = value.currency ?? "RWF";
  const compensation = value.baseMonthlyRate
    ? `${currency} ${value.baseMonthlyRate} / month${value.salaryScale ? ` (${value.salaryScale})` : ""}`
    : "";
  const grossAnnual = value.grossAnnualRate ? `${currency} ${value.grossAnnualRate} / year` : "";

  return [
    contentRow("Employee", employeeName),
    contentRow("Job Title", value.jobTitle),
    contentRow("Department", value.department),
    contentRow("Work Location", value.workLocation),
    contentRow("Manager", value.manager),
    contentRow("Start Date", value.startDate?.slice(0, 10)),
    contentRow("Employment Term", term),
    contentRow("Employment Type", type),
    contentRow("Compensation", compensation),
    contentRow("Gross Annual Rate", grossAnnual),
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * The contract fields (job details + terms + compensation), shared between the add-employee
 * sheet's optional "create a contract now" step and the standalone contract sheet used from the
 * employee detail page's Contract tab.
 */
export function ContractFormFields({
  value,
  onChange,
  agreementFile,
  onAgreementFileChange,
  agreementTemplateId,
  onAgreementTemplateIdChange,
  onAgreementTemplateContentChange,
  employeeName,
  existingAgreementDocument,
  onViewExistingAgreement,
}: ContractFormFieldsProps) {
  const set = (patch: ContractFormState) => onChange({ ...value, ...patch });
  const { data: employeesData } = useEmployees({ limit: 200 });
  // A Category Template applies here if it's scoped to "Contract Templates", or left universal
  // (category === null) — see category-template-sheet.tsx's own Category field. Deferred until
  // "Use a saved template" is actually picked — no reason to fetch it for the (default) upload path.
  const { data: allTemplates } = useDocumentCategoryTemplates(agreementTemplateId !== null);
  const templates = allTemplates?.filter(
    (t) => t.category === null || t.category === "Contract Templates",
  );
  const managerOptions = (employeesData?.data ?? [])
    .map((emp) => `${emp.first_name} ${emp.last_name}`.trim())
    .filter((name, index, all) => name && all.indexOf(name) === index)
    .sort((a, b) => a.localeCompare(b));
  // The field is a free-text name on the backend (hr_contracts.manager, not an FK) — a
  // previously-typed or since-departed name won't be in the fetched list, so keep it
  // selectable rather than silently dropping it from the picker.
  if (value.manager && !managerOptions.includes(value.manager)) {
    managerOptions.unshift(value.manager);
  }
  const handleBaseMonthlyChange = (val: string) => {
    const monthly = parseFloat(val);
    const annual = isNaN(monthly) ? "" : (monthly * 12).toFixed(2);
    set({ baseMonthlyRate: val, grossAnnualRate: annual });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Job Title</Label>
          <Input
            placeholder="e.g. Software Engineer"
            value={value.jobTitle ?? ""}
            onChange={(e) => set({ jobTitle: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Department</Label>
          <Input
            placeholder="e.g. Engineering"
            value={value.department ?? ""}
            onChange={(e) => set({ department: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Work Location</Label>
          <Input
            placeholder="e.g. Kigali HQ"
            value={value.workLocation ?? ""}
            onChange={(e) => set({ workLocation: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Manager</Label>
          <Select value={value.manager ?? ""} onValueChange={(v) => set({ manager: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a manager" />
            </SelectTrigger>
            <SelectContent>
              {managerOptions.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Start Date</Label>
        <Input
          type="date"
          value={value.startDate ? value.startDate.slice(0, 10) : ""}
          onChange={(e) => set({ startDate: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Employment Term</Label>
          <Select
            value={value.employmentTerm ?? ""}
            onValueChange={(v) => set({ employmentTerm: v as ContractFormState["employmentTerm"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Indefinite or Definite" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indefinite">Indefinite</SelectItem>
              <SelectItem value="definite">Definite</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value.employmentTerm === "definite" && (
          <div className="space-y-1.5">
            <Label>Contract End Date</Label>
            <Input
              type="date"
              value={value.endDate ? value.endDate.slice(0, 10) : ""}
              onChange={(e) => set({ endDate: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Employment Type</Label>
          <Select
            value={value.employmentType ?? ""}
            onValueChange={(v) => set({ employmentType: v as ContractFormState["employmentType"] })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Full-time or Part-time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value.employmentType === "part-time" && (
          <div className="space-y-1.5">
            <Label>Days per week</Label>
            <Input
              type="number"
              min={1}
              max={6}
              value={value.daysPerWeek ?? ""}
              onChange={(e) => set({ daysPerWeek: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Compensation Type</Label>
          <Select
            value={value.compensationType ?? ""}
            onValueChange={(v) =>
              set({
                compensationType: v as ContractFormState["compensationType"],
                salaryScale: null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Hourly or Salaried" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="salaried">Salaried</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {value.compensationType === "salaried" && (
          <div className="space-y-1.5">
            <Label>Salary Scale</Label>
            <Select
              value={value.salaryScale ?? ""}
              onValueChange={(v) => set({ salaryScale: v as ContractFormState["salaryScale"] })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Annual / Monthly / Weekly / Daily" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Currency</Label>
        <Select value={value.currency ?? "RWF"} onValueChange={(v) => set({ currency: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map(([val, label]) => (
              <SelectItem key={val} value={val}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Base Monthly Rate</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={value.baseMonthlyRate ?? ""}
            onChange={(e) => handleBaseMonthlyChange(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Gross Annual Rate</Label>
          <Input
            readOnly
            placeholder="Auto-calculated"
            value={value.grossAnnualRate ?? ""}
            className="bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>
          Employment Agreement{" "}
          <span className="text-xs text-gray-400 font-normal">
            (required to set status to Active)
          </span>
        </Label>

        {existingAgreementDocument && !agreementFile && !agreementTemplateId && (
          <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-gray-700 truncate">
              <FileText className="h-4 w-4 shrink-0 text-gray-400" />
              {existingAgreementDocument.document_name}
            </span>
            {onViewExistingAgreement && (
              <button
                type="button"
                onClick={onViewExistingAgreement}
                className="shrink-0 text-xs font-medium text-brand-accent hover:underline"
              >
                View
              </button>
            )}
          </div>
        )}

        <div className="inline-flex rounded-lg border border-gray-200 p-1" role="radiogroup">
          <button
            type="button"
            data-testid="agreement-source-upload"
            aria-pressed={agreementTemplateId === null}
            onClick={() => {
              onAgreementTemplateIdChange(null);
              onAgreementTemplateContentChange("");
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              agreementTemplateId === null ? "bg-brand-accent text-white" : "text-gray-500",
            )}
          >
            Upload a file
          </button>
          <button
            type="button"
            data-testid="agreement-source-template"
            aria-pressed={agreementTemplateId !== null}
            onClick={() => {
              onAgreementFileChange(null);
              onAgreementTemplateIdChange("");
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              agreementTemplateId !== null ? "bg-brand-accent text-white" : "text-gray-500",
            )}
          >
            Use a saved template
          </button>
        </div>

        {agreementTemplateId !== null ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Select
                value={agreementTemplateId}
                onValueChange={(v) => onAgreementTemplateIdChange(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a saved template" />
                </SelectTrigger>
                <SelectContent>
                  {(templates ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!templates?.length && (
                <p className="text-xs text-gray-500">
                  No design templates yet — create one from Documents → Categories, or upload a file
                  instead.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-normal text-gray-500">
                Agreement contents — pre-filled from the details above, edit as needed
              </Label>
              <div className="rounded-md border border-gray-200 bg-white">
                <QuillEditor
                  initialValue={buildAgreementContentFromContract(value, employeeName)}
                  onChange={onAgreementTemplateContentChange}
                  placeholder="Employment agreement contents…"
                />
              </div>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50">
            <Upload className="h-4 w-4 shrink-0" />
            {agreementFile
              ? agreementFile.name
              : existingAgreementDocument
                ? "Replace file…"
                : "Upload signed agreement (PDF or Word)…"}
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => onAgreementFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select
          value={value.status ?? "DRAFT"}
          onValueChange={(v) => set({ status: v as ContractFormState["status"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

const REQUIRED_FIELDS: { key: keyof ContractFormState; label: string }[] = [
  { key: "jobTitle", label: "Job title" },
  { key: "startDate", label: "start date" },
  { key: "employmentTerm", label: "employment term" },
  { key: "employmentType", label: "employment type" },
  { key: "compensationType", label: "compensation type" },
];

/**
 * Names of the required fields still missing from `value`, e.g. ["start date", "employment term"].
 * `hasAgreement` should be true when either a new file was picked or an existing document/URL is
 * already on file — mirrors the backend's AGREEMENT_URL_REQUIRED check for DRAFT → ACTIVE.
 */
export function getMissingContractFields(
  value: ContractFormState,
  hasAgreement: boolean,
): string[] {
  const missing = REQUIRED_FIELDS.filter((f) => !value[f.key]).map((f) => f.label);
  if ((value.status ?? "DRAFT") === "ACTIVE" && !hasAgreement) {
    missing.push("employment agreement");
  }
  return missing;
}

export function isContractFormComplete(value: ContractFormState, hasAgreement: boolean): boolean {
  return getMissingContractFields(value, hasAgreement).length === 0;
}

export function toCreateContractRequest(value: ContractFormState): CreateContractRequest {
  return {
    jobTitle: value.jobTitle ?? "",
    department: value.department ?? null,
    workLocation: value.workLocation ?? null,
    manager: value.manager ?? null,
    reportTo: value.reportTo ?? null,
    startDate: value.startDate ? new Date(value.startDate).toISOString() : "",
    employmentTerm: value.employmentTerm ?? "indefinite",
    endDate: value.endDate ? new Date(value.endDate).toISOString() : null,
    employmentType: value.employmentType ?? "full-time",
    daysPerWeek: value.daysPerWeek ?? null,
    compensationType: value.compensationType ?? "salaried",
    salaryScale: value.salaryScale ?? null,
    currency: value.currency ?? "RWF",
    baseMonthlyRate: value.baseMonthlyRate ?? null,
    grossAnnualRate: value.grossAnnualRate ?? null,
    employmentAgreementUrl: value.employmentAgreementUrl ?? null,
    status: value.status ?? "DRAFT",
    notes: value.notes ?? null,
  };
}
