"use client";

import {
  Users,
  FolderGit2,
  Briefcase,
  FileText,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@workspace/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/Chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
} from "recharts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { useAuth } from "@/components/auth/auth-provider";

// Project Statistics data
const projectStatsData = [
  { month: "Jan", inProgress: 1, completed: 2 },
  { month: "March", inProgress: 6, completed: 3 },
  { month: "May", inProgress: 4, completed: 6 },
  { month: "July", inProgress: 2, completed: 9 },
  { month: "Aug", inProgress: 6, completed: 8 },
];

// User Engagement data
const userEngagementData = [
  { week: "Week 1", activity: 40 },
  { week: "Week 2", activity: 60 },
  { week: "Week 3", activity: 110 },
  { week: "Week 4", activity: 100 },
];

export default function DashboardPage() {
  // Get auth context to access the current user
  const { user } = useAuth();

  // Get the full name of the logged-in user
  const userName = user?.name || "User";

  // Recent activities data
  const recentActivities = [
    {
      user: {
        name: "Emmanuel N.",
        avatar: "/avatars/emmanuel.jpg",
      },
      action:
        "submitted a new comprehensive agricultural development project proposal for review",
      time: "2 hours ago",
    },
    {
      user: {
        name: "Fatima K.",
        avatar: "/avatars/fatima.jpg",
      },
      action:
        "updated key milestone achievements for the Clean Water Access Program in rural communities",
      time: "2 hours ago",
    },
    {
      user: {
        name: "John M.",
        avatar: "/avatars/john.jpg",
      },
      action:
        "requested additional technical staff and budget allocation for the expanding solar initiative",
      time: "9 hours ago",
    },
    {
      user: {
        name: "Amina B.",
        avatar: "/avatars/amina.jpg",
      },
      action:
        "requested additional technical staff and budget allocation for the expanding solar initiative",
      time: "6 hours ago",
    },
  ];

  // Active projects data
  const activeProjects = [
    {
      name: "Project Tracking System",
      description: "Improving crop yields in drought regions",
      icon: "/project-icons/tracking.png",
    },
    {
      name: "Clean Water Access Program",
      description: "Building wells in rural communities",
      icon: "/project-icons/water.png",
    },
    {
      name: "Project Tracking System",
      description: "Improving crop yields in drought regions",
      icon: "/project-icons/tracking.png",
    },
  ];

  // Chart config for project statistics
  const projectChartConfig = {
    inProgress: {
      label: "In Progress",
      color: "#009758", // secondary-green
    },
    completed: {
      label: "Completed",
      color: "#FFEF97", // secondary-yellow
    },
  } satisfies ChartConfig;

  // Chart config for user engagement
  const engagementChartConfig = {
    activity: {
      label: "Application track",
      color: "#2F88E1", // blue
    },
  } satisfies ChartConfig;

  return (
    <div className="p-8 bg-gray-50">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome Back, {userName}! 👋
        </h1>
        <p className="text-gray-600">
          Here's an overview of your dashboard activities and statistics today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-green"></div>
          <div className="absolute top-4 right-4">
            <div className="rounded-full p-2 bg-lighter-green-50">
              <Users className="w-5 h-5 text-primary-green" />
            </div>
          </div>
          <CardHeader>
            <CardDescription className="text-gray-600">
              All Users
            </CardDescription>
            <CardTitle className="text-2xl font-semibold mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-primary-green font-medium">↑ 6.5</span>
              <span className="text-black ml-1">since last week</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="relative shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-orange"></div>
          <div className="absolute top-4 right-4">
            <div className="rounded-full p-2 bg-light-orange">
              <FolderGit2 className="w-5 h-5 text-primary-orange" />
            </div>
          </div>
          <CardHeader>
            <CardDescription className="text-gray-600">
              Total Projects
            </CardDescription>
            <CardTitle className="text-2xl font-semibold mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-red-500 font-medium">↓ 0</span>
              <span className="text-gray-500 ml-1">since last week</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="relative shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue"></div>
          <div className="absolute top-4 right-4">
            <div className="rounded-full p-2 bg-blue-lighter">
              <Briefcase className="w-5 h-5 text-blue" />
            </div>
          </div>
          <CardHeader>
            <CardDescription className="text-gray-600">
              Total Opportunities
            </CardDescription>
            <CardTitle className="text-2xl font-semibold mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-blue font-medium">↑ 6.5</span>
              <span className="text-gray-500 ml-1">since last week</span>
            </div>
          </CardFooter>
        </Card>

        <Card className="relative shadow-sm overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-grid"></div>
          <div className="absolute top-4 right-4">
            <div className="rounded-full p-2 bg-yellow-lighter">
              <FileText className="w-5 h-5 text-orange-grid" />
            </div>
          </div>
          <CardHeader>
            <CardDescription className="text-gray-600">
              All News
            </CardDescription>
            <CardTitle className="text-2xl font-semibold mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-secondary-green font-medium">↑ 6.5</span>
              <span className="text-black ml-1">since last week</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Statistics */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-semibold">
              Project Statistics (Last 6 Months)
            </CardTitle>
            <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
              2020-2024 <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={projectChartConfig}>
              <BarChart
                accessibilityLayer
                data={projectStatsData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                height={300}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 2, 4, 6, 8]}
                  domain={[0, 10]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="inProgress"
                  fill="var(--color-inProgress)"
                  radius={4}
                  maxBarSize={25}
                />
                <Bar
                  dataKey="completed"
                  fill="var(--color-completed)"
                  radius={4}
                  maxBarSize={25}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex justify-center items-center pt-0">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#009758]"></div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#FFEF97]"></div>
                <span>Completed</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* User Engagement */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-semibold">
              User Engagement (Last Month)
            </CardTitle>
            <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
              2024 <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={engagementChartConfig}>
              <LineChart
                accessibilityLayer
                data={userEngagementData}
                margin={{
                  top: 5,
                  left: 20,
                  right: 20,
                  bottom: 5,
                }}
                height={300}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  ticks={[0, 40, 80, 120, 160]}
                  domain={[0, 180]}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Line
                  dataKey="activity"
                  type="natural"
                  stroke="var(--color-activity)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--color-activity)",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex justify-center items-center pt-0">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-sm bg-[#2F88E1]"></div>
              <span>Application track</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Recent Activities - 65% width */}
        <div className="col-span-12 lg:col-span-8 bg-white">
          <div className="border-b px-4 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recent Activities</h2>
          </div>

          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start px-4 py-4">
              <Avatar className="mr-3 h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={activity.user.name}
                />
                <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={`pb-4 ${index < recentActivities.length - 1 ? "border-b" : ""}`}
              >
                <p>
                  <span className="font-medium">{activity.user.name}</span>{" "}
                  {activity.action}
                </p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active Projects - 35% width */}
        <div className="col-span-12 lg:col-span-4 bg-white">
          <div className="border-b px-4 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <a href="#" className="text-emerald-600 hover:underline">
              View all Projects
            </a>
          </div>

          {activeProjects.map((project, index) => (
            <div key={index} className="flex items-start px-4 py-4">
              <Avatar className="mr-3 h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={project.name}
                />
                <AvatarFallback>P</AvatarFallback>
              </Avatar>
              <div
                className={`pb-4 ${index < activeProjects.length - 1 ? "border-b" : ""}`}
              >
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-gray-500 text-sm">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
