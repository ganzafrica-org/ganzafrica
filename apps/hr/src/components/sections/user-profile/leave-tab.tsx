"use client";

import { Calendar } from "lucide-react";

interface LeaveTabProps {
  leaves: any[];
}

export default function LeaveTab({ leaves }: LeaveTabProps) {
  return (
    <div className="space-y-6 pb-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Overview</h2>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground/80 rounded-lg hover:bg-muted/50 font-medium">
            <Calendar size={18} />
            View Calendar
          </button>
          <button className="px-4 py-2 bg-brand-accent text-white rounded-lg hover:bg-brand-accent font-medium">
            Apply for leave
          </button>
        </div>
      </div>

      {/* Leave Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaves.slice(0, 4).map((leave) => (
          <div key={leave.id} className="bg-card rounded-lg border border-border p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {leave.status}
            </p>
            <h3 className="text-lg font-semibold text-foreground mb-4">{leave.name}</h3>

            <div className="mb-4">
              <p className="text-4xl font-bold text-brand-accent">
                {leave.available}
                <span className="text-sm font-normal text-muted-foreground ml-1">{leave.unit}</span>
              </p>
            </div>

            <div className="flex gap-4 text-sm mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="font-medium text-foreground">{leave.pending}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estimated</p>
                <p className="font-medium text-foreground">{leave.estimated}</p>
              </div>
            </div>

            <a href="#" className="text-brand-accent hover:text-brand-accent text-sm font-medium">
              View Details
            </a>
          </div>
        ))}

        {/* Pending Leave Card */}
        {leaves[5] && (
          <div className="bg-card rounded-lg border border-border p-6">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
              {leaves[5].status}
            </p>
            <h3 className="text-lg font-semibold text-foreground mb-4">{leaves[5].type}</h3>

            <div className="mb-4">
              <p className="text-2xl font-bold text-orange-600">
                {leaves[5].pending}{" "}
                <span className="text-sm font-normal text-muted-foreground">{leaves[5].unit}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">Applied on {leaves[5].leaveFrom}</p>
            </div>

            <div className="flex gap-4 text-sm mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Leave From</p>
                <p className="font-medium text-foreground">{leaves[5].leaveFrom}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Leave To</p>
                <p className="font-medium text-foreground">{leaves[5].leaveTo}</p>
              </div>
            </div>

            <a href="#" className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View Details
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
