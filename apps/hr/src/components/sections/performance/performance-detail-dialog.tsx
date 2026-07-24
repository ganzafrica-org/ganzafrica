import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, TrendingUp, Edit } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRatingColor, getStarRating } from "./performance-table";

interface PerformanceDetailDialogProps {
  employee: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConductReview: () => void;
}

const getGoalStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case "on_track":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">On Track</Badge>;
    case "behind":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Behind</Badge>;
    case "at_risk":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">At Risk</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const PerformanceDetailDialog = ({
  employee,
  open,
  onOpenChange,
  onConductReview,
}: PerformanceDetailDialogProps) => {
  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Performance Overview - {employee.name}
          </DialogTitle>
          <DialogDescription>
            Comprehensive performance analysis for {employee.reviewPeriod}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Overall Performance</h4>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getRatingColor(employee.currentRating)}`}>
                    {employee.currentRating}
                  </div>
                  <div className="flex justify-center mt-1">
                    {getStarRating(employee.currentRating)}
                  </div>
                  <p className="text-sm text-muted-foreground">Current Rating</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-medium text-gray-600">
                    {employee.previousRating}
                  </div>
                  <p className="text-sm text-muted-foreground">Previous Rating</p>
                  {employee.currentRating > employee.previousRating && (
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">Improved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Performance Breakdown</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Project Performance</span>
                  <span className={`font-medium ${getRatingColor(employee.projectPerformance)}`}>
                    {employee.projectPerformance}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Attendance Score</span>
                  <span className={`font-medium ${getRatingColor(employee.attendanceScore)}`}>
                    {employee.attendanceScore}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Supervisor Rating</span>
                  <span className={`font-medium ${getRatingColor(employee.supervisorRating)}`}>
                    {employee.supervisorRating}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Goals & Objectives</h4>
              <div className="space-y-3">
                {employee.goals.map((goal: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{goal.title}</h5>
                      {getGoalStatusBadge(goal.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={goal.progress} className="flex-1" />
                        <span className="text-sm font-medium">{goal.progress}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Due: {goal.dueDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Project Performance</h4>
              <div className="space-y-3">
                {employee.projects.map((project: any, index: number) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-sm">{project.name}</h5>
                      <div className={`text-sm font-medium ${getRatingColor(project.rating)}`}>
                        {project.rating}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={project.completion} className="flex-1" />
                        <span className="text-sm font-medium">{project.completion}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Project Rating: {project.rating}/5.0
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Competency Assessment</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={Object.entries(employee.competencies).map(([key, value]) => ({
                    competency: key.charAt(0).toUpperCase() + key.slice(1),
                    score: value,
                    fullMark: 5,
                  }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="competency" />
                  <PolarRadiusAxis domain={[0, 5]} />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Manager Feedback</h4>
            <div className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
              <p className="text-sm leading-relaxed">{employee.feedback}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white"
            onClick={onConductReview}
          >
            <Edit className="mr-2 h-4 w-4" />
            Conduct Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
