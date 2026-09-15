"use client";

import { useState } from "react";
import ProfileTab from "@/components/sections/user-profile/profile-tab";
import EditProfileModal from "@/components/sections/user-profile/edit-profile-modal";
import { BalanceCards } from "@/components/sections/leave/balance-cards";
import { getLeaveStatusBadge } from "@/components/sections/leave/leave-utils";
import { useMe } from "@/hooks/useEmployees";
import { useMyLeave } from "@/hooks/useLeaveBalances";

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual Leave",
  SICK: "Sick Leave",
  MATERNITY: "Maternity Leave",
  PATERNITY: "Paternity Leave",
  UNPAID: "Unpaid Leave",
  OTHER: "Other",
};

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState<"profile" | "leave">("profile");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: meData, isLoading: isLoadingProfile, isError: isErrorProfile } = useMe();
  const { data: myLeave, isLoading: isLoadingLeaves, isError: isErrorLeaves } = useMyLeave();

  const requests = myLeave?.requests ?? [];

  return (
    <div className="min-h-screen">
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

            {!isLoadingLeaves && !isErrorLeaves && (
              <div className="space-y-6 pb-6">
                <h2 className="text-xl font-semibold text-foreground">Overview</h2>
                <BalanceCards balances={myLeave?.balances ?? []} />

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Recent requests</h3>
                  {requests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No leave requests yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {requests.slice(0, 5).map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between rounded-lg border border-border p-4"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {LEAVE_TYPE_LABELS[request.type] ?? request.type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.start_date} – {request.end_date}
                            </p>
                          </div>
                          {getLeaveStatusBadge(request.status.toLowerCase())}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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
