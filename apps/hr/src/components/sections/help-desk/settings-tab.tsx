"use client";

import React from "react";
import { User, Edit, BadgeCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SettingsTabProps {
  categoryDistribution: any[];
  getCategoryIcon: (category: string) => React.ReactNode;
  resolutionTimeData: any[];
}

export const SettingsTab = ({
  categoryDistribution,
  getCategoryIcon,
  resolutionTimeData,
}: SettingsTabProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          Helpdesk Configuration
        </CardTitle>
        <CardDescription>System settings and automation rules</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h4 className="font-medium">Category Settings</h4>
            <div className="space-y-3">
              {categoryDistribution.map((category) => (
                <div
                  key={category.category}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category.category)}
                    <span className="font-medium">{category.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{category.count} tickets</Badge>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Automation Rules</h4>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Auto-assign IT tickets</span>
                  <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically assign IT Support tickets to available technicians
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Priority escalation</span>
                  <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escalate high priority tickets after 4 hours without response
                </p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Satisfaction surveys</span>
                  <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send satisfaction survey when tickets are resolved
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-4">SLA Targets</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              {resolutionTimeData.map((item) => (
                <div
                  key={item.priority}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <span className="font-medium">{item.priority} Priority</span>
                    <p className="text-sm text-muted-foreground">Current: {item.avgHours}h avg</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Target: {item.target}h</div>
                    <div
                      className={`text-sm ${
                        item.avgHours <= item.target ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {item.avgHours <= item.target ? "Meeting SLA" : "Missing SLA"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Business Hours</h5>
                <p className="text-sm text-blue-700">Monday - Friday: 8:00 AM - 6:00 PM</p>
                <p className="text-sm text-blue-700">Weekend: Emergency only</p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2">Contact Information</h5>
                <p className="text-sm text-green-700">Email: support@ganzafrica.org</p>
                <p className="text-sm text-green-700">Phone: +250 788 HELP (4357)</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
