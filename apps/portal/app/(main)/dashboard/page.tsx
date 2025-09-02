"use client";

import { useState, useEffect } from 'react';
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
} from '@workspace/ui/components/chart';
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
  ReferenceLine
} from 'recharts';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { useAuth } from '@/components/auth/auth-provider';
import apiClient from '@/lib/api-client';

export default function DashboardPage() {
  // Get auth context to access the current user
  const { user } = useAuth();
  
  // Get the full name of the logged-in user
  const userName = user?.name || "User";

  // State for storing API data
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);
  const [totalNews, setTotalNews] = useState(0);
  const [projectStatsData, setProjectStatsData] = useState([]);
  const [trendData, setTrendData] = useState({
    completedTrend: 0,
    pendingTrend: 0,
    activeTrend: 0,
    completedTotal: 0,
    pendingTotal: 0,
    activeTotal: 0
  });
  const [userEngagementData, setUserEngagementData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});

  // Fetch data from APIs
  useEffect(() => {
    // Fetch total users
    apiClient.get('/users')
      .then(response => {
        const data = response.data;
        // Check if data is an array or has a users property that's an array
        const usersArray = Array.isArray(data) ? data : (data.users || []);
        setTotalUsers(usersArray.length || 0);
        console.log('Users data:', usersArray);
      })
      .catch(error => console.error('Error fetching users:', error));

    // Fetch total projects
    apiClient.get('/projects')
      .then(response => {
        const data = response.data;
        // Check if data is an array or has a projects property that's an array
        const projectsArray = Array.isArray(data) ? data : (data.projects || []);
        setTotalProjects(projectsArray.length || 0);
        console.log('Projects data:', projectsArray);
        
        // Extract active projects for the sidebar
        const active = projectsArray
          .filter(project => project.status === 'active' || project.status === 'in-progress')
          .slice(0, 3)
          .map(project => ({
            id: project.id,
            name: project.name,
            description: project.description,
            icon: project.icon || '/project-icons/tracking.png'
          }));
        
        setActiveProjects(active);
        
        // Fetch additional details for each active project
        active.forEach(project => {
          if (project.id) {
            apiClient.get(`/projects/${project.id}`)
              .then(detailResponse => {
                setProjectDetails(prev => ({
                  ...prev,
                  [project.id]: detailResponse.data
                }));
              })
              .catch(error => console.error(`Error fetching details for project ${project.id}:`, error));
          }
        });
        
        // Process project data for chart based on project start_date and end_date
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const projectsByMonth = {};
        
        // Initialize months with zero counts
        monthNames.forEach(month => {
          projectsByMonth[month] = { month, completed: 0, pending: 0, active: 0, total: 0 };
        });
        
        // Current month and year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        
        // Process all projects regardless of year - to match the total count in the card
        if (Array.isArray(projectsArray)) {
          projectsArray.forEach(project => {
            if (!project) return;
            
            try {
              // Get the project date to use for categorization (prefer start_date)
              let projectDate = null;
              if (project.start_date) {
                projectDate = new Date(project.start_date);
              } else if (project.created_at) {
                projectDate = new Date(project.created_at);
              } else {
                // If no date is available, assign to current month to ensure it's counted
                projectDate = new Date();
              }
              
              // Assign to the appropriate month
              const month = monthNames[projectDate.getMonth()];
              
              // Update counts based on status
              if (month && projectsByMonth[month]) {
                projectsByMonth[month].total += 1;
                
                if (project.status === 'completed') {
                  projectsByMonth[month].completed += 1;
                } else if (project.status === 'planned' || project.status === 'pending') {
                  projectsByMonth[month].pending += 1;
                } else if (project.status === 'active' || project.status === 'in-progress') {
                  projectsByMonth[month].active += 1;
                }
              }
            } catch (e) {
              console.error('Error processing project date:', e);
            }
          });
        }
        
        // Get relevant months (last 6 months including current)
        const relevantMonths = [];
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12; // Ensure positive index
          relevantMonths.push(monthNames[monthIndex]);
        }
        
        // Create chart data from relevant months
        const chartData = relevantMonths.map(month => projectsByMonth[month] || { 
          month, 
          completed: 0, 
          pending: 0, 
          active: 0,
          total: 0 
        });
        
        // Calculate the total across all displayed months for verification
        const chartTotal = chartData.reduce((sum, item) => sum + item.total, 0);
        console.log('Total projects in chart:', chartTotal);
        console.log('Total projects from API:', projectsArray.length);
        
        // Add totals by status for the cards
        const completedTotal = projectsArray.filter(p => p && p.status === 'completed').length;
        const pendingTotal = projectsArray.filter(p => p && (p.status === 'planned' || p.status === 'pending')).length;
        const activeTotal = projectsArray.filter(p => p && (p.status === 'active' || p.status === 'in-progress')).length;
        
        // Add a summary card below the chart that shows overall totals
        setProjectStatsData(chartData);
        
        // Set trend data for the cards
        if (chartData && chartData.length >= 2) {
          const firstMonth = chartData[0] || { completed: 0, pending: 0, active: 0 };
          const lastMonth = chartData[chartData.length - 1] || { completed: 0, pending: 0, active: 0 };
          
          // Safely access properties with fallbacks to 0
          const firstCompleted = firstMonth.completed || 0;
          const lastCompleted = lastMonth.completed || 0;
          const firstPending = firstMonth.pending || 0;
          const lastPending = lastMonth.pending || 0;
          const firstActive = firstMonth.active || 0;
          const lastActive = lastMonth.active || 0;
          
          // Avoid division by zero
          const completedTrend = firstCompleted > 0 
            ? ((lastCompleted - firstCompleted) / firstCompleted) * 100 
            : 0;
            
          const pendingTrend = firstPending > 0 
            ? ((lastPending - firstPending) / firstPending) * 100 
            : 0;
            
          const activeTrend = firstActive > 0 
            ? ((lastActive - firstActive) / firstActive) * 100 
            : 0;
            
          setTrendData({
            completedTrend: Math.round(completedTrend * 10) / 10,
            pendingTrend: Math.round(pendingTrend * 10) / 10,
            activeTrend: Math.round(activeTrend * 10) / 10,
            completedTotal: completedTotal,
            pendingTotal: pendingTotal,
            activeTotal: activeTotal
          });
        } else {
          // Set default trends if there's not enough data
          setTrendData({
            completedTrend: 0,
            pendingTrend: 0,
            activeTrend: 0,
            completedTotal: completedTotal,
            pendingTotal: pendingTotal,
            activeTotal: activeTotal
          });
        }
        
        setProjectStatsData(chartData);
      })
      .catch(error => console.error('Error fetching projects:', error));

    // Fetch total opportunities
    apiClient.get('/opportunities')
      .then(response => {
        const data = response.data;
        // Check if data is an array or has an opportunities property that's an array
        const opportunitiesArray = Array.isArray(data) ? data : (data.opportunities || []);
        setTotalOpportunities(opportunitiesArray.length || 0);
        console.log('Opportunities data:', opportunitiesArray);
      })
      .catch(error => console.error('Error fetching opportunities:', error));

    // Fetch total news
    apiClient.get('/news')
      .then(response => {
        const data = response.data;
        // Check if data is an array or has a news property that's an array
        const newsArray = Array.isArray(data) ? data : (data.news || []);
        setTotalNews(newsArray.length || 0);
        console.log('News data:', newsArray);
      })
      .catch(error => console.error('Error fetching news:', error));
      
    // For user engagement data, we'll process user activity based on is_active flag
    apiClient.get('/users')
      .then(response => {
        const data = response.data;
        // Ensure data is an array
        const userData = Array.isArray(data) ? data : (data.users || []);
        
        // Create weekly data structure
        const weeklyData = [
          { week: "Week 1", active: 0, inactive: 0, total: 0 },
          { week: "Week 2", active: 0, inactive: 0, total: 0 },
          { week: "Week 3", active: 0, inactive: 0, total: 0 },
          { week: "Week 4", active: 0, inactive: 0, total: 0 },
        ];
        
        // Current date for calculating weeks
        const now = new Date();
        
        // Calculate activity based on user data
        userData.forEach(user => {
          // Determine which week bucket this user falls into
          let weekIndex = 0;
          
          if (user.createdAt || user.created_at) {
            const createdDate = new Date(user.createdAt || user.created_at);
            const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 7) weekIndex = 0;
            else if (daysDiff <= 14) weekIndex = 1;
            else if (daysDiff <= 21) weekIndex = 2;
            else if (daysDiff <= 28) weekIndex = 3;
            else return; // Skip users created more than 28 days ago
            
            // Increment total for this week
            weeklyData[weekIndex].total += 1;
            
            // Use the is_active flag from the backend to determine active status
            const isActive = user.is_active === true;
            
            // Increment the appropriate counter based on the is_active flag
            if (isActive) {
              weeklyData[weekIndex].active += 1;
            } else {
              weeklyData[weekIndex].inactive += 1;
            }
          }
        });
        
        setUserEngagementData(weeklyData);
      })
      .catch(error => console.error('Error processing user engagement data:', error));
      
    // Fetch recent activities
    // For now, we'll use the projects data to simulate activities
    apiClient.get('/projects')
      .then(response => {
        const data = response.data;
        // Ensure data is an array
        const projectData = Array.isArray(data) ? data : (data.projects || []);
        
        // Create a copy of the array for sorting to avoid mutations
        const sortedProjects = [...projectData];
        
        // Check if sortedProjects is non-empty before sorting
        if (sortedProjects.length > 0) {
          // Sort by date (newest first)
          sortedProjects.sort((a, b) => {
            const dateA = new Date(a.updated_at || a.created_at || 0);
            const dateB = new Date(b.updated_at || b.created_at || 0);
            return dateB - dateA;
          });
        }
        
        // Get most recent projects and create activity entries
        const activities = sortedProjects
          .slice(0, 4)
          .map(project => {
            // Check if project has been updated after creation
            const isUpdated = project.updated_at && project.created_at && 
                             (project.updated_at !== project.created_at);
            
            // Get the appropriate timestamp (use updated_at if available and different, otherwise created_at)
            const activityDate = isUpdated ? 
                               new Date(project.updated_at) : 
                               new Date(project.created_at || new Date());
            
            const timeAgoInfo = getTimeAgo(activityDate);
            
            return {
              user: {
                name: project.createdBy?.name || project.creator?.name || 'User',
                avatar: project.createdBy?.avatar || project.creator?.avatar || '/avatars/default.jpg'
              },
              action: isUpdated 
                ? `updated key milestone achievements for the ${project.name}`
                : `submitted a new ${project.name} project proposal for review`,
              timeAgo: timeAgoInfo
            };
          });
          
        setRecentActivities(activities);
      })
      .catch(error => console.error('Error processing activities data:', error));
  }, []);

  // Helper function to calculate time ago
  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    // Check if it's very recent (within 20 minutes)
    if (diffMins < 20) {
      return { text: 'Just now', isRecent: true };
    }
    
    if (diffHrs < 1) {
      return { text: `${diffMins} minutes ago`, isRecent: false };
    }
    if (diffHrs === 1) {
      return { text: '1 hour ago', isRecent: false };
    }
    if (diffHrs < 24) {
      return { text: `${diffHrs} hours ago`, isRecent: false };
    }
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) {
      return { text: '1 day ago', isRecent: false };
    }
    return { text: `${diffDays} days ago`, isRecent: false };
  }

  // Chart config for project statistics - updated to show completed and pending
  const projectChartConfig = {
    completed: {
      label: "Completed",
      color: "#009758", // green for completed
    },
    pending: {
      label: "Pending",
      color: "#FF9500", // orange for pending
    },
    active: {
      label: "Active",
      color: "#2F88E1", // blue for active
    },
    total: {
      label: "Total",
      color: "#CCCCCC", // light gray for total
    }
  } satisfies ChartConfig;

  // Chart config for user engagement
  const engagementChartConfig = {
    active: {
      label: "Active Users",
      color: "#2F88E1", // blue for active
    },
    inactive: {
      label: "Inactive Users",
      color: "#FF9500", // orange for inactive
    },
    total: {
      label: "Total Users",
      color: "#CCCCCC", // gray for total
    }
  } satisfies ChartConfig;

  // Calculate the max value for Y-axis domain in project chart
  const maxProjectValue = projectStatsData.length > 0 
    ? Math.max(
        ...projectStatsData.map(item => Math.max(
          item.completed || 0, 
          item.pending || 0, 
          item.total || 0
        ))
      )
    : 10;
  const yAxisDomain = [0, Math.max(10, Math.ceil(maxProjectValue * 1.2))];

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold mb-2 dark:text-white">Welcome Back, {userName}! 👋</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Here's an overview of your dashboard activities and statistics today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="relative shadow-sm overflow-hidden dark:bg-gray-800">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-green"></div>
          <div className="absolute top-3 md:top-4 right-3 md:right-4">
            <div className="rounded-full p-1.5 md:p-2 bg-lighter-green-50 dark:bg-green-900">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-primary-green" />
            </div>
          </div>
          <CardHeader className="pb-0 pt-4 px-4">
            <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400">All Users</CardDescription>
            <CardTitle className="text-xl md:text-2xl font-semibold mt-1 md:mt-2 dark:text-white">{totalUsers}</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-4 px-4">
            <div className="flex items-center">
              <span className="text-xs md:text-sm text-primary-green font-medium">↑ 6.5%</span>
              <span className="text-xs md:text-sm text-black dark:text-white ml-1">since last week</span>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="relative shadow-sm overflow-hidden dark:bg-gray-800">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-orange"></div>
          <div className="absolute top-3 md:top-4 right-3 md:right-4">
            <div className="rounded-full p-1.5 md:p-2 bg-light-orange dark:bg-orange-900">
              <FolderGit2 className="w-4 h-4 md:w-5 md:h-5 text-primary-orange" />
            </div>
          </div>
          <CardHeader className="pb-0 pt-4 px-4">
            <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Projects</CardDescription>
            <CardTitle className="text-xl md:text-2xl font-semibold mt-1 md:mt-2 dark:text-white">{totalProjects}</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-4 px-4">
            <div className="flex items-center">
              <span className={`text-xs md:text-sm ${trendData.completedTrend >= 0 ? 'text-primary-green' : 'text-red-500'} font-medium`}>
                {trendData.completedTrend >= 0 ? `↑ ${trendData.completedTrend}%` : `↓ ${Math.abs(trendData.completedTrend)}%`}
              </span>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 ml-1">completed projects</span>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="relative shadow-sm overflow-hidden dark:bg-gray-800">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue"></div>
          <div className="absolute top-3 md:top-4 right-3 md:right-4">
            <div className="rounded-full p-1.5 md:p-2 bg-blue-lighter dark:bg-blue-900">
              <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-blue" />
            </div>
          </div>
          <CardHeader className="pb-0 pt-4 px-4">
            <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Opportunities</CardDescription>
            <CardTitle className="text-xl md:text-2xl font-semibold mt-1 md:mt-2 dark:text-white">{totalOpportunities}</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-4 px-4">
            <div className="flex items-center">
              <span className="text-xs md:text-sm text-blue font-medium">↑ 6.5%</span>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 ml-1">since last week</span>
            </div>
          </CardFooter>
        </Card>
        
        <Card className="relative shadow-sm overflow-hidden dark:bg-gray-800">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-grid"></div>
          <div className="absolute top-3 md:top-4 right-3 md:right-4">
            <div className="rounded-full p-1.5 md:p-2 bg-yellow-lighter dark:bg-yellow-900">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-orange-grid" />
            </div>
          </div>
          <CardHeader className="pb-0 pt-4 px-4">
            <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400">All News</CardDescription>
            <CardTitle className="text-xl md:text-2xl font-semibold mt-1 md:mt-2 dark:text-white">{totalNews}</CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center pt-0 pb-4 px-4">
            <div className="flex items-center">
              <span className="text-xs md:text-sm text-secondary-green font-medium">↑ 6.5%</span>
              <span className="text-xs md:text-sm text-black dark:text-white ml-1">since last week</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Project Statistics - UPDATED CHART */}
        <Card className="shadow-sm dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <div>
              <CardTitle className="text-base md:text-lg font-semibold dark:text-white">Project Status Comparison</CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {trendData.completedTrend >= 0 
                  ? `Completed projects increasing by ${trendData.completedTrend}%` 
                  : `Completed projects decreasing by ${Math.abs(trendData.completedTrend)}%`}
              </CardDescription>
            </div>
            <button className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
              2020-2024 <ChevronDown className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </button>
          </CardHeader>
          <CardContent className="px-2 md:px-4">
            <ChartContainer config={projectChartConfig}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart 
                  accessibilityLayer 
                  data={projectStatsData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    domain={yAxisDomain}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Number of Projects', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 }, dx: -10 }}
                  />
                  <ChartTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Line 
                    type="monotone"
                    dataKey="total" 
                    stroke="var(--color-total)" 
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={{ fill: "var(--color-total)", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="completed" 
                    stroke="var(--color-completed)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-completed)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="pending" 
                    stroke="var(--color-pending)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-pending)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone"
                    dataKey="active" 
                    stroke="var(--color-active)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-active)", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  
                  {/* Add a reference line to highlight the trend */}
                  {projectStatsData.length >= 2 && (
                    <ReferenceLine 
                      stroke="#009758" 
                      strokeDasharray="3 3"
                      segment={[
                        { 
                          x: projectStatsData[0].month, 
                          y: projectStatsData[0].completed || 0 
                        },
                        { 
                          x: projectStatsData[projectStatsData.length-1].month, 
                          y: projectStatsData[projectStatsData.length-1].completed || 0 
                        }
                      ]} 
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex justify-center items-center pt-0 pb-4 px-4">
            <div className="flex flex-wrap justify-center items-center space-x-4 md:space-x-8">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#009758]"></div>
                <span className="text-xs md:text-sm dark:text-gray-300">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#FF9500]"></div>
                <span className="text-xs md:text-sm dark:text-gray-300">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#2F88E1]"></div>
                <span className="text-xs md:text-sm dark:text-gray-300">Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#CCCCCC]"></div>
                <span className="text-xs md:text-sm dark:text-gray-300">Total</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* User Engagement */}
        <Card className="shadow-sm dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <div>
              <CardTitle className="text-base md:text-lg font-semibold dark:text-white">User Engagement</CardTitle>
              <CardDescription className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active vs. Inactive Users by Week
              </CardDescription>
            </div>
            <button className="flex items-center text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded">
              2024 <ChevronDown className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </button>
          </CardHeader>
          <CardContent className="px-2 md:px-4">
            <ChartContainer config={engagementChartConfig}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  accessibilityLayer
                  data={userEngagementData}
                  margin={{
                    top: 5,
                    left: 0,
                    right: 10,
                    bottom: 5
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="week"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 'dataMax + 5']}
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Number of Users', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: 12 }, dx: -10 }}
                  />
                  <ChartTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    dataKey="total"
                    type="monotone"
                    stroke="var(--color-total)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    dot={{
                      fill: "var(--color-total)",
                      r: 3
                    }}
                    activeDot={{
                      r: 5,
                    }}
                  />
                  <Line
                    dataKey="active"
                    type="monotone"
                    stroke="var(--color-active)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-active)",
                      r: 4
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                  <Line
                    dataKey="inactive"
                    type="monotone"
                    stroke="var(--color-inactive)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-inactive)",
                      r: 4
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex justify-center items-center pt-0 pb-4 px-4">
            <div className="flex items-center space-x-4 md:space-x-8">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#2F88E1]"></div>
                <span className="text-xs md:text-sm dark:text-gray-300">Active Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#FF9500]"></div>
                <span className="text-xs md:text-sm dark:text-gray-300">Inactive Users</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-sm bg-[#CCCCCC]"></div>
                <span className="text-xs md:text-sm dark:text-gray-300">Total</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Recent Activities - 65% width on large screens */}
        <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:py-4 flex justify-between items-center">
            <h2 className="text-base md:text-lg font-semibold dark:text-white">Recent Activities</h2>
          </div>
          
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start px-4 py-3 md:py-4">
                <Avatar className="mr-2 md:mr-3 h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={`pb-3 md:pb-4 ${index < recentActivities.length - 1 ? "border-b dark:border-gray-700 w-full" : "w-full"}`}>
                  <p className="text-sm md:text-base dark:text-gray-300 line-clamp-2">
                    <span className="font-medium dark:text-white">{activity.user.name}</span>{' '}
                    {activity.action}
                  </p>
                  <div className="flex items-center mt-1">
                    {activity.timeAgo.isRecent ? (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{activity.timeAgo.text}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{activity.timeAgo.text}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 md:py-8 text-center">
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">No recent activities to display</p>
            </div>
          )}
        </div>

        {/* Active Projects - 35% width on large screens */}
        <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:py-4 flex justify-between items-center">
            <h2 className="text-base md:text-lg font-semibold dark:text-white">Active Projects</h2>
            <a href="/projects" className="text-xs md:text-sm text-emerald-600 dark:text-emerald-400 hover:underline">View all</a>
          </div>
          
          {activeProjects.length > 0 ? (
            activeProjects.map((project, index) => (
              <div key={index} className="flex items-start px-4 py-3 md:py-4">
                <Avatar className="mr-2 md:mr-3 h-6 w-6 md:h-8 md:w-8 flex-shrink-0">
                  <AvatarImage src="https://github.com/shadcn.png" alt={project.name} />
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <div className={`pb-3 md:pb-4 ${index < activeProjects.length - 1 ? "border-b dark:border-gray-700 w-full" : "w-full"}`}>
                  <h4 className="text-sm md:text-base font-medium dark:text-white line-clamp-1">{project.name}</h4>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 md:py-8 text-center">
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">No active projects to display</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}