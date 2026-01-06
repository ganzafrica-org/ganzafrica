"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  Plus,
  Trash2,
  Phone,
  Mail,
  Settings,
} from "lucide-react";
import { mentorshipApi } from "@/lib/api/alumni";

// Types
interface Goal {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt?: string | null;
}

interface Session {
  id: number;
  title: string | null;
  scheduledAt: string;
  durationMinutes: number;
  status: "scheduled" | "completed" | "cancelled";
  notes: string | null;
  rating: number | null;
  feedback: string | null;
}

interface Connection {
  id: number;
  mentee: {
    id: number;
    name: string;
    email: string | null;
    avatar: string | null;
    fellowRole: string;
    phone: string | null;
  };
  status: "active" | "completed" | "paused";
  totalSessions: number;
  sessionsCompleted: number;
  progress: number;
  startDate: string | null;
  endDate: string | null;
  goals: Goal[];
  sessions: Session[];
}

// Loading skeleton
const ConnectionSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-lg" />
  </div>
);

export default function ConnectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params.id as string;

  const [connection, setConnection] = useState<Connection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form states
  const [newGoal, setNewGoal] = useState({ title: "", description: "" });
  const [newSession, setNewSession] = useState({
    title: "",
    scheduledAt: "",
    durationMinutes: 60,
    notes: "",
  });
  const [totalSessions, setTotalSessions] = useState(0);

  const fetchConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await mentorshipApi.getConnection(
        parseInt(connectionId),
      );
      setConnection(response.connection);
      setTotalSessions(response.connection.totalSessions || 0);
    } catch (err) {
      setError("Failed to load connection details");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [connectionId]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  const handleAddGoal = async () => {
    if (!newGoal.title.trim()) return;

    try {
      await mentorshipApi.addGoal(parseInt(connectionId), {
        title: newGoal.title,
        description: newGoal.description || undefined,
      });
      setNewGoal({ title: "", description: "" });
      setIsAddGoalOpen(false);
      fetchConnection();
    } catch (err) {
      console.error("Failed to add goal:", err);
    }
  };

  const handleToggleGoal = async (goalId: number, isCompleted: boolean) => {
    try {
      await mentorshipApi.updateGoal(parseInt(connectionId), goalId, {
        isCompleted: !isCompleted,
      });
      fetchConnection();
    } catch (err) {
      console.error("Failed to update goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    try {
      await mentorshipApi.deleteGoal(parseInt(connectionId), goalId);
      fetchConnection();
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  const handleScheduleSession = async () => {
    if (!newSession.scheduledAt) return;

    try {
      await mentorshipApi.scheduleSession(parseInt(connectionId), {
        title: newSession.title || undefined,
        scheduledAt: new Date(newSession.scheduledAt).toISOString(),
        durationMinutes: newSession.durationMinutes,
        notes: newSession.notes || undefined,
      });
      setNewSession({
        title: "",
        scheduledAt: "",
        durationMinutes: 60,
        notes: "",
      });
      setIsScheduleSessionOpen(false);
      fetchConnection();
    } catch (err) {
      console.error("Failed to schedule session:", err);
    }
  };

  const handleUpdateSessionStatus = async (
    sessionId: number,
    status: "completed" | "cancelled",
  ) => {
    try {
      await mentorshipApi.updateSession(parseInt(connectionId), sessionId, {
        status,
      });
      fetchConnection();
    } catch (err) {
      console.error("Failed to update session:", err);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      await mentorshipApi.deleteSession(parseInt(connectionId), sessionId);
      fetchConnection();
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      await mentorshipApi.updateConnection(parseInt(connectionId), {
        totalSessions,
      });
      setIsSettingsOpen(false);
      fetchConnection();
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  const handleWhatsAppConnect = () => {
    if (connection?.mentee.phone) {
      const message = encodeURIComponent(
        `Hi ${connection.mentee.name}, I wanted to connect regarding our mentorship.`,
      );
      window.open(
        `https://wa.me/${connection.mentee.phone}?text=${message}`,
        "_blank",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen">
        <ConnectionSkeleton />
      </div>
    );
  }

  if (error || !connection) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen">
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">
              {error || "Connection not found"}
            </p>
            <Button onClick={() => router.push("/mentorship/my-connections")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Connections
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingSessions = connection.sessions.filter(
    (s) => s.status === "scheduled",
  );
  const pastSessions = connection.sessions.filter(
    (s) => s.status !== "scheduled",
  );

  return (
    <div className="space-y-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/mentorship/my-connections")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
          Mentorship Details
        </h1>
      </div>

      {/* Mentee Info Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl">
                  {connection.mentee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {connection.mentee.name}
                </h2>
                <p className="text-gray-600">{connection.mentee.fellowRole}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={
                      connection.status === "active" ? "default" : "secondary"
                    }
                    className={
                      connection.status === "active" ? "bg-green-500" : ""
                    }
                  >
                    {connection.status.charAt(0).toUpperCase() +
                      connection.status.slice(1)}
                  </Badge>
                  {connection.startDate && (
                    <span className="text-sm text-gray-500">
                      Since{" "}
                      {new Date(connection.startDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {connection.mentee.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppConnect}
                  className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              )}
              {connection.mentee.email && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`mailto:${connection.mentee.email}`, "_blank")
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
              )}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mentorship Settings</DialogTitle>
                    <DialogDescription>
                      Configure the total number of sessions for this
                      mentorship.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium">
                        Total Sessions
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={totalSessions}
                        onChange={(e) =>
                          setTotalSessions(parseInt(e.target.value) || 0)
                        }
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Set the target number of sessions for this mentorship
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsSettingsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateSettings}
                      className="bg-green-primary hover:bg-green-600"
                    >
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">
              Sessions
            </CardTitle>
            <Calendar className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {connection.sessionsCompleted}
              {connection.totalSessions > 0 && `/${connection.totalSessions}`}
            </div>
            <p className="text-xs text-emerald-100">Sessions completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Goals
            </CardTitle>
            <Target className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {connection.goals.filter((g) => g.isCompleted).length}/
              {connection.goals.length}
            </div>
            <p className="text-xs text-blue-100">Goals completed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Progress
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{connection.progress}%</div>
            <Progress
              value={connection.progress}
              className="h-2 mt-2 bg-purple-400"
            />
          </CardContent>
        </Card>
      </div>

      {/* Goals Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-secondary" />
            Goals
          </CardTitle>
          <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-primary hover:bg-green-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>
                  Create a new goal for this mentorship
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, title: e.target.value })
                    }
                    placeholder="e.g., Master Python basics"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal({ ...newGoal, description: e.target.value })
                    }
                    placeholder="Describe the goal..."
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddGoalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddGoal}
                  disabled={!newGoal.title.trim()}
                  className="bg-green-primary hover:bg-green-600"
                >
                  Add Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {connection.goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No goals set yet. Add your first goal to track progress.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connection.goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    goal.isCompleted
                      ? "bg-green-50 border-green-200"
                      : "bg-white"
                  }`}
                >
                  <Checkbox
                    checked={goal.isCompleted}
                    onCheckedChange={() =>
                      handleToggleGoal(goal.id, goal.isCompleted)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        goal.isCompleted ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {goal.title}
                    </p>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {goal.description}
                      </p>
                    )}
                    {goal.completedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Completed{" "}
                        {new Date(goal.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-secondary" />
            Sessions
          </CardTitle>
          <Dialog
            open={isScheduleSessionOpen}
            onOpenChange={setIsScheduleSessionOpen}
          >
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-secondary hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Session</DialogTitle>
                <DialogDescription>
                  Schedule a new mentorship session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium">
                    Title (optional)
                  </label>
                  <Input
                    value={newSession.title}
                    onChange={(e) =>
                      setNewSession({ ...newSession, title: e.target.value })
                    }
                    placeholder="e.g., Weekly check-in"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={newSession.scheduledAt}
                    onChange={(e) =>
                      setNewSession({
                        ...newSession,
                        scheduledAt: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Select
                    value={newSession.durationMinutes.toString()}
                    onValueChange={(v) =>
                      setNewSession({
                        ...newSession,
                        durationMinutes: parseInt(v),
                      })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={newSession.notes}
                    onChange={(e) =>
                      setNewSession({ ...newSession, notes: e.target.value })
                    }
                    placeholder="Session agenda or notes..."
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsScheduleSessionOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScheduleSession}
                  disabled={!newSession.scheduledAt}
                  className="bg-blue-secondary hover:bg-blue-700"
                >
                  Schedule
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {connection.sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No sessions scheduled yet. Schedule your first session.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              {upcomingSessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Upcoming Sessions
                  </h3>
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-blue-200 bg-blue-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-secondary flex items-center justify-center text-white">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {session.title || "Mentorship Session"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(session.scheduledAt).toLocaleString()} •{" "}
                              {session.durationMinutes} min
                            </p>
                            {session.notes && (
                              <p className="text-xs text-gray-500 mt-1">
                                {session.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() =>
                              handleUpdateSessionStatus(session.id, "completed")
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Sessions */}
              {pastSessions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Past Sessions
                  </h3>
                  <div className="space-y-3">
                    {pastSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          session.status === "completed"
                            ? "border-green-200 bg-green-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                              session.status === "completed"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          >
                            {session.status === "completed" ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {session.title || "Mentorship Session"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(session.scheduledAt).toLocaleString()}
                            </p>
                            <Badge
                              variant={
                                session.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`mt-1 ${
                                session.status === "completed"
                                  ? "bg-green-500"
                                  : ""
                              }`}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
