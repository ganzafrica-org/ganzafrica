// ✅ Data integrated — uses useMe() / useEmployeeLeaves()
// Fake data removed: profileData from @/data/employee-data
// Fields not in API response: title (mapped from position), hireDate (mapped from joinDate), workPhone/workEmail (mapped from phone/email), officeLocation (mapped from location), avatar (mapped from avatarUrl), leave card fields (available, pending, estimated, unit — fallback "—")

"use client";

import { useMemo, useState } from "react";
import ProfileTab from "@/components/sections/user-profile//profile-tab";
import LeaveTab from "@/components/sections/user-profile//leave-tab";
import EditProfileModal from "@/components/sections/user-profile/edit-profile-modal";
import { useMe, useEmployeeLeaves } from "@/hooks/useEmployees";
import type { Employee, Leave } from "@/types/api";

const mapEmployeeToProfile = (emp: Employee) => ({
  id: emp.employee_number ?? emp.id,
  name: `${emp.first_name} ${emp.last_name}`.trim(),
  title: emp.job_title ?? "—",
  department: emp.department ?? "—",
  status: emp.status,
  hireDate: emp.hired_at ? new Date(emp.hired_at).toLocaleDateString() : "—",
  workPhone: emp.phone ?? "—",
  workEmail: emp.work_email ?? "—",
  officeLocation: [emp.home_city, emp.home_country].filter(Boolean).join(", ") || "—",
  avatar: emp.picture ?? "",
});

const mapLeaveToCard = (leave: Leave) => ({
  id: leave.id,
  name: leave.type ?? "—",
  status: leave.status ?? "—",
  available: "—",
  pending: "—",
  estimated: "—",
  unit: "days",
  leaveFrom: leave.startDate ?? "—",
  leaveTo: leave.endDate ?? "—",
  type: leave.type ?? "—",
});

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<"profile" | "leave">("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: meData, isLoading: isLoadingProfile, isError: isErrorProfile } = useMe();
  const employeeId = meData?.id ?? "";
  const {
    data: leavesResponse,
    isLoading: isLoadingLeaves,
    isError: isErrorLeaves,
  } = useEmployeeLeaves(employeeId);

  const leaves = useMemo(() => {
    const leaveList = Array.isArray(leavesResponse) ? leavesResponse : [];
    return leaveList.map(mapLeaveToCard);
  }, [leavesResponse]);

  const employee = useMemo(() => (meData ? mapEmployeeToProfile(meData) : null), [meData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "profile"
                ? "text-brand-accent border-brand-accent"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Job Profile
          </button>
          <button
            onClick={() => setActiveTab("leave")}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "leave"
                ? "text-brand-accent border-brand-accent"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            Leave
          </button>
        </div>

        {activeTab === "profile" && (
          <>
            {isLoadingProfile && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Loading...
              </div>
            )}

            {isErrorProfile && (
              <div className="flex items-center justify-center py-12 text-red-500">
                Failed to load data. Please try again.
              </div>
            )}

            {!isLoadingProfile && !isErrorProfile && employee && (
              <ProfileTab employee={employee} onEditClick={() => setIsEditModalOpen(true)} />
            )}
          </>
        )}

        {activeTab === "leave" && (
          <>
            {isLoadingLeaves && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                Loading...
              </div>
            )}

            {isErrorLeaves && (
              <div className="flex items-center justify-center py-12 text-red-500">
                Failed to load data. Please try again.
              </div>
            )}

            {!isLoadingLeaves && !isErrorLeaves && <LeaveTab leaves={leaves} />}
          </>
        )}
      </div>

      {meData && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employee={meData}
        />
      )}
    </div>
  );
}
