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
};
