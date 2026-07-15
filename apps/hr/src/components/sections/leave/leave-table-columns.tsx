import { format } from "date-fns";
import { CheckCircle, Eye, Mail, MoreVertical, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@/components/sections/table-component";
import type { EmployeeLeaveRequest } from "@/types/employee-leave";
import { getLeaveStatusBadge, getLeaveTypeColor } from "./leave-utils";

export interface LeaveTableColumnOptions {
  onViewDetails: (request: EmployeeLeaveRequest) => void;
}

export const buildLeaveTableColumns = ({
  onViewDetails,
}: LeaveTableColumnOptions): ColumnDef<EmployeeLeaveRequest>[] => [
  {
    key: "name",
    header: "Employee",
    sortable: true,
    render: (_, request) => (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-green-100 text-green-600 text-xs">
            {request.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{request.name}</div>
          <div className="text-sm text-muted-foreground">{request.department}</div>
        </div>
      </div>
    ),
  },
  {
    key: "leaveType",
    header: "Leave Type",
    sortable: true,
    render: (val) => <Badge className={getLeaveTypeColor(val)}>{val}</Badge>,
  },
  {
    key: "startDate",
    header: "Period",
    sortable: true,
    render: (_, request) => (
      <div className="text-sm">
        {format(new Date(request.startDate), "MMM d")} -{" "}
        {format(new Date(request.endDate), "MMM d, yyyy")}
      </div>
    ),
  },
  {
    key: "days",
    header: "Days",
    sortable: true,
    className: "font-medium",
    render: (val) => `${val} days`,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    render: (val) => getLeaveStatusBadge(val),
  },
  {
    key: "actions",
    header: "Actions",
    render: (_, request) => (
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(request)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            {request.status === "pending" && (
              <>
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <XCircle className="mr-2 h-4 w-4" /> Reject
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" /> Send Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
