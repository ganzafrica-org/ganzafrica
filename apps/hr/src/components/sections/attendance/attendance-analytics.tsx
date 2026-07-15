import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TrendingUp, Building } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";

const chartConfig = {
  present: {
    label: "Present",
    color: "#10b981",
  },
  late: {
    label: "Late",
    color: "#f59e0b",
  },
  absent: {
    label: "Absent",
    color: "#ef4444",
  },
  onLeave: {
    label: "On Leave",
    color: "#8b5cf6",
  },
} satisfies ChartConfig;

interface AttendanceAnalyticsProps {
  weeklyAttendanceData: any[];
  attendanceTypesData: any[];
}

export const AttendanceAnalytics = ({
  weeklyAttendanceData,
  attendanceTypesData,
}: AttendanceAnalyticsProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Weekly Attendance Trends
            </CardTitle>
            <CardDescription>Daily attendance patterns this week</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="present" fill="var(--color-present)" />
                  <Bar dataKey="late" fill="var(--color-late)" />
                  <Bar dataKey="absent" fill="var(--color-absent)" />
                  <Bar dataKey="onLeave" fill="var(--color-onLeave)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Attendance Types
            </CardTitle>
            <CardDescription>Work location distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {attendanceTypesData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-muted-foreground">{item.count} employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Overall Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-4xl font-bold text-green-600">94.2%</div>
            <p className="text-sm text-muted-foreground mt-2">This month average</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Target:</span>
                <span className="font-medium">95%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last month:</span>
                <span className="font-medium">92.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Punctuality Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-4xl font-bold text-blue-600">87.5%</div>
            <p className="text-sm text-muted-foreground mt-2">On-time arrivals</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Late arrivals:</span>
                <span className="font-medium text-amber-600">12.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg. late time:</span>
                <span className="font-medium">23 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Field Work Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-4xl font-bold text-purple-600">32%</div>
            <p className="text-sm text-muted-foreground mt-2">Field-based attendance</p>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Projects active:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Field sites:</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
