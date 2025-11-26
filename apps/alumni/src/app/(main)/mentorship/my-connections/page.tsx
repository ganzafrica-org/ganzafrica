"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { mentorshipApi } from "@/lib/api/alumni";

// Types
interface Goal {
  id: number;
  title: string;
  isCompleted: boolean;
}

interface NextSession {
  id: number;
  title: string | null;
  scheduledAt: string;
  durationMinutes: number;
}

interface Mentorship {
  id: number;
  mentee: {
    id: number;
    name: string;
    avatar: string | null;
    fellowRole: string;
  };
  startDate: string | null;
  status: "active" | "completed" | "paused";
  goals: Goal[];
  progress: number;
  sessionsCompleted: number;
  totalSessions: number;
  nextSession: NextSession | null;
}

// Skeleton Component
const MentorshipsSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-2">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-14 h-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full mt-4" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Mentorship Card Component
const MentorshipCard = ({
  mentorship,
  onClick,
}: {
  mentorship: Mentorship;
  onClick: () => void;
}) => {
  return (
    <Card
      className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg">
                {mentorship.mentee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {mentorship.mentee.name}
              </h3>
              <p className="text-sm text-gray-600">
                {mentorship.mentee.fellowRole}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={mentorship.status === "active" ? "default" : "secondary"}
              className={mentorship.status === "active" ? "bg-green-500" : ""}
            >
              {mentorship.status.charAt(0).toUpperCase() +
                mentorship.status.slice(1)}
            </Badge>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progress
              </span>
              <span className="text-sm text-gray-600">
                {mentorship.progress}%
              </span>
            </div>
            <Progress value={mentorship.progress} className="h-2" />
          </div>

          {/* Goals */}
          {mentorship.goals.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Goals</h4>
              <div className="flex flex-wrap gap-1">
                {mentorship.goals.slice(0, 3).map((goal) => (
                  <Badge
                    key={goal.id}
                    variant="outline"
                    className={`text-xs ${goal.isCompleted ? "bg-green-50 text-green-700" : ""}`}
                  >
                    {goal.isCompleted && (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {goal.title}
                  </Badge>
                ))}
                {mentorship.goals.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{mentorship.goals.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="h-4 w-4" />
              <span>
                {mentorship.sessionsCompleted}
                {mentorship.totalSessions > 0 &&
                  `/${mentorship.totalSessions}`}{" "}
                sessions
              </span>
            </div>
            {mentorship.startDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  Started {new Date(mentorship.startDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Next Session */}
          {mentorship.nextSession && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
              <Calendar className="h-4 w-4" />
              <span>
                Next:{" "}
                {new Date(
                  mentorship.nextSession.scheduledAt,
                ).toLocaleDateString()}{" "}
                at{" "}
                {new Date(
                  mentorship.nextSession.scheduledAt,
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default function MyConnectionsPage() {
  const router = useRouter();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMentorships = async () => {
      try {
        setIsLoading(true);
        const response = await mentorshipApi.getConnections();
        setMentorships(response.mentorships || []);
      } catch (error) {
        console.error("Failed to fetch mentorships:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorships();
  }, []);

  const activeMentorships = mentorships.filter((m) => m.status === "active");
  const completedMentorships = mentorships.filter(
    (m) => m.status === "completed",
  );

  const totalSessions = mentorships.reduce(
    (acc, m) => acc + m.sessionsCompleted,
    0,
  );

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            My Connections
          </h1>
          <p className="text-gray-600">
            Manage your mentorship relationships with fellows
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">
              Active Mentees
            </CardTitle>
            <Users className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeMentorships.length}</div>
            <p className="text-xs text-emerald-100">Currently mentoring</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Total Sessions
            </CardTitle>
            <Target className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessions}</div>
            <p className="text-xs text-blue-100">Sessions completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Completed
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completedMentorships.length}
            </div>
            <p className="text-xs text-purple-100">Mentorships completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Mentorships */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Active Mentorships
        </h2>
        {isLoading ? (
          <MentorshipsSkeleton />
        ) : activeMentorships.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {activeMentorships.map((mentorship) => (
              <MentorshipCard
                key={mentorship.id}
                mentorship={mentorship}
                onClick={() =>
                  router.push(`/mentorship/my-connections/${mentorship.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No active mentorships
              </h3>
              <p className="text-gray-600 mb-4">
                Start mentoring by finding fellows to guide
              </p>
              <Button
                className="bg-green-primary hover:bg-green-600"
                onClick={() => router.push("/mentorship")}
              >
                <Users className="h-4 w-4 mr-2" />
                Find Mentees
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Completed Mentorships */}
      {completedMentorships.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Completed Mentorships
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            {completedMentorships.map((mentorship) => (
              <MentorshipCard
                key={mentorship.id}
                mentorship={mentorship}
                onClick={() =>
                  router.push(`/mentorship/my-connections/${mentorship.id}`)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
