"use client";

import { UserAvatar } from './user-avatar';

interface TaskAssignee {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

interface TaskAssigneesProps {
  assignees: TaskAssignee[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TaskAssignees({ 
  assignees, 
  maxDisplay = 3, 
  size = 'sm',
  className = ''
}: TaskAssigneesProps) {
  if (!assignees || assignees.length === 0) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs text-gray-500">Unassigned</span>
      </div>
    );
  }

  const displayAssignees = assignees.slice(0, maxDisplay);
  const remainingCount = assignees.length - maxDisplay;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {displayAssignees.map((assignee) => (
        <UserAvatar
          key={assignee.id}
          userId={assignee.id}
          size={size}
          className="hover:z-10"
        />
      ))}
      {remainingCount > 0 && (
        <div className={`${size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
