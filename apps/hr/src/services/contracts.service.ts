import { httpClient } from "@/services/http.service";
import type { Contract, CreateContractRequest, UpdateContractRequest } from "@/types/api";

export const contractsService = {
  async listContracts(employeeId: string) {
    const response = await httpClient.get<Contract[]>(`/hr/employees/${employeeId}/contracts`);
    return response.data;
  },
  async getContract(employeeId: string, contractId: string) {
    const response = await httpClient.get<Contract>(
      `/hr/employees/${employeeId}/contracts/${contractId}`,
    );
    return response.data;
  },
  async createContract(employeeId: string, payload: CreateContractRequest) {
    const response = await httpClient.post<Contract>(
      `/hr/employees/${employeeId}/contracts`,
      payload,
    );
    return response.data;
  },
  async updateContract(employeeId: string, contractId: string, payload: UpdateContractRequest) {
    const response = await httpClient.patch<Contract>(
      `/hr/employees/${employeeId}/contracts/${contractId}`,
      payload,
    );
    return response.data;
  },
  async deleteContract(employeeId: string, contractId: string) {
    await httpClient.delete(`/hr/employees/${employeeId}/contracts/${contractId}`);
  },
};
