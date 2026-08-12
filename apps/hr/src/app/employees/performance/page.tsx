"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  TrendingUp,
  Search,
  Download,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  Star,
  MessageSquare,
  Calendar,
  CheckCircle,
  AlertTriangle,
  User,
  BarChart3,
  Clock,
  Award,
} from "lucide-react";
import { StatsHeader } from "@/components/sections/header";
import { PerformanceStats } from "@/data/Header-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const performanceData = [
  {
    id: 1,
    employeeId: "GZ001",
    name: "Jean Baptiste Mukamana",
    department: "Human Resources",
    position: "HR Manager",
    manager: "Sarah Uwimana",
    currentRating: 4.2,
    previousRating: 3.8,
    reviewPeriod: "Q4 2024",
    reviewDate: "2024-12-15",
    status: "completed",
    projectPerformance: 4.3,
    attendanceScore: 4.1,
    supervisorRating: 4.2,
    goals: [
      {
        title: "Improve recruitment efficiency",
        progress: 85,
        status: "on_track",
        dueDate: "2024-12-31",
      },
      { title: "Implement new HRMS", progress: 100, status: "completed", dueDate: "2024-11-30" },
      { title: "Reduce time-to-hire", progress: 70, status: "on_track", dueDate: "2024-12-31" },
    ],
    competencies: {
      leadership: 4.5,
      communication: 4.0,
      technical: 4.2,
      teamwork: 4.3,
      innovation: 3.8,
    },
    feedback:
      "Excellent leadership skills and successful HRMS implementation. Focus on improving recruitment metrics.",
    projects: [
      { name: "HRMS Implementation", completion: 100, rating: 4.5 },
      { name: "Recruitment Process Optimization", completion: 75, rating: 4.0 },
    ],
  },
  {
    id: 2,
    employeeId: "GZ002",
    name: "Marie Claire Nsengimana",
    department: "Agriculture",
    position: "Agricultural Specialist",
    manager: "David Nshimiyimana",
    currentRating: 4.5,
    previousRating: 4.1,
    reviewPeriod: "Q4 2024",
    reviewDate: "2024-12-20",
    status: "in_progress",
    projectPerformance: 4.7,
    attendanceScore: 4.4,
    supervisorRating: 4.3,
    goals: [
      {
        title: "Increase crop yield by 15%",
        progress: 95,
        status: "on_track",
        dueDate: "2024-12-31",
      },
      { title: "Train 20 farmers", progress: 80, status: "on_track", dueDate: "2024-12-15" },
      {
        title: "Research new farming techniques",
        progress: 60,
        status: "behind",
        dueDate: "2024-12-30",
      },
    ],
    competencies: {
      leadership: 4.0,
      communication: 4.7,
      technical: 4.8,
      teamwork: 4.2,
      innovation: 4.3,
    },
    feedback: "Outstanding technical expertise and farmer engagement. Exceeded crop yield targets.",
    projects: [
      { name: "Sustainable Farming Initiative", completion: 90, rating: 4.8 },
      { name: "Farmer Training Program", completion: 80, rating: 4.5 },
    ],
  },
  {
    id: 3,
    employeeId: "GZ003",
    name: "David Niyonkuru",
    department: "Fellowship Program",
    position: "Youth Fellow",
    manager: "Grace Uwimana",
    currentRating: 3.8,
    previousRating: 3.5,
    reviewPeriod: "Q4 2024",
    reviewDate: "2024-12-25",
    status: "scheduled",
    projectPerformance: 3.9,
    attendanceScore: 3.7,
    supervisorRating: 3.8,
    goals: [
      {
        title: "Complete fellowship project",
        progress: 75,
        status: "on_track",
        dueDate: "2024-12-31",
      },
      {
        title: "Develop community partnerships",
        progress: 90,
        status: "on_track",
        dueDate: "2024-12-20",
      },
      {
        title: "Attend skills training",
        progress: 100,
        status: "completed",
        dueDate: "2024-11-30",
      },
    ],
    competencies: {
      leadership: 3.5,
      communication: 4.0,
      technical: 3.8,
      teamwork: 4.2,
      innovation: 3.7,
    },
    feedback:
      "Strong community engagement and project management skills. Ready for increased responsibilities.",
    projects: [
      { name: "Community Development Project", completion: 75, rating: 4.0 },
      { name: "Youth Engagement Initiative", completion: 85, rating: 3.8 },
    ],
  },
];

