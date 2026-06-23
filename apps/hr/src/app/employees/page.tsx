// ✅ Data integrated — uses useEmployees()
// Fake data removed: none (page already used API hooks; server-side filters removed for client-side pattern)
// Fields not in API response: avatar (mapped from avatarUrl), name (built from firstName/lastName when missing)

"use client"

import React, {useEffect, useMemo, useState} from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {AlertCircle, Edit, Trash2} from "lucide-react"
import { EmployeeManagementContent } from "@/components/sections/employee/employee-tabs-management"
import { StatsHeader} from "@/components/sections/header";
import { EmployeeSheet } from "@/components/sections/sheets/employee-sheet"
import { ReusableSheet } from "@/components/sections/sheets/sheet-component"
import { useEmployees, useEmployeeStats, useUpdateEmployee, useDeleteEmployee } from "@/hooks/useEmployees"
import { Briefcase } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Employee } from "@/types/api"

const PAGE_SIZE = 10

const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase().replace(/\s+/g, "_")) {
        case 'active':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
        case 'on_leave':
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200">On Leave</Badge>
        case 'inactive':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Inactive</Badge>
        case 'terminated':
            return <Badge variant="outline">{status}</Badge>
        default:
            return <Badge variant="outline">{status ?? "—"}</Badge>
    }
}

const getCountryFlag = (country: string) => {
    const flags = {
        'Rwanda': '🇷🇼',
        'Kenya': '🇰🇪',
        'South Africa': '🇿🇦',
        'Uganda': '🇺🇬',
        'Tanzania': '🇹🇿'
    }
    return flags[country as keyof typeof flags] || '🌍'
}

const normalizeStatus = (status?: string) =>
    (status ?? "").toLowerCase().replace(/\s+/g, "_")

