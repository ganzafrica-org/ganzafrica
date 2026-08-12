import { httpClient } from "@/services/http.service";
import type { OrgTreeNode, SetManagerRequest, Employee, UnresolvedManagerRow } from "@/types/api";

export const orgService = {
  async getOrgTree() {
    const response = await httpClient.get<{ tree: OrgTreeNode[] }>("/hr/org-chart");
    return response.data.tree;
  },
  async setManager(employeeId: string, payload: SetManagerRequest) {
    const response = await httpClient.patch<{ employee: Employee }>(
      `/hr/employees/${employeeId}/manager`,
      payload,
    );
    return response.data.employee;
  },
  async getReports(employeeId: string, direct = true) {
    const response = await httpClient.get<{ reports: Employee[] }>(
      `/hr/employees/${employeeId}/reports`,
      { params: { direct } },
    );
    return response.data.reports;
  },
  async getUnresolved() {
    const response = await httpClient.get<{ unresolved: UnresolvedManagerRow[] }>(
      "/hr/org-chart/unresolved",
    );
    return response.data.unresolved;
  },
};
