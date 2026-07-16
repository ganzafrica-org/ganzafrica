import { ChartConfig } from "@/components/ui/chart";
import { UserPlus, Users, Calendar, FileText } from "lucide-react";

// Dummy data for charts
export const recruitmentData = [
  { month: "Jan", applications: 45, hired: 8 },
  { month: "Feb", applications: 52, hired: 12 },
  { month: "Mar", applications: 38, hired: 6 },
  { month: "Apr", applications: 67, hired: 15 },
  { month: "May", applications: 73, hired: 18 },
  { month: "Jun", applications: 59, hired: 14 },
];

export const attendanceData = [
  { day: "Mon", present: 95, absent: 5 },
  { day: "Tue", present: 92, absent: 8 },
  { day: "Wed", present: 98, absent: 2 },
  { day: "Thu", present: 94, absent: 6 },
  { day: "Fri", present: 89, absent: 11 },
];

export const departmentData = [
  { name: "Agriculture", employees: 25, fill: "#10b981" },
  { name: "Environment", employees: 18, fill: "#3b82f6" },
  { name: "Land Management", employees: 12, fill: "#f59e0b" },
  { name: "Administration", employees: 8, fill: "#ef4444" },
  { name: "HR", employees: 5, fill: "#8b5cf6" },
];

export const leaveRequestsData = [
  { week: "W1", approved: 12, pending: 3, rejected: 1 },
  { week: "W2", approved: 8, pending: 5, rejected: 2 },
  { week: "W3", approved: 15, pending: 2, rejected: 0 },
  { week: "W4", approved: 10, pending: 4, rejected: 1 },
];

export const chartConfig = {
  applications: {
    label: "Applications",
    color: "#10b981",
  },
  hired: {
    label: "Hired",
    color: "#3b82f6",
  },
  present: {
    label: "Present",
    color: "#10b981",
  },
  absent: {
    label: "Absent",
    color: "#ef4444",
  },
  approved: {
    label: "Approved",
    color: "#10b981",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
  },
  rejected: {
    label: "Rejected",
    color: "#ef4444",
  },
} satisfies ChartConfig;

// Recent activities dummy data
export const recentActivities = [
  {
    id: 1,
    type: "recruitment",
    message: "New application received for Agricultural Specialist position",
    time: "5 minutes ago",
    status: "new",
  },
  {
    id: 2,
    type: "leave",
    message: "Leave request approved for Marie Claire Nsengimana",
    time: "1 hour ago",
    status: "approved",
  },
  {
    id: 3,
    type: "onboarding",
    message: "Onboarding completed for David Niyonkuru",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 4,
    type: "performance",
    message: "Performance review due for 5 employees",
    time: "3 hours ago",
    status: "due",
  },
];

export const quickActions = [
  { icon: UserPlus, label: "Post New Job", href: "/hr/recruitment/new" },
  { icon: Users, label: "Add Employee", href: "/hr/employees/new" },
  { icon: Calendar, label: "Schedule Interview", href: "/hr/recruitment/interviews" },
  { icon: FileText, label: "Generate Report", href: "/hr/reports" },
];
