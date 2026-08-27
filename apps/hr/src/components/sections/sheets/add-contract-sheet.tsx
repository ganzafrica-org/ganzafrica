"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Button } from "@/components/ui/button";
import { documentsService } from "@/services/documents.service";
import {
  ContractFormFields,
  getMissingContractFields,
  type ContractFormState,
} from "@/components/sections/contracts/contract-form-fields";
import { isAgreementDocumentId, saveContractWithAgreement } from "@/lib/helpers/contract-agreement";
import type { Contract, HrDocument } from "@/types/api";

interface ContractSheetProps {
  employeeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present for edit, absent for create. */
  contract?: Contract | null;
}

function toFormState(contract?: Contract | null): ContractFormState {
  if (!contract) return { currency: "RWF", status: "DRAFT" };
  return {
    jobTitle: contract.jobTitle,
    department: contract.department,
    workLocation: contract.workLocation,
    manager: contract.manager,
    reportTo: contract.reportTo,
    startDate: contract.startDate,
    employmentTerm: contract.employmentTerm,
    endDate: contract.endDate,
    employmentType: contract.employmentType,
    daysPerWeek: contract.daysPerWeek,
    compensationType: contract.compensationType,
    salaryScale: contract.salaryScale,
    currency: contract.currency,
    baseMonthlyRate: contract.baseMonthlyRate,
    grossAnnualRate: contract.grossAnnualRate,
    employmentAgreementUrl: contract.employmentAgreementUrl,
    status: contract.status,
    notes: contract.notes,
  };
}

/** Add/edit sheet for a single employee's contract, reused by the employee detail page's Contract tab. */
export function ContractSheet({ employeeId, open, onOpenChange, contract }: ContractSheetProps) {
  const isEditing = !!contract;
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContractFormState>(toFormState(contract));
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [existingDocument, setExistingDocument] = useState<HrDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(toFormState(contract));
    setAgreementFile(null);
    setExistingDocument(null);
    setError(null);

    if (contract && isAgreementDocumentId(contract.employmentAgreementUrl)) {
      documentsService
        .getDocument(contract.employmentAgreementUrl)
        .then(setExistingDocument)
        .catch(() => setExistingDocument(null));
    }
  }, [contract, open]);

  const hasAgreement = !!agreementFile || !!existingDocument || !!contract?.employmentAgreementUrl;

  const handleViewExistingAgreement = async () => {
    if (!existingDocument) return;
    const { url } = await documentsService.getViewUrl(existingDocument.id);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSave = async () => {
    const missing = getMissingContractFields(form, hasAgreement);
    if (missing.length > 0) {
      setError(`Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`);
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await saveContractWithAgreement({
        employeeId,
        existingContract: contract,
        form,
        agreementFile,
      });
      queryClient.invalidateQueries({ queryKey: ["contracts", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["contracts", "me"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      onOpenChange(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.response?.data?.error ?? "Failed to save contract.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Contract" : "Add Contract"}
      description={
        isEditing
          ? "Update this employee's contract terms."
          : "Create a new contract for this employee."
      }
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-brand-accent hover:bg-brand-accent/90 text-white"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : isEditing ? "Save Changes" : "Create Contract"}
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <ContractFormFields
          value={form}
          onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          agreementFile={agreementFile}
          onAgreementFileChange={setAgreementFile}
          existingAgreementDocument={existingDocument}
          onViewExistingAgreement={existingDocument ? handleViewExistingAgreement : undefined}
        />
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </ReusableSheet>
  );
}
