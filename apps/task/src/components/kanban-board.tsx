"use client";

import { useMemo, useState } from "react";
import { Task, TeamMember, Status } from "@/lib/types";
import { TaskCard } from "@/components/task-card";
import { TaskModal } from "@/components/task-modal";

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
}: {
  columns: Column[];
  tasks: Task[];
  members: TeamMember[];
  onTasksChange: (tasks: Task[]) => void;
  registerOpenTask?: (open: (task: Task) => void) => void;
  onCreateTask?: (status: Status) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onTaskClick?: (taskId: string) => Promise<Task | null>;
  projectId?: number;
}): React.JSX.Element {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);

  const grouped = useMemo(() => {
    const m: Record<Status, Task[]> = { backlog: [], todo: [], inprogress: [], review: [], done: [] };
    for (const t of tasks) m[t.status].push(t);
    return m;
  }, [tasks]);

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/task-id");
    if (!id) return;
    onTasksChange(
      tasks.map(t => (t.id === id ? { ...t, status } : t))
    );
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 min-w-[1000px]">
      {columns.map(col => (
        <div key={col.id}
          onDragOver={e => e.preventDefault()}
          onDrop={e => handleDrop(e, col.id)}
          className="flex flex-col">
          <div 
            className={`flex items-center justify-between p-2 rounded-xl shadow-sm mb-2 ${col.color || ''}`}
            style={col.bgColor ? {
              backgroundColor: col.bgColor,
              color: col.textColor,
              border: `1px solid ${col.borderColor}`
            } : undefined}
          >
            <div className="font-medium">{col.name}</div>
            <div className="text-xs opacity-70 bg-white/50 rounded-full px-2 py-1">{grouped[col.id].length}</div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-white/60 backdrop-blur min-h-[60vh] p-3 space-y-3 flex flex-col">
            <div className="flex-1 space-y-3">
              {grouped[col.id].map(t => (
                <TaskCard key={t.id} task={t} members={members} onClick={() => handleTaskClick(t)} />
              ))}
            </div>
            {/* Add new task button */}
            {onCreateTask && (
              <button
                onClick={() => onCreateTask(col.id)}
                className="w-full py-1 px-3 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 font-medium"
                style={{ 
                  borderRadius: '7px',
                  backgroundColor: '#f0f8fc',
                  borderColor: '#d4e9f5',
                  color: '#076297'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e6f2ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f8fc';
                }}
              >
                <span className="text-lg">+</span>
                <span>Add new task</span>
              </button>
            )}
          </div>
        </div>
      ))}

      {loadingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <p className="text-gray-700">Loading task details...</p>
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
    </div>
  );
}