"use client";

import { useState, useRef } from "react";
import { CalendarClock, MessageSquare, Paperclip, Users } from "lucide-react";
import { Task, TeamMember } from "@/lib/types";
import { UserAvatar } from "./user-avatar";

const priorityColor: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export function TaskCard({
  task,
  members,
  onClick,
  hidePriority,
  isManager = false,
}: {
  task: Task;
  members: TeamMember[];
  onClick: () => void;
  hidePriority?: boolean;
  isManager?: boolean;
}): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const justDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Store initial mouse position to detect if it's a drag or click
    setDragStartPos({ x: e.clientX, y: e.clientY });
    justDraggedRef.current = false;
  };

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/task-id", task.id);
    e.dataTransfer.effectAllowed = "move";
    // Add visual feedback
    e.currentTarget.style.opacity = "0.5";
    // Prevent click event from firing after drag
    e.dataTransfer.setData("text/plain", ""); // Required for Firefox
  };

  const handleDragEnd = (e: React.DragEvent<HTMLButtonElement>) => {
    setIsDragging(false);
    setDragStartPos(null);
    e.currentTarget.style.opacity = "1";
    // Mark that we just dragged to prevent click
    justDraggedRef.current = true;
    // Reset after a short delay
    setTimeout(() => {
      justDraggedRef.current = false;
    }, 200);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent click if we just dragged
    if (justDraggedRef.current || isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (dragStartPos) {
      const deltaX = Math.abs(e.clientX - dragStartPos.x);
      const deltaY = Math.abs(e.clientY - dragStartPos.y);
      // If mouse moved more than 5px, consider it a drag, not a click
      if (deltaX < 5 && deltaY < 5) {
        onClick();
      }
    } else {
      // If no drag start pos recorded, it's a normal click
      onClick();
    }
    setDragStartPos(null);
  };
  // Build robust assignee list (handles number/string and filters empty ids)
  const assignees = (task.assignees || [])
    .filter((id) => id != null && id !== "")
    .map((id) => {
      const idStr = id.toString();
      const idNum = parseInt(idStr);
      return members.find((m) => m.id === idStr) || members.find((m) => parseInt(m.id) === idNum);
    })
    .filter(Boolean) as TeamMember[];
  const assignedTeam = null; // Team info removed - no longer using mock data

  const getPriorityStyle = () => {
    if (task.priority === "high") {
      return {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        borderColor: "#fca5a5",
      };
    } else if (task.priority === "medium") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
        borderColor: "#fcd34d",
      };
    } else if (task.priority === "low") {
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
        borderColor: "#86efac",
      };
    }
    return {};
  };

  // Disable dragging for overdue tasks if user is not a manager
  const isDraggable = !(task.status === "overdue" && !isManager);

  return (
    <button
      draggable={isDraggable}
      onMouseDown={handleMouseDown}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      onClick={handleClick}
      type="button"
      className={`w-full text-left rounded-lg sm:rounded-xl border border-black/5 bg-white p-2 sm:p-2.5 shadow-sm hover:shadow-md transition touch-manipulation ${
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed opacity-75"
      }`}
      style={{ userSelect: "none" }}
      title={!isDraggable ? "Only managers can update overdue tasks" : undefined}
    >
      <div className="flex items-start sm:items-center justify-between gap-2">
        <div className="font-medium text-sm sm:text-base leading-snug flex-1 min-w-0">
          {task.title}
        </div>
        {!hidePriority && (
          <span
            className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full border flex-shrink-0"
            style={getPriorityStyle()}
          >
            {task.priority.toUpperCase()}
          </span>
        )}
      </div>
      {task.labels && task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span
              key={l.id}
              className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${l.color}`}
            >
              {l.name}
            </span>
          ))}
        </div>
      )}
      <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs text-gray-500 gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <CalendarClock className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <span className="truncate">
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due"}
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Show up to 2 assignees; if more, show +N */}
          {assignees.length > 0 && (
            <div className="flex -space-x-1.5 sm:-space-x-2">
              {assignees.slice(0, 2).map((a) => (
                <div
                  key={a.id}
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white overflow-hidden"
                  style={{ backgroundColor: a.color }}
                  title={a.name}
                >
                  <UserAvatar
                    userId={parseInt(a.id)}
                    size="sm"
                    className="w-full h-full"
                    fallbackColor={a.color}
                  />
                </div>
              ))}
              {assignees.length > 2 && (
                <div
                  className="h-5 w-5 sm:h-6 sm:w-6 rounded-full border-2 border-white grid place-items-center text-[9px] sm:text-[10px] font-bold"
                  style={{ backgroundColor: "#F8B712", color: "#ffffff" }}
                  title={`${assignees.length - 2} more`}
                >
                  +{assignees.length - 2}
                </div>
              )}
            </div>
          )}
          {(task.comments?.length || 0) > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{task.comments?.length || 0}</span>
            </div>
          )}
          {(task.attachments?.length || 0) > 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{task.attachments?.length || 0}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
