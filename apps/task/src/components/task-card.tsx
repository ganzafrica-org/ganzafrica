"use client";

import { CalendarClock, MessageSquare, Paperclip, Users } from "lucide-react";
import { Task, TeamMember } from "@/lib/types";
import { UserAvatar } from "./user-avatar";

const priorityColor: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
};


export function TaskCard({ task, members, onClick, hidePriority }: { task: Task; members: TeamMember[]; onClick: () => void; hidePriority?: boolean }): React.JSX.Element {
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    console.log('Drag started for task:', task.id, task.title);
    e.dataTransfer.setData("text/task-id", task.id);
    e.dataTransfer.effectAllowed = "move";
    // Add visual feedback
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLButtonElement>) => {
    console.log('Drag ended for task:', task.id);
    e.currentTarget.style.opacity = "1";
  };
  // Build robust assignee list (handles number/string and filters empty ids)
  const assignees = (task.assignees || [])
    .filter((id) => id != null && id !== '')
    .map((id) => {
      const idStr = id.toString();
      const idNum = parseInt(idStr);
      return (
        members.find((m) => m.id === idStr) ||
        members.find((m) => parseInt(m.id) === idNum)
      );
    })
    .filter(Boolean) as TeamMember[];
  const assignedTeam = null; // Team info removed - no longer using mock data

  const getPriorityStyle = () => {
    if (task.priority === 'high') {
      return {
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        borderColor: '#fca5a5',
      };
    } else if (task.priority === 'medium') {
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        borderColor: '#fcd34d',
      };
    } else if (task.priority === 'low') {
      return {
        backgroundColor: '#dcfce7',
        color: '#166534',
        borderColor: '#86efac',
      };
    }
    return {};
  };

  return (
    <button
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className="w-full text-left rounded-xl border border-black/5 bg-white p-2.5 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium leading-snug">{task.title}</div>
        {!hidePriority && (
          <span 
            className="px-2 py-0.5 text-xs rounded-full border"
            style={getPriorityStyle()}
          >
            {task.priority.toUpperCase()}
          </span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {task.labels.map(l => (
          <span key={l.id} className={`px-2 py-0.5 text-xs rounded-full ${l.color}`}>{l.name}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due"}</div>
        <div className="flex items-center gap-3">
          {/* Show up to 2 assignees; if more, show +N */}
          <div className="flex -space-x-2">
            {assignees.slice(0, 2).map(a => (
              <div key={a.id} className="h-6 w-6 rounded-full border-2 border-white overflow-hidden" style={{ backgroundColor: a.color }} title={a.name}>
                <UserAvatar 
                  userId={parseInt(a.id)} 
                  size="sm"
                  className="w-full h-full"
                  fallbackColor={a.color}
                />
              </div>
            ))}
            {assignees.length > 2 && (
              <div className="h-6 w-6 rounded-full border-2 border-white grid place-items-center text-[10px] font-bold" style={{ backgroundColor: '#F8B712', color: '#ffffff' }} title={`${assignees.length - 2} more`}>
                +{assignees.length - 2}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {task.comments?.length || 0}</div>
          <div className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" /> {task.attachments?.length || 0}</div>
        </div>
      </div>
    </button>
  );
}


