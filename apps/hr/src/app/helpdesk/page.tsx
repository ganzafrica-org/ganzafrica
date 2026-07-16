"use client";

import React, { useState } from "react";
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
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Search,
  Download,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  User,
  Tag,
  MessageCircle,
  HelpCircle,
  Zap,
  BarChart3,
  TrendingUp,
  Users,
  Mail,
  XCircle,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
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

const ticketsData = [
  {
    id: "HD-001",
    title: "Password Reset Request",
    description: "Unable to log into email account after vacation",
    category: "IT Support",
    priority: "medium",
    status: "open",
    submittedBy: "Marie Claire Nsengimana",
    submittedByEmail: "marie.nsengimana@ganzafrica.org",
    assignedTo: "IT Support Team",
    createdAt: "2024-12-10T09:00:00Z",
    updatedAt: "2024-12-10T14:30:00Z",
    department: "Agriculture",
    tags: ["password", "email", "access"],
    urgency: "medium",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Marie Claire Nsengimana",
        message:
          "I can't access my email after returning from vacation. Getting authentication errors.",
        timestamp: "2024-12-10T09:00:00Z",
      },
      {
        id: 2,
        author: "IT Support",
        message: "We've reset your password. Please check your recovery email for new credentials.",
        timestamp: "2024-12-10T14:30:00Z",
      },
    ],
  },
  {
    id: "HD-002",
    title: "Leave Balance Inquiry",
    description: "Need clarification on remaining annual leave days",
    category: "HR",
    priority: "low",
    status: "resolved",
    submittedBy: "David Niyonkuru",
    submittedByEmail: "david.niyonkuru@ganzafrica.org",
    assignedTo: "Jean Baptiste Mukamana",
    createdAt: "2024-12-08T11:00:00Z",
    updatedAt: "2024-12-09T16:00:00Z",
    department: "Fellowship Program",
    tags: ["leave", "balance", "inquiry"],
    urgency: "low",
    satisfaction: 5,
    messages: [
      {
        id: 1,
        author: "David Niyonkuru",
        message: "Can you please check my current leave balance? I'm planning time off next month.",
        timestamp: "2024-12-08T11:00:00Z",
      },
      {
        id: 2,
        author: "Jean Baptiste Mukamana",
        message:
          "You have 12 days of annual leave remaining. I'll send the detailed breakdown to your email.",
        timestamp: "2024-12-09T16:00:00Z",
      },
    ],
  },
  {
    id: "HD-003",
    title: "Equipment Malfunction",
    description: "Office printer not working, urgent documents need printing",
    category: "Facilities",
    priority: "high",
    status: "in_progress",
    submittedBy: "Grace Mukamana",
    submittedByEmail: "grace.mukamana@ganzafrica.org",
    assignedTo: "Facilities Team",
    createdAt: "2024-12-10T13:45:00Z",
    updatedAt: "2024-12-10T15:20:00Z",
    department: "Environment",
    tags: ["printer", "equipment", "urgent"],
    urgency: "high",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Grace Mukamana",
        message:
          "The main office printer is showing error codes and won't print. We have urgent reports due today.",
        timestamp: "2024-12-10T13:45:00Z",
      },
      {
        id: 2,
        author: "Facilities Team",
        message:
          "Technician dispatched. Should be resolved within 2 hours. Temporary printer available in Conference Room B.",
        timestamp: "2024-12-10T15:20:00Z",
      },
    ],
  },
  {
    id: "HD-004",
    title: "Training Request",
    description: "Request for Excel advanced training for team",
    category: "Training",
    priority: "low",
    status: "open",
    submittedBy: "Emmanuel Nshimiyimana",
    submittedByEmail: "emmanuel.nshimiyimana@ganzafrica.org",
    assignedTo: "HR Training Team",
    createdAt: "2024-12-09T10:30:00Z",
    updatedAt: "2024-12-09T10:30:00Z",
    department: "Land Management",
    tags: ["training", "excel", "team"],
    urgency: "low",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Emmanuel Nshimiyimana",
        message:
          "Our team needs advanced Excel training for data analysis. Can we schedule this for next month?",
        timestamp: "2024-12-09T10:30:00Z",
      },
    ],
  },
  {
    id: "HD-005",
    title: "Payroll Discrepancy",
    description: "Overtime hours not reflected correctly in last payslip",
    category: "Payroll",
    priority: "high",
    status: "escalated",
    submittedBy: "Alice Uwimana",
    submittedByEmail: "alice.uwimana@ganzafrica.org",
    assignedTo: "Finance Team",
    createdAt: "2024-12-07T14:00:00Z",
    updatedAt: "2024-12-10T11:00:00Z",
    department: "Environment",
    tags: ["payroll", "overtime", "discrepancy"],
    urgency: "high",
    satisfaction: null,
    messages: [
      {
        id: 1,
        author: "Alice Uwimana",
        message:
          "My payslip shows 5 hours of overtime but I worked 12 hours last week. Please review.",
        timestamp: "2024-12-07T14:00:00Z",
      },
      {
        id: 2,
        author: "HR Team",
        message:
          "Escalated to Finance. They will review attendance records and respond within 48 hours.",
        timestamp: "2024-12-10T11:00:00Z",
      },
    ],
  },
];

