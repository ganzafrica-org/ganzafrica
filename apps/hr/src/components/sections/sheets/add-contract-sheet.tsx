"use client";

import { useEffect, useState } from "react";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Button } from "@/components/ui/button";
import { useCreateContract, useUpdateContract } from "@/hooks/useContracts";
import {
  ContractFormFields,
  isContractFormComplete,
  toCreateContractRequest,
  type ContractFormState,
} from "@/components/sections/contracts/contract-form-fields";
import type { Contract } from "@/types/api";

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
  const createContract = useCreateContract(employeeId);
  const updateContract = useUpdateContract(employeeId);
  const [form, setForm] = useState<ContractFormState>(toFormState(contract));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm(toFormState(contract));
    setError(null);
  }, [contract, open]);

  const isSaving = createContract.isPending || updateContract.isPending;

  const handleSave = async () => {
    if (!isContractFormComplete(form)) {
      setError("Job title, start date, term, type and compensation are required.");
      return;
    }
    setError(null);
    try {
      if (isEditing && contract) {
        await updateContract.mutateAsync({
          contractId: contract.id,
          payload: toCreateContractRequest(form),
        });
      } else {
        await createContract.mutateAsync(toCreateContractRequest(form));
      }
      onOpenChange(false);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ?? err?.response?.data?.error ?? "Failed to save contract.",
      );
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
        />
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </ReusableSheet>
  );
}
