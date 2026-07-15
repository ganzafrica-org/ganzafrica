// ✅ Data integrated — uses useMe() / useEmployeeLeaves()
// Fake data removed: profileData from @/data/employee-data
// Fields not in API response: title (mapped from position), hireDate (mapped from joinDate), workPhone/workEmail (mapped from phone/email), officeLocation (mapped from location), avatar (mapped from avatarUrl), leave card fields (available, pending, estimated, unit — fallback "—")

"use client";

import { useEffect, useMemo, useState } from "react";
import ProfileTab from "@/components/sections/user-profile//profile-tab";
import LeaveTab from "@/components/sections/user-profile//leave-tab";
import EditProfileModal from "@/components/sections/user-profile/edit-profile-modal";
import { useMe, useEmployeeLeaves } from "@/hooks/useEmployees";
import type { Employee, Leave } from "@/types/api";

const mapEmployeeToProfile = (emp: Employee) => ({
  id: emp.employeeId ?? emp.id ?? "—",
  name: emp.name || `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() || "—",
  title: emp.position ?? "—",
  department: emp.department ?? "—",
  status: emp.status ?? "—",
  hireDate: emp.joinDate ?? "—",
  workPhone: emp.phone ?? "—",
  workEmail: emp.email ?? "—",
  officeLocation: emp.location ?? "—",
  avatar: emp.avatarUrl ?? "",
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
  const [employee, setEmployee] = useState<any>(null);

  const { data: meData, isLoading: isLoadingProfile, isError: isErrorProfile } = useMe();
  const employeeId = meData?.id ?? "";
  const {
    data: leavesResponse,
    isLoading: isLoadingLeaves,
    isError: isErrorLeaves,
  } = useEmployeeLeaves(employeeId);

  const leaveList = Array.isArray(leavesResponse) ? leavesResponse : [];
  const leaves = useMemo(() => leaveList.map(mapLeaveToCard), [leaveList]);

  useEffect(() => {
    if (meData) {
      setEmployee(mapEmployeeToProfile(meData));
    }
  }, [meData]);

  const handleSaveProfile = (updatedEmployee: any) => {
    setEmployee(updatedEmployee);
  };

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

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        employee={employee}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