const faqData = [
  {
    id: 1,
    category: "Leave Management",
    question: "How do I request annual leave?",
    answer:
      "You can request annual leave through the HR portal under 'Leave Management' or by filling out the leave request form and submitting it to your manager for approval.",
    views: 156,
    helpful: 142,
    tags: ["leave", "annual", "request"],
    lastUpdated: "2024-11-15",
  },
  {
    id: 2,
    category: "IT Support",
    question: "I forgot my password, how do I reset it?",
    answer:
      "Use the 'Forgot Password' link on the login page or contact IT support at it@ganzafrica.org. For urgent access, call extension 101.",
    views: 203,
    helpful: 189,
    tags: ["password", "reset", "login"],
    lastUpdated: "2024-12-01",
  },
  {
    id: 3,
    category: "Payroll",
    question: "When are salaries paid each month?",
    answer:
      "Salaries are paid on the 25th of each month. If the 25th falls on a weekend or holiday, payment will be made on the preceding business day.",
    views: 89,
    helpful: 84,
    tags: ["salary", "payroll", "payment"],
    lastUpdated: "2024-10-20",
  },
  {
    id: 4,
    category: "Benefits",
    question: "What health insurance coverage do I have?",
    answer:
      "All employees are covered by our comprehensive health insurance plan. For detailed coverage information, contact HR or check your employee handbook.",
    views: 134,
    helpful: 128,
    tags: ["insurance", "health", "benefits"],
    lastUpdated: "2024-11-30",
  },
  {
    id: 5,
    category: "Travel",
    question: "How do I request travel approval?",
    answer:
      "Submit a travel request through the finance portal at least 2 weeks before your intended travel date. Include destination, purpose, and estimated costs.",
    views: 78,
    helpful: 73,
    tags: ["travel", "approval", "request"],
    lastUpdated: "2024-12-05",
  },
  {
    id: 6,
    category: "Equipment",
    question: "How do I report equipment issues?",
    answer:
      "Create a helpdesk ticket under 'Facilities' category or email facilities@ganzafrica.org with details about the equipment problem.",
    views: 95,
    helpful: 87,
    tags: ["equipment", "facilities", "maintenance"],
    lastUpdated: "2024-11-28",
  },
];

const ticketVolumeData = [
  { month: "Jul", tickets: 45, resolved: 42, avgTime: 2.3 },
  { month: "Aug", tickets: 52, resolved: 48, avgTime: 2.1 },
  { month: "Sep", tickets: 38, resolved: 36, avgTime: 1.9 },
  { month: "Oct", tickets: 67, resolved: 63, avgTime: 2.8 },
  { month: "Nov", tickets: 43, resolved: 41, avgTime: 2.2 },
  { month: "Dec", tickets: 59, resolved: 54, avgTime: 2.4 },
];

const categoryDistribution = [
  { category: "IT Support", count: 23, fill: "#10b981" },
  { category: "HR", count: 18, fill: "#3b82f6" },
  { category: "Facilities", count: 12, fill: "#f59e0b" },
  { category: "Payroll", count: 8, fill: "#ef4444" },
  { category: "Training", count: 6, fill: "#8b5cf6" },
  { category: "Other", count: 4, fill: "#6b7280" },
];

const resolutionTimeData = [
  { priority: "Low", avgHours: 48, target: 72 },
  { priority: "Medium", avgHours: 24, target: 48 },
  { priority: "High", avgHours: 8, target: 24 },
  { priority: "Critical", avgHours: 2, target: 4 },
];

const satisfactionData = [
  { rating: "5 Stars", count: 45, fill: "#10b981" },
  { rating: "4 Stars", count: 23, fill: "#3b82f6" },
  { rating: "3 Stars", count: 8, fill: "#f59e0b" },
  { rating: "2 Stars", count: 3, fill: "#ef4444" },
  { rating: "1 Star", count: 1, fill: "#6b7280" },
];

const chartConfig = {
  tickets: {
    label: "Tickets",
    color: "#10b981",
  },
  resolved: {
    label: "Resolved",
    color: "#3b82f6",
  },
  avgTime: {
    label: "Avg Time (days)",
    color: "#f59e0b",
  },
  count: {
    label: "Count",
    color: "#8b5cf6",
  },
  avgHours: {
    label: "Average Hours",
    color: "#ef4444",
  },
  target: {
    label: "Target Hours",
    color: "#6b7280",
  },
} satisfies ChartConfig;

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">In Progress</Badge>;
    case "resolved":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Resolved</Badge>;
    case "closed":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Closed</Badge>;
    case "escalated":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Escalated</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "low":
      return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
    case "medium":
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Medium</Badge>;
    case "high":
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">High</Badge>;
    case "critical":
      return <Badge className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "IT Support":
      return <Zap className="h-4 w-4" />;
    case "HR":
      return <Users className="h-4 w-4" />;
    case "Facilities":
      return <HelpCircle className="h-4 w-4" />;
    case "Payroll":
      return <BarChart3 className="h-4 w-4" />;
    case "Training":
      return <MessageCircle className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

