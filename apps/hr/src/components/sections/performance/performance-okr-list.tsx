import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PerformanceOKRListProps {
  data: any[];
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

export const PerformanceOKRList = ({ data }: PerformanceOKRListProps) => {
  return (
    <div className="space-y-6">
      {data.map((okr) => (
        <Card key={okr.id} className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{okr.objective}</CardTitle>
                <CardDescription>
                  {okr.quarter} • Owner: {okr.owner} • {okr.department}
                </CardDescription>
              </div>
              <Badge
                className={`${
                  okr.status === "on_track"
                    ? "bg-blue-100 text-blue-800"
                    : okr.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {okr.status.replace("_", " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {okr.keyResults.map((kr: any, index: number) => (
                <div key={index} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{kr.title}</span>
                    <div className="flex items-center gap-2">
                      {getGoalStatusBadge(kr.status)}
                      <span className="text-sm text-muted-foreground">
                        {kr.current}/{kr.target} ({kr.progress}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={kr.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
