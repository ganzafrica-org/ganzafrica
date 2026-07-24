"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, MessageCircle, Clock, ThumbsUp, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface AnalyticsTabProps {
  chartConfig: any;
  ticketVolumeData: any[];
  categoryDistribution: any[];
  resolutionTimeData: any[];
  satisfactionData: any[];
}

export const AnalyticsTab = ({
  chartConfig,
  ticketVolumeData,
  categoryDistribution,
  resolutionTimeData,
  satisfactionData,
}: AnalyticsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Ticket Volume Trends
            </CardTitle>
            <CardDescription>Monthly ticket volume and resolution rates</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="var(--color-tickets)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="var(--color-resolved)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Ticket Categories
            </CardTitle>
            <CardDescription>Distribution of tickets by category</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Resolution Time by Priority
            </CardTitle>
            <CardDescription>Average vs target resolution times</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avgHours" fill="var(--color-avgHours)" />
                  <Bar dataKey="target" fill="var(--color-target)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5 text-purple-600" />
              Customer Satisfaction
            </CardTitle>
            <CardDescription>Distribution of satisfaction ratings</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={satisfactionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="rating" type="category" width={80} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
            <CardTitle className="text-center">First Response</CardTitle>
            <CardDescription className="text-center">Average time</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-green-600">2.4h</div>
            <p className="text-sm text-muted-foreground mt-2">Target: 4h</p>
            <div className="mt-2 text-xs text-green-600">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Below target
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Resolution Rate</CardTitle>
            <CardDescription className="text-center">This month</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600">94%</div>
            <p className="text-sm text-muted-foreground mt-2">Target: 90%</p>
            <div className="mt-2 text-xs text-blue-600">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              Above target
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
            <CardTitle className="text-center">Escalation Rate</CardTitle>
            <CardDescription className="text-center">This month</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-amber-600">7%</div>
            <p className="text-sm text-muted-foreground mt-2">Target: over 10%</p>
            <div className="mt-2 text-xs text-amber-600">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              Within target
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg border-b">
            <CardTitle className="text-center">CSAT Score</CardTitle>
            <CardDescription className="text-center">Average rating</CardDescription>
          </CardHeader>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600">4.6</div>
            <p className="text-sm text-muted-foreground mt-2">Out of 5.0</p>
            <div className="mt-2 text-xs text-purple-600">
              <ThumbsUp className="h-3 w-3 inline mr-1" />
              Excellent
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