export default function HelpdeskPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  const filteredTickets = ticketsData.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <div className="max-w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
              Helpdesk Management
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">Open Tickets</CardTitle>
              <MessageSquare className="h-5 w-5 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">23</div>
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-emerald-200">5</span> new today
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                Avg. Response Time
              </CardTitle>
              <Clock className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">2.4h</div>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span className="text-green-200">-0.5h</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">Resolution Rate</CardTitle>
              <CheckCircle className="h-5 w-5 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">94%</div>
              <p className="text-xs text-amber-100">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                Customer Satisfaction
              </CardTitle>
              <ThumbsUp className="h-5 w-5 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">4.6</div>
              <p className="text-xs text-purple-100">Out of 5.0 rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="bg-white shadow-sm border w-full">
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-green-primary data-[state=active]:text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Support Tickets
            </TabsTrigger>
            <TabsTrigger
              value="faq"
              className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Knowledge Base
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[130px] border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[130px] border-slate-200">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="IT Support">IT Support</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="Facilities">Facilities</SelectItem>
                        <SelectItem value="Payroll">Payroll</SelectItem>
                        <SelectItem value="Training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[130px] border-slate-200">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Support Tickets
                </CardTitle>
                <CardDescription>Manage and track employee support requests</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div>
                            <div className="font-medium">{ticket.title}</div>
                            <div className="text-sm text-muted-foreground">{ticket.id}</div>
                            <div className="flex gap-1 mt-1">
                              {ticket.tags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  <Tag className="h-2 w-2 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                {ticket.submittedBy
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-sm font-medium">{ticket.submittedBy}</div>
                              <div className="text-xs text-muted-foreground">
                                {ticket.department}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(ticket.category)}
                            <span className="text-sm">{ticket.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{ticket.assignedTo}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatTimeAgo(ticket.updatedAt)}</span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setShowTicketDialog(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Update Status
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Reassign
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Comment
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

          <TabsContent value="faq" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Knowledge Base</h3>
                <p className="text-sm text-muted-foreground">
                  Frequently asked questions and self-service resources
                </p>
              </div>
              <Button>
                <Plus className=" h-4 w-4" />
                Add FAQ
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {faqData.map((faq) => (
                <Card
                  key={faq.id}
                  className="hover:shadow-md transition-all duration-300 border border-slate-200"
                >
                  <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-emerald-50">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          {faq.category}
                        </Badge>
                        <CardTitle className="text-base leading-tight">{faq.question}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Stats
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {faq.answer}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {faq.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t">
                      <div className="flex items-center gap-3">
                        <span>{faq.views} views</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {faq.helpful}
                        </span>
                      </div>
                      <span>Updated {new Date(faq.lastUpdated).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-xs text-green-600">
                        {Math.round((faq.helpful / faq.views) * 100)}% helpful
                      </div>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        <Eye className="h-3 w-3 mr-1" />
                        View Full
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
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
                          label={({ payload }) => `${payload.category}: ${payload.count}`}
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
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
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
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Automatically assign IT Support tickets to available technicians
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Priority escalation</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Escalate high priority tickets after 4 hours without response
                        </p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Satisfaction surveys</span>
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
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
                            <p className="text-sm text-muted-foreground">
                              Current: {item.avgHours}h avg
                            </p>
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
          </TabsContent>
        </Tabs>

        {showTicketDialog && selectedTicket && (
          <Dialog open={showTicketDialog} onOpenChange={setShowTicketDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Ticket Details - {selectedTicket.id}
                </DialogTitle>
                <DialogDescription>{selectedTicket.title}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Submitted By</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                            {selectedTicket.submittedBy
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{selectedTicket.submittedBy}</p>
                          <p className="text-xs text-muted-foreground">
                            {selectedTicket.submittedByEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Department</Label>
                      <p className="text-sm mt-1">{selectedTicket.department}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm mt-1 text-muted-foreground leading-relaxed">
                        {selectedTicket.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Category</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getCategoryIcon(selectedTicket.category)}
                        <span className="text-sm">{selectedTicket.category}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Assigned To</Label>
                      <p className="text-sm mt-1">{selectedTicket.assignedTo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Created</Label>
                      <p className="text-sm mt-1">
                        {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedTicket.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="mr-1 h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Conversation</Label>
                  <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                    {selectedTicket.messages.map((message: any) => (
                      <div key={message.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{message.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Add Reply</Label>
                  <Textarea placeholder="Type your response here..." className="mt-1" rows={3} />
                </div>

                {selectedTicket.satisfaction && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Label className="text-sm font-medium text-green-800">
                      Customer Satisfaction
                    </Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <ThumbsUp
                            key={i}
                            className={`h-4 w-4 ${
                              i < selectedTicket.satisfaction
                                ? "text-green-500 fill-green-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-green-700">
                        {selectedTicket.satisfaction}/5 stars
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
                <Button variant="outline" onClick={() => setShowTicketDialog(false)}>
                  Close
                </Button>
                <Button variant="outline">Update Status</Button>
                <Button className="bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Reply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
