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
};
