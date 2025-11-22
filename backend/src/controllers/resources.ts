import { Request, Response } from "express";
import { db } from "../db/client";
import {
  alumni_resources,
  resource_likes,
  resource_ratings,
  resource_downloads,
  alumni_profiles,
} from "../db/schema";
import { users } from "../db/schema";
import { eq, and, or, ilike, sql, desc, asc, count } from "drizzle-orm";
import { Logger } from "../config";

const logger = new Logger("ResourcesController");

// Default resource categories
const RESOURCE_CATEGORIES = [
  "Career Development",
  "Entrepreneurship",
  "Product Management",
  "Data Science",
  "Design",
  "Finance",
  "Land Management",
  "Agriculture",
  "Environmental Conservation",
  "Water Resources",
  "Sustainable Development",
  "Climate Action",
];

// Default resource types
const RESOURCE_TYPES = [
  "Guide",
  "Template",
  "Video Course",
  "Toolkit",
  "Report",
  "Cheat Sheet",
  "Case Study",
  "Webinar Recording",
  "Presentation",
  "Workshop Materials",
];

/**
 * Get resources statistics
 */
export const getResourceStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Total resources
    const totalResult = await db
      .select({ count: count() })
      .from(alumni_resources);

    // Featured resources
    const featuredResult = await db
      .select({ count: count() })
      .from(alumni_resources)
      .where(eq(alumni_resources.is_featured, true));

    // Total downloads
    const downloadsResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${alumni_resources.downloads}), 0)`,
      })
      .from(alumni_resources);

    // Categories with resources
    const categoriesResult = await db
      .select({ category: alumni_resources.category })
      .from(alumni_resources)
      .groupBy(alumni_resources.category);

    res.status(200).json({
      stats: {
        totalResources: totalResult[0]?.count || 0,
        featuredResources: featuredResult[0]?.count || 0,
        totalDownloads: Number(downloadsResult[0]?.total) || 0,
        categoriesCount: categoriesResult.length,
      },
    });
  } catch (error) {
    logger.error("Error fetching resource stats", error);
    res.status(500).json({
      error: "Failed to fetch resource statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all resources with pagination and filters
 */
export const getAllResources = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit, search, category, type, sort } = req.query;

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
          ilike(alumni_resources.title, `%${search}%`),
          ilike(alumni_resources.description, `%${search}%`),
        ),
      );
    }

    // Category filter
    if (category && category !== "all") {
      conditions.push(eq(alumni_resources.category, category as string));
    }

    // Type filter
    if (type && type !== "all") {
      conditions.push(eq(alumni_resources.type, type as string));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(alumni_resources)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Build base query
    let query = db
      .select({
        id: alumni_resources.id,
        title: alumni_resources.title,
        description: alumni_resources.description,
        type: alumni_resources.type,
        category: alumni_resources.category,
        fileUrl: alumni_resources.file_url,
        fileType: alumni_resources.file_type,
        fileSize: alumni_resources.file_size,
        thumbnailUrl: alumni_resources.thumbnail_url,
        authorId: alumni_resources.author_id,
        authorName: alumni_resources.author_name,
        authorTitle: alumni_resources.author_title,
        tags: alumni_resources.tags,
        estimatedTime: alumni_resources.estimated_time,
        pages: alumni_resources.pages,
        duration: alumni_resources.duration,
        views: alumni_resources.views,
        downloads: alumni_resources.downloads,
        ratingSum: alumni_resources.rating_sum,
        ratingCount: alumni_resources.rating_count,
        isFeatured: alumni_resources.is_featured,
        externalUrl: alumni_resources.external_url,
        createdAt: alumni_resources.created_at,
      })
      .from(alumni_resources);

    // Apply where clause if exists
    if (whereClause) {
      query = query.where(whereClause) as any;
    }

    // Apply sort order
    switch (sort) {
      case "oldest":
        query = query.orderBy(asc(alumni_resources.created_at)) as any;
        break;
      case "downloads":
        query = query.orderBy(desc(alumni_resources.downloads)) as any;
        break;
      case "rating":
        query = query.orderBy(
          desc(
            sql`CASE WHEN ${alumni_resources.rating_count} > 0 THEN ${alumni_resources.rating_sum}::float / ${alumni_resources.rating_count} ELSE 0 END`,
          ),
        ) as any;
        break;
      case "views":
        query = query.orderBy(desc(alumni_resources.views)) as any;
        break;
      default:
        query = query.orderBy(desc(alumni_resources.created_at)) as any;
    }

    // Apply pagination
    const resources = await query.limit(limitNum).offset(offset);

    // Get likes count for each resource
    const resourceIds = resources.map((r) => r.id);
    let likesMap: Record<number, number> = {};

    if (resourceIds.length > 0) {
      const likesResult = await db
        .select({
          resourceId: resource_likes.resource_id,
          count: count(),
        })
        .from(resource_likes)
        .where(
          sql`${resource_likes.resource_id} IN (${sql.join(
            resourceIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        )
        .groupBy(resource_likes.resource_id);

      likesResult.forEach((r) => {
        likesMap[r.resourceId] = r.count;
      });
    }

    // Get unique values for filters
    const allResources = await db
      .select({
        category: alumni_resources.category,
        type: alumni_resources.type,
      })
      .from(alumni_resources);

    const categories = [
      ...new Set(allResources.map((r) => r.category).filter(Boolean)),
    ].sort();
    const types = [
      ...new Set(allResources.map((r) => r.type).filter(Boolean)),
    ].sort();

    res.status(200).json({
      resources: resources.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        category: r.category,
        fileUrl: r.fileUrl,
        fileType: r.fileType,
        fileSize: r.fileSize,
        thumbnailUrl: r.thumbnailUrl,
        author: {
          id: r.authorId,
          name: r.authorName,
          title: r.authorTitle,
        },
        tags: r.tags,
        estimatedTime: r.estimatedTime,
        pages: r.pages,
        duration: r.duration,
        views: r.views || 0,
        downloads: r.downloads || 0,
        likes: likesMap[r.id] || 0,
        rating:
          r.ratingCount && r.ratingCount > 0
            ? (r.ratingSum! / r.ratingCount).toFixed(1)
            : "0.0",
        ratingCount: r.ratingCount || 0,
        isFeatured: r.isFeatured,
        externalUrl: r.externalUrl,
        createdAt: r.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      filters: {
        categories: [...new Set([...RESOURCE_CATEGORIES, ...categories])],
        types: [...new Set([...RESOURCE_TYPES, ...types])],
      },
    });
  } catch (error) {
    logger.error("Error fetching resources", error);
    res.status(500).json({
      error: "Failed to fetch resources",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get single resource
 */
export const getResource = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const resourceId = parseInt(req.params.id, 10);

    if (isNaN(resourceId)) {
      res.status(400).json({ error: "Invalid resource ID" });
      return;
    }

    const resource = await db
      .select({
        id: alumni_resources.id,
        title: alumni_resources.title,
        description: alumni_resources.description,
        type: alumni_resources.type,
        category: alumni_resources.category,
        fileUrl: alumni_resources.file_url,
        fileType: alumni_resources.file_type,
        fileSize: alumni_resources.file_size,
        thumbnailUrl: alumni_resources.thumbnail_url,
        authorId: alumni_resources.author_id,
        authorName: alumni_resources.author_name,
        authorTitle: alumni_resources.author_title,
        tags: alumni_resources.tags,
        estimatedTime: alumni_resources.estimated_time,
        pages: alumni_resources.pages,
        duration: alumni_resources.duration,
        views: alumni_resources.views,
        downloads: alumni_resources.downloads,
        ratingSum: alumni_resources.rating_sum,
        ratingCount: alumni_resources.rating_count,
        isFeatured: alumni_resources.is_featured,
        externalUrl: alumni_resources.external_url,
        createdAt: alumni_resources.created_at,
      })
      .from(alumni_resources)
      .where(eq(alumni_resources.id, resourceId))
      .limit(1);

    if (resource.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    // Increment view count
    await db
      .update(alumni_resources)
      .set({ views: (resource[0].views || 0) + 1 })
      .where(eq(alumni_resources.id, resourceId));

    // Get likes count
    const likesResult = await db
      .select({ count: count() })
      .from(resource_likes)
      .where(eq(resource_likes.resource_id, resourceId));

    // Check if current user has liked
    let hasLiked = false;
    if (req.user) {
      const userLike = await db
        .select({ id: resource_likes.id })
        .from(resource_likes)
        .where(
          and(
            eq(resource_likes.resource_id, resourceId),
            eq(resource_likes.user_id, parseInt(req.user.id, 10)),
          ),
        )
        .limit(1);
      hasLiked = userLike.length > 0;
    }

    // Check if user has rated
    let userRating = null;
    if (req.user) {
      const ratingRecord = await db
        .select({ rating: resource_ratings.rating })
        .from(resource_ratings)
        .where(
          and(
            eq(resource_ratings.resource_id, resourceId),
            eq(resource_ratings.user_id, parseInt(req.user.id, 10)),
          ),
        )
        .limit(1);
      userRating = ratingRecord.length > 0 ? ratingRecord[0].rating : null;
    }

    const r = resource[0];
    res.status(200).json({
      resource: {
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        category: r.category,
        fileUrl: r.fileUrl,
        fileType: r.fileType,
        fileSize: r.fileSize,
        thumbnailUrl: r.thumbnailUrl,
        author: {
          id: r.authorId,
          name: r.authorName,
          title: r.authorTitle,
        },
        tags: r.tags,
        estimatedTime: r.estimatedTime,
        pages: r.pages,
        duration: r.duration,
        views: (r.views || 0) + 1,
        downloads: r.downloads || 0,
        likes: likesResult[0]?.count || 0,
        hasLiked,
        rating:
          r.ratingCount && r.ratingCount > 0
            ? (r.ratingSum! / r.ratingCount).toFixed(1)
            : "0.0",
        ratingCount: r.ratingCount || 0,
        userRating,
        isFeatured: r.isFeatured,
        externalUrl: r.externalUrl,
        createdAt: r.createdAt,
      },
    });
  } catch (error) {
    logger.error("Error fetching resource", error);
    res.status(500).json({
      error: "Failed to fetch resource",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create/Contribute a resource
 */
export const createResource = async (
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
      type,
      category,
      fileUrl,
      fileType,
      fileSize,
      thumbnailUrl,
      tags,
      estimatedTime,
      pages,
      duration,
      externalUrl,
    } = req.body;

    if (!title || !description || !type || !category || !fileUrl) {
      res.status(400).json({
        error: "Title, description, type, category, and fileUrl are required",
      });
      return;
    }

    if (!RESOURCE_CATEGORIES.includes(category)) {
      res.status(400).json({
        error: "Invalid category",
        validCategories: RESOURCE_CATEGORIES,
      });
      return;
    }

    if (!RESOURCE_TYPES.includes(type)) {
      res.status(400).json({
        error: "Invalid type",
        validTypes: RESOURCE_TYPES,
      });
      return;
    }

    const userId = parseInt(req.user.id, 10);

    // Get user info for caching
    const userQuery = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userName = userQuery[0]?.name || "Unknown";

    // Get alumni profile title if exists
    const profileQuery = await db
      .select()
      .from(alumni_profiles)
      .where(eq(alumni_profiles.user_id, userId))
      .limit(1);

    const userTitle = profileQuery[0]?.title || null;

    const newResource = await db
      .insert(alumni_resources)
      .values({
        title,
        description,
        type,
        category,
        file_url: fileUrl,
        file_type: fileType || null,
        file_size: fileSize || null,
        thumbnail_url: thumbnailUrl || null,
        author_id: userId,
        author_name: userName,
        author_title: userTitle,
        tags: tags || [],
        estimated_time: estimatedTime || null,
        pages: pages || null,
        duration: duration || null,
        external_url: externalUrl || null,
      })
      .returning();

    res.status(201).json({
      message: "Resource contributed successfully",
      resource: newResource[0],
    });
  } catch (error) {
    logger.error("Error creating resource", error);
    res.status(500).json({
      error: "Failed to create resource",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update a resource (owner or admin)
 */
export const updateResource = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const resourceId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(resourceId)) {
      res.status(400).json({ error: "Invalid resource ID" });
      return;
    }

    // Check ownership
    const existing = await db
      .select({ author_id: alumni_resources.author_id })
      .from(alumni_resources)
      .where(eq(alumni_resources.id, resourceId))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    // Only owner can edit (admins would need role check)
    if (existing[0].author_id !== userId) {
      res.status(403).json({ error: "You can only edit your own resources" });
      return;
    }

    const {
      title,
      description,
      type,
      category,
      fileUrl,
      fileType,
      fileSize,
      thumbnailUrl,
      tags,
      estimatedTime,
      pages,
      duration,
      externalUrl,
    } = req.body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) {
      if (!RESOURCE_TYPES.includes(type)) {
        res.status(400).json({
          error: "Invalid type",
          validTypes: RESOURCE_TYPES,
        });
        return;
      }
      updateData.type = type;
    }
    if (category !== undefined) {
      if (!RESOURCE_CATEGORIES.includes(category)) {
        res.status(400).json({
          error: "Invalid category",
          validCategories: RESOURCE_CATEGORIES,
        });
        return;
      }
      updateData.category = category;
    }
    if (fileUrl !== undefined) updateData.file_url = fileUrl;
    if (fileType !== undefined) updateData.file_type = fileType;
    if (fileSize !== undefined) updateData.file_size = fileSize;
    if (thumbnailUrl !== undefined) updateData.thumbnail_url = thumbnailUrl;
    if (tags !== undefined) updateData.tags = tags;
    if (estimatedTime !== undefined) updateData.estimated_time = estimatedTime;
    if (pages !== undefined) updateData.pages = pages;
    if (duration !== undefined) updateData.duration = duration;
    if (externalUrl !== undefined) updateData.external_url = externalUrl;

    const updated = await db
      .update(alumni_resources)
      .set(updateData)
      .where(eq(alumni_resources.id, resourceId))
      .returning();

    res.status(200).json({
      message: "Resource updated successfully",
      resource: updated[0],
    });
  } catch (error) {
    logger.error("Error updating resource", error);
    res.status(500).json({
      error: "Failed to update resource",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a resource (owner or admin)
 */
export const deleteResource = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const resourceId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(resourceId)) {
      res.status(400).json({ error: "Invalid resource ID" });
      return;
    }

    // Check ownership
    const existing = await db
      .select({ author_id: alumni_resources.author_id })
      .from(alumni_resources)
      .where(eq(alumni_resources.id, resourceId))
      .limit(1);

    if (existing.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    if (existing[0].author_id !== userId) {
      res.status(403).json({ error: "You can only delete your own resources" });
      return;
    }

    await db
      .delete(alumni_resources)
      .where(eq(alumni_resources.id, resourceId));

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    logger.error("Error deleting resource", error);
    res.status(500).json({
      error: "Failed to delete resource",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Like/Unlike a resource
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

    const resourceId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(resourceId)) {
      res.status(400).json({ error: "Invalid resource ID" });
      return;
    }

    // Check if resource exists
    const resource = await db
      .select({ id: alumni_resources.id })
      .from(alumni_resources)
      .where(eq(alumni_resources.id, resourceId))
      .limit(1);

    if (resource.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    // Check if already liked
    const existingLike = await db
      .select({ id: resource_likes.id })
      .from(resource_likes)
      .where(
        and(
          eq(resource_likes.resource_id, resourceId),
          eq(resource_likes.user_id, userId),
        ),
      )
      .limit(1);

    let liked: boolean;
    if (existingLike.length > 0) {
      // Unlike
      await db
        .delete(resource_likes)
        .where(eq(resource_likes.id, existingLike[0].id));
      liked = false;
    } else {
      // Like
      await db.insert(resource_likes).values({
        resource_id: resourceId,
        user_id: userId,
      });
      liked = true;
    }

    // Get updated likes count
    const likesResult = await db
      .select({ count: count() })
      .from(resource_likes)
      .where(eq(resource_likes.resource_id, resourceId));

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
 * Track resource download
 */
export const trackDownload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const resourceId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(resourceId)) {
      res.status(400).json({ error: "Invalid resource ID" });
      return;
    }

    // Check if resource exists
    const resource = await db
      .select({
        id: alumni_resources.id,
        downloads: alumni_resources.downloads,
      })
      .from(alumni_resources)
      .where(eq(alumni_resources.id, resourceId))
      .limit(1);

    if (resource.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    // Increment download count
    await db
      .update(alumni_resources)
      .set({ downloads: (resource[0].downloads || 0) + 1 })
      .where(eq(alumni_resources.id, resourceId));

    // Track download record
    await db.insert(resource_downloads).values({
      resource_id: resourceId,
      user_id: userId,
    });

    res.status(200).json({
      message: "Download tracked successfully",
      downloads: (resource[0].downloads || 0) + 1,
    });
  } catch (error) {
    logger.error("Error tracking download", error);
    res.status(500).json({
      error: "Failed to track download",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Rate a resource
 */
export const rateResource = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const resourceId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);
    const { rating, review } = req.body;

    if (isNaN(resourceId)) {
      res.status(400).json({ error: "Invalid resource ID" });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }

    // Check if resource exists
    const resource = await db
      .select({
        id: alumni_resources.id,
        ratingSum: alumni_resources.rating_sum,
        ratingCount: alumni_resources.rating_count,
      })
      .from(alumni_resources)
      .where(eq(alumni_resources.id, resourceId))
      .limit(1);

    if (resource.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    // Check if user has already rated
    const existingRating = await db
      .select({ id: resource_ratings.id, rating: resource_ratings.rating })
      .from(resource_ratings)
      .where(
        and(
          eq(resource_ratings.resource_id, resourceId),
          eq(resource_ratings.user_id, userId),
        ),
      )
      .limit(1);

    let newRatingSum = resource[0].ratingSum || 0;
    let newRatingCount = resource[0].ratingCount || 0;

    if (existingRating.length > 0) {
      // Update existing rating
      const oldRating = existingRating[0].rating;
      newRatingSum = newRatingSum - oldRating + rating;

      await db
        .update(resource_ratings)
        .set({ rating, review: review || null })
        .where(eq(resource_ratings.id, existingRating[0].id));
    } else {
      // Create new rating
      newRatingSum += rating;
      newRatingCount += 1;

      await db.insert(resource_ratings).values({
        resource_id: resourceId,
        user_id: userId,
        rating,
        review: review || null,
      });
    }

    // Update resource rating aggregates
    await db
      .update(alumni_resources)
      .set({
        rating_sum: newRatingSum,
        rating_count: newRatingCount,
      })
      .where(eq(alumni_resources.id, resourceId));

    const avgRating =
      newRatingCount > 0 ? (newRatingSum / newRatingCount).toFixed(1) : "0.0";

    res.status(200).json({
      message: existingRating.length > 0 ? "Rating updated" : "Rating added",
      rating: avgRating,
      ratingCount: newRatingCount,
    });
  } catch (error) {
    logger.error("Error rating resource", error);
    res.status(500).json({
      error: "Failed to rate resource",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Feature/unfeature a resource (admin only - would need role check)
 */
export const toggleFeatured = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // TODO: Add admin role check here

    const resourceId = parseInt(req.params.id, 10);

    if (isNaN(resourceId)) {
      res.status(400).json({ error: "Invalid resource ID" });
      return;
    }

    const resource = await db
      .select({
        id: alumni_resources.id,
        isFeatured: alumni_resources.is_featured,
      })
      .from(alumni_resources)
      .where(eq(alumni_resources.id, resourceId))
      .limit(1);

    if (resource.length === 0) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    const newFeaturedStatus = !resource[0].isFeatured;

    await db
      .update(alumni_resources)
      .set({ is_featured: newFeaturedStatus })
      .where(eq(alumni_resources.id, resourceId));

    res.status(200).json({
      message: `Resource ${newFeaturedStatus ? "featured" : "unfeatured"} successfully`,
      isFeatured: newFeaturedStatus,
    });
  } catch (error) {
    logger.error("Error toggling featured status", error);
    res.status(500).json({
      error: "Failed to toggle featured status",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
