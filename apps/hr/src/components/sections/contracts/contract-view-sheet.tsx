"use client";

import { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DocumentViewer } from "@/components/sections/documents/document-viewer";
import { documentsService } from "@/services/documents.service";
import { isAgreementDocumentId } from "@/lib/helpers/contract-agreement";
import type { Contract, HrDocument } from "@/types/api";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase font-bold text-slate-400">{label}</div>
      <div className="text-sm font-medium text-slate-900">{value ?? "—"}</div>
    </div>
  );
}

function money(currency: string, amount: string | null): string | null {
  if (!amount) return null;
  return `${currency} ${Number(amount).toLocaleString()}`;
}

interface ContractViewSheetProps {
  contract: Contract | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isHr: boolean;
  onEdit?: () => void;
}

/** Read-only single-contract view, opened from a row click in the Contracts tab list. */
export function ContractViewSheet({
  contract,
  open,
  onOpenChange,
  isHr,
  onEdit,
}: ContractViewSheetProps) {
  const [agreementDoc, setAgreementDoc] = useState<HrDocument | null>(null);
  const [legacyUrl, setLegacyUrl] = useState<string | null>(null);

  useEffect(() => {
    setAgreementDoc(null);
    setLegacyUrl(null);
    if (!contract?.employmentAgreementUrl) return;

    if (isAgreementDocumentId(contract.employmentAgreementUrl)) {
      documentsService
        .getDocument(contract.employmentAgreementUrl)
        .then(setAgreementDoc)
        .catch(() => setAgreementDoc(null));
    } else {
      setLegacyUrl(contract.employmentAgreementUrl);
    }
  }, [contract]);

  if (!contract) return null;

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Contract details"
      footer={
        isHr && onEdit ? (
          <Button className="w-full" variant="outline" onClick={onEdit}>
            <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit contract
          </Button>
        ) : undefined
      }
    >
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{contract.jobTitle}</h3>
          <Badge
            variant={contract.status === "ACTIVE" ? "default" : "outline"}
            className="capitalize"
          >
            {contract.status.toLowerCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <Field label="Department" value={contract.department} />
          <Field label="Work Location" value={contract.workLocation} />
          <Field label="Manager" value={contract.manager} />
          <Field label="Report To" value={contract.reportTo} />
          <Field label="Start Date" value={new Date(contract.startDate).toLocaleDateString()} />
          <Field
            label="End Date"
            value={contract.endDate ? new Date(contract.endDate).toLocaleDateString() : null}
          />
          <Field
            label="Employment Term"
            value={<span className="capitalize">{contract.employmentTerm}</span>}
          />
          <Field
            label="Employment Type"
            value={<span className="capitalize">{contract.employmentType}</span>}
          />
          {contract.employmentType === "part-time" && (
            <Field label="Days / Week" value={contract.daysPerWeek} />
          )}
          <Field
            label="Compensation Type"
            value={<span className="capitalize">{contract.compensationType}</span>}
          />
          {contract.salaryScale && (
            <Field
              label="Salary Scale"
              value={<span className="capitalize">{contract.salaryScale}</span>}
            />
          )}
          <Field label="Currency" value={contract.currency} />
          <Field
            label="Base Monthly Rate"
            value={money(contract.currency, contract.baseMonthlyRate)}
          />
          <Field
            label="Gross Annual Rate"
            value={money(contract.currency, contract.grossAnnualRate)}
          />
        </div>

        {contract.notes && (
          <div className="space-y-1 border-t pt-4">
            <div className="text-[10px] uppercase font-bold text-slate-400">Notes</div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{contract.notes}</p>
          </div>
        )}

        <div className="space-y-2 border-t pt-4">
          <h4 className="text-sm font-bold text-slate-700">Employment agreement</h4>
          {agreementDoc && <DocumentViewer document={agreementDoc} />}
          {!agreementDoc && legacyUrl && (
            <a
              href={legacyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-accent hover:underline"
            >
              Open agreement link
            </a>
          )}
          {!agreementDoc && !legacyUrl && (
            <p className="text-sm text-muted-foreground">No agreement on file.</p>
          )}
        </div>
      </div>
    </ReusableSheet>
  );
}
