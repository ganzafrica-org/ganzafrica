import { httpClient } from "@/services/http.service";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeDirectoryResponse,
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
  }) {
    const response = await httpClient.get<EmployeeDirectoryResponse>("/hr/employees", { params });
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
  async createEmployee(payload: CreateEmployeeRequest) {
    const response = await httpClient.post<{ employee: Employee }>("/hr/employees", payload);
    return response.data.employee;
  },
  async updateEmployee(id: string, payload: UpdateEmployeeRequest) {
    const response = await httpClient.patch<{ employee: Employee }>(`/hr/employees/${id}`, payload);
    return response.data.employee;
  },
  async updateMyProfile(payload: UpdateMyProfileRequest) {
    const response = await httpClient.patch<{ me: Employee }>("/hr/employees/me/profile", payload);
    return response.data.me;
  },
};
