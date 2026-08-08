import { httpClient } from "@/services/http.service";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeStats,
  Leave,
  PaginatedResponse,
  UpdateEmployeeRequest,
} from "@/types/api";

export const employeesService = {
  async getEmployees(params?: {
    search?: string;
    status?: string;
    department?: string;
    country?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await httpClient.get<PaginatedResponse<Employee>>("/hr/employees", { params });
    console.log("777777777", response.data);
    return response.data;
  },
  async getEmployeeById(id: string) {
    const response = await httpClient.get<Employee>(`/hr/employees/${id}`);
    return response.data;
  },
  async getEmployeeStats() {
    const response = await httpClient.get<EmployeeStats>("/hr/employees/stats");
    return response.data;
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
  async createEmployee(payload: CreateEmployeeRequest) {
    const response = await httpClient.post<Employee>("/hr/employees", payload);
    return response.data;
  },
  async updateEmployee(id: string, payload: UpdateEmployeeRequest) {
    const response = await httpClient.patch<Employee>(`/hr/employees/${id}`, payload);
    return response.data;
  },
  async deleteEmployee(id: string) {
    await httpClient.delete(`/hr/employees/${id}`);
  },
};
