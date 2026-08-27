import { httpClient } from "@/services/http.service";
import type {
  CreateEmployeeRequest,
  DepartmentStatsSummary,
  Employee,
  EmployeeDirectoryResponse,
  EmployeeStatusCounts,
  Leave,
  UpdateEmployeeRequest,
  UpdateMyProfileRequest,
} from "@/types/api";

export const employeesService = {
  async getEmployees(params?: {
    search?: string;
    department?: string;
    status?: string;
    employment_type?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "department" | "hired_at";
    sortOrder?: "asc" | "desc";
    active?: "active" | "inactive" | "all";
  }) {
    const response = await httpClient.get<EmployeeDirectoryResponse>("/hr/employees", { params });
    console.log("HHHHHHHHHHHHH", response);
    return response.data;
  },
  async getEmployeeById(id: string) {
    const response = await httpClient.get<{ employee: Employee }>(`/hr/employees/${id}`);
    return response.data.employee;
  },
  async getMe() {
    // Backend wraps the payload as { me: Employee }, unlike every other endpoint here.
    const response = await httpClient.get<{ me: Employee }>("/hr/employees/me");
    return response.data.me;
  },
  async getEmployeeLeaves(employeeId: string) {
    const response = await httpClient.get<Leave[]>(`/hr/employees/${employeeId}/leaves`);
    return response.data;
  },
  async listDepartments() {
    const response = await httpClient.get<{ departments: string[] }>("/hr/employees/departments");
    return response.data.departments;
  },
  async getStatusCounts() {
    const response = await httpClient.get<EmployeeStatusCounts>("/hr/employees/stats");
    return response.data;
  },
  async getDepartmentStats() {
    const response = await httpClient.get<DepartmentStatsSummary>(
      "/hr/employees/departments/stats",
    );
    return response.data;
  },
  async createEmployee(payload: CreateEmployeeRequest) {
    const response = await httpClient.post<{ employee: Employee }>("/hr/employees", payload);
    return response.data.employee;
  },
  async updateEmployee(id: string, payload: UpdateEmployeeRequest) {
    const response = await httpClient.patch<{ employee: Employee }>(`/hr/employees/${id}`, payload);
    return response.data.employee;
  },
  async deactivateEmployee(id: string) {
    await httpClient.patch(`/hr/employees/${id}/deactivate`);
  },
  async reactivateEmployee(id: string) {
    await httpClient.patch(`/hr/employees/${id}/reactivate`);
  },
  async resendInvite(id: string) {
    await httpClient.post(`/hr/employees/${id}/resend-invite`);
  },
  /**
   * Sends as multipart/form-data when a new picture file is provided (same pattern as
   * assetsService.createAsset), JSON otherwise.
   */
  async updateMyProfile(payload: UpdateMyProfileRequest, pictureFile?: File) {
    if (pictureFile) {
      const form = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === "picture" || value === undefined || value === null) return;
        form.append(key, String(value));
      });
      form.append("picture", pictureFile);
      // No explicit Content-Type — see assetsService.createAsset for why.
      const response = await httpClient.patch<{ me: Employee }>("/hr/employees/me/profile", form);
      return response.data.me;
    }
    const response = await httpClient.patch<{ me: Employee }>("/hr/employees/me/profile", payload);
    return response.data.me;
  },
};
