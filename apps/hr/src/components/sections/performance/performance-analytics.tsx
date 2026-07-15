import React from "react";
import { StatGrid } from "@/components/sections/stat-grid";
import { TrendingUp, Award, Target, BarChart3, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { Progress } from "@/components/ui/progress";

const chartConfig = {
  avgRating: {
    label: "Average Rating",
    color: "#10b981",
  },
  goalCompletion: {
    label: "Goal Completion %",
    color: "#3b82f6",
  },
  attendance: {
    label: "Attendance %",
    color: "#f59e0b",
  },
  projectSuccess: {
    label: "Project Success %",
    color: "#8b5cf6",
  },
  employees: {
    label: "Employees",
    color: "#ef4444",
  },
} satisfies ChartConfig;

interface PerformanceAnalyticsProps {
  performanceTrendsData: any[];
  departmentPerformanceData: any[];
}

export const PerformanceAnalytics = ({
  performanceTrendsData,
  departmentPerformanceData,
}: PerformanceAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Performance Trends
            </CardTitle>
            <CardDescription>Multi-dimensional performance tracking over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="avgRating"
                    stroke="var(--color-avgRating)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="goalCompletion"
                    stroke="var(--color-goalCompletion)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="var(--color-attendance)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="projectSuccess"
                    stroke="var(--color-projectSuccess)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Department Performance
            </CardTitle>
            <CardDescription>Average performance ratings by department</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgRating" fill="var(--color-avgRating)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Top Performers</CardTitle>
            <CardDescription className="text-center">Rating 4.5+</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-4xl font-bold text-green-600">23</div>
            <p className="text-sm text-muted-foreground mt-2">28% of workforce</p>
            <div className="mt-3 text-xs text-green-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5 from last quarter
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Solid Performers</CardTitle>
            <CardDescription className="text-center">Rating 3.5-4.4</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-4xl font-bold text-blue-600">52</div>
            <p className="text-sm text-muted-foreground mt-2">63% of workforce</p>
            <div className="mt-3 text-xs text-blue-600">Stable performance</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Developing</CardTitle>
            <CardDescription className="text-center">Rating 3.0-3.4</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-4xl font-bold text-amber-600">6</div>
            <p className="text-sm text-muted-foreground mt-2">7% of workforce</p>
            <div className="mt-3 text-xs text-amber-600">
              <Clock className="h-3 w-3 inline mr-1" />
              Need support
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Needs Improvement</CardTitle>
            <CardDescription className="text-center">Rating over 3.0</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-4xl font-bold text-red-600">2</div>
            <p className="text-sm text-muted-foreground mt-2">2% of workforce</p>
            <div className="mt-3 text-xs text-red-600">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Action required
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-lg border-b">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Performance Components Analysis
          </CardTitle>
          <CardDescription>Breakdown of performance factors and their impact</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <h4 className="font-medium">Project Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Score:</span>
                  <span className="font-medium text-blue-600">4.3</span>
                </div>
                <Progress value={86} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Based on project completion rates and quality assessments
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Attendance & Punctuality</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Score:</span>
                  <span className="font-medium text-emerald-600">4.1</span>
                </div>
                <Progress value={82} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Based on attendance rates and punctuality records
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Supervisor Feedback</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Average Score:</span>
                  <span className="font-medium text-purple-600">4.2</span>
                </div>
                <Progress value={84} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Based on manager evaluations and 360° feedback
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
