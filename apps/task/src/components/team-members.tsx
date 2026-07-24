"use client";

import React from "react";
import { UserAvatar } from "./user-avatar";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

interface TeamMembersProps {
  members: TeamMember[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showNames?: boolean;
}

export function TeamMembers({
  members,
  maxDisplay = 5,
  size = "md",
  className = "",
  showNames = false,
}: TeamMembersProps): React.JSX.Element {
  if (!members || members.length === 0) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-gray-500">No members</span>
      </div>
    );
  }

  const displayMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {displayMembers.map((member) => (
        <UserAvatar
          key={member.id}
          userId={member.id}
          size={size}
          showName={showNames}
          nameClassName="text-sm font-medium text-gray-700"
          className="hover:z-10"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={`${size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : "w-12 h-12"} rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
