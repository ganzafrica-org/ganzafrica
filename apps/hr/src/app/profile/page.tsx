"use client";

import { useMemo, useState } from "react";
import ProfileTab from "@/components/sections/user-profile/profile-tab";
import LeaveTab from "@/components/sections/user-profile/leave-tab";
import EditProfileModal from "@/components/sections/user-profile/edit-profile-modal";
import { useMe, useEmployeeLeaves } from "@/hooks/useEmployees";
import type { Leave } from "@/types/api";

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

  return (
    <div className="min-h-screen bg-background">
      <div className="py-8">
        <div className="flex gap-8 border-b border-border mb-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "profile"
                ? "text-brand-accent border-brand-accent"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            Job Profile
          </button>
          <button
            onClick={() => setActiveTab("leave")}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "leave"
                ? "text-brand-accent border-brand-accent"
                : "text-muted-foreground border-transparent hover:text-foreground"
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

            {!isLoadingProfile && !isErrorProfile && meData && (
              <ProfileTab employee={meData} onEditClick={() => setIsEditModalOpen(true)} />
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
