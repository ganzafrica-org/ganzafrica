export type EmploymentTerm = "indefinite" | "definite";
export type EmploymentType = "full-time" | "part-time";
export type CompensationType = "hourly" | "salaried";
export type SalaryScale = "annual" | "monthly" | "weekly" | "daily";
export type ContractStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "TERMINATED";

/** Statuses HR may set directly via PATCH. TERMINATED belongs to LCM-02's offboarding flow. */
export const HR_SETTABLE_CONTRACT_STATUSES: ContractStatus[] = ["DRAFT", "ACTIVE", "EXPIRED"];

export interface ContractRecord {
  id: string;
  employeeId: string;
  // Job details
  jobTitle: string;
  department: string | null;
  workLocation: string | null;
  manager: string | null;
  reportTo: string | null;
  // Contract details
  startDate: Date;
  employmentTerm: EmploymentTerm;
  endDate: Date | null;
  employmentType: EmploymentType;
  daysPerWeek: number | null;
  compensationType: CompensationType;
  salaryScale: SalaryScale | null;
  currency: string;
  baseMonthlyRate: string | null;
  grossAnnualRate: string | null;
  /** An `hr_documents.id` once the signed agreement is uploaded (MOD-05's document module owns
   *  the file); a bare external URL for contracts created before the uploader existed. */
  employmentAgreementUrl: string | null;
  status: ContractStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContractInput {
  // Job details
  jobTitle: string;
  department?: string | null;
  workLocation?: string | null;
  manager?: string | null;
  reportTo?: string | null;
  // Contract details
  startDate: Date;
  employmentTerm: EmploymentTerm;
  endDate?: Date | null;
  employmentType: EmploymentType;
  daysPerWeek?: number | null;
  compensationType: CompensationType;
  salaryScale?: SalaryScale | null;
  currency?: string;
  baseMonthlyRate?: string | null;
  grossAnnualRate?: string | null;
  employmentAgreementUrl?: string | null;
  status?: ContractStatus;
  notes?: string | null;
}

export interface UpdateContractInput {
  jobTitle?: string;
  department?: string | null;
  workLocation?: string | null;
  manager?: string | null;
  reportTo?: string | null;
  startDate?: Date;
  employmentTerm?: EmploymentTerm;
  endDate?: Date | null;
  employmentType?: EmploymentType;
  daysPerWeek?: number | null;
  compensationType?: CompensationType;
  salaryScale?: SalaryScale | null;
  currency?: string;
  baseMonthlyRate?: string | null;
  grossAnnualRate?: string | null;
  employmentAgreementUrl?: string | null;
  status?: ContractStatus;
  notes?: string | null;
}
