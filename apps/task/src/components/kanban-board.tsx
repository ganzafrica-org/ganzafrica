"use client";

import { useMemo, useState } from "react";
import { Task, TeamMember, Status } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { TaskModal } from "@/components/task-modal";
import { useToast, ToastContainer } from "@/components/toast";

type Column = { 
  id: Status; 
  name: string; 
  color: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
};

export function KanbanBoard({
  columns,
  tasks,
  members,
  onTasksChange,
  registerOpenTask,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onTaskClick,
  projectId,
  isManager = false,
}: {
  columns: Column[];
  tasks: Task[];
  members: TeamMember[];
  onTasksChange: (tasks: Task[], movedTask?: { id: string; oldStatus: string; newStatus: string }) => void;
  registerOpenTask?: (open: (task: Task) => void) => void;
  onCreateTask?: (status: Status) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onTaskClick?: (taskId: string) => Promise<Task | null>;
  projectId?: number;
  isManager?: boolean;
}): React.JSX.Element {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const { toasts, removeToast, showError } = useToast();

  const grouped = useMemo(() => {
    const m: Record<Status, Task[]> = { todo: [], inprogress: [], review: [], done: [], overdue: [], backlog: [] };
    // Use a Set to track seen task IDs to prevent duplicates
    const seenIds = new Set<string>();
    for (const t of tasks) {
      // Normalize task ID to string for comparison
      const taskId = String(t.id);
      // Skip if we've already seen this task ID
      if (seenIds.has(taskId)) {
        continue;
      }
      seenIds.add(taskId);
      // Handle legacy "backlog" status by mapping it to "overdue"
      const status = t.status === "backlog" ? "overdue" : t.status;
      if (m[status]) {
        m[status].push(t);
      }
    }
    return m;
  }, [tasks]);

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    e.stopPropagation();
    
    const id = e.dataTransfer.getData("text/task-id");
    
    if (!id) {
      return;
    }
    
    if (tasks.length === 0) {
      return;
    }
    
    // Find the original task to get its old status - handle both string and number IDs
    const originalTask = tasks.find(t => {
      const taskId = String(t.id);
      const searchId = String(id);
      return taskId === searchId;
    });
    
    if (!originalTask) {
      showError(
        "Task Not Found",
        `Could not find task with ID ${id}. Please refresh the page and try again.`
      );
      return;
    }
    
    // Prevent dragging tasks to "overdue" status
    if (status === "overdue") {
      showError(
        "Cannot Move to Overdue",
        "Tasks cannot be manually moved to the Overdue status. Overdue status is automatically assigned to tasks that have passed their due date."
      );
      return;
    }
    
    // Update tasks - handle both string and number IDs
    const updatedTasks = tasks.map(t => {
      const taskId = String(t.id);
      const searchId = String(id);
      return taskId === searchId ? { ...t, status } : t;
    });
    
    const updatedTask = updatedTasks.find(t => {
      const taskId = String(t.id);
      const searchId = String(id);
      return taskId === searchId;
    });
    
    // Pass the moved task information
    const movedTask = {
      id,
      oldStatus: originalTask.status,
      newStatus: status
    };
    
    onTasksChange(updatedTasks, movedTask);
  };

  const handleTaskClick = async (task: Task) => {
    if (onTaskClick) {
      setLoadingTask(true);
      try {
        const fullTask = await onTaskClick(task.id);
        if (fullTask) {
          setActiveTask(fullTask);
        } else {
          setActiveTask(task);
        }
      } catch (error) {
        console.error('Error loading task details:', error);
        setActiveTask(task);
      } finally {
        setLoadingTask(false);
      }
    } else {
      setActiveTask(task);
    }
  };

  // Expose a way for parents to open the modal programmatically
  // Parent may pass registerOpenTask to capture this function
  if (registerOpenTask) {
    registerOpenTask((task: Task) => setActiveTask(task));
  }

  return (
    <>
      <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4 pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="inline-flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4 min-w-[600px] md:min-w-0">
          {columns.map(col => (
            <div 
              key={col.id}
              onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                // Show different visual feedback for overdue column
                if (col.id === "overdue") {
                  e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.2)';
                } else {
                  e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                }
              }}
              onDragLeave={(e: React.DragEvent<HTMLDivElement>) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = '';
              }}
              onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderColor = '';
                handleDrop(e, col.id);
              }}
              className="flex flex-col transition-colors w-[260px] sm:w-[280px] md:w-[300px] lg:w-auto flex-shrink-0"
            >
              <div 
                className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-sm mb-2 ${col.color || ''}`}
                style={col.bgColor ? {
                  backgroundColor: col.bgColor,
                  color: col.textColor,
                  border: `1px solid ${col.borderColor}`
                } : undefined}
              >
                <div className="font-medium text-sm sm:text-base">{col.name}</div>
                <div className="text-xs opacity-70 bg-white/50 rounded-full px-2 py-1">{grouped[col.id].length}</div>
              </div>
              <div 
                className="rounded-xl sm:rounded-2xl border border-black/5 bg-white/60 backdrop-blur min-h-[50vh] sm:min-h-[60vh] p-2 sm:p-3 space-y-2 sm:space-y-3 flex flex-col"
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDrop(e, col.id);
                }}
              >
                <div className="flex-1 space-y-2 sm:space-y-3">
                  {grouped[col.id].map(t => (
                    <TaskCard 
                      key={t.id} 
                      task={t} 
                      members={members} 
                      onClick={() => handleTaskClick(t)}
                      isManager={isManager}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loadingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg max-w-sm w-full">
            <p className="text-gray-700 text-sm sm:text-base text-center">Loading task details...</p>
          </div>
        </div>
      )}
      
      <TaskModal
        open={!!activeTask && !loadingTask}
        task={activeTask}
        members={members}
        mode="management"
        projectId={projectId}
        onOpenChange={(o) => !o && setActiveTask(null)}
        onChange={(updated) => {
          if (onUpdateTask) {
            onUpdateTask(updated);
          } else {
            onTasksChange(tasks.map(t => (t.id === updated.id ? updated : t)));
          }
          setActiveTask(null);
        }}
        onDelete={(id) => {
          if (onDeleteTask) {
            onDeleteTask(id);
          } else {
            onTasksChange(tasks.filter(t => t.id !== id));
          }
          setActiveTask(null);
        }}
        columns={columns}
        tasks={grouped}
      />
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}