"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesService } from "@/services/employees.service";
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdateMyProfileRequest,
} from "@/types/api";

export interface EmployeesQueryParams {
  search?: string;
  department?: string;
  status?: string;
  employment_type?: string;
  page?: number;
  limit?: number;
  sortBy?: "name" | "department" | "hired_at";
  sortOrder?: "asc" | "desc";
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

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateMyProfileRequest) => employeesService.updateMyProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "me"] });
    },
  });
}
