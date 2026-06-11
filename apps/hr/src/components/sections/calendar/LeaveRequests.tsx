'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLeaveContext } from './LeaveContext';
import { useState } from 'react';
import { ViewEditDeleteDrawer } from './ViewEditDeleteDrawer';
import { LeaveRequest } from '@/types/leave';
import { formatDate } from '@/lib/date-utils';

export function LeaveRequests() {
  const { leaveRequests } = useLeaveContext();
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleRequestClick = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setIsDrawerOpen(true);
  };

  const emojiMap: Record<string, string> = {
    'Annual Leave': '🌴',
    'Sick Leave': '🤒',
    'Sick': '🤒',
    'Emergency': '⚡',
    'Paid': '💰',
    'Casual': '🏖️',
  };

  return (
    <div className="bg-white">
      <div className="space-y-4">
        {leaveRequests.slice(0, 5).map((request) => (
          <Card 
            key={request.id} 
            className="p-4 bg-white border border-gray-100 shadow-none hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => handleRequestClick(request)}
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center text-lg transition-colors">
                  {emojiMap[request.leaveType] || '📅'}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {formatDate(new Date(request.startDate))}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {request.leaveType}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs shrink-0 border-0 ${
                      request.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      request.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {request.status}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <ViewEditDeleteDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedRequest}
        type="LEAVE"
      />
    </div>
  );
}