const okrData = [
  {
    id: 1,
    quarter: "Q4 2024",
    objective: "Enhance HR Operational Efficiency",
    keyResults: [
      {
        title: "Reduce time-to-hire by 25%",
        progress: 80,
        target: 25,
        current: 20,
        status: "on_track",
      },
      {
        title: "Achieve 95% employee satisfaction",
        progress: 92,
        target: 95,
        current: 87,
        status: "on_track",
      },
      {
        title: "Complete HRMS implementation",
        progress: 100,
        target: 100,
        current: 100,
        status: "completed",
      },
    ],
    owner: "Jean Baptiste Mukamana",
    status: "on_track",
    department: "Human Resources",
  },
  {
    id: 2,
    quarter: "Q4 2024",
    objective: "Improve Agricultural Productivity",
    keyResults: [
      {
        title: "Increase crop yield by 15%",
        progress: 95,
        target: 15,
        current: 14.2,
        status: "on_track",
      },
      { title: "Train 50 farmers", progress: 88, target: 50, current: 44, status: "on_track" },
      {
        title: "Implement 3 new techniques",
        progress: 67,
        target: 3,
        current: 2,
        status: "behind",
      },
    ],
    owner: "Marie Claire Nsengimana",
    status: "on_track",
    department: "Agriculture",
  },
  {
    id: 3,
    quarter: "Q4 2024",
    objective: "Strengthen Community Partnerships",
    keyResults: [
      {
        title: "Establish 10 new partnerships",
        progress: 60,
        target: 10,
        current: 6,
        status: "behind",
      },
      {
        title: "Increase community engagement by 40%",
        progress: 75,
        target: 40,
        current: 30,
        status: "on_track",
      },
      {
        title: "Launch 2 community programs",
        progress: 100,
        target: 2,
        current: 2,
        status: "completed",
      },
    ],
    owner: "David Niyonkuru",
    status: "on_track",
    department: "Fellowship Program",
  },
];

const feedbackData = [
  {
    id: 1,
    employeeId: "GZ001",
    employeeName: "Jean Baptiste Mukamana",
    feedbackType: "360_review",
    reviewer: "Sarah Uwimana",
    reviewerRole: "Manager",
    rating: 4.2,
    feedback: "Excellent leadership and strategic thinking. Great job on the HRMS implementation.",
    date: "2024-12-15",
    categories: {
      leadership: 4.5,
      communication: 4.0,
      collaboration: 4.3,
      results: 4.1,
    },
  },
  {
    id: 2,
    employeeId: "GZ001",
    employeeName: "Jean Baptiste Mukamana",
    feedbackType: "peer_review",
    reviewer: "Marie Claire Nsengimana",
    reviewerRole: "Colleague",
    rating: 4.0,
    feedback:
      "Very supportive colleague, always willing to help with HR matters. Great communication skills.",
    date: "2024-12-10",
    categories: {
      leadership: 4.0,
      communication: 4.2,
      collaboration: 4.5,
      results: 3.8,
    },
  },
  {
    id: 3,
    employeeId: "GZ002",
    employeeName: "Marie Claire Nsengimana",
    feedbackType: "project_feedback",
    reviewer: "David Nshimiyimana",
    reviewerRole: "Manager",
    rating: 4.7,
    feedback:
      "Outstanding performance on the sustainable farming initiative. Exceeded all targets and showed great innovation.",
    date: "2024-12-08",
    categories: {
      technical: 4.8,
      innovation: 4.6,
      results: 4.8,
      collaboration: 4.5,
    },
  },
  {
    id: 4,
    employeeId: "GZ003",
    employeeName: "David Niyonkuru",
    feedbackType: "mentor_feedback",
    reviewer: "Grace Uwimana",
    reviewerRole: "Mentor",
    rating: 3.9,
    feedback:
      "Shows great potential and enthusiasm. Good progress on community engagement projects. Areas for improvement in time management.",
    date: "2024-12-05",
    categories: {
      potential: 4.2,
      engagement: 4.0,
      growth: 3.8,
      execution: 3.7,
    },
  },
];

