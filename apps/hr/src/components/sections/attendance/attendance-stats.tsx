import React from "react";
import { StatGrid } from "@/components/sections/stat-grid";
import { Users, AlertCircle, Briefcase, UserCheck } from "lucide-react";

export const AttendanceStats = () => {
  const stats = [
    {
      title: "Today's Attendance",
      value: "94.2%",
      trendText: "78 present, 5 absent",
      icon: Users,
      color: "",
    },
    {
      title: "Late Arrivals",
      value: "5",
      trendText: "6% of present employees",
      icon: AlertCircle,
      color: "",
    },
    {
      title: "Field Workers",
      value: "28",
      trendText: "On project sites today",
      icon: Briefcase,
      color: "from-orange-400 to-orange-500",
    },
    {
      title: "Event Attendance",
      value: "72",
      trendText: "Climate workshop attendees",
      icon: UserCheck,
      color: "from-purple-500 to-indigo-600",
    },
  ];

  return <StatGrid stats={stats} />;
};
