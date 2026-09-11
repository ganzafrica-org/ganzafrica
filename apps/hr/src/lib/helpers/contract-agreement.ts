import { contractsService } from "@/services/contracts.service";
import { documentsService } from "@/services/documents.service";
import { documentCategoryTemplatesService } from "@/services/document-category-templates.service";
import { renderBrandedDocumentHtml } from "@/lib/helpers/document-branding";

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

/** Creates the contract-scoped hr_documents row (MOD-05's own mechanism for contract-scoped
 *  access — see canReadDocument's contractEmployeeId bypass) either from an uploaded file or by
 *  generating one from a saved (branding) Category Template + the agreement content the user
 *  wrote — never both, mirroring the backend's own mutual-exclusivity check in
 *  document.service.ts's createDocument. */
async function attachAgreement(
  contractId: string,
  jobTitle: string,
  department: string | null,
  source: { file: File } | { templateId: string; content: string },
) {
  const base = {
    category: "Contract Templates" as const,
    department: department ?? "General",
    access: {},
    contractId,
  };

  if ("file" in source) {
    return documentsService.createDocument(
      {
        ...base,
        document_name: source.file.name,
        description: `Signed employment agreement — ${jobTitle}`,
      },
      source.file,
    );
  }

  const template = await documentCategoryTemplatesService.getById(source.templateId);
  const documentName = `Employment agreement — ${jobTitle}`;
  const html = renderBrandedDocumentHtml(template, documentName, source.content);
  const generatedFile = new File([html], `${documentName}.html`, { type: "text/html" });

  return documentsService.createDocument(
    {
      ...base,
      document_name: documentName,
      description: `Employment agreement — ${jobTitle} (generated from ${template.name})`,
    },
    generatedFile,
  );
}

/**
 * Create or update a contract, attaching a newly-picked agreement (uploaded file or a saved
 * template) if any. A document can only reference a contract that already exists, so on create
 * this always creates first (forcing DRAFT if the agreement isn't attached yet and ACTIVE was
 * requested), attaches, then patches the reference + desired status.
 */
export async function saveContractWithAgreement(params: {
  employeeId: string;
  existingContract?: Contract | null;
  form: ContractFormState;
  agreementFile: File | null;
  /** Non-null (possibly "") while "use a saved template" is selected; the id of the chosen
   *  Category Template once one is picked. Combined with agreementTemplateContent to generate
   *  the agreement document at save time. Mutually exclusive with agreementFile. */
  agreementTemplateId: string | null;
  /** The agreement body written alongside agreementTemplateId — see ContractFormFields'
   *  buildAgreementContentFromContract for how it's pre-filled. */
  agreementTemplateContent: string;
}): Promise<Contract> {
  const {
    employeeId,
    existingContract,
    form,
    agreementFile,
    agreementTemplateId,
    agreementTemplateContent,
  } = params;
  const payload = toCreateContractRequest(form);
  const desiredStatus = payload.status ?? "DRAFT";

  const source: { file: File } | { templateId: string; content: string } | null = agreementFile
    ? { file: agreementFile }
    : agreementTemplateId
      ? { templateId: agreementTemplateId, content: agreementTemplateContent }
      : null;

  if (existingContract) {
    let employmentAgreementUrl = payload.employmentAgreementUrl;
    if (source) {
      const doc = await attachAgreement(
        existingContract.id,
        payload.jobTitle,
        payload.department,
        source,
      );
      employmentAgreementUrl = doc.id;
    }
    return contractsService.updateContract(employeeId, existingContract.id, {
      ...payload,
      employmentAgreementUrl,
    });
  }

  const needsAgreementBeforeActive = !!source && desiredStatus === "ACTIVE";
  const created = await contractsService.createContract(employeeId, {
    ...payload,
    employmentAgreementUrl: null,
    status: needsAgreementBeforeActive ? "DRAFT" : desiredStatus,
  });

  if (!source) return created;

  const doc = await attachAgreement(created.id, payload.jobTitle, payload.department, source);
  return contractsService.updateContract(employeeId, created.id, {
    employmentAgreementUrl: doc.id,
    status: needsAgreementBeforeActive ? "ACTIVE" : undefined,
  });
}
