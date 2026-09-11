import { httpClient } from "@/services/http.service";

export type SignatureFieldType = "signature" | "text" | "date" | "checkbox";

export interface SignatureField {
  key: string;
  label: string;
  type: SignatureFieldType;
  required: boolean;
}

export type SignatureRequestStatus =
  | "draft"
  | "sent"
  | "signed"
  | "declined"
  | "voided"
  | "expired";

// A signing request addressed to the logged-in user, enriched with its template fields so the
// in-app signer can render and complete the document.
export interface MySignatureRequest {
  id: number;
  template_id: number;
  subject: string;
  signer_type: "internal" | "external";
  signer_name: string | null;
  signer_email: string | null;
  status: SignatureRequestStatus;
  signed_file_key: string | null;
  completed_at: string | null;
  created_at: string;
  fields: SignatureField[];
  /** Position in a multi-signer sequence (e.g. HR=1, employee=2). 1 for a lone-signer request. */
  sequence_no: number;
  ref_kind: string | null;
  ref_id: string | null;
}

/** One signer's position in a sequence — what ContractSigningStatus renders as "whose turn". */
export interface SequenceSigner {
  id: number;
  sequence_no: number;
  signer_user_id: number | null;
  signer_name: string | null;
  status: SignatureRequestStatus;
  completed_at: string | null;
}

export interface SignatureTemplate {
  id: number;
  name: string;
  description: string | null;
  file_key: string | null;
  is_active: boolean;
}

/** One member of the designated co-signer pool (settings/signing). */
export interface SignerPoolMember {
  employeeId: string;
  userId: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  addedAt: string;
}

export const signingService = {
  async listMine(): Promise<MySignatureRequest[]> {
    const { data } = await httpClient.get<{ requests: MySignatureRequest[] }>("/hr/signing/my");
    return data.requests;
  },

  async sign(id: number, fieldValues: Record<string, unknown>): Promise<{ signed: boolean }> {
    const { data } = await httpClient.post<{ signed: boolean }>(`/hr/signing/my/${id}/sign`, {
      field_values: fieldValues,
    });
    return data;
  },

  /** HR-only: the full signer sequence for a reference (e.g. a contract). */
  async listByRef(refKind: string, refId: string): Promise<SequenceSigner[]> {
    const { data } = await httpClient.get<{ requests: SequenceSigner[] }>("/hr/signing/requests", {
      params: { ref_kind: refKind, ref_id: refId },
    });
    return data.requests;
  },

  /** Presigned URL for the base document behind a request. Null when the template has no file. */
  async getDocumentUrl(id: number): Promise<string | null> {
    const { data } = await httpClient.get<{ url: string | null }>(`/hr/signing/my/${id}/document`);
    return data.url;
  },

  /** HR-only: templates available to send for signature. */
  async listTemplates(): Promise<SignatureTemplate[]> {
    const { data } = await httpClient.get<{ templates: SignatureTemplate[] }>(
      "/hr/signing/templates",
    );
    return data.templates;
  },

  /** HR-only: send one document to an arbitrary, HR-chosen set of signers. */
  async sendSequence(input: {
    template_id: number;
    subject: string;
    ref_kind: string;
    ref_id: string;
    signerUserIds: number[];
    mode: "sequential" | "parallel";
  }): Promise<SequenceSigner[]> {
    const { data } = await httpClient.post<{ requests: SequenceSigner[] }>(
      "/hr/signing/requests/sequence",
      input,
    );
    return data.requests;
  },

  // --- Designated co-signer pool ---

  async listSignerPool(): Promise<SignerPoolMember[]> {
    const { data } = await httpClient.get<{ pool: SignerPoolMember[] }>("/hr/signing/signer-pool");
    return data.pool;
  },

  async addToSignerPool(employeeId: string): Promise<void> {
    await httpClient.post(`/hr/signing/signer-pool/${employeeId}`);
  },

  async removeFromSignerPool(employeeId: string): Promise<void> {
    await httpClient.delete(`/hr/signing/signer-pool/${employeeId}`);
  },
};
