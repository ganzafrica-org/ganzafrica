import { eq, and, or, sql, desc, asc, like, ilike, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { news, news_tags, news_to_tags } from "../db/schema/news";
import { AppError } from "../middlewares";
import { Logger } from "../config";
import { SQL } from "drizzle-orm/sql";
import { PgColumn } from "drizzle-orm/pg-core";

const logger = new Logger("NewsService");

/**
 * Create a new news item
 */
export const createNews = async (newsData: any) => {
  try {
    let result: { id: number } | undefined;

    await db.transaction(async (tx) => {
      // Insert news
      const insertedNews = await tx
        .insert(news)
        .values({
          title: newsData.title,
          content: newsData.content,
          status: newsData.status,
          publish_date: newsData.publish_date,
          category: newsData.category,
          key_lessons: newsData.key_lessons,
          media: newsData.media,
        })
        .returning();

      if (!insertedNews || insertedNews.length === 0) {
        throw new AppError("Failed to create news item", 500);
      }

      const createdNews = insertedNews[0];

      // Add tags if provided
      if (newsData.tags && Array.isArray(newsData.tags) && newsData.tags.length > 0) {
        const tagRelations = newsData.tags.map((tagId: number) => ({
          news_id: createdNews.id,
          tag_id: tagId,
        }));

        await tx.insert(news_to_tags).values(tagRelations);
      }

      result = createdNews;
    });

    // Get full news item with tags after transaction
    if (result && result.id !== undefined) {
      return await getNewsById(result.id);
    }

    throw new AppError("Failed to create news item", 500);
  } catch (error) {
    logger.error("Error creating news", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to create news item", 500);
  }
};

/**
 * List news items with filtering options
 */
export const listNews = async (filter: any = {}) => {
  try {
    const {
      category,
      status,
      search,
      tags,
      limit = 20,
      offset = 0,
      sortBy = "created_at",
      sortDir = "desc",
    } = filter;

    // Build WHERE conditions
    const whereConditions = [];

    if (category) {
      whereConditions.push(eq(news.category, category));
    }

    if (status) {
      whereConditions.push(eq(news.status, status));
    }

    if (search) {
      whereConditions.push(
        or(ilike(news.title, `%${search}%`), ilike(news.content, `%${search}%`)),
      );
    }

    // Build the query parts separately
    const baseSelection = {
      id: news.id,
      title: news.title,
      content: news.content,
      status: news.status,
      publish_date: news.publish_date,
      category: news.category,
      key_lessons: news.key_lessons,
      media: news.media,
      created_at: news.created_at,
      updated_at: news.updated_at,
    };

    // Determine tag filtering if needed
    let newsIdsForTagFilter: number[] = [];
    let useTagFilter = false;

    if (tags && Array.isArray(tags) && tags.length > 0) {
      // Get news IDs that have all the specified tags
      const newsWithTags = await db
        .select({ news_id: news_to_tags.news_id })
        .from(news_to_tags)
        .where(inArray(news_to_tags.tag_id, tags))
        .groupBy(news_to_tags.news_id)
        .having(sql`count(${news_to_tags.tag_id}) = ${tags.length}`);

      newsIdsForTagFilter = newsWithTags.map((item) => item.news_id);
      useTagFilter = true;

      if (newsIdsForTagFilter.length === 0) {
        return { news: [], total: 0 }; // No news items match the tag filter
      }
    }

    // Build the WHERE condition combining all filters
    const allConditions = [...whereConditions];
    if (useTagFilter) {
      allConditions.push(inArray(news.id, newsIdsForTagFilter));
    }

    // Count total matching records
    const countQuery = db.select({ count: sql<number>`count(*)` }).from(news);
    if (allConditions.length > 0) {
      countQuery.where(and(...allConditions));
    }
    const countResult = await countQuery;
    const total = countResult[0]?.count || 0;

    // Determine the sort column and direction
    let sortColumnToUse = news.created_at;
    let sortFunction = desc;

    if (sortBy && sortBy in news) {
      sortColumnToUse = news[sortBy as keyof typeof news] as PgColumn<any>;
      sortFunction = sortDir === "asc" ? asc : desc;
    }

    // Execute the final query with all conditions in one go
    const result = await db
      .select(baseSelection)
      .from(news)
      .where(allConditions.length > 0 ? and(...allConditions) : undefined)
      .orderBy(sortFunction(sortColumnToUse))
      .limit(limit)
      .offset(offset);

    // Get tags for each news item
    const newsWithTags = await Promise.all(
      result.map(async (newsItem) => {
        const tags = await db
          .select({
            id: news_tags.id,
            name: news_tags.name,
          })
          .from(news_tags)
          .innerJoin(news_to_tags, eq(news_tags.id, news_to_tags.tag_id))
          .where(eq(news_to_tags.news_id, newsItem.id));

        return {
          ...newsItem,
          tags,
        };
      }),
    );

    return {
      news: newsWithTags,
      total,
    };
  } catch (error) {
    logger.error("Error listing news", error);
    throw new AppError("Failed to list news items", 500);
  }
};

/**
 * Get a news item by ID
 */
export const getNewsById = async (id: number) => {
  try {
    const result = await db.select().from(news).where(eq(news.id, id)).limit(1);

    if (result.length === 0) {
      throw new AppError("News item not found", 404);
    }

    const newsItem = result[0];

    // Get tags for this news item
    const tags = await db
      .select({
        id: news_tags.id,
        name: news_tags.name,
      })
      .from(news_tags)
      .innerJoin(news_to_tags, eq(news_tags.id, news_to_tags.tag_id))
      .where(eq(news_to_tags.news_id, id));

    return {
      ...newsItem,
      tags,
    };
  } catch (error) {
    logger.error(`Error getting news by id: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to get news item", 500);
  }
};

/**
 * Update a news item
 */
export const updateNews = async (id: number, newsData: any) => {
  try {
    let result;

    await db.transaction(async (tx) => {
      // Update news
      const updatedNews = await tx
        .update(news)
        .set({
          ...(newsData.title && { title: newsData.title }),
          ...(newsData.content && { content: newsData.content }),
          ...(newsData.status && { status: newsData.status }),
          ...(typeof newsData.publish_date !== "undefined" && {
            publish_date: newsData.publish_date,
          }),
          ...(newsData.category && { category: newsData.category }),
          ...(typeof newsData.key_lessons !== "undefined" && {
            key_lessons: newsData.key_lessons,
          }),
          ...(typeof newsData.media !== "undefined" && { media: newsData.media }),
        })
        .where(eq(news.id, id))
        .returning();

      if (!updatedNews || updatedNews.length === 0) {
        throw new AppError("News item not found", 404);
      }

      // Update tags if provided
      if (Array.isArray(newsData.tags)) {
        // Delete existing tag relations
        await tx.delete(news_to_tags).where(eq(news_to_tags.news_id, id));

        // Add new tag relations
        if (newsData.tags.length > 0) {
          const tagRelations = newsData.tags.map((tagId: number) => ({
            news_id: id,
            tag_id: tagId,
          }));

          await tx.insert(news_to_tags).values(tagRelations);
        }
      }

      result = updatedNews[0];
    });

    // Get full news item with tags after transaction
    return await getNewsById(id);
  } catch (error) {
    logger.error(`Error updating news: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to update news item", 500);
  }
};

/**
 * Delete a news item
 */
export const deleteNews = async (id: number) => {
  try {
    const result = await db.delete(news).where(eq(news.id, id)).returning();

    if (result.length === 0) {
      throw new AppError("News item not found", 404);
    }

    return true;
  } catch (error) {
    logger.error(`Error deleting news: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete news item", 500);
  }
};

/**
 * List all tags
 */
export const listTags = async () => {
  try {
    return await db.select().from(news_tags).orderBy(asc(news_tags.name));
  } catch (error) {
    logger.error("Error listing tags", error);
    throw new AppError("Failed to list tags", 500);
  }
};

/**
 * Create a new tag
 */
export const createTag = async (name: string) => {
  try {
    const result = await db.insert(news_tags).values({ name }).returning();

    if (!result || result.length === 0) {
      throw new AppError("Failed to create tag", 500);
    }

    return result[0];
  } catch (error) {
    logger.error("Error creating tag", error);
    // Check for unique constraint violation
    if ((error as any)?.code === "23505") {
      throw new AppError(`Tag with name "${name}" already exists`, 400);
    }
    throw new AppError("Failed to create tag", 500);
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (id: number) => {
  try {
    const result = await db.delete(news_tags).where(eq(news_tags.id, id)).returning();

    if (result.length === 0) {
      throw new AppError("Tag not found", 404);
    }

    return true;
  } catch (error) {
    logger.error(`Error deleting tag: ${id}`, error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to delete tag", 500);
  }
};

// Create a service object to export
export const newsService = {
  createNews,
  listNews,
  getNewsById,
  updateNews,
  deleteNews,
  listTags,
  createTag,
  deleteTag,
};

// Default export for the service object
export default newsService;
