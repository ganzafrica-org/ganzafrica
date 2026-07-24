import React, { useState } from "react";
import { User, LayoutDashboard, CalendarDays, FileText } from "lucide-react";
import {
  Overview,
  Profile,
  Leaves,
  Contracts,
} from "@/components/sections/sheets/sheet-contents/view-employee-contents";

interface EmployeeSheetProps {
  selectedEmployee: any;
  isEditing: boolean;
  editForm: any;
  setEditForm: (val: any) => void;
}

type ActiveTab = "overview" | "profile" | "leaves" | "contracts";

export const EmployeeSheet = ({
  selectedEmployee,
  isEditing,
  editForm,
  setEditForm,
}: EmployeeSheetProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");

  const sidebarItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "leaves", icon: CalendarDays, label: "Leaves" },
    { id: "contracts", icon: FileText, label: "Contracts" },
  ] as const;

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;
      case "profile":
        return (
          <Profile
            selectedEmployee={selectedEmployee}
            isEditing={isEditing}
            editForm={editForm}
            setEditForm={setEditForm}
          />
        );
      case "leaves":
        return <Leaves />;
      case "contracts":
        return <Contracts />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Side Tabs */}
      <div className="w-16 border-r flex flex-col items-center py-6 gap-6 bg-slate-50/50">
        {sidebarItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            title={label}
            onClick={() => setActiveTab(id)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === id
                ? "bg-white shadow-sm text-brand-accent"
                : "text-slate-400 hover:text-brand-accent"
            }`}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
      </div>

      {/* Active Section */}
      <div className="flex-1 flex flex-col overflow-hidden">{renderSection()}</div>
    </div>
  );
};
