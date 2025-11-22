"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Briefcase,
  Calendar,
  Trophy,
  UserPlus,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { alumniApi, type DashboardStats } from "@/lib/api/alumni";

// Skeleton for stats cards
const StatsSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// Stats Cards Component
const StatsCards = ({ stats }: { stats: DashboardStats }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-100">
          My Mentorship Pairs
        </CardTitle>
        <UserPlus className="h-5 w-5 text-emerald-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.myMentorshipPairs}</div>
        <p className="text-xs text-emerald-100">Active connections</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">
          Upcoming Events
        </CardTitle>
        <Calendar className="h-5 w-5 text-blue-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
        <p className="text-xs text-blue-100">Next 30 days</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">
          Job Postings
        </CardTitle>
        <Briefcase className="h-5 w-5 text-amber-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.jobPostings}</div>
        <p className="text-xs text-amber-100">Open positions</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-purple-100">
          Achievements
        </CardTitle>
        <Trophy className="h-5 w-5 text-purple-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.achievements}</div>
        <p className="text-xs text-purple-100">This year</p>
      </CardContent>
    </Card>
  </div>
);

export default function AlumniDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const { stats: dashboardStats } = await alumniApi.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-primary to-green-secondary rounded-lg text-white p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-3">
              Welcome to the Alumni Network
            </h1>
            <p className="text-green-100 mb-6 text-lg">
              Connect, grow, and give back to the GanzAfrica community
            </p>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                asChild
                className="hover:shadow-md transition-all duration-300"
              >
                <Link href="/directory">
                  <Users className="h-4 w-4 mr-2" />
                  Browse Alumni
                </Link>
              </Button>

            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-green-500 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {isLoadingStats ? (
        <StatsSkeleton />
      ) : stats ? (
        <StatsCards stats={stats} />
      ) : (
        <div className="text-center text-gray-500">
          Failed to load statistics
        </div>
      )}

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
          <CardTitle className="text-xl text-slate-800">
            Quick Actions
          </CardTitle>
          <CardDescription>
            Get started with the most popular alumni activities
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col gap-3 border-green-200 hover:bg-green-50 hover:border-green-400 transition-all duration-300"
              asChild
            >
              <Link href="/mentorship">
                <UserPlus className="h-8 w-8 text-green-600" />
                <span className="font-medium">Find a Mentor</span>
                <span className="text-xs text-gray-500 text-center">
                  Connect with experienced alumni
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col gap-3 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
              asChild
            >
              <Link href="/events">
                <Calendar className="h-8 w-8 text-blue-600" />
                <span className="font-medium">Join Events</span>
                <span className="text-xs text-gray-500 text-center">
                  Network and learn together
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col gap-3 border-amber-200 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300"
              asChild
            >
              <Link href="/resources">
                <BookOpen className="h-8 w-8 text-amber-600" />
                <span className="font-medium">Access Resources</span>
                <span className="text-xs text-gray-500 text-center">
                  Tools and guides for success
                </span>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex flex-col gap-3 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300"
              asChild
            >
              <Link href="/achievements">
                <Trophy className="h-8 w-8 text-purple-600" />
                <span className="font-medium">Share Success</span>
                <span className="text-xs text-gray-500 text-center">
                  Celebrate your achievements
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
