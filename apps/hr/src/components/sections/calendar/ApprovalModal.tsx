'use client';

import { useLeaveContext } from '@/components/sections/calendar/LeaveContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDate } from "@/lib/date-utils"

export type LeaveType = 'Paid' | 'Sick' | 'Casual' | 'Emergency';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type ViewMode = 'day' | 'week' | 'month';

export interface TeamMember {
    id: string;
    name: string;
    department: string;
    avatar: string;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveType: LeaveType;
    startDate: Date;
    endDate: Date;
    notes: string;
    status: LeaveStatus;
    requestedAt: Date;
}

export interface LeaveContextType {
    teamMembers: TeamMember[];
    leaveRequests: LeaveRequest[];
    addLeaveRequest: (
        employeeId: string,
        leaveType: LeaveType,
        startDate: Date,
        endDate: Date,
        notes: string
    ) => void;
    updateLeaveStatus: (id: string, status: LeaveStatus) => void;
    getFilteredLeaves: (
        selectedMemberId?: string,
        selectedLeaveType?: LeaveType,
        dateRange?: { start: Date; end: Date }
    ) => LeaveRequest[];
    getTeamMemberById: (id: string) => TeamMember | undefined;
}


interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
}

export function ApprovalModal({ isOpen, onClose, leave }: ApprovalModalProps) {
  const { updateLeaveStatus, getTeamMemberById } = useLeaveContext();

  if (!isOpen || !leave) return null;

  const employee = getTeamMemberById(leave.employeeId);

  const handleApprove = () => {
    updateLeaveStatus(leave.id, 'Approved');
    onClose();
  };

  const handleReject = () => {
    updateLeaveStatus(leave.id, 'Rejected');
    onClose();
  };

  const LEAVE_TYPE_COLORS: Record<string, string> = {
    Paid: 'bg-green-100 text-green-800',
    Sick: 'bg-red-100 text-red-800',
    Casual: 'bg-purple-100 text-purple-800',
    Emergency: 'bg-blue-100 text-blue-800',
  };

  const STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-6">Leave Request Details</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-medium text-gray-600">Employee</label>
            <p className="text-base font-semibold">{employee?.name}</p>
            <p className="text-sm text-gray-500">{employee?.department}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Leave Type</label>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${LEAVE_TYPE_COLORS[leave.leaveType]}`}>
              {leave.leaveType} Leave
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[leave.status]}`}>
              {leave.status}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Date Range</label>
            <p className="text-base">
              {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
            </p>
          </div>

          {leave.notes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Notes</label>
              <p className="text-base text-gray-700 mt-1">{leave.notes}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-600">Requested On</label>
            <p className="text-base">{formatDate(leave.requestedAt)}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {leave.status === 'Pending' && (
            <>
              <Button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