const mapEmployeeForDisplay = (emp: Employee) => ({
    ...emp,
    avatar: emp.avatarUrl ?? "",
    name: emp.name || `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—",
    department: emp.department ?? "—",
    location: emp.location ?? "—",
    country: emp.country ?? "—",
})

const Page = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [departmentFilter, setDepartmentFilter] = useState("all")
    const [countryFilter, setCountryFilter] = useState("all")
    const [page, setPage] = useState(1)

    const { data: employeesResponse, isLoading, isError } = useEmployees()
    const { data: statsData, isLoading: isLoadingStats } = useEmployeeStats()

    const employeeList = Array.isArray(employeesResponse?.data)
        ? employeesResponse.data
        : Array.isArray(employeesResponse)
            ? employeesResponse
            : []

    const normalizedEmployees = useMemo(
        () => employeeList.map(mapEmployeeForDisplay),
        [employeeList]
    )

    const filteredEmployees = normalizedEmployees.filter((employee) => {
        const query = searchTerm.toLowerCase()
        const matchesSearch =
            !query ||
            employee.name?.toLowerCase().includes(query) ||
            employee.email?.toLowerCase().includes(query) ||
            employee.position?.toLowerCase().includes(query) ||
            employee.employeeId?.toLowerCase().includes(query)
        const matchesStatus =
            statusFilter === "all" || normalizeStatus(employee.status) === statusFilter
        const matchesDepartment =
            departmentFilter === "all" || (employee.department ?? "—") === departmentFilter
        const matchesCountry =
            countryFilter === "all" || (employee.country ?? "—") === countryFilter
        return matchesSearch && matchesStatus && matchesDepartment && matchesCountry
    })

    const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE))
    const paginatedEmployees = filteredEmployees.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    )

    const countries = useMemo(
        () =>
            Array.from(
                new Set(normalizedEmployees.map((emp) => emp.country).filter((c) => c && c !== "—"))
            ).sort(),
        [normalizedEmployees]
    )

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<any>(null)

    const updateMutation = useUpdateEmployee()
    const deleteMutation = useDeleteEmployee()

    const handleSaveEdit = async () => {
        try {
            await updateMutation.mutateAsync({
                id: selectedEmployee.id,
                payload: editForm
            })
            setIsEditing(false)
            setSelectedEmployee(editForm)
        } catch (error) {
            console.error("Save failed", error)
        }
    }

    const mappedStats = statsData ? [
        {
            icon: Briefcase,
            label: "Total Employee",
            value: statsData.total.toString(),
        },
        {
            icon: Briefcase,
            label: "Active workers",
            value: statsData.active.toString(),
        },
        {
            icon: Briefcase,
            label: "On Leave",
            value: statsData.onLeave.toString(),
        },
        {
            icon: Briefcase,
            label: "New This Month",
            value: statsData.newThisMonth.toString(),
        },
    ] : []

    const handleDeleteEmployee = async (id: string) => {
        setShowDeleteConfirm(true)
    }

    const confirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(selectedEmployee.id)
            setShowDeleteConfirm(false)
            setShowDetailsDialog(false)
            setSelectedEmployee(null)
        } catch (error) {
            console.error("Delete failed", error)
        }
    }

    const sections = EmployeeManagementContent({
        searchTerm, setSearchTerm,
        statusFilter, setStatusFilter,
        departmentFilter, setDepartmentFilter,
        countryFilter, setCountryFilter,
        filteredEmployees: paginatedEmployees,
        setSelectedEmployee: (emp: any) => {
            setSelectedEmployee(emp)
            setSelectedEmployeeId(emp.id)
        },
        setShowDetailsDialog,
        setIsEditing,
        setEditForm,
        handleDeleteEmployee,
        countries,
        getCountryFlag,
        getStatusBadge,
    });


    const [scrolled, setScrolled] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        setPage(1)
    }, [searchTerm, statusFilter, departmentFilter, countryFilter])

    useEffect(() => {
        const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null

        const onScroll = () => {
            const y = mainEl ? mainEl.scrollTop : window.scrollY
            setScrolled(y > 10)
        }

        onScroll()
        if (mainEl) {
            mainEl.addEventListener("scroll", onScroll, { passive: true })
        }
        window.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            if (mainEl) {
                mainEl.removeEventListener("scroll", onScroll)
            }
            window.removeEventListener("scroll", onScroll)
        }
    }, [])


    return (
        <div className="min-h-screen flex flex-col w-full bg-[#f6f8fb] dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="space-y-6">
                <StatsHeader
                    title="Employee"
                    subtitle="Manage your team"
                    scrolled={scrolled}
                    stats={mappedStats}
                    isLoading={isLoadingStats}
                />
                <Tabs defaultValue="employees" className="flex flex-col">

                    <div>{sections.renderFilterBar()}</div>

                    <TabsContent value="employees">
                        {isLoading && (
                            <div className="flex items-center justify-center py-12 text-muted-foreground">
                                Loading...
                            </div>
                        )}

                        {isError && (
                            <div className="flex items-center justify-center py-12 text-red-500">
                                Failed to load data. Please try again.
                            </div>
                        )}

                        {!isLoading && !isError && (
                            <>
                                {sections.renderEmployeeDirectory()}
                                {totalPages > 1 && (
                                    <div className="flex justify-center gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <span className="flex items-center px-4 py-2 bg-white rounded-md border">
                                            Page {page} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="departments">
                        {!isLoading && !isError && sections.renderDepartmentOverview()}
                    </TabsContent>

                    <TabsContent value="org-chart">
                        {!isLoading && !isError && sections.renderOrgChart()}
                    </TabsContent>
                </Tabs>


                {showDetailsDialog && selectedEmployee && (
                    <ReusableSheet
                        open={showDetailsDialog}
                        onOpenChange={setShowDetailsDialog}
                        footer={
                            <div className="flex w-full gap-3">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="flex-1 border-red-500 text-red-500 hover:text-white hover:bg-red-600 shadow-md shadow-red-200"
                                    onClick={() => handleDeleteEmployee(selectedEmployee.id)}
                                >
                                    <Trash2 className="h-4 w-4" /> {isEditing ? " Deleting employee" : " Delete"}
                                </Button>
                                <Button
                                    className="flex-1 bg-transparent border border-brand-accent hover:border-none hover:bg-brand-accent text-brand-accent hover:text-white shadow-md shadow-blue-200"
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSaveEdit()
                                        } else {
                                            setIsEditing(true)
                                            setEditForm({ ...selectedEmployee })
                                        }
                                    }}
                                >
                                    <Edit className="h-4 w-4" /> {isEditing ? "Save Changes" : "Edit"}
                                </Button>
                            </div>
                        }
                    >
                        <EmployeeSheet
                            selectedEmployee={selectedEmployee}
                            isEditing={isEditing}
                            editForm={editForm}
                            setEditForm={setEditForm}
                        />
                    </ReusableSheet>
                )}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <Trash2 className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">Delete Employee</h3>
                                    <p className="text-sm text-slate-500">This action cannot be undone.</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-600">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-slate-900">{selectedEmployee?.name}</span>?
                                They will be permanently removed from the system.
                            </p>

                            <div className="flex gap-3 pt-1">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    onClick={confirmDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Page;
