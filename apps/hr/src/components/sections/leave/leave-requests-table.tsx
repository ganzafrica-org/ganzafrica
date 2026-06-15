"use client"

import { useMemo } from "react"
import { DataTable } from "@/components/sections/table-component"
import type { EmployeeLeaveRequest } from "@/types/employee-leave"
import { buildLeaveTableColumns } from "./leave-table-columns"

export interface LeaveRequestsTableProps {
    data: EmployeeLeaveRequest[]
    onRowClick?: (request: EmployeeLeaveRequest) => void
    onViewDetails: (request: EmployeeLeaveRequest) => void
    columnsToHide?: string[]
    showPagination?: boolean
    className?: string
}

export function LeaveRequestsTable({
    data,
    onRowClick,
    onViewDetails,
    columnsToHide,
    showPagination = true,
    className,
}: LeaveRequestsTableProps) {
    const columns = useMemo(
        () => buildLeaveTableColumns({ onViewDetails }),
        [onViewDetails]
    )

    return (
        <DataTable
            columns={columns}
            data={data}
            onRowClick={onRowClick}
            showToolbar={false}
            searchable={false}
            showPagination={showPagination}
            columnsToHide={columnsToHide}
            className={className}
        />
    )
}
