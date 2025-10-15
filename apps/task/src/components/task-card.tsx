"use client";

import { CalendarClock, MessageSquare, Paperclip, Users } from "lucide-react";
import { Task, TeamMember } from "@/lib/types";
import { mockTeams } from "@/lib/teams-data";

const priorityColor: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
};


export function TaskCard({ task, members, onClick, hidePriority }: { task: Task; members: TeamMember[]; onClick: () => void; hidePriority?: boolean }): React.JSX.Element {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/task-id", task.id);
    e.dataTransfer.effectAllowed = "move";
  };
  const assignees = task.assignees.map(id => members.find(m => m.id === id)).filter(Boolean) as TeamMember[];
  const assignedTeam = task.teamId ? mockTeams.find(t => t.id === task.teamId) : null;

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
      onClick={onClick}
      className="w-full text-left rounded-xl border border-black/5 bg-white p-2.5 shadow-sm hover:shadow-md transition">
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
          {/* Display team profile if task has team, otherwise show member avatars */}
          {assignedTeam ? (
            <div 
              className="h-6 w-6 rounded-full border-2 border-white grid place-items-center text-[10px] font-bold"
              style={{ 
                backgroundColor: assignedTeam.color,
                color: '#ffffff'
              }}
              title={`${assignedTeam.name} - ${assignees.length} member(s)`}
            >
              {assignedTeam.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          ) : (
            <div className="flex -space-x-2">
              {assignees.map(a => (
                <div 
                  key={a.id} 
                  className="h-6 w-6 rounded-full border-2 border-white grid place-items-center text-[10px]"
                  style={{ backgroundColor: a.color, color: '#ffffff' }}
                  title={a.name}
                >
                  {a.initials}
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {task.comments.length}</div>
          <div className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" /> {task.attachments.length}</div>
        </div>
      </div>
    </button>
  );
}


