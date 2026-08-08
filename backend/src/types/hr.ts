/**
 * HR Module Types
 */

export interface DocumentACL {
  roles?: string[];
  employee_ids?: string[];
  departments?: string[];
}

/** A prior file revision, appended to `hr_documents.versions` when a PATCH replaces the file. */
export interface DocumentVersionEntry {
  key: string;
  version: string;
  uploaded_at: string;
}