const performanceTrendsData = [
  { quarter: "Q1 2024", avgRating: 3.8, goalCompletion: 75, attendance: 92, projectSuccess: 78 },
  { quarter: "Q2 2024", avgRating: 4.0, goalCompletion: 82, attendance: 94, projectSuccess: 85 },
  { quarter: "Q3 2024", avgRating: 4.1, goalCompletion: 78, attendance: 91, projectSuccess: 82 },
  { quarter: "Q4 2024", avgRating: 4.2, goalCompletion: 85, attendance: 93, projectSuccess: 88 },
];

const departmentPerformanceData = [
  { department: "Agriculture", avgRating: 4.3, employees: 25, projectSuccess: 90, attendance: 95 },
  { department: "Environment", avgRating: 4.1, employees: 18, projectSuccess: 85, attendance: 92 },
  { department: "HR", avgRating: 4.2, employees: 5, projectSuccess: 88, attendance: 96 },
  { department: "Land Mgmt", avgRating: 3.9, employees: 12, projectSuccess: 82, attendance: 89 },
  { department: "Fellowship", avgRating: 3.8, employees: 15, projectSuccess: 78, attendance: 87 },
];

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

const getStatusBadge = (status: string) => {
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

const getRatingColor = (rating: number) => {
  if (rating >= 4.5) return "text-green-600";
  if (rating >= 4.0) return "text-blue-600";
  if (rating >= 3.5) return "text-amber-600";
  return "text-red-600";
};

const getStarRating = (rating: number) => {
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

export default function PerformancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null;

    const onScroll = () => {
      const y = mainEl ? mainEl.scrollTop : window.scrollY;
      setScrolled(y > 10);
    };

    onScroll();
    if (mainEl) {
      mainEl.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const filteredPerformance = performanceData.filter((record) => {
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || record.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    <div className="min-h-screen p-0 w-full flex justify-center">
      <div className="flex flex-col gap-6 w-full">
        <StatsHeader
          title="Performance"
          subtitle="Track reviews, goals, and feedback"
          scrolled={scrolled}
          stats={PerformanceStats}
          ClassName="w-full"
        />

        <Tabs defaultValue="reviews" className="w-full flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="h-auto w-fit gap-1 rounded-xl bg-slate-200 p-1.5">
              <TabsTrigger
                value="reviews"
                className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                <CheckCircle className="size-4 shrink-0" />
                Performance Reviews
              </TabsTrigger>
              <TabsTrigger
                value="okrs"
                className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                <Target className="size-4 shrink-0" />
                OKRs & Goals
              </TabsTrigger>
              <TabsTrigger
                value="feedback"
                className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                <MessageSquare className="size-4 shrink-0" />
                360° Feedback
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
              >
                <BarChart3 className="size-4 shrink-0" />
                Analytics
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Export Reports
              </Button>
              <Button>
                <Plus className="h-4 w-4" />
                New Review Cycle
              </Button>
            </div>
          </div>

          <TabsContent value="reviews" className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px] border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-[180px] border-slate-200">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Agriculture">Agriculture</SelectItem>
                        <SelectItem value="Environment">Environment</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Fellowship Program">Fellowship Program</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="border-b">
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
                    {filteredPerformance.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                {employee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{employee.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {employee.position}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-lg ${getRatingColor(employee.currentRating)}`}
                            >
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
                            {employee.goals.slice(0, 2).map((goal, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="flex-1">
                                  <Progress value={goal.progress} className="h-1.5" />
                                </div>
                                <span className="text-xs font-medium min-w-[35px]">
                                  {goal.progress}%
                                </span>
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
                            <div className="text-xs text-muted-foreground">
                              {employee.reviewDate}
                            </div>
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
                              <DropdownMenuItem onClick={() => setSelectedEmployee(employee)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setShowReviewDialog(true);
                                }}
                              >
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
          </TabsContent>

          <TabsContent value="okrs" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">OKRs & Goals Management</h3>
                <p className="text-sm text-muted-foreground">
                  Track objectives and key results across teams
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4" />
                New OKR
              </Button>
            </div>

            <div className="space-y-6">
              {okrData.map((okr) => (
                <Card key={okr.id} className="shadow-sm">
                  <CardHeader className="border-b">
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
                      {okr.keyResults.map((kr, index) => (
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
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">360° Feedback System</h3>
                <p className="text-sm text-muted-foreground">
                  Multi-source feedback from supervisors, peers, and projects
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4" />
                Request Feedback
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {feedbackData.map((feedback) => (
                <Card
                  key={feedback.id}
                  className="hover:shadow-lg transition-all duration-300 border border-slate-200"
                >
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-base">{feedback.employeeName}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs ${
                              feedback.feedbackType === "360_review"
                                ? "bg-purple-100 text-purple-800"
                                : feedback.feedbackType === "peer_review"
                                  ? "bg-blue-100 text-blue-800"
                                  : feedback.feedbackType === "project_feedback"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {feedback.feedbackType.replace("_", " ")}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {feedback.reviewerRole}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getRatingColor(feedback.rating)}`}>
                          {feedback.rating}
                        </div>
                        <div className="flex">{getStarRating(feedback.rating)}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium mb-2">
                        Feedback from {feedback.reviewer}
                      </h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feedback.feedback}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Category Ratings</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {Object.entries(feedback.categories).map(([category, rating]) => (
                          <div
                            key={category}
                            className="flex justify-between items-center p-2 bg-slate-50 rounded"
                          >
                            <span className="capitalize">{category}</span>
                            <span className={`font-medium ${getRatingColor(rating as number)}`}>
                              {rating}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t text-xs text-muted-foreground">
                      <span>{new Date(feedback.date).toLocaleDateString()}</span>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        <Eye className="h-3 w-3 mr-1" />
                        View Full
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="shadow-sm">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  Feedback Summary
                </CardTitle>
                <CardDescription>Overview of feedback patterns and trends</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg bg-slate-50">
                    <div className="text-2xl font-bold text-green-600">4.1</div>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                    <p className="text-xs text-muted-foreground">Across all feedback</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-slate-50">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <p className="text-sm text-muted-foreground">Total Feedback</p>
                    <p className="text-xs text-muted-foreground">This quarter</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg bg-slate-50">
                    <div className="text-2xl font-bold text-purple-600">89%</div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                    <p className="text-xs text-muted-foreground">Feedback requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Performance Trends
                  </CardTitle>
                  <CardDescription>
                    Multi-dimensional performance tracking over time
                  </CardDescription>
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
                <CardHeader className="border-b">
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
                <CardHeader className="border-b">
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
                <CardHeader className="border-b">
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
                <CardHeader className="border-b">
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

              <Card>
                <CardHeader className="border-b">
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
              <CardHeader className="border-b">
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
          </TabsContent>
        </Tabs>

        {selectedEmployee && !showReviewDialog && (
          <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Performance Overview - {selectedEmployee.name}
                </DialogTitle>
                <DialogDescription>
                  Comprehensive performance analysis for {selectedEmployee.reviewPeriod}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Overall Performance</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div
                          className={`text-3xl font-bold ${getRatingColor(selectedEmployee.currentRating)}`}
                        >
                          {selectedEmployee.currentRating}
                        </div>
                        <div className="flex justify-center mt-1">
                          {getStarRating(selectedEmployee.currentRating)}
                        </div>
                        <p className="text-sm text-muted-foreground">Current Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-medium text-gray-600">
                          {selectedEmployee.previousRating}
                        </div>
                        <p className="text-sm text-muted-foreground">Previous Rating</p>
                        {selectedEmployee.currentRating > selectedEmployee.previousRating && (
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
                        <span
                          className={`font-medium ${getRatingColor(selectedEmployee.projectPerformance)}`}
                        >
                          {selectedEmployee.projectPerformance}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Attendance Score</span>
                        <span
                          className={`font-medium ${getRatingColor(selectedEmployee.attendanceScore)}`}
                        >
                          {selectedEmployee.attendanceScore}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Supervisor Rating</span>
                        <span
                          className={`font-medium ${getRatingColor(selectedEmployee.supervisorRating)}`}
                        >
                          {selectedEmployee.supervisorRating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Goals & Objectives</h4>
                    <div className="space-y-3">
                      {selectedEmployee.goals.map((goal: any, index: number) => (
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
                      {selectedEmployee.projects.map((project: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-sm">{project.name}</h5>
                            <div
                              className={`text-sm font-medium ${getRatingColor(project.rating)}`}
                            >
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
                        data={Object.entries(selectedEmployee.competencies).map(([key, value]) => ({
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
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm leading-relaxed">{selectedEmployee.feedback}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
                  Close
                </Button>
                <Button onClick={() => setShowReviewDialog(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Conduct Review
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
