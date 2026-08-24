"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesService } from "@/services/employees.service";
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdateMyProfileRequest,
} from "@/types/api";
import { toast } from "@/lib/toast";

export interface EmployeesQueryParams {
  search?: string;
  department?: string;
  status?: string;
  employment_type?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "department" | "hired_at";
  sortOrder?: "asc" | "desc";
  active?: "active" | "inactive" | "all";
}

export function useEmployees(params?: EmployeesQueryParams) {
  return useQuery({
    queryKey: ["employees", params],
    queryFn: () => employeesService.getEmployees(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => employeesService.getEmployeeById(id),
    enabled: !!id,
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["employees", "me"],
    queryFn: () => employeesService.getMe(),
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["employees", "departments"],
    queryFn: () => employeesService.listDepartments(),
  });
}

export function useEmployeeStatusCounts(enabled = true) {
  return useQuery({
    queryKey: ["employees", "stats"],
    queryFn: () => employeesService.getStatusCounts(),
    enabled,
  });
}

/** employees/department's headerStats — real per-department counts. */
export function useDepartmentStats() {
  return useQuery({
    queryKey: ["employees", "departments", "stats"],
    queryFn: () => employeesService.getDepartmentStats(),
  });
}

export function useEmployeeLeaves(employeeId: string) {
  return useQuery({
    queryKey: ["employeeLeaves", employeeId],
    queryFn: () => employeesService.getEmployeeLeaves(employeeId),
    enabled: !!employeeId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEmployeeRequest) => employeesService.createEmployee(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created");
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeeRequest }) =>
      employeesService.updateEmployee(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
    },
  });
}

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesService.deactivateEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee deactivated");
    },
  });
}

export function useReactivateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesService.reactivateEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee reactivated");
    },
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => employeesService.resendInvite(id),
    onSuccess: () => {
      toast.success("Invite email resent");
    },
  });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      pictureFile,
    }: {
      payload: UpdateMyProfileRequest;
      pictureFile?: File;
    }) => employeesService.updateMyProfile(payload, pictureFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "me"] });
      toast.success("Profile updated");
    },
  });
}
