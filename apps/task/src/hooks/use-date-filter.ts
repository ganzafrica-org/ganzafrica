import { useMemo } from "react";
import { Task } from "@/lib/types";

export function useDateFilter(tasks: Task[], dateFilter: string, customDateRange: { start: string; end: string }) {
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply date filtering based on task deadlines
    if (dateFilter === 'week') {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      oneWeekFromNow.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return true; // Include tasks without due dates
        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return taskDueDate >= now && taskDueDate <= oneWeekFromNow;
      });
    } else if (dateFilter === 'month') {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(now.getMonth() + 1);
      oneMonthFromNow.setHours(23, 59, 59, 999); // End of day
      
      filtered = filtered.filter(task => {
        if (!task.dueDate) return true; // Include tasks without due dates
        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return taskDueDate >= now && taskDueDate <= oneMonthFromNow;
      });
    } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const startDate = new Date(customDateRange.start);
      startDate.setHours(0, 0, 0, 0); // Start of day
      const endDate = new Date(customDateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      // Validate date range
      if (startDate <= endDate) {
        filtered = filtered.filter(task => {
          if (!task.dueDate) return true; // Include tasks without due dates
          const taskDueDate = new Date(task.dueDate);
          taskDueDate.setHours(0, 0, 0, 0); // Normalize to start of day
          return taskDueDate >= startDate && taskDueDate <= endDate;
        });
      }
    }

    return filtered;
  }, [tasks, dateFilter, customDateRange]);

  return filteredTasks;
}
