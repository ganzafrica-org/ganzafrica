export type ContractType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
export type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED";

export interface ContractRecord {
  id: string;
  employeeId: string;
  type: ContractType;
  startDate: Date;
  endDate: Date | null;
  salary: string;
  currency: string;
  status: ContractStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContractInput {
  type: ContractType;
  startDate: Date;
  endDate?: Date | null;
  salary: string;
  currency?: string;
  status?: ContractStatus;
  notes?: string | null;
}

export interface UpdateContractInput {
  type?: ContractType;
  startDate?: Date;
  endDate?: Date | null;
  salary?: string;
  currency?: string;
  status?: ContractStatus;
  notes?: string | null;
}
