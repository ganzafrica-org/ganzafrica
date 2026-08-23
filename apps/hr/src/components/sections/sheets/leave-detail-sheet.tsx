"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LeaveRequestsTable } from "@/components/sections/leave/leave-requests-table";
import { LeaveAttachments } from "@/components/sections/leave/leave-attachments";
import type { EmployeeLeaveRequest } from "@/types/employee-leave";

export interface LeaveDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: EmployeeLeaveRequest;
  onViewDetails: (request: EmployeeLeaveRequest) => void;
}

export function LeaveDetailSheet({
  open,
  onOpenChange,
  request,
  onViewDetails,
}: LeaveDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg md:max-w-xl"
      >
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle className="text-base font-semibold">Leave Request Details</SheetTitle>
          <SheetDescription>
            Complete information for {request.name}&apos;s leave request
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 px-6 py-5">
          <LeaveRequestsTable
            data={[request]}
            onViewDetails={onViewDetails}
            columnsToHide={["actions"]}
            showPagination={false}
          />

          <div className="grid gap-4 rounded-md border bg-slate-50/50 p-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Employee ID</Label>
              <p className="text-sm text-muted-foreground">{request.employeeId}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Applied Date</Label>
              <p className="text-sm text-muted-foreground">
                {format(new Date(request.appliedDate), "MMMM d, yyyy")}
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm font-medium">Reason</Label>
              <p className="text-sm text-muted-foreground">{request.reason}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Approver</Label>
              <p className="text-sm text-muted-foreground">{request.approver}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Covering Employee</Label>
              <p className="text-sm text-muted-foreground">{request.coveringEmployee}</p>
            </div>
          </div>

          <LeaveAttachments leaveId={request.realId} />
        </div>

        <SheetFooter className="border-t bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {request.status === "pending" && (
            <Button className="bg-green-600 hover:bg-green-700">Review Request</Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
