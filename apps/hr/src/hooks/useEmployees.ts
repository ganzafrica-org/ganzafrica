"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeesService } from "@/services/employees.service";
import type { CreateEmployeeRequest, UpdateEmployeeRequest } from "@/types/api";

export function useEmployees(params?: {
  search?: string;
  status?: string;
  department?: string;
  country?: string;
  page?: number;
  limit?: number;
}) {
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

export function useEmployeeStats() {
  return useQuery({
    queryKey: ["employeeStats"],
    queryFn: () => employeesService.getEmployeeStats(),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["employees", "me"],
    queryFn: () => employeesService.getMe(),
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
      queryClient.invalidateQueries({ queryKey: ["employeeStats"] });
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
      queryClient.invalidateQueries({ queryKey: ["employeeStats"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => employeesService.deleteEmployee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employeeStats"] });
    },
  });
}
