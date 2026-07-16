"use client";

import { useState, useEffect, type JSX } from "react";
import { X, Calendar, Clock, User, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { TeamMember, Task } from "@/lib/types";
import { UserAvatar } from "@/components/user-avatar";

interface WorkloadAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember;
  tasks: Task[];
  dateFilter: string;
  customDateRange: { start: string; end: string };
}

interface DayAnalytics {
  date: string;
  dayName: string;
  isOccupied: boolean;
  hoursWorked: number;
  tasksCount: number;
  tasks: Task[];
}

interface WeeklyAnalytics {
  weekStart: string;
  weekEnd: string;
  totalDays: number;
  occupiedDays: number;
  occupancyPercentage: number;
  totalHours: number;
  totalTasks: number;
  days: DayAnalytics[];
}

export function WorkloadAnalyticsModal({
  isOpen,
  onClose,
  member,
  tasks,
  dateFilter,
  customDateRange,
}: WorkloadAnalyticsModalProps): JSX.Element | null {
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && member && tasks.length > 0) {
      calculateWeeklyAnalytics();
    }
  }, [isOpen, member, tasks, dateFilter, customDateRange]);

  const calculateWeeklyAnalytics = () => {
    setLoading(true);

    try {
      // Get date range based on filter
      let startDate: Date;
      let endDate: Date;

      const now = new Date();

      switch (dateFilter) {
        case "week":
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay()); // Start of current week
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6); // End of current week
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case "custom":
          startDate = new Date(customDateRange.start);
          endDate = new Date(customDateRange.end);
          break;
        default: // 'all'
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 30); // Last 30 days
          endDate = new Date(now);
          break;
      }

      // Filter tasks for this member within date range
      const memberTasks = tasks.filter((task) => task.assignees.includes(member.id));

      // Generate days array - only show 5 working days (Monday-Friday)
      const days: DayAnalytics[] = [];
      const currentWeek = new Date();
      const weekStart = new Date(currentWeek);
      weekStart.setDate(currentWeek.getDate() - currentWeek.getDay()); // Start of current week (Sunday)

      // Generate only Monday to Friday (5 working days)
      for (let i = 1; i <= 5; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i); // Monday = +1, Tuesday = +2, etc.

        const dateStr = currentDate.toISOString().split("T")[0];
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });

        // Check if member has tasks on this day based on actual task dates from backend
        const dayTasks = memberTasks.filter((task) => {
          // Use created_at date from backend to determine the actual day the task was assigned
          const taskDate = task.createdAt
            ? new Date(task.createdAt)
            : task.dueDate
              ? new Date(task.dueDate)
              : new Date();

          // Check if the task date matches the current day
          const taskDateStr = taskDate.toISOString().split("T")[0];
          return taskDateStr === dateStr;
        });

        // Calculate hours worked (simplified: assume 8 hours per day if has tasks)
        const hoursWorked = dayTasks.length > 0 ? 8 : 0;

        days.push({
          date: dateStr || "",
          dayName,
          isOccupied: dayTasks.length > 0,
          hoursWorked,
          tasksCount: dayTasks.length,
          tasks: dayTasks,
        });
      }

      // Calculate weekly statistics
      const totalDays = 5; // Always 5 working days
      const occupiedDays = days.filter((day) => day.isOccupied).length;
      const occupancyPercentage = Math.round((occupiedDays / totalDays) * 100);
      const totalHours = days.reduce((sum, day) => sum + day.hoursWorked, 0);
      const totalTasks = days.reduce((sum, day) => sum + day.tasksCount, 0);

      setWeeklyAnalytics({
        weekStart: days[0]?.date || "",
        weekEnd: days[4]?.date || "",
        totalDays,
        occupiedDays,
        occupancyPercentage,
        totalHours,
        totalTasks,
        days,
      });
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-[800px] max-h-[90vh] overflow-y-auto"
        style={{ borderRadius: "7px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="sticky top-0 bg-white border-b p-4 flex items-center justify-between"
          style={{ borderColor: "#e5e7eb", borderRadius: "7px 7px 0 0" }}
        >
          <div className="flex items-center gap-3">
            <UserAvatar userId={parseInt(member.id)} size="lg" fallbackColor={member.color} />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "#1f2937" }}>
                Workload Analytics
              </h3>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                {member.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            style={{ borderRadius: "7px" }}
          >
            <X className="w-5 h-5" style={{ color: "#6b7280" }} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: member.color }}
              ></div>
            </div>
          ) : weeklyAnalytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4" style={{ color: member.color }} />
                    <span className="text-sm font-medium" style={{ color: "#6b7280" }}>
                      Occupancy
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: member.color }}>
                    {weeklyAnalytics.occupancyPercentage}%
                  </p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    {weeklyAnalytics.occupiedDays}/{weeklyAnalytics.totalDays} days
                  </p>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4" style={{ color: member.color }} />
                    <span className="text-sm font-medium" style={{ color: "#6b7280" }}>
                      Hours
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: member.color }}>
                    {weeklyAnalytics.totalHours}
                  </p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Total hours
                  </p>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" style={{ color: member.color }} />
                    <span className="text-sm font-medium" style={{ color: "#6b7280" }}>
                      Tasks
                    </span>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: member.color }}>
                    {weeklyAnalytics.totalTasks}
                  </p>
                  <p className="text-xs" style={{ color: "#9ca3af" }}>
                    Total tasks
                  </p>
                </div>

                <div className="p-4 rounded-lg border" style={{ borderColor: "#e5e7eb" }}>
                  <div className="flex items-center gap-2 mb-2">
                    {weeklyAnalytics.occupancyPercentage === 100 ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4" style={{ color: "#005c30" }} />
                    )}
                    <span className="text-sm font-medium" style={{ color: "#6b7280" }}>
                      Status
                    </span>
                  </div>
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: weeklyAnalytics.occupancyPercentage === 100 ? "#ef4444" : "#005c30",
                    }}
                  >
                    {weeklyAnalytics.occupancyPercentage === 100 ? "Extremely Busy" : "Available"}
                  </p>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div>
                <h4 className="text-md font-semibold mb-4" style={{ color: "#1f2937" }}>
                  Daily Breakdown
                </h4>
                <div className="space-y-2">
                  {weeklyAnalytics.days.map((day, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border flex items-center justify-between ${
                        day.isOccupied
                          ? "bg-green-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            day.isOccupied ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {day.dayName}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "#1f2937" }}>
                            {new Date(day.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs" style={{ color: "#6b7280" }}>
                            {day.isOccupied
                              ? `${day.hoursWorked}h • ${day.tasksCount} tasks`
                              : "No tasks"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-semibold ${
                            day.isOccupied ? "text-green-600" : "text-gray-500"
                          }`}
                        >
                          {day.isOccupied ? "Occupied" : "Free"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occupancy Chart */}
              <div>
                <h4 className="text-md font-semibold mb-4" style={{ color: "#1f2937" }}>
                  Weekly Occupancy
                </h4>
                <div
                  className="w-full h-4 rounded-full overflow-hidden"
                  style={{ backgroundColor: "#e5e7eb" }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${weeklyAnalytics.occupancyPercentage}%`,
                      backgroundColor: member.color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-2" style={{ color: "#6b7280" }}>
                  <span>0%</span>
                  <span>{weeklyAnalytics.occupancyPercentage}% occupied</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "#6b7280" }}>
                No data available for this period
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end"
          style={{ borderColor: "#e5e7eb", borderRadius: "0 0 7px 7px" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-white rounded-md transition-colors"
            style={{ backgroundColor: member.color, borderRadius: "7px" }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
