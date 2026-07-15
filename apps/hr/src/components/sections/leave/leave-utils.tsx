import { Badge } from "@/components/ui/badge";
import type { EmployeeLeaveStatus } from "@/types/employee-leave";

export const getLeaveStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
    case "pending":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getLeaveTypeColor = (type: string) => {
  switch (type) {
    case "Annual Leave":
      return "bg-green-100 text-green-800 border-green-200";
    case "Sick Leave":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Personal Leave":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Maternity Leave":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Study Leave":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const isLeaveStatus = (status: string): status is EmployeeLeaveStatus =>
  status === "pending" || status === "approved" || status === "rejected";
