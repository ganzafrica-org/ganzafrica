import { Request, Response } from "express";
import { db } from "../db/client";
import {
  users,
  roles,
  alumni_mentorships,
  mentorship_goals,
  mentorship_sessions,
  alumni_profiles,
} from "../db/schema";
import { eq, and, or, count, countDistinct, avg, sql, inArray } from "drizzle-orm";
import { Logger } from "../config";

const logger = new Logger("MentorshipController");

/**
 * Get mentorship statistics for the current alumni
 */
export const getMentorshipStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get the fellow and public role IDs
    const rolesResult = await db
      .select()
      .from(roles)
      .where(or(eq(roles.name, "fellow"), eq(roles.name, "public")));

    if (!rolesResult || rolesResult.length === 0) {
      res.status(200).json({
        stats: {
          availableMentees: 0,
          activeRelationships: 0,
          sessionsCompleted: 0,
          averageRating: 0,
        },
      });
      return;
    }

    const roleIds = rolesResult.map((r) => r.id);

    // Get total fellows and public users count
    const totalMentees = await db
      .select({ count: count() })
      .from(users)
      .where(and(inArray(users.role_id, roleIds), eq(users.is_active, true)));

    // Get mentees with active mentors (not available)
    const menteesWithMentors = await db
      .select({ count: countDistinct(alumni_mentorships.mentee_id) })
      .from(alumni_mentorships)
      .where(eq(alumni_mentorships.status, "active"));

    const availableMentees = (totalMentees[0]?.count || 0) - (menteesWithMentors[0]?.count || 0);

    // Get total active relationships
    const activeRelationships = await db
      .select({ count: count() })
      .from(alumni_mentorships)
      .where(eq(alumni_mentorships.status, "active"));

    // Get completed sessions count
    const completedSessions = await db
      .select({ count: count() })
      .from(mentorship_sessions)
      .where(eq(mentorship_sessions.status, "completed"));

    // Get average rating from completed sessions
    const avgRating = await db
      .select({ avg: avg(mentorship_sessions.rating) })
      .from(mentorship_sessions)
      .where(
        and(
          eq(mentorship_sessions.status, "completed"),
          sql`${mentorship_sessions.rating} IS NOT NULL`,
        ),
      );

    res.status(200).json({
      stats: {
        availableMentees: Math.max(0, availableMentees),
        activeRelationships: activeRelationships[0]?.count || 0,
        sessionsCompleted: completedSessions[0]?.count || 0,
        averageRating: avgRating[0]?.avg ? parseFloat(String(avgRating[0].avg)).toFixed(1) : 0,
      },
    });
  } catch (error) {
    logger.error("Error fetching mentorship stats", error);
    res.status(500).json({
      error: "Failed to fetch mentorship statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all fellows (potential mentees) with pagination
 */
export const getFellows = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, available, page, limit } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 15));

    // Get the fellow and public role IDs (matching the stats logic)
    const rolesResult = await db
      .select()
      .from(roles)
      .where(or(eq(roles.name, "fellow"), eq(roles.name, "public")));

    if (!rolesResult || rolesResult.length === 0) {
      res.status(200).json({
        fellows: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount: 0,
          totalPages: 0,
          hasMore: false,
        },
      });
      return;
    }

    const roleIds = rolesResult.map((r) => r.id);

    // Get all fellows and public users with their profiles
    const fellowsList = await db
      .select({
        id: users.id,
        name: users.name,
        avatar_url: users.avatar_url,
        fellow_role: alumni_profiles.fellow_role,
      })
      .from(users)
      .leftJoin(alumni_profiles, eq(users.id, alumni_profiles.user_id))
      .where(and(inArray(users.role_id, roleIds), eq(users.is_active, true)));

    // Get fellows with active mentors
    const menteeIds = await db
      .select({ mentee_id: alumni_mentorships.mentee_id })
      .from(alumni_mentorships)
      .where(eq(alumni_mentorships.status, "active"));

    const menteeIdSet = new Set(menteeIds.map((m) => m.mentee_id));

    // Format fellows with availability status
    let formattedFellows = fellowsList.map((fellow) => ({
      id: fellow.id,
      name: fellow.name,
      avatar: fellow.avatar_url,
      fellowRole: fellow.fellow_role || "Fellow",
      isAvailable: !menteeIdSet.has(fellow.id),
    }));

    // Apply search filter
    if (search && typeof search === "string") {
      const searchLower = search.toLowerCase();
      formattedFellows = formattedFellows.filter(
        (f) =>
          f.name.toLowerCase().includes(searchLower) ||
          f.fellowRole.toLowerCase().includes(searchLower),
      );
    }

    // Apply available only filter
    if (available === "true") {
      formattedFellows = formattedFellows.filter((f) => f.isAvailable);
    }

    // Pagination
    const totalCount = formattedFellows.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedFellows = formattedFellows.slice(offset, offset + limitNum);

    res.status(200).json({
      fellows: paginatedFellows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error) {
    logger.error("Error fetching fellows", error);
    res.status(500).json({
      error: "Failed to fetch fellows",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add a fellow as mentee (create mentorship relationship)
 */
export const addMentee = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const { fellowId } = req.body;

    if (!fellowId) {
      res.status(400).json({ error: "Fellow ID is required" });
      return;
    }

    const menteeId = parseInt(fellowId, 10);

    // Check if fellow exists and has fellow role
    const fellowRole = await db.select().from(roles).where(eq(roles.name, "fellow")).limit(1);

    if (!fellowRole || fellowRole.length === 0) {
      res.status(400).json({ error: "Fellow role not found" });
      return;
    }

    const fellow = await db
      .select()
      .from(users)
      .where(
        and(eq(users.id, menteeId), eq(users.role_id, fellowRole[0].id), eq(users.is_active, true)),
      )
      .limit(1);

    if (!fellow || fellow.length === 0) {
      res.status(404).json({ error: "Fellow not found" });
      return;
    }

    // Check if fellow already has an active mentor
    const existingMentorship = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.mentee_id, menteeId), eq(alumni_mentorships.status, "active")),
      )
      .limit(1);

    if (existingMentorship.length > 0) {
      res.status(400).json({ error: "This fellow already has an active mentor" });
      return;
    }

    // Create mentorship relationship
    const newMentorship = await db
      .insert(alumni_mentorships)
      .values({
        mentor_id: mentorId,
        mentee_id: menteeId,
        status: "active",
        started_at: new Date(),
      })
      .returning();

    res.status(201).json({
      message: "Mentee added successfully",
      mentorship: {
        id: newMentorship[0].id,
        mentorId: newMentorship[0].mentor_id,
        menteeId: newMentorship[0].mentee_id,
        status: newMentorship[0].status,
        startedAt: newMentorship[0].started_at,
      },
    });
  } catch (error) {
    logger.error("Error adding mentee", error);
    res.status(500).json({
      error: "Failed to add mentee",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get current user's mentorship connections (as mentor)
 */
export const getMyConnections = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);

    // Get all mentorship relationships for this mentor
    const mentorships = await db
      .select({
        id: alumni_mentorships.id,
        mentee_id: alumni_mentorships.mentee_id,
        status: alumni_mentorships.status,
        total_sessions: alumni_mentorships.total_sessions,
        started_at: alumni_mentorships.started_at,
        ended_at: alumni_mentorships.ended_at,
      })
      .from(alumni_mentorships)
      .where(eq(alumni_mentorships.mentor_id, mentorId));

    if (mentorships.length === 0) {
      res.status(200).json({ mentorships: [] });
      return;
    }

    // Get mentee details
    const menteeIds = mentorships.map((m) => m.mentee_id);

    const mentees = await db
      .select({
        id: users.id,
        name: users.name,
        avatar_url: users.avatar_url,
        fellow_role: alumni_profiles.fellow_role,
      })
      .from(users)
      .leftJoin(alumni_profiles, eq(users.id, alumni_profiles.user_id))
      .where(inArray(users.id, menteeIds));

    const menteeMap = new Map(mentees.map((m) => [m.id, m]));

    // Get goals for each mentorship
    const mentorshipIds = mentorships.map((m) => m.id);
    const goals = await db
      .select()
      .from(mentorship_goals)
      .where(inArray(mentorship_goals.mentorship_id, mentorshipIds));

    const goalsByMentorship = new Map<number, typeof goals>();
    goals.forEach((g) => {
      const existing = goalsByMentorship.get(g.mentorship_id) || [];
      existing.push(g);
      goalsByMentorship.set(g.mentorship_id, existing);
    });

    // Get sessions for each mentorship
    const sessions = await db
      .select()
      .from(mentorship_sessions)
      .where(inArray(mentorship_sessions.mentorship_id, mentorshipIds));

    const sessionsByMentorship = new Map<number, typeof sessions>();
    sessions.forEach((s) => {
      const existing = sessionsByMentorship.get(s.mentorship_id) || [];
      existing.push(s);
      sessionsByMentorship.set(s.mentorship_id, existing);
    });

    const formattedMentorships = mentorships.map((m) => {
      const mentee = menteeMap.get(m.mentee_id);
      const mentorshipGoals = goalsByMentorship.get(m.id) || [];
      const mentorshipSessions = sessionsByMentorship.get(m.id) || [];

      const completedGoals = mentorshipGoals.filter((g) => g.completed_at !== null).length;
      const totalGoals = mentorshipGoals.length;
      const progress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

      const completedSessions = mentorshipSessions.filter((s) => s.status === "completed").length;
      const scheduledSessions = mentorshipSessions.filter((s) => s.status === "scheduled");
      const nextSession =
        scheduledSessions.length > 0
          ? scheduledSessions.sort(
              (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
            )[0]
          : null;

      return {
        id: m.id,
        mentee: {
          id: m.mentee_id,
          name: mentee?.name || "Unknown",
          avatar: mentee?.avatar_url || null,
          fellowRole: mentee?.fellow_role || "Fellow",
        },
        startDate: m.started_at?.toISOString() || null,
        status: m.status,
        goals: mentorshipGoals.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          isCompleted: g.completed_at !== null,
          completedAt: g.completed_at?.toISOString() || null,
        })),
        progress,
        sessionsCompleted: completedSessions,
        totalSessions: m.total_sessions || 0,
        nextSession: nextSession
          ? {
              id: nextSession.id,
              title: nextSession.title,
              scheduledAt: nextSession.scheduled_at.toISOString(),
              durationMinutes: nextSession.duration_minutes,
            }
          : null,
      };
    });

    res.status(200).json({ mentorships: formattedMentorships });
  } catch (error) {
    logger.error("Error fetching connections", error);
    res.status(500).json({
      error: "Failed to fetch connections",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get single mentorship connection details
 */
export const getConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);

    if (isNaN(connectionId)) {
      res.status(400).json({ error: "Invalid connection ID" });
      return;
    }

    // Get mentorship with mentor check
    const mentorship = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (mentorship.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    const m = mentorship[0];

    // Get mentee details
    const mentee = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar_url: users.avatar_url,
        fellow_role: alumni_profiles.fellow_role,
        phone: alumni_profiles.phone,
      })
      .from(users)
      .leftJoin(alumni_profiles, eq(users.id, alumni_profiles.user_id))
      .where(eq(users.id, m.mentee_id))
      .limit(1);

    // Get goals
    const goals = await db
      .select()
      .from(mentorship_goals)
      .where(eq(mentorship_goals.mentorship_id, connectionId));

    // Get sessions
    const sessions = await db
      .select()
      .from(mentorship_sessions)
      .where(eq(mentorship_sessions.mentorship_id, connectionId));

    const completedGoals = goals.filter((g) => g.completed_at !== null).length;
    const progress = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

    const completedSessions = sessions.filter((s) => s.status === "completed").length;

    res.status(200).json({
      connection: {
        id: m.id,
        mentee: {
          id: m.mentee_id,
          name: mentee[0]?.name || "Unknown",
          email: mentee[0]?.email || null,
          avatar: mentee[0]?.avatar_url || null,
          fellowRole: mentee[0]?.fellow_role || "Fellow",
          phone: mentee[0]?.phone || null,
        },
        status: m.status,
        totalSessions: m.total_sessions || 0,
        sessionsCompleted: completedSessions,
        progress,
        startDate: m.started_at?.toISOString() || null,
        endDate: m.ended_at?.toISOString() || null,
        goals: goals.map((g) => ({
          id: g.id,
          title: g.title,
          description: g.description,
          isCompleted: g.completed_at !== null,
          completedAt: g.completed_at?.toISOString() || null,
          createdAt: g.created_at?.toISOString() || null,
        })),
        sessions: sessions
          .map((s) => ({
            id: s.id,
            title: s.title,
            scheduledAt: s.scheduled_at.toISOString(),
            durationMinutes: s.duration_minutes,
            status: s.status,
            notes: s.notes,
            rating: s.rating,
            feedback: s.feedback,
          }))
          .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()),
      },
    });
  } catch (error) {
    logger.error("Error fetching connection", error);
    res.status(500).json({
      error: "Failed to fetch connection",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update mentorship settings (total sessions)
 */
export const updateConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);
    const { totalSessions, status } = req.body;

    if (isNaN(connectionId)) {
      res.status(400).json({ error: "Invalid connection ID" });
      return;
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    const updateData: Partial<{
      total_sessions: number;
      status: string;
      ended_at: Date | null;
    }> = {};

    if (totalSessions !== undefined) {
      updateData.total_sessions = parseInt(totalSessions, 10);
    }

    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") {
        updateData.ended_at = new Date();
      }
    }

    const updated = await db
      .update(alumni_mentorships)
      .set(updateData)
      .where(eq(alumni_mentorships.id, connectionId))
      .returning();

    res.status(200).json({
      message: "Mentorship updated successfully",
      mentorship: updated[0],
    });
  } catch (error) {
    logger.error("Error updating connection", error);
    res.status(500).json({
      error: "Failed to update connection",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add a goal to a mentorship
 */
export const addGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);
    const { title, description } = req.body;

    if (isNaN(connectionId)) {
      res.status(400).json({ error: "Invalid connection ID" });
      return;
    }

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    const newGoal = await db
      .insert(mentorship_goals)
      .values({
        mentorship_id: connectionId,
        title,
        description: description || null,
      })
      .returning();

    res.status(201).json({
      message: "Goal added successfully",
      goal: {
        id: newGoal[0].id,
        title: newGoal[0].title,
        description: newGoal[0].description,
        isCompleted: false,
        completedAt: null,
      },
    });
  } catch (error) {
    logger.error("Error adding goal", error);
    res.status(500).json({
      error: "Failed to add goal",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update a goal (mark complete/incomplete, edit)
 */
export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);
    const goalId = parseInt(req.params.goalId, 10);
    const { title, description, isCompleted } = req.body;

    if (isNaN(connectionId) || isNaN(goalId)) {
      res.status(400).json({ error: "Invalid IDs" });
      return;
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    // Verify goal belongs to this mentorship
    const goalExists = await db
      .select()
      .from(mentorship_goals)
      .where(and(eq(mentorship_goals.id, goalId), eq(mentorship_goals.mentorship_id, connectionId)))
      .limit(1);

    if (goalExists.length === 0) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const updateData: Partial<{
      title: string;
      description: string | null;
      completed_at: Date | null;
    }> = {};

    if (title !== undefined) {
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description;
    }

    if (isCompleted !== undefined) {
      updateData.completed_at = isCompleted ? new Date() : null;
    }

    const updated = await db
      .update(mentorship_goals)
      .set(updateData)
      .where(eq(mentorship_goals.id, goalId))
      .returning();

    res.status(200).json({
      message: "Goal updated successfully",
      goal: {
        id: updated[0].id,
        title: updated[0].title,
        description: updated[0].description,
        isCompleted: updated[0].completed_at !== null,
        completedAt: updated[0].completed_at?.toISOString() || null,
      },
    });
  } catch (error) {
    logger.error("Error updating goal", error);
    res.status(500).json({
      error: "Failed to update goal",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a goal
 */
export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);
    const goalId = parseInt(req.params.goalId, 10);

    if (isNaN(connectionId) || isNaN(goalId)) {
      res.status(400).json({ error: "Invalid IDs" });
      return;
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    await db
      .delete(mentorship_goals)
      .where(
        and(eq(mentorship_goals.id, goalId), eq(mentorship_goals.mentorship_id, connectionId)),
      );

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    logger.error("Error deleting goal", error);
    res.status(500).json({
      error: "Failed to delete goal",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Schedule a session
 */
export const scheduleSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);
    const { title, scheduledAt, durationMinutes, notes } = req.body;

    if (isNaN(connectionId)) {
      res.status(400).json({ error: "Invalid connection ID" });
      return;
    }

    if (!scheduledAt) {
      res.status(400).json({ error: "Scheduled time is required" });
      return;
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    const newSession = await db
      .insert(mentorship_sessions)
      .values({
        mentorship_id: connectionId,
        title: title || null,
        scheduled_at: new Date(scheduledAt),
        duration_minutes: durationMinutes || 60,
        notes: notes || null,
        status: "scheduled",
      })
      .returning();

    res.status(201).json({
      message: "Session scheduled successfully",
      session: {
        id: newSession[0].id,
        title: newSession[0].title,
        scheduledAt: newSession[0].scheduled_at.toISOString(),
        durationMinutes: newSession[0].duration_minutes,
        status: newSession[0].status,
        notes: newSession[0].notes,
      },
    });
  } catch (error) {
    logger.error("Error scheduling session", error);
    res.status(500).json({
      error: "Failed to schedule session",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update a session (status, notes, rating)
 */
export const updateSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);
    const sessionId = parseInt(req.params.sessionId, 10);
    const { title, scheduledAt, durationMinutes, status, notes, rating, feedback } = req.body;

    if (isNaN(connectionId) || isNaN(sessionId)) {
      res.status(400).json({ error: "Invalid IDs" });
      return;
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    // Verify session belongs to this mentorship
    const sessionExists = await db
      .select()
      .from(mentorship_sessions)
      .where(
        and(
          eq(mentorship_sessions.id, sessionId),
          eq(mentorship_sessions.mentorship_id, connectionId),
        ),
      )
      .limit(1);

    if (sessionExists.length === 0) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const updateData: Partial<{
      title: string | null;
      scheduled_at: Date;
      duration_minutes: number;
      status: string;
      notes: string | null;
      rating: number | null;
      feedback: string | null;
    }> = {};

    if (title !== undefined) updateData.title = title;
    if (scheduledAt !== undefined) updateData.scheduled_at = new Date(scheduledAt);
    if (durationMinutes !== undefined) updateData.duration_minutes = durationMinutes;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (rating !== undefined) updateData.rating = rating;
    if (feedback !== undefined) updateData.feedback = feedback;

    const updated = await db
      .update(mentorship_sessions)
      .set(updateData)
      .where(eq(mentorship_sessions.id, sessionId))
      .returning();

    res.status(200).json({
      message: "Session updated successfully",
      session: {
        id: updated[0].id,
        title: updated[0].title,
        scheduledAt: updated[0].scheduled_at.toISOString(),
        durationMinutes: updated[0].duration_minutes,
        status: updated[0].status,
        notes: updated[0].notes,
        rating: updated[0].rating,
        feedback: updated[0].feedback,
      },
    });
  } catch (error) {
    logger.error("Error updating session", error);
    res.status(500).json({
      error: "Failed to update session",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a session
 */
export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mentorId = parseInt(req.user.id, 10);
    const connectionId = parseInt(req.params.id, 10);
    const sessionId = parseInt(req.params.sessionId, 10);

    if (isNaN(connectionId) || isNaN(sessionId)) {
      res.status(400).json({ error: "Invalid IDs" });
      return;
    }

    // Verify ownership
    const existing = await db
      .select()
      .from(alumni_mentorships)
      .where(
        and(eq(alumni_mentorships.id, connectionId), eq(alumni_mentorships.mentor_id, mentorId)),
      )
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Mentorship not found" });
      return;
    }

    await db
      .delete(mentorship_sessions)
      .where(
        and(
          eq(mentorship_sessions.id, sessionId),
          eq(mentorship_sessions.mentorship_id, connectionId),
        ),
      );

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    logger.error("Error deleting session", error);
    res.status(500).json({
      error: "Failed to delete session",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
