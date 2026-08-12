import { contractsService } from "@/services/contracts.service";
import { documentsService } from "@/services/documents.service";
import {
  toCreateContractRequest,
  type ContractFormState,
} from "@/components/sections/contracts/contract-form-fields";
import type { Contract } from "@/types/api";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True once employmentAgreementUrl holds an hr_documents id rather than a pre-uploader raw URL. */
export function isAgreementDocumentId(value: string | null | undefined): value is string {
  return !!value && UUID_RE.test(value);
}

async function uploadAgreement(
  contractId: string,
  jobTitle: string,
  department: string | null,
  file: File,
) {
  return documentsService.createDocument(
    {
      document_name: file.name,
      category: "Contract Templates",
      description: `Signed employment agreement — ${jobTitle}`,
      department: department ?? "General",
      access: {},
      contractId,
    },
    file,
  );
}

/**
 * Create or update a contract, uploading a newly-picked agreement file (if any) as an
 * hr_documents row linked via contract_id (MOD-05's own mechanism for contract-scoped access —
 * see canReadDocument's contractEmployeeId bypass). A document can only reference a contract that
 * already exists, so on create this always creates first (forcing DRAFT if the file isn't
 * uploaded yet and ACTIVE was requested), uploads, then patches the reference + desired status.
 */
export async function saveContractWithAgreement(params: {
  employeeId: string;
  existingContract?: Contract | null;
  form: ContractFormState;
  agreementFile: File | null;
}): Promise<Contract> {
  const { employeeId, existingContract, form, agreementFile } = params;
  const payload = toCreateContractRequest(form);
  const desiredStatus = payload.status ?? "DRAFT";

  if (existingContract) {
    let employmentAgreementUrl = payload.employmentAgreementUrl;
    if (agreementFile) {
      const doc = await uploadAgreement(
        existingContract.id,
        payload.jobTitle,
        payload.department,
        agreementFile,
      );
      employmentAgreementUrl = doc.id;
    }
    return contractsService.updateContract(employeeId, existingContract.id, {
      ...payload,
      employmentAgreementUrl,
    });
  }

  const needsAgreementBeforeActive = !!agreementFile && desiredStatus === "ACTIVE";
  const created = await contractsService.createContract(employeeId, {
    ...payload,
    employmentAgreementUrl: null,
    status: needsAgreementBeforeActive ? "DRAFT" : desiredStatus,
  });

  if (!agreementFile) return created;

  const doc = await uploadAgreement(
    created.id,
    payload.jobTitle,
    payload.department,
    agreementFile,
  );

  return contractsService.updateContract(employeeId, created.id, {
    employmentAgreementUrl: doc.id,
    status: needsAgreementBeforeActive ? "ACTIVE" : undefined,
  });
}
