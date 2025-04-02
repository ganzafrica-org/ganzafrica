"use client";

import { Users, FolderGit2, Briefcase, FileText, ChevronDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter,
  CardContent
} from '@workspace/ui/components/card';
import { 
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@workspace/ui/components/Chart';
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
  ResponsiveContainer
} from 'recharts';

// Project Statistics data
const projectStatsData = [
  { month: "Jan", inProgress: 1, completed: 2 },
  { month: "March", inProgress: 6, completed: 0 },
  { month: "May", inProgress: 4, completed: 0 },
  { month: "July", inProgress: 2, completed: 0 },
  { month: "Aug", inProgress: 6, completed: 0 },
];

// User Engagement data
const userEngagementData = [
  { week: "Week 1", activity: 40 },
  { week: "Week 2", activity: 60 },
  { week: "Week 3", activity: 120 },
  { week: "Week 4", activity: 100 },
];

export default function DashboardPage() {
  // Recent activities data
  const recentActivities = [
    {
      user: {
        name: 'Emmanuel N.',
        avatar: '/avatars/emmanuel.jpg'
      },
      action: 'submitted a new comprehensive agricultural development project proposal for',
      time: '2 hours ago'
    },
    {
      user: {
        name: 'Fatima K.',
        avatar: '/avatars/fatima.jpg'
      },
      action: 'updated key milestone achievements for the Clean Water Access Program in rural communities',
      time: '2 hours ago'
    },
    {
      user: {
        name: 'John M.',
        avatar: '/avatars/john.jpg'
      },
      action: 'requested additional technical staff and budget allocation for the expanding solar initiative',
      time: '9 hours ago'
    },
    {
      user: {
        name: 'Amina B.',
        avatar: '/avatars/amina.jpg'
      },
      action: 'requested additional technical staff and budget allocation for the expanding solar initiative',
      time: '5 hours ago'
    }
  ];

  // Active projects data
  const activeProjects = [
    {
      name: 'Project Tracking System',
      description: 'Improving crop yields in drought regions',
      icon: '/project-icons/tracking.png'
    },
    {
      name: 'Clean Water Access Program',
      description: 'Building wells in rural communities',
      icon: '/project-icons/water.png'
    },
    {
      name: 'Project Tracking System',
      description: 'Improving crop yields in drought regions',
      icon: '/project-icons/tracking.png'
    }
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
        <h1 className="font-h4 mb-2">Welcome Back, Angel! 👋</h1>
        <p className="font-regular-paragraph text-gray-600">Welcome back, Angel. Here's what's happening with your website today.</p>
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
            <CardDescription className="font-regular-paragraph text-gray-600">All Users</CardDescription>
            <CardTitle className="font-h4 mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-primary-green font-medium"> ↑ 6.5</span>
              <span className="text-black ml-1 font-regular-paragraph">since last week</span>
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
            <CardDescription className="font-regular-paragraph text-gray-600">Total Projects</CardDescription>
            <CardTitle className="font-h4 mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-red font-medium"> ↓ 0</span>
              <span className="text-gray-500 ml-1 font-regular-paragraph">since last week</span>
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
            <CardDescription className="font-regular-paragraph text-gray-600">Total Opportunities</CardDescription>
            <CardTitle className="font-h4 mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-blue font-medium"> ↑ 6.5</span>
              <span className="text-gray-500 ml-1 font-regular-paragraph">since last week</span>
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
            <CardDescription className="font-regular-paragraph text-gray-600">All News</CardDescription>
            <CardTitle className="font-h4 mt-2">123</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-5">
            <div className="flex items-center">
              <span className="text-secondary-green font-medium"> ↑ 6.5</span>
              <span className="text-black ml-1 font-regular-paragraph">since last week</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Project Statistics */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-regular-paragraph font-semibold">Project Statistics (Last 6 Months)</CardTitle>
            <button className="flex items-center font-regular-paragraph text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
              2020-2024 <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={projectChartConfig}>
              <BarChart 
                accessibilityLayer 
                data={projectStatsData}
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
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
          <CardFooter className="flex-col items-start gap-2 text-sm font-regular-paragraph">
            <div className="flex gap-2 font-medium leading-none">
              <TrendingUp className="h-4 w-4 text-primary-green" />
              <span>Trending up by 5.2% this month</span>
            </div>
            <div className="leading-none text-gray-500">
              Showing in-progress vs completed projects
            </div>
          </CardFooter>
        </Card>

        {/* User Engagement */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-regular-paragraph font-semibold">User Engagement (Last Month)</CardTitle>
            <button className="flex items-center font-regular-paragraph text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
              2024 <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={engagementChartConfig}>
              <LineChart
                accessibilityLayer
                data={userEngagementData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
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
          <CardFooter className="flex-col items-start gap-2 text-sm font-regular-paragraph">
            <div className="flex gap-2 font-medium leading-none">
              <TrendingUp className="h-4 w-4 text-blue" />
              <span>User activity increased by 25% this month</span>
            </div>
            <div className="leading-none text-gray-500">
              Application track weekly activity
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Activities and Active Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-regular-paragraph font-semibold">Recent Activities</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {activity.user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-regular-paragraph">
                    <span className="font-medium">{activity.user.name}</span>{' '}
                    {activity.action}
                  </p>
                  <span className="text-xs text-gray-500 font-regular-paragraph">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Projects */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-regular-paragraph font-semibold">Active Projects</CardTitle>
            <a href="#" className="font-regular-paragraph text-emerald-600 hover:underline">View all Projects</a>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            {activeProjects.map((project, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">P</span>
                </div>
                <div>
                  <h4 className="font-regular-paragraph font-medium">{project.name}</h4>
                  <p className="font-regular-paragraph text-gray-500">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}