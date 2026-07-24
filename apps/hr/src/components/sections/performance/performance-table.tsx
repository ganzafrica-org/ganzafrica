import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MoreVertical, Eye, Edit, MessageSquare, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
    case "scheduled":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Scheduled</Badge>;
    case "overdue":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 4.0) return "text-blue-600";
  if (rating >= 3.5) return "text-amber-600";
  return "text-red-600";
};

export const getStarRating = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${
        i < Math.floor(rating)
          ? "fill-yellow-400 text-yellow-400"
          : i < rating
            ? "fill-yellow-200 text-yellow-400"
            : "text-gray-300"
      }`}
    />
  ));
};

interface PerformanceTableProps {
  data: any[];
  onViewDetails: (employee: any) => void;
  onConductReview: (employee: any) => void;
}

export const PerformanceTable = ({
  data,
  onViewDetails,
  onConductReview,
}: PerformanceTableProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Performance Reviews
        </CardTitle>
        <CardDescription>
          Comprehensive performance evaluations based on multiple factors
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Overall Rating</TableHead>
              <TableHead>Performance Breakdown</TableHead>
              <TableHead>Goal Progress</TableHead>
              <TableHead>Review Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((employee) => (
              <TableRow key={employee.id} className="hover:bg-slate-50">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                        {employee.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">{employee.position}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${getRatingColor(employee.currentRating)}`}>
                      {employee.currentRating}
                    </span>
                    <div className="flex">{getStarRating(employee.currentRating)}</div>
                    {employee.currentRating > employee.previousRating && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Projects:</span>
                      <span className="font-medium text-blue-600">
                        {employee.projectPerformance}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attendance:</span>
                      <span className="font-medium text-emerald-600">
                        {employee.attendanceScore}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Supervisor:</span>
                      <span className="font-medium text-purple-600">
                        {employee.supervisorRating}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {employee.goals.slice(0, 2).map((goal: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={goal.progress} className="h-1.5" />
                        </div>
                        <span className="text-xs font-medium min-w-[35px]">{goal.progress}%</span>
                      </div>
                    ))}
                    {employee.goals.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{employee.goals.length - 2} more goals
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{employee.reviewPeriod}</div>
                    <div className="text-xs text-muted-foreground">{employee.reviewDate}</div>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(employee.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onViewDetails(employee)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onConductReview(employee)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Conduct Review
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Add Feedback
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
