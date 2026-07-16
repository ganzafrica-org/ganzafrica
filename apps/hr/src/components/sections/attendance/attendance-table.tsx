import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  MapPin,
  MoreVertical,
  Eye,
  Edit,
  Timer,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "present":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Present</Badge>;
    case "late":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Late</Badge>;
    case "absent":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Absent</Badge>;
    case "on_leave":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">On Leave</Badge>;
    case "pending_approval":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getAttendanceTypeBadge = (type: string) => {
  switch (type) {
    case "office":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Office</Badge>;
    case "field":
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Field Work</Badge>
      );
    case "training":
      return (
        <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Training/Event</Badge>
      );
    case "remote":
      return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">Remote</Badge>;
    case "leave":
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Leave</Badge>;
    case "no_task":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">No Task</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "present":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "late":
      return <AlertCircle className="h-4 w-4 text-amber-600" />;
    case "absent":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "on_leave":
      return <CalendarIcon className="h-4 w-4 text-purple-600" />;
    case "pending_approval":
      return <Clock className="h-4 w-4 text-yellow-600" />;
    default:
      return <Clock className="h-4 w-4 text-gray-600" />;
  }
};

import { AlertCircle } from "lucide-react";

interface AttendanceTableProps {
  data: any[];
  selectedDate: Date;
}

export const AttendanceTable = ({ data, selectedDate }: AttendanceTableProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Daily Attendance - {format(selectedDate, "MMMM d, yyyy")}
        </CardTitle>
        <CardDescription>Real-time attendance tracking across all work types</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Project/Task</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((record) => (
              <TableRow key={record.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                        {record.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{record.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {record.employeeId} • {record.department}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getAttendanceTypeBadge(record.attendanceType)}
                    {record.leaveStatus && (
                      <div className="text-xs text-purple-600">{record.leaveStatus}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    <span className={record.status === "late" ? "text-amber-600" : ""}>
                      {record.checkIn}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{record.checkOut}</TableCell>
                <TableCell className="font-medium">{record.totalHours}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {getStatusBadge(record.status)}
                    {!record.managerApproval && record.status === "pending_approval" && (
                      <div className="text-xs text-amber-600">Awaiting manager approval</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{record.project}</div>
                    <div className="text-xs text-muted-foreground">{record.task}</div>
                    <div className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{record.location}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Record
                      </DropdownMenuItem>
                      {record.status === "pending_approval" && (
                        <DropdownMenuItem className="text-green-600">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve Attendance
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Timer className="mr-2 h-4 w-4" />
                        Manual Check-in/out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
