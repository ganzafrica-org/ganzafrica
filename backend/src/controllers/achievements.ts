import { Request, Response } from "express";
import { db } from "../db/client";
import {
  alumni_achievements,
  achievement_likes,
  achievement_comments,
} from "../db/schema";
import { users } from "../db/schema";
import {
  eq,
  and,
  or,
  ilike,
  sql,
  desc,
  asc,
  count,
  countDistinct,
} from "drizzle-orm";
import { Logger } from "../config";

const logger = new Logger("AchievementsController");

// Default categories
const ACHIEVEMENT_CATEGORIES = [
  "Recognition",
  "Professional",
  "Business Milestone",
  "Academic",
  "Competition",
  "Community",
];

/**
 * Get achievements statistics
 */
export const getAchievementStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = parseInt(req.user.id, 10);

    // Total achievements
    const totalResult = await db
      .select({ count: count() })
      .from(alumni_achievements);

    // My achievements
    const myResult = await db
      .select({ count: count() })
      .from(alumni_achievements)
      .where(eq(alumni_achievements.user_id, userId));

    // Categories with achievements
    const categoriesResult = await db
      .select({ category: alumni_achievements.category })
      .from(alumni_achievements)
      .groupBy(alumni_achievements.category);

    res.status(200).json({
      stats: {
        totalAchievements: totalResult[0]?.count || 0,
        myAchievements: myResult[0]?.count || 0,
        categoriesCount: categoriesResult.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching achievement stats", error);
    res.status(500).json({
      error: "Failed to fetch achievement statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all achievements with pagination and filters
 */
export const getAllAchievements = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit, search, category, type, year, sort } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(limit as string, 10) || 15),
    );
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [];

    // Search
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(alumni_achievements.title, `%${search}%`),
          ilike(alumni_achievements.description, `%${search}%`),
          ilike(alumni_achievements.organization, `%${search}%`),
        ),
      );
    }

    // Category filter
    if (category && category !== "all") {
      conditions.push(eq(alumni_achievements.category, category as string));
    }

    // Type filter
    if (type && type !== "all") {
      conditions.push(eq(alumni_achievements.type, type as string));
    }

    // Year filter
    if (year && year !== "all") {
      conditions.push(
        sql`EXTRACT(YEAR FROM ${alumni_achievements.date}) = ${parseInt(year as string, 10)}`,
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(alumni_achievements)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Build base query
    let query = db
      .select({
        id: alumni_achievements.id,
        title: alumni_achievements.title,
        description: alumni_achievements.description,
        category: alumni_achievements.category,
        type: alumni_achievements.type,
        date: alumni_achievements.date,
        organization: alumni_achievements.organization,
        location: alumni_achievements.location,
        link: alumni_achievements.link,
        imageUrl: alumni_achievements.image_url,
        tags: alumni_achievements.tags,
        views: alumni_achievements.views,
        createdAt: alumni_achievements.created_at,
        userId: alumni_achievements.user_id,
        userName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        userAvatar: users.avatar,
      })
      .from(alumni_achievements)
      .leftJoin(users, eq(alumni_achievements.user_id, users.id));

    // Apply where clause if exists
    if (whereClause) {
      query = query.where(whereClause) as any;
    }

    // Apply sort order
    switch (sort) {
      case "oldest":
        query = query.orderBy(asc(alumni_achievements.date)) as any;
        break;
      case "most-liked":
        query = query.orderBy(desc(alumni_achievements.created_at)) as any;
        break;
      case "most-viewed":
        query = query.orderBy(desc(alumni_achievements.views)) as any;
        break;
      default:
        query = query.orderBy(desc(alumni_achievements.created_at)) as any;
    }

    // Apply pagination
    const achievements = await query.limit(limitNum).offset(offset);

    // Get likes and comments counts for each achievement
    const achievementIds = achievements.map((a) => a.id);

    let likesMap: Record<number, number> = {};
    let commentsMap: Record<number, number> = {};

    if (achievementIds.length > 0) {
      // Use IN instead of ANY for better compatibility
      const likesResult = await db
        .select({
          achievementId: achievement_likes.achievement_id,
          count: count(),
        })
        .from(achievement_likes)
        .where(
          sql`${achievement_likes.achievement_id} IN (${sql.join(
            achievementIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        )
        .groupBy(achievement_likes.achievement_id);

      likesResult.forEach((r) => {
        likesMap[r.achievementId] = r.count;
      });

      const commentsResult = await db
        .select({
          achievementId: achievement_comments.achievement_id,
          count: count(),
        })
        .from(achievement_comments)
        .where(
          sql`${achievement_comments.achievement_id} IN (${sql.join(
            achievementIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        )
        .groupBy(achievement_comments.achievement_id);

      commentsResult.forEach((r) => {
        commentsMap[r.achievementId] = r.count;
      });
    }

    // Get unique values for filters
    const allAchievements = await db
      .select({
        category: alumni_achievements.category,
        type: alumni_achievements.type,
        date: alumni_achievements.date,
      })
      .from(alumni_achievements);

    const categories = [
      ...new Set(allAchievements.map((a) => a.category).filter(Boolean)),
    ].sort();
    const types = [
      ...new Set(allAchievements.map((a) => a.type).filter(Boolean)),
    ].sort();
    const years = [
      ...new Set(
        allAchievements
          .map((a) => (a.date ? new Date(a.date).getFullYear() : null))
          .filter(Boolean),
      ),
    ].sort((a, b) => (b as number) - (a as number));

    res.status(200).json({
      achievements: achievements.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        type: a.type,
        date: a.date,
        organization: a.organization,
        location: a.location,
        link: a.link,
        imageUrl: a.imageUrl,
        tags: a.tags,
        views: a.views || 0,
        likes: likesMap[a.id] || 0,
        comments: commentsMap[a.id] || 0,
        createdAt: a.createdAt,
        achiever: {
          id: a.userId,
          name: a.userName,
          avatar: a.userAvatar,
        },
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      filters: {
        categories: [...new Set([...ACHIEVEMENT_CATEGORIES, ...categories])],
        types,
        years,
      },
    });
  } catch (error) {
    logger.error("Error fetching achievements", error);
    res.status(500).json({
      error: "Failed to fetch achievements",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get single achievement
 */
export const getAchievement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const achievementId = parseInt(req.params.id, 10);

    if (isNaN(achievementId)) {
      res.status(400).json({ error: "Invalid achievement ID" });
      return;
    }

    const achievement = await db
      .select({
        id: alumni_achievements.id,
        title: alumni_achievements.title,
        description: alumni_achievements.description,
        category: alumni_achievements.category,
        type: alumni_achievements.type,
        date: alumni_achievements.date,
        organization: alumni_achievements.organization,
        location: alumni_achievements.location,
        link: alumni_achievements.link,
        imageUrl: alumni_achievements.image_url,
        tags: alumni_achievements.tags,
        views: alumni_achievements.views,
        createdAt: alumni_achievements.created_at,
        userId: alumni_achievements.user_id,
        userName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        userAvatar: users.avatar,
        userTitle: sql<string>`(SELECT title FROM alumni_profiles WHERE user_id = ${alumni_achievements.user_id})`,
        userCompany: sql<string>`(SELECT company FROM alumni_profiles WHERE user_id = ${alumni_achievements.user_id})`,
      })
      .from(alumni_achievements)
      .leftJoin(users, eq(alumni_achievements.user_id, users.id))
      .where(eq(alumni_achievements.id, achievementId))
      .limit(1);

    if (achievement.length === 0) {
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    // Increment view count
    await db
      .update(alumni_achievements)
      .set({ views: (achievement[0].views || 0) + 1 })
      .where(eq(alumni_achievements.id, achievementId));

    // Get likes count
    const likesResult = await db
      .select({ count: count() })
      .from(achievement_likes)
      .where(eq(achievement_likes.achievement_id, achievementId));

    // Get comments with user info
    const comments = await db
      .select({
        id: achievement_comments.id,
        content: achievement_comments.content,
        createdAt: achievement_comments.created_at,
        userId: achievement_comments.user_id,
        userName: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        userAvatar: users.avatar,
      })
      .from(achievement_comments)
      .leftJoin(users, eq(achievement_comments.user_id, users.id))
      .where(eq(achievement_comments.achievement_id, achievementId))
      .orderBy(desc(achievement_comments.created_at));

    // Check if current user has liked
    let hasLiked = false;
    if (req.user) {
      const userLike = await db
        .select({ id: achievement_likes.id })
        .from(achievement_likes)
        .where(
          and(
            eq(achievement_likes.achievement_id, achievementId),
            eq(achievement_likes.user_id, parseInt(req.user.id, 10)),
          ),
        )
        .limit(1);
      hasLiked = userLike.length > 0;
    }

    const a = achievement[0];
    res.status(200).json({
      achievement: {
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        type: a.type,
        date: a.date,
        organization: a.organization,
        location: a.location,
        link: a.link,
        imageUrl: a.imageUrl,
        tags: a.tags,
        views: (a.views || 0) + 1,
        likes: likesResult[0]?.count || 0,
        hasLiked,
        createdAt: a.createdAt,
        achiever: {
          id: a.userId,
          name: a.userName,
          avatar: a.userAvatar,
          title: a.userTitle,
          company: a.userCompany,
        },
        comments: comments.map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          user: {
            id: c.userId,
            name: c.userName,
            avatar: c.userAvatar,
          },
        })),
      },
    });
  } catch (error) {
    logger.error("Error fetching achievement", error);
    res.status(500).json({
      error: "Failed to fetch achievement",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create/Share an achievement
 */
export const createAchievement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      title,
      description,
      category,
      type,
      date,
      organization,
      location,
      link,
      tags,
    } = req.body;

    if (!title || !category) {
      res.status(400).json({ error: "Title and category are required" });
      return;
    }

    if (!ACHIEVEMENT_CATEGORIES.includes(category)) {
      res.status(400).json({
        error: "Invalid category",
        validCategories: ACHIEVEMENT_CATEGORIES,
      });
      return;
    }

    const newAchievement = await db
      .insert(alumni_achievements)
      .values({
        user_id: parseInt(req.user.id, 10),
        title,
        description: description || null,
        category,
        type: type || null,
        date: date || null,
        organization: organization || null,
        location: location || null,
        link: link || null,
        tags: tags || [],
      })
      .returning();

    res.status(201).json({
      message: "Achievement shared successfully",
      achievement: newAchievement[0],
    });
  } catch (error) {
    logger.error("Error creating achievement", error);
    res.status(500).json({
      error: "Failed to create achievement",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update an achievement (only owner)
 */
export const updateAchievement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const achievementId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(achievementId)) {
      res.status(400).json({ error: "Invalid achievement ID" });
      return;
    }

    // Check ownership
    const existing = await db
      .select({ user_id: alumni_achievements.user_id })
      .from(alumni_achievements)
      .where(eq(alumni_achievements.id, achievementId))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    if (existing[0].user_id !== userId) {
      res
        .status(403)
        .json({ error: "You can only edit your own achievements" });
      return;
    }

    const {
      title,
      description,
      category,
      type,
      date,
      organization,
      location,
      link,
      tags,
    } = req.body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) {
      if (!ACHIEVEMENT_CATEGORIES.includes(category)) {
        res.status(400).json({
          error: "Invalid category",
          validCategories: ACHIEVEMENT_CATEGORIES,
        });
        return;
      }
      updateData.category = category;
    }
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = date;
    if (organization !== undefined) updateData.organization = organization;
    if (location !== undefined) updateData.location = location;
    if (link !== undefined) updateData.link = link;
    if (tags !== undefined) updateData.tags = tags;

    const updated = await db
      .update(alumni_achievements)
      .set(updateData)
      .where(eq(alumni_achievements.id, achievementId))
      .returning();

    res.status(200).json({
      message: "Achievement updated successfully",
      achievement: updated[0],
    });
  } catch (error) {
    logger.error("Error updating achievement", error);
    res.status(500).json({
      error: "Failed to update achievement",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete an achievement (only owner)
 */
export const deleteAchievement = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const achievementId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(achievementId)) {
      res.status(400).json({ error: "Invalid achievement ID" });
      return;
    }

    // Check ownership
    const existing = await db
      .select({ user_id: alumni_achievements.user_id })
      .from(alumni_achievements)
      .where(eq(alumni_achievements.id, achievementId))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    if (existing[0].user_id !== userId) {
      res
        .status(403)
        .json({ error: "You can only delete your own achievements" });
      return;
    }

    await db
      .delete(alumni_achievements)
      .where(eq(alumni_achievements.id, achievementId));

    res.status(200).json({ message: "Achievement deleted successfully" });
  } catch (error) {
    logger.error("Error deleting achievement", error);
    res.status(500).json({
      error: "Failed to delete achievement",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Like/Unlike an achievement
 */
export const toggleLike = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const achievementId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(achievementId)) {
      res.status(400).json({ error: "Invalid achievement ID" });
      return;
    }

    // Check if achievement exists
    const achievement = await db
      .select({ id: alumni_achievements.id })
      .from(alumni_achievements)
      .where(eq(alumni_achievements.id, achievementId))
      .limit(1);

    if (achievement.length === 0) {
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    // Check if already liked
    const existingLike = await db
      .select({ id: achievement_likes.id })
      .from(achievement_likes)
      .where(
        and(
          eq(achievement_likes.achievement_id, achievementId),
          eq(achievement_likes.user_id, userId),
        ),
      )
      .limit(1);

    let liked: boolean;
    if (existingLike.length > 0) {
      // Unlike
      await db
        .delete(achievement_likes)
        .where(eq(achievement_likes.id, existingLike[0].id));
      liked = false;
    } else {
      // Like
      await db.insert(achievement_likes).values({
        achievement_id: achievementId,
        user_id: userId,
      });
      liked = true;
    }

    // Get updated likes count
    const likesResult = await db
      .select({ count: count() })
      .from(achievement_likes)
      .where(eq(achievement_likes.achievement_id, achievementId));

    res.status(200).json({
      liked,
      likes: likesResult[0]?.count || 0,
    });
  } catch (error) {
    logger.error("Error toggling like", error);
    res.status(500).json({
      error: "Failed to toggle like",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Add a comment to an achievement
 */
export const addComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const achievementId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);
    const { content } = req.body;

    if (isNaN(achievementId)) {
      res.status(400).json({ error: "Invalid achievement ID" });
      return;
    }

    if (!content || content.trim() === "") {
      res.status(400).json({ error: "Comment content is required" });
      return;
    }

    // Check if achievement exists
    const achievement = await db
      .select({ id: alumni_achievements.id })
      .from(alumni_achievements)
      .where(eq(alumni_achievements.id, achievementId))
      .limit(1);

    if (achievement.length === 0) {
      res.status(404).json({ error: "Achievement not found" });
      return;
    }

    const newComment = await db
      .insert(achievement_comments)
      .values({
        achievement_id: achievementId,
        user_id: userId,
        content: content.trim(),
      })
      .returning();

    // Get user info
    const userInfo = await db
      .select({
        name: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.status(201).json({
      message: "Comment added successfully",
      comment: {
        id: newComment[0].id,
        content: newComment[0].content,
        createdAt: newComment[0].created_at,
        user: {
          id: userId,
          name: userInfo[0]?.name || "Unknown",
          avatar: userInfo[0]?.avatar || null,
        },
      },
    });
  } catch (error) {
    logger.error("Error adding comment", error);
    res.status(500).json({
      error: "Failed to add comment",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a comment (only owner)
 */
export const deleteComment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const commentId = parseInt(req.params.commentId, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(commentId)) {
      res.status(400).json({ error: "Invalid comment ID" });
      return;
    }

    // Check ownership
    const existing = await db
      .select({ user_id: achievement_comments.user_id })
      .from(achievement_comments)
      .where(eq(achievement_comments.id, commentId))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }

    if (existing[0].user_id !== userId) {
      res.status(403).json({ error: "You can only delete your own comments" });
      return;
    }

    await db
      .delete(achievement_comments)
      .where(eq(achievement_comments.id, commentId));

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    logger.error("Error deleting comment", error);
    res.status(500).json({
      error: "Failed to delete comment",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
